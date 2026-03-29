"""Celery tasks for AI coding agent dispatch and monitoring."""

import asyncio
from uuid import UUID

import structlog

from app.workers.celery_app import celery_app

logger = structlog.get_logger()


def _run_async(coro):
    """Run async code in sync Celery task context."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(bind=True, name="agents.dispatch_task", max_retries=2)
def dispatch_task_to_agent(
    self,
    task_id: str,
    agent_type: str | None = None,
) -> dict:
    """Dispatch a single task to a coding agent.

    Creates an AgentRun record and enqueues the task for execution
    by the specified (or default) agent type.
    """
    logger.info("celery_agent_dispatch_start", task_id=task_id, agent_type=agent_type)

    async def _run():
        from app.database import async_session_factory
        from app.services.agent_orchestrator import AgentOrchestrator

        async with async_session_factory() as db:
            orchestrator = AgentOrchestrator(db)
            run = await orchestrator.dispatch_task(
                task_id=UUID(task_id),
                agent_type=agent_type,
            )
            return {
                "agent_run_id": str(run.id),
                "task_id": task_id,
                "agent_type": run.agent_type,
                "status": run.status,
            }

    try:
        result = _run_async(_run())
        logger.info("celery_agent_dispatch_complete", result=result)
        return result
    except Exception as exc:
        logger.error("celery_agent_dispatch_failed", task_id=task_id, error=str(exc))
        raise self.retry(exc=exc, countdown=15)


@celery_app.task(bind=True, name="agents.dispatch_batch", max_retries=1)
def dispatch_batch_to_agents(
    self,
    task_ids: list[str],
    agent_type: str | None = None,
) -> dict:
    """Dispatch multiple tasks to coding agents in sequence."""
    logger.info("celery_batch_dispatch_start", task_count=len(task_ids))

    async def _run():
        from app.database import async_session_factory
        from app.services.agent_orchestrator import AgentOrchestrator

        async with async_session_factory() as db:
            orchestrator = AgentOrchestrator(db)
            runs = await orchestrator.dispatch_batch(
                task_ids=[UUID(tid) for tid in task_ids],
                agent_type=agent_type,
            )
            return {
                "dispatched": len(runs),
                "run_ids": [str(r.id) for r in runs],
            }

    try:
        result = _run_async(_run())
        logger.info("celery_batch_dispatch_complete", result=result)
        return result
    except Exception as exc:
        logger.error("celery_batch_dispatch_failed", error=str(exc))
        raise self.retry(exc=exc, countdown=30)


@celery_app.task(bind=True, name="agents.retry_run", max_retries=1)
def retry_failed_agent_run(self, agent_run_id: str) -> dict:
    """Retry a failed agent run."""
    logger.info("celery_agent_retry_start", agent_run_id=agent_run_id)

    async def _run():
        from app.database import async_session_factory
        from app.services.agent_orchestrator import AgentOrchestrator

        async with async_session_factory() as db:
            orchestrator = AgentOrchestrator(db)
            new_run = await orchestrator.retry_failed_run(UUID(agent_run_id))
            return {
                "new_run_id": str(new_run.id),
                "retry_count": new_run.retry_count,
                "status": new_run.status,
            }

    try:
        result = _run_async(_run())
        logger.info("celery_agent_retry_complete", result=result)
        return result
    except Exception as exc:
        logger.error("celery_agent_retry_failed", error=str(exc))
        raise self.retry(exc=exc, countdown=15)


@celery_app.task(name="agents.monitor_run")
def monitor_agent_run(agent_run_id: str) -> dict:
    """Poll an agent run for completion and update its status.

    Scheduled periodically until the run reaches a terminal state.
    """
    logger.info("celery_agent_monitor", agent_run_id=agent_run_id)

    async def _run():
        from app.database import async_session_factory
        from app.services.agent_orchestrator import AgentOrchestrator

        async with async_session_factory() as db:
            orchestrator = AgentOrchestrator(db)
            run = await orchestrator.get_run_status(UUID(agent_run_id))
            return {"agent_run_id": str(run.id), "status": run.status}

    result = _run_async(_run())

    # If still running, re-schedule monitoring
    if result["status"] in ("queued", "running"):
        monitor_agent_run.apply_async(
            args=[agent_run_id],
            countdown=30,
        )

    return result
