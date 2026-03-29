from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = None
    template_id: UUID | None = None
    github_repo_url: str | None = None
    tech_stack_json: dict | None = None


class ProjectUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = None
    status: str | None = None
    github_repo_url: str | None = None
    tech_stack_json: dict | None = None


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    org_id: UUID
    owner_id: UUID
    name: str
    description: str | None
    status: str
    github_repo_url: str | None
    tech_stack_json: dict | None
    created_at: datetime
    updated_at: datetime


class ProjectList(BaseModel):
    data: list[ProjectResponse]
    meta: dict
