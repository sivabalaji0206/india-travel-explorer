"""Idempotent loader: upserts seed records into PostgreSQL (re-running updates, never duplicates)."""

from collections.abc import Iterator, Sequence
from dataclasses import dataclass
from typing import Any

from sqlalchemy import func
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.models import (
    Destination,
    DestinationCostTier,
    Eatery,
    Food,
    Place,
    State,
)
from app.models.base import Base
from app.seed.records import SeedBundle

BATCH_SIZE = 500


@dataclass
class LoadSummary:
    """Row counts written by a load."""

    states: int
    destinations: int
    cost_tiers: int
    places: int
    foods: int
    eateries: int


def _batches(rows: Sequence[dict[str, Any]]) -> Iterator[Sequence[dict[str, Any]]]:
    for start in range(0, len(rows), BATCH_SIZE):
        yield rows[start : start + BATCH_SIZE]


def _upsert(
    session: Session,
    model: type[Base],
    rows: list[dict[str, Any]],
    conflict_columns: list[str],
) -> list[Any]:
    """Insert ``rows``; on a conflict update the other columns. Returns (id, *conflict) rows."""
    returned: list[Any] = []
    if not rows:
        return returned
    update_columns = [c for c in rows[0] if c not in conflict_columns]
    for batch in _batches(rows):
        insert_stmt = insert(model).values(list(batch))
        upsert_stmt = insert_stmt.on_conflict_do_update(
            index_elements=conflict_columns,
            set_={
                **{column: insert_stmt.excluded[column] for column in update_columns},
                "updated_at": func.now(),
            },
        ).returning(model.id, *(getattr(model, c) for c in conflict_columns))  # type: ignore[attr-defined]
        returned.extend(session.execute(upsert_stmt).all())
    return returned


def load_bundle(session: Session, bundle: SeedBundle) -> LoadSummary:
    """Write ``bundle`` to the database inside the caller's transaction."""
    state_ids = _load_states(session, bundle)
    destination_ids = _load_destinations(session, bundle, state_ids)
    tiers = _load_cost_tiers(session, bundle, destination_ids)
    places = _load_places(session, bundle, state_ids, destination_ids)
    foods = _load_foods(session, bundle, state_ids, destination_ids)
    eateries = _load_eateries(session, bundle, destination_ids)
    return LoadSummary(
        states=len(state_ids),
        destinations=len(destination_ids),
        cost_tiers=tiers,
        places=places,
        foods=foods,
        eateries=eateries,
    )


def _load_states(session: Session, bundle: SeedBundle) -> dict[str, int]:
    rows = [{"name": s.name, "region": s.region} for s in bundle.states]
    return {name: state_id for state_id, name in _upsert(session, State, rows, ["name"])}


def _load_destinations(
    session: Session, bundle: SeedBundle, state_ids: dict[str, int]
) -> dict[tuple[str, str], int]:
    rows = [
        {
            "state_id": state_ids[d.state],
            "name": d.name,
            "district": d.district,
            "latitude": d.latitude,
            "longitude": d.longitude,
            "altitude_m": d.altitude_m,
            "popularity_score": d.popularity_score,
            "best_seasons": [season.value for season in d.best_seasons],
            "trip_types": d.trip_types,
            "min_days": d.min_days,
            "ideal_days": d.ideal_days,
            "max_days": d.max_days,
            "description": d.description,
            "local_culture": d.local_culture,
            "festivals_events": d.festivals_events,
            "suggested_itinerary": d.suggested_itinerary,
            "safety_rating": d.safety_rating,
            "permits_required": d.permits_required,
            "permits_details": d.permits_details,
            "nearest_airport": d.nearest_airport,
            "nearest_railway_station": d.nearest_railway_station,
            "source_last_updated": d.source_last_updated,
            "data_source": d.data_source,
        }
        for d in bundle.destinations
    ]
    names_by_state_id = {state_id: name for name, state_id in state_ids.items()}
    returned = _upsert(session, Destination, rows, ["state_id", "name"])
    return {(names_by_state_id[state_id], name): dest_id for dest_id, state_id, name in returned}


def _load_cost_tiers(
    session: Session, bundle: SeedBundle, destination_ids: dict[tuple[str, str], int]
) -> int:
    rows = []
    for destination in bundle.destinations:
        for tier in destination.cost_tiers:
            row: dict[str, Any] = {
                "destination_id": destination_ids[(destination.state, destination.name)],
                "tier": tier.tier,
                "is_estimated": tier.is_estimated,
            }
            for part, (low, high) in tier.ranges.items():
                row[f"{part}_min"] = low
                row[f"{part}_max"] = high
            rows.append(row)
    return len(_upsert(session, DestinationCostTier, rows, ["destination_id", "tier"]))


def _load_places(
    session: Session,
    bundle: SeedBundle,
    state_ids: dict[str, int],
    destination_ids: dict[tuple[str, str], int],
) -> int:
    rows = [
        {
            "state_id": state_ids[p.state],
            "destination_id": destination_ids[(p.state, p.destination)],
            "name": p.name,
            "category": p.category,
            "description": p.description,
            "best_season": p.best_season,
            "entry_fee": p.entry_fee,
            "avg_daily_cost": p.avg_daily_cost,
            "budget_level": p.budget_level,
            "is_hidden_gem": p.is_hidden_gem,
            "data_source": p.data_source,
        }
        for p in bundle.places
    ]
    return len(_upsert(session, Place, rows, ["state_id", "name"]))


def _load_foods(
    session: Session,
    bundle: SeedBundle,
    state_ids: dict[str, int],
    destination_ids: dict[tuple[str, str], int],
) -> int:
    rows = [
        {
            "state_id": state_ids[f.state],
            "destination_id": destination_ids[(f.state, f.destination)],
            "name": f.name,
            "food_type": f.food_type,
            "description": f.description,
            "avg_price": f.avg_price,
            "price_is_estimated": f.price_is_estimated,
            "data_source": f.data_source,
        }
        for f in bundle.foods
    ]
    return len(_upsert(session, Food, rows, ["destination_id", "name"]))


def _load_eateries(
    session: Session, bundle: SeedBundle, destination_ids: dict[tuple[str, str], int]
) -> int:
    rows = [
        {
            "destination_id": destination_ids[(e.state, e.destination)],
            "name": e.name,
            "area": e.area,
            "meal_type": e.meal_type,
            "data_source": e.data_source,
        }
        for e in bundle.eateries
    ]
    return len(_upsert(session, Eatery, rows, ["destination_id", "name", "meal_type"]))
