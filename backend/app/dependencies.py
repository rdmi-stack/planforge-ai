import structlog
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.config import get_settings
from app.models.user import User

logger = structlog.get_logger()
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> User:
    settings = get_settings()
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
            )
    except JWTError as exc:
        logger.warning("jwt_decode_failed", error=str(exc))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        ) from exc

    user = await User.find_one(User.id == user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


async def rate_limiter(request: Request) -> None:
    """Rate limiting dependency using Redis.

    Checks the client IP against Redis counters and raises 429
    if the limit is exceeded. Skips enforcement when Redis is
    unavailable to avoid blocking requests.
    """
    import redis.asyncio as aioredis

    settings = get_settings()

    try:
        redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        client_ip = request.client.host if request.client else "unknown"
        key = f"rate_limit:{client_ip}:{request.url.path}"

        current = await redis_client.get(key)
        if current is not None and int(current) >= settings.RATE_LIMIT_FREE:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again later.",
            )

        pipe = redis_client.pipeline()
        pipe.incr(key)
        pipe.expire(key, 60)
        await pipe.execute()
        await redis_client.aclose()
    except HTTPException:
        raise
    except Exception:
        logger.warning("rate_limiter_unavailable", path=request.url.path)
