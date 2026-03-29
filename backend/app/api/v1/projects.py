import structlog
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies import get_current_user
from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectList, ProjectResponse, ProjectUpdate

logger = structlog.get_logger()
router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("/", response_model=ProjectList)
async def list_projects(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
) -> dict:
    total = await Project.find(Project.owner_id == user.id).count()

    offset = (page - 1) * per_page
    projects = (
        await Project.find(Project.owner_id == user.id)
        .sort(-Project.created_at)
        .skip(offset)
        .limit(per_page)
        .to_list()
    )

    total_pages = (total + per_page - 1) // per_page
    return {
        "data": projects,
        "meta": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "total_pages": total_pages,
        },
    }


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreate,
    user: User = Depends(get_current_user),
) -> Project:
    if user.org_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to an organization to create projects",
        )

    project = Project(
        org_id=user.org_id,
        owner_id=user.id,
        name=data.name,
        description=data.description,
        github_repo_url=data.github_repo_url,
        tech_stack_json=data.tech_stack_json,
    )
    await project.insert()
    logger.info("project_created", project_id=str(project.id), user_id=str(user.id))
    return project


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    user: User = Depends(get_current_user),
) -> Project:
    project = await Project.find_one(
        Project.id == project_id, Project.owner_id == user.id
    )
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    data: ProjectUpdate,
    user: User = Depends(get_current_user),
) -> Project:
    project = await Project.find_one(
        Project.id == project_id, Project.owner_id == user.id
    )
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    await project.save()
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    user: User = Depends(get_current_user),
) -> None:
    project = await Project.find_one(
        Project.id == project_id, Project.owner_id == user.id
    )
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    await project.delete()
    logger.info("project_deleted", project_id=project_id, user_id=str(user.id))
