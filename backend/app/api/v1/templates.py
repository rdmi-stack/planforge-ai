import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.models.template import Template

logger = structlog.get_logger()
router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("/")
async def list_templates(
    category: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    query = select(Template).where(Template.is_public.is_(True))
    if category:
        query = query.where(Template.category == category)

    result = await db.execute(query.order_by(Template.name))
    templates = result.scalars().all()

    return [
        {
            "id": str(t.id),
            "name": t.name,
            "category": t.category,
            "description": t.description,
            "spec_template_json": t.spec_template_json,
            "architecture_json": t.architecture_json,
        }
        for t in templates
    ]


@router.get("/{template_id}")
async def get_template(
    template_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await db.execute(select(Template).where(Template.id == template_id))
    template = result.scalar_one_or_none()
    if template is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    return {
        "id": str(template.id),
        "name": template.name,
        "category": template.category,
        "description": template.description,
        "spec_template_json": template.spec_template_json,
        "architecture_json": template.architecture_json,
        "is_public": template.is_public,
    }
