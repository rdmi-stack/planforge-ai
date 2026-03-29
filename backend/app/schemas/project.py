from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = None
    template_id: str | None = None
    github_repo_url: str | None = None
    tech_stack: list[str] = Field(default_factory=list)


class ProjectUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = None
    status: str | None = None
    github_repo_url: str | None = None
    tech_stack: list[str] | None = None


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    org_id: str
    owner_id: str
    name: str
    description: str | None
    status: str
    github_repo_url: str | None
    tech_stack: list[str]
    created_at: datetime
    updated_at: datetime


class ProjectList(BaseModel):
    data: list[ProjectResponse]
    meta: dict
