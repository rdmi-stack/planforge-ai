import json

import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.ai.client import AIClient, ModelTier
from app.dependencies import get_current_user
from app.models.agent_run import AgentRun
from app.models.feature import Feature
from app.models.project import Project
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate

logger = structlog.get_logger()
router = APIRouter(prefix="/projects/{project_id}/tasks", tags=["tasks"])


async def _get_user_project(project_id: str, user: User) -> Project:
    project = await Project.find_one(
        Project.id == project_id, Project.owner_id == user.id
    )
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.get("/", response_model=list[TaskResponse])
async def list_tasks(
    project_id: str,
    status_filter: str | None = None,
    user: User = Depends(get_current_user),
) -> list[Task]:
    await _get_user_project(project_id, user)
    query = Task.find(Task.project_id == project_id)
    if status_filter:
        query = Task.find(Task.project_id == project_id, Task.status == status_filter)
    tasks = await query.sort(+Task.sequence_order).to_list()
    return tasks


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    project_id: str,
    data: TaskCreate,
    user: User = Depends(get_current_user),
) -> Task:
    await _get_user_project(project_id, user)

    task = Task(
        project_id=project_id,
        feature_id=data.feature_id,
        title=data.title,
        description=data.description,
        prompt_text=data.prompt_text,
        acceptance_criteria=data.acceptance_criteria,
        sequence_order=data.sequence_order,
        regression_risk=data.regression_risk,
        estimated_minutes=data.estimated_minutes,
        agent_type=data.agent_type,
    )
    await task.insert()
    logger.info("task_created", task_id=str(task.id), project_id=project_id)
    return task


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    project_id: str,
    task_id: str,
    user: User = Depends(get_current_user),
) -> Task:
    await _get_user_project(project_id, user)
    task = await Task.find_one(Task.id == task_id, Task.project_id == project_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    project_id: str,
    task_id: str,
    data: TaskUpdate,
    user: User = Depends(get_current_user),
) -> Task:
    await _get_user_project(project_id, user)
    task = await Task.find_one(Task.id == task_id, Task.project_id == project_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    await task.save()
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    project_id: str,
    task_id: str,
    user: User = Depends(get_current_user),
) -> None:
    await _get_user_project(project_id, user)
    task = await Task.find_one(Task.id == task_id, Task.project_id == project_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    await task.delete()


@router.post("/generate", response_model=list[TaskResponse])
async def generate_tasks(
    project_id: str,
    user: User = Depends(get_current_user),
) -> list[Task]:
    """Use AI to generate tasks from project features."""
    project = await _get_user_project(project_id, user)
    features = await Feature.find(Feature.project_id == project_id).to_list()

    context = f"Project: {project.name}. {project.description or ''}\n\n"
    if features:
        context += "Features:\n" + "\n".join([f"- {f.title}: {f.description}" for f in features])
    else:
        context += "No features yet — generate general setup tasks."

    ai = AIClient()
    prompt = (
        f"Generate 5-10 atomic development tasks for this project. "
        f"Return ONLY a JSON array of objects with: title, description, prompt_text (agent-ready coding prompt), "
        f"acceptance_criteria (array of strings), estimated_minutes (number), regression_risk (low/medium/high), agent_type (claude_code/cursor/codex).\n\n"
        f"{context}\n\nReturn valid JSON array only."
    )

    try:
        result = await ai.generate(
            system_prompt="You are a task generation AI for software projects. Return only valid JSON.",
            user_prompt=prompt,
            model_tier=ModelTier.TASK,
            temperature=0.3,
        )

        result = result.strip()
        if result.startswith("```"):
            result = result.split("\n", 1)[1].rsplit("```", 1)[0]

        tasks_data = json.loads(result)
        created: list[Task] = []

        for i, t_data in enumerate(tasks_data):
            task = Task(
                project_id=project_id,
                feature_id=features[i % len(features)].id if features else "",
                title=t_data.get("title", f"Task {i+1}"),
                description=t_data.get("description", ""),
                prompt_text=t_data.get("prompt_text", ""),
                acceptance_criteria=t_data.get("acceptance_criteria", []),
                estimated_minutes=t_data.get("estimated_minutes"),
                regression_risk=t_data.get("regression_risk", "low"),
                agent_type=t_data.get("agent_type", "claude_code"),
                status="backlog",
                sequence_order=i + 1,
            )
            await task.insert()
            created.append(task)

        logger.info("tasks_generated", project_id=project_id, count=len(created))
        return created

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned invalid JSON. Please try again.")
    except Exception as e:
        logger.error("task_generation_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Task generation failed: {str(e)}")


class DispatchRequest(BaseModel):
    agent_type: str = "claude_code"


@router.post("/{task_id}/dispatch")
async def dispatch_task(
    project_id: str,
    task_id: str,
    data: DispatchRequest,
    user: User = Depends(get_current_user),
) -> dict:
    """Dispatch a task to an AI coding agent."""
    await _get_user_project(project_id, user)
    task = await Task.find_one(Task.id == task_id, Task.project_id == project_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    # Create agent run record
    from datetime import datetime, UTC
    agent_run = AgentRun(
        task_id=task_id,
        agent_type=data.agent_type,
        status="queued",
        started_at=datetime.now(UTC).isoformat(),
        retry_count=0,
    )
    await agent_run.insert()

    # Update task
    task.status = "in_progress"
    task.agent_type = data.agent_type
    task.agent_run_id = str(agent_run.id)
    await task.save()

    logger.info("task_dispatched", task_id=task_id, agent=data.agent_type)
    return {"status": "dispatched", "agent_run_id": str(agent_run.id), "agent_type": data.agent_type}
