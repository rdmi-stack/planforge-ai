"""Shared pytest fixtures for PlanForge AI backend tests."""

import uuid
from collections.abc import AsyncGenerator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import get_settings
from app.database import get_db
from app.main import app
from app.models.base import Base
from app.models.user import User
from app.utils.security import create_access_token, hash_password

# Use a separate test database URL (falls back to main DB if not set)
TEST_DATABASE_URL = get_settings().DATABASE_URL.replace("/planforge", "/planforge_test")


@pytest.fixture(scope="session")
def engine():
    """Create a test database engine (session-scoped for speed)."""
    return create_async_engine(TEST_DATABASE_URL, echo=False)


@pytest.fixture(scope="session")
async def setup_database(engine):
    """Create all tables at session start, drop at session end."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture
async def db_session(engine, setup_database) -> AsyncGenerator[AsyncSession]:
    """Provide a transactional database session that rolls back after each test."""
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        async with session.begin():
            yield session
            await session.rollback()


@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient]:
    """Provide an async HTTP test client with dependency overrides."""

    async def override_get_db() -> AsyncGenerator[AsyncSession]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create a test user in the database."""
    from app.models.organization import Organization

    org = Organization(name="Test Org", slug=f"test-org-{uuid.uuid4().hex[:8]}", plan="free")
    db_session.add(org)
    await db_session.flush()

    user = User(
        email=f"test-{uuid.uuid4().hex[:8]}@example.com",
        name="Test User",
        password_hash=hash_password("testpassword123"),
        plan="free",
        org_id=org.id,
    )
    db_session.add(user)
    await db_session.flush()
    await db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user: User) -> dict[str, str]:
    """Generate authorization headers for the test user."""
    token = create_access_token(
        user_id=test_user.id,
        email=test_user.email,
        org_id=test_user.org_id,
    )
    return {"Authorization": f"Bearer {token}"}
