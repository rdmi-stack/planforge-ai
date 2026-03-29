from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    description: str | None = None
    feature_id: UUID | None = None
    prompt_text: str | None = None
    acceptance_criteria_json: dict | None = None
    sequence_order: int = 0
    regression_risk: str | None = None
    estimated_minutes: float | None = None
    agent_type: str | None = None


class TaskUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=300)
    description: str | None = None
    prompt_text: str | None = None
    acceptance_criteria_json: dict | None = None
    status: str | None = None
    sequence_order: int | None = None
    regression_risk: str | None = None
    estimated_minutes: float | None = None
    agent_type: str | None = None


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    feature_id: UUID | None
    project_id: UUID
    title: str
    description: str | None
    prompt_text: str | None
    acceptance_criteria_json: dict | None
    status: str
    sequence_order: int
    regression_risk: str | None
    estimated_minutes: float | None
    agent_type: str | None
    agent_run_id: UUID | None
    created_at: datetime
    updated_at: datetime
