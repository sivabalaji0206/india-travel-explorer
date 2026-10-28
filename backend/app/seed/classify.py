"""Rule based classification driven by the mapping configuration."""

import re
from decimal import ROUND_HALF_UP, Decimal

from app.core.enums import BudgetLevel, FoodType, PlaceCategory, Season
from app.seed.config import FoodRules, MappingConfig, SeasonRules, Thresholds
from app.seed.cleaning import to_label

MONTH_RANGE_SEPARATOR = r"\s*(?:–|-|to)\s*"
CALENDAR_MONTHS = (
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
)


def _word_pattern(terms: list[str]) -> re.Pattern[str]:
    """Compile a whole word, case-insensitive alternation (longest terms first)."""
    ordered = sorted(terms, key=len, reverse=True)
    return re.compile(
        r"(?<![\w-])(?:" + "|".join(re.escape(t) for t in ordered) + r")(?![\w-])", re.I
    )


def round_to_step(value: Decimal, step: int) -> Decimal:
    """Round ``value`` to the nearest multiple of ``step``."""
    return (value / step).quantize(Decimal(1), rounding=ROUND_HALF_UP) * step


class CategoryClassifier:
    """Maps place names (and, as a fallback, destination trip types) to categories."""

    def __init__(self, config: MappingConfig) -> None:
        self._default = config.thresholds.default_category
        self._name_rules = [
            (rule.category, _word_pattern(rule.keywords)) for rule in config.category_keywords.rules
        ]
        self._trip_rules = [
            (rule.category, {to_label(t) for t in rule.trip_types})
            for rule in config.trip_type_categories.rules
        ]

    def from_name(self, name: str) -> tuple[PlaceCategory, str] | None:
        """Return the category and the matched keyword for ``name``, if any rule matches."""
        for category, pattern in self._name_rules:
            match = pattern.search(name)
            if match:
                return category, f"name keyword '{match.group(0).lower()}'"
        return None

    def from_trip_types(self, trip_types: list[str]) -> tuple[PlaceCategory, str] | None:
        """Return the fallback category from the first listed trip type that maps to one."""
        for trip_type in trip_types:
            label = to_label(trip_type)
            for category, rule_types in self._trip_rules:
                if label in rule_types:
                    return category, f"destination trip type '{label}'"
        return None

    def classify(self, name: str, trip_types: list[str]) -> tuple[PlaceCategory, str]:
        """Classify a place by name, then destination trip types, then the default."""
        return (
            self.from_name(name)
            or self.from_trip_types(trip_types)
            or (self._default, "default category")
        )


class SeasonParser:
    """Turns free text such as ``"October–March"`` or ``"Post-monsoon"`` into seasons."""

    def __init__(self, rules: SeasonRules, default: Season) -> None:
        self._rules = rules
        self._default = default
        month_names = "|".join(CALENDAR_MONTHS)
        keyword_names = "|".join(
            re.escape(k) for k in sorted(rules.keywords, key=len, reverse=True)
        )
        self._pattern = re.compile(
            rf"(?P<start>{month_names}){MONTH_RANGE_SEPARATOR}(?P<end>{month_names})"
            rf"|(?P<month>{month_names})"
            rf"|(?P<keyword>{keyword_names})",
            re.I,
        )

    def parse(self, texts: list[str]) -> list[Season]:
        """Return ordered, unique seasons found in ``texts`` (default when none found)."""
        seasons: list[Season] = []
        for text in texts:
            for match in self._pattern.finditer(text):
                for season in self._match_seasons(match):
                    if season not in seasons:
                        seasons.append(season)
        if len(seasons) >= self._rules.all_year_threshold:
            return [Season.ALL_YEAR]
        return seasons or [self._default]

    def _match_seasons(self, match: re.Match[str]) -> list[Season]:
        if match.group("start"):
            return [
                self._rules.months[m]
                for m in self._expand(match.group("start"), match.group("end"))
            ]
        if match.group("month"):
            return [self._rules.months[match.group("month").lower()]]
        return [self._rules.keywords[match.group("keyword").lower()]]

    @staticmethod
    def _expand(start: str, end: str) -> list[str]:
        first = CALENDAR_MONTHS.index(start.lower())
        last = CALENDAR_MONTHS.index(end.lower())
        count = (last - first) % len(CALENDAR_MONTHS) + 1
        return [CALENDAR_MONTHS[(first + i) % len(CALENDAR_MONTHS)] for i in range(count)]


class FoodClassifier:
    """Classifies dishes as veg or non veg and filters out non food items such as alcohol."""

    def __init__(self, rules: FoodRules) -> None:
        self._non_veg = _word_pattern(rules.non_veg_keywords)
        self._excluded = _word_pattern(rules.excluded_keywords)
        self._mixed = [phrase.lower() for phrase in rules.mixed_menu_phrases]

    def is_excluded(self, text: str) -> bool:
        """True for items that are not food (for example alcoholic drinks)."""
        return self._excluded.search(text) is not None

    def classify(self, text: str) -> tuple[FoodType, str]:
        """Return the food type and the rule that decided it."""
        lowered = text.lower()
        if any(phrase in lowered for phrase in self._mixed):
            return FoodType.VEG, "mixed veg and non-veg menu treated as veg"
        match = self._non_veg.search(text)
        if match:
            return FoodType.NON_VEG, f"keyword '{match.group(0).lower()}'"
        return FoodType.VEG, "no non-veg keyword found"


def budget_level_for(daily_cost: Decimal, thresholds: Thresholds) -> BudgetLevel:
    """Classify a destination by the daily cost of the reference tier."""
    limits = thresholds.budget_level
    if daily_cost <= limits.low_max_daily_cost:
        return BudgetLevel.LOW
    if daily_cost <= limits.medium_max_daily_cost:
        return BudgetLevel.MEDIUM
    return BudgetLevel.HIGH
