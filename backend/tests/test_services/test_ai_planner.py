"""Tests for the AI planner service."""

from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest

from app.services.ai_planner import AIPlannerService


@pytest.mark.asyncio
async def test_ask_smart_questions_returns_string() -> None:
    """ask_smart_questions should return a non-empty string response."""
    mock_db = AsyncMock()

    # Mock project query
    mock_project = MagicMock()
    mock_project.name = "Test Project"
    mock_project.description = "A test project"
    mock_project.tech_stack_json = None

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_project
    mock_db.execute = AsyncMock(return_value=mock_result)

    with patch.object(AIPlannerService, "__init__", lambda self, db: None):
        planner = AIPlannerService.__new__(AIPlannerService)
        planner.db = mock_db

        mock_ai = AsyncMock()
        mock_ai.generate = AsyncMock(return_value="1. What is your target audience?\n2. What scale do you expect?")
        planner.ai_client = mock_ai

        from jinja2 import Environment, FileSystemLoader
        from pathlib import Path
        planner.jinja_env = Environment(
            loader=FileSystemLoader(str(Path(__file__).parent.parent.parent / "app" / "ai" / "prompts")),
            autoescape=False,
        )
        planner.structured_client = AsyncMock()

        result = await planner.ask_smart_questions(
            project_id=uuid4(),
            user_input="I want to build a task management app",
        )

        assert isinstance(result, str)
        assert len(result) > 0
        mock_ai.generate.assert_called_once()


@pytest.mark.asyncio
async def test_chat_stream_yields_chunks() -> None:
    """chat_stream should yield text chunks from the AI client."""
    mock_db = AsyncMock()

    # Mock project
    mock_project = MagicMock()
    mock_project.name = "Stream Test"
    mock_project.description = "Testing streaming"
    mock_project.tech_stack_json = None

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_project
    mock_db.execute = AsyncMock(return_value=mock_result)

    with patch.object(AIPlannerService, "__init__", lambda self, db: None):
        planner = AIPlannerService.__new__(AIPlannerService)
        planner.db = mock_db

        # Mock streaming
        async def mock_stream(*args, **kwargs):
            for chunk in ["Hello", " world", "!"]:
                yield chunk

        mock_ai = MagicMock()
        mock_ai.stream = mock_stream
        planner.ai_client = mock_ai

        chunks = []
        async for chunk in planner.chat_stream(
            project_id=uuid4(),
            user_message="Tell me about my project",
        ):
            chunks.append(chunk)

        assert chunks == ["Hello", " world", "!"]


@pytest.mark.asyncio
async def test_get_project_not_found_raises() -> None:
    """_get_project should raise ValueError for non-existent projects."""
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute = AsyncMock(return_value=mock_result)

    with patch.object(AIPlannerService, "__init__", lambda self, db: None):
        planner = AIPlannerService.__new__(AIPlannerService)
        planner.db = mock_db

        with pytest.raises(ValueError, match="not found"):
            await planner._get_project(uuid4())
