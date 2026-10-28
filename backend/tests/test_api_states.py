"""Tests for State endpoints."""

from fastapi.testclient import TestClient
import pytest


@pytest.mark.integration
def test_list_states(client: TestClient) -> None:
    response = client.get("/api/v1/states")
    assert response.status_code == 200
    states = response.json()
    assert len(states) >= 30
    first = states[0]
    assert "id" in first
    assert "name" in first
    assert "place_count" in first
    assert "destination_count" in first


@pytest.mark.integration
def test_list_states_filter_by_region(client: TestClient) -> None:
    response = client.get("/api/v1/states?region=South")
    assert response.status_code == 200
    states = response.json()
    assert len(states) > 0
    for state in states:
        assert "South" in state["region"]


@pytest.mark.integration
def test_get_state_by_id_success(client: TestClient) -> None:
    # First get list to find a valid state id
    states = client.get("/api/v1/states").json()
    state_id = states[0]["id"]

    response = client.get(f"/api/v1/states/{state_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == state_id
    assert "name" in data
    assert data["place_count"] >= 0


@pytest.mark.integration
def test_get_state_by_id_not_found(client: TestClient) -> None:
    response = client.get("/api/v1/states/999999")
    assert response.status_code == 404
    body = response.json()
    assert "error" in body
    assert body["error"]["code"] == "ENTITY_NOT_FOUND"


@pytest.mark.integration
def test_get_places_in_state(client: TestClient) -> None:
    # Find a state that has places
    states = client.get("/api/v1/states").json()
    state_with_places = next(s for s in states if s["place_count"] > 0)
    state_id = state_with_places["id"]

    response = client.get(f"/api/v1/states/{state_id}/places")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "meta" in data
    assert len(data["items"]) > 0
    assert data["meta"]["total_items"] == state_with_places["place_count"]
    for place in data["items"]:
        assert place["state_id"] == state_id


@pytest.mark.integration
def test_get_destinations_in_state(client: TestClient) -> None:
    states = client.get("/api/v1/states").json()
    state_with_dest = next(s for s in states if s["destination_count"] > 0)
    state_id = state_with_dest["id"]

    response = client.get(f"/api/v1/states/{state_id}/destinations")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) > 0
    for dest in data["items"]:
        assert dest["state_id"] == state_id


@pytest.mark.integration
def test_get_foods_in_state(client: TestClient) -> None:
    states = client.get("/api/v1/states").json()
    state_id = states[0]["id"]

    response = client.get(f"/api/v1/states/{state_id}/foods")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "meta" in data
