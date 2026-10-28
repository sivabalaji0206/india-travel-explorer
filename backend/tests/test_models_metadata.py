"""Tests for ORM metadata: tables, constraints and enum alignment."""

import pytest
from sqlalchemy import CheckConstraint, Table

from app.core.enums import BudgetLevel, ChatRole, FoodType, PlaceCategory, Season, UserRole
from app.models import Base

EXPECTED_TABLES = {
    "states",
    "destinations",
    "destination_cost_tiers",
    "places",
    "foods",
    "eateries",
    "users",
    "saved_plans",
    "chat_messages",
    "llm_usage",
}


def _check_sql(table: Table, name: str) -> str:
    constraint = next(
        c
        for c in table.constraints
        if isinstance(c, CheckConstraint) and c.name == f"ck_{table.name}_{name}"
    )
    return str(constraint.sqltext)


def test_all_expected_tables_are_registered() -> None:
    assert set(Base.metadata.tables) == EXPECTED_TABLES


@pytest.mark.parametrize(
    ("table", "constraint", "enum_cls"),
    [
        ("places", "category_valid", PlaceCategory),
        ("places", "best_season_valid", Season),
        ("places", "budget_level_valid", BudgetLevel),
        ("foods", "food_type_valid", FoodType),
        ("users", "role_valid", UserRole),
        ("chat_messages", "role_valid", ChatRole),
    ],
)
def test_check_constraints_match_enums(table: str, constraint: str, enum_cls: type) -> None:
    sql = _check_sql(Base.metadata.tables[table], constraint)
    assert all(f"'{member.value}'" in sql for member in enum_cls)  # type: ignore[attr-defined]


def test_every_table_has_an_integer_primary_key() -> None:
    for table in Base.metadata.tables.values():
        assert [c.name for c in table.primary_key.columns] == ["id"]


def test_tables_have_unique_constraints_for_idempotent_seeding() -> None:
    expected_constraints = {
        "destinations": {"state_id", "name"},
        "places": {"state_id", "name"},
        "foods": {"destination_id", "name"},
        "eateries": {"destination_id", "name", "meal_type"},
    }
    for table_name, expected_cols in expected_constraints.items():
        unique_sets = [
            {c.name for c in constraint.columns}
            for constraint in Base.metadata.tables[table_name].constraints
            if constraint.__class__.__name__ == "UniqueConstraint"
        ]
        assert expected_cols in unique_sets
