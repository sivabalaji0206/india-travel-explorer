"""initial schema

Frozen snapshot of the Release 1 schema. Enum values are intentionally written
out here (not imported from ``app.core.enums``) so that this migration never
changes when the application enums evolve; later enum changes need their own
migration.

Revision ID: 0001
Revises:
Create Date: 2026-10-27
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _timestamps(with_updated_at: bool = True) -> list[sa.Column]:
    columns = [
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        )
    ]
    if with_updated_at:
        columns.append(
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            )
        )
    return columns


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    op.create_table(
        "states",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("region", sa.String(length=50), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("best_time_to_visit", sa.String(length=100), nullable=True),
        *_timestamps(),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_states")),
        sa.UniqueConstraint("name", name=op.f("uq_states_name")),
    )

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=150), nullable=False),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("role", sa.String(length=20), server_default="user", nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true(), nullable=False),
        *_timestamps(),
        sa.CheckConstraint("role IN ('user', 'admin')", name=op.f("ck_users_role_valid")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_users")),
        sa.UniqueConstraint("email", name=op.f("uq_users_email")),
    )

    op.create_table(
        "places",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("state_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("best_season", sa.String(length=50), nullable=False),
        sa.Column("entry_fee", sa.Numeric(8, 2), server_default="0", nullable=False),
        sa.Column("avg_daily_cost", sa.Numeric(10, 2), nullable=False),
        sa.Column("budget_level", sa.String(length=10), nullable=False),
        sa.Column("latitude", sa.Numeric(9, 6), nullable=True),
        sa.Column("longitude", sa.Numeric(9, 6), nullable=True),
        sa.Column("image_url", sa.Text(), nullable=True),
        *_timestamps(),
        sa.CheckConstraint(
            "category IN ('beach', 'hill_station', 'temple', 'wildlife', 'heritage', "
            "'adventure', 'city')",
            name=op.f("ck_places_category_valid"),
        ),
        sa.CheckConstraint(
            "best_season IN ('summer', 'monsoon', 'autumn', 'winter', 'spring', 'all_year')",
            name=op.f("ck_places_best_season_valid"),
        ),
        sa.CheckConstraint(
            "budget_level IN ('low', 'medium', 'high')",
            name=op.f("ck_places_budget_level_valid"),
        ),
        sa.CheckConstraint("entry_fee >= 0", name=op.f("ck_places_entry_fee_non_negative")),
        sa.CheckConstraint(
            "avg_daily_cost >= 0", name=op.f("ck_places_avg_daily_cost_non_negative")
        ),
        sa.CheckConstraint("latitude BETWEEN -90 AND 90", name=op.f("ck_places_latitude_range")),
        sa.CheckConstraint(
            "longitude BETWEEN -180 AND 180", name=op.f("ck_places_longitude_range")
        ),
        sa.ForeignKeyConstraint(
            ["state_id"],
            ["states.id"],
            name=op.f("fk_places_state_id_states"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_places")),
        sa.UniqueConstraint("state_id", "name", name=op.f("uq_places_state_id_name")),
    )
    op.create_index(op.f("ix_places_category"), "places", ["category"])
    op.create_index(op.f("ix_places_best_season"), "places", ["best_season"])
    op.create_index(op.f("ix_places_budget_level"), "places", ["budget_level"])
    op.create_index("ix_places_state_id_category", "places", ["state_id", "category"])
    op.create_index(
        "ix_places_name_trgm",
        "places",
        ["name"],
        postgresql_using="gin",
        postgresql_ops={"name": "gin_trgm_ops"},
    )

    op.create_table(
        "foods",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("state_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("food_type", sa.String(length=10), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("avg_price", sa.Numeric(8, 2), nullable=False),
        *_timestamps(),
        sa.CheckConstraint(
            "food_type IN ('veg', 'non_veg', 'vegan')", name=op.f("ck_foods_food_type_valid")
        ),
        sa.CheckConstraint("avg_price >= 0", name=op.f("ck_foods_avg_price_non_negative")),
        sa.ForeignKeyConstraint(
            ["state_id"],
            ["states.id"],
            name=op.f("fk_foods_state_id_states"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_foods")),
        sa.UniqueConstraint("state_id", "name", name=op.f("uq_foods_state_id_name")),
    )

    op.create_table(
        "saved_plans",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("state_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("preferences", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("plan_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        *_timestamps(),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name=op.f("fk_saved_plans_user_id_users"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["state_id"],
            ["states.id"],
            name=op.f("fk_saved_plans_state_id_states"),
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_saved_plans")),
    )
    op.create_index(op.f("ix_saved_plans_state_id"), "saved_plans", ["state_id"])
    op.create_index("ix_saved_plans_user_id_created_at", "saved_plans", ["user_id", "created_at"])

    op.create_table(
        "chat_messages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("plan_id", sa.Integer(), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        *_timestamps(with_updated_at=False),
        sa.CheckConstraint(
            "role IN ('user', 'assistant')", name=op.f("ck_chat_messages_role_valid")
        ),
        sa.ForeignKeyConstraint(
            ["plan_id"],
            ["saved_plans.id"],
            name=op.f("fk_chat_messages_plan_id_saved_plans"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_chat_messages")),
    )
    op.create_index(
        "ix_chat_messages_plan_id_created_at", "chat_messages", ["plan_id", "created_at"]
    )

    op.create_table(
        "llm_usage",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("usage_date", sa.Date(), nullable=False),
        sa.Column("request_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("prompt_tokens", sa.Integer(), server_default="0", nullable=False),
        sa.Column("completion_tokens", sa.Integer(), server_default="0", nullable=False),
        *_timestamps(),
        sa.CheckConstraint(
            "request_count >= 0", name=op.f("ck_llm_usage_request_count_non_negative")
        ),
        sa.CheckConstraint(
            "prompt_tokens >= 0", name=op.f("ck_llm_usage_prompt_tokens_non_negative")
        ),
        sa.CheckConstraint(
            "completion_tokens >= 0", name=op.f("ck_llm_usage_completion_tokens_non_negative")
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name=op.f("fk_llm_usage_user_id_users"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_llm_usage")),
        sa.UniqueConstraint("user_id", "usage_date", name=op.f("uq_llm_usage_user_id_usage_date")),
    )


def downgrade() -> None:
    # The pg_trgm extension is left installed: it may be shared with other schemas.
    op.drop_table("llm_usage")
    op.drop_table("chat_messages")
    op.drop_table("saved_plans")
    op.drop_table("foods")
    op.drop_table("places")
    op.drop_table("users")
    op.drop_table("states")
