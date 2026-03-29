from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SpecCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    content_json: dict | None = None
    parent_spec_id: UUID | None = None


class SpecUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=300)
    content_json: dict | None = None
    status: str | None = None


class SpecResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    project_id: UUID
    title: str
    content_json: dict | None
    status: str
    version: int
    parent_spec_id: UUID | None
    created_at: datetime
    updated_at: datetime


class SpecVersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    spec_id: UUID
    version_number: int
    content_json: dict | None
    diff_json: dict | None
    created_by: UUID
    created_at: datetime
