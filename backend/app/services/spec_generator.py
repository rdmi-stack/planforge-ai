"""PRD and specification generation service using Claude AI."""

from pathlib import Path
from uuid import UUID

import structlog
from jinja2 import Environment, FileSystemLoader

from app.ai.client import AIClient, ModelTier
from app.models.project import Project
from app.models.spec import Spec
from app.models.spec_version import SpecVersion

logger = structlog.get_logger()

PROMPTS_DIR = Path(__file__).parent.parent / "ai" / "prompts"


class SpecGenerator:
    """Generates product specifications and PRDs from planning conversations.

    Takes conversation summaries and project context, renders them through
    prompt templates, and produces structured specification documents.
    Automatically creates versioned snapshots for diff tracking.
    """

    def __init__(self) -> None:
        self.ai_client = AIClient()
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(PROMPTS_DIR)),
            autoescape=False,
        )

    async def generate_spec(
        self,
        project_id: UUID,
        conversation_summary: str,
        target_users: str | None = None,
        codebase_context: str | None = None,
    ) -> Spec:
        """Generate a full product specification from a conversation summary.

        Creates both a Spec record and an initial SpecVersion for version tracking.
        """
        project = await self._get_project(project_id)
        template = self.jinja_env.get_template("spec_generation.j2")

        prompt = template.render(
            project_name=project.name,
            project_description=project.description or "",
            tech_stack=project.tech_stack,
            target_users=target_users,
            conversation_summary=conversation_summary,
            codebase_context=codebase_context,
        )

        system_prompt = (
            "You are PlanForge AI. Generate a comprehensive, actionable product specification. "
            "Be specific and opinionated. Output clean Markdown."
        )

        logger.info("spec_generation_start", project_id=str(project_id))

        content = await self.ai_client.generate(
            system_prompt=system_prompt,
            user_prompt=prompt,
            model_tier=ModelTier.SPEC,
            temperature=0.3,
            max_tokens=8192,
        )

        # Create spec record
        spec = Spec(
            project_id=project_id,
            title=f"{project.name} - Product Specification",
            content_json={"markdown": content, "sections": self._parse_sections(content)},
            status="draft",
            version=1,
        )
        await spec.insert()

        # Create initial version
        version = SpecVersion(
            spec_id=spec.id,
            version_number=1,
            content_json=spec.content_json,
            diff_json=None,
            created_by=None,
        )
        await version.insert()

        logger.info("spec_generation_complete", spec_id=str(spec.id), project_id=str(project_id))
        return spec

    async def update_spec(
        self,
        spec_id: UUID,
        updated_content: str,
        user_id: UUID,
    ) -> SpecVersion:
        """Create a new version of an existing spec with diff tracking."""
        spec = await Spec.find_one(Spec.id == spec_id)
        if not spec:
            raise ValueError(f"Spec {spec_id} not found")

        old_content = spec.content_json
        new_content = {"markdown": updated_content, "sections": self._parse_sections(updated_content)}

        # Increment version
        new_version_number = spec.version + 1
        spec.content_json = new_content
        spec.version = new_version_number
        await spec.save()

        # Create version record with diff
        diff = self._compute_diff(old_content, new_content)
        version = SpecVersion(
            spec_id=spec.id,
            version_number=new_version_number,
            content_json=new_content,
            diff_json=diff,
            created_by=user_id,
        )
        await version.insert()

        logger.info("spec_version_created", spec_id=str(spec_id), version=new_version_number)
        return version

    async def regenerate_section(
        self,
        spec_id: UUID,
        section_name: str,
        additional_context: str | None = None,
    ) -> str:
        """Regenerate a specific section of a spec with optional new context."""
        spec = await Spec.find_one(Spec.id == spec_id)
        if not spec:
            raise ValueError(f"Spec {spec_id} not found")

        current_content = spec.content_json.get("markdown", "")
        prompt = (
            f"Here is the current specification:\n\n{current_content}\n\n"
            f"Regenerate ONLY the '{section_name}' section. "
            f"Keep all other sections unchanged.\n"
        )
        if additional_context:
            prompt += f"\nAdditional context: {additional_context}"

        system_prompt = "You are PlanForge AI. Regenerate the requested section with improved detail."

        return await self.ai_client.generate(
            system_prompt=system_prompt,
            user_prompt=prompt,
            model_tier=ModelTier.SPEC,
            temperature=0.3,
        )

    def _parse_sections(self, markdown: str) -> list[dict]:
        """Parse Markdown into a list of section objects for structured storage."""
        sections: list[dict] = []
        current_section: dict | None = None

        for line in markdown.split("\n"):
            if line.startswith("## "):
                if current_section:
                    sections.append(current_section)
                current_section = {"title": line[3:].strip(), "content": ""}
            elif current_section is not None:
                current_section["content"] += line + "\n"

        if current_section:
            sections.append(current_section)
        return sections

    def _compute_diff(self, old_content: dict, new_content: dict) -> dict:
        """Compute a simple diff between two spec versions."""
        old_sections = {s["title"]: s["content"] for s in old_content.get("sections", [])}
        new_sections = {s["title"]: s["content"] for s in new_content.get("sections", [])}

        added = [t for t in new_sections if t not in old_sections]
        removed = [t for t in old_sections if t not in new_sections]
        modified = [
            t for t in new_sections
            if t in old_sections and new_sections[t] != old_sections[t]
        ]

        return {"added": added, "removed": removed, "modified": modified}

    async def _get_project(self, project_id: UUID) -> Project:
        project = await Project.find_one(Project.id == project_id)
        if not project:
            raise ValueError(f"Project {project_id} not found")
        return project
