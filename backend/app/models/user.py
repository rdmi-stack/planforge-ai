"""User document model."""



from beanie import Document, Indexed
from pydantic import Field

from app.models.base import TimestampMixin


class User(TimestampMixin, Document):
    id: str = Field(default_factory=lambda: __import__("uuid").uuid4().hex)
    email: Indexed(str, unique=True)  # type: ignore[valid-type]
    name: str
    password_hash: str
    email_verified: bool = False
    avatar_url: str | None = None
    plan: str = "free"
    org_id: str | None = None
    stripe_customer_id: str | None = None
    subscription_status: str = "active"
    current_period_end: str | None = None
    generations_used: int = 0
    generations_limit: int = 30

    class Settings:
        name = "users"
