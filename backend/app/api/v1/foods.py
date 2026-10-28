"""Food catalogue API endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_catalogue_service, get_pagination_params
from app.core.enums import FoodType
from app.db.session import get_db
from app.schemas.common import PaginatedResponse
from app.schemas.food import FoodResponse
from app.services.catalogue_service import CatalogueService

router = APIRouter(prefix="/foods", tags=["Foods"])


@router.get("", response_model=PaginatedResponse[FoodResponse])
def list_foods(
    state_id: Annotated[int | None, Query(description="Filter by state ID")] = None,
    destination_id: Annotated[int | None, Query(description="Filter by destination ID")] = None,
    food_type: Annotated[FoodType | None, Query(description="Filter veg/non_veg/vegan")] = None,
    search: Annotated[str | None, Query(description="Search dish name")] = None,
    pagination: tuple[int, int] = Depends(get_pagination_params),
    service: CatalogueService = Depends(get_catalogue_service),
    db: Session = Depends(get_db),
) -> PaginatedResponse[FoodResponse]:
    """List and search authentic regional dishes across India."""
    page, page_size = pagination
    return service.list_foods(
        db,
        state_id=state_id,
        destination_id=destination_id,
        food_type=food_type,
        search=search,
        page=page,
        page_size=page_size,
    )
