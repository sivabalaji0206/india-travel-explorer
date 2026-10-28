"""Repository for SavedPlan queries and mutations."""

from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.saved_plan import SavedPlan


class SavedPlanRepository:
    """Encapsulates persistence operations for saved travel itineraries."""

    def list_by_user(self, db: Session, user_id: int) -> list[SavedPlan]:
        """Fetch all plans saved by a user, newest first."""
        stmt = (
            select(SavedPlan)
            .where(SavedPlan.user_id == user_id)
            .options(joinedload(SavedPlan.state))
            .order_by(SavedPlan.created_at.desc())
        )
        return list(db.execute(stmt).scalars().all())

    def get_by_id_and_user(self, db: Session, plan_id: int, user_id: int) -> SavedPlan | None:
        """Fetch a specific plan ensuring user ownership."""
        stmt = (
            select(SavedPlan)
            .where(SavedPlan.id == plan_id, SavedPlan.user_id == user_id)
            .options(joinedload(SavedPlan.state))
        )
        return db.execute(stmt).scalar_one_or_none()

    def create(
        self,
        db: Session,
        *,
        user_id: int,
        state_id: int,
        title: str,
        preferences: dict[str, Any] | None,
        plan_json: dict[str, Any],
    ) -> SavedPlan:
        """Create and persist a new itinerary for a user."""
        plan = SavedPlan(
            user_id=user_id,
            state_id=state_id,
            title=title.strip(),
            preferences=preferences,
            plan_json=plan_json,
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)
        return plan

    def update(
        self,
        db: Session,
        plan: SavedPlan,
        *,
        title: str | None = None,
        plan_json: dict[str, Any] | None = None,
    ) -> SavedPlan:
        """Update plan title or contents."""
        if title is not None:
            plan.title = title.strip()
        if plan_json is not None:
            plan.plan_json = plan_json
        db.commit()
        db.refresh(plan)
        return plan

    def delete(self, db: Session, plan: SavedPlan) -> None:
        """Permanently delete a saved plan."""
        db.delete(plan)
        db.commit()
