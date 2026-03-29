"""AgentRun document model."""

import uuid
from datetime import datetime

from beanie import Document, Indexed
from pydantic import Field

from app.models.base import TimestampMixin


class AgentRun(TimestampMixin, Document):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    task_id: Indexed(uuid.UUID | None, default=None)  # type: ignore[valid-type]
    agent_type: str
    status: str = "pending"
    started_at: datetime | None = None
    completed_at: datetime | None = None
    output_log: str | None = None
    validation_result: dict | None = None
    retry_count: int = 0

    class Settings:
        name = "agent_runs"
