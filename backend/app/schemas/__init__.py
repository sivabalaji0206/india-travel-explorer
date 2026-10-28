"""Pydantic schemas for India Travel Explorer."""

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
from app.schemas.state import StateResponse

__all__ = [
    "DestinationCostTierResponse",
    "DestinationDetailResponse",
    "DestinationSummaryResponse",
    "EateryResponse",
    "ErrorDetail",
    "ErrorResponse",
    "FoodResponse",
    "HealthResponse",
    "PageMeta",
    "PaginatedResponse",
    "PlaceDetailResponse",
    "PlaceSummaryResponse",
    "StateResponse",
]
