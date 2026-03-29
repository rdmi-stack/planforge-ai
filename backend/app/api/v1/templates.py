import structlog
from fastapi import APIRouter, HTTPException, status

from app.models.template import Template

logger = structlog.get_logger()
router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("/")
async def list_templates(
    category: str | None = None,
) -> list[dict]:
    query = Template.find(Template.is_public == True)  # noqa: E712
    if category:
        query = Template.find(Template.is_public == True, Template.category == category)  # noqa: E712

    templates = await query.sort(+Template.name).to_list()

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
) -> dict:
    template = await Template.find_one(Template.id == template_id)
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
