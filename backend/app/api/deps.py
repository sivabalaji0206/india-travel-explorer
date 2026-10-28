"""Common FastAPI dependency providers."""

from typing import Annotated

from fastapi import Depends, Query

from app.core.config import Settings, get_settings
from app.services.catalogue_service import CatalogueService


def get_catalogue_service() -> CatalogueService:
    """Return an instance of CatalogueService."""
    return CatalogueService()


def get_pagination_params(
    page: Annotated[int, Query(ge=1, description="1-based page number")] = 1,
    page_size: Annotated[
        int | None,
        Query(ge=1, description="Items per page"),
    ] = None,
    settings: Settings = Depends(get_settings),
) -> tuple[int, int]:
    """Validate and normalize page and page_size parameters."""
    effective_page_size = page_size if page_size is not None else settings.default_page_size
    effective_page_size = min(effective_page_size, settings.max_page_size)
    return page, effective_page_size
