"""Tests for Saved Plans CRUD endpoints (FR-22, FR-23)."""

import uuid
from fastapi.testclient import TestClient
import pytest


def _create_authenticated_user(client: TestClient) -> tuple[str, dict]:
    email = f"plan_user_{uuid.uuid4().hex[:8]}@example.com"
    res = client.post(
        "/api/v1/auth/register",
        json={"name": "Plan Owner", "email": email, "password": "SecurePassword123!"},
    ).json()
    return res["access_token"], res["user"]


@pytest.mark.integration
def test_save_and_manage_plans_lifecycle(client: TestClient) -> None:
    token, _ = _create_authenticated_user(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Generate a trip plan first
    states = client.get("/api/v1/states").json()
    state = next(s for s in states if s["place_count"] >= 2)
    plan = client.post(
        "/api/v1/planner/generate",
        json={"state_id": state["id"], "duration_days": 2, "total_budget": 12000},
    ).json()

    # 1. Save Plan
    save_res = client.post(
        "/api/v1/plans",
        headers=headers,
        json={
            "state_id": state["id"],
            "title": "My Weekend Getaway",
            "preferences": {"duration_days": 2, "budget": 12000},
            "plan_json": plan,
        },
    )
    assert save_res.status_code == 201
    saved_plan = save_res.json()
    plan_id = saved_plan["id"]
    assert saved_plan["title"] == "My Weekend Getaway"
    assert saved_plan["state_name"] == state["name"]

    # 2. List Plans
    list_res = client.get("/api/v1/plans", headers=headers)
    assert list_res.status_code == 200
    plans_list = list_res.json()
    assert any(p["id"] == plan_id for p in plans_list)

    # 3. Get Plan Detail
    get_res = client.get(f"/api/v1/plans/{plan_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["title"] == "My Weekend Getaway"

    # 4. Update / Rename Plan
    patch_res = client.patch(
        f"/api/v1/plans/{plan_id}",
        headers=headers,
        json={"title": "Renamed Incredible Journey"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["title"] == "Renamed Incredible Journey"

    # 5. Delete Plan
    del_res = client.delete(f"/api/v1/plans/{plan_id}", headers=headers)
    assert del_res.status_code == 204

    # 6. Verify Deleted
    verify_res = client.get(f"/api/v1/plans/{plan_id}", headers=headers)
    assert verify_res.status_code == 404


def test_save_plan_unauthorized_without_token(client: TestClient) -> None:
    response = client.post(
        "/api/v1/plans",
        json={"state_id": 1, "title": "Guest Plan", "plan_json": {}},
    )
    assert response.status_code == 401
    body = response.json()
    assert body["error"]["code"] == "UNAUTHORIZED"
