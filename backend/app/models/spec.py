import uuid

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Spec(Base):
    __tablename__ = "specs"

    project_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("projects.id"))
    title: Mapped[str] = mapped_column(String(300))
    content_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="draft")
    version: Mapped[int] = mapped_column(Integer, default=1)
    parent_spec_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("specs.id"), nullable=True)

    project: Mapped["Project"] = relationship(back_populates="specs")
    parent_spec: Mapped["Spec | None"] = relationship(remote_side="Spec.id")
    versions: Mapped[list["SpecVersion"]] = relationship(back_populates="spec", cascade="all, delete-orphan")
    features: Mapped[list["Feature"]] = relationship(back_populates="spec")
