"""LLM client wrapping Gemini API via google.genai with retry and deterministic fallback."""

import json
import logging
import re
from typing import Any

from google import genai
from google.genai import types

from app.core.config import Settings, get_settings
from app.core.exceptions import BadRequestError

logger = logging.getLogger(__name__)

_JSON_BLOCK_RE = re.compile(r"```(?:json)?\s*([\s\S]*?)\s*```")


def sanitize_json_text(text: str) -> str:
    """Extract raw JSON text from markdown code blocks or whitespace."""
    match = _JSON_BLOCK_RE.search(text)
    if match:
        return match.group(1).strip()
    return text.strip()


class LlmClient:
    """Interacts with the Gemini model with structured output, retries, and fallback."""

    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()
        self._client: genai.Client | None = None
        if self.settings.gemini_api_key and self.settings.gemini_api_key.get_secret_value().strip():
            self._client = genai.Client(api_key=self.settings.gemini_api_key.get_secret_value())

    @property
    def has_api_key(self) -> bool:
        """True if a valid Gemini API key is configured."""
        return self._client is not None

    def generate_json(
        self,
        system_instruction: str,
        prompt: str,
        *,
        retries: int = 1,
    ) -> tuple[dict[str, Any], int, int]:
        """Call Gemini to generate valid JSON, retrying once on JSONDecodeError (FR-20)."""
        if not self._client:
            raise BadRequestError("Gemini API key is not configured.")

        last_error: Exception | None = None
        current_prompt = prompt

        for attempt in range(retries + 1):
            try:
                response = self._client.models.generate_content(
                    model=self.settings.llm_model,
                    contents=current_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=self.settings.llm_temperature,
                        max_output_tokens=self.settings.llm_max_output_tokens,
                        response_mime_type="application/json",
                    ),
                )
                text = response.text or ""
                cleaned = sanitize_json_text(text)
                parsed: dict[str, Any] = json.loads(cleaned)

                # Tokens accounting
                prompt_tokens = 0
                completion_tokens = 0
                if response.usage_metadata:
                    prompt_tokens = response.usage_metadata.prompt_token_count or 0
                    completion_tokens = response.usage_metadata.candidates_token_count or 0

                return parsed, prompt_tokens, completion_tokens

            except (json.JSONDecodeError, ValueError) as exc:
                last_error = exc
                logger.warning(
                    "LLM JSON decoding failed on attempt %d: %s. Retrying...",
                    attempt + 1,
                    exc,
                )
                current_prompt = (
                    f"{prompt}\n\nIMPORTANT: Your previous output was invalid JSON. "
                    "Ensure you return ONLY clean, valid JSON matching the schema."
                )

        raise BadRequestError(
            f"Failed to obtain valid JSON from LLM after {retries + 1} attempts: {last_error}"
        )
