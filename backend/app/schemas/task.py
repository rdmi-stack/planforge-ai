from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    description: str | None = None
    feature_id: str | None = None
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

    id: str
    feature_id: str | None
    project_id: str
    title: str
    description: str | None
    prompt_text: str | None
    acceptance_criteria_json: dict | None
    status: str
    sequence_order: int
    regression_risk: str | None
    estimated_minutes: float | None
    agent_type: str | None
    agent_run_id: str | None
    created_at: datetime
    updated_at: datetime
