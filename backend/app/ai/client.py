"""Unified AI client wrapper with OpenAI GPT-5.4 primary and Anthropic fallback."""

from collections.abc import AsyncIterator
from enum import StrEnum

import openai
import structlog

from app.config import get_settings

logger = structlog.get_logger()


class ModelTier(StrEnum):
    """Model selection tiers mapping to specific model IDs."""

    SPEC = "gpt-5.4"
    TASK = "gpt-5.4"
    ARCHITECTURE = "gpt-5.4"
    CHAT = "gpt-5.4"
    FAST = "gpt-5.4-mini"
    NANO = "gpt-5.4-nano"


class AIClient:
    """Wrapper around OpenAI GPT-5.4 client.

    Uses GPT-5.4 as primary model for all AI generation tasks.
    Falls back to gpt-5.4-mini if the main model fails.
    """

    def __init__(self) -> None:
        settings = get_settings()
        self._openai = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        model_tier: ModelTier = ModelTier.CHAT,
        temperature: float = 0.3,
        max_tokens: int = 4096,
    ) -> str:
        """Generate a completion using GPT-5.4.

        Returns the full text response.
        """
        try:
            return await self._generate_openai(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                model=model_tier.value,
                temperature=temperature,
                max_tokens=max_tokens,
            )
        except Exception as e:
            logger.warning("openai_generation_failed", error=str(e), model=model_tier.value)
            return await self._generate_openai(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                model=ModelTier.FAST.value,
                temperature=temperature,
                max_tokens=max_tokens,
            )

    async def stream(
        self,
        system_prompt: str,
        user_prompt: str,
        model_tier: ModelTier = ModelTier.CHAT,
        temperature: float = 0.3,
        max_tokens: int = 4096,
    ) -> AsyncIterator[str]:
        """Stream a completion using GPT-5.4.

        Yields text chunks as they arrive.
        """
        try:
            async for chunk in self._stream_openai(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                model=model_tier.value,
                temperature=temperature,
                max_tokens=max_tokens,
            ):
                yield chunk
        except Exception as e:
            logger.warning("openai_stream_failed", error=str(e), falling_back_to="gpt-5.4-mini")
            async for chunk in self._stream_openai(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                model=ModelTier.FAST.value,
                temperature=temperature,
                max_tokens=max_tokens,
            ):
                yield chunk

    async def _generate_openai(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str,
        temperature: float,
        max_tokens: int,
    ) -> str:
        response = await self._openai.chat.completions.create(
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        content = response.choices[0].message.content or ""
        usage = response.usage
        logger.info(
            "openai_generation_complete",
            model=model,
            input_tokens=usage.prompt_tokens if usage else 0,
            output_tokens=usage.completion_tokens if usage else 0,
        )
        return content

    async def _stream_openai(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str,
        temperature: float,
        max_tokens: int,
    ) -> AsyncIterator[str]:
        stream = await self._openai.chat.completions.create(
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta
            if delta.content:
                yield delta.content

    async def count_tokens(self, text: str) -> int:
        """Estimate token count for text (rough estimate: ~4 chars per token)."""
        return len(text) // 4
