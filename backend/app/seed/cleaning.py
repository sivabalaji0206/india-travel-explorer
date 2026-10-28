"""Text cleaning helpers for the raw dataset."""

import re

from app.seed.config import NamedPlaceRules

_CITATION_RE = re.compile(r"(?:\s*\[web:[^\]]*\])+")
_WHITESPACE_RE = re.compile(r"\s+")
_TRAILING_PARENTHETICAL_RE = re.compile(r"^(?P<name>.*?)\s*\((?P<note>[^()]*)\)\s*$")
_NON_ALNUM_RE = re.compile(r"[^a-z0-9]+")
_TRAILING_PUNCTUATION = " .;,"


def clean_text(value: str) -> str:
    """Remove citation markers, collapse whitespace and trim trailing punctuation."""
    without_citations = _CITATION_RE.sub("", value)
    return _WHITESPACE_RE.sub(" ", without_citations).strip(_TRAILING_PUNCTUATION)


def split_trailing_note(value: str) -> tuple[str, str | None]:
    """Split ``"Rohtang Pass (seasonal)"`` into ``("Rohtang Pass", "seasonal")``."""
    match = _TRAILING_PARENTHETICAL_RE.match(value)
    if match is None or not match.group("name").strip():
        return value, None
    note = match.group("note").strip()
    return match.group("name").strip(), note or None


def to_label(value: str) -> str:
    """Normalise a label to lower case snake case (``"Hill_station"`` -> ``"hill_station"``)."""
    return _NON_ALNUM_RE.sub("_", value.lower()).strip("_")


def normalise_key(value: str) -> str:
    """Case, punctuation and spacing insensitive key used for matching and de-duplication."""
    return _NON_ALNUM_RE.sub(" ", value.lower()).strip()


def looks_named(name: str, rules: NamedPlaceRules) -> bool:
    """Return True when ``name`` looks like a real named place rather than a generic phrase."""
    if not rules.min_name_length <= len(name) <= rules.max_name_length:
        return False
    words = name.split()
    if words[0].lower() in rules.generic_first_words:
        return False
    connectors = set(rules.connector_words)
    significant = [word for word in words if word.lower() not in connectors]
    return bool(significant) and all(word[0].isupper() or word[0].isdigit() for word in significant)
