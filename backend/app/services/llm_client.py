"""Enterprise LLM client wrapping Gemini API via google.genai with self-correcting retries."""

from collections.abc import Callable
import json
import logging
import re
from typing import Any, TypeVar

from google import genai
from google.genai import types
from pydantic import ValidationError

from app.core.config import Settings, get_settings
from app.core.exceptions import BadRequestError, ExternalServiceError

logger = logging.getLogger(__name__)

_JSON_BLOCK_RE = re.compile(r"```(?:json)?\s*([\s\S]*?)\s*```")
MIN_SAFE_JSON_TOKENS = 8192

T = TypeVar("T")


def sanitize_json_text(text: str) -> str:
    """Extract raw JSON text from markdown code blocks or surrounding prose."""
    match = _JSON_BLOCK_RE.search(text)
    if match:
        return match.group(1).strip()
    stripped = text.strip()
    if stripped.startswith("{") and stripped.endswith("}"):
        return stripped
    first_brace = stripped.find("{")
    last_brace = stripped.rfind("}")
    if first_brace != -1 and last_brace > first_brace:
        return stripped[first_brace : last_brace + 1]
    return stripped


class LlmClient:
    """Enterprise Gemini client with thinking budget control and self-healing schema retries."""

    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()
        self._client: genai.Client | None = None
        self._raw_key: str = ""
        self._vertex_mode: bool = False
        if self.settings.gemini_api_key and self.settings.gemini_api_key.get_secret_value().strip():
            self._raw_key = self.settings.gemini_api_key.get_secret_value().strip()
            # Keys starting with "AQ." are Google Cloud Vertex AI Express Mode / newer authorization keys
            self._vertex_mode = self._raw_key.startswith("AQ.")
            self._client = genai.Client(vertexai=self._vertex_mode, api_key=self._raw_key)

    @property
    def has_api_key(self) -> bool:
        """True if a valid Gemini API key is configured."""
        return self._client is not None

    def _supports_thinking_budget(self) -> bool:
        model_lower = (self.settings.llm_model or "").lower()
        return "2.5" in model_lower or "gemini-3" in model_lower

    def generate_json(
        self,
        system_instruction: str,
        prompt: str,
        *,
        retries: int = 2,
        thinking_budget: int = 1024,
        validator: Callable[[dict[str, Any]], T] | None = None,
    ) -> tuple[dict[str, Any], int, int]:
        """Call Gemini to generate valid, schema-verified JSON with self-correction retries."""
        if not self._client:
            raise BadRequestError("Gemini API key is not configured.")

        last_error: Exception | None = None
        current_prompt = prompt
        total_prompt_tokens = 0
        total_completion_tokens = 0

        # Ensure thinking models never truncate structured JSON output mid-stream
        effective_max_tokens = max(self.settings.llm_max_output_tokens, MIN_SAFE_JSON_TOKENS)

        config_kwargs: dict[str, Any] = {
            "system_instruction": system_instruction,
            "temperature": self.settings.llm_temperature,
            "max_output_tokens": effective_max_tokens,
            "response_mime_type": "application/json",
        }
        if self._supports_thinking_budget():
            config_kwargs["thinking_config"] = types.ThinkingConfig(
                thinking_budget=thinking_budget
            )

        for attempt in range(retries + 1):
            try:
                response = self._client.models.generate_content(
                    model=self.settings.llm_model,
                    contents=current_prompt,
                    config=types.GenerateContentConfig(**config_kwargs),
                )
                if response.usage_metadata:
                    total_prompt_tokens += response.usage_metadata.prompt_token_count or 0
                    total_completion_tokens += response.usage_metadata.candidates_token_count or 0

                text = response.text or ""
                cleaned = sanitize_json_text(text)
                parsed: dict[str, Any] = json.loads(cleaned)

                if validator is not None:
                    validator(parsed)

                return parsed, total_prompt_tokens, total_completion_tokens

            except (json.JSONDecodeError, ValidationError, ValueError) as exc:
                last_error = exc
                logger.warning(
                    "LLM output validation failed on attempt %d/%d: %s",
                    attempt + 1,
                    retries + 1,
                    exc,
                )
                current_prompt = (
                    f"{prompt}\n\n"
                    "### SELF-CORRECTION REQUIRED FROM PREVIOUS ATTEMPT:\n"
                    f"Your previous JSON output failed validation with error:\n{exc}\n"
                    "Fix every issue above and return ONLY complete, valid JSON matching the exact schema."
                )
            except Exception as exc:
                err_str = str(exc)
                if (
                    self._raw_key.startswith("AQ.")
                    and ("API_KEY_INVALID" in err_str or "UNAUTHENTICATED" in err_str or "401" in err_str or "400" in err_str)
                    and not getattr(self, "_toggled_endpoint", False)
                ):
                    self._toggled_endpoint = True
                    self._vertex_mode = not self._vertex_mode
                    logger.info(
                        "Toggling Gemini client vertexai=%s for AQ. authorization key retry.",
                        self._vertex_mode,
                    )
                    self._client = genai.Client(vertexai=self._vertex_mode, api_key=self._raw_key)
                    continue
                logger.warning("Upstream Gemini API call failed: %s", exc)
                raise ExternalServiceError(
                    "The AI Travel Concierge encountered an upstream provider issue. "
                    "Please try again in a few moments."
                ) from exc

        raise ExternalServiceError(
            f"AI Travel Concierge could not finalize a valid itinerary after {retries + 1} attempts: {last_error}"
        )
