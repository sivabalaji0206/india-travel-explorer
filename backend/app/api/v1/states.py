"""State catalogue API endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query
from sqlalchemy.orm import Session

from app.api.deps import get_catalogue_service, get_pagination_params
from app.core.enums import BudgetLevel, FoodType, PlaceCategory, Season
from app.db.session import get_db
from app.schemas.common import PaginatedResponse
from app.schemas.destination import DestinationSummaryResponse
from app.schemas.food import FoodResponse
from app.schemas.place import PlaceSummaryResponse
from app.schemas.state import StateResponse
from app.services.catalogue_service import CatalogueService

router = APIRouter(prefix="/states", tags=["States"])


@router.get("", response_model=list[StateResponse])
def list_states(
    region: Annotated[
        str | None, Query(description="Filter by region (e.g. North, South, West)")
    ] = None,
    service: CatalogueService = Depends(get_catalogue_service),
    db: Session = Depends(get_db),
) -> list[StateResponse]:
    """List all Indian states with attraction and destination counts."""
    return service.list_states(db, region=region)


@router.get("/{id}", response_model=StateResponse)
def get_state(
    id: Annotated[int, Path(ge=1, description="State ID")],
    service: CatalogueService = Depends(get_catalogue_service),
    db: Session = Depends(get_db),
) -> StateResponse:
    """Get state details and aggregated totals."""
    return service.get_state(db, state_id=id)


@router.get("/{id}/places", response_model=PaginatedResponse[PlaceSummaryResponse])
def get_places_in_state(
    id: Annotated[int, Path(ge=1, description="State ID")],
    category: Annotated[PlaceCategory | None, Query(description="Filter by category")] = None,
    budget_level: Annotated[BudgetLevel | None, Query(description="Filter by budget tier")] = None,
    best_season: Annotated[Season | None, Query(description="Filter by best season")] = None,
    search: Annotated[str | None, Query(description="Search places by name")] = None,
    is_hidden_gem: Annotated[
        bool | None, Query(description="Filter off-the-beaten-path spots")
    ] = None,
    pagination: tuple[int, int] = Depends(get_pagination_params),
    service: CatalogueService = Depends(get_catalogue_service),
    db: Session = Depends(get_db),
) -> PaginatedResponse[PlaceSummaryResponse]:
    """List and filter tourist attractions within a state."""
    page, page_size = pagination
    return service.list_places(
        db,
        state_id=id,
        category=category,
        budget_level=budget_level,
        best_season=best_season,
        search=search,
        is_hidden_gem=is_hidden_gem,
        page=page,
        page_size=page_size,
    )


@router.get("/{id}/destinations", response_model=PaginatedResponse[DestinationSummaryResponse])
def get_destinations_in_state(
    id: Annotated[int, Path(ge=1, description="State ID")],
    search: Annotated[str | None, Query(description="Search destination or district name")] = None,
    trip_type: Annotated[str | None, Query(description="Filter by trip type")] = None,
    pagination: tuple[int, int] = Depends(get_pagination_params),
    service: CatalogueService = Depends(get_catalogue_service),
    db: Session = Depends(get_db),
) -> PaginatedResponse[DestinationSummaryResponse]:
    """List travel destinations within a state."""
    page, page_size = pagination
    return service.list_destinations(
        db,
        state_id=id,
        search=search,
        trip_type=trip_type,
        page=page,
        page_size=page_size,
    )


@router.get("/{id}/foods", response_model=PaginatedResponse[FoodResponse])
def get_foods_in_state(
    id: Annotated[int, Path(ge=1, description="State ID")],
    food_type: Annotated[FoodType | None, Query(description="Filter veg/non_veg/vegan")] = None,
    search: Annotated[str | None, Query(description="Search dish name")] = None,
    pagination: tuple[int, int] = Depends(get_pagination_params),
    service: CatalogueService = Depends(get_catalogue_service),
    db: Session = Depends(get_db),
) -> PaginatedResponse[FoodResponse]:
    """List culinary specialties for a state."""
    page, page_size = pagination
    return service.list_foods(
        db,
        state_id=id,
        food_type=food_type,
        search=search,
        page=page,
        page_size=page_size,
    )
