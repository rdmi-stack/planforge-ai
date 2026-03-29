import uuid

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class DecisionLog(Base):
    __tablename__ = "decision_log"

    project_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("projects.id"))
    decision: Mapped[str] = mapped_column(Text)
    reasoning: Mapped[str | None] = mapped_column(Text, nullable=True)
    alternatives_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    made_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))

    project: Mapped["Project"] = relationship(back_populates="decision_logs")
    author: Mapped["User"] = relationship()
