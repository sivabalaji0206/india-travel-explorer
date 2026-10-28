"""User authentication and profile API endpoints."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_auth_service, get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import TokenResponse, UserLoginRequest, UserRegisterRequest, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(
    payload: UserRegisterRequest,
    service: AuthService = Depends(get_auth_service),
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Register a new user account and obtain an access token."""
    return service.register(db, payload)


@router.post("/login", response_model=TokenResponse)
def login(
    payload: UserLoginRequest,
    service: AuthService = Depends(get_auth_service),
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Authenticate with email and password to obtain a JWT access token."""
    return service.login(db, payload)


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Get the current authenticated user's profile."""
    return UserResponse.model_validate(current_user)
