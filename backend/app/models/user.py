"""User model."""

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, String, Text, true
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import UserRole
from app.models.base import Base, TimestampMixin
from app.models.types import enum_check, enum_column

if TYPE_CHECKING:
    from app.models.llm_usage import LlmUsage
    from app.models.saved_plan import SavedPlan

NAME_LENGTH = 100
EMAIL_LENGTH = 150
ROLE_LENGTH = 20


class User(TimestampMixin, Base):
    """A registered user. Only the minimum personal data is stored (BRD section 10)."""

    __tablename__ = "users"
    __table_args__ = (enum_check("role", UserRole, "role_valid"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(NAME_LENGTH), nullable=False)
    # Emails are normalised to lower case by the service layer before persistence.
    email: Mapped[str] = mapped_column(String(EMAIL_LENGTH), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    role: Mapped[UserRole] = mapped_column(
        enum_column(UserRole, ROLE_LENGTH), nullable=False, server_default=UserRole.USER.value
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=true())

    saved_plans: Mapped[list["SavedPlan"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )
    llm_usage: Mapped[list["LlmUsage"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )
