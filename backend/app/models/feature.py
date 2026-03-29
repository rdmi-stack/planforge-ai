"""Feature document model."""



from beanie import Document, Indexed
from pydantic import Field

from app.models.base import TimestampMixin


class Feature(TimestampMixin, Document):
    id: str = Field(default_factory=lambda: __import__("uuid").uuid4().hex)
    project_id: Indexed(str)  # type: ignore[valid-type]
    spec_id: str | None = None
    title: str
    description: str | None = None
    priority_score: float | None = None
    effort_estimate: str | None = None
    status: str = "backlog"
    parent_feature_id: str | None = None
    sort_order: int = 0
    mvp_classification: str | None = None
    dependencies: list[str] = Field(default_factory=list)

    class Settings:
        name = "features"
