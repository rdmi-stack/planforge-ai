"""Template matching and customization service."""

from uuid import UUID

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project
from app.models.spec import Spec
from app.models.template import Template

logger = structlog.get_logger()


class TemplateEngine:
    """Manages project templates for quick-start spec and architecture generation.

    Templates provide pre-built specification structures, architecture patterns,
    and feature breakdowns for common project types (SaaS, mobile app, API, etc.).
    """

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_templates(
        self,
        category: str | None = None,
        is_public: bool = True,
        user_id: UUID | None = None,
    ) -> list[Template]:
        """List available templates, optionally filtered by category.

        Returns public templates and user's private templates.
        """
        query = select(Template)

        conditions = []
        if category:
            conditions.append(Template.category == category)

        if is_public and user_id:
            # Public templates OR user's own templates
            query = query.where(
                (Template.is_public == True) | (Template.created_by == user_id)  # noqa: E712
            )
        elif is_public:
            query = query.where(Template.is_public == True)  # noqa: E712
        elif user_id:
            query = query.where(Template.created_by == user_id)

        if category:
            query = query.where(Template.category == category)

        query = query.order_by(Template.name)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_template(self, template_id: UUID) -> Template:
        """Get a single template by ID."""
        result = await self.db.execute(
            select(Template).where(Template.id == template_id)
        )
        template = result.scalar_one_or_none()
        if not template:
            raise ValueError(f"Template {template_id} not found")
        return template

    async def apply_template(
        self,
        project_id: UUID,
        template_id: UUID,
    ) -> Spec:
        """Apply a template to a project, creating an initial spec from the template.

        Copies the template's spec structure and architecture into a new spec
        for the project, ready for customization.
        """
        template = await self.get_template(template_id)
        project = await self._get_project(project_id)

        spec_template = template.spec_template_json or {}

        # Create spec from template
        spec = Spec(
            project_id=project_id,
            title=f"{project.name} - Specification (from {template.name})",
            content_json={
                "markdown": spec_template.get("markdown", ""),
                "sections": spec_template.get("sections", []),
                "template_id": str(template_id),
            },
            status="draft",
            version=1,
        )
        self.db.add(spec)
        await self.db.commit()
        await self.db.refresh(spec)

        logger.info(
            "template_applied",
            project_id=str(project_id),
            template_id=str(template_id),
            spec_id=str(spec.id),
        )
        return spec

    async def create_template(
        self,
        name: str,
        category: str,
        description: str,
        spec_template_json: dict | None = None,
        architecture_json: dict | None = None,
        is_public: bool = False,
        created_by: UUID | None = None,
    ) -> Template:
        """Create a new template from scratch or from an existing project's artifacts."""
        template = Template(
            name=name,
            category=category,
            description=description,
            spec_template_json=spec_template_json,
            architecture_json=architecture_json,
            is_public=is_public,
            created_by=created_by,
        )
        self.db.add(template)
        await self.db.commit()
        await self.db.refresh(template)

        logger.info("template_created", template_id=str(template.id), name=name)
        return template

    async def _get_project(self, project_id: UUID) -> Project:
        result = await self.db.execute(select(Project).where(Project.id == project_id))
        project = result.scalar_one_or_none()
        if not project:
            raise ValueError(f"Project {project_id} not found")
        return project
