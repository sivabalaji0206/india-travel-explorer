"""FastAPI application entry point for India Travel Explorer."""

from collections.abc import AsyncIterator, Awaitable, Callable
from contextlib import asynccontextmanager
import logging
import time
import uuid

from fastapi import FastAPI, Request, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1 import api_router
from app.core.config import get_settings
from app.core.exceptions import AppException
from app.core.logging import request_id_ctx, setup_logging

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Application lifespan context manager for startup and shutdown."""
    settings = get_settings()
    setup_logging(settings)
    logger.info("Application starting up: %s (%s)", settings.app_name, settings.app_env.value)
    yield
    logger.info("Application shutting down")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application instance."""
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="REST API for India Travel Explorer & AI Trip Planner (RAG Chatbot).",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # --- CORS Middleware ----------------------------------------------------
    allowed_origins = settings.cors_origins if settings.cors_origins else ["*"]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # --- Request Context & Logging Middleware -------------------------------
    @app.middleware("http")
    async def request_middleware(
        request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        req_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        token = request_id_ctx.set(req_id)
        request.state.request_id = req_id

        start_time = time.perf_counter()
        try:
            response = await call_next(request)
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            response.headers["X-Request-ID"] = req_id
            logger.info(
                "%s %s -> %s (%sms)",
                request.method,
                request.url.path,
                response.status_code,
                duration_ms,
            )
            return response
        except Exception as exc:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.exception(
                "Unhandled exception processing %s %s (%sms): %s",
                request.method,
                request.url.path,
                duration_ms,
                exc,
            )
            raise
        finally:
            request_id_ctx.reset(token)

    # --- Exception Handlers -------------------------------------------------
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        req_id = getattr(request.state, "request_id", None)
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                    "details": exc.details,
                },
                "request_id": req_id,
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        req_id = getattr(request.state, "request_id", None)
        errors = [
            {
                "loc": [str(loc_item) for loc_item in err.get("loc", [])],
                "msg": err.get("msg"),
                "type": err.get("type"),
            }
            for err in exc.errors()
        ]
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Input validation failed for the request.",
                    "details": errors,
                },
                "request_id": req_id,
            },
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        req_id = getattr(request.state, "request_id", None)
        code = "NOT_FOUND" if exc.status_code == 404 else "HTTP_ERROR"
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": code,
                    "message": exc.detail,
                    "details": None,
                },
                "request_id": req_id,
            },
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, _exc: Exception) -> JSONResponse:
        req_id = getattr(request.state, "request_id", None)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected server error occurred.",
                    "details": None,
                },
                "request_id": req_id,
            },
        )

    # --- Routes -------------------------------------------------------------
    app.include_router(api_router, prefix=settings.api_v1_prefix)

    @app.get("/", tags=["Root"])
    def root() -> dict[str, str]:
        """Root endpoint returning basic service info and documentation links."""
        return {
            "name": settings.app_name,
            "version": settings.app_version,
            "docs": "/docs",
            "api_v1": settings.api_v1_prefix,
        }

    return app


app = create_app()
