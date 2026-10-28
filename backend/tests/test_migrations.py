"""Integration test: the migrated database must match the ORM models (no drift)."""

import pytest
from alembic.autogenerate import compare_metadata
from alembic.migration import MigrationContext
from sqlalchemy import create_engine, inspect
from sqlalchemy.exc import OperationalError

from app.core.config import get_settings
from app.models import Base

pytestmark = pytest.mark.integration

ALEMBIC_VERSION_TABLE = "alembic_version"


def test_database_schema_matches_models() -> None:
    engine = create_engine(get_settings().sqlalchemy_database_url)
    try:
        connection = engine.connect()
    except OperationalError:
        pytest.skip("PostgreSQL is not reachable")

    with connection:
        if ALEMBIC_VERSION_TABLE not in inspect(connection).get_table_names():
            pytest.skip("Run `alembic upgrade head` first")
        context = MigrationContext.configure(
            connection, opts={"compare_type": True, "compare_server_default": True}
        )
        assert compare_metadata(context, Base.metadata) == []
