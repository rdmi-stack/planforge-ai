"""Redis-based rate limiting for API endpoints."""

from datetime import UTC, datetime

import structlog
from fastapi import HTTPException, Request, status
from redis.asyncio import Redis

from app.config import get_settings

logger = structlog.get_logger()


class RateLimiter:
    """Sliding window rate limiter backed by Redis sorted sets."""

    def __init__(self, redis: Redis) -> None:
        self.redis = redis

    async def check_rate_limit(
        self,
        key: str,
        max_requests: int,
        window_seconds: int = 60,
    ) -> tuple[bool, int]:
        """Check if a request is within rate limits.

        Returns:
            Tuple of (allowed: bool, remaining: int).
        """
        now = datetime.now(UTC).timestamp()
        window_start = now - window_seconds
        pipe = self.redis.pipeline()

        # Remove expired entries
        pipe.zremrangebyscore(key, 0, window_start)
        # Add current request
        pipe.zadd(key, {str(now): now})
        # Count requests in window
        pipe.zcard(key)
        # Set expiry on the key
        pipe.expire(key, window_seconds)

        results = await pipe.execute()
        request_count = results[2]
        remaining = max(0, max_requests - request_count)
        allowed = request_count <= max_requests

        if not allowed:
            logger.warning("rate_limit_exceeded", key=key, count=request_count, limit=max_requests)

        return allowed, remaining


async def get_rate_limiter() -> RateLimiter:
    """FastAPI dependency that provides a RateLimiter instance."""
    settings = get_settings()
    redis = Redis.from_url(settings.REDIS_URL, decode_responses=True)
    try:
        yield RateLimiter(redis)  # type: ignore[misc]
    finally:
        await redis.aclose()


def rate_limit(max_requests: int = 60, window_seconds: int = 60):
    """Decorator-style dependency for rate limiting routes.

    Usage:
        @router.post("/", dependencies=[Depends(rate_limit(20, 60))])
        async def my_endpoint(): ...
    """

    async def _rate_limit_dependency(request: Request) -> None:
        settings = get_settings()
        redis = Redis.from_url(settings.REDIS_URL, decode_responses=True)
        try:
            limiter = RateLimiter(redis)
            # Build key from client IP + path
            client_ip = request.client.host if request.client else "unknown"
            key = f"rate_limit:{client_ip}:{request.url.path}"

            allowed, remaining = await limiter.check_rate_limit(key, max_requests, window_seconds)
            if not allowed:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded. Please try again later.",
                )
        finally:
            await redis.aclose()

    return _rate_limit_dependency
