"""Spec document model."""



from beanie import Document, Indexed
from pydantic import Field

from app.models.base import TimestampMixin


class Spec(TimestampMixin, Document):
    id: str = Field(default_factory=lambda: __import__("uuid").uuid4().hex)
    project_id: Indexed(str)  # type: ignore[valid-type]
    title: str
    content_json: dict | None = None
    status: str = "draft"
    version: int = 1
    parent_spec_id: str | None = None

    class Settings:
        name = "specs"
