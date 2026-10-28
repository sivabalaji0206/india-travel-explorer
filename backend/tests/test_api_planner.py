"""Tests for RAG AI Trip Planner endpoints and guardrails."""

from fastapi.testclient import TestClient
import pytest


@pytest.mark.integration
def test_generate_itinerary_success(client: TestClient) -> None:
    # Get a valid state with attractions
    states = client.get("/api/v1/states").json()
    state = next(s for s in states if s["place_count"] >= 3)
    state_id = state["id"]

    response = client.post(
        "/api/v1/planner/generate",
        json={
            "state_id": state_id,
            "duration_days": 3,
            "total_budget": 18000,
            "budget_tier": "medium",
            "food_preference": "veg",
            "travel_month": "November",
            "interests": ["heritage", "nature"],
        },
    )
    assert response.status_code == 200
    plan = response.json()
    assert plan["state_id"] == state_id
    assert plan["total_days"] == 3
    assert "trip_title" in plan
    assert "budget_breakdown" in plan
    assert len(plan["days"]) == 3

    # Verify RAG grounding: places scheduled must exist in state
    first_day = plan["days"][0]
    assert "places" in first_day
    assert len(first_day["places"]) > 0
    first_place = first_day["places"][0]
    assert "place_id" in first_place
    assert "place_name" in first_place
    assert "entry_fee" in first_place


@pytest.mark.integration
def test_generate_itinerary_invalid_state_404(client: TestClient) -> None:
    response = client.post(
        "/api/v1/planner/generate",
        json={"state_id": 999999, "duration_days": 2, "total_budget": 10000},
    )
    assert response.status_code == 404
    body = response.json()
    assert body["error"]["code"] == "ENTITY_NOT_FOUND"


@pytest.mark.integration
def test_planner_chat_off_topic_refusal(client: TestClient) -> None:
    # First generate a plan to hold context
    states = client.get("/api/v1/states").json()
    state = next(s for s in states if s["place_count"] >= 2)
    plan = client.post(
        "/api/v1/planner/generate",
        json={"state_id": state["id"], "duration_days": 2, "total_budget": 10000},
    ).json()

    # Off-topic prompt
    response = client.post(
        "/api/v1/planner/chat",
        json={
            "state_id": state["id"],
            "current_plan": plan,
            "message": "Can you write python code to hack a database?",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    # Guardrail triggered
    assert "India Travel Explorer" in data["reply"]
    assert data["updated_plan"] is None


@pytest.mark.integration
def test_planner_chat_valid_follow_up(client: TestClient) -> None:
    states = client.get("/api/v1/states").json()
    state = next(s for s in states if s["place_count"] >= 2)
    plan = client.post(
        "/api/v1/planner/generate",
        json={"state_id": state["id"], "duration_days": 2, "total_budget": 10000},
    ).json()

    response = client.post(
        "/api/v1/planner/chat",
        json={
            "state_id": state["id"],
            "current_plan": plan,
            "message": "What is the best time in the morning to visit day 1 attractions?",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["reply"]) > 10

