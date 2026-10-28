"""Review reports: every inferred or excluded value, in the format of ``overrides.csv``.

Copy a row into ``data/overrides/overrides.csv`` and change ``value`` to correct it (for excluded
rows set ``include`` to ``true``), then run the seed again.
"""

import csv
from pathlib import Path

from app.seed.records import ReviewRow

INFERRED_FILE = "inferred_values.csv"
EXCLUDED_FILE = "excluded_items.csv"
COLUMNS = ["kind", "state", "name", "field", "value", "destination", "rule"]


def _write(path: Path, rows: list[ReviewRow]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(COLUMNS)
        for row in rows:
            writer.writerow(
                [row.kind, row.state, row.name, row.field, row.value, row.destination, row.rule]
            )


def write_review_files(
    inferred: list[ReviewRow], excluded: list[ReviewRow], directory: Path
) -> None:
    """Write the two review CSV files into ``directory``."""
    directory.mkdir(parents=True, exist_ok=True)
    _write(directory / INFERRED_FILE, inferred)
    _write(directory / EXCLUDED_FILE, excluded)
