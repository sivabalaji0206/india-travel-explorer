"""Destination model: a visitable town, region or circuit that groups places."""

from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    ForeignKey,
    Numeric,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
    false,
    text,
)
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import DataSource, Season
from app.models.base import Base, TimestampMixin
from app.models.types import enum_array_check, enum_check, enum_column

if TYPE_CHECKING:
    from app.models.destination_cost_tier import DestinationCostTier
    from app.models.eatery import Eatery
    from app.models.food import Food
    from app.models.place import Place
    from app.models.state import State

NAME_LENGTH = 150
LABEL_LENGTH = 50
TRANSPORT_LENGTH = 200
DATA_SOURCE_LENGTH = 30
COORDINATE_PRECISION = 9
COORDINATE_SCALE = 6
DAYS_PRECISION = 3
DAYS_SCALE = 1
MAX_LATITUDE = 90
MAX_LONGITUDE = 180
MAX_RATING = 10
EMPTY_ARRAY_DEFAULT = "'{}'"


class Destination(TimestampMixin, Base):
    """A destination inside a state. Places, foods and eateries hang off it."""

    __tablename__ = "destinations"
    __table_args__ = (
        UniqueConstraint("state_id", "name"),
        enum_array_check("best_seasons", Season, "best_seasons_valid"),
        enum_check("data_source", DataSource, "data_source_valid"),
        CheckConstraint(
            f"latitude BETWEEN -{MAX_LATITUDE} AND {MAX_LATITUDE}", name="latitude_range"
        ),
        CheckConstraint(
            f"longitude BETWEEN -{MAX_LONGITUDE} AND {MAX_LONGITUDE}", name="longitude_range"
        ),
        CheckConstraint(f"safety_rating BETWEEN 0 AND {MAX_RATING}", name="safety_rating_range"),
        CheckConstraint(
            f"popularity_score BETWEEN 0 AND {MAX_RATING}", name="popularity_score_range"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    state_id: Mapped[int] = mapped_column(
        ForeignKey("states.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(NAME_LENGTH), nullable=False)
    district: Mapped[str | None] = mapped_column(String(NAME_LENGTH))
    latitude: Mapped[Decimal | None] = mapped_column(
        Numeric(COORDINATE_PRECISION, COORDINATE_SCALE)
    )
    longitude: Mapped[Decimal | None] = mapped_column(
        Numeric(COORDINATE_PRECISION, COORDINATE_SCALE)
    )
    altitude_m: Mapped[int | None] = mapped_column()
    popularity_score: Mapped[int | None] = mapped_column(SmallInteger)
    best_seasons: Mapped[list[str]] = mapped_column(
        ARRAY(String(LABEL_LENGTH)), nullable=False, server_default=text(EMPTY_ARRAY_DEFAULT)
    )
    trip_types: Mapped[list[str]] = mapped_column(
        ARRAY(String(LABEL_LENGTH)), nullable=False, server_default=text(EMPTY_ARRAY_DEFAULT)
    )
    min_days: Mapped[Decimal | None] = mapped_column(Numeric(DAYS_PRECISION, DAYS_SCALE))
    ideal_days: Mapped[Decimal | None] = mapped_column(Numeric(DAYS_PRECISION, DAYS_SCALE))
    max_days: Mapped[Decimal | None] = mapped_column(Numeric(DAYS_PRECISION, DAYS_SCALE))
    description: Mapped[str | None] = mapped_column(Text)
    local_culture: Mapped[str | None] = mapped_column(Text)
    festivals_events: Mapped[str | None] = mapped_column(Text)
    suggested_itinerary: Mapped[str | None] = mapped_column(Text)
    safety_rating: Mapped[int | None] = mapped_column(SmallInteger)
    permits_required: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=false())
    permits_details: Mapped[str | None] = mapped_column(Text)
    nearest_airport: Mapped[str | None] = mapped_column(String(TRANSPORT_LENGTH))
    nearest_railway_station: Mapped[str | None] = mapped_column(String(TRANSPORT_LENGTH))
    source_last_updated: Mapped[date | None] = mapped_column(Date)
    data_source: Mapped[DataSource] = mapped_column(
        enum_column(DataSource, DATA_SOURCE_LENGTH), nullable=False
    )

    state: Mapped["State"] = relationship(back_populates="destinations")
    places: Mapped[list["Place"]] = relationship(
        back_populates="destination", cascade="all, delete-orphan", passive_deletes=True
    )
    foods: Mapped[list["Food"]] = relationship(
        back_populates="destination", cascade="all, delete-orphan", passive_deletes=True
    )
    eateries: Mapped[list["Eatery"]] = relationship(
        back_populates="destination", cascade="all, delete-orphan", passive_deletes=True
    )
    cost_tiers: Mapped[list["DestinationCostTier"]] = relationship(
        back_populates="destination", cascade="all, delete-orphan", passive_deletes=True
    )
