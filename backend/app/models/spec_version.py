"""SpecVersion document model."""



from beanie import Document, Indexed
from pydantic import Field

from app.models.base import TimestampMixin


class SpecVersion(TimestampMixin, Document):
    id: str = Field(default_factory=lambda: __import__("uuid").uuid4().hex)
    spec_id: Indexed(str)  # type: ignore[valid-type]
    version_number: int
    content_json: dict | None = None
    diff_json: dict | None = None
    created_by: str | None = None

    class Settings:
        name = "spec_versions"
