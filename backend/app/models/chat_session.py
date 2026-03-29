"""ChatSession document model."""

import uuid

from beanie import Document, Indexed
from pydantic import Field

from app.models.base import TimestampMixin


class ChatSession(TimestampMixin, Document):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    project_id: Indexed(uuid.UUID)  # type: ignore[valid-type]
    user_id: Indexed(uuid.UUID)  # type: ignore[valid-type]
    messages_json: dict | None = None
    session_type: str = "planning"

    class Settings:
        name = "chat_sessions"
