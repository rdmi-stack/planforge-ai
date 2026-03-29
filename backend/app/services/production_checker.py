"""Production readiness audit service."""

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


class AuditDimension(BaseModel):
    """Score for a single audit dimension."""

    name: str
    score: int = Field(ge=0, le=10)
    findings: list[str]
    recommendations: list[str]


class ProductionAuditResult(BaseModel):
    """Full production readiness audit result."""

    overall_score: int = Field(ge=0, le=100)
    dimensions: list[AuditDimension]
    action_items: list[str] = Field(description="Prioritized list of actions to reach production")
    summary: str


class ProductionChecker:
    """Audits project plans for production readiness."""

    def __init__(self) -> None:
        self.structured_client = StructuredAIClient()
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(PROMPTS_DIR)),
            autoescape=False,
        )

    async def run_audit(
        self,
        project_id: UUID,
        architecture_summary: str | None = None,
        codebase_context: str | None = None,
    ) -> ProductionAuditResult:
        """Run a full production readiness audit on a project."""
        project = await self._get_project(project_id)

        # Gather features and tasks
        features = await Feature.find(Feature.project_id == project_id).to_list()
        tasks = await Task.find(Task.project_id == project_id).to_list()
        completed_tasks = await Task.find(
            Task.project_id == project_id, Task.status == "done"
        ).count()

        template = self.jinja_env.get_template("production_audit.j2")
        prompt = template.render(
            project_name=project.name,
            project_description=project.description or "",
            tech_stack=project.tech_stack or "Not specified",
            architecture_summary=architecture_summary or "No architecture document available",
            features=[
                {"title": f.title, "status": f.status}
                for f in features
            ],
            tasks=[
                {"title": t.title, "status": t.status}
                for t in tasks
            ],
            completed_tasks=completed_tasks,
            codebase_context=codebase_context,
        )

        system_prompt = (
            "You are PlanForge AI, a production readiness auditor. "
            "Evaluate the project and provide actionable recommendations."
        )

        logger.info("production_audit_start", project_id=str(project_id))

        result = await self.structured_client.generate(
            response_model=ProductionAuditResult,
            system_prompt=system_prompt,
            user_prompt=prompt,
            model_tier=ModelTier.ARCHITECTURE,
            temperature=0.3,
            max_tokens=4096,
        )

        logger.info(
            "production_audit_complete",
            project_id=str(project_id),
            overall_score=result.overall_score,
        )
        return result

    async def _get_project(self, project_id: UUID) -> Project:
        project = await Project.find_one(Project.id == project_id)
        if not project:
            raise ValueError(f"Project {project_id} not found")
        return project
