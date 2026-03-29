import uuid

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Feature(Base):
    __tablename__ = "features"

    project_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("projects.id"))
    spec_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("specs.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(300))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    priority_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    effort_estimate: Mapped[str | None] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="backlog")
    parent_feature_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("features.id"), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    mvp_classification: Mapped[str | None] = mapped_column(String(50), nullable=True)

    project: Mapped["Project"] = relationship(back_populates="features")
    spec: Mapped["Spec | None"] = relationship(back_populates="features")
    parent_feature: Mapped["Feature | None"] = relationship(remote_side="Feature.id")
    tasks: Mapped[list["Task"]] = relationship(back_populates="feature", cascade="all, delete-orphan")
    dependencies: Mapped[list["FeatureDependency"]] = relationship(
        foreign_keys="FeatureDependency.feature_id",
        back_populates="feature",
        cascade="all, delete-orphan",
    )


class FeatureDependency(Base):
    __tablename__ = "feature_dependencies"

    feature_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("features.id"))
    depends_on_feature_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("features.id"))

    feature: Mapped["Feature"] = relationship(
        foreign_keys=[feature_id],
        back_populates="dependencies",
    )
    depends_on: Mapped["Feature"] = relationship(foreign_keys=[depends_on_feature_id])
