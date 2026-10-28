"""destinations, cost tiers and eateries

Adds the destination layer required by the Kaggle dataset (state -> destination -> places),
per-tier daily cost ranges, recommended eateries, and traceability columns.

The ``places`` and ``foods`` tables must be empty when this migration runs (data is loaded by the
seed script afterwards) because new NOT NULL foreign keys are added without a backfill.

As in 0001, enum values are written out (frozen) instead of imported from the application.

Revision ID: 0002
Revises: 0001
Create Date: 2026-10-28
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

DATA_SOURCES = "'dataset_json', 'dataset_csv', 'manual'"
SEASONS = "'summer', 'monsoon', 'autumn', 'winter', 'spring', 'all_year'"
COST_COMPONENTS = ("accommodation", "food", "activities", "local_transport", "total_daily")


def _timestamps() -> list[sa.Column]:
    return [
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False
        ),
    ]


def _money(name: str) -> sa.Column:
    return sa.Column(name, sa.Numeric(10, 2), nullable=False)


def upgrade() -> None:
    op.create_table(
        "destinations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("state_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("district", sa.String(length=150), nullable=True),
        sa.Column("latitude", sa.Numeric(9, 6), nullable=True),
        sa.Column("longitude", sa.Numeric(9, 6), nullable=True),
        sa.Column("altitude_m", sa.Integer(), nullable=True),
        sa.Column("popularity_score", sa.SmallInteger(), nullable=True),
        sa.Column(
            "best_seasons",
            postgresql.ARRAY(sa.String(length=50)),
            server_default=sa.text("'{}'"),
            nullable=False,
        ),
        sa.Column(
            "trip_types",
            postgresql.ARRAY(sa.String(length=50)),
            server_default=sa.text("'{}'"),
            nullable=False,
        ),
        sa.Column("min_days", sa.Numeric(3, 1), nullable=True),
        sa.Column("ideal_days", sa.Numeric(3, 1), nullable=True),
        sa.Column("max_days", sa.Numeric(3, 1), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("local_culture", sa.Text(), nullable=True),
        sa.Column("festivals_events", sa.Text(), nullable=True),
        sa.Column("suggested_itinerary", sa.Text(), nullable=True),
        sa.Column("safety_rating", sa.SmallInteger(), nullable=True),
        sa.Column("permits_required", sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column("permits_details", sa.Text(), nullable=True),
        sa.Column("nearest_airport", sa.String(length=200), nullable=True),
        sa.Column("nearest_railway_station", sa.String(length=200), nullable=True),
        sa.Column("source_last_updated", sa.Date(), nullable=True),
        sa.Column("data_source", sa.String(length=30), nullable=False),
        *_timestamps(),
        sa.CheckConstraint(
            f"best_seasons <@ ARRAY[{SEASONS}]::varchar[]",
            name=op.f("ck_destinations_best_seasons_valid"),
        ),
        sa.CheckConstraint(
            f"data_source IN ({DATA_SOURCES})", name=op.f("ck_destinations_data_source_valid")
        ),
        sa.CheckConstraint(
            "latitude BETWEEN -90 AND 90", name=op.f("ck_destinations_latitude_range")
        ),
        sa.CheckConstraint(
            "longitude BETWEEN -180 AND 180", name=op.f("ck_destinations_longitude_range")
        ),
        sa.CheckConstraint(
            "safety_rating BETWEEN 0 AND 10", name=op.f("ck_destinations_safety_rating_range")
        ),
        sa.CheckConstraint(
            "popularity_score BETWEEN 0 AND 10",
            name=op.f("ck_destinations_popularity_score_range"),
        ),
        sa.ForeignKeyConstraint(
            ["state_id"],
            ["states.id"],
            name=op.f("fk_destinations_state_id_states"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_destinations")),
        sa.UniqueConstraint("state_id", "name", name=op.f("uq_destinations_state_id_name")),
    )

    op.create_table(
        "destination_cost_tiers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("destination_id", sa.Integer(), nullable=False),
        sa.Column("tier", sa.String(length=10), nullable=False),
        _money("accommodation_min"),
        _money("accommodation_max"),
        _money("food_min"),
        _money("food_max"),
        _money("activities_min"),
        _money("activities_max"),
        _money("local_transport_min"),
        _money("local_transport_max"),
        _money("total_daily_min"),
        _money("total_daily_max"),
        sa.Column("is_estimated", sa.Boolean(), server_default=sa.false(), nullable=False),
        *_timestamps(),
        sa.CheckConstraint(
            "tier IN ('low', 'medium', 'high')", name=op.f("ck_destination_cost_tiers_tier_valid")
        ),
        *(
            sa.CheckConstraint(
                f"{part}_min <= {part}_max",
                name=op.f(f"ck_destination_cost_tiers_{part}_range_ordered"),
            )
            for part in COST_COMPONENTS
        ),
        *(
            sa.CheckConstraint(
                f"{part}_min >= 0", name=op.f(f"ck_destination_cost_tiers_{part}_min_non_negative")
            )
            for part in COST_COMPONENTS
        ),
        sa.ForeignKeyConstraint(
            ["destination_id"],
            ["destinations.id"],
            name=op.f("fk_destination_cost_tiers_destination_id_destinations"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_destination_cost_tiers")),
        sa.UniqueConstraint(
            "destination_id", "tier", name=op.f("uq_destination_cost_tiers_destination_id_tier")
        ),
    )

    op.create_table(
        "eateries",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("destination_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("area", sa.String(length=150), nullable=True),
        sa.Column("meal_type", sa.String(length=20), nullable=False),
        sa.Column("data_source", sa.String(length=30), nullable=False),
        *_timestamps(),
        sa.CheckConstraint(
            "meal_type IN ('breakfast', 'dinner')", name=op.f("ck_eateries_meal_type_valid")
        ),
        sa.CheckConstraint(
            f"data_source IN ({DATA_SOURCES})", name=op.f("ck_eateries_data_source_valid")
        ),
        sa.ForeignKeyConstraint(
            ["destination_id"],
            ["destinations.id"],
            name=op.f("fk_eateries_destination_id_destinations"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_eateries")),
        sa.UniqueConstraint(
            "destination_id",
            "name",
            "meal_type",
            name=op.f("uq_eateries_destination_id_name_meal_type"),
        ),
    )

    # places: attach to a destination, unknown entry fee is NULL, record the data source.
    op.add_column("places", sa.Column("destination_id", sa.Integer(), nullable=False))
    op.add_column(
        "places",
        sa.Column("is_hidden_gem", sa.Boolean(), server_default=sa.false(), nullable=False),
    )
    op.add_column("places", sa.Column("data_source", sa.String(length=30), nullable=False))
    op.alter_column("places", "entry_fee", existing_type=sa.Numeric(8, 2), nullable=True)
    op.alter_column("places", "entry_fee", existing_type=sa.Numeric(8, 2), server_default=None)
    op.create_foreign_key(
        op.f("fk_places_destination_id_destinations"),
        "places",
        "destinations",
        ["destination_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_index(op.f("ix_places_destination_id"), "places", ["destination_id"])
    op.create_check_constraint(
        op.f("ck_places_data_source_valid"), "places", f"data_source IN ({DATA_SOURCES})"
    )

    # foods: dishes belong to a destination, prices may be estimated.
    op.add_column("foods", sa.Column("destination_id", sa.Integer(), nullable=False))
    op.add_column(
        "foods",
        sa.Column("price_is_estimated", sa.Boolean(), server_default=sa.false(), nullable=False),
    )
    op.add_column("foods", sa.Column("data_source", sa.String(length=30), nullable=False))
    op.drop_constraint(op.f("uq_foods_state_id_name"), "foods", type_="unique")
    op.create_unique_constraint(
        op.f("uq_foods_destination_id_name"), "foods", ["destination_id", "name"]
    )
    op.create_foreign_key(
        op.f("fk_foods_destination_id_destinations"),
        "foods",
        "destinations",
        ["destination_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_index(op.f("ix_foods_state_id"), "foods", ["state_id"])
    op.create_check_constraint(
        op.f("ck_foods_data_source_valid"), "foods", f"data_source IN ({DATA_SOURCES})"
    )


def downgrade() -> None:
    op.drop_constraint(op.f("ck_foods_data_source_valid"), "foods", type_="check")
    op.drop_index(op.f("ix_foods_state_id"), table_name="foods")
    op.drop_constraint(op.f("fk_foods_destination_id_destinations"), "foods", type_="foreignkey")
    op.drop_constraint(op.f("uq_foods_destination_id_name"), "foods", type_="unique")
    op.create_unique_constraint(op.f("uq_foods_state_id_name"), "foods", ["state_id", "name"])
    op.drop_column("foods", "data_source")
    op.drop_column("foods", "price_is_estimated")
    op.drop_column("foods", "destination_id")

    op.drop_constraint(op.f("ck_places_data_source_valid"), "places", type_="check")
    op.drop_index(op.f("ix_places_destination_id"), table_name="places")
    op.drop_constraint(op.f("fk_places_destination_id_destinations"), "places", type_="foreignkey")
    op.alter_column(
        "places", "entry_fee", existing_type=sa.Numeric(8, 2), server_default="0", nullable=False
    )
    op.drop_column("places", "data_source")
    op.drop_column("places", "is_hidden_gem")
    op.drop_column("places", "destination_id")

    op.drop_table("eateries")
    op.drop_table("destination_cost_tiers")
    op.drop_table("destinations")
