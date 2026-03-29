import structlog
from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_current_user
from app.models.project import Project
from app.models.spec import Spec
from app.models.spec_version import SpecVersion
from app.models.user import User
from app.schemas.spec import SpecCreate, SpecResponse, SpecUpdate, SpecVersionResponse

logger = structlog.get_logger()
router = APIRouter(prefix="/projects/{project_id}/specs", tags=["specs"])


async def _get_user_project(project_id: str, user: User) -> Project:
    project = await Project.find_one(
        Project.id == project_id, Project.owner_id == user.id
    )
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.get("/", response_model=list[SpecResponse])
async def list_specs(
    project_id: str,
    user: User = Depends(get_current_user),
) -> list[Spec]:
    await _get_user_project(project_id, user)
    specs = (
        await Spec.find(Spec.project_id == project_id)
        .sort(-Spec.created_at)
        .to_list()
    )
    return specs


@router.post("/", response_model=SpecResponse, status_code=status.HTTP_201_CREATED)
async def create_spec(
    project_id: str,
    data: SpecCreate,
    user: User = Depends(get_current_user),
) -> Spec:
    await _get_user_project(project_id, user)

    spec = Spec(
        project_id=project_id,
        title=data.title,
        content_json=data.content_json,
        parent_spec_id=data.parent_spec_id,
    )
    await spec.insert()

    version = SpecVersion(
        spec_id=spec.id,
        version_number=1,
        content_json=data.content_json,
        created_by=user.id,
    )
    await version.insert()

    logger.info("spec_created", spec_id=str(spec.id), project_id=project_id)
    return spec


@router.get("/{spec_id}", response_model=SpecResponse)
async def get_spec(
    project_id: str,
    spec_id: str,
    user: User = Depends(get_current_user),
) -> Spec:
    await _get_user_project(project_id, user)
    spec = await Spec.find_one(Spec.id == spec_id, Spec.project_id == project_id)
    if spec is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Spec not found")
    return spec


@router.patch("/{spec_id}", response_model=SpecResponse)
async def update_spec(
    project_id: str,
    spec_id: str,
    data: SpecUpdate,
    user: User = Depends(get_current_user),
) -> Spec:
    await _get_user_project(project_id, user)
    spec = await Spec.find_one(Spec.id == spec_id, Spec.project_id == project_id)
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
        await version.insert()

    for field, value in update_data.items():
        setattr(spec, field, value)

    await spec.save()
    return spec


@router.get("/{spec_id}/versions", response_model=list[SpecVersionResponse])
async def list_spec_versions(
    project_id: str,
    spec_id: str,
    user: User = Depends(get_current_user),
) -> list[SpecVersion]:
    await _get_user_project(project_id, user)
    versions = (
        await SpecVersion.find(SpecVersion.spec_id == spec_id)
        .sort(-SpecVersion.version_number)
        .to_list()
    )
    return versions
