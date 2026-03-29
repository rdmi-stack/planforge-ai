import uuid

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Task(Base):
    __tablename__ = "tasks"

    feature_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("features.id"), nullable=True)
    project_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("projects.id"))
    title: Mapped[str] = mapped_column(String(300))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    prompt_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    acceptance_criteria_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="todo")
    sequence_order: Mapped[int] = mapped_column(Integer, default=0)
    regression_risk: Mapped[str | None] = mapped_column(String(50), nullable=True)
    estimated_minutes: Mapped[float | None] = mapped_column(Float, nullable=True)
    agent_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    agent_run_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("agent_runs.id"), nullable=True)

    feature: Mapped["Feature | None"] = relationship(back_populates="tasks")
    project: Mapped["Project"] = relationship(back_populates="tasks")
    agent_run: Mapped["AgentRun | None"] = relationship(back_populates="task")
