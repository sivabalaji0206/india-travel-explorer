"""SavedPlan service orchestrating user plan CRUD and ownership validation."""

from sqlalchemy.orm import Session

from app.core.exceptions import EntityNotFoundError
from app.repositories.saved_plan_repository import SavedPlanRepository
from app.repositories.state_repository import StateRepository
from app.schemas.planner import TripPlanResponse
from app.schemas.saved_plan import (
    SavedPlanDetailResponse,
    SavedPlanSummaryResponse,
    SavePlanRequest,
    UpdatePlanRequest,
)


class SavedPlanService:
    """Business logic for saving, updating, and viewing travel itineraries."""

    def __init__(
        self,
        saved_plan_repo: SavedPlanRepository | None = None,
        state_repo: StateRepository | None = None,
    ) -> None:
        self.saved_plan_repo = saved_plan_repo or SavedPlanRepository()
        self.state_repo = state_repo or StateRepository()

    def list_user_plans(self, db: Session, user_id: int) -> list[SavedPlanSummaryResponse]:
        """Fetch all plans belonging to the authenticated user."""
        plans = self.saved_plan_repo.list_by_user(db, user_id)
        results: list[SavedPlanSummaryResponse] = []
        for p in plans:
            total_days = p.plan_json.get("total_days", 1) if isinstance(p.plan_json, dict) else 1
            results.append(
                SavedPlanSummaryResponse(
                    id=p.id,
                    user_id=p.user_id,
                    state_id=p.state_id,
                    state_name=p.state.name if p.state else "Unknown",
                    title=p.title,
                    total_days=total_days,
                    created_at=p.created_at,
                    updated_at=p.updated_at,
                )
            )
        return results

    def get_user_plan(self, db: Session, plan_id: int, user_id: int) -> SavedPlanDetailResponse:
        """Fetch a specific saved plan ensuring user ownership."""
        plan = self.saved_plan_repo.get_by_id_and_user(db, plan_id, user_id)
        if not plan:
            raise EntityNotFoundError("SavedPlan", plan_id)

        return SavedPlanDetailResponse(
            id=plan.id,
            user_id=plan.user_id,
            state_id=plan.state_id,
            state_name=plan.state.name if plan.state else "Unknown",
            title=plan.title,
            preferences=plan.preferences,
            plan_json=TripPlanResponse.model_validate(plan.plan_json),
            created_at=plan.created_at,
            updated_at=plan.updated_at,
        )

    def create_user_plan(
        self, db: Session, user_id: int, payload: SavePlanRequest
    ) -> SavedPlanDetailResponse:
        """Save a generated itinerary under the user's account."""
        state = self.state_repo.get_state_by_id(db, payload.state_id)
        if not state:
            raise EntityNotFoundError("State", payload.state_id)

        plan = self.saved_plan_repo.create(
            db,
            user_id=user_id,
            state_id=payload.state_id,
            title=payload.title,
            preferences=payload.preferences,
            plan_json=payload.plan_json.model_dump(mode="json"),
        )

        return SavedPlanDetailResponse(
            id=plan.id,
            user_id=plan.user_id,
            state_id=plan.state_id,
            state_name=state.name,
            title=plan.title,
            preferences=plan.preferences,
            plan_json=TripPlanResponse.model_validate(plan.plan_json),
            created_at=plan.created_at,
            updated_at=plan.updated_at,
        )

    def update_user_plan(
        self,
        db: Session,
        plan_id: int,
        user_id: int,
        payload: UpdatePlanRequest,
    ) -> SavedPlanDetailResponse:
        """Update plan title or contents for the authenticated owner."""
        plan = self.saved_plan_repo.get_by_id_and_user(db, plan_id, user_id)
        if not plan:
            raise EntityNotFoundError("SavedPlan", plan_id)

        plan_json_dict = payload.plan_json.model_dump(mode="json") if payload.plan_json else None
        updated = self.saved_plan_repo.update(
            db,
            plan,
            title=payload.title,
            plan_json=plan_json_dict,
        )

        return SavedPlanDetailResponse(
            id=updated.id,
            user_id=updated.user_id,
            state_id=updated.state_id,
            state_name=updated.state.name if updated.state else "Unknown",
            title=updated.title,
            preferences=updated.preferences,
            plan_json=TripPlanResponse.model_validate(updated.plan_json),
            created_at=updated.created_at,
            updated_at=updated.updated_at,
        )

    def delete_user_plan(self, db: Session, plan_id: int, user_id: int) -> None:
        """Delete an itinerary owned by the authenticated user."""
        plan = self.saved_plan_repo.get_by_id_and_user(db, plan_id, user_id)
        if not plan:
            raise EntityNotFoundError("SavedPlan", plan_id)
        self.saved_plan_repo.delete(db, plan)
