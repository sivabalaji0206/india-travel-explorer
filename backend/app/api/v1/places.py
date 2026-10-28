"""Place catalogue API endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query
from sqlalchemy.orm import Session

from app.api.deps import get_catalogue_service, get_pagination_params
from app.core.enums import BudgetLevel, PlaceCategory, Season
from app.db.session import get_db
from app.schemas.common import PaginatedResponse
from app.schemas.place import PlaceDetailResponse, PlaceSummaryResponse
from app.services.catalogue_service import CatalogueService

router = APIRouter(prefix="/places", tags=["Places"])


@router.get("", response_model=PaginatedResponse[PlaceSummaryResponse])
def list_places(
    state_id: Annotated[int | None, Query(description="Filter by state ID")] = None,
    destination_id: Annotated[int | None, Query(description="Filter by destination ID")] = None,
    category: Annotated[PlaceCategory | None, Query(description="Filter by category")] = None,
    budget_level: Annotated[BudgetLevel | None, Query(description="Filter by budget tier")] = None,
    best_season: Annotated[Season | None, Query(description="Filter by best season")] = None,
    search: Annotated[str | None, Query(description="Search places by name")] = None,
    is_hidden_gem: Annotated[
        bool | None, Query(description="Filter off-the-beaten-path places")
    ] = None,
    pagination: tuple[int, int] = Depends(get_pagination_params),
    service: CatalogueService = Depends(get_catalogue_service),
    db: Session = Depends(get_db),
) -> PaginatedResponse[PlaceSummaryResponse]:
    """Search and filter tourist places across India."""
    page, page_size = pagination
    return service.list_places(
        db,
        state_id=state_id,
        destination_id=destination_id,
        category=category,
        budget_level=budget_level,
        best_season=best_season,
        search=search,
        is_hidden_gem=is_hidden_gem,
        page=page,
        page_size=page_size,
    )


@router.get("/{id}", response_model=PlaceDetailResponse)
def get_place(
    id: Annotated[int, Path(ge=1, description="Place ID")],
    service: CatalogueService = Depends(get_catalogue_service),
    db: Session = Depends(get_db),
) -> PlaceDetailResponse:
    """Get place details enriched with nearby dishes, eateries, and destination budget tiers."""
    return service.get_place_detail(db, place_id=id)
