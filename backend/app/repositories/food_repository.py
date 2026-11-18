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
        limit: int = 30,
    ) -> list[Food]:
        """Fetch candidate dishes in a state with strict dietary safety and multi-day variety."""
        stmt = (
            select(Food)
            .where(Food.state_id == state_id)
            .options(joinedload(Food.destination))
            .order_by(Food.id.asc())
        )
        all_state_foods = list(db.execute(stmt.limit(max(limit, 30))).scalars().all())
        if not all_state_foods:
            return []

        # Mixed / No restriction: interleave Non-Veg, Veg, and Vegan for rich culinary diversity
        if food_type is None:
            non_veg = [f for f in all_state_foods if f.food_type == FoodType.NON_VEG]
            veg = [f for f in all_state_foods if f.food_type in (FoodType.VEG, FoodType.VEGAN)]
            interleaved: list[Food] = []
            max_len = max(len(non_veg), len(veg))
            for idx in range(max_len):
                if idx < len(non_veg):
                    interleaved.append(non_veg[idx])
                if idx < len(veg):
                    interleaved.append(veg[idx])
            return interleaved[:limit]

        # Strict Vegetarian: NEVER include Non-Veg
        if food_type == FoodType.VEG:
            return [
                f for f in all_state_foods if f.food_type in (FoodType.VEG, FoodType.VEGAN)
            ][:limit]

        # Strict Vegan: Vegan first, then plant-adaptable Veg dishes (excluding obvious dairy-heavy items)
        if food_type == FoodType.VEGAN:
            vegan_exact = [f for f in all_state_foods if f.food_type == FoodType.VEGAN]
            dairy_terms = (
                "paneer", "ghee", "lassi", "malai", "rabri", "rasgulla", "peda",
                "payasam", "kheer", "curd", "butter", "cheese", "milk", "jigarthanda",
                "pootharekulu", "mysore pak", "sandesh", "chhena",
            )
            plant_friendly_veg = [
                f for f in all_state_foods
                if f.food_type == FoodType.VEG
                and not any(term in f.name.lower() or term in (f.description or "").lower() for term in dairy_terms)
            ]
            fallback_veg = [
                f for f in all_state_foods
                if f.food_type == FoodType.VEG and f not in plant_friendly_veg
            ]
            return (vegan_exact + plant_friendly_veg + fallback_veg)[:limit]

        # Non-Veg preference: Non-Veg dishes first, supplemented with iconic regional Veg dishes
        # so predominantly vegetarian states (e.g. Gujarat, Rajasthan, Uttarakhand) never repeat 1 dish
        non_veg_first = [f for f in all_state_foods if f.food_type == FoodType.NON_VEG]
        veg_supplement = [f for f in all_state_foods if f.food_type != FoodType.NON_VEG]
        return (non_veg_first + veg_supplement)[:limit]
