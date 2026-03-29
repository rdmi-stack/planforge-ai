"""Task document model."""

import uuid

from beanie import Document, Indexed
from pydantic import Field

from app.models.base import TimestampMixin


class Task(TimestampMixin, Document):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    feature_id: uuid.UUID | None = None
    project_id: Indexed(uuid.UUID)  # type: ignore[valid-type]
    title: str
    description: str | None = None
    prompt_text: str | None = None
    acceptance_criteria_json: dict | None = None
    status: str = "todo"
    sequence_order: int = 0
    regression_risk: str | None = None
    estimated_minutes: float | None = None
    agent_type: str | None = None
    agent_run_id: uuid.UUID | None = None

    class Settings:
        name = "tasks"
