"""Health check endpoint."""

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.schemas.health import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
def health_check(db: Session = Depends(get_db)) -> HealthResponse | JSONResponse:
    """Verify application vitality and database connectivity."""
    settings = get_settings()
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as exc:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "degraded",
                "app_name": settings.app_name,
                "version": settings.app_version,
                "environment": settings.app_env.value,
                "database": f"disconnected: {exc}",
            },
        )

    return HealthResponse(
        status="healthy",
        app_name=settings.app_name,
        version=settings.app_version,
        environment=settings.app_env,
        database=db_status,
    )
