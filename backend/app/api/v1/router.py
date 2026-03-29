"""Aggregates all v1 API route modules into a single router."""

from fastapi import APIRouter

from app.api.v1.agents import router as agents_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.architecture import router as architecture_router
from app.api.v1.auth import router as auth_router
from app.api.v1.chat import router as chat_router
from app.api.v1.features import router as features_router
from app.api.v1.projects import router as projects_router
from app.api.v1.specs import router as specs_router
from app.api.v1.tasks import router as tasks_router
from app.api.v1.templates import router as templates_router
from app.api.v1.users import router as users_router
from app.api.v1.webhooks import router as webhooks_router

v1_router = APIRouter()

v1_router.include_router(auth_router)
v1_router.include_router(users_router)
v1_router.include_router(projects_router)
v1_router.include_router(specs_router)
v1_router.include_router(features_router)
v1_router.include_router(tasks_router)
v1_router.include_router(agents_router)
v1_router.include_router(chat_router)
v1_router.include_router(architecture_router)
v1_router.include_router(templates_router)
v1_router.include_router(analytics_router)
v1_router.include_router(webhooks_router)
