"""Readers for the raw dataset files."""

import csv
import json
from pathlib import Path
from typing import Any

RAW_DIRECTORY = "raw"
TOURISM_JSON_FILE = "india_tourism_dataset.json"
CITY_CSV_FILE = "india-tourism-food-dataset.csv"


def read_tourism_json(data_dir: Path) -> list[dict[str, Any]]:
    """Read the destination level JSON dataset."""
    path = data_dir / RAW_DIRECTORY / TOURISM_JSON_FILE
    records: list[dict[str, Any]] = json.loads(path.read_text(encoding="utf-8"))
    return records


def read_city_csv(data_dir: Path) -> list[dict[str, str]]:
    """Read the city sheet (tourist spots, breakfast and dinner eateries)."""
    path = data_dir / RAW_DIRECTORY / CITY_CSV_FILE
    with path.open(encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))
