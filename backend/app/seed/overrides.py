"""Developer corrections applied on top of the rule based import (``data/overrides``)."""

import csv
from dataclasses import dataclass, field
from pathlib import Path

from app.seed.cleaning import normalise_key

OVERRIDES_FILE = "overrides.csv"
KIND_PLACE = "place"
KIND_FOOD = "food"
KIND_EATERY_CITY = "eatery_city"
VALID_KINDS = {KIND_PLACE, KIND_FOOD, KIND_EATERY_CITY}
TRUE_VALUES = {"true", "yes", "1"}
FALSE_VALUES = {"false", "no", "0"}
REQUIRED_COLUMNS = {"kind", "state", "name", "field", "value"}

OverrideKey = tuple[str, str, str]


def _key(kind: str, state: str, name: str) -> OverrideKey:
    return kind, normalise_key(state), normalise_key(name)


@dataclass
class OverrideSet:
    """Field overrides keyed by (kind, state, name)."""

    values: dict[OverrideKey, dict[str, str]] = field(default_factory=dict)

    def get(self, kind: str, state: str, name: str) -> dict[str, str]:
        """Return the overrides for one record (empty when there are none)."""
        return self.values.get(_key(kind, state, name), {})

    def is_included(self, kind: str, state: str, name: str) -> bool:
        """Return False when the developer excluded the record."""
        raw = self.get(kind, state, name).get("include")
        if raw is None:
            return True
        lowered = raw.strip().lower()
        if lowered in TRUE_VALUES:
            return True
        if lowered in FALSE_VALUES:
            return False
        raise ValueError(f"Invalid include value {raw!r} for {kind} {state}|{name}")


def load_overrides(directory: Path) -> OverrideSet:
    """Load ``overrides.csv`` (columns: kind,state,name,field,value). Missing file means none."""
    path = directory / OVERRIDES_FILE
    if not path.exists():
        return OverrideSet()
    overrides = OverrideSet()
    with path.open(encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        if not REQUIRED_COLUMNS.issubset(reader.fieldnames or []):
            raise ValueError(f"{path} must have columns {sorted(REQUIRED_COLUMNS)}")
        for line_number, row in enumerate(reader, start=2):
            if row["kind"] not in VALID_KINDS:
                raise ValueError(f"{path}:{line_number} unknown kind {row['kind']!r}")
            key = _key(row["kind"], row["state"], row["name"])
            overrides.values.setdefault(key, {})[row["field"].strip()] = row["value"].strip()
    return overrides
