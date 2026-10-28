"""Transform the raw dataset (JSON destinations and CSV city sheet) into seed records."""

import statistics
from dataclasses import dataclass, field
from datetime import date
from decimal import Decimal
from typing import Any

from app.core.enums import BudgetLevel, DataSource, FoodType, MealType, PlaceCategory, Season
from app.models.place import NAME_LENGTH as PLACE_NAME_LENGTH
from app.seed.classify import (
    CategoryClassifier,
    FoodClassifier,
    SeasonParser,
    budget_level_for,
    round_to_step,
)
from app.seed.cleaning import clean_text, looks_named, normalise_key, split_trailing_note, to_label
from app.seed.config import CityInfo, MappingConfig
from app.seed.overrides import KIND_EATERY_CITY, KIND_FOOD, KIND_PLACE, OverrideSet
from app.seed.records import (
    CostRange,
    CostTierRecord,
    DestinationRecord,
    EateryRecord,
    FoodRecord,
    PlaceRecord,
    ReviewRow,
    SeedBundle,
    StateRecord,
)

COST_COMPONENTS = {
    "accommodation": "accommodation_range",
    "food": "food_range",
    "activities": "activities_range",
    "local_transport": "local_transport_range",
    "total_daily": "total_daily_range",
}
TOTAL_DAILY = "total_daily"
FOOD = "food"
CSV_CITY_COLUMN = "City"
CSV_SPOT_COLUMNS = ("Tourist Spot 1", "Tourist Spot 2", "Tourist Spot 3")
CSV_MEAL_COLUMNS = {
    MealType.BREAKFAST: ("Breakfast Spot 1", "Breakfast Spot 2", "Breakfast Spot 3"),
    MealType.DINNER: ("Dinner Spot 1", "Dinner Spot 2", "Dinner Spot 3"),
}
NO_PERMIT_TEXT = "not required"
KIND_DESTINATION = "destination"
KIND_EATERY = "eatery"
EATERY_AREA_SEPARATOR = ","

DestinationKey = tuple[str, str]


@dataclass
class _Merged:
    """A destination merged from duplicate dataset records."""

    base: dict[str, Any]
    state: str
    attractions: list[str] = field(default_factory=list)
    gems: list[str] = field(default_factory=list)
    cuisine: list[str] = field(default_factory=list)
    trip_types: list[str] = field(default_factory=list)
    season_texts: list[str] = field(default_factory=list)


@dataclass
class _Context:
    """Values derived once per destination and shared by its places and foods."""

    record: DestinationRecord
    avg_daily_cost: Decimal
    budget_level: BudgetLevel
    best_season: Season
    meal_price: Decimal


def _extend_unique(target: list[str], items: list[str]) -> None:
    seen = {normalise_key(item) for item in target}
    for item in items:
        key = normalise_key(item)
        if key not in seen:
            seen.add(key)
            target.append(item)


def _midpoint(value_range: CostRange) -> Decimal:
    return (value_range[0] + value_range[1]) / 2


def _tier(record: DestinationRecord, tier: BudgetLevel) -> CostTierRecord:
    return next(t for t in record.cost_tiers if t.tier is tier)


def _describe(value: str) -> str:
    return value[:1].upper() + value[1:]


class SeedTransformer:
    """Builds a :class:`SeedBundle`; every inferred or excluded value is recorded for review."""

    def __init__(self, config: MappingConfig, overrides: OverrideSet) -> None:
        self._config = config
        self._overrides = overrides
        self._categories = CategoryClassifier(config)
        self._seasons = SeasonParser(config.season_rules, config.thresholds.default_season)
        self._foods = FoodClassifier(config.food_rules)
        self._bundle = SeedBundle()
        self._states: dict[str, StateRecord] = {}
        self._contexts: dict[DestinationKey, _Context] = {}
        self._place_keys: set[DestinationKey] = set()
        self._food_keys: set[tuple[str, str, str]] = set()
        self._eatery_keys: set[tuple[str, str, str, MealType]] = set()
        self._estimated: dict[BudgetLevel, dict[str, CostRange]] = {}

    def build(self, tourism: list[dict[str, Any]], city_rows: list[dict[str, str]]) -> SeedBundle:
        """Transform the raw JSON records and CSV rows."""
        for merged in self._merge(tourism):
            self._add_json_destination(merged)
        self._estimated = self._compute_estimated_ranges()
        for row in city_rows:
            self._add_city_row(row)
        self._bundle.states = sorted(self._states.values(), key=lambda s: s.name)
        return self._bundle

    # ----- states -----------------------------------------------------------------------

    def _register_state(self, name: str, region: str | None) -> None:
        normalised = self._normalise_region(region)
        state = self._states.setdefault(name, StateRecord(name=name, region=None))
        if state.region is None and normalised:
            state.region = normalised

    def _normalise_region(self, region: str | None) -> str | None:
        if region is None:
            return None
        mapping = self._config.city_state
        if region in mapping.ignored_regions:
            return None
        return mapping.region_aliases.get(region, region)

    def _resolve_state(self, record: dict[str, Any]) -> str:
        overrides = self._config.city_state.state_overrides_by_destination_id
        return overrides.get(record["id"]) or clean_text(record["state"])

    # ----- JSON destinations ------------------------------------------------------------

    def _merge(self, tourism: list[dict[str, Any]]) -> list[_Merged]:
        merged: dict[DestinationKey, _Merged] = {}
        for record in sorted(tourism, key=lambda r: r["id"]):
            state = self._resolve_state(record)
            key = (normalise_key(state), normalise_key(record["destination_name"]))
            item = merged.setdefault(key, _Merged(base=record, state=state))
            _extend_unique(item.attractions, record["primary_attractions"])
            _extend_unique(item.gems, record["hidden_gems"])
            _extend_unique(item.cuisine, record["local_cuisine_must_try"])
            _extend_unique(item.trip_types, [to_label(t) for t in record["trip_types"]])
            item.season_texts.extend(clean_text(s) for s in record["best_seasons"])
        return list(merged.values())

    def _add_json_destination(self, merged: _Merged) -> None:
        record = merged.base
        self._register_state(merged.state, record["region"])
        destination = DestinationRecord(
            state=merged.state,
            name=clean_text(record["destination_name"]),
            data_source=DataSource.DATASET_JSON,
            district=clean_text(record["district"]) or None,
            latitude=Decimal(str(record["coordinates"]["latitude"])),
            longitude=Decimal(str(record["coordinates"]["longitude"])),
            altitude_m=record["altitude_m"],
            popularity_score=record["popularity_score"],
            best_seasons=self._seasons.parse(merged.season_texts),
            trip_types=merged.trip_types[: self._config.thresholds.max_trip_types],
            min_days=Decimal(str(record["minimum_days"])),
            ideal_days=Decimal(str(record["ideal_days"])),
            max_days=Decimal(str(record["maximum_days"])),
            description=clean_text(record["unique_experiences"]) or None,
            local_culture=clean_text(record["local_culture"]) or None,
            festivals_events=clean_text(record["festivals_events"]) or None,
            suggested_itinerary=clean_text(record["suggested_itinerary"]) or None,
            safety_rating=record["safety_rating"],
            permits_required=record["permits_required"],
            permits_details=self._permits_details(record),
            nearest_airport=self._nearest(record["nearest_airport"]),
            nearest_railway_station=self._nearest(record["nearest_railway_station"]),
            source_last_updated=date.fromisoformat(record["last_updated"]),
            cost_tiers=self._json_tiers(record),
        )
        context = self._register_destination(destination)
        for raw in merged.attractions:
            self._add_place(
                context, raw, DataSource.DATASET_JSON, hidden_gem=False, named_only=False
            )
        for raw in merged.gems:
            self._add_place(context, raw, DataSource.DATASET_JSON, hidden_gem=True, named_only=True)
        for raw in merged.cuisine:
            self._add_food(context, raw)

    @staticmethod
    def _nearest(block: dict[str, Any]) -> str:
        return f"{clean_text(block['name'])} ({block['distance_km']} km)"

    @staticmethod
    def _permits_details(record: dict[str, Any]) -> str | None:
        details = clean_text(record["permits_details"])
        return None if not details or details.lower() == NO_PERMIT_TEXT else details

    def _json_tiers(self, record: dict[str, Any]) -> list[CostTierRecord]:
        tiers = []
        for tier, source_key in self._config.thresholds.cost_tier_sources.items():
            ranges: dict[str, CostRange] = {}
            for part, key in COST_COMPONENTS.items():
                low, high = record[source_key][key]
                if low > high:
                    raise ValueError(f"Destination {record['id']}: {source_key}.{key} is reversed")
                ranges[part] = (Decimal(str(low)), Decimal(str(high)))
            tiers.append(CostTierRecord(tier=tier, ranges=ranges))
        return tiers

    # ----- shared destination logic -----------------------------------------------------

    def _register_destination(self, destination: DestinationRecord) -> _Context:
        thresholds = self._config.thresholds
        average_tier = _tier(destination, thresholds.reference_tier_for_avg_daily_cost)
        level_tier = _tier(destination, thresholds.budget_level.reference_tier)
        food_range = average_tier.ranges[FOOD]
        context = _Context(
            record=destination,
            avg_daily_cost=round_to_step(
                _midpoint(average_tier.ranges[TOTAL_DAILY]), thresholds.cost_rounding_step
            ),
            budget_level=budget_level_for(level_tier.ranges[TOTAL_DAILY][1], thresholds),
            best_season=destination.best_seasons[0],
            meal_price=round_to_step(
                _midpoint(food_range) / thresholds.meals_per_day, thresholds.price_rounding_step
            ),
        )
        key = (normalise_key(destination.state), normalise_key(destination.name))
        self._contexts[key] = context
        self._bundle.destinations.append(destination)
        self._infer(
            KIND_DESTINATION,
            destination,
            destination.name,
            "budget_level",
            context.budget_level.value,
            f"{thresholds.budget_level.reference_tier.value} tier max daily cost "
            f"{level_tier.ranges[TOTAL_DAILY][1]}",
        )
        return context

    def _compute_estimated_ranges(self) -> dict[BudgetLevel, dict[str, CostRange]]:
        step = self._config.thresholds.cost_rounding_step
        estimated: dict[BudgetLevel, dict[str, CostRange]] = {}
        for tier in self._config.thresholds.cost_tier_sources:
            estimated[tier] = {}
            for part in COST_COMPONENTS:
                lows = [_tier(d, tier).ranges[part][0] for d in self._bundle.destinations]
                highs = [_tier(d, tier).ranges[part][1] for d in self._bundle.destinations]
                estimated[tier][part] = (
                    round_to_step(Decimal(statistics.median(lows)), step),
                    round_to_step(Decimal(statistics.median(highs)), step),
                )
        return estimated

    # ----- places -----------------------------------------------------------------------

    def _add_place(
        self,
        context: _Context,
        raw: str,
        source: DataSource,
        *,
        hidden_gem: bool,
        named_only: bool,
    ) -> None:
        destination = context.record
        name, note = split_trailing_note(clean_text(raw))
        if len(name) > PLACE_NAME_LENGTH:
            self._exclude(KIND_PLACE, destination, raw, "name longer than the database column")
            return
        if named_only and not looks_named(name, self._config.named_place_rules):
            self._exclude(KIND_PLACE, destination, raw, "not a named place (generic description)")
            return
        key = (normalise_key(destination.state), normalise_key(name))
        if key in self._place_keys:
            self._exclude(KIND_PLACE, destination, name, "duplicate of a place in the same state")
            return
        if not self._overrides.is_included(KIND_PLACE, destination.state, name):
            self._exclude(KIND_PLACE, destination, name, "excluded by overrides.csv")
            return
        self._place_keys.add(key)
        override = self._overrides.get(KIND_PLACE, destination.state, name)
        category, rule = self._categories.classify(name, destination.trip_types)
        if "category" in override:
            category, rule = PlaceCategory(override["category"]), "overrides.csv"
        self._bundle.places.append(
            PlaceRecord(
                state=destination.state,
                destination=destination.name,
                name=name,
                category=category,
                best_season=Season(override["best_season"])
                if "best_season" in override
                else context.best_season,
                avg_daily_cost=context.avg_daily_cost,
                budget_level=context.budget_level,
                data_source=source,
                description=override.get("description") or (_describe(note) if note else None),
                entry_fee=Decimal(override["entry_fee"]) if "entry_fee" in override else None,
                is_hidden_gem=hidden_gem,
            )
        )
        self._infer(KIND_PLACE, destination, name, "category", category.value, rule)

    # ----- foods ------------------------------------------------------------------------

    def _add_food(self, context: _Context, raw: str) -> None:
        destination = context.record
        cleaned = clean_text(raw)
        if self._foods.is_excluded(cleaned):
            self._exclude(KIND_FOOD, destination, cleaned, "not a food item (alcoholic drink)")
            return
        name, note = split_trailing_note(cleaned)
        key = (
            normalise_key(destination.state),
            normalise_key(destination.name),
            normalise_key(name),
        )
        if key in self._food_keys:
            self._exclude(KIND_FOOD, destination, name, "duplicate dish at the same destination")
            return
        if not self._overrides.is_included(KIND_FOOD, destination.state, name):
            self._exclude(KIND_FOOD, destination, name, "excluded by overrides.csv")
            return
        self._food_keys.add(key)
        override = self._overrides.get(KIND_FOOD, destination.state, name)
        food_type, rule = self._foods.classify(cleaned)
        if "food_type" in override:
            food_type, rule = FoodType(override["food_type"]), "overrides.csv"
        price = Decimal(override["avg_price"]) if "avg_price" in override else context.meal_price
        self._bundle.foods.append(
            FoodRecord(
                state=destination.state,
                destination=destination.name,
                name=name,
                food_type=food_type,
                avg_price=price,
                price_is_estimated="avg_price" not in override,
                data_source=destination.data_source,
                description=_describe(note) if note else None,
            )
        )
        self._infer(KIND_FOOD, destination, name, "food_type", food_type.value, rule)

    # ----- CSV city sheet ---------------------------------------------------------------

    def _add_city_row(self, row: dict[str, str]) -> None:
        city = clean_text(row[CSV_CITY_COLUMN])
        info = self._config.city_state.cities.get(city)
        if info is None:
            raise ValueError(f"CSV city {city!r} is missing from data/mappings/city_state.json")
        context = self._city_context(city, info)
        for column in CSV_SPOT_COLUMNS:
            if row[column].strip():
                self._add_place(
                    context, row[column], DataSource.DATASET_CSV, hidden_gem=False, named_only=False
                )
        self._add_eateries(context, city, row)

    def _city_context(self, city: str, info: CityInfo) -> _Context:
        self._register_state(info.state, info.region)
        target = info.destination or city
        existing = self._contexts.get((normalise_key(info.state), normalise_key(target)))
        if existing is not None:
            return existing
        if info.destination:
            raise ValueError(f"Mapped destination {info.destination!r} for {city!r} was not found")
        destination = DestinationRecord(
            state=info.state,
            name=city,
            data_source=DataSource.DATASET_CSV,
            best_seasons=[self._config.thresholds.default_season],
            cost_tiers=[
                CostTierRecord(tier=tier, ranges=dict(ranges), is_estimated=True)
                for tier, ranges in self._estimated.items()
            ],
        )
        context = self._register_destination(destination)
        self._infer(
            KIND_DESTINATION,
            destination,
            city,
            "cost_tiers",
            "estimated",
            "no cost data in the CSV: dataset-wide median of the JSON destinations",
        )
        return context

    def _add_eateries(self, context: _Context, city: str, row: dict[str, str]) -> None:
        destination = context.record
        included = self._overrides.is_included(KIND_EATERY_CITY, destination.state, city)
        for meal, columns in CSV_MEAL_COLUMNS.items():
            for column in columns:
                raw = clean_text(row[column])
                if not raw:
                    continue
                if not included:
                    self._exclude(KIND_EATERY, destination, raw, "excluded by overrides.csv")
                    continue
                name, _, area = raw.partition(EATERY_AREA_SEPARATOR)
                key = (
                    normalise_key(destination.state),
                    normalise_key(destination.name),
                    normalise_key(name),
                    meal,
                )
                if key in self._eatery_keys:
                    continue
                self._eatery_keys.add(key)
                self._bundle.eateries.append(
                    EateryRecord(
                        state=destination.state,
                        destination=destination.name,
                        name=name.strip(),
                        meal_type=meal,
                        data_source=DataSource.DATASET_CSV,
                        area=area.strip() or None,
                    )
                )

    # ----- review material --------------------------------------------------------------

    def _infer(
        self,
        kind: str,
        destination: DestinationRecord,
        name: str,
        field_name: str,
        value: str,
        rule: str,
    ) -> None:
        self._bundle.inferred.append(
            ReviewRow(kind, destination.state, destination.name, name, field_name, value, rule)
        )

    def _exclude(self, kind: str, destination: DestinationRecord, name: str, reason: str) -> None:
        self._bundle.excluded.append(
            ReviewRow(kind, destination.state, destination.name, name, "include", "false", reason)
        )
