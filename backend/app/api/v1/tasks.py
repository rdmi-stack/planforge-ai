import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user, get_db
from app.models.project import Project
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate

logger = structlog.get_logger()
router = APIRouter(prefix="/projects/{project_id}/tasks", tags=["tasks"])


async def _get_user_project(project_id: str, user: User, db: AsyncSession) -> Project:
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.owner_id == user.id)
    )
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.get("/", response_model=list[TaskResponse])
async def list_tasks(
    project_id: str,
    status_filter: str | None = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Task]:
    await _get_user_project(project_id, user, db)
    query = select(Task).where(Task.project_id == project_id)
    if status_filter:
        query = query.where(Task.status == status_filter)
    result = await db.execute(query.order_by(Task.sequence_order))
    return list(result.scalars().all())


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    project_id: str,
    data: TaskCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Task:
    await _get_user_project(project_id, user, db)

    task = Task(
        project_id=project_id,
        feature_id=data.feature_id,
        title=data.title,
        description=data.description,
        prompt_text=data.prompt_text,
        acceptance_criteria_json=data.acceptance_criteria_json,
        sequence_order=data.sequence_order,
        regression_risk=data.regression_risk,
        estimated_minutes=data.estimated_minutes,
        agent_type=data.agent_type,
    )
    db.add(task)
    await db.flush()
    await db.refresh(task)
    logger.info("task_created", task_id=str(task.id), project_id=project_id)
    return task


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    project_id: str,
    task_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Task:
    await _get_user_project(project_id, user, db)
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.project_id == project_id)
    )
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    project_id: str,
    task_id: str,
    data: TaskUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Task:
    await _get_user_project(project_id, user, db)
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.project_id == project_id)
    )
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    await db.flush()
    await db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    project_id: str,
    task_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await _get_user_project(project_id, user, db)
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.project_id == project_id)
    )
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    await db.delete(task)
