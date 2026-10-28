"""State model."""

from typing import TYPE_CHECKING

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.destination import Destination
    from app.models.food import Food
    from app.models.place import Place
    from app.models.saved_plan import SavedPlan

NAME_LENGTH = 100
REGION_LENGTH = 50
BEST_TIME_LENGTH = 100


class State(TimestampMixin, Base):
    """An Indian state (or union territory) containing places and foods."""

    __tablename__ = "states"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(NAME_LENGTH), unique=True, nullable=False)
    region: Mapped[str | None] = mapped_column(String(REGION_LENGTH))
    description: Mapped[str | None] = mapped_column(Text)
    best_time_to_visit: Mapped[str | None] = mapped_column(String(BEST_TIME_LENGTH))

    destinations: Mapped[list["Destination"]] = relationship(
        back_populates="state", cascade="all, delete-orphan", passive_deletes=True
    )
    places: Mapped[list["Place"]] = relationship(
        back_populates="state", cascade="all, delete-orphan", passive_deletes=True
    )
    foods: Mapped[list["Food"]] = relationship(
        back_populates="state", cascade="all, delete-orphan", passive_deletes=True
    )
    saved_plans: Mapped[list["SavedPlan"]] = relationship(back_populates="state")
