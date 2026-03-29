"""Analytics endpoints: velocity tracking and scope creep detection."""

from uuid import UUID

import structlog
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies import get_current_user
from app.models.feature import Feature
from app.models.project import Project
from app.models.task import Task
from app.models.user import User

logger = structlog.get_logger()

router = APIRouter(prefix="/analytics", tags=["analytics"])


async def _verify_project_access(
    project_id: str,
    user: User,
) -> Project:
    """Verify the user has access to the project."""
    project = await Project.find_one(
        Project.id == project_id, Project.owner_id == user.id
    )
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.get("/velocity")
async def get_velocity(
    project_id: str = Query(..., description="Project ID to analyze"),
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    user: User = Depends(get_current_user),
) -> dict:
    """Get task completion velocity metrics for a project."""
    await _verify_project_access(project_id, user)
    pid = UUID(project_id)

    # Total tasks
    total = await Task.find(Task.project_id == pid).count()

    # Tasks by status
    status_counts: dict[str, int] = {}
    for task_status in ("todo", "in_progress", "done", "failed", "dispatched"):
        count = await Task.find(
            Task.project_id == pid, Task.status == task_status
        ).count()
        status_counts[task_status] = count

    done_count = status_counts.get("done", 0)
    velocity = round(done_count / max(days, 1), 2)
    completion_pct = round((done_count / max(total, 1)) * 100, 1)

    # Estimated remaining effort
    remaining_tasks = await Task.find(
        Task.project_id == pid,
        Task.status.is_in(["todo", "in_progress"]),  # type: ignore[attr-defined]
    ).to_list()
    remaining_minutes = sum(t.estimated_minutes or 0 for t in remaining_tasks)

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
) -> dict:
    """Detect scope creep by analyzing feature and task growth."""
    await _verify_project_access(project_id, user)
    pid = UUID(project_id)

    # Feature counts
    feature_total = await Feature.find(Feature.project_id == pid).count()
    mvp_count = await Feature.find(
        Feature.project_id == pid, Feature.mvp_classification == "must_have"
    ).count()

    # Task counts
    task_total = await Task.find(Task.project_id == pid).count()

    # Effort
    all_tasks = await Task.find(Task.project_id == pid).to_list()
    total_effort_minutes = sum(t.estimated_minutes or 0 for t in all_tasks)

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
