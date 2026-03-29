"""Mock Stripe billing system endpoints."""

import uuid
from datetime import datetime, timedelta

import structlog
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

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


# In-memory mock store (would be replaced by real DB queries)
_mock_subscriptions: dict[str, dict] = {}


def _get_generations_limit(plan: str) -> int:
    limits = {"free": 30, "pro": 500, "team": -1}
    return limits.get(plan, 30)


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout_session(data: CheckoutRequest) -> CheckoutResponse:
    """Create a mock Stripe checkout session."""
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

    session_id = f"mock_sess_{uuid.uuid4().hex[:12]}"
    logger.info("billing_checkout_created", plan=data.plan, billing=data.billing, session_id=session_id)

    return CheckoutResponse(
        url=f"/billing?success=true&plan={data.plan}",
        session_id=session_id,
    )


@router.post("/portal", response_model=PortalResponse)
async def create_portal_session() -> PortalResponse:
    """Return a mock Stripe customer portal URL."""
    return PortalResponse(url="/billing")


@router.post("/webhook")
async def handle_billing_webhook(event: WebhookEvent) -> dict:
    """Mock webhook that updates user plan."""
    if event.type == "checkout.session.completed" and event.plan:
        _mock_subscriptions[event.user_id] = {
            "plan": event.plan,
            "status": "active",
            "current_period_end": (datetime.utcnow() + timedelta(days=30)).isoformat(),
            "generations_used": 0,
            "generations_limit": _get_generations_limit(event.plan),
        }
        logger.info("billing_webhook_plan_updated", user_id=event.user_id, plan=event.plan)
    elif event.type == "customer.subscription.deleted":
        if event.user_id in _mock_subscriptions:
            _mock_subscriptions[event.user_id]["status"] = "canceled"
            _mock_subscriptions[event.user_id]["plan"] = "free"
            _mock_subscriptions[event.user_id]["generations_limit"] = 30
            logger.info("billing_webhook_subscription_canceled", user_id=event.user_id)

    return {"received": True}


@router.get("/subscription", response_model=SubscriptionResponse)
async def get_subscription() -> SubscriptionResponse:
    """Return current user's plan details (mock: returns default pro plan)."""
    # In a real app this would look up the authenticated user's subscription.
    # For the mock, return a sensible default.
    return SubscriptionResponse(
        plan="pro",
        status="active",
        current_period_end=(datetime.utcnow() + timedelta(days=15)).isoformat(),
        generations_used=312,
        generations_limit=500,
    )


@router.post("/cancel", response_model=CancelResponse)
async def cancel_subscription() -> CancelResponse:
    """Mock cancel subscription."""
    logger.info("billing_subscription_canceled_mock")
    return CancelResponse(
        status="canceled",
        message="Your subscription has been canceled. You will retain access until the end of the current billing period.",
    )
