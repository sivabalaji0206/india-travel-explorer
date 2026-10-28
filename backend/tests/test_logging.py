"""Tests for structured logging."""

import json
import logging

from app.core.logging import JsonFormatter, RequestIdFilter, request_id_ctx


def _record(message: str, **extra: object) -> logging.LogRecord:
    record = logging.LogRecord("test.logger", logging.INFO, __file__, 1, message, None, None)
    for key, value in extra.items():
        setattr(record, key, value)
    RequestIdFilter().filter(record)
    return record


def test_json_formatter_includes_request_id_and_extra_fields() -> None:
    token = request_id_ctx.set("req-123")
    try:
        payload = json.loads(JsonFormatter().format(_record("hello", latency_ms=42)))
    finally:
        request_id_ctx.reset(token)

    assert payload["message"] == "hello"
    assert payload["level"] == "INFO"
    assert payload["request_id"] == "req-123"
    assert payload["latency_ms"] == 42
