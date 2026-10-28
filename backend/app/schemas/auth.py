"""Authentication and user schemas."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.core.enums import UserRole

EMAIL_PATTERN = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"


class UserRegisterRequest(BaseModel):
    """Payload to register a new user account."""

    name: str = Field(min_length=2, max_length=100, description="Full name")
    email: str = Field(
        min_length=5, max_length=150, pattern=EMAIL_PATTERN, description="Unique email address"
    )
    password: str = Field(min_length=8, max_length=128, description="Password (min 8 chars)")


class UserLoginRequest(BaseModel):
    """Payload to authenticate an existing user."""

    email: str = Field(
        min_length=5, max_length=150, pattern=EMAIL_PATTERN, description="Account email address"
    )
    password: str = Field(min_length=1, max_length=128, description="Plaintext password")


class UserResponse(BaseModel):
    """Public user profile."""

    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: int
    name: str
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime


class TokenResponse(BaseModel):
    """Bearer access token payload returned upon successful authentication."""

    model_config = ConfigDict(frozen=True)

    access_token: str
    token_type: str = "bearer"  # noqa: S105
    user: UserResponse
