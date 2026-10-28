"""Food model."""

from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    ForeignKey,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    false,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import DataSource, FoodType
from app.models.base import Base, TimestampMixin
from app.models.types import enum_check, enum_column

if TYPE_CHECKING:
    from app.models.destination import Destination
    from app.models.state import State

NAME_LENGTH = 150
FOOD_TYPE_LENGTH = 10
DATA_SOURCE_LENGTH = 30
PRICE_PRECISION = 8
PRICE_SCALE = 2


class Food(TimestampMixin, Base):
    """A local dish known at a destination, used by the planner for food suggestions."""

    __tablename__ = "foods"
    __table_args__ = (
        UniqueConstraint("destination_id", "name"),
        enum_check("food_type", FoodType, "food_type_valid"),
        enum_check("data_source", DataSource, "data_source_valid"),
        CheckConstraint("avg_price >= 0", name="avg_price_non_negative"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    state_id: Mapped[int] = mapped_column(
        ForeignKey("states.id", ondelete="CASCADE"), nullable=False, index=True
    )
    destination_id: Mapped[int] = mapped_column(
        ForeignKey("destinations.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(NAME_LENGTH), nullable=False)
    food_type: Mapped[FoodType] = mapped_column(
        enum_column(FoodType, FOOD_TYPE_LENGTH), nullable=False
    )
    description: Mapped[str | None] = mapped_column(Text)
    avg_price: Mapped[Decimal] = mapped_column(
        Numeric(PRICE_PRECISION, PRICE_SCALE), nullable=False
    )
    price_is_estimated: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=false()
    )
    data_source: Mapped[DataSource] = mapped_column(
        enum_column(DataSource, DATA_SOURCE_LENGTH), nullable=False
    )

    state: Mapped["State"] = relationship(back_populates="foods")
    destination: Mapped["Destination"] = relationship(back_populates="foods")
