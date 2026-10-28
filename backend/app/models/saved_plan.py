"""SavedPlan model."""

from typing import TYPE_CHECKING, Any

from sqlalchemy import ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.chat_message import ChatMessage
    from app.models.state import State
    from app.models.user import User

TITLE_LENGTH = 200


class SavedPlan(TimestampMixin, Base):
    """A generated itinerary saved by a user, with the preferences that produced it."""

    __tablename__ = "saved_plans"
    __table_args__ = (Index("ix_saved_plans_user_id_created_at", "user_id", "created_at"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    state_id: Mapped[int] = mapped_column(
        ForeignKey("states.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(TITLE_LENGTH), nullable=False)
    preferences: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    plan_json: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)

    user: Mapped["User"] = relationship(back_populates="saved_plans")
    state: Mapped["State"] = relationship(back_populates="saved_plans")
    chat_messages: Mapped[list["ChatMessage"]] = relationship(
        back_populates="plan", cascade="all, delete-orphan", passive_deletes=True
    )
