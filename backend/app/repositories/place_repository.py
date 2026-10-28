"""Repository for Place queries."""

from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.core.enums import BudgetLevel, PlaceCategory, Season
from app.models.destination import Destination
from app.models.place import Place
from app.models.state import State


class PlaceRepository:
    """Encapsulates database access for tourist places and attractions."""

    def list_places(
        self,
        db: Session,
        *,
        state_id: int | None = None,
        destination_id: int | None = None,
        category: PlaceCategory | None = None,
        budget_level: BudgetLevel | None = None,
        best_season: Season | None = None,
        search: str | None = None,
        is_hidden_gem: bool | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[dict[str, Any]], int]:
        """Return paginated places matching filter criteria along with total count."""
        base_query = (
            select(
                Place,
                State.name.label("state_name"),
                Destination.name.label("destination_name"),
            )
            .join(State, State.id == Place.state_id)
            .join(Destination, Destination.id == Place.destination_id)
        )

        conditions = []
        if state_id is not None:
            conditions.append(Place.state_id == state_id)
        if destination_id is not None:
            conditions.append(Place.destination_id == destination_id)
        if category is not None:
            conditions.append(Place.category == category)
        if budget_level is not None:
            conditions.append(Place.budget_level == budget_level)
        if best_season is not None:
            conditions.append(Place.best_season == best_season)
        if is_hidden_gem is not None:
            conditions.append(Place.is_hidden_gem == is_hidden_gem)
        if search:
            search_pattern = f"%{search.strip()}%"
            conditions.append(Place.name.ilike(search_pattern))

        if conditions:
            base_query = base_query.where(*conditions)

        count_stmt = select(func.count(Place.id))
        if conditions:
            count_stmt = count_stmt.where(*conditions)
        total_items = db.execute(count_stmt).scalar() or 0

        data_stmt = base_query.order_by(Place.name.asc()).offset(offset).limit(limit)

        results = db.execute(data_stmt).all()
        items: list[dict[str, Any]] = []
        for place, state_name, destination_name in results:
            items.append(
                {
                    "id": place.id,
                    "state_id": place.state_id,
                    "state_name": state_name,
                    "destination_id": place.destination_id,
                    "destination_name": destination_name,
                    "name": place.name,
                    "category": place.category,
                    "description": place.description,
                    "best_season": place.best_season,
                    "entry_fee": place.entry_fee,
                    "avg_daily_cost": place.avg_daily_cost,
                    "budget_level": place.budget_level,
                    "latitude": place.latitude,
                    "longitude": place.longitude,
                    "image_url": place.image_url,
                    "is_hidden_gem": place.is_hidden_gem,
                    "data_source": place.data_source,
                }
            )

        return items, total_items

    def get_place_by_id(self, db: Session, place_id: int) -> Place | None:
        """Fetch place by ID with state and destination eagerly loaded."""
        stmt = (
            select(Place)
            .where(Place.id == place_id)
            .options(
                joinedload(Place.state),
                selectinload(Place.destination).selectinload(Destination.cost_tiers),
            )
        )
        return db.execute(stmt).scalar_one_or_none()
