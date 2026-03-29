"""Core AI planning orchestration service.

Coordinates the full planning pipeline: idea -> questions -> spec -> features -> tasks.
"""

from pathlib import Path
from uuid import UUID

import structlog
from jinja2 import Environment, FileSystemLoader

from app.ai.client import AIClient, ModelTier
from app.ai.structured_output import StructuredAIClient
from app.models.chat_session import ChatSession
from app.models.project import Project
from app.services.feature_decomposer import FeatureDecomposer
from app.services.spec_generator import SpecGenerator
from app.services.task_generator import TaskGenerator

logger = structlog.get_logger()

PROMPTS_DIR = Path(__file__).parent.parent / "ai" / "prompts"


class AIPlannerService:
    """Orchestrates the full AI planning pipeline for a project.

    Manages the conversation flow from initial idea through spec generation,
    feature decomposition, and task breakdown. Each step builds on prior
    context to produce increasingly detailed planning artifacts.
    """

    def __init__(self) -> None:
        self.ai_client = AIClient()
        self.structured_client = StructuredAIClient()
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(PROMPTS_DIR)),
            autoescape=False,
        )

    async def ask_smart_questions(
        self,
        project_id: UUID,
        user_input: str,
        conversation_history: list[dict] | None = None,
    ) -> str:
        """Generate 3-5 clarifying questions based on the user's project description."""
        project = await self._get_project(project_id)
        template = self.jinja_env.get_template("smart_questions.j2")

        prompt = template.render(
            user_input=user_input,
            project_name=project.name,
            conversation_history=conversation_history or [],
        )

        system_prompt = (
            "You are PlanForge AI, an expert product strategist. "
            "Ask smart, specific clarifying questions to produce better specs."
        )

        response = await self.ai_client.generate(
            system_prompt=system_prompt,
            user_prompt=prompt,
            model_tier=ModelTier.CHAT,
            temperature=0.7,
        )

        logger.info("smart_questions_generated", project_id=str(project_id))
        return response

    async def generate_full_plan(
        self,
        project_id: UUID,
        conversation_summary: str,
    ) -> dict:
        """Run the full planning pipeline: spec -> features -> tasks."""
        logger.info("full_plan_generation_start", project_id=str(project_id))

        # Step 1: Generate spec
        spec_generator = SpecGenerator()
        spec = await spec_generator.generate_spec(
            project_id=project_id,
            conversation_summary=conversation_summary,
        )

        # Step 2: Decompose into features
        decomposer = FeatureDecomposer()
        features = await decomposer.decompose_spec(
            project_id=project_id,
            spec_id=spec.id,
        )

        # Step 3: Generate tasks for each feature
        task_gen = TaskGenerator()
        all_tasks = []
        for feature in features:
            tasks = await task_gen.generate_tasks(
                project_id=project_id,
                feature_id=feature.id,
            )
            all_tasks.extend(tasks)

        logger.info(
            "full_plan_generation_complete",
            project_id=str(project_id),
            spec_id=str(spec.id),
            feature_count=len(features),
            task_count=len(all_tasks),
        )

        return {
            "spec_id": str(spec.id),
            "feature_count": len(features),
            "task_count": len(all_tasks),
        }

    async def chat_stream(
        self,
        project_id: UUID,
        user_message: str,
        session_id: UUID | None = None,
    ):
        """Stream a planning chat response for the given project."""
        project = await self._get_project(project_id)

        # Load or create chat session
        conversation_history = []
        if session_id:
            session = await ChatSession.find_one(ChatSession.id == session_id)
            if session and session.messages_json:
                conversation_history = session.messages_json

        # Build context
        context_parts = [
            f"Project: {project.name}",
            f"Description: {project.description or 'Not yet defined'}",
        ]
        if project.tech_stack:
            context_parts.append(f"Tech Stack: {project.tech_stack}")

        history_text = ""
        for msg in conversation_history[-10:]:
            history_text += f"\n{msg['role'].upper()}: {msg['content']}"

        system_prompt = (
            "You are PlanForge AI, an expert product planner and technical architect. "
            "Help the user plan and build their product. Be specific, actionable, and opinionated. "
            "When you have enough information, offer to generate a formal specification.\n\n"
            f"Project Context:\n" + "\n".join(context_parts)
        )

        user_prompt = history_text + f"\nUSER: {user_message}" if history_text else user_message

        async for chunk in self.ai_client.stream(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            model_tier=ModelTier.CHAT,
            temperature=0.7,
        ):
            yield chunk

    async def _get_project(self, project_id: UUID) -> Project:
        """Fetch a project by ID or raise."""
        project = await Project.find_one(Project.id == project_id)
        if not project:
            raise ValueError(f"Project {project_id} not found")
        return project
