"""User document model."""

import uuid

from beanie import Document, Indexed
from pydantic import Field

from app.models.base import TimestampMixin


class User(TimestampMixin, Document):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    email: Indexed(str, unique=True)  # type: ignore[valid-type]
    name: str
    password_hash: str
    avatar_url: str | None = None
    plan: str = "free"
    org_id: uuid.UUID | None = None

    class Settings:
        name = "users"
