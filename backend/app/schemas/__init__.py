"""Pydantic schemas for India Travel Explorer."""

from app.schemas.auth import (
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.schemas.common import ErrorDetail, ErrorResponse, PageMeta, PaginatedResponse
from app.schemas.destination import (
    DestinationCostTierResponse,
    DestinationDetailResponse,
    DestinationSummaryResponse,
)
from app.schemas.eatery import EateryResponse
from app.schemas.food import FoodResponse
from app.schemas.health import HealthResponse
from app.schemas.place import PlaceDetailResponse, PlaceSummaryResponse
from app.schemas.planner import (
    BudgetBreakdown,
    DayPlan,
    ItineraryMealItem,
    ItineraryPlaceItem,
    PlannerChatRequest,
    PlannerChatResponse,
    TripPlanRequest,
    TripPlanResponse,
)
from app.schemas.saved_plan import (
    SavedPlanDetailResponse,
    SavedPlanSummaryResponse,
    SavePlanRequest,
    UpdatePlanRequest,
)
from app.schemas.state import StateResponse

__all__ = [
    "BudgetBreakdown",
    "DayPlan",
    "DestinationCostTierResponse",
    "DestinationDetailResponse",
    "DestinationSummaryResponse",
    "EateryResponse",
    "ErrorDetail",
    "ErrorResponse",
    "FoodResponse",
    "HealthResponse",
    "ItineraryMealItem",
    "ItineraryPlaceItem",
    "PageMeta",
    "PaginatedResponse",
    "PlaceDetailResponse",
    "PlaceSummaryResponse",
    "PlannerChatRequest",
    "PlannerChatResponse",
    "SavePlanRequest",
    "SavedPlanDetailResponse",
    "SavedPlanSummaryResponse",
    "StateResponse",
    "TokenResponse",
    "TripPlanRequest",
    "TripPlanResponse",
    "UpdatePlanRequest",
    "UserLoginRequest",
    "UserRegisterRequest",
    "UserResponse",
]
