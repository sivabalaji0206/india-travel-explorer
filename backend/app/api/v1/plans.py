"""Saved Plans CRUD API endpoints (FR-22, FR-23)."""

from typing import Annotated

from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.saved_plan import (
    SavedPlanDetailResponse,
    SavedPlanSummaryResponse,
    SavePlanRequest,
    UpdatePlanRequest,
)
from app.services.saved_plan_service import SavedPlanService

router = APIRouter(prefix="/plans", tags=["Saved Plans"])


def get_saved_plan_service() -> SavedPlanService:
    """Dependency provider for SavedPlanService."""
    return SavedPlanService()


@router.get("", response_model=list[SavedPlanSummaryResponse])
def list_saved_plans(
    current_user: User = Depends(get_current_user),
    service: SavedPlanService = Depends(get_saved_plan_service),
    db: Session = Depends(get_db),
) -> list[SavedPlanSummaryResponse]:
    """List all trip plans saved by the authenticated user."""
    return service.list_user_plans(db, user_id=current_user.id)


@router.post("", response_model=SavedPlanDetailResponse, status_code=status.HTTP_201_CREATED)
def save_plan(
    payload: SavePlanRequest,
    current_user: User = Depends(get_current_user),
    service: SavedPlanService = Depends(get_saved_plan_service),
    db: Session = Depends(get_db),
) -> SavedPlanDetailResponse:
    """Save a generated itinerary to the authenticated user's account."""
    return service.create_user_plan(db, user_id=current_user.id, payload=payload)


@router.get("/{id}", response_model=SavedPlanDetailResponse)
def get_saved_plan(
    id: Annotated[int, Path(ge=1, description="Saved Plan ID")],
    current_user: User = Depends(get_current_user),
    service: SavedPlanService = Depends(get_saved_plan_service),
    db: Session = Depends(get_db),
) -> SavedPlanDetailResponse:
    """Get full details of a saved itinerary."""
    return service.get_user_plan(db, plan_id=id, user_id=current_user.id)


@router.patch("/{id}", response_model=SavedPlanDetailResponse)
def update_saved_plan(
    id: Annotated[int, Path(ge=1, description="Saved Plan ID")],
    payload: UpdatePlanRequest,
    current_user: User = Depends(get_current_user),
    service: SavedPlanService = Depends(get_saved_plan_service),
    db: Session = Depends(get_db),
) -> SavedPlanDetailResponse:
    """Rename or modify a saved itinerary."""
    return service.update_user_plan(db, plan_id=id, user_id=current_user.id, payload=payload)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_saved_plan(
    id: Annotated[int, Path(ge=1, description="Saved Plan ID")],
    current_user: User = Depends(get_current_user),
    service: SavedPlanService = Depends(get_saved_plan_service),
    db: Session = Depends(get_db),
) -> None:
    """Delete a saved itinerary from user's account."""
    service.delete_user_plan(db, plan_id=id, user_id=current_user.id)
