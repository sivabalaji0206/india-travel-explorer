"""Tests for API error handling and middleware."""

from fastapi.testclient import TestClient


def test_validation_error_format(client: TestClient) -> None:
    # Invalid page number (must be >= 1)
    response = client.get("/api/v1/places?page=0")
    assert response.status_code == 422
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "VALIDATION_ERROR"
    assert "details" in data["error"]
    assert "request_id" in data


def test_invalid_enum_filter(client: TestClient) -> None:
    # Invalid category enum value
    response = client.get("/api/v1/places?category=outer_space")
    assert response.status_code == 422
    data = response.json()
    assert data["error"]["code"] == "VALIDATION_ERROR"


def test_request_id_header_propagation(client: TestClient) -> None:
    custom_req_id = "test-custom-req-id-12345"
    response = client.get("/", headers={"X-Request-ID": custom_req_id})
    assert response.status_code == 200
    assert response.headers.get("X-Request-ID") == custom_req_id
