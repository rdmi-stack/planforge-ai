from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AgentDispatch(BaseModel):
    agent_type: str = Field(..., min_length=1, max_length=100)
    config: dict | None = None


class AgentRunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    task_id: str | None
    agent_type: str
    status: str
    started_at: datetime | None
    completed_at: datetime | None
    output_log: str | None
    validation_result: dict | None
    retry_count: int
    created_at: datetime
    updated_at: datetime
