"""Tests for project CRUD endpoints."""

import pytest
from httpx import AsyncClient

from app.models.user import User


@pytest.mark.asyncio
async def test_create_project(
    client: AsyncClient,
    auth_headers: dict,
    test_user: User,
) -> None:
    """Creating a project should return 201 with project data."""
    response = await client.post(
        "/api/v1/projects/",
        headers=auth_headers,
        json={
            "name": "Test Project",
            "description": "A test project for unit tests",
            "tech_stack": ["Next.js", "FastAPI"],
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Project"
    assert data["description"] == "A test project for unit tests"
    assert data["owner_id"] == str(test_user.id)
    assert "id" in data


@pytest.mark.asyncio
async def test_list_projects(
    client: AsyncClient,
    auth_headers: dict,
) -> None:
    """Listing projects should return paginated results."""
    # Create a project first
    await client.post(
        "/api/v1/projects/",
        headers=auth_headers,
        json={"name": "List Test Project"},
    )

    response = await client.get("/api/v1/projects/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "meta" in data
    assert data["meta"]["total"] >= 1


@pytest.mark.asyncio
async def test_get_project(
    client: AsyncClient,
    auth_headers: dict,
) -> None:
    """Fetching a project by ID should return the project."""
    create_resp = await client.post(
        "/api/v1/projects/",
        headers=auth_headers,
        json={"name": "Get Test Project"},
    )
    project_id = create_resp.json()["id"]

    response = await client.get(f"/api/v1/projects/{project_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["id"] == project_id


@pytest.mark.asyncio
async def test_get_project_not_found(
    client: AsyncClient,
    auth_headers: dict,
) -> None:
    """Fetching a non-existent project should return 404."""
    import uuid

    fake_id = str(uuid.uuid4())
    response = await client.get(f"/api/v1/projects/{fake_id}", headers=auth_headers)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_project(
    client: AsyncClient,
    auth_headers: dict,
) -> None:
    """Updating a project should reflect the changes."""
    create_resp = await client.post(
        "/api/v1/projects/",
        headers=auth_headers,
        json={"name": "Update Test"},
    )
    project_id = create_resp.json()["id"]

    response = await client.patch(
        f"/api/v1/projects/{project_id}",
        headers=auth_headers,
        json={"name": "Updated Name", "description": "Now with description"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["description"] == "Now with description"


@pytest.mark.asyncio
async def test_delete_project(
    client: AsyncClient,
    auth_headers: dict,
) -> None:
    """Deleting a project should return 204 and remove it."""
    create_resp = await client.post(
        "/api/v1/projects/",
        headers=auth_headers,
        json={"name": "Delete Test"},
    )
    project_id = create_resp.json()["id"]

    response = await client.delete(f"/api/v1/projects/{project_id}", headers=auth_headers)
    assert response.status_code == 204

    # Verify it's gone
    get_resp = await client.get(f"/api/v1/projects/{project_id}", headers=auth_headers)
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_create_project_unauthenticated(client: AsyncClient) -> None:
    """Creating a project without auth should fail."""
    response = await client.post(
        "/api/v1/projects/",
        json={"name": "No Auth Project"},
    )
    assert response.status_code in (401, 403)
