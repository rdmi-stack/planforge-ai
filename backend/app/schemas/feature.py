from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class FeatureCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    description: str | None = None
    spec_id: UUID | None = None
    parent_feature_id: UUID | None = None
    priority_score: float | None = None
    effort_estimate: str | None = None
    mvp_classification: str | None = None
    sort_order: int = 0


class FeatureUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=300)
    description: str | None = None
    priority_score: float | None = None
    effort_estimate: str | None = None
    status: str | None = None
    mvp_classification: str | None = None
    sort_order: int | None = None


class FeatureResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    project_id: UUID
    spec_id: UUID | None
    title: str
    description: str | None
    priority_score: float | None
    effort_estimate: str | None
    status: str
    parent_feature_id: UUID | None
    sort_order: int
    mvp_classification: str | None
    created_at: datetime
    updated_at: datetime
