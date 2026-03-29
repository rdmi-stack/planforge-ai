"""Feature document model."""

import uuid

from beanie import Document, Indexed
from pydantic import Field

from app.models.base import TimestampMixin


class Feature(TimestampMixin, Document):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    project_id: Indexed(uuid.UUID)  # type: ignore[valid-type]
    spec_id: uuid.UUID | None = None
    title: str
    description: str | None = None
    priority_score: float | None = None
    effort_estimate: str | None = None
    status: str = "backlog"
    parent_feature_id: uuid.UUID | None = None
    sort_order: int = 0
    mvp_classification: str | None = None
    dependencies: list[uuid.UUID] = Field(default_factory=list)

    class Settings:
        name = "features"
