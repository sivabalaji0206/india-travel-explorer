"""Tests for the root and health endpoints."""

from fastapi.testclient import TestClient
import pytest


def test_root_endpoint(client: TestClient) -> None:
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "India Travel Explorer"
    assert data["docs"] == "/docs"
    assert data["api_v1"] == "/api/v1"


@pytest.mark.integration
def test_health_check_healthy(client: TestClient) -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "version" in data
