import json
from collections.abc import AsyncGenerator

import openai
import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from app.config import get_settings
from app.dependencies import get_current_user, rate_limiter
from app.models.chat_session import ChatSession
from app.models.project import Project
from app.models.user import User
from app.schemas.chat import ChatRequest

logger = structlog.get_logger()
router = APIRouter(prefix="/projects/{project_id}/chat", tags=["chat"])


async def _generate_ai_stream(
    message: str,
    project: Project,
    session: ChatSession,
) -> AsyncGenerator[str]:
    """Stream AI planning responses via SSE using GPT-5.4."""
    settings = get_settings()

    try:
        client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

        system_prompt = (
            "You are PlanForge AI, an expert product planning assistant. "
            "Help users plan their software products by asking clarifying questions, "
            "generating specs, breaking down features, and creating actionable tasks. "
            f"Project: {project.name}. "
            f"Description: {project.description or 'No description yet'}."
        )

        previous_messages = []
        if session.messages_json and isinstance(session.messages_json, dict):
            previous_messages = session.messages_json.get("messages", [])

        messages = previous_messages + [{"role": "user", "content": message}]

        stream = await client.chat.completions.create(
            model="gpt-5.4",
            max_completion_tokens=4096,
            stream=True,
            messages=[
                {"role": "system", "content": system_prompt},
                *messages,
            ],
        )

        full_response = ""
        async for chunk in stream:
            delta = chunk.choices[0].delta
            if delta.content:
                full_response += delta.content
                event_data = json.dumps({"type": "text", "content": delta.content})
                yield f"data: {event_data}\n\n"

        messages.append({"role": "assistant", "content": full_response})
        session.messages_json = {"messages": messages}
        await session.save()

        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    except Exception as exc:
        logger.error("ai_stream_error", error=str(exc))
        error_data = json.dumps({"type": "error", "content": "AI generation failed. Please try again."})
        yield f"data: {error_data}\n\n"


@router.post("/", dependencies=[Depends(rate_limiter)])
async def chat_with_ai(
    project_id: str,
    data: ChatRequest,
    user: User = Depends(get_current_user),
) -> StreamingResponse:
    project = await Project.find_one(
        Project.id == project_id, Project.owner_id == user.id
    )
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    session: ChatSession | None = None
    if data.session_id:
        session = await ChatSession.find_one(
            ChatSession.id == data.session_id,
            ChatSession.project_id == project_id,
            ChatSession.user_id == user.id,
        )

    if session is None:
        session = ChatSession(
            project_id=project.id,
            user_id=user.id,
            messages_json={"messages": []},
            session_type="planning",
        )
        await session.insert()

    logger.info("chat_started", project_id=project_id, session_id=str(session.id))

    return StreamingResponse(
        _generate_ai_stream(data.message, project, session),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Session-Id": str(session.id),
        },
    )
