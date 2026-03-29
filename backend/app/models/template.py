"""Template document model."""



from beanie import Document
from pydantic import Field

from app.models.base import TimestampMixin


class Template(TimestampMixin, Document):
    id: str = Field(default_factory=lambda: __import__("uuid").uuid4().hex)
    name: str
    category: str
    description: str | None = None
    spec_template_json: dict | None = None
    architecture_json: dict | None = None
    is_public: bool = False
    created_by: str | None = None

    class Settings:
        name = "templates"
