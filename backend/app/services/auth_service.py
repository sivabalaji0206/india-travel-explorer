"""Authentication service: handles user registration, verification, and tokens."""

from datetime import timedelta

from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.exceptions import ConflictError, EntityNotFoundError, UnauthorizedError
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import TokenResponse, UserLoginRequest, UserRegisterRequest, UserResponse

BEARER_TOKEN_TYPE = "bearer"  # noqa: S105


class AuthService:
    """Business logic for user authentication and account lifecycle."""

    def __init__(
        self,
        user_repo: UserRepository | None = None,
        settings: Settings | None = None,
    ) -> None:
        self.user_repo = user_repo or UserRepository()
        self.settings = settings or get_settings()

    def register(self, db: Session, payload: UserRegisterRequest) -> TokenResponse:
        """Register a new user account, hash the password, and return an access token."""
        existing = self.user_repo.get_by_email(db, payload.email)
        if existing:
            raise ConflictError("An account with this email address already exists.")

        hashed = hash_password(payload.password)
        user = self.user_repo.create(
            db,
            name=payload.name,
            email=payload.email,
            password_hash=hashed,
        )

        token = self._issue_token(user)
        return TokenResponse(
            access_token=token,
            token_type=BEARER_TOKEN_TYPE,
            user=UserResponse.model_validate(user),
        )

    def login(self, db: Session, payload: UserLoginRequest) -> TokenResponse:
        """Verify user credentials and issue a signed JWT access token."""
        user = self.user_repo.get_by_email(db, payload.email)
        if not user or not verify_password(payload.password, user.password_hash):
            raise UnauthorizedError("Invalid email or password.")

        if not user.is_active:
            raise UnauthorizedError("This account has been deactivated.")

        token = self._issue_token(user)
        return TokenResponse(
            access_token=token,
            token_type=BEARER_TOKEN_TYPE,
            user=UserResponse.model_validate(user),
        )

    def get_current_user_profile(self, db: Session, user_id: int) -> UserResponse:
        """Fetch user by ID or raise EntityNotFoundError."""
        user = self.user_repo.get_by_id(db, user_id)
        if not user:
            raise EntityNotFoundError("User", user_id)
        return UserResponse.model_validate(user)

    def _issue_token(self, user: User) -> str:
        """Generate a signed JWT token with user claims and expiration."""
        expires = timedelta(minutes=self.settings.access_token_expire_minutes)
        claims = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value,
        }
        return create_access_token(
            claims,
            expires_delta=expires,
            secret_key=self.settings.jwt_secret_key.get_secret_value(),
            algorithm=self.settings.jwt_algorithm,
        )
