"""Destination catalogue API endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query
from sqlalchemy.orm import Session

from app.api.deps import get_catalogue_service, get_pagination_params
from app.db.session import get_db
from app.schemas.common import PaginatedResponse
from app.schemas.destination import DestinationDetailResponse, DestinationSummaryResponse
from app.services.catalogue_service import CatalogueService

router = APIRouter(prefix="/destinations", tags=["Destinations"])


@router.get("", response_model=PaginatedResponse[DestinationSummaryResponse])
def list_destinations(
    state_id: Annotated[int | None, Query(description="Filter by state ID")] = None,
    search: Annotated[str | None, Query(description="Search destination or district")] = None,
    trip_type: Annotated[str | None, Query(description="Filter by trip type")] = None,
    pagination: tuple[int, int] = Depends(get_pagination_params),
    service: CatalogueService = Depends(get_catalogue_service),
    db: Session = Depends(get_db),
) -> PaginatedResponse[DestinationSummaryResponse]:
    """List travel destinations across India."""
    page, page_size = pagination
    return service.list_destinations(
        db,
        state_id=state_id,
        search=search,
        trip_type=trip_type,
        page=page,
        page_size=page_size,
    )


@router.get("/{id}", response_model=DestinationDetailResponse)
def get_destination(
    id: Annotated[int, Path(ge=1, description="Destination ID")],
    service: CatalogueService = Depends(get_catalogue_service),
    db: Session = Depends(get_db),
) -> DestinationDetailResponse:
    """Get complete destination details including cost tiers, local eateries, and foods."""
    return service.get_destination(db, destination_id=id)
