"""Typed loader for the editable mapping rules in ``data/mappings`` (no rules live in code)."""

import json
from decimal import Decimal
from pathlib import Path

from pydantic import BaseModel, Field

from app.core.enums import BudgetLevel, PlaceCategory, Season

THRESHOLDS_FILE = "thresholds.json"
CATEGORY_KEYWORDS_FILE = "category_keywords.json"
TRIP_TYPE_CATEGORIES_FILE = "trip_type_categories.json"
SEASON_RULES_FILE = "season_rules.json"
FOOD_RULES_FILE = "food_rules.json"
NAMED_PLACE_RULES_FILE = "named_place_rules.json"
CITY_STATE_FILE = "city_state.json"


class BudgetThresholds(BaseModel):
    """Daily cost limits (INR) that classify a destination as low, medium or high budget."""

    reference_tier: BudgetLevel
    low_max_daily_cost: Decimal
    medium_max_daily_cost: Decimal


class Thresholds(BaseModel):
    """Numeric business rules used while importing."""

    budget_level: BudgetThresholds
    cost_tier_sources: dict[BudgetLevel, str]
    reference_tier_for_avg_daily_cost: BudgetLevel
    meals_per_day: int = Field(ge=1)
    price_rounding_step: int = Field(ge=1)
    cost_rounding_step: int = Field(ge=1)
    default_category: PlaceCategory
    default_season: Season
    max_trip_types: int = Field(ge=1)


class CategoryRule(BaseModel):
    """Keywords that map a place name to a category."""

    category: PlaceCategory
    keywords: list[str]


class CategoryKeywords(BaseModel):
    """Ordered place name rules."""

    rules: list[CategoryRule]


class TripTypeRule(BaseModel):
    """Trip types that map a destination to a fallback category."""

    category: PlaceCategory
    trip_types: list[str]


class TripTypeCategories(BaseModel):
    """Ordered trip type rules."""

    rules: list[TripTypeRule]


class SeasonRules(BaseModel):
    """Keyword and month tables for turning free text into seasons."""

    keywords: dict[str, Season]
    months: dict[str, Season]
    all_year_threshold: int = Field(ge=1)


class FoodRules(BaseModel):
    """Keyword lists for classifying dishes."""

    non_veg_keywords: list[str]
    mixed_menu_phrases: list[str]
    excluded_keywords: list[str]


class NamedPlaceRules(BaseModel):
    """Rules deciding whether a text is a real named place."""

    connector_words: list[str]
    generic_first_words: list[str]
    min_name_length: int = Field(ge=1)
    max_name_length: int = Field(ge=1)


class CityInfo(BaseModel):
    """State and region of a city in the CSV (which has no state column)."""

    state: str
    region: str
    destination: str | None = None


class CityState(BaseModel):
    """City to state mapping plus state and region corrections."""

    cities: dict[str, CityInfo]
    state_overrides_by_destination_id: dict[int, str]
    region_aliases: dict[str, str]
    ignored_regions: list[str]


class MappingConfig(BaseModel):
    """All mapping rules."""

    thresholds: Thresholds
    category_keywords: CategoryKeywords
    trip_type_categories: TripTypeCategories
    season_rules: SeasonRules
    food_rules: FoodRules
    named_place_rules: NamedPlaceRules
    city_state: CityState


def _read(directory: Path, filename: str) -> object:
    return json.loads((directory / filename).read_text(encoding="utf-8"))


def load_mapping_config(directory: Path) -> MappingConfig:
    """Load and validate every mapping file from ``directory``."""
    return MappingConfig.model_validate(
        {
            "thresholds": _read(directory, THRESHOLDS_FILE),
            "category_keywords": _read(directory, CATEGORY_KEYWORDS_FILE),
            "trip_type_categories": _read(directory, TRIP_TYPE_CATEGORIES_FILE),
            "season_rules": _read(directory, SEASON_RULES_FILE),
            "food_rules": _read(directory, FOOD_RULES_FILE),
            "named_place_rules": _read(directory, NAMED_PLACE_RULES_FILE),
            "city_state": _read(directory, CITY_STATE_FILE),
        }
    )
