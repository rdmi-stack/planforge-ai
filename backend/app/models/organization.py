"""Organization and OrgMember document models."""

import uuid

from beanie import Document, Indexed
from pydantic import Field

from app.models.base import TimestampMixin


class OrgMember(TimestampMixin, Document):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    org_id: uuid.UUID
    user_id: uuid.UUID
    role: str = "member"

    class Settings:
        name = "org_members"


class Organization(TimestampMixin, Document):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    name: str
    slug: Indexed(str, unique=True)  # type: ignore[valid-type]
    plan: str = "free"
    stripe_customer_id: str | None = None

    class Settings:
        name = "organizations"
