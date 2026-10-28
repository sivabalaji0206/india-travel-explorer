"""Tests for Destination catalogue endpoints."""

from fastapi.testclient import TestClient
import pytest


@pytest.mark.integration
def test_list_destinations(client: TestClient) -> None:
    response = client.get("/api/v1/destinations?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 10
    assert data["meta"]["total_items"] >= 150
    first = data["items"][0]
    assert "name" in first
    assert "state_name" in first
    assert "popularity_score" in first


@pytest.mark.integration
def test_get_destination_detail(client: TestClient) -> None:
    destinations = client.get("/api/v1/destinations?page_size=1").json()
    dest_id = destinations["items"][0]["id"]

    response = client.get(f"/api/v1/destinations/{dest_id}")
    assert response.status_code == 200
    dest = response.json()
    assert dest["id"] == dest_id
    assert "cost_tiers" in dest
    assert "eateries" in dest
    assert "foods" in dest


@pytest.mark.integration
def test_get_destination_not_found(client: TestClient) -> None:
    response = client.get("/api/v1/destinations/999999")
    assert response.status_code == 404
    body = response.json()
    assert body["error"]["code"] == "ENTITY_NOT_FOUND"
