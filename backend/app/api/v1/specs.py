import structlog
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user, get_db
from app.models.project import Project
from app.models.spec import Spec
from app.models.spec_version import SpecVersion
from app.models.user import User
from app.schemas.spec import SpecCreate, SpecResponse, SpecUpdate, SpecVersionResponse

logger = structlog.get_logger()
router = APIRouter(prefix="/projects/{project_id}/specs", tags=["specs"])


async def _get_user_project(
    project_id: str, user: User, db: AsyncSession
) -> Project:
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.owner_id == user.id)
    )
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.get("/", response_model=list[SpecResponse])
async def list_specs(
    project_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Spec]:
    await _get_user_project(project_id, user, db)
    result = await db.execute(
        select(Spec).where(Spec.project_id == project_id).order_by(Spec.created_at.desc())
    )
    return list(result.scalars().all())


@router.post("/", response_model=SpecResponse, status_code=status.HTTP_201_CREATED)
async def create_spec(
    project_id: str,
    data: SpecCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Spec:
    await _get_user_project(project_id, user, db)

    spec = Spec(
        project_id=project_id,
        title=data.title,
        content_json=data.content_json,
        parent_spec_id=data.parent_spec_id,
    )
    db.add(spec)
    await db.flush()
    await db.refresh(spec)

    version = SpecVersion(
        spec_id=spec.id,
        version_number=1,
        content_json=data.content_json,
        created_by=user.id,
    )
    db.add(version)
    await db.flush()

    logger.info("spec_created", spec_id=str(spec.id), project_id=project_id)
    return spec


@router.get("/{spec_id}", response_model=SpecResponse)
async def get_spec(
    project_id: str,
    spec_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Spec:
    await _get_user_project(project_id, user, db)
    result = await db.execute(
        select(Spec).where(Spec.id == spec_id, Spec.project_id == project_id)
    )
    spec = result.scalar_one_or_none()
    if spec is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Spec not found")
    return spec


@router.patch("/{spec_id}", response_model=SpecResponse)
async def update_spec(
    project_id: str,
    spec_id: str,
    data: SpecUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Spec:
    await _get_user_project(project_id, user, db)
    result = await db.execute(
        select(Spec).where(Spec.id == spec_id, Spec.project_id == project_id)
    )
    spec = result.scalar_one_or_none()
    if spec is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Spec not found")

    update_data = data.model_dump(exclude_unset=True)

    if "content_json" in update_data:
        spec.version += 1
        version = SpecVersion(
            spec_id=spec.id,
            version_number=spec.version,
            content_json=update_data["content_json"],
            diff_json={"previous_version": spec.version - 1},
            created_by=user.id,
        )
        db.add(version)

    for field, value in update_data.items():
        setattr(spec, field, value)

    await db.flush()
    await db.refresh(spec)
    return spec


@router.get("/{spec_id}/versions", response_model=list[SpecVersionResponse])
async def list_spec_versions(
    project_id: str,
    spec_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[SpecVersion]:
    await _get_user_project(project_id, user, db)
    result = await db.execute(
        select(SpecVersion)
        .where(SpecVersion.spec_id == spec_id)
        .order_by(SpecVersion.version_number.desc())
    )
    return list(result.scalars().all())
