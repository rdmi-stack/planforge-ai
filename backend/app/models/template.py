"""Template document model."""

import uuid

from beanie import Document
from pydantic import Field

from app.models.base import TimestampMixin


class Template(TimestampMixin, Document):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    name: str
    category: str
    description: str | None = None
    spec_template_json: dict | None = None
    architecture_json: dict | None = None
    is_public: bool = False
    created_by: uuid.UUID | None = None

    class Settings:
        name = "templates"
