"""Schemas for Eatery entities."""

from pydantic import BaseModel, ConfigDict

from app.core.enums import DataSource, MealType


class EateryResponse(BaseModel):
    """A recommended eatery or restaurant."""

    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: int
    destination_id: int
    name: str
    area: str | None = None
    meal_type: MealType
    data_source: DataSource
