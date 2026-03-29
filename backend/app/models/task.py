"""Task document model."""



from beanie import Document, Indexed
from pydantic import Field

from app.models.base import TimestampMixin


class Task(TimestampMixin, Document):
    id: str = Field(default_factory=lambda: __import__("uuid").uuid4().hex)
    feature_id: str | None = None
    project_id: Indexed(str)  # type: ignore[valid-type]
    title: str
    description: str | None = None
    prompt_text: str | None = None
    acceptance_criteria: list[str] = Field(default_factory=list)
    status: str = "todo"
    sequence_order: int = 0
    regression_risk: str | None = None
    estimated_minutes: float | None = None
    agent_type: str | None = None
    agent_run_id: str | None = None

    class Settings:
        name = "tasks"
