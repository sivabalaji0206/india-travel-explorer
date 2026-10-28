"""Single source of truth for every fixed vocabulary used by the application.

Database CHECK constraints, Pydantic schemas, filters and LLM prompts must all
import these enums instead of repeating plain strings (BRD section 24).
"""

from enum import StrEnum


class Environment(StrEnum):
    """Deployment environments (BRD section 22: dev, staging, production)."""

    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"
    TEST = "test"


class LogLevel(StrEnum):
    """Supported logging levels."""

    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class PlaceCategory(StrEnum):
    """Tourist place categories (FR-07)."""

    BEACH = "beach"
    HILL_STATION = "hill_station"
    TEMPLE = "temple"
    WILDLIFE = "wildlife"
    HERITAGE = "heritage"
    ADVENTURE = "adventure"
    NATURE = "nature"
    CITY = "city"


class BudgetLevel(StrEnum):
    """Budget tiers for places (FR-08)."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class FoodType(StrEnum):
    """Dietary type of a local dish."""

    VEG = "veg"
    NON_VEG = "non_veg"
    VEGAN = "vegan"


class Season(StrEnum):
    """Best season to visit a place (FR-08)."""

    SUMMER = "summer"
    MONSOON = "monsoon"
    AUTUMN = "autumn"
    WINTER = "winter"
    SPRING = "spring"
    ALL_YEAR = "all_year"


class UserRole(StrEnum):
    """Role based access control roles (BRD section 22)."""

    USER = "user"
    ADMIN = "admin"


class ChatRole(StrEnum):
    """Author of a chat message."""

    USER = "user"
    ASSISTANT = "assistant"


class MealType(StrEnum):
    """Meal a recommended eatery is known for."""

    BREAKFAST = "breakfast"
    DINNER = "dinner"


class DataSource(StrEnum):
    """Where a catalogue record came from (traceability for verification)."""

    DATASET_JSON = "dataset_json"
    DATASET_CSV = "dataset_csv"
    MANUAL = "manual"
