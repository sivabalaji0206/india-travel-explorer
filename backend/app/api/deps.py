"""Common FastAPI dependency providers."""

from typing import Annotated

from fastapi import Depends, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.exceptions import UnauthorizedError
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from app.services.catalogue_service import CatalogueService

http_bearer = HTTPBearer(auto_error=False)


def get_catalogue_service() -> CatalogueService:
    """Return an instance of CatalogueService."""
    return CatalogueService()


def get_auth_service(
    settings: Settings = Depends(get_settings),
) -> AuthService:
    """Return an instance of AuthService."""
    return AuthService(settings=settings)


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


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(http_bearer)],
    settings: Settings = Depends(get_settings),
    db: Session = Depends(get_db),
) -> User:
    """Enforce authentication and return the currently logged-in User entity."""
    if not credentials:
        raise UnauthorizedError("Authentication token is required.")

    token = credentials.credentials
    try:
        payload = decode_access_token(
            token,
            secret_key=settings.jwt_secret_key.get_secret_value(),
            algorithm=settings.jwt_algorithm,
        )
    except jwt.PyJWTError as exc:
        raise UnauthorizedError(f"Invalid or expired token: {exc}") from exc

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise UnauthorizedError("Token payload missing user identifier.")

    try:
        user_id = int(user_id_str)
    except ValueError as exc:
        raise UnauthorizedError("Invalid user ID in token claim.") from exc

    user = UserRepository().get_by_id(db, user_id)
    if not user:
        raise UnauthorizedError("User associated with this token no longer exists.")

    if not user.is_active:
        raise UnauthorizedError("User account has been deactivated.")

    return user


def get_optional_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(http_bearer)],
    settings: Settings = Depends(get_settings),
    db: Session = Depends(get_db),
) -> User | None:
    """Return authenticated User if valid token is provided, or None if guest."""
    if not credentials:
        return None

    try:
        return get_current_user(credentials=credentials, settings=settings, db=db)
    except UnauthorizedError:
        return None
