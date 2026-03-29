"""Celery application configuration for background task processing."""

from celery import Celery

from app.config import get_settings

settings = get_settings()

celery_app = Celery(
    "planforge",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_soft_time_limit=300,  # 5 minutes soft limit
    task_time_limit=600,  # 10 minutes hard limit
    task_default_queue="planforge",
    task_routes={
        "app.workers.ai_tasks.*": {"queue": "ai"},
        "app.workers.agent_tasks.*": {"queue": "agents"},
        "app.workers.export_tasks.*": {"queue": "exports"},
        "app.workers.analytics_tasks.*": {"queue": "analytics"},
    },
)

celery_app.autodiscover_tasks([
    "app.workers.ai_tasks",
    "app.workers.agent_tasks",
    "app.workers.export_tasks",
    "app.workers.analytics_tasks",
])
