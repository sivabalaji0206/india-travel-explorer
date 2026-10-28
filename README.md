# India Travel Explorer

Browse tourist places across India and generate personalised, day wise trip plans with a
state aware AI chatbot. The chatbot uses **RAG**: it retrieves verified places and foods from
PostgreSQL and gives only that data to the LLM, so it never invents places.

> Status: **Backend 100% Complete** (Database schema, seed data pipeline, Catalogue REST API, JWT Authentication, RAG AI Trip Planner with Gemini, and Saved Plans CRUD).

## Tech stack

Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL, Google GenAI (Gemini), React + TypeScript + Vite + MUI.

## Repository layout

```
backend/
  app/
    api/v1/        # REST routers: health, auth, states, destinations, places, foods, planner, plans
    core/          # settings, enums, logging, security (bcrypt & JWT), exceptions
    db/            # engine and session dependency
    models/        # SQLAlchemy 2.0 models (10 tables)
    schemas/       # Pydantic v2 schemas and envelopes
    repositories/  # isolated query layer (users, states, places, destinations, foods, eateries, llm_usage, plans)
    services/      # business logic: catalogue, auth, RAG planner, saved plans
    prompts/       # system and grounding prompt templates
    seed/          # data ingestion, cleaning, classification & upsert pipeline
  data/
    raw/           # Kaggle raw datasets (JSON & CSV)
    mappings/      # configurable keyword, threshold, and classification JSONs
    overrides/     # manual override CSV
    review/        # generated inferred & excluded audit CSVs
  migrations/      # Alembic database migrations
  tests/           # comprehensive test suite (62 tests)
frontend/          # React + TS + Vite + MUI app (Next Step)
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

## Complete REST API Endpoints

| Category | Method | Endpoint | Description |
|---|---|---|---|
| **Health** | `GET` | `/api/v1/health` | Health & DB connection probe |
| **Auth** | `POST` | `/api/v1/auth/register` | Register new user account & get JWT token |
| | `POST` | `/api/v1/auth/login` | Login with email/password & get JWT token |
| | `GET` | `/api/v1/auth/me` | Authenticated user profile |
| **States** | `GET` | `/api/v1/states` | List all 34 states with place/destination counts |
| | `GET` | `/api/v1/states/{id}` | State detail |
| | `GET` | `/api/v1/states/{id}/places` | Attractions in state with filters & pagination |
| | `GET` | `/api/v1/states/{id}/destinations` | Travel destinations in state |
| | `GET` | `/api/v1/states/{id}/foods` | Regional culinary dishes in state |
| **Destinations** | `GET` | `/api/v1/destinations` | Browse travel towns & circuits |
| | `GET` | `/api/v1/destinations/{id}` | Destination with budget tiers, eateries & dishes |
| **Places** | `GET` | `/api/v1/places` | Global search & filter by category, tier, season |
| | `GET` | `/api/v1/places/{id}` | Place detail with nearby foods and budget ranges |
| **Foods** | `GET` | `/api/v1/foods` | Browse regional dishes with `veg`/`non_veg` filters |
| **AI Planner** | `POST` | `/api/v1/planner/generate` | RAG-grounded day-wise itinerary generator |
| | `POST` | `/api/v1/planner/chat` | Conversational plan modification with guardrails |
| **Saved Plans** | `GET` | `/api/v1/plans` | List user's saved itineraries (Auth required) |
| | `POST` | `/api/v1/plans` | Save a generated itinerary (Auth required) |
| | `GET` | `/api/v1/plans/{id}` | View saved plan (Auth required) |
| | `PATCH` | `/api/v1/plans/{id}` | Rename / update saved plan (Auth required) |
| | `DELETE` | `/api/v1/plans/{id}` | Delete saved plan (Auth required) |

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
