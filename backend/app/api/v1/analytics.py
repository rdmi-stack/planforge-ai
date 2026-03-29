"""Analytics endpoints: velocity tracking and scope creep detection."""

from uuid import UUID

import structlog
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user, get_db
from app.models.feature import Feature
from app.models.project import Project
from app.models.task import Task
from app.models.user import User

logger = structlog.get_logger()

router = APIRouter(prefix="/analytics", tags=["analytics"])


async def _verify_project_access(
    project_id: str,
    user: User,
    db: AsyncSession,
) -> Project:
    """Verify the user has access to the project."""
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.owner_id == user.id)
    )
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.get("/velocity")
async def get_velocity(
    project_id: str = Query(..., description="Project ID to analyze"),
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Get task completion velocity metrics for a project.

    Returns tasks completed per day, status breakdown, and completion
    percentage over the specified time period.
    """
    await _verify_project_access(project_id, user, db)
    pid = UUID(project_id)

    # Total tasks
    total_result = await db.execute(
        select(func.count()).select_from(Task).where(Task.project_id == pid)
    )
    total = total_result.scalar_one()

    # Tasks by status
    status_counts: dict[str, int] = {}
    for task_status in ("todo", "in_progress", "done", "failed", "dispatched"):
        count_result = await db.execute(
            select(func.count())
            .select_from(Task)
            .where(Task.project_id == pid, Task.status == task_status)
        )
        status_counts[task_status] = count_result.scalar_one()

    done_count = status_counts.get("done", 0)
    velocity = round(done_count / max(days, 1), 2)
    completion_pct = round((done_count / max(total, 1)) * 100, 1)

    # Estimated remaining effort
    remaining_result = await db.execute(
        select(func.sum(Task.estimated_minutes))
        .where(Task.project_id == pid, Task.status.in_(["todo", "in_progress"]))
    )
    remaining_minutes = remaining_result.scalar_one() or 0

    return {
        "data": {
            "project_id": project_id,
            "period_days": days,
            "total_tasks": total,
            "completed": done_count,
            "velocity_per_day": velocity,
            "completion_percentage": completion_pct,
            "status_breakdown": status_counts,
            "remaining_effort_hours": round(remaining_minutes / 60, 1),
        }
    }


@router.get("/scope-creep")
async def get_scope_creep(
    project_id: str = Query(..., description="Project ID to analyze"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Detect scope creep by analyzing feature and task growth.

    Compares MVP features against total features, calculates scope
    expansion ratio, and estimates total effort.
    """
    await _verify_project_access(project_id, user, db)
    pid = UUID(project_id)

    # Feature counts
    feature_total_result = await db.execute(
        select(func.count()).select_from(Feature).where(Feature.project_id == pid)
    )
    feature_total = feature_total_result.scalar_one()

    mvp_result = await db.execute(
        select(func.count())
        .select_from(Feature)
        .where(Feature.project_id == pid, Feature.mvp_classification == "must_have")
    )
    mvp_count = mvp_result.scalar_one()

    # Task counts
    task_total_result = await db.execute(
        select(func.count()).select_from(Task).where(Task.project_id == pid)
    )
    task_total = task_total_result.scalar_one()

    # Effort
    effort_result = await db.execute(
        select(func.sum(Task.estimated_minutes)).where(Task.project_id == pid)
    )
    total_effort_minutes = effort_result.scalar_one() or 0

    scope_ratio = round(feature_total / max(mvp_count, 1), 2)

    return {
        "data": {
            "project_id": project_id,
            "total_features": feature_total,
            "mvp_features": mvp_count,
            "non_mvp_features": feature_total - mvp_count,
            "total_tasks": task_total,
            "total_effort_hours": round(total_effort_minutes / 60, 1),
            "scope_ratio": scope_ratio,
            "scope_status": "healthy" if scope_ratio < 2.0 else "warning" if scope_ratio < 3.0 else "critical",
        }
    }
