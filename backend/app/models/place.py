"""Place model."""

from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    ForeignKey,
    Index,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    false,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import BudgetLevel, DataSource, PlaceCategory, Season
from app.models.base import Base, TimestampMixin
from app.models.types import enum_check, enum_column

if TYPE_CHECKING:
    from app.models.destination import Destination
    from app.models.state import State

NAME_LENGTH = 150
CATEGORY_LENGTH = 50
SEASON_LENGTH = 50
BUDGET_LEVEL_LENGTH = 10
DATA_SOURCE_LENGTH = 30
MONEY_PRECISION = 10
MONEY_SCALE = 2
FEE_PRECISION = 8
COORDINATE_PRECISION = 9
COORDINATE_SCALE = 6
MAX_LATITUDE = 90
MAX_LONGITUDE = 180


class Place(TimestampMixin, Base):
    """A tourist place inside a destination; the retrieval unit for the RAG planner."""

    __tablename__ = "places"
    __table_args__ = (
        UniqueConstraint("state_id", "name"),
        enum_check("category", PlaceCategory, "category_valid"),
        enum_check("best_season", Season, "best_season_valid"),
        enum_check("budget_level", BudgetLevel, "budget_level_valid"),
        enum_check("data_source", DataSource, "data_source_valid"),
        CheckConstraint("entry_fee >= 0", name="entry_fee_non_negative"),
        CheckConstraint("avg_daily_cost >= 0", name="avg_daily_cost_non_negative"),
        CheckConstraint(
            f"latitude BETWEEN -{MAX_LATITUDE} AND {MAX_LATITUDE}", name="latitude_range"
        ),
        CheckConstraint(
            f"longitude BETWEEN -{MAX_LONGITUDE} AND {MAX_LONGITUDE}", name="longitude_range"
        ),
        Index("ix_places_state_id_category", "state_id", "category"),
        Index(
            "ix_places_name_trgm",
            "name",
            postgresql_using="gin",
            postgresql_ops={"name": "gin_trgm_ops"},
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    state_id: Mapped[int] = mapped_column(
        ForeignKey("states.id", ondelete="CASCADE"), nullable=False
    )
    destination_id: Mapped[int] = mapped_column(
        ForeignKey("destinations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(NAME_LENGTH), nullable=False)
    category: Mapped[PlaceCategory] = mapped_column(
        enum_column(PlaceCategory, CATEGORY_LENGTH), nullable=False, index=True
    )
    description: Mapped[str | None] = mapped_column(Text)
    best_season: Mapped[Season] = mapped_column(
        enum_column(Season, SEASON_LENGTH), nullable=False, index=True
    )
    # NULL means the entry fee is unknown (not free).
    entry_fee: Mapped[Decimal | None] = mapped_column(Numeric(FEE_PRECISION, MONEY_SCALE))
    avg_daily_cost: Mapped[Decimal] = mapped_column(
        Numeric(MONEY_PRECISION, MONEY_SCALE), nullable=False
    )
    budget_level: Mapped[BudgetLevel] = mapped_column(
        enum_column(BudgetLevel, BUDGET_LEVEL_LENGTH), nullable=False, index=True
    )
    latitude: Mapped[Decimal | None] = mapped_column(
        Numeric(COORDINATE_PRECISION, COORDINATE_SCALE)
    )
    longitude: Mapped[Decimal | None] = mapped_column(
        Numeric(COORDINATE_PRECISION, COORDINATE_SCALE)
    )
    image_url: Mapped[str | None] = mapped_column(Text)
    is_hidden_gem: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=false())
    data_source: Mapped[DataSource] = mapped_column(
        enum_column(DataSource, DATA_SOURCE_LENGTH), nullable=False
    )

    state: Mapped["State"] = relationship(back_populates="places")
    destination: Mapped["Destination"] = relationship(back_populates="places")
