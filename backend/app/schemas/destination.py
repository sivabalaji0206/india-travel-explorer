"""Schemas for Destination and DestinationCostTier entities."""

from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.core.enums import BudgetLevel, DataSource
from app.schemas.eatery import EateryResponse
from app.schemas.food import FoodResponse


class DestinationCostTierResponse(BaseModel):
    """Component cost ranges for one budget tier of a destination."""

    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: int
    destination_id: int
    tier: BudgetLevel
    accommodation_min: Decimal
    accommodation_max: Decimal
    food_min: Decimal
    food_max: Decimal
    activities_min: Decimal
    activities_max: Decimal
    local_transport_min: Decimal
    local_transport_max: Decimal
    total_daily_min: Decimal
    total_daily_max: Decimal
    is_estimated: bool


class DestinationSummaryResponse(BaseModel):
    """Compact summary of a travel destination."""

    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: int
    state_id: int
    state_name: str | None = None
    name: str
    district: str | None = None
    latitude: Decimal | None = None
    longitude: Decimal | None = None
    altitude_m: int | None = None
    popularity_score: int | None = None
    best_seasons: list[str] = Field(default_factory=list)
    trip_types: list[str] = Field(default_factory=list)
    min_days: Decimal | None = None
    ideal_days: Decimal | None = None
    max_days: Decimal | None = None
    description: str | None = None
    safety_rating: int | None = None
    permits_required: bool = False
    place_count: int = 0
    data_source: DataSource


class DestinationDetailResponse(BaseModel):
    """Comprehensive details of a destination with cost tiers, eateries, and foods."""

    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: int
    state_id: int
    state_name: str | None = None
    name: str
    district: str | None = None
    latitude: Decimal | None = None
    longitude: Decimal | None = None
    altitude_m: int | None = None
    popularity_score: int | None = None
    best_seasons: list[str] = Field(default_factory=list)
    trip_types: list[str] = Field(default_factory=list)
    min_days: Decimal | None = None
    ideal_days: Decimal | None = None
    max_days: Decimal | None = None
    description: str | None = None
    local_culture: str | None = None
    festivals_events: str | None = None
    suggested_itinerary: str | None = None
    safety_rating: int | None = None
    permits_required: bool = False
    permits_details: str | None = None
    nearest_airport: str | None = None
    nearest_railway_station: str | None = None
    source_last_updated: date | None = None
    data_source: DataSource
    cost_tiers: list[DestinationCostTierResponse] = Field(default_factory=list)
    eateries: list[EateryResponse] = Field(default_factory=list)
    foods: list[FoodResponse] = Field(default_factory=list)
