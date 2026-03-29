"""Task generation service: creates atomic, agent-ready tasks from features."""

from pathlib import Path
from uuid import UUID

import structlog
from jinja2 import Environment, FileSystemLoader
from pydantic import BaseModel, Field

from app.ai.client import ModelTier
from app.ai.structured_output import StructuredAIClient
from app.models.feature import Feature
from app.models.project import Project
from app.models.task import Task

logger = structlog.get_logger()

PROMPTS_DIR = Path(__file__).parent.parent / "ai" / "prompts"


class GeneratedTask(BaseModel):
    """Pydantic model for AI-generated task output."""

    title: str
    description: str
    prompt_text: str = Field(description="Full prompt for a coding agent")
    acceptance_criteria: list[str]
    estimated_minutes: int = Field(ge=15, le=120)
    regression_risk: str = Field(description="low, medium, or high")
    agent_type: str = Field(description="claude_code, cursor, codex, or any")


class TaskList(BaseModel):
    """Container for generated tasks."""

    tasks: list[GeneratedTask]


class TaskGenerator:
    """Generates atomic, agent-ready development tasks from features."""

    def __init__(self) -> None:
        self.structured_client = StructuredAIClient()
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(PROMPTS_DIR)),
            autoescape=False,
        )

    async def generate_tasks(
        self,
        project_id: UUID,
        feature_id: UUID,
        codebase_context: str | None = None,
    ) -> list[Task]:
        """Generate implementation tasks for a feature and persist them."""
        project = await self._get_project(project_id)
        feature = await self._get_feature(feature_id)

        template = self.jinja_env.get_template("task_prompt.j2")
        prompt = template.render(
            project_name=project.name,
            tech_stack=project.tech_stack_json or "Not specified",
            feature_title=feature.title,
            feature_description=feature.description,
            user_stories=[],
            acceptance_criteria=[],
            codebase_context=codebase_context,
        )

        system_prompt = (
            "You are PlanForge AI. Generate atomic, agent-ready development tasks. "
            "Each task should be completable in a single AI coding agent session."
        )

        logger.info(
            "task_generation_start",
            project_id=str(project_id),
            feature_id=str(feature_id),
        )

        result = await self.structured_client.generate(
            response_model=TaskList,
            system_prompt=system_prompt,
            user_prompt=prompt,
            model_tier=ModelTier.TASK,
            temperature=0.3,
            max_tokens=8192,
        )

        # Determine starting sequence order
        last_tasks = (
            await Task.find(Task.project_id == project_id)
            .sort(-Task.sequence_order)
            .limit(1)
            .to_list()
        )
        start_order = (last_tasks[0].sequence_order + 1) if last_tasks else 0

        # Persist tasks
        created_tasks: list[Task] = []
        for i, gt in enumerate(result.tasks):
            task = Task(
                feature_id=feature_id,
                project_id=project_id,
                title=gt.title,
                description=gt.description,
                prompt_text=gt.prompt_text,
                acceptance_criteria_json=gt.acceptance_criteria,
                status="todo",
                sequence_order=start_order + i,
                regression_risk=gt.regression_risk,
                estimated_minutes=gt.estimated_minutes,
                agent_type=gt.agent_type,
            )
            await task.insert()
            created_tasks.append(task)

        logger.info(
            "task_generation_complete",
            project_id=str(project_id),
            feature_id=str(feature_id),
            task_count=len(created_tasks),
        )
        return created_tasks

    async def regenerate_prompt(
        self,
        task_id: UUID,
        additional_context: str | None = None,
    ) -> str:
        """Regenerate the coding agent prompt for an existing task with optional new context."""
        task = await Task.find_one(Task.id == task_id)
        if not task:
            raise ValueError(f"Task {task_id} not found")

        prompt = (
            f"Regenerate a coding agent prompt for this task:\n"
            f"Title: {task.title}\n"
            f"Description: {task.description}\n"
            f"Acceptance Criteria: {task.acceptance_criteria_json}\n"
        )
        if additional_context:
            prompt += f"\nAdditional context: {additional_context}"

        system_prompt = (
            "You are PlanForge AI. Generate a detailed, copy-paste ready prompt "
            "for an AI coding agent. Include exact files, patterns, and edge cases."
        )

        from app.ai.client import AIClient
        client = AIClient()
        new_prompt = await client.generate(
            system_prompt=system_prompt,
            user_prompt=prompt,
            model_tier=ModelTier.TASK,
            temperature=0.3,
        )

        task.prompt_text = new_prompt
        await task.save()
        return new_prompt

    async def _get_project(self, project_id: UUID) -> Project:
        project = await Project.find_one(Project.id == project_id)
        if not project:
            raise ValueError(f"Project {project_id} not found")
        return project

    async def _get_feature(self, feature_id: UUID) -> Feature:
        feature = await Feature.find_one(Feature.id == feature_id)
        if not feature:
            raise ValueError(f"Feature {feature_id} not found")
        return feature
