"""Celery tasks for long-running AI generation operations."""

import asyncio
from uuid import UUID

import structlog

from app.workers.celery_app import celery_app

logger = structlog.get_logger()


def _run_async(coro):
    """Helper to run async code in a sync Celery task context."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


async def _get_db_session():
    """Create an async database session for use in Celery tasks."""
    from app.database import async_session_factory
    async with async_session_factory() as session:
        yield session


@celery_app.task(bind=True, name="ai.generate_full_plan", max_retries=2)
def generate_full_plan(self, project_id: str, conversation_summary: str) -> dict:
    """Generate a complete project plan: spec -> features -> tasks.

    This is dispatched as a background task because full plan generation
    can take 30-60 seconds across multiple AI calls.
    """
    logger.info("celery_full_plan_start", project_id=project_id, task_id=self.request.id)

    async def _run():
        from app.database import async_session_factory
        from app.services.ai_planner import AIPlannerService

        async with async_session_factory() as db:
            planner = AIPlannerService(db)
            return await planner.generate_full_plan(
                project_id=UUID(project_id),
                conversation_summary=conversation_summary,
            )

    try:
        result = _run_async(_run())
        logger.info("celery_full_plan_complete", project_id=project_id, result=result)
        return result
    except Exception as exc:
        logger.error("celery_full_plan_failed", project_id=project_id, error=str(exc))
        raise self.retry(exc=exc, countdown=30)


@celery_app.task(bind=True, name="ai.generate_spec", max_retries=2)
def generate_spec(
    self,
    project_id: str,
    conversation_summary: str,
    target_users: str | None = None,
) -> dict:
    """Generate a product specification from a conversation summary."""
    logger.info("celery_spec_generation_start", project_id=project_id)

    async def _run():
        from app.database import async_session_factory
        from app.services.spec_generator import SpecGenerator

        async with async_session_factory() as db:
            generator = SpecGenerator(db)
            spec = await generator.generate_spec(
                project_id=UUID(project_id),
                conversation_summary=conversation_summary,
                target_users=target_users,
            )
            return {"spec_id": str(spec.id), "title": spec.title, "version": spec.version}

    try:
        result = _run_async(_run())
        logger.info("celery_spec_generation_complete", project_id=project_id, result=result)
        return result
    except Exception as exc:
        logger.error("celery_spec_generation_failed", project_id=project_id, error=str(exc))
        raise self.retry(exc=exc, countdown=30)


@celery_app.task(bind=True, name="ai.decompose_features", max_retries=2)
def decompose_features(self, project_id: str, spec_id: str) -> dict:
    """Decompose a specification into features."""
    logger.info("celery_feature_decomposition_start", project_id=project_id, spec_id=spec_id)

    async def _run():
        from app.database import async_session_factory
        from app.services.feature_decomposer import FeatureDecomposer

        async with async_session_factory() as db:
            decomposer = FeatureDecomposer(db)
            features = await decomposer.decompose_spec(
                project_id=UUID(project_id),
                spec_id=UUID(spec_id),
            )
            return {"feature_count": len(features), "feature_ids": [str(f.id) for f in features]}

    try:
        result = _run_async(_run())
        logger.info("celery_feature_decomposition_complete", result=result)
        return result
    except Exception as exc:
        logger.error("celery_feature_decomposition_failed", error=str(exc))
        raise self.retry(exc=exc, countdown=30)


@celery_app.task(bind=True, name="ai.generate_tasks", max_retries=2)
def generate_tasks_for_feature(self, project_id: str, feature_id: str) -> dict:
    """Generate implementation tasks for a single feature."""
    logger.info("celery_task_generation_start", project_id=project_id, feature_id=feature_id)

    async def _run():
        from app.database import async_session_factory
        from app.services.task_generator import TaskGenerator

        async with async_session_factory() as db:
            generator = TaskGenerator(db)
            tasks = await generator.generate_tasks(
                project_id=UUID(project_id),
                feature_id=UUID(feature_id),
            )
            return {"task_count": len(tasks), "task_ids": [str(t.id) for t in tasks]}

    try:
        result = _run_async(_run())
        logger.info("celery_task_generation_complete", result=result)
        return result
    except Exception as exc:
        logger.error("celery_task_generation_failed", error=str(exc))
        raise self.retry(exc=exc, countdown=30)


@celery_app.task(bind=True, name="ai.run_production_audit", max_retries=1)
def run_production_audit(self, project_id: str) -> dict:
    """Run a production readiness audit on a project."""
    logger.info("celery_production_audit_start", project_id=project_id)

    async def _run():
        from app.database import async_session_factory
        from app.services.production_checker import ProductionChecker

        async with async_session_factory() as db:
            checker = ProductionChecker(db)
            result = await checker.run_audit(project_id=UUID(project_id))
            return result.model_dump()

    try:
        result = _run_async(_run())
        logger.info("celery_production_audit_complete", project_id=project_id)
        return result
    except Exception as exc:
        logger.error("celery_production_audit_failed", error=str(exc))
        raise self.retry(exc=exc, countdown=30)
