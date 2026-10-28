"""Typed application settings loaded from environment variables (BRD section 24).

Nothing environment specific or tunable is hardcoded elsewhere in the code base.
Values come from the process environment or the git-ignored ``backend/.env`` file.
"""

from functools import lru_cache
from pathlib import Path
from typing import Self

from pydantic import Field, SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL

from app.core.enums import Environment, LogLevel

BACKEND_DIR = Path(__file__).resolve().parents[2]
ENV_FILE = BACKEND_DIR / ".env"

MIN_SECRET_KEY_LENGTH = 32
INSECURE_SECRET_MARKER = "change-me"  # noqa: S105 - detection marker, not a credential
POSTGRES_DRIVER = "postgresql+psycopg"
LEGACY_POSTGRES_SCHEMES = ("postgres://", "postgresql://")
WILDCARD_ORIGIN = "*"


class Settings(BaseSettings):
    """Application configuration. Every field maps to an environment variable."""

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Application -------------------------------------------------------
    app_name: str = "India Travel Explorer"
    app_version: str = "0.1.0"
    app_env: Environment = Environment.DEVELOPMENT
    debug: bool = False
    api_v1_prefix: str = "/api/v1"
    cors_origins: list[str] = Field(default_factory=list)
    seed_data_dir: Path = BACKEND_DIR / "data"

    # --- Logging -----------------------------------------------------------
    log_level: LogLevel = LogLevel.INFO
    log_json: bool = True

    # --- Database ----------------------------------------------------------
    postgres_host: str
    postgres_port: int = Field(gt=0, lt=65536)
    postgres_db: str
    postgres_user: str
    postgres_password: SecretStr
    database_url: SecretStr | None = Field(
        default=None,
        description="Optional full URL (e.g. from a hosting provider); overrides POSTGRES_*.",
    )
    db_pool_size: int = Field(default=5, ge=1)
    db_max_overflow: int = Field(default=10, ge=0)
    db_pool_timeout_seconds: int = Field(default=30, ge=1)
    db_pool_recycle_seconds: int = Field(default=1800, ge=1)
    db_echo: bool = False

    # --- Security ----------------------------------------------------------
    jwt_secret_key: SecretStr
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = Field(default=60, ge=1)
    api_rate_limit: str = "60/minute"

    # --- Pagination (business rule, configurable) --------------------------
    default_page_size: int = Field(default=20, ge=1)
    max_page_size: int = Field(default=100, ge=1)

    # --- LLM and RAG -------------------------------------------------------
    feature_planner_enabled: bool = True
    gemini_api_key: SecretStr | None = None
    llm_model: str
    llm_temperature: float = Field(default=0.3, ge=0.0, le=2.0)
    llm_max_output_tokens: int = Field(default=2048, ge=1)
    llm_timeout_seconds: int = Field(default=30, ge=1)
    llm_invalid_json_retries: int = Field(default=1, ge=0)
    llm_daily_request_limit: int = Field(default=20, ge=1)
    rag_max_places: int = Field(default=20, ge=1)
    chat_history_turns: int = Field(default=6, ge=0)

    @field_validator("jwt_secret_key")
    @classmethod
    def _validate_secret_length(cls, value: SecretStr) -> SecretStr:
        if len(value.get_secret_value()) < MIN_SECRET_KEY_LENGTH:
            raise ValueError(f"JWT_SECRET_KEY must be at least {MIN_SECRET_KEY_LENGTH} characters")
        return value

    @model_validator(mode="after")
    def _validate_consistency(self) -> Self:
        if self.default_page_size > self.max_page_size:
            raise ValueError("DEFAULT_PAGE_SIZE must not exceed MAX_PAGE_SIZE")
        if self.app_env is Environment.PRODUCTION:
            self._validate_production()
        return self

    def _validate_production(self) -> None:
        """Fail fast on unsafe production configuration."""
        if self.debug:
            raise ValueError("DEBUG must be false in production")
        if INSECURE_SECRET_MARKER in self.jwt_secret_key.get_secret_value().lower():
            raise ValueError("JWT_SECRET_KEY must be replaced with a real secret in production")
        if WILDCARD_ORIGIN in self.cors_origins:
            raise ValueError("CORS_ORIGINS must not contain a wildcard in production")

    @property
    def sqlalchemy_database_url(self) -> str:
        """Return the SQLAlchemy URL, built from parts unless DATABASE_URL is set."""
        if self.database_url is not None:
            return self._normalise_url(self.database_url.get_secret_value())
        url = URL.create(
            drivername=POSTGRES_DRIVER,
            username=self.postgres_user,
            password=self.postgres_password.get_secret_value(),
            host=self.postgres_host,
            port=self.postgres_port,
            database=self.postgres_db,
        )
        return url.render_as_string(hide_password=False)

    @staticmethod
    def _normalise_url(raw_url: str) -> str:
        """Force the psycopg 3 driver for URLs given in provider-style formats."""
        for scheme in LEGACY_POSTGRES_SCHEMES:
            if raw_url.startswith(scheme):
                return f"{POSTGRES_DRIVER}://{raw_url.removeprefix(scheme)}"
        return raw_url


@lru_cache
def get_settings() -> Settings:
    """Return the cached settings instance (usable as a FastAPI dependency)."""
    return Settings()
