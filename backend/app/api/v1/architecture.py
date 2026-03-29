"""Architecture generation and retrieval endpoints."""

from uuid import UUID

import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user, get_db
from app.models.project import Project
from app.models.user import User
from app.services.architecture_engine import ArchitectureEngine
from app.services.codebase_analyzer import CodebaseAnalyzer
from app.services.production_checker import ProductionChecker

logger = structlog.get_logger()

router = APIRouter(prefix="/projects/{project_id}", tags=["architecture"])


async def _get_user_project(
    project_id: str,
    user: User,
    db: AsyncSession,
) -> Project:
    """Fetch a project ensuring it belongs to the current user."""
    from sqlalchemy import select

    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.owner_id == user.id)
    )
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.post("/architecture/generate")
async def generate_architecture(
    project_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Generate a comprehensive technical architecture for a project.

    Produces system design, database schema, API contracts, infrastructure
    recommendations, and security considerations based on the project's
    spec and features.
    """
    await _get_user_project(project_id, user, db)

    # Optionally gather codebase context
    analyzer = CodebaseAnalyzer(db)
    codebase_context = await analyzer.get_codebase_context_summary(UUID(project_id))
    await analyzer.close()

    engine = ArchitectureEngine(db)
    architecture = await engine.generate_architecture(
        project_id=UUID(project_id),
        codebase_context=codebase_context or None,
    )

    logger.info("architecture_generated", project_id=project_id)
    return {"data": architecture}


@router.get("/architecture")
async def get_architecture(
    project_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Retrieve the latest architecture document for a project.

    Returns the previously generated architecture or an empty result
    if no architecture has been generated yet.
    """
    await _get_user_project(project_id, user, db)

    # For now, architecture is regenerated on demand
    # In production, this would fetch from a stored architecture record
    engine = ArchitectureEngine(db)
    try:
        architecture = await engine.generate_architecture(project_id=UUID(project_id))
        return {"data": architecture}
    except ValueError:
        return {"data": None, "message": "No architecture generated yet"}


@router.post("/production-check")
async def run_production_check(
    project_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Run a production readiness audit on a project.

    Evaluates the project across security, reliability, performance,
    observability, operations, and scalability dimensions. Returns
    scored assessments with concrete action items.
    """
    await _get_user_project(project_id, user, db)

    checker = ProductionChecker(db)
    result = await checker.run_audit(project_id=UUID(project_id))

    logger.info(
        "production_check_complete",
        project_id=project_id,
        overall_score=result.overall_score,
    )
    return {"data": result.model_dump()}
