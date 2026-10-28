"""Tests for User authentication and profile endpoints."""

import uuid
from fastapi.testclient import TestClient
import pytest


def _random_email() -> str:
    return f"user_{uuid.uuid4().hex[:8]}@example.com"


@pytest.mark.integration
def test_register_user_success(client: TestClient) -> None:
    email = _random_email()
    response = client.post(
        "/api/v1/auth/register",
        json={"name": "Traveler Ravi", "email": email, "password": "SecurePassword123!"},
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == email
    assert data["user"]["name"] == "Traveler Ravi"
    assert data["user"]["role"] == "user"


@pytest.mark.integration
def test_register_duplicate_email_conflict(client: TestClient) -> None:
    email = _random_email()
    # First registration
    client.post(
        "/api/v1/auth/register",
        json={"name": "First User", "email": email, "password": "SecurePassword123!"},
    )
    # Duplicate registration
    response = client.post(
        "/api/v1/auth/register",
        json={"name": "Duplicate User", "email": email, "password": "SecurePassword123!"},
    )
    assert response.status_code == 409
    body = response.json()
    assert body["error"]["code"] == "CONFLICT"


def test_register_short_password_validation_error(client: TestClient) -> None:
    response = client.post(
        "/api/v1/auth/register",
        json={"name": "Short Pass", "email": "short@example.com", "password": "123"},
    )
    assert response.status_code == 422
    body = response.json()
    assert body["error"]["code"] == "VALIDATION_ERROR"


@pytest.mark.integration
def test_login_success(client: TestClient) -> None:
    email = _random_email()
    password = "CorrectPassword456!"
    client.post(
        "/api/v1/auth/register",
        json={"name": "Login User", "email": email, "password": password},
    )

    response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == email


@pytest.mark.integration
def test_login_wrong_password_unauthorized(client: TestClient) -> None:
    email = _random_email()
    client.post(
        "/api/v1/auth/register",
        json={"name": "Login User", "email": email, "password": "CorrectPassword123!"},
    )

    response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "WrongPassword999!"},
    )
    assert response.status_code == 401
    body = response.json()
    assert body["error"]["code"] == "UNAUTHORIZED"


@pytest.mark.integration
def test_get_me_authorized(client: TestClient) -> None:
    email = _random_email()
    reg = client.post(
        "/api/v1/auth/register",
        json={"name": "Auth Me User", "email": email, "password": "SecurePassword123!"},
    ).json()
    token = reg["access_token"]

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    me = response.json()
    assert me["email"] == email
    assert me["name"] == "Auth Me User"


def test_get_me_unauthorized_without_token(client: TestClient) -> None:
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
    body = response.json()
    assert body["error"]["code"] == "UNAUTHORIZED"
