"""ChatMessage model."""

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import ChatRole
from app.models.base import Base, CreatedAtMixin
from app.models.types import enum_check, enum_column

if TYPE_CHECKING:
    from app.models.saved_plan import SavedPlan

ROLE_LENGTH = 20


class ChatMessage(CreatedAtMixin, Base):
    """A follow up chat turn attached to a saved plan."""

    __tablename__ = "chat_messages"
    __table_args__ = (
        enum_check("role", ChatRole, "role_valid"),
        Index("ix_chat_messages_plan_id_created_at", "plan_id", "created_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    plan_id: Mapped[int] = mapped_column(
        ForeignKey("saved_plans.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[ChatRole] = mapped_column(enum_column(ChatRole, ROLE_LENGTH), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    plan: Mapped["SavedPlan"] = relationship(back_populates="chat_messages")
