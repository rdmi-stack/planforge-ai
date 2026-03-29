"""Celery tasks for export generation."""

import asyncio
from uuid import UUID

import structlog

from app.workers.celery_app import celery_app

logger = structlog.get_logger()


def _run_async(coro):
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(bind=True, name="exports.generate_export", max_retries=1)
def generate_export(self, project_id: str, format: str) -> dict:
    """Generate a project export in the specified format.

    Produces Markdown, JSON, MCP, or CLI script exports and returns
    the content and filename for download or storage.
    """
    logger.info("celery_export_start", project_id=project_id, format=format)

    async def _run():
        from app.database import async_session_factory
        from app.services.export_service import ExportService

        async with async_session_factory() as db:
            service = ExportService(db)
            result = await service.export_project(
                project_id=UUID(project_id),
                format=format,
            )
            return result

    try:
        result = _run_async(_run())
        logger.info(
            "celery_export_complete",
            project_id=project_id,
            format=format,
            filename=result.get("filename"),
        )
        return result
    except Exception as exc:
        logger.error("celery_export_failed", project_id=project_id, error=str(exc))
        raise self.retry(exc=exc, countdown=10)
