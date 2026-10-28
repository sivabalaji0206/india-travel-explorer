"""Repository for User data access."""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.enums import UserRole
from app.models.user import User


class UserRepository:
    """Encapsulates database access for User records."""

    def get_by_id(self, db: Session, user_id: int) -> User | None:
        """Fetch user by primary key."""
        return db.get(User, user_id)

    def get_by_email(self, db: Session, email: str) -> User | None:
        """Fetch user by exact case-insensitive email."""
        stmt = select(User).where(func.lower(User.email) == email.strip().lower())
        return db.execute(stmt).scalar_one_or_none()

    def create(
        self,
        db: Session,
        *,
        name: str,
        email: str,
        password_hash: str,
        role: UserRole = UserRole.USER,
    ) -> User:
        """Insert and commit a new user record."""
        user = User(
            name=name.strip(),
            email=email.strip().lower(),
            password_hash=password_hash,
            role=role,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
