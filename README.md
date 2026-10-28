# India Travel Explorer

Browse tourist places across India and generate personalised, day wise trip plans with a
state aware AI chatbot. The chatbot uses **RAG**: it retrieves verified places and foods from
PostgreSQL and gives only that data to the LLM, so it never invents places.

> Status: **Step 2 of 8 completed** - Database schema, seed data pipeline, and REST catalogue API.

## Tech stack

Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL, React + TypeScript + Vite + MUI, Gemini.

## Repository layout

```
backend/
  app/
    api/v1/        # REST routers (health, states, destinations, places, foods)
    core/          # settings, enums, logging, exceptions
    db/            # engine and session dependency
    models/        # SQLAlchemy 2.0 models
    schemas/       # Pydantic v2 schemas and envelopes
    repositories/  # isolated query layer (states, places, destinations, foods, eateries)
    services/      # business logic orchestration (catalogue service)
    seed/          # data ingestion, cleaning, classification & upsert pipeline
  data/
    raw/           # Kaggle raw datasets (JSON & CSV)
    mappings/      # configurable keyword, threshold, and classification JSONs
    overrides/     # manual override CSV
    review/        # generated inferred & excluded audit CSVs
  migrations/      # Alembic database migrations
  tests/           # comprehensive unit and integration test suite
frontend/          # React + TS + Vite + MUI app (Step 3)
docs/adr/          # architecture decision records
```

## Backend setup (Windows PowerShell)

Prerequisites: Python 3.12, PostgreSQL 14+ running locally.

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt

copy .env.example .env      # then edit the values (never commit .env)
```

Create the database, apply migrations, and seed data:

```powershell
# 1. Run migrations
alembic upgrade head

# 2. Ingest, clean, classify, and load tourism dataset into PostgreSQL
python -m app.seed

# 3. Run full test suite
pytest -v

# 4. Start local FastAPI dev server
uvicorn app.main:app --reload --port 8000
```

Open interactive Swagger documentation in your browser at:
`http://localhost:8000/docs`

Useful commands:

| Task                         | Command                                                  |
| ---------------------------- | -------------------------------------------------------- |
| Apply migrations             | `alembic upgrade head`                                   |
| Roll back one migration      | `alembic downgrade -1`                                   |
| Run data seed                | `python -m app.seed`                                     |
| Dry-run data seed (audit)    | `python -m app.seed --dry-run`                           |
| Check models vs database     | `alembic check`                                          |
| Run test suite               | `pytest -v`                                              |
| Code lint and formatting     | `ruff check app tests` / `ruff format --check app tests` |
| Type check (strict)          | `mypy app`                                               |

## Configuration

All configuration comes from environment variables (see `backend/.env.example`), loaded through a
typed settings class in `app/core/config.py`. Production mode refuses to start with `DEBUG=true`,
a placeholder JWT secret or a wildcard CORS origin.

## Documentation

- Architecture decisions: [docs/adr](docs/adr)
