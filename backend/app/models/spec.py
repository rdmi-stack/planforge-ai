"""Spec document model."""

import uuid

from beanie import Document, Indexed
from pydantic import Field

from app.models.base import TimestampMixin


class Spec(TimestampMixin, Document):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    project_id: Indexed(uuid.UUID)  # type: ignore[valid-type]
    title: str
    content_json: dict | None = None
    status: str = "draft"
    version: int = 1
    parent_spec_id: uuid.UUID | None = None

    class Settings:
        name = "specs"
