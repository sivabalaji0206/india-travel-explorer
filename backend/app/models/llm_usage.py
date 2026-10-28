"""LlmUsage model: per user daily request counter and token accounting."""

from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class LlmUsage(TimestampMixin, Base):
    """Aggregated LLM usage per user per day; enforces the daily request limit (cost control)."""

    __tablename__ = "llm_usage"
    __table_args__ = (
        UniqueConstraint("user_id", "usage_date"),
        CheckConstraint("request_count >= 0", name="request_count_non_negative"),
        CheckConstraint("prompt_tokens >= 0", name="prompt_tokens_non_negative"),
        CheckConstraint("completion_tokens >= 0", name="completion_tokens_non_negative"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    usage_date: Mapped[date] = mapped_column(Date, nullable=False)
    request_count: Mapped[int] = mapped_column(nullable=False, server_default="0")
    prompt_tokens: Mapped[int] = mapped_column(nullable=False, server_default="0")
    completion_tokens: Mapped[int] = mapped_column(nullable=False, server_default="0")

    user: Mapped["User"] = relationship(back_populates="llm_usage")
