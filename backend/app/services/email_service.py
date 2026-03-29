"""Mailgun email service for transactional emails."""

import httpx
import structlog

from app.config import get_settings

logger = structlog.get_logger()


class EmailService:
    """Send transactional emails via Mailgun API."""

    def __init__(self) -> None:
        settings = get_settings()
        self._api_key = settings.MAILGUN_API_KEY
        self._domain = settings.MAILGUN_DOMAIN
        self._from_email = settings.MAILGUN_FROM_EMAIL
        self._region = settings.MAILGUN_REGION

        self._base_url = (
            f"https://api.mailgun.net/v3/{self._domain}"
            if self._region == "US"
            else f"https://api.eu.mailgun.net/v3/{self._domain}"
        )

    async def send_email(
        self,
        to: str,
        subject: str,
        html: str,
        text: str | None = None,
    ) -> bool:
        """Send an email via Mailgun."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self._base_url}/messages",
                    auth=("api", self._api_key),
                    data={
                        "from": self._from_email,
                        "to": [to],
                        "subject": subject,
                        "html": html,
                        **({"text": text} if text else {}),
                    },
                )
                response.raise_for_status()
                logger.info("email_sent", to=to, subject=subject)
                return True
        except Exception as e:
            logger.error("email_send_failed", to=to, subject=subject, error=str(e))
            return False

    async def send_welcome_email(self, to: str, name: str) -> bool:
        """Send welcome email to new user."""
        subject = "Welcome to PlanForge AI"
        html = f"""
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="margin-bottom: 30px;">
                <strong style="font-size: 20px; color: #1A3A2A;">PlanForge</strong>
            </div>
            <h1 style="font-size: 24px; color: #0F1729; margin-bottom: 16px;">Welcome, {name}!</h1>
            <p style="color: #6B7280; line-height: 1.6; margin-bottom: 24px;">
                You're all set to start planning smarter with AI. PlanForge turns your ideas into
                structured specs, decomposes features into atomic tasks, and dispatches them to AI
                coding agents.
            </p>
            <a href="https://app.planforge.ai/projects"
               style="display: inline-block; background: #1A3A2A; color: white; padding: 12px 24px;
                      border-radius: 8px; text-decoration: none; font-weight: 600;">
                Create Your First Project
            </a>
            <p style="color: #9CA3AF; font-size: 12px; margin-top: 40px;">
                PlanForge AI, Inc. &mdash; From idea to production-ready code, autonomously.
            </p>
        </div>
        """
        return await self.send_email(to=to, subject=subject, html=html)

    async def send_password_reset_email(self, to: str, name: str, reset_url: str) -> bool:
        """Send password reset email."""
        subject = "Reset your PlanForge password"
        html = f"""
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="margin-bottom: 30px;">
                <strong style="font-size: 20px; color: #1A3A2A;">PlanForge</strong>
            </div>
            <h1 style="font-size: 24px; color: #0F1729; margin-bottom: 16px;">Reset your password</h1>
            <p style="color: #6B7280; line-height: 1.6; margin-bottom: 8px;">Hi {name},</p>
            <p style="color: #6B7280; line-height: 1.6; margin-bottom: 24px;">
                We received a request to reset your password. Click the button below to set a new one.
                This link expires in 1 hour.
            </p>
            <a href="{reset_url}"
               style="display: inline-block; background: #1A3A2A; color: white; padding: 12px 24px;
                      border-radius: 8px; text-decoration: none; font-weight: 600;">
                Reset Password
            </a>
            <p style="color: #9CA3AF; font-size: 12px; margin-top: 40px;">
                If you didn't request this, you can safely ignore this email.
            </p>
        </div>
        """
        return await self.send_email(to=to, subject=subject, html=html)

    async def send_verification_email(self, to: str, name: str, verify_url: str) -> bool:
        """Send email verification link to new user."""
        subject = "Verify your PlanForge email"
        html = f"""
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="margin-bottom: 30px;">
                <strong style="font-size: 20px; color: #1A3A2A;">PlanForge</strong>
            </div>
            <h1 style="font-size: 24px; color: #0F1729; margin-bottom: 16px;">Verify your email</h1>
            <p style="color: #6B7280; line-height: 1.6; margin-bottom: 8px;">Hi {name},</p>
            <p style="color: #6B7280; line-height: 1.6; margin-bottom: 24px;">
                Thanks for signing up for PlanForge AI! Please verify your email address by clicking
                the button below. This link expires in 24 hours.
            </p>
            <a href="{verify_url}"
               style="display: inline-block; background: #1A3A2A; color: white; padding: 12px 24px;
                      border-radius: 8px; text-decoration: none; font-weight: 600;">
                Verify Email
            </a>
            <p style="color: #9CA3AF; font-size: 12px; margin-top: 40px;">
                If you didn't create this account, you can safely ignore this email.
            </p>
        </div>
        """
        return await self.send_email(to=to, subject=subject, html=html)

    async def send_agent_completion_email(
        self, to: str, name: str, project_name: str, task_title: str, status: str
    ) -> bool:
        """Notify user when an agent completes a task."""
        subject = f"Agent completed: {task_title}"
        status_color = "#22C55E" if status == "completed" else "#EF4444"
        html = f"""
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="margin-bottom: 30px;">
                <strong style="font-size: 20px; color: #1A3A2A;">PlanForge</strong>
            </div>
            <h1 style="font-size: 24px; color: #0F1729; margin-bottom: 16px;">Agent Task Update</h1>
            <p style="color: #6B7280; line-height: 1.6;">Hi {name},</p>
            <div style="background: #FDFBF7; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <p style="font-size: 14px; color: #6B7280; margin: 0 0 4px 0;">Project: <strong style="color: #0F1729;">{project_name}</strong></p>
                <p style="font-size: 14px; color: #6B7280; margin: 0 0 4px 0;">Task: <strong style="color: #0F1729;">{task_title}</strong></p>
                <p style="font-size: 14px; margin: 0;">
                    Status: <strong style="color: {status_color};">{status.upper()}</strong>
                </p>
            </div>
            <a href="https://app.planforge.ai/projects"
               style="display: inline-block; background: #1A3A2A; color: white; padding: 12px 24px;
                      border-radius: 8px; text-decoration: none; font-weight: 600;">
                View Details
            </a>
        </div>
        """
        return await self.send_email(to=to, subject=subject, html=html)
