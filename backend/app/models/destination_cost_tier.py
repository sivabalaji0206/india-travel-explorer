"""DestinationCostTier model: daily cost ranges per budget tier for a destination."""

from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Numeric, UniqueConstraint, false
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import BudgetLevel
from app.models.base import Base, TimestampMixin
from app.models.types import enum_check, enum_column

if TYPE_CHECKING:
    from app.models.destination import Destination

TIER_LENGTH = 10
MONEY_PRECISION = 10
MONEY_SCALE = 2

COST_COMPONENTS = ("accommodation", "food", "activities", "local_transport", "total_daily")


def _money() -> Mapped[Decimal]:
    return mapped_column(Numeric(MONEY_PRECISION, MONEY_SCALE), nullable=False)


class DestinationCostTier(TimestampMixin, Base):
    """Min and max daily spend (INR) per cost component for one budget tier."""

    __tablename__ = "destination_cost_tiers"
    __table_args__ = (
        UniqueConstraint("destination_id", "tier"),
        enum_check("tier", BudgetLevel, "tier_valid"),
        *(
            CheckConstraint(f"{part}_min <= {part}_max", name=f"{part}_range_ordered")
            for part in COST_COMPONENTS
        ),
        *(
            CheckConstraint(f"{part}_min >= 0", name=f"{part}_min_non_negative")
            for part in COST_COMPONENTS
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    destination_id: Mapped[int] = mapped_column(
        ForeignKey("destinations.id", ondelete="CASCADE"), nullable=False
    )
    tier: Mapped[BudgetLevel] = mapped_column(enum_column(BudgetLevel, TIER_LENGTH), nullable=False)
    accommodation_min: Mapped[Decimal] = _money()
    accommodation_max: Mapped[Decimal] = _money()
    food_min: Mapped[Decimal] = _money()
    food_max: Mapped[Decimal] = _money()
    activities_min: Mapped[Decimal] = _money()
    activities_max: Mapped[Decimal] = _money()
    local_transport_min: Mapped[Decimal] = _money()
    local_transport_max: Mapped[Decimal] = _money()
    total_daily_min: Mapped[Decimal] = _money()
    total_daily_max: Mapped[Decimal] = _money()
    is_estimated: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=false())

    destination: Mapped["Destination"] = relationship(back_populates="cost_tiers")
