"""Database engine, pooled session factory and the FastAPI session dependency."""

from collections.abc import Iterator
from functools import lru_cache

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings


@lru_cache
def get_engine() -> Engine:
    """Return the process wide engine with connection pooling from settings."""
    settings = get_settings()
    return create_engine(
        settings.sqlalchemy_database_url,
        pool_size=settings.db_pool_size,
        max_overflow=settings.db_max_overflow,
        pool_timeout=settings.db_pool_timeout_seconds,
        pool_recycle=settings.db_pool_recycle_seconds,
        pool_pre_ping=True,
        echo=settings.db_echo,
    )


@lru_cache
def get_session_factory() -> sessionmaker[Session]:
    """Return the session factory bound to the shared engine."""
    return sessionmaker(bind=get_engine(), expire_on_commit=False)


def get_db() -> Iterator[Session]:
    """FastAPI dependency yielding a session that is always closed."""
    with get_session_factory()() as session:
        yield session
