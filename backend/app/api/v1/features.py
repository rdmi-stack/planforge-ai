import structlog
from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_current_user
from app.models.feature import Feature
from app.models.project import Project
from app.models.user import User
from app.schemas.feature import FeatureCreate, FeatureResponse, FeatureUpdate

logger = structlog.get_logger()
router = APIRouter(prefix="/projects/{project_id}/features", tags=["features"])


async def _get_user_project(project_id: str, user: User) -> Project:
    project = await Project.find_one(
        Project.id == project_id, Project.owner_id == user.id
    )
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.get("/", response_model=list[FeatureResponse])
async def list_features(
    project_id: str,
    user: User = Depends(get_current_user),
) -> list[Feature]:
    await _get_user_project(project_id, user)
    features = (
        await Feature.find(Feature.project_id == project_id)
        .sort(+Feature.sort_order)
        .to_list()
    )
    return features


@router.post("/", response_model=FeatureResponse, status_code=status.HTTP_201_CREATED)
async def create_feature(
    project_id: str,
    data: FeatureCreate,
    user: User = Depends(get_current_user),
) -> Feature:
    await _get_user_project(project_id, user)

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
    await feature.insert()
    logger.info("feature_created", feature_id=str(feature.id), project_id=project_id)
    return feature


@router.patch("/{feature_id}", response_model=FeatureResponse)
async def update_feature(
    project_id: str,
    feature_id: str,
    data: FeatureUpdate,
    user: User = Depends(get_current_user),
) -> Feature:
    await _get_user_project(project_id, user)
    feature = await Feature.find_one(
        Feature.id == feature_id, Feature.project_id == project_id
    )
    if feature is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feature not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(feature, field, value)

    await feature.save()
    return feature


@router.delete("/{feature_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_feature(
    project_id: str,
    feature_id: str,
    user: User = Depends(get_current_user),
) -> None:
    await _get_user_project(project_id, user)
    feature = await Feature.find_one(
        Feature.id == feature_id, Feature.project_id == project_id
    )
    if feature is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feature not found")
    await feature.delete()
