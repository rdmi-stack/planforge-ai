from datetime import datetime, timedelta, timezone

import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError, jwt
from app.config import get_settings
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import (
    ForgotPasswordRequest,
    MessageResponse,
    ResetPasswordRequest,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
    VerifyEmailRequest,
)
from app.utils.security import hash_password, verify_password

logger = structlog.get_logger()
router = APIRouter(prefix="/auth", tags=["auth"])


def create_access_token(user_id: str, expires_minutes: int) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    payload = {"sub": user_id, "exp": expire, "type": "access"}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(user_id: str, expires_days: int) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(days=expires_days)
    payload = {"sub": user_id, "exp": expire, "type": "refresh"}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_reset_token(user_id: str) -> str:
    """Create a JWT token for password reset (expires in 1 hour)."""
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(hours=1)
    payload = {"sub": user_id, "exp": expire, "type": "reset"}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_verification_token(user_id: str) -> str:
    """Create a JWT token for email verification (expires in 24 hours)."""
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    payload = {"sub": user_id, "exp": expire, "type": "verify"}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate) -> User:
    existing = await User.find_one(User.email == data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    user = User(
        email=data.email,
        name=data.name,
        password_hash=hash_password(data.password),
        email_verified=False,
    )
    await user.insert()
    logger.info("user_registered", user_id=str(user.id), email=user.email)

    try:
        from app.services.email_service import EmailService
        settings = get_settings()
        email_svc = EmailService()

        # Send welcome email
        await email_svc.send_welcome_email(to=user.email, name=user.name)

        # Send verification email
        verify_token = create_verification_token(str(user.id))
        verify_url = f"{settings.FRONTEND_URL}/verify-email?token={verify_token}"
        await email_svc.send_verification_email(
            to=user.email, name=user.name, verify_url=verify_url
        )
    except Exception:
        logger.warning("registration_email_failed", email=user.email)

    return user


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin) -> dict[str, str]:
    user = await User.find_one(User.email == data.email)

    if user is None or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    settings = get_settings()
    access_token = create_access_token(str(user.id), settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token = create_refresh_token(str(user.id), settings.REFRESH_TOKEN_EXPIRE_DAYS)

    logger.info("user_logged_in", user_id=str(user.id))
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_token: str,
) -> dict[str, str]:
    settings = get_settings()
    try:
        payload = jwt.decode(refresh_token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
            )
        user_id = payload.get("sub")
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        ) from exc

    user = await User.find_one(User.id == user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    new_access = create_access_token(str(user.id), settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    new_refresh = create_refresh_token(str(user.id), settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return {
        "access_token": new_access,
        "refresh_token": new_refresh,
        "token_type": "bearer",
    }


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(data: ForgotPasswordRequest) -> dict[str, str]:
    """Request a password reset email.

    Always returns a success message to prevent email enumeration.
    """
    user = await User.find_one(User.email == data.email)

    if user is not None:
        try:
            from app.services.email_service import EmailService
            settings = get_settings()
            email_svc = EmailService()

            reset_token = create_reset_token(str(user.id))
            reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
            await email_svc.send_password_reset_email(
                to=user.email, name=user.name, reset_url=reset_url
            )
            logger.info("password_reset_email_sent", user_id=str(user.id))
        except Exception:
            logger.warning("password_reset_email_failed", email=data.email)

    return {"message": "If an account exists, a reset email has been sent"}


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(data: ResetPasswordRequest) -> dict[str, str]:
    """Reset a user's password using a valid reset token."""
    settings = get_settings()
    try:
        payload = jwt.decode(
            data.token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        if payload.get("type") != "reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token type",
            )
        user_id = payload.get("sub")
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        ) from exc

    user = await User.find_one(User.id == user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user.password_hash = hash_password(data.new_password)
    await user.save()

    logger.info("password_reset_completed", user_id=str(user.id))
    return {"message": "Password updated successfully"}


@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(data: VerifyEmailRequest) -> dict[str, str]:
    """Verify a user's email address using a verification token."""
    settings = get_settings()
    try:
        payload = jwt.decode(
            data.token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        if payload.get("type") != "verify":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token type",
            )
        user_id = payload.get("sub")
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        ) from exc

    user = await User.find_one(User.id == user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user.email_verified = True
    await user.save()

    logger.info("email_verified", user_id=str(user.id))
    return {"message": "Email verified"}


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)) -> User:
    return user
