from datetime import datetime, timezone

import structlog
from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_current_user
from app.models.agent_run import AgentRun
from app.models.project import Project
from app.models.task import Task
from app.models.user import User
from app.schemas.agent import AgentDispatch, AgentRunResponse

logger = structlog.get_logger()
router = APIRouter(tags=["agents"])

# --- Project-level agent-runs listing ---


@router.get("/projects/{project_id}/agent-runs")
async def list_agent_runs(
    project_id: str,
    user: User = Depends(get_current_user),
) -> list[dict]:
    """List all agent runs for tasks in this project."""
    project = await Project.find_one(
        Project.id == project_id, Project.owner_id == user.id
    )
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    tasks = await Task.find(Task.project_id == project_id).to_list()
    task_ids_with_runs = [t.id for t in tasks if t.agent_run_id]
    if not task_ids_with_runs:
        return []

    agent_runs = await AgentRun.find(
        {"task_id": {"$in": task_ids_with_runs}}
    ).to_list()

    task_map = {t.id: t.title for t in tasks}
    result = []
    for run in agent_runs:
        result.append({
            "run": run.dict(),
            "task_title": task_map.get(run.task_id, "Unknown Task"),
        })
    return result


# --- Per-task agent endpoints (nested under task) ---

_task_router = APIRouter(prefix="/projects/{project_id}/tasks/{task_id}", tags=["agents"])


async def _get_user_task(
    project_id: str, task_id: str, user: User
) -> Task:
    # Verify project ownership
    project = await Project.find_one(
        Project.id == project_id, Project.owner_id == user.id
    )
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    task = await Task.find_one(Task.id == task_id, Task.project_id == project_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@_task_router.post("/dispatch", response_model=AgentRunResponse, status_code=status.HTTP_201_CREATED)
async def dispatch_to_agent(
    project_id: str,
    task_id: str,
    data: AgentDispatch,
    user: User = Depends(get_current_user),
) -> AgentRun:
    task = await _get_user_task(project_id, task_id, user)

    agent_run = AgentRun(
        task_id=task.id,
        agent_type=data.agent_type,
        status="pending",
        started_at=datetime.now(timezone.utc),
    )
    await agent_run.insert()

    task.agent_run_id = agent_run.id
    task.agent_type = data.agent_type
    task.status = "dispatched"
    await task.save()

    logger.info(
        "agent_dispatched",
        agent_run_id=str(agent_run.id),
        task_id=task_id,
        agent_type=data.agent_type,
    )
    return agent_run


@_task_router.get("/agent-status", response_model=AgentRunResponse)
async def get_agent_status(
    project_id: str,
    task_id: str,
    user: User = Depends(get_current_user),
) -> AgentRun:
    task = await _get_user_task(project_id, task_id, user)

    if task.agent_run_id is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No agent run associated with this task",
        )

    agent_run = await AgentRun.find_one(AgentRun.id == task.agent_run_id)
    if agent_run is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent run not found")
    return agent_run


router.include_router(_task_router)
