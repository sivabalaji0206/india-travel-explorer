"""Schemas for SavedPlan management (save, view, rename, delete)."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.planner import TripPlanResponse


class SavePlanRequest(BaseModel):
    """Payload to save a generated itinerary to the user's account."""

    state_id: int = Field(ge=1, description="State ID")
    title: str = Field(min_length=1, max_length=200, description="Plan title")
    preferences: dict[str, Any] | None = Field(default=None, description="Input preferences")
    plan_json: TripPlanResponse = Field(description="Structured generated itinerary")


class UpdatePlanRequest(BaseModel):
    """Payload to rename or update a saved plan."""

    title: str | None = Field(default=None, min_length=1, max_length=200, description="New title")
    plan_json: TripPlanResponse | None = Field(default=None, description="Updated itinerary JSON")


class SavedPlanSummaryResponse(BaseModel):
    """Compact summary of a saved plan for listing in user dashboard."""

    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: int
    user_id: int
    state_id: int
    state_name: str
    title: str
    total_days: int
    created_at: datetime
    updated_at: datetime


class SavedPlanDetailResponse(BaseModel):
    """Full saved itinerary details."""

    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: int
    user_id: int
    state_id: int
    state_name: str
    title: str
    preferences: dict[str, Any] | None = None
    plan_json: TripPlanResponse
    created_at: datetime
    updated_at: datetime
