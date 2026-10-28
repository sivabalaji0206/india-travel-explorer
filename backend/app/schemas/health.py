"""Health and status check schema."""

from pydantic import BaseModel, ConfigDict

from app.core.enums import Environment


class HealthResponse(BaseModel):
    """Health check payload returned by /health endpoint."""

    model_config = ConfigDict(frozen=True)

    status: str
    app_name: str
    version: str
    environment: Environment
    database: str
