"""Token usage tracking per user and organization for billing and quotas."""

from datetime import UTC, datetime
from uuid import UUID

import structlog
from redis.asyncio import Redis

from app.config import get_settings

logger = structlog.get_logger()


class TokenTracker:
    """Tracks AI token usage in Redis for rate limiting and billing.

    Stores daily and monthly counters per user and org, enabling
    quota enforcement and usage-based billing calculations.
    """

    def __init__(self, redis: Redis) -> None:
        self._redis = redis

    def _daily_key(self, entity_type: str, entity_id: UUID) -> str:
        today = datetime.now(UTC).strftime("%Y-%m-%d")
        return f"tokens:{entity_type}:{entity_id}:{today}"

    def _monthly_key(self, entity_type: str, entity_id: UUID) -> str:
        month = datetime.now(UTC).strftime("%Y-%m")
        return f"tokens:{entity_type}:{entity_id}:{month}"

    async def record_usage(
        self,
        user_id: UUID,
        org_id: UUID | None,
        input_tokens: int,
        output_tokens: int,
        model: str,
    ) -> None:
        """Record token usage for a user (and their org if applicable).

        Increments daily and monthly counters in Redis with auto-expiry.
        """
        total = input_tokens + output_tokens
        pipe = self._redis.pipeline()

        # User daily counter
        user_daily = self._daily_key("user", user_id)
        pipe.incrby(user_daily, total)
        pipe.expire(user_daily, 86400 * 2)  # 2-day TTL

        # User monthly counter
        user_monthly = self._monthly_key("user", user_id)
        pipe.incrby(user_monthly, total)
        pipe.expire(user_monthly, 86400 * 35)  # 35-day TTL

        # Org counters
        if org_id:
            org_daily = self._daily_key("org", org_id)
            pipe.incrby(org_daily, total)
            pipe.expire(org_daily, 86400 * 2)

            org_monthly = self._monthly_key("org", org_id)
            pipe.incrby(org_monthly, total)
            pipe.expire(org_monthly, 86400 * 35)

        await pipe.execute()

        logger.info(
            "token_usage_recorded",
            user_id=str(user_id),
            org_id=str(org_id) if org_id else None,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            model=model,
        )

    async def get_daily_usage(self, entity_type: str, entity_id: UUID) -> int:
        """Get today's total token usage for a user or org."""
        key = self._daily_key(entity_type, entity_id)
        value = await self._redis.get(key)
        return int(value) if value else 0

    async def get_monthly_usage(self, entity_type: str, entity_id: UUID) -> int:
        """Get this month's total token usage for a user or org."""
        key = self._monthly_key(entity_type, entity_id)
        value = await self._redis.get(key)
        return int(value) if value else 0

    async def check_quota(
        self,
        user_id: UUID,
        monthly_limit: int,
    ) -> tuple[bool, int]:
        """Check if a user is within their monthly token quota.

        Returns:
            Tuple of (within_quota: bool, remaining_tokens: int).
        """
        used = await self.get_monthly_usage("user", user_id)
        remaining = max(0, monthly_limit - used)
        within_quota = used < monthly_limit

        if not within_quota:
            logger.warning(
                "token_quota_exceeded",
                user_id=str(user_id),
                used=used,
                limit=monthly_limit,
            )

        return within_quota, remaining
