"""Tests for Place catalogue endpoints."""

from fastapi.testclient import TestClient
import pytest


@pytest.mark.integration
def test_list_places_pagination(client: TestClient) -> None:
    response = client.get("/api/v1/places?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 10
    meta = data["meta"]
    assert meta["page"] == 1
    assert meta["page_size"] == 10
    assert meta["total_items"] > 500
    assert meta["has_next"] is True
    assert meta["has_previous"] is False


@pytest.mark.integration
def test_list_places_filter_by_category(client: TestClient) -> None:
    response = client.get("/api/v1/places?category=temple")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) > 0
    for place in data["items"]:
        assert place["category"] == "temple"


@pytest.mark.integration
def test_list_places_filter_by_budget_level(client: TestClient) -> None:
    response = client.get("/api/v1/places?budget_level=low")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) > 0
    for place in data["items"]:
        assert place["budget_level"] == "low"


@pytest.mark.integration
def test_list_places_search(client: TestClient) -> None:
    response = client.get("/api/v1/places?search=temple")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) > 0
    for place in data["items"]:
        assert "temple" in place["name"].lower()


@pytest.mark.integration
def test_get_place_detail_success(client: TestClient) -> None:
    places = client.get("/api/v1/places?page_size=1").json()
    place_id = places["items"][0]["id"]

    response = client.get(f"/api/v1/places/{place_id}")
    assert response.status_code == 200
    place = response.json()
    assert place["id"] == place_id
    assert "state_name" in place
    assert "destination_name" in place
    assert "nearby_foods" in place
    assert "nearby_eateries" in place
    assert "cost_tiers" in place


@pytest.mark.integration
def test_get_place_detail_not_found(client: TestClient) -> None:
    response = client.get("/api/v1/places/999999")
    assert response.status_code == 404
    body = response.json()
    assert body["error"]["code"] == "ENTITY_NOT_FOUND"
