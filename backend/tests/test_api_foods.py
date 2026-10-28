"""Tests for Food catalogue endpoints."""

from fastapi.testclient import TestClient
import pytest


@pytest.mark.integration
def test_list_foods_pagination(client: TestClient) -> None:
    response = client.get("/api/v1/foods?page=1&page_size=15")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 15
    assert data["meta"]["total_items"] >= 200
    first = data["items"][0]
    assert "name" in first
    assert "food_type" in first
    assert "avg_price" in first


@pytest.mark.integration
def test_list_foods_filter_by_type(client: TestClient) -> None:
    response = client.get("/api/v1/foods?food_type=veg")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) > 0
    for food in data["items"]:
        assert food["food_type"] == "veg"
