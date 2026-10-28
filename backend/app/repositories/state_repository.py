"""Repository for State queries."""

from typing import Any

from sqlalchemy import distinct, func, select
from sqlalchemy.orm import Session

from app.models.destination import Destination
from app.models.place import Place
from app.models.state import State


class StateRepository:
    """Encapsulates database access for Indian states."""

    def list_states_with_counts(
        self, db: Session, *, region: str | None = None
    ) -> list[dict[str, Any]]:
        """Return all states ordered by name with total places and destinations."""
        stmt = (
            select(
                State,
                func.count(distinct(Place.id)).label("place_count"),
                func.count(distinct(Destination.id)).label("destination_count"),
            )
            .outerjoin(Place, Place.state_id == State.id)
            .outerjoin(Destination, Destination.state_id == State.id)
            .group_by(State.id)
            .order_by(State.name.asc())
        )

        if region:
            stmt = stmt.where(func.lower(State.region).like(f"%{region.strip().lower()}%"))

        results = db.execute(stmt).all()
        items: list[dict[str, Any]] = []
        for state, place_count, destination_count in results:
            items.append(
                {
                    "id": state.id,
                    "name": state.name,
                    "region": state.region,
                    "description": state.description,
                    "best_time_to_visit": state.best_time_to_visit,
                    "place_count": place_count,
                    "destination_count": destination_count,
                }
            )
        return items

    def get_state_with_counts(self, db: Session, state_id: int) -> dict[str, Any] | None:
        """Return a single state with place and destination counts, or None."""
        stmt = (
            select(
                State,
                func.count(distinct(Place.id)).label("place_count"),
                func.count(distinct(Destination.id)).label("destination_count"),
            )
            .outerjoin(Place, Place.state_id == State.id)
            .outerjoin(Destination, Destination.state_id == State.id)
            .where(State.id == state_id)
            .group_by(State.id)
        )
        row = db.execute(stmt).first()
        if not row:
            return None

        state, place_count, destination_count = row
        return {
            "id": state.id,
            "name": state.name,
            "region": state.region,
            "description": state.description,
            "best_time_to_visit": state.best_time_to_visit,
            "place_count": place_count,
            "destination_count": destination_count,
        }

    def get_state_by_id(self, db: Session, state_id: int) -> State | None:
        """Fetch raw state entity by ID."""
        return db.get(State, state_id)

    def get_state_by_name(self, db: Session, name: str) -> State | None:
        """Fetch raw state entity by exact case-insensitive name."""
        stmt = select(State).where(func.lower(State.name) == name.strip().lower())
        return db.execute(stmt).scalar_one_or_none()
