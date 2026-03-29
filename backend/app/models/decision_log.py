"""DecisionLog document model."""



from beanie import Document, Indexed
from pydantic import Field

from app.models.base import TimestampMixin


class DecisionLog(TimestampMixin, Document):
    id: str = Field(default_factory=lambda: __import__("uuid").uuid4().hex)
    project_id: Indexed(str)  # type: ignore[valid-type]
    decision: str
    reasoning: str | None = None
    alternatives_json: list[dict] | None = None
    made_by: str

    class Settings:
        name = "decision_log"
