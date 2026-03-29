"""SpecVersion document model."""

import uuid

from beanie import Document, Indexed
from pydantic import Field

from app.models.base import TimestampMixin


class SpecVersion(TimestampMixin, Document):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    spec_id: Indexed(uuid.UUID)  # type: ignore[valid-type]
    version_number: int
    content_json: dict | None = None
    diff_json: dict | None = None
    created_by: uuid.UUID | None = None

    class Settings:
        name = "spec_versions"
