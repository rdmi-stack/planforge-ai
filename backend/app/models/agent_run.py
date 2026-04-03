"""AgentRun document model."""


from datetime import datetime

from beanie import Document
from pydantic import Field

from app.models.base import TimestampMixin


class AgentRun(TimestampMixin, Document):
    id: str = Field(default_factory=lambda: __import__("uuid").uuid4().hex)
    task_id: str | None = None
    agent_type: str
    status: str = "pending"
    started_at: datetime | None = None
    completed_at: datetime | None = None
    output_log: str | None = None
    validation_result: dict | None = None
    retry_count: int = 0

    class Settings:
        name = "agent_runs"
