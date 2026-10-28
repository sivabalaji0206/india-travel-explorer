# ADR 0001: Foundation decisions

- Status: Accepted
- Date: 2026-10-27

## Context

Step 1 fixes the persistence and configuration approach that all later features build on.

## Decisions

1. **Synchronous SQLAlchemy 2.0 with psycopg 3.** FastAPI runs sync endpoints in a thread pool.
   This keeps repositories, tests and Alembic simple. LLM calls are the slow part and are isolated
   behind a service, so they can move to async independently.
2. **Enum-like columns are `VARCHAR` plus `CHECK`**, generated from the Python enums in
   `app/core/enums.py`. Adding a value is a simple migration, unlike native PostgreSQL ENUM types.
   The initial migration is a frozen snapshot and does not import the enums.
3. **Typed settings (`pydantic-settings`)** are the only source of configuration. Production
   validation fails fast on unsafe values.
4. **Deterministic constraint names** via a SQLAlchemy naming convention, so migrations are
   reviewable and `alembic check` stays stable.
5. **Schema additions beyond the BRD (section 12)**, required by sections 10 and 22:
   `users.role`, `users.is_active`, `updated_at` on mutable tables, the `llm_usage` table
   (daily request limit and token accounting), `chat_messages`, `UNIQUE(state_id, name)` on places
   and foods (idempotent seeding, FR-25), `NOT NULL` on the planner-critical place columns, and a
   `pg_trgm` index for fast name search (FR-09).
6. **Timestamps are timezone aware** (`timestamptz`).
