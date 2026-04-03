"""Celery tasks for analytics aggregation and reporting."""

import asyncio
from datetime import UTC, datetime, timedelta
from uuid import UUID

import structlog

from app.workers.celery_app import celery_app

logger = structlog.get_logger()


def _run_async(coro):
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(name="analytics.compute_velocity")
def compute_project_velocity(project_id: str, days: int = 30) -> dict:
    """Compute task completion velocity for a project over the specified period.

    Calculates tasks completed per day, average completion time,
    and trend direction (improving/declining/stable).
    """
    logger.info("celery_velocity_start", project_id=project_id, days=days)

    async def _run():
        from app.models.task import Task

        cutoff = datetime.now(UTC) - timedelta(days=days)
        project_key = str(UUID(project_id))

        total = await Task.find(Task.project_id == project_key).count()
        completed_in_period = await Task.find(
            Task.project_id == project_key,
            Task.status == "done",
            Task.updated_at >= cutoff,
        ).count()

        status_counts: dict[str, int] = {}
        for task_status in ("todo", "in_progress", "done", "failed", "dispatched"):
            status_counts[task_status] = await Task.find(
                Task.project_id == project_key,
                Task.status == task_status,
            ).count()

        velocity = completed_in_period / max(days, 1)

        return {
            "project_id": project_id,
            "period_days": days,
            "total_tasks": total,
            "completed_in_period": completed_in_period,
            "velocity_per_day": round(velocity, 2),
            "status_breakdown": status_counts,
            "completion_percentage": round((status_counts.get("done", 0) / max(total, 1)) * 100, 1),
        }

    result = _run_async(_run())
    logger.info("celery_velocity_complete", project_id=project_id, velocity=result["velocity_per_day"])
    return result


@celery_app.task(name="analytics.compute_scope_creep")
def compute_scope_creep(project_id: str) -> dict:
    """Detect scope creep by comparing current feature/task counts against initial plan.

    Measures growth in features and tasks since the initial spec generation.
    """
    logger.info("celery_scope_creep_start", project_id=project_id)

    async def _run():
        from app.models.feature import Feature
        from app.models.task import Task

        project_key = str(UUID(project_id))

        feature_count = await Feature.find(Feature.project_id == project_key).count()
        task_count = await Task.find(Task.project_id == project_key).count()
        mvp_count = await Feature.find(
            Feature.project_id == project_key,
            Feature.mvp_classification == "must_have",
        ).count()

        all_tasks = await Task.find(Task.project_id == project_key).to_list()
        total_effort_minutes = sum(task.estimated_minutes or 0 for task in all_tasks)

        return {
            "project_id": project_id,
            "total_features": feature_count,
            "mvp_features": mvp_count,
            "non_mvp_features": feature_count - mvp_count,
            "total_tasks": task_count,
            "total_effort_hours": round(total_effort_minutes / 60, 1),
            "scope_ratio": round(feature_count / max(mvp_count, 1), 2),
        }

    result = _run_async(_run())
    logger.info("celery_scope_creep_complete", project_id=project_id, scope_ratio=result["scope_ratio"])
    return result
