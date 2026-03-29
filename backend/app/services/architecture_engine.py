"""System architecture generation service."""

from pathlib import Path
from uuid import UUID

import structlog
from jinja2 import Environment, FileSystemLoader
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.client import AIClient, ModelTier
from app.models.feature import Feature
from app.models.project import Project
from app.models.spec import Spec

logger = structlog.get_logger()

PROMPTS_DIR = Path(__file__).parent.parent / "ai" / "prompts"


class ArchitectureEngine:
    """Generates technical architecture documents including system design,
    database schemas, API contracts, and infrastructure recommendations.

    Uses project specs and features as input to produce comprehensive
    architecture artifacts tailored to the project's tech stack.
    """

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.ai_client = AIClient()
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(PROMPTS_DIR)),
            autoescape=False,
        )

    async def generate_architecture(
        self,
        project_id: UUID,
        codebase_context: str | None = None,
    ) -> dict:
        """Generate a full architecture document for the project.

        Returns a dict with keys: system_design, database_schema,
        api_contract, infrastructure, security.
        """
        project = await self._get_project(project_id)

        # Load spec
        spec_result = await self.db.execute(
            select(Spec)
            .where(Spec.project_id == project_id)
            .order_by(Spec.version.desc())
            .limit(1)
        )
        spec = spec_result.scalar_one_or_none()
        spec_summary = spec.content_json.get("markdown", "") if spec else "No specification available"

        # Load features
        features_result = await self.db.execute(
            select(Feature)
            .where(Feature.project_id == project_id)
            .order_by(Feature.sort_order)
        )
        features = list(features_result.scalars().all())

        template = self.jinja_env.get_template("architecture.j2")
        prompt = template.render(
            project_name=project.name,
            project_description=project.description or "",
            tech_stack=project.tech_stack_json or "Not specified",
            spec_summary=spec_summary[:4000],  # Truncate for token limits
            features=[
                {"title": f.title, "description": f.description or ""}
                for f in features
            ],
            codebase_context=codebase_context,
        )

        system_prompt = (
            "You are PlanForge AI, an expert software architect. "
            "Generate a comprehensive, production-grade technical architecture."
        )

        logger.info("architecture_generation_start", project_id=str(project_id))

        content = await self.ai_client.generate(
            system_prompt=system_prompt,
            user_prompt=prompt,
            model_tier=ModelTier.ARCHITECTURE,
            temperature=0.3,
            max_tokens=8192,
        )

        architecture = {
            "markdown": content,
            "sections": self._parse_sections(content),
            "project_id": str(project_id),
        }

        logger.info("architecture_generation_complete", project_id=str(project_id))
        return architecture

    def _parse_sections(self, markdown: str) -> dict[str, str]:
        """Parse architecture Markdown into named sections."""
        sections: dict[str, str] = {}
        current_title: str | None = None
        current_content: list[str] = []

        for line in markdown.split("\n"):
            if line.startswith("### ") or line.startswith("## "):
                if current_title:
                    sections[current_title] = "\n".join(current_content).strip()
                current_title = line.lstrip("#").strip()
                current_content = []
            else:
                current_content.append(line)

        if current_title:
            sections[current_title] = "\n".join(current_content).strip()

        return sections

    async def _get_project(self, project_id: UUID) -> Project:
        result = await self.db.execute(select(Project).where(Project.id == project_id))
        project = result.scalar_one_or_none()
        if not project:
            raise ValueError(f"Project {project_id} not found")
        return project
