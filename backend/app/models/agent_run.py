import uuid
from datetime import datetime

from sqlalchemy import Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class AgentRun(Base):
    __tablename__ = "agent_runs"

    task_id: Mapped[uuid.UUID | None] = mapped_column(nullable=True)
    agent_type: Mapped[str] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(50), default="pending")
    started_at: Mapped[datetime | None] = mapped_column(nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(nullable=True)
    output_log: Mapped[str | None] = mapped_column(Text, nullable=True)
    validation_result: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=0)

    task: Mapped["Task | None"] = relationship(back_populates="agent_run")
