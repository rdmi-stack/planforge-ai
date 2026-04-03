"""Shared pytest fixtures for PlanForge AI backend tests."""

import uuid
from collections.abc import AsyncGenerator

import pytest_asyncio
from beanie import init_beanie
from httpx import ASGITransport, AsyncClient
from mongomock_motor import AsyncMongoMockClient

from app.config import get_settings
from app.main import app
from app.models import ALL_MODELS
from app.models.organization import Organization
from app.models.user import User
from app.utils.security import create_access_token, hash_password


def _build_mongo_client() -> AsyncMongoMockClient:
    # Keep tests hermetic and fast instead of depending on Atlas DNS/network.
    return AsyncMongoMockClient()


@pytest_asyncio.fixture
async def mongo_client() -> AsyncGenerator[AsyncMongoMockClient]:
    client = _build_mongo_client()
    yield client


@pytest_asyncio.fixture
async def test_database(mongo_client: AsyncMongoMockClient) -> AsyncGenerator:
    settings = get_settings()
    database = mongo_client[f"{settings.MONGODB_DB_NAME}_test"]

    original_list_collection_names = database.list_collection_names

    async def compatible_list_collection_names(*args, **kwargs):
        kwargs.pop("authorizedCollections", None)
        kwargs.pop("nameOnly", None)
        return await original_list_collection_names(*args, **kwargs)

    database.list_collection_names = compatible_list_collection_names  # type: ignore[method-assign]
    await init_beanie(database=database, document_models=ALL_MODELS)
    yield database
    await mongo_client.drop_database(database.name)


@pytest_asyncio.fixture(autouse=True)
async def clean_database(test_database) -> AsyncGenerator[None]:
    for model in ALL_MODELS:
        await model.delete_all()
    yield
    for model in ALL_MODELS:
        await model.delete_all()


@pytest_asyncio.fixture
async def client(test_database) -> AsyncGenerator[AsyncClient]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as async_client:
        yield async_client


@pytest_asyncio.fixture
async def test_user(test_database) -> User:
    org = Organization(
        name="Test Org",
        slug=f"test-org-{uuid.uuid4().hex[:8]}",
        plan="free",
    )
    await org.insert()

    user = User(
        email=f"test-{uuid.uuid4().hex[:8]}@example.com",
        name="Test User",
        password_hash=hash_password("testpassword123"),
        plan="free",
        org_id=org.id,
    )
    await user.insert()
    return user


@pytest_asyncio.fixture
async def auth_headers(test_user: User) -> dict[str, str]:
    token = create_access_token(
        user_id=test_user.id,
        email=test_user.email,
        org_id=test_user.org_id,
    )
    return {"Authorization": f"Bearer {token}"}
