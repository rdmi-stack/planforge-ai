"""Feature decomposition service: breaks specs into epics, features, and stories."""

from pathlib import Path
from uuid import UUID

import structlog
from jinja2 import Environment, FileSystemLoader
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.client import ModelTier
from app.ai.structured_output import StructuredAIClient
from app.models.feature import Feature
from app.models.project import Project
from app.models.spec import Spec

logger = structlog.get_logger()

PROMPTS_DIR = Path(__file__).parent.parent / "ai" / "prompts"


class DecomposedFeature(BaseModel):
    """Pydantic model for AI-generated feature output."""

    title: str
    description: str
    effort_estimate: str = Field(description="small, medium, large, or xlarge")
    priority_score: int = Field(ge=1, le=10)
    mvp_classification: str = Field(description="must_have, should_have, could_have, or wont_have")
    parent_title: str | None = None
    dependencies: list[str] = Field(default_factory=list)
    user_stories: list[str] = Field(default_factory=list)
    acceptance_criteria: list[str] = Field(default_factory=list)


class FeatureDecomposition(BaseModel):
    """Container for the full decomposition result."""

    features: list[DecomposedFeature]


class FeatureDecomposer:
    """Decomposes product specifications into hierarchical feature trees.

    Takes a spec document and uses AI to break it down into epics, features,
    and user stories with effort estimates, priority scores, and dependency mappings.
    """

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.structured_client = StructuredAIClient()
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(PROMPTS_DIR)),
            autoescape=False,
        )

    async def decompose_spec(
        self,
        project_id: UUID,
        spec_id: UUID,
    ) -> list[Feature]:
        """Break down a spec into features and persist them.

        Returns the list of created Feature ORM instances.
        """
        project = await self._get_project(project_id)
        spec = await self._get_spec(spec_id)

        # Load existing features to avoid duplication
        existing_result = await self.db.execute(
            select(Feature).where(Feature.project_id == project_id)
        )
        existing_features = list(existing_result.scalars().all())

        template = self.jinja_env.get_template("feature_breakdown.j2")
        prompt = template.render(
            project_name=project.name,
            project_description=project.description or "",
            spec_content=spec.content_json.get("markdown", ""),
            existing_features=[
                {"title": f.title, "description": f.description}
                for f in existing_features
            ],
        )

        system_prompt = (
            "You are PlanForge AI. Decompose the specification into a hierarchical "
            "feature tree with epics, features, and user stories."
        )

        logger.info("feature_decomposition_start", project_id=str(project_id), spec_id=str(spec_id))

        decomposition = await self.structured_client.generate(
            response_model=FeatureDecomposition,
            system_prompt=system_prompt,
            user_prompt=prompt,
            model_tier=ModelTier.SPEC,
            temperature=0.3,
            max_tokens=8192,
        )

        # Persist features
        created_features: list[Feature] = []
        title_to_feature: dict[str, Feature] = {}

        for i, df in enumerate(decomposition.features):
            feature = Feature(
                project_id=project_id,
                spec_id=spec_id,
                title=df.title,
                description=df.description,
                priority_score=df.priority_score,
                effort_estimate=df.effort_estimate,
                status="backlog",
                mvp_classification=df.mvp_classification,
                sort_order=i,
            )

            # Set parent if specified
            if df.parent_title and df.parent_title in title_to_feature:
                feature.parent_feature_id = title_to_feature[df.parent_title].id

            self.db.add(feature)
            await self.db.flush()
            title_to_feature[df.title] = feature
            created_features.append(feature)

        await self.db.commit()

        logger.info(
            "feature_decomposition_complete",
            project_id=str(project_id),
            feature_count=len(created_features),
        )
        return created_features

    async def add_feature(
        self,
        project_id: UUID,
        spec_id: UUID | None,
        title: str,
        description: str,
        priority_score: int = 5,
        effort_estimate: str = "medium",
        mvp_classification: str = "should_have",
        parent_feature_id: UUID | None = None,
    ) -> Feature:
        """Manually add a single feature to a project."""
        # Determine sort order
        result = await self.db.execute(
            select(Feature)
            .where(Feature.project_id == project_id)
            .order_by(Feature.sort_order.desc())
            .limit(1)
        )
        last = result.scalar_one_or_none()
        sort_order = (last.sort_order + 1) if last else 0

        feature = Feature(
            project_id=project_id,
            spec_id=spec_id,
            title=title,
            description=description,
            priority_score=priority_score,
            effort_estimate=effort_estimate,
            status="backlog",
            mvp_classification=mvp_classification,
            parent_feature_id=parent_feature_id,
            sort_order=sort_order,
        )
        self.db.add(feature)
        await self.db.commit()
        await self.db.refresh(feature)
        return feature

    async def _get_project(self, project_id: UUID) -> Project:
        result = await self.db.execute(select(Project).where(Project.id == project_id))
        project = result.scalar_one_or_none()
        if not project:
            raise ValueError(f"Project {project_id} not found")
        return project

    async def _get_spec(self, spec_id: UUID) -> Spec:
        result = await self.db.execute(select(Spec).where(Spec.id == spec_id))
        spec = result.scalar_one_or_none()
        if not spec:
            raise ValueError(f"Spec {spec_id} not found")
        return spec
