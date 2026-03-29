"""Webhook endpoints for external service integrations (Stripe, GitHub)."""

import hashlib
import hmac

import structlog
from fastapi import APIRouter, HTTPException, Header, Request, status

from app.config import get_settings
from app.services.billing_service import BillingService

logger = structlog.get_logger()

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str | None = Header(None, alias="stripe-signature"),
) -> dict:
    """Handle Stripe webhook events.

    Validates the webhook signature, then processes subscription lifecycle
    events (checkout completed, subscription updated/deleted, payment failed).
    """
    settings = get_settings()
    body = await request.body()

    # Verify Stripe signature
    if not stripe_signature or not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Stripe signature or webhook secret not configured",
        )

    # Validate signature (simplified - in production use stripe.Webhook.construct_event)
    if not _verify_stripe_signature(body, stripe_signature, settings.STRIPE_WEBHOOK_SECRET):
        logger.warning("stripe_webhook_invalid_signature")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature",
        )

    import json
    try:
        event = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload",
        )

    billing = BillingService()
    result = await billing.handle_webhook_event(event)

    logger.info("stripe_webhook_processed", event_type=event.get("type"), result=result)
    return {"received": True, "result": result}


def _verify_stripe_signature(payload: bytes, signature: str, secret: str) -> bool:
    """Verify Stripe webhook signature using HMAC-SHA256.

    Stripe signatures contain a timestamp and one or more signatures in
    the format: t=timestamp,v1=signature
    """
    try:
        elements = dict(item.split("=", 1) for item in signature.split(","))
        timestamp = elements.get("t", "")
        sig = elements.get("v1", "")

        if not timestamp or not sig:
            return False

        signed_payload = f"{timestamp}.".encode() + payload
        expected = hmac.new(
            secret.encode(),
            signed_payload,
            hashlib.sha256,
        ).hexdigest()

        return hmac.compare_digest(expected, sig)
    except Exception:
        return False
