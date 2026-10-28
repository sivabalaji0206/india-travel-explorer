"""Schemas for State catalogue entities."""

from pydantic import BaseModel, ConfigDict, Field


class StateResponse(BaseModel):
    """Summary of an Indian state with aggregated attraction and destination counts."""

    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: int
    name: str
    region: str | None = None
    description: str | None = None
    best_time_to_visit: str | None = None
    place_count: int = Field(default=0, ge=0, description="Total verified attractions in state")
    destination_count: int = Field(
        default=0, ge=0, description="Total travel destinations in state"
    )
