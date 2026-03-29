import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user, get_db
from app.models.feature import Feature
from app.models.project import Project
from app.models.user import User
from app.schemas.feature import FeatureCreate, FeatureResponse, FeatureUpdate

logger = structlog.get_logger()
router = APIRouter(prefix="/projects/{project_id}/features", tags=["features"])


async def _get_user_project(project_id: str, user: User, db: AsyncSession) -> Project:
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.owner_id == user.id)
    )
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.get("/", response_model=list[FeatureResponse])
async def list_features(
    project_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Feature]:
    await _get_user_project(project_id, user, db)
    result = await db.execute(
        select(Feature)
        .where(Feature.project_id == project_id)
        .order_by(Feature.sort_order)
    )
    return list(result.scalars().all())


@router.post("/", response_model=FeatureResponse, status_code=status.HTTP_201_CREATED)
async def create_feature(
    project_id: str,
    data: FeatureCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Feature:
    await _get_user_project(project_id, user, db)

    feature = Feature(
        project_id=project_id,
        spec_id=data.spec_id,
        title=data.title,
        description=data.description,
        parent_feature_id=data.parent_feature_id,
        priority_score=data.priority_score,
        effort_estimate=data.effort_estimate,
        mvp_classification=data.mvp_classification,
        sort_order=data.sort_order,
    )
    db.add(feature)
    await db.flush()
    await db.refresh(feature)
    logger.info("feature_created", feature_id=str(feature.id), project_id=project_id)
    return feature


@router.patch("/{feature_id}", response_model=FeatureResponse)
async def update_feature(
    project_id: str,
    feature_id: str,
    data: FeatureUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Feature:
    await _get_user_project(project_id, user, db)
    result = await db.execute(
        select(Feature).where(Feature.id == feature_id, Feature.project_id == project_id)
    )
    feature = result.scalar_one_or_none()
    if feature is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feature not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(feature, field, value)

    await db.flush()
    await db.refresh(feature)
    return feature


@router.delete("/{feature_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_feature(
    project_id: str,
    feature_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await _get_user_project(project_id, user, db)
    result = await db.execute(
        select(Feature).where(Feature.id == feature_id, Feature.project_id == project_id)
    )
    feature = result.scalar_one_or_none()
    if feature is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feature not found")
    await db.delete(feature)
