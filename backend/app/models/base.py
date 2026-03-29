"""Timestamp mixin for Beanie document models."""

from datetime import UTC, datetime

from pydantic import Field


class TimestampMixin:
    """Mixin that adds created_at and updated_at fields to Beanie documents."""

    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
