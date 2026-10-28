"""Command line entry point: ``python -m app.seed [--dry-run]``."""

import argparse
from collections.abc import Sequence
from pathlib import Path

from app.core.config import get_settings
from app.core.logging import get_logger, setup_logging
from app.db.session import get_session_factory
from app.seed.config import load_mapping_config
from app.seed.loader import load_bundle
from app.seed.overrides import load_overrides
from app.seed.report import write_review_files
from app.seed.sources import read_city_csv, read_tourism_json
from app.seed.transform import SeedTransformer

MAPPINGS_DIRECTORY = "mappings"
OVERRIDES_DIRECTORY = "overrides"
REVIEW_DIRECTORY = "review"

logger = get_logger(__name__)


def _parse_args(argv: Sequence[str] | None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Load the tourism dataset into PostgreSQL.")
    parser.add_argument("--dry-run", action="store_true", help="transform and write reports only")
    parser.add_argument("--data-dir", type=Path, help="override SEED_DATA_DIR")
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    """Run the import. Returns the process exit code."""
    args = _parse_args(argv)
    settings = get_settings()
    setup_logging(settings)
    data_dir: Path = args.data_dir or settings.seed_data_dir

    config = load_mapping_config(data_dir / MAPPINGS_DIRECTORY)
    overrides = load_overrides(data_dir / OVERRIDES_DIRECTORY)
    bundle = SeedTransformer(config, overrides).build(
        read_tourism_json(data_dir), read_city_csv(data_dir)
    )
    write_review_files(bundle.inferred, bundle.excluded, data_dir / REVIEW_DIRECTORY)
    logger.info(
        "Transformed dataset: %d states, %d destinations, %d places, %d foods, %d eateries "
        "(%d items excluded, see %s)",
        len(bundle.states),
        len(bundle.destinations),
        len(bundle.places),
        len(bundle.foods),
        len(bundle.eateries),
        len(bundle.excluded),
        data_dir / REVIEW_DIRECTORY,
    )
    if args.dry_run:
        logger.info("Dry run: database not modified")
        return 0

    with get_session_factory()() as session, session.begin():
        summary = load_bundle(session, bundle)
    logger.info(
        "Seed loaded: %d states, %d destinations, %d cost tiers, %d places, %d foods, %d eateries",
        summary.states,
        summary.destinations,
        summary.cost_tiers,
        summary.places,
        summary.foods,
        summary.eateries,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
