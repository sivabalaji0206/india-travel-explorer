"""Eatery model: a recommended restaurant or cafe near a destination."""

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import DataSource, MealType
from app.models.base import Base, TimestampMixin
from app.models.types import enum_check, enum_column

if TYPE_CHECKING:
    from app.models.destination import Destination

NAME_LENGTH = 150
AREA_LENGTH = 150
MEAL_TYPE_LENGTH = 20
DATA_SOURCE_LENGTH = 30


class Eatery(TimestampMixin, Base):
    """A named eatery with the meal it is recommended for."""

    __tablename__ = "eateries"
    __table_args__ = (
        UniqueConstraint("destination_id", "name", "meal_type"),
        enum_check("meal_type", MealType, "meal_type_valid"),
        enum_check("data_source", DataSource, "data_source_valid"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    destination_id: Mapped[int] = mapped_column(
        ForeignKey("destinations.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(NAME_LENGTH), nullable=False)
    area: Mapped[str | None] = mapped_column(String(AREA_LENGTH))
    meal_type: Mapped[MealType] = mapped_column(
        enum_column(MealType, MEAL_TYPE_LENGTH), nullable=False
    )
    data_source: Mapped[DataSource] = mapped_column(
        enum_column(DataSource, DATA_SOURCE_LENGTH), nullable=False
    )

    destination: Mapped["Destination"] = relationship(back_populates="eateries")
