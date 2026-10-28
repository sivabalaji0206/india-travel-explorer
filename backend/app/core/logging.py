"""Structured logging with request ID correlation (BRD section 22, Observability)."""

import json
import logging
import sys
from contextvars import ContextVar
from datetime import UTC, datetime
from typing import Any

from app.core.config import Settings

REQUEST_ID_NOT_SET = "-"
request_id_ctx: ContextVar[str] = ContextVar("request_id", default=REQUEST_ID_NOT_SET)

# Attributes present on every LogRecord; anything else was passed through ``extra``.
_STANDARD_RECORD_ATTRS = frozenset(
    logging.LogRecord("", 0, "", 0, "", None, None).__dict__.keys()
) | {"message", "asctime", "request_id"}

TEXT_LOG_FORMAT = "%(asctime)s %(levelname)s [%(request_id)s] %(name)s: %(message)s"


class RequestIdFilter(logging.Filter):
    """Attach the current request ID to every log record."""

    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_ctx.get()
        return True


class JsonFormatter(logging.Formatter):
    """Render log records as single line JSON documents."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(record.created, tz=UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "request_id": getattr(record, "request_id", REQUEST_ID_NOT_SET),
            "message": record.getMessage(),
        }
        payload.update(
            {k: v for k, v in record.__dict__.items() if k not in _STANDARD_RECORD_ATTRS}
        )
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str)


def setup_logging(settings: Settings) -> None:
    """Configure the root logger from settings. Safe to call more than once."""
    handler = logging.StreamHandler(sys.stdout)
    handler.addFilter(RequestIdFilter())
    handler.setFormatter(
        JsonFormatter() if settings.log_json else logging.Formatter(TEXT_LOG_FORMAT)
    )
    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(settings.log_level.value)


def get_logger(name: str) -> logging.Logger:
    """Return a named logger."""
    return logging.getLogger(name)
