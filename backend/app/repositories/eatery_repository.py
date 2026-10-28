"""Repository for Eatery queries."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.eatery import Eatery


class EateryRepository:
    """Encapsulates database access for recommended restaurants and cafes."""

    def get_eateries_by_destination_id(
        self, db: Session, destination_id: int, limit: int = 15
    ) -> list[Eatery]:
        """Fetch recommended eateries for a destination."""
        stmt = (
            select(Eatery)
            .where(Eatery.destination_id == destination_id)
            .order_by(Eatery.name.asc())
            .limit(limit)
        )
        return list(db.execute(stmt).scalars().all())
