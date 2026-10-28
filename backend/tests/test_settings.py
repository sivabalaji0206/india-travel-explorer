"""Tests for typed settings and their safety validations."""

import pytest
from pydantic import ValidationError

from app.core.config import Settings
from app.core.enums import Environment
from tests.conftest import SettingsFactory


def test_database_url_is_built_with_escaped_password(make_settings: SettingsFactory) -> None:
    url = make_settings().sqlalchemy_database_url
    assert url == "postgresql+psycopg://tester:p%40ss%3Aword%2F1@db.example.test:5432/travel_test"


@pytest.mark.parametrize("scheme", ["postgres", "postgresql"])
def test_database_url_override_forces_psycopg_driver(
    make_settings: SettingsFactory, scheme: str
) -> None:
    settings = make_settings(database_url=f"{scheme}://u:p@host:5432/db")
    assert settings.sqlalchemy_database_url == "postgresql+psycopg://u:p@host:5432/db"


def test_short_jwt_secret_is_rejected(make_settings: SettingsFactory) -> None:
    with pytest.raises(ValidationError, match="JWT_SECRET_KEY"):
        make_settings(jwt_secret_key="short")


def test_missing_database_config_is_rejected() -> None:

    with pytest.raises(ValidationError):
        Settings(_env_file=None)  # type: ignore[call-arg]


def test_default_page_size_cannot_exceed_max(make_settings: SettingsFactory) -> None:
    with pytest.raises(ValidationError, match="DEFAULT_PAGE_SIZE"):
        make_settings(default_page_size=50, max_page_size=10)


@pytest.mark.parametrize(
    ("overrides", "message"),
    [
        ({"debug": True}, "DEBUG"),
        ({"jwt_secret_key": "change-me-" + "x" * 30}, "JWT_SECRET_KEY"),
        ({"cors_origins": ["*"]}, "CORS_ORIGINS"),
    ],
)
def test_production_rejects_unsafe_configuration(
    make_settings: SettingsFactory, overrides: dict[str, object], message: str
) -> None:
    with pytest.raises(ValidationError, match=message):
        make_settings(app_env=Environment.PRODUCTION, **overrides)


def test_production_accepts_safe_configuration(make_settings: SettingsFactory) -> None:
    settings = make_settings(
        app_env=Environment.PRODUCTION, cors_origins=["https://travel.example.test"]
    )
    assert settings.app_env is Environment.PRODUCTION
