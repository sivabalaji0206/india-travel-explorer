"""Shared test fixtures."""

from collections.abc import Callable, Iterator
from typing import Any

from fastapi.testclient import TestClient
import pytest

from app.api.v1.planner import get_planner_service
from app.core.config import Settings, get_settings
from app.main import app
from app.services.planner_service import PlannerService

SettingsFactory = Callable[..., Settings]

VALID_SETTINGS: dict[str, Any] = {
    "postgres_host": "db.example.test",
    "postgres_port": 5432,
    "postgres_db": "travel_test",
    "postgres_user": "tester",
    "postgres_password": "p@ss:word/1",
    "jwt_secret_key": "x" * 40,
    "llm_model": "test-model",
}


@pytest.fixture
def make_settings() -> SettingsFactory:
    """Build isolated Settings that ignore the developer's real .env file."""

    def _make(**overrides: Any) -> Settings:
        return Settings(_env_file=None, **{**VALID_SETTINGS, **overrides})  # type: ignore[arg-type]

    return _make


@pytest.fixture
def client() -> Iterator[TestClient]:
    """FastAPI test client isolated from external live LLM network calls during CI."""
    offline_settings = get_settings().model_copy(update={"gemini_api_key": None})
    app.dependency_overrides[get_planner_service] = lambda: PlannerService(settings=offline_settings)
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.pop(get_planner_service, None)
