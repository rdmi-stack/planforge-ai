"""Project document model."""

import uuid

from beanie import Document, Indexed
from pydantic import Field

from app.models.base import TimestampMixin


class Project(TimestampMixin, Document):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    org_id: Indexed(uuid.UUID)  # type: ignore[valid-type]
    owner_id: Indexed(uuid.UUID)  # type: ignore[valid-type]
    name: str
    description: str | None = None
    status: str = "active"
    github_repo_url: str | None = None
    tech_stack_json: dict | None = None

    class Settings:
        name = "projects"
