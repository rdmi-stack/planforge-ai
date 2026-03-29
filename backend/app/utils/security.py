"""JWT token creation/verification and password hashing utilities."""

from datetime import UTC, datetime, timedelta

import bcrypt
import structlog
from jose import JWTError, jwt

from app.config import get_settings

logger = structlog.get_logger()

ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(
    user_id: str,
    email: str,
    org_id: str | None = None,
    expires_delta: timedelta | None = None,
) -> str:
    """Create a short-lived JWT access token (default 15 minutes)."""
    settings = get_settings()
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    now = datetime.now(UTC)
    payload = {
        "sub": str(user_id),
        "email": email,
        "org_id": str(org_id) if org_id else None,
        "type": "access",
        "iat": now,
        "exp": now + expires_delta,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=ALGORITHM)


def create_refresh_token(
    user_id: str,
    expires_delta: timedelta | None = None,
) -> str:
    """Create a long-lived JWT refresh token (default 7 days)."""
    settings = get_settings()
    if expires_delta is None:
        expires_delta = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    now = datetime.now(UTC)
    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "iat": now,
        "exp": now + expires_delta,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and verify a JWT token. Raises JWTError on failure."""
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        logger.warning("jwt_decode_failed", error=str(e))
        raise


def decode_access_token(token: str) -> dict:
    """Decode an access token and validate its type claim."""
    payload = decode_token(token)
    if payload.get("type") != "access":
        raise JWTError("Invalid token type: expected access token")
    return payload


def decode_refresh_token(token: str) -> dict:
    """Decode a refresh token and validate its type claim."""
    payload = decode_token(token)
    if payload.get("type") != "refresh":
        raise JWTError("Invalid token type: expected refresh token")
    return payload
