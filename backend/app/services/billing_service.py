"""Stripe billing integration service."""

from uuid import UUID

import httpx
import structlog

from app.config import get_settings

logger = structlog.get_logger()


# Plan tier token limits (monthly)
PLAN_LIMITS = {
    "free": 50_000,
    "pro": 500_000,
    "team": 2_000_000,
    "enterprise": 10_000_000,
}


class BillingService:
    """Manages Stripe subscriptions, checkout, and webhook processing.

    Handles plan upgrades/downgrades, usage-based billing calculations,
    and Stripe webhook event processing for subscription lifecycle events.
    """

    def __init__(self) -> None:
        self.settings = get_settings()
        self._stripe_base = "https://api.stripe.com/v1"

    @property
    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.settings.STRIPE_SECRET_KEY}",
            "Content-Type": "application/x-www-form-urlencoded",
        }

    async def create_checkout_session(
        self,
        customer_email: str,
        price_id: str,
        success_url: str,
        cancel_url: str,
        org_id: UUID | None = None,
    ) -> dict:
        """Create a Stripe Checkout session for subscription signup."""
        async with httpx.AsyncClient() as client:
            data = {
                "mode": "subscription",
                "customer_email": customer_email,
                "success_url": success_url,
                "cancel_url": cancel_url,
                "line_items[0][price]": price_id,
                "line_items[0][quantity]": "1",
            }
            if org_id:
                data["metadata[org_id]"] = str(org_id)

            response = await client.post(
                f"{self._stripe_base}/checkout/sessions",
                headers=self._headers,
                data=data,
            )
            response.raise_for_status()

            session = response.json()
            logger.info(
                "checkout_session_created",
                session_id=session["id"],
                customer_email=customer_email,
            )
            return {"checkout_url": session["url"], "session_id": session["id"]}

    async def create_portal_session(
        self,
        customer_id: str,
        return_url: str,
    ) -> dict:
        """Create a Stripe Customer Portal session for managing subscriptions."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self._stripe_base}/billing_portal/sessions",
                headers=self._headers,
                data={
                    "customer": customer_id,
                    "return_url": return_url,
                },
            )
            response.raise_for_status()
            session = response.json()
            return {"portal_url": session["url"]}

    async def get_subscription(self, subscription_id: str) -> dict:
        """Retrieve a Stripe subscription by ID."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self._stripe_base}/subscriptions/{subscription_id}",
                headers=self._headers,
            )
            response.raise_for_status()
            return response.json()

    async def cancel_subscription(self, subscription_id: str) -> dict:
        """Cancel a subscription at period end."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self._stripe_base}/subscriptions/{subscription_id}",
                headers=self._headers,
                data={"cancel_at_period_end": "true"},
            )
            response.raise_for_status()
            result = response.json()
            logger.info("subscription_cancelled", subscription_id=subscription_id)
            return result

    async def handle_webhook_event(self, event: dict) -> dict:
        """Process a Stripe webhook event.

        Handles subscription creation, updates, cancellation, and payment events.
        Returns a summary of actions taken.
        """
        event_type = event.get("type", "")
        data = event.get("data", {}).get("object", {})

        handlers = {
            "checkout.session.completed": self._handle_checkout_completed,
            "customer.subscription.updated": self._handle_subscription_updated,
            "customer.subscription.deleted": self._handle_subscription_deleted,
            "invoice.payment_failed": self._handle_payment_failed,
        }

        handler = handlers.get(event_type)
        if handler:
            result = await handler(data)
            logger.info("webhook_processed", event_type=event_type, result=result)
            return result

        logger.info("webhook_unhandled", event_type=event_type)
        return {"action": "ignored", "event_type": event_type}

    async def _handle_checkout_completed(self, data: dict) -> dict:
        """Process completed checkout: activate subscription for the org."""
        customer_id = data.get("customer")
        subscription_id = data.get("subscription")
        org_id = data.get("metadata", {}).get("org_id")

        logger.info(
            "checkout_completed",
            customer_id=customer_id,
            subscription_id=subscription_id,
            org_id=org_id,
        )
        return {
            "action": "subscription_activated",
            "customer_id": customer_id,
            "subscription_id": subscription_id,
            "org_id": org_id,
        }

    async def _handle_subscription_updated(self, data: dict) -> dict:
        """Process subscription plan change."""
        subscription_id = data.get("id")
        status = data.get("status")
        logger.info("subscription_updated", subscription_id=subscription_id, status=status)
        return {"action": "subscription_updated", "subscription_id": subscription_id, "status": status}

    async def _handle_subscription_deleted(self, data: dict) -> dict:
        """Process subscription cancellation."""
        subscription_id = data.get("id")
        logger.info("subscription_deleted", subscription_id=subscription_id)
        return {"action": "subscription_deleted", "subscription_id": subscription_id}

    async def _handle_payment_failed(self, data: dict) -> dict:
        """Process failed payment."""
        customer_id = data.get("customer")
        logger.warning("payment_failed", customer_id=customer_id)
        return {"action": "payment_failed", "customer_id": customer_id}

    @staticmethod
    def get_token_limit(plan: str) -> int:
        """Get the monthly token limit for a plan tier."""
        return PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
