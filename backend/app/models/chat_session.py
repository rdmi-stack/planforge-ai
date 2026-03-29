"""ChatSession document model."""



from beanie import Document, Indexed
from pydantic import Field

from app.models.base import TimestampMixin


class ChatSession(TimestampMixin, Document):
    id: str = Field(default_factory=lambda: __import__("uuid").uuid4().hex)
    project_id: Indexed(str)  # type: ignore[valid-type]
    user_id: Indexed(str)  # type: ignore[valid-type]
    messages_json: dict | None = None
    session_type: str = "planning"

    class Settings:
        name = "chat_sessions"
