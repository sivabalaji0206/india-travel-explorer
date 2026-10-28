"""Repository for Food queries."""

from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.core.enums import FoodType
from app.models.destination import Destination
from app.models.food import Food


class FoodRepository:
    """Encapsulates database access for culinary specialties."""

    def list_foods(
        self,
        db: Session,
        *,
        state_id: int | None = None,
        destination_id: int | None = None,
        food_type: FoodType | None = None,
        search: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[dict[str, Any]], int]:
        """Return paginated foods matching criteria with total count."""
        base_query = select(Food, Destination.name.label("destination_name")).join(
            Destination, Destination.id == Food.destination_id
        )

        conditions = []
        if state_id is not None:
            conditions.append(Food.state_id == state_id)
        if destination_id is not None:
            conditions.append(Food.destination_id == destination_id)
        if food_type is not None:
            conditions.append(Food.food_type == food_type)
        if search:
            search_pattern = f"%{search.strip()}%"
            conditions.append(Food.name.ilike(search_pattern))

        if conditions:
            base_query = base_query.where(*conditions)

        count_stmt = select(func.count(Food.id))
        if conditions:
            count_stmt = count_stmt.where(*conditions)
        total_items = db.execute(count_stmt).scalar() or 0

        data_stmt = base_query.order_by(Food.name.asc()).offset(offset).limit(limit)

        results = db.execute(data_stmt).all()
        items: list[dict[str, Any]] = []
        for food, dest_name in results:
            items.append(
                {
                    "id": food.id,
                    "state_id": food.state_id,
                    "destination_id": food.destination_id,
                    "destination_name": dest_name,
                    "name": food.name,
                    "food_type": food.food_type,
                    "description": food.description,
                    "avg_price": food.avg_price,
                    "price_is_estimated": food.price_is_estimated,
                    "data_source": food.data_source,
                }
            )

        return items, total_items

    def get_foods_by_destination_id(
        self, db: Session, destination_id: int, limit: int = 10
    ) -> list[Food]:
        """Fetch popular foods for a destination."""
        stmt = (
            select(Food)
            .where(Food.destination_id == destination_id)
            .order_by(Food.name.asc())
            .limit(limit)
        )
        return list(db.execute(stmt).scalars().all())

    def get_foods_by_state_id(self, db: Session, state_id: int, limit: int = 10) -> list[Food]:
        """Fetch representative foods across a state."""
        stmt = (
            select(Food)
            .where(Food.state_id == state_id)
            .options(joinedload(Food.destination))
            .order_by(Food.name.asc())
            .limit(limit)
        )
        return list(db.execute(stmt).scalars().all())

    def get_rag_foods(
        self,
        db: Session,
        *,
        state_id: int,
        food_type: FoodType | None = None,
        limit: int = 20,
    ) -> list[Food]:
        """Fetch candidate dishes in a state matching food preference."""
        stmt = select(Food).where(Food.state_id == state_id).options(joinedload(Food.destination))
        if food_type is not None:
            stmt = stmt.where(Food.food_type == food_type)
        return list(db.execute(stmt.limit(limit)).scalars().all())
