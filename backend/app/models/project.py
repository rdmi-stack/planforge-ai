"""Project document model."""



from beanie import Document, Indexed
from pydantic import Field

from app.models.base import TimestampMixin


class Project(TimestampMixin, Document):
    id: str = Field(default_factory=lambda: __import__("uuid").uuid4().hex)
    org_id: Indexed(str)  # type: ignore[valid-type]
    owner_id: Indexed(str)  # type: ignore[valid-type]
    name: str
    description: str | None = None
    status: str = "active"
    github_repo_url: str | None = None
    tech_stack_json: dict | None = None

    class Settings:
        name = "projects"
