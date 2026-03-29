import json

import structlog
from fastapi import APIRouter, Depends, HTTPException, status

from app.ai.client import AIClient, ModelTier
from app.dependencies import get_current_user
from app.models.feature import Feature
from app.models.project import Project
from app.models.spec import Spec
from app.models.user import User
from app.schemas.feature import FeatureCreate, FeatureResponse, FeatureUpdate

logger = structlog.get_logger()
router = APIRouter(prefix="/projects/{project_id}/features", tags=["features"])


async def _get_user_project(project_id: str, user: User) -> Project:
    project = await Project.find_one(
        Project.id == project_id, Project.owner_id == user.id
    )
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.get("/", response_model=list[FeatureResponse])
async def list_features(
    project_id: str,
    user: User = Depends(get_current_user),
) -> list[Feature]:
    await _get_user_project(project_id, user)
    features = (
        await Feature.find(Feature.project_id == project_id)
        .sort(+Feature.sort_order)
        .to_list()
    )
    return features


@router.post("/", response_model=FeatureResponse, status_code=status.HTTP_201_CREATED)
async def create_feature(
    project_id: str,
    data: FeatureCreate,
    user: User = Depends(get_current_user),
) -> Feature:
    await _get_user_project(project_id, user)

    feature = Feature(
        project_id=project_id,
        spec_id=data.spec_id,
        title=data.title,
        description=data.description,
        parent_feature_id=data.parent_feature_id,
        priority_score=data.priority_score,
        effort_estimate=data.effort_estimate,
        mvp_classification=data.mvp_classification,
        sort_order=data.sort_order,
    )
    await feature.insert()
    logger.info("feature_created", feature_id=str(feature.id), project_id=project_id)
    return feature


@router.patch("/{feature_id}", response_model=FeatureResponse)
async def update_feature(
    project_id: str,
    feature_id: str,
    data: FeatureUpdate,
    user: User = Depends(get_current_user),
) -> Feature:
    await _get_user_project(project_id, user)
    feature = await Feature.find_one(
        Feature.id == feature_id, Feature.project_id == project_id
    )
    if feature is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feature not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(feature, field, value)

    await feature.save()
    return feature


@router.delete("/{feature_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_feature(
    project_id: str,
    feature_id: str,
    user: User = Depends(get_current_user),
) -> None:
    await _get_user_project(project_id, user)
    feature = await Feature.find_one(
        Feature.id == feature_id, Feature.project_id == project_id
    )
    if feature is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feature not found")
    await feature.delete()


@router.post("/decompose", response_model=list[FeatureResponse])
async def decompose_features(
    project_id: str,
    user: User = Depends(get_current_user),
) -> list[Feature]:
    """Use AI to decompose project specs into features."""
    project = await _get_user_project(project_id, user)

    specs = await Spec.find(Spec.project_id == project_id).to_list()
    spec_context = ""
    for spec in specs:
        spec_context += f"Spec: {spec.title}\n"
        if spec.content:
            spec_context += json.dumps(spec.content)[:2000] + "\n\n"

    if not spec_context:
        spec_context = f"Project: {project.name}. Description: {project.description or 'No description'}"

    ai = AIClient()
    prompt = (
        f"Based on this project context, decompose it into 5-8 features. "
        f"Return ONLY a JSON array of objects with fields: title, description, mvp_classification (mvp/v1/v2/nice_to_have), priority_score (0-100), effort_estimate (hours).\n\n"
        f"Context:\n{spec_context}\n\n"
        f"Return valid JSON array only, no markdown."
    )

    try:
        result = await ai.generate(
            system_prompt="You are a product planning AI. Return only valid JSON.",
            user_prompt=prompt,
            model_tier=ModelTier.TASK,
            temperature=0.3,
        )

        # Parse AI response
        result = result.strip()
        if result.startswith("```"):
            result = result.split("\n", 1)[1].rsplit("```", 1)[0]

        features_data = json.loads(result)
        created: list[Feature] = []

        for i, f_data in enumerate(features_data):
            feature = Feature(
                project_id=project_id,
                title=f_data.get("title", f"Feature {i+1}"),
                description=f_data.get("description", ""),
                mvp_classification=f_data.get("mvp_classification", "v1"),
                priority_score=f_data.get("priority_score", 50),
                effort_estimate=f_data.get("effort_estimate"),
                status="backlog",
                sort_order=i,
            )
            await feature.insert()
            created.append(feature)

        logger.info("features_decomposed", project_id=project_id, count=len(created))
        return created

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned invalid JSON. Please try again.")
    except Exception as e:
        logger.error("decompose_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Feature decomposition failed: {str(e)}")


@router.post("/prioritize", response_model=list[FeatureResponse])
async def prioritize_features(
    project_id: str,
    user: User = Depends(get_current_user),
) -> list[Feature]:
    """Use AI to score and prioritize existing features."""
    await _get_user_project(project_id, user)
    features = await Feature.find(Feature.project_id == project_id).to_list()

    if not features:
        raise HTTPException(status_code=400, detail="No features to prioritize")

    ai = AIClient()
    feature_list = "\n".join([f"- {f.title}: {f.description}" for f in features])
    prompt = (
        f"Score these features 0-100 based on impact, urgency, and user value. "
        f"Return ONLY a JSON array of objects with: title, priority_score.\n\n{feature_list}\n\n"
        f"Return valid JSON array only."
    )

    try:
        result = await ai.generate(
            system_prompt="You are a product prioritization AI. Return only valid JSON.",
            user_prompt=prompt,
            model_tier=ModelTier.FAST,
            temperature=0.2,
        )

        result = result.strip()
        if result.startswith("```"):
            result = result.split("\n", 1)[1].rsplit("```", 1)[0]

        scores = json.loads(result)
        score_map = {s["title"]: s["priority_score"] for s in scores}

        for feature in features:
            if feature.title in score_map:
                feature.priority_score = score_map[feature.title]
                await feature.save()

        return features

    except Exception as e:
        logger.error("prioritize_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Prioritization failed: {str(e)}")
