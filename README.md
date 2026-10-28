# India Travel Explorer with AI Trip Planner (RAG)

Browse tourist places across India and generate personalised, day-wise trip plans with a state-aware AI chatbot. The chatbot uses **RAG**: it retrieves verified places, entrance fees, daily costs, and regional foods from PostgreSQL and gives only that data to the LLM, so it never invents attractions.

> Status: **Full-Stack Application Complete** (FastAPI Backend + PostgreSQL + Alembic + Gemini AI RAG + React 19 + TypeScript + Material UI).

---

## Tech Stack

- **Backend**: Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL, Google GenAI (Gemini), PyJWT, Passlib (bcrypt), Pydantic v2.
- **Frontend**: React 19, TypeScript 5.8, Vite 6, Material UI (MUI v6), Emotion, Axios.
- **Design System**: Custom Indian Heritage Palette (Terracotta `#E05D38`, Amber Gold `#D97706`, Backwaters Teal `#0D5C46`) supporting Dark & Light modes.

---

## Repository Layout

```
backend/
  app/
    api/v1/        # REST routers: health, auth, states, destinations, places, foods, planner, plans
    core/          # settings, enums, logging, security (bcrypt & JWT), exceptions
    db/            # engine and session dependency
    models/        # SQLAlchemy 2.0 models (10 tables)
    schemas/       # Pydantic v2 schemas and envelopes
    repositories/  # query layer (users, states, places, destinations, foods, eateries, llm_usage, plans)
    services/      # business logic: catalogue, auth, RAG planner, saved plans
    prompts/       # system and grounding prompt templates
    seed/          # data ingestion, cleaning, classification & upsert pipeline
  data/
    raw/           # Kaggle raw datasets (JSON & CSV)
    mappings/      # configurable keyword, threshold, and classification JSONs
  migrations/      # Alembic database migrations
  tests/           # comprehensive test suite (62 tests)
frontend/
  src/
    api/           # typed Axios client & services (catalogue, auth, planner, plans)
    components/
      auth/        # AuthModal (Sign In / Register)
      home/        # HeroBanner with search & category pills
      layout/      # Sticky Navbar (theme toggle & user profile) and Footer
      places/      # PlaceCard, PlaceDetailModal, PlaceFilter, PlaceExplorer
      planner/     # PlannerModal, BudgetCard, ItineraryView, ChatWidget
      plans/       # SavedPlansView (dashboard, rename, delete)
      states/      # StateCard, StateGrid with regional tabs
    context/       # AuthContext (JWT management & profile state)
    theme/         # Design tokens, MUI theme builder & ThemeContext (Dark/Light)
docs/
  adr/             # Architecture Decision Records (0001 - 0004)
```

---

## Quickstart

### 1. Backend Setup (Windows PowerShell)

Prerequisites: Python 3.12, PostgreSQL 14+ running locally.

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt

copy .env.example .env      # then configure DB credentials & GEMINI_API_KEY
```

Create the database, apply migrations, and seed data:

```powershell
# 1. Run migrations
alembic upgrade head

# 2. Ingest, clean, classify, and load tourism dataset into PostgreSQL
python -m app.seed

# 3. Run full backend test suite (62 passing tests)
pytest -v

# 4. Start local FastAPI dev server
uvicorn app.main:app --reload --port 8000
```

FastAPI Swagger documentation is accessible at: `http://localhost:8000/docs`

---

### 2. Frontend Setup (Windows PowerShell)

Prerequisites: Node.js 18+, npm 10+.

```powershell
cd frontend
npm install

# 1. Run development server (proxies /api to http://localhost:8000)
npm run dev

# 2. Build production bundle (TypeScript strict check + Vite bundle)
npm run build
```

Open your browser at: `http://localhost:5173`

---

## Features

1. **Interactive State & Regional Explorer**:
   - Filter all 34 states and union territories by region (North, South, East, West, Central, Northeast, Islands).
   - View place counts and best seasons to visit.
2. **Attraction Discovery & Deep Filtering**:
   - Search across 575 verified attractions.
   - Filter by State, Category (Beach, Hill Station, Temple, Heritage, Wildlife, Adventure, Nature, City), Budget Tier (Low, Medium, High), Season, and Hidden Gem status.
   - Detailed modal showing verified entry fees, average daily expenses, regional culinary specialties with veg/non-veg tags, recommended eateries, and destination cost tiers.
3. **RAG-Powered AI Trip Planner**:
   - Configure duration (1-15 days), target budget, comfort level, food preference, travel month, and interests.
   - Generates realistic day-by-day itineraries grounded in PostgreSQL data with zero hallucinations.
4. **Itemized Budget Visualization**:
   - Visual breakdown of accommodation, dining, activities & entry fees, and local transport against the target budget.
5. **Conversational Refinements**:
   - Built-in chat assistant allows travelers to refine itineraries in natural language ("Make Day 2 lighter on walking", "Add authentic vegetarian street food").
6. **Non-Intrusive Auth & Saved Plans**:
   - Anonymous travelers can explore all attractions and generate plans without an account.
   - Travelers can save itineraries to "My Plans", rename them, and revisit them anytime.

---

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

---

## Architecture Decision Records

- [ADR 0001: Foundation Decisions](docs/adr/0001-foundation-decisions.md)
- [ADR 0002: Catalogue API and Seed Pipeline](docs/adr/0002-catalogue-api-and-seed-pipeline.md)
- [ADR 0003: Auth and RAG Planner Architecture](docs/adr/0003-auth-and-rag-planner-architecture.md)
- [ADR 0004: Frontend Architecture, Design Tokens, and Full-Stack Integration](docs/adr/0004-frontend-react-mui-architecture.md)
