"""Unified AI client wrapper with Anthropic primary and OpenAI fallback."""

from collections.abc import AsyncIterator
from enum import StrEnum

import anthropic
import openai
import structlog

from app.config import get_settings

logger = structlog.get_logger()


class ModelTier(StrEnum):
    """Model selection tiers mapping to specific model IDs."""

    SPEC = "claude-sonnet-4-20250514"
    TASK = "claude-sonnet-4-20250514"
    ARCHITECTURE = "claude-sonnet-4-20250514"
    CHAT = "claude-sonnet-4-20250514"
    FALLBACK = "gpt-4o"


class AIClient:
    """Wrapper around Anthropic and OpenAI clients with automatic fallback.

    Provides both synchronous completion and streaming interfaces.
    Falls back to OpenAI if the Anthropic call fails.
    """

    def __init__(self) -> None:
        settings = get_settings()
        self._anthropic = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        self._openai = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        model_tier: ModelTier = ModelTier.CHAT,
        temperature: float = 0.3,
        max_tokens: int = 4096,
    ) -> str:
        """Generate a completion using Anthropic with OpenAI fallback.

        Returns the full text response.
        """
        try:
            return await self._generate_anthropic(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                model=model_tier.value,
                temperature=temperature,
                max_tokens=max_tokens,
            )
        except Exception as e:
            logger.warning("anthropic_generation_failed", error=str(e), model=model_tier.value)
            return await self._generate_openai(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                model=ModelTier.FALLBACK.value,
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
        """Stream a completion using Anthropic with OpenAI fallback.

        Yields text chunks as they arrive.
        """
        try:
            async for chunk in self._stream_anthropic(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                model=model_tier.value,
                temperature=temperature,
                max_tokens=max_tokens,
            ):
                yield chunk
        except Exception as e:
            logger.warning("anthropic_stream_failed", error=str(e), falling_back_to="openai")
            async for chunk in self._stream_openai(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                model=ModelTier.FALLBACK.value,
                temperature=temperature,
                max_tokens=max_tokens,
            ):
                yield chunk

    async def _generate_anthropic(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str,
        temperature: float,
        max_tokens: int,
    ) -> str:
        response = await self._anthropic.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
        )
        text_blocks = [block.text for block in response.content if block.type == "text"]
        usage = response.usage
        logger.info(
            "anthropic_generation_complete",
            model=model,
            input_tokens=usage.input_tokens,
            output_tokens=usage.output_tokens,
        )
        return "".join(text_blocks)

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

    async def _stream_anthropic(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str,
        temperature: float,
        max_tokens: int,
    ) -> AsyncIterator[str]:
        async with self._anthropic.messages.stream(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
        ) as stream:
            async for text in stream.text_stream:
                yield text

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
        """Estimate token count for a piece of text using Anthropic's tokenizer."""
        try:
            result = await self._anthropic.count_tokens(
                model=ModelTier.CHAT.value,
                messages=[{"role": "user", "content": text}],
            )
            return result.input_tokens
        except Exception:
            # Rough estimate: ~4 chars per token
            return len(text) // 4
