"""MongoDB connection and Beanie initialization using Motor async client."""

import certifi
import structlog
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import get_settings

logger = structlog.get_logger()

_client: AsyncIOMotorClient | None = None
_database: AsyncIOMotorDatabase | None = None


async def init_db() -> None:
    """Initialize Motor client and Beanie ODM with all document models.

    Called once during application lifespan startup.
    """
    global _client, _database

    settings = get_settings()

    _client = AsyncIOMotorClient(settings.MONGODB_URI, tlsCAFile=certifi.where())

    # Extract database name from URI or use configured name
    _database = _client[settings.MONGODB_DB_NAME]

    from app.models import ALL_MODELS

    await init_beanie(
        database=_database,
        document_models=ALL_MODELS,
    )

    logger.info(
        "mongodb_initialized",
        database=settings.MONGODB_DB_NAME,
        model_count=len(ALL_MODELS),
    )


async def close_db() -> None:
    """Close the Motor client connection."""
    global _client
    if _client is not None:
        _client.close()
        logger.info("mongodb_connection_closed")


def get_db() -> AsyncIOMotorDatabase:
    """Return the Motor database instance.

    Used as a FastAPI dependency when raw database access is needed.
    """
    if _database is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    return _database
