"""Plain data records produced by the transformation and consumed by the loader."""

from dataclasses import dataclass, field
from datetime import date
from decimal import Decimal

from app.core.enums import (
    BudgetLevel,
    DataSource,
    FoodType,
    MealType,
    PlaceCategory,
    Season,
)

CostRange = tuple[Decimal, Decimal]


@dataclass
class StateRecord:
    """A state or union territory."""

    name: str
    region: str | None


@dataclass
class CostTierRecord:
    """Daily cost ranges for one budget tier; keys are the cost components."""

    tier: BudgetLevel
    ranges: dict[str, CostRange]
    is_estimated: bool = False


@dataclass
class DestinationRecord:
    """A destination with its cost tiers."""

    state: str
    name: str
    data_source: DataSource
    district: str | None = None
    latitude: Decimal | None = None
    longitude: Decimal | None = None
    altitude_m: int | None = None
    popularity_score: int | None = None
    best_seasons: list[Season] = field(default_factory=list)
    trip_types: list[str] = field(default_factory=list)
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
    cost_tiers: list[CostTierRecord] = field(default_factory=list)


@dataclass
class PlaceRecord:
    """A tourist place."""

    state: str
    destination: str
    name: str
    category: PlaceCategory
    best_season: Season
    avg_daily_cost: Decimal
    budget_level: BudgetLevel
    data_source: DataSource
    description: str | None = None
    entry_fee: Decimal | None = None
    is_hidden_gem: bool = False


@dataclass
class FoodRecord:
    """A local dish."""

    state: str
    destination: str
    name: str
    food_type: FoodType
    avg_price: Decimal
    price_is_estimated: bool
    data_source: DataSource
    description: str | None = None


@dataclass
class EateryRecord:
    """A recommended eatery."""

    state: str
    destination: str
    name: str
    meal_type: MealType
    data_source: DataSource
    area: str | None = None


@dataclass
class ReviewRow:
    """One inferred or excluded value surfaced to the developer for review."""

    kind: str
    state: str
    destination: str
    name: str
    field: str
    value: str
    rule: str


@dataclass
class SeedBundle:
    """Everything the loader needs, plus review material."""

    states: list[StateRecord] = field(default_factory=list)
    destinations: list[DestinationRecord] = field(default_factory=list)
    places: list[PlaceRecord] = field(default_factory=list)
    foods: list[FoodRecord] = field(default_factory=list)
    eateries: list[EateryRecord] = field(default_factory=list)
    inferred: list[ReviewRow] = field(default_factory=list)
    excluded: list[ReviewRow] = field(default_factory=list)
