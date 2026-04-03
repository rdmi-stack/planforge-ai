"""Billing endpoints backed by the current user record.

These routes still operate in-app instead of redirecting to Stripe, but they
now return and persist real subscription state for the authenticated user
instead of serving hard-coded mock data.
"""

import uuid
from datetime import datetime, timedelta

import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.dependencies import get_current_user
from app.models.user import User

logger = structlog.get_logger()

router = APIRouter(prefix="/billing", tags=["billing"])


class CheckoutRequest(BaseModel):
    plan: str  # "pro" | "team"
    billing: str  # "monthly" | "yearly"


class CheckoutResponse(BaseModel):
    url: str
    session_id: str


class PortalResponse(BaseModel):
    url: str
    available: bool
    message: str


class SubscriptionResponse(BaseModel):
    plan: str
    status: str
    current_period_end: str | None
    generations_used: int
    generations_limit: int


class WebhookEvent(BaseModel):
    type: str
    user_id: str
    plan: str | None = None


class CancelResponse(BaseModel):
    status: str
    message: str


def _get_generations_limit(plan: str) -> int:
    limits = {"free": 30, "pro": 500, "team": -1}
    return limits.get(plan, 30)


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout_session(
    data: CheckoutRequest,
    user: User = Depends(get_current_user),
) -> CheckoutResponse:
    """Persist a selected plan for the current user.

    This keeps the in-product upgrade flow usable for demos and internal sales
    environments until a real Stripe checkout is connected.
    """
    if data.plan not in ("pro", "team"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan. Must be 'pro' or 'team'.",
        )
    if data.billing not in ("monthly", "yearly"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid billing period. Must be 'monthly' or 'yearly'.",
        )

    session_id = f"demo_sess_{uuid.uuid4().hex[:12]}"
    billing_days = 365 if data.billing == "yearly" else 30

    user.plan = data.plan
    user.subscription_status = "active"
    user.current_period_end = (datetime.utcnow() + timedelta(days=billing_days)).isoformat()
    user.generations_limit = _get_generations_limit(data.plan)
    await user.save()

    logger.info(
        "billing_checkout_created",
        user_id=user.id,
        plan=data.plan,
        billing=data.billing,
        session_id=session_id,
    )

    return CheckoutResponse(
        url=f"/billing?upgraded={data.plan}",
        session_id=session_id,
    )


@router.post("/portal", response_model=PortalResponse)
async def create_portal_session(
    user: User = Depends(get_current_user),
) -> PortalResponse:
    """Expose portal readiness honestly until Stripe is connected."""
    logger.info("billing_portal_requested", user_id=user.id)
    return PortalResponse(
        url="/billing",
        available=False,
        message="Customer billing portal is not configured yet.",
    )


@router.post("/webhook")
async def handle_billing_webhook(event: WebhookEvent) -> dict:
    """Placeholder webhook endpoint for future Stripe integration."""
    logger.info("billing_webhook_received", event_type=event.type, user_id=event.user_id, plan=event.plan)

    return {"received": True}


@router.get("/subscription", response_model=SubscriptionResponse)
async def get_subscription(
    user: User = Depends(get_current_user),
) -> SubscriptionResponse:
    """Return current user's persisted subscription details."""
    return SubscriptionResponse(
        plan=user.plan,
        status=user.subscription_status,
        current_period_end=user.current_period_end,
        generations_used=user.generations_used,
        generations_limit=user.generations_limit,
    )


@router.post("/cancel", response_model=CancelResponse)
async def cancel_subscription(
    user: User = Depends(get_current_user),
) -> CancelResponse:
    """Cancel auto-renewal for the current user."""
    user.subscription_status = "canceled"
    await user.save()
    logger.info("billing_subscription_canceled", user_id=user.id, plan=user.plan)
    return CancelResponse(
        status="canceled",
        message="Auto-renewal has been canceled. Your current plan remains active until the end of the billing period.",
    )
