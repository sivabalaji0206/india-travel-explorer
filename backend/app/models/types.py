"""Reusable column type helpers so enum values are never repeated as raw strings."""

from enum import StrEnum

from sqlalchemy import CheckConstraint, Enum


def enum_column(enum_cls: type[StrEnum], length: int) -> Enum:
    """Return a VARCHAR backed enum type persisting the enum *values*."""
    return Enum(
        enum_cls,
        native_enum=False,
        length=length,
        create_constraint=False,
        validate_strings=True,
        values_callable=lambda members: [member.value for member in members],
    )


def enum_check(column: str, enum_cls: type[StrEnum], name: str) -> CheckConstraint:
    """Build a CHECK constraint restricting ``column`` to the values of ``enum_cls``."""
    allowed = ", ".join(f"'{member.value}'" for member in enum_cls)
    return CheckConstraint(f"{column} IN ({allowed})", name=name)


def enum_array_check(column: str, enum_cls: type[StrEnum], name: str) -> CheckConstraint:
    """Build a CHECK constraint requiring every array element to be a value of ``enum_cls``."""
    allowed = ", ".join(f"'{member.value}'" for member in enum_cls)
    return CheckConstraint(f"{column} <@ ARRAY[{allowed}]::varchar[]", name=name)
