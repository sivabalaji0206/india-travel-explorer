"""add nature place category

The Kaggle dataset is dominated by scenic natural spots (lakes, waterfalls, valleys, viewpoints,
plantations) that fit none of the original seven categories, so ``nature`` is added.

Revision ID: 0003
Revises: 0002
Create Date: 2026-10-28
"""

from collections.abc import Sequence

from alembic import op

revision: str = "0003"
down_revision: str | None = "0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

CONSTRAINT = "ck_places_category_valid"
OLD_CATEGORIES = "'beach', 'hill_station', 'temple', 'wildlife', 'heritage', 'adventure', 'city'"
NEW_CATEGORIES = (
    "'beach', 'hill_station', 'temple', 'wildlife', 'heritage', 'adventure', 'nature', 'city'"
)


def upgrade() -> None:
    op.drop_constraint(op.f(CONSTRAINT), "places", type_="check")
    op.create_check_constraint(op.f(CONSTRAINT), "places", f"category IN ({NEW_CATEGORIES})")


def downgrade() -> None:
    op.execute("DELETE FROM places WHERE category = 'nature'")
    op.drop_constraint(op.f(CONSTRAINT), "places", type_="check")
    op.create_check_constraint(op.f(CONSTRAINT), "places", f"category IN ({OLD_CATEGORIES})")

