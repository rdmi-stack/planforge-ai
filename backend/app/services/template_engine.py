"""Template matching and customization service."""

from uuid import UUID

import structlog

from app.models.project import Project
from app.models.spec import Spec
from app.models.template import Template

logger = structlog.get_logger()


class TemplateEngine:
    """Manages project templates for quick-start spec and architecture generation."""

    async def list_templates(
        self,
        category: str | None = None,
        is_public: bool = True,
        user_id: UUID | None = None,
    ) -> list[Template]:
        """List available templates, optionally filtered by category."""
        if is_public and user_id:
            # Public templates OR user's own templates - need $or query
            templates_public = await Template.find(
                Template.is_public == True  # noqa: E712
            ).to_list()
            templates_user = await Template.find(
                Template.created_by == user_id
            ).to_list()
            # Deduplicate
            seen_ids = set()
            templates = []
            for t in templates_public + templates_user:
                if t.id not in seen_ids:
                    seen_ids.add(t.id)
                    templates.append(t)
            if category:
                templates = [t for t in templates if t.category == category]
            templates.sort(key=lambda t: t.name)
            return templates
        elif is_public:
            query = Template.find(Template.is_public == True)  # noqa: E712
        elif user_id:
            query = Template.find(Template.created_by == user_id)
        else:
            query = Template.find()

        if category:
            query = query.find(Template.category == category)

        return await query.sort(+Template.name).to_list()

    async def get_template(self, template_id: UUID) -> Template:
        """Get a single template by ID."""
        template = await Template.find_one(Template.id == template_id)
        if not template:
            raise ValueError(f"Template {template_id} not found")
        return template

    async def apply_template(
        self,
        project_id: UUID,
        template_id: UUID,
    ) -> Spec:
        """Apply a template to a project, creating an initial spec from the template."""
        template = await self.get_template(template_id)
        project = await self._get_project(project_id)

        spec_template = template.spec_template_json or {}

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
        await spec.insert()

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
        """Create a new template."""
        template = Template(
            name=name,
            category=category,
            description=description,
            spec_template_json=spec_template_json,
            architecture_json=architecture_json,
            is_public=is_public,
            created_by=created_by,
        )
        await template.insert()

        logger.info("template_created", template_id=str(template.id), name=name)
        return template

    async def _get_project(self, project_id: UUID) -> Project:
        project = await Project.find_one(Project.id == project_id)
        if not project:
            raise ValueError(f"Project {project_id} not found")
        return project
