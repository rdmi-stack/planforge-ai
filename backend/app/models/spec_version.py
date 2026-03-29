import uuid

from sqlalchemy import ForeignKey, Integer
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class SpecVersion(Base):
    __tablename__ = "spec_versions"

    spec_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("specs.id"))
    version_number: Mapped[int] = mapped_column(Integer)
    content_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    diff_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))

    spec: Mapped["Spec"] = relationship(back_populates="versions")
    author: Mapped["User"] = relationship()
