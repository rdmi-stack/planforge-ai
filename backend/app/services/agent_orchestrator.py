"""Multi-agent dispatch, validation, and retry orchestration service."""

from datetime import UTC, datetime
from uuid import UUID

import structlog

from app.models.agent_run import AgentRun
from app.models.task import Task

logger = structlog.get_logger()

MAX_RETRIES = 3


class AgentOrchestrator:
    """Manages the lifecycle of AI coding agent dispatches."""

    async def dispatch_task(
        self,
        task_id: UUID,
        agent_type: str | None = None,
    ) -> AgentRun:
        """Dispatch a task to a coding agent and create an AgentRun record."""
        task = await Task.find_one(Task.id == task_id)
        if not task:
            raise ValueError(f"Task {task_id} not found")

        if task.status not in ("todo", "failed"):
            raise ValueError(f"Task {task_id} is in '{task.status}' state, cannot dispatch")

        selected_agent = agent_type or task.agent_type or "claude_code"

        # Create agent run record
        agent_run = AgentRun(
            task_id=task_id,
            agent_type=selected_agent,
            status="queued",
            started_at=None,
            completed_at=None,
            output_log=None,
            validation_result=None,
            retry_count=0,
        )
        await agent_run.insert()

        # Update task status
        task.status = "dispatched"
        task.agent_run_id = agent_run.id
        await task.save()

        logger.info(
            "task_dispatched",
            task_id=str(task_id),
            agent_type=selected_agent,
            agent_run_id=str(agent_run.id),
        )
        return agent_run

    async def dispatch_batch(
        self,
        task_ids: list[UUID],
        agent_type: str | None = None,
    ) -> list[AgentRun]:
        """Dispatch multiple tasks to coding agents."""
        runs: list[AgentRun] = []
        for task_id in task_ids:
            try:
                run = await self.dispatch_task(task_id, agent_type)
                runs.append(run)
            except ValueError as e:
                logger.warning("batch_dispatch_skip", task_id=str(task_id), reason=str(e))
        return runs

    async def update_run_status(
        self,
        agent_run_id: UUID,
        status: str,
        output_log: str | None = None,
        validation_result: dict | None = None,
    ) -> AgentRun:
        """Update the status of an agent run."""
        agent_run = await AgentRun.find_one(AgentRun.id == agent_run_id)
        if not agent_run:
            raise ValueError(f"AgentRun {agent_run_id} not found")

        agent_run.status = status
        if output_log:
            agent_run.output_log = output_log
        if validation_result:
            agent_run.validation_result = validation_result

        if status == "running" and not agent_run.started_at:
            agent_run.started_at = datetime.now(UTC)
        elif status in ("completed", "failed"):
            agent_run.completed_at = datetime.now(UTC)

        await agent_run.save()

        # Update associated task status
        task = await Task.find_one(Task.id == agent_run.task_id)
        if task:
            if status == "completed":
                task.status = "done"
            elif status == "failed":
                task.status = "failed"
            elif status == "running":
                task.status = "in_progress"
            await task.save()

        logger.info(
            "agent_run_status_updated",
            agent_run_id=str(agent_run_id),
            status=status,
        )
        return agent_run

    async def retry_failed_run(self, agent_run_id: UUID) -> AgentRun:
        """Retry a failed agent run if within the retry limit."""
        agent_run = await AgentRun.find_one(AgentRun.id == agent_run_id)
        if not agent_run:
            raise ValueError(f"AgentRun {agent_run_id} not found")

        if agent_run.status != "failed":
            raise ValueError(f"AgentRun {agent_run_id} is not in failed state")

        if agent_run.retry_count >= MAX_RETRIES:
            raise ValueError(f"AgentRun {agent_run_id} has exceeded maximum retries ({MAX_RETRIES})")

        # Create a new run with incremented retry count
        new_run = AgentRun(
            task_id=agent_run.task_id,
            agent_type=agent_run.agent_type,
            status="queued",
            retry_count=agent_run.retry_count + 1,
        )
        await new_run.insert()

        # Update task reference
        task = await Task.find_one(Task.id == agent_run.task_id)
        if task:
            task.status = "dispatched"
            task.agent_run_id = new_run.id
            await task.save()

        logger.info(
            "agent_run_retried",
            original_run_id=str(agent_run_id),
            new_run_id=str(new_run.id),
            retry_count=new_run.retry_count,
        )
        return new_run

    async def get_run_status(self, agent_run_id: UUID) -> AgentRun:
        """Get current status of an agent run."""
        agent_run = await AgentRun.find_one(AgentRun.id == agent_run_id)
        if not agent_run:
            raise ValueError(f"AgentRun {agent_run_id} not found")
        return agent_run

    async def get_project_runs(
        self,
        project_id: UUID,
        status_filter: str | None = None,
    ) -> list[AgentRun]:
        """Get all agent runs for tasks in a project."""
        # Get all task IDs for the project
        tasks = await Task.find(Task.project_id == project_id).to_list()
        task_ids = [t.id for t in tasks]

        if not task_ids:
            return []

        query = AgentRun.find(AgentRun.task_id.is_in(task_ids))  # type: ignore[attr-defined]
        if status_filter:
            query = AgentRun.find(
                AgentRun.task_id.is_in(task_ids),  # type: ignore[attr-defined]
                AgentRun.status == status_filter,
            )

        return await query.sort(-AgentRun.created_at).to_list()
