"""Structured output extraction using the instructor library.

Ensures AI responses are parsed into validated Pydantic models,
providing type safety and automatic retry on parse failures.
"""

import anthropic
import instructor
import structlog
from pydantic import BaseModel

from app.ai.client import ModelTier
from app.config import get_settings

logger = structlog.get_logger()


class StructuredAIClient:
    """AI client that returns validated Pydantic model instances.

    Uses the instructor library to patch Anthropic/OpenAI clients
    with structured output capabilities. Retries up to 3 times
    on validation failures.
    """

    def __init__(self) -> None:
        settings = get_settings()
        self._anthropic_raw = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        self._client = instructor.from_anthropic(self._anthropic_raw)

    async def generate[T: BaseModel](
        self,
        response_model: type[T],
        system_prompt: str,
        user_prompt: str,
        model_tier: ModelTier = ModelTier.CHAT,
        temperature: float = 0.3,
        max_tokens: int = 4096,
        max_retries: int = 3,
    ) -> T:
        """Generate a structured response matching the given Pydantic model.

        The instructor library handles prompt injection for the schema,
        parsing, and automatic retries on validation failure.
        """
        logger.info(
            "structured_generation_start",
            model=model_tier.value,
            response_type=response_model.__name__,
        )

        result = await self._client.messages.create(
            model=model_tier.value,
            max_tokens=max_tokens,
            temperature=temperature,
            max_retries=max_retries,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
            response_model=response_model,
        )

        logger.info(
            "structured_generation_complete",
            response_type=response_model.__name__,
        )
        return result

    async def generate_list[T: BaseModel](
        self,
        response_model: type[T],
        system_prompt: str,
        user_prompt: str,
        model_tier: ModelTier = ModelTier.CHAT,
        temperature: float = 0.3,
        max_tokens: int = 4096,
    ) -> list[T]:
        """Generate a list of structured responses.

        Wraps the target model in a list container for batch extraction.
        """

        class ListWrapper(BaseModel):
            items: list[response_model]  # type: ignore[valid-type]

        wrapper = await self.generate(
            response_model=ListWrapper,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            model_tier=model_tier,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return wrapper.items
