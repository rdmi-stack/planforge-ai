"""Organization and OrgMember document models."""



from beanie import Document, Indexed
from pydantic import Field

from app.models.base import TimestampMixin


class OrgMember(TimestampMixin, Document):
    id: str = Field(default_factory=lambda: __import__("uuid").uuid4().hex)
    org_id: str
    user_id: str
    role: str = "member"

    class Settings:
        name = "org_members"


class Organization(TimestampMixin, Document):
    id: str = Field(default_factory=lambda: __import__("uuid").uuid4().hex)
    name: str
    slug: Indexed(str, unique=True)  # type: ignore[valid-type]
    plan: str = "free"
    stripe_customer_id: str | None = None

    class Settings:
        name = "organizations"
