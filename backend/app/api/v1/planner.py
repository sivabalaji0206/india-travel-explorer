"""AI Trip Planner (RAG Chatbot) endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_optional_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.planner import (
    PlannerChatRequest,
    PlannerChatResponse,
    TripPlanRequest,
    TripPlanResponse,
)
from app.services.planner_service import PlannerService

router = APIRouter(prefix="/planner", tags=["AI Trip Planner"])


def get_planner_service() -> PlannerService:
    """Dependency provider for PlannerService."""
    return PlannerService()


@router.post("/generate", response_model=TripPlanResponse)
def generate_itinerary(
    request: TripPlanRequest,
    service: PlannerService = Depends(get_planner_service),
    user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
) -> TripPlanResponse:
    """Generate a personalized travel itinerary grounded in verified database attractions."""
    return service.generate_itinerary(db, request, user=user)


@router.post("/chat", response_model=PlannerChatResponse)
def chat_follow_up(
    request: PlannerChatRequest,
    service: PlannerService = Depends(get_planner_service),
    user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
) -> PlannerChatResponse:
    """Send follow-up instructions to refine the generated itinerary or ask questions."""
    return service.chat_follow_up(db, request, user=user)
