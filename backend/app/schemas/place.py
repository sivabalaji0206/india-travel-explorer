"""Schemas for Place catalogue entities."""

from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.core.enums import BudgetLevel, DataSource, PlaceCategory, Season
from app.schemas.destination import DestinationCostTierResponse
from app.schemas.eatery import EateryResponse
from app.schemas.food import FoodResponse


class PlaceSummaryResponse(BaseModel):
    """Compact summary of a tourist place / attraction."""

    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: int
    state_id: int
    state_name: str
    destination_id: int
    destination_name: str
    name: str
    category: PlaceCategory
    description: str | None = None
    best_season: Season
    entry_fee: Decimal | None = None
    avg_daily_cost: Decimal
    budget_level: BudgetLevel
    latitude: Decimal | None = None
    longitude: Decimal | None = None
    image_url: str | None = None
    is_hidden_gem: bool = False
    data_source: DataSource


class PlaceDetailResponse(BaseModel):
    """Comprehensive details of a tourist place with nearby food, eateries and cost tiers."""

    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: int
    state_id: int
    state_name: str
    destination_id: int
    destination_name: str
    name: str
    category: PlaceCategory
    description: str | None = None
    best_season: Season
    entry_fee: Decimal | None = None
    avg_daily_cost: Decimal
    budget_level: BudgetLevel
    latitude: Decimal | None = None
    longitude: Decimal | None = None
    image_url: str | None = None
    is_hidden_gem: bool = False
    data_source: DataSource
    nearby_foods: list[FoodResponse] = Field(default_factory=list)
    nearby_eateries: list[EateryResponse] = Field(default_factory=list)
    cost_tiers: list[DestinationCostTierResponse] = Field(default_factory=list)
