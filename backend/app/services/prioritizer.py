"""Feature prioritization service supporting ICE, RICE, and MoSCoW frameworks."""

from pathlib import Path
from uuid import UUID

import structlog
from jinja2 import Environment, FileSystemLoader
from pydantic import BaseModel, Field

from app.ai.client import ModelTier
from app.ai.structured_output import StructuredAIClient
from app.models.feature import Feature
from app.models.project import Project

logger = structlog.get_logger()

PROMPTS_DIR = Path(__file__).parent.parent / "ai" / "prompts"


class PrioritizedFeature(BaseModel):
    """AI-generated prioritization result for a single feature."""

    title: str
    scores: dict[str, float] = Field(description="Individual dimension scores")
    overall_score: float
    rank: int
    reasoning: str
    mvp_included: bool


class PrioritizationResult(BaseModel):
    """Full prioritization output."""

    framework: str
    features: list[PrioritizedFeature]
    implementation_order: list[str] = Field(description="Feature titles in recommended order")
    mvp_cutoff_index: int = Field(description="Index in implementation_order where MVP ends")
    recommendations: list[str] = Field(default_factory=list)


class Prioritizer:
    """Scores and ranks features using configurable prioritization frameworks."""

    def __init__(self) -> None:
        self.structured_client = StructuredAIClient()
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(PROMPTS_DIR)),
            autoescape=False,
        )

    async def prioritize_features(
        self,
        project_id: UUID,
        framework: str = "ICE",
    ) -> PrioritizationResult:
        """Run AI-powered prioritization on all features in a project."""
        if framework not in ("ICE", "RICE", "MoSCoW"):
            raise ValueError(f"Unsupported framework: {framework}. Use ICE, RICE, or MoSCoW.")

        project = await self._get_project(project_id)
        features = await self._get_features(project_id)

        if not features:
            raise ValueError(f"No features found for project {project_id}")

        template = self.jinja_env.get_template("prioritization.j2")
        prompt = template.render(
            framework=framework,
            project_name=project.name,
            project_goals=project.description or "Not specified",
            features=[
                {
                    "title": f.title,
                    "description": f.description,
                    "effort_estimate": f.effort_estimate,
                    "priority_score": f.priority_score,
                    "dependencies": [],
                }
                for f in features
            ],
        )

        system_prompt = f"You are PlanForge AI. Prioritize features using the {framework} framework."

        logger.info("prioritization_start", project_id=str(project_id), framework=framework)

        result = await self.structured_client.generate(
            response_model=PrioritizationResult,
            system_prompt=system_prompt,
            user_prompt=prompt,
            model_tier=ModelTier.CHAT,
            temperature=0.3,
            max_tokens=4096,
        )

        # Update features in database
        feature_map = {f.title: f for f in features}
        for pf in result.features:
            if pf.title in feature_map:
                db_feature = feature_map[pf.title]
                db_feature.priority_score = int(pf.overall_score)
                if pf.mvp_included:
                    db_feature.mvp_classification = "must_have"
                await db_feature.save()

        logger.info(
            "prioritization_complete",
            project_id=str(project_id),
            framework=framework,
            feature_count=len(result.features),
        )
        return result

    async def _get_project(self, project_id: UUID) -> Project:
        project = await Project.find_one(Project.id == project_id)
        if not project:
            raise ValueError(f"Project {project_id} not found")
        return project

    async def _get_features(self, project_id: UUID) -> list[Feature]:
        return await Feature.find(Feature.project_id == project_id).sort(+Feature.sort_order).to_list()
