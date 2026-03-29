"""DecisionLog document model."""

import uuid

from beanie import Document, Indexed
from pydantic import Field

from app.models.base import TimestampMixin


class DecisionLog(TimestampMixin, Document):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    project_id: Indexed(uuid.UUID)  # type: ignore[valid-type]
    decision: str
    reasoning: str | None = None
    alternatives_json: list[dict] | None = None
    made_by: uuid.UUID

    class Settings:
        name = "decision_log"
