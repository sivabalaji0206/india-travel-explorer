"""Repository for Destination queries."""

from typing import Any

from sqlalchemy import String, cast, distinct, func, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models.destination import Destination
from app.models.place import Place
from app.models.state import State


class DestinationRepository:
    """Encapsulates database access for travel destinations."""

    def list_destinations(
        self,
        db: Session,
        *,
        state_id: int | None = None,
        search: str | None = None,
        trip_type: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[dict[str, Any]], int]:
        """Return paginated destinations matching filters and total matching count."""
        base_query = (
            select(
                Destination,
                State.name.label("state_name"),
                func.count(distinct(Place.id)).label("place_count"),
            )
            .join(State, State.id == Destination.state_id)
            .outerjoin(Place, Place.destination_id == Destination.id)
        )

        conditions = []
        if state_id is not None:
            conditions.append(Destination.state_id == state_id)
        if search:
            search_pattern = f"%{search.strip()}%"
            conditions.append(
                Destination.name.ilike(search_pattern) | Destination.district.ilike(search_pattern)
            )
        if trip_type:
            # Using cast to string for broad DB compatibility (Postgres ARRAY & SQLite string)
            conditions.append(cast(Destination.trip_types, String).ilike(f"%{trip_type.strip()}%"))

        if conditions:
            base_query = base_query.where(*conditions)

        # Count total distinct destinations matching conditions
        count_stmt = select(func.count(distinct(Destination.id)))
        if conditions:
            count_stmt = count_stmt.where(*conditions)
        total_items = db.execute(count_stmt).scalar() or 0

        # Paginated fetch ordered by popularity then name
        data_stmt = (
            base_query.group_by(Destination.id, State.name)
            .order_by(Destination.popularity_score.desc().nullslast(), Destination.name.asc())
            .offset(offset)
            .limit(limit)
        )

        results = db.execute(data_stmt).all()
        items: list[dict[str, Any]] = []
        for dest, state_name, place_count in results:
            items.append(
                {
                    "id": dest.id,
                    "state_id": dest.state_id,
                    "state_name": state_name,
                    "name": dest.name,
                    "district": dest.district,
                    "latitude": dest.latitude,
                    "longitude": dest.longitude,
                    "altitude_m": dest.altitude_m,
                    "popularity_score": dest.popularity_score,
                    "best_seasons": dest.best_seasons or [],
                    "trip_types": dest.trip_types or [],
                    "min_days": dest.min_days,
                    "ideal_days": dest.ideal_days,
                    "max_days": dest.max_days,
                    "description": dest.description,
                    "safety_rating": dest.safety_rating,
                    "permits_required": dest.permits_required,
                    "place_count": place_count,
                    "data_source": dest.data_source,
                }
            )

        return items, total_items

    def get_destination_detail(self, db: Session, destination_id: int) -> Destination | None:
        """Fetch destination by ID with state, cost_tiers, eateries, and foods eagerly loaded."""
        stmt = (
            select(Destination)
            .where(Destination.id == destination_id)
            .options(
                joinedload(Destination.state),
                selectinload(Destination.cost_tiers),
                selectinload(Destination.eateries),
                selectinload(Destination.foods),
            )
        )
        return db.execute(stmt).scalar_one_or_none()
