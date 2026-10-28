"""Schemas for Food entities."""

from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.core.enums import DataSource, FoodType


class FoodResponse(BaseModel):
    """A local dish / culinary specialty."""

    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: int
    state_id: int
    destination_id: int
    destination_name: str | None = None
    name: str
    food_type: FoodType
    description: str | None = None
    avg_price: Decimal
    price_is_estimated: bool
    data_source: DataSource
