"""Shared test fixtures."""

from collections.abc import Callable
from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import app

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
def client() -> TestClient:
    """FastAPI test client."""
    return TestClient(app)
