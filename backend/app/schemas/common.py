"""Common schemas, pagination containers and error models."""

import math
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class PageMeta(BaseModel):
    """Metadata describing a paginated slice of records."""

    model_config = ConfigDict(frozen=True)

    page: int = Field(ge=1, description="Current 1-based page number")
    page_size: int = Field(ge=1, description="Number of items requested per page")
    total_items: int = Field(ge=0, description="Total number of items matching filter")
    total_pages: int = Field(ge=0, description="Total number of available pages")
    has_next: bool = Field(description="True if there is a next page")
    has_previous: bool = Field(description="True if there is a previous page")

    @classmethod
    def create(cls, *, page: int, page_size: int, total_items: int) -> "PageMeta":
        total_pages = math.ceil(total_items / page_size) if page_size > 0 else 0
        return cls(
            page=page,
            page_size=page_size,
            total_items=total_items,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_previous=page > 1 and total_pages > 0,
        )


class PaginatedResponse[T](BaseModel):
    """Standard generic wrapper for list endpoints."""

    model_config = ConfigDict(frozen=True)

    items: list[T]
    meta: PageMeta


class ErrorDetail(BaseModel):
    """Inner error payload."""

    model_config = ConfigDict(frozen=True)

    code: str
    message: str
    details: Any = None


class ErrorResponse(BaseModel):
    """Top-level error envelope returned across all HTTP failure codes."""

    model_config = ConfigDict(frozen=True)

    error: ErrorDetail
    request_id: str | None = None
