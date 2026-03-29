import uuid

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Project(Base):
    __tablename__ = "projects"

    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"))
    owner_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="active")
    github_repo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    tech_stack_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    organization: Mapped["Organization"] = relationship(back_populates="projects")
    owner: Mapped["User"] = relationship(back_populates="projects")
    specs: Mapped[list["Spec"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    features: Mapped[list["Feature"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    tasks: Mapped[list["Task"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    decision_logs: Mapped[list["DecisionLog"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    chat_sessions: Mapped[list["ChatSession"]] = relationship(back_populates="project", cascade="all, delete-orphan")
