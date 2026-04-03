"""MongoDB connection and Beanie initialization using the async PyMongo client."""

import certifi
import structlog
from beanie import init_beanie
from pymongo import AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase

from app.config import get_settings

logger = structlog.get_logger()

_client: AsyncMongoClient | None = None
_database: AsyncDatabase | None = None


async def init_db() -> None:
    """Initialize the async Mongo client and Beanie ODM with all document models.

    Called once during application lifespan startup.
    """
    global _client, _database

    settings = get_settings()

    client_options = {"tlsCAFile": certifi.where()} if settings.MONGODB_URI.startswith("mongodb+srv://") else {}
    _client = AsyncMongoClient(settings.MONGODB_URI, **client_options)

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
    """Close the Mongo client connection."""
    global _client
    if _client is not None:
        _client.close()
        logger.info("mongodb_connection_closed")


def get_db() -> AsyncDatabase:
    """Return the Mongo database instance.

    Used as a FastAPI dependency when raw database access is needed.
    """
    if _database is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    return _database
