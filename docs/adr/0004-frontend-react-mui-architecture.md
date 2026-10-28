# ADR 0004: Frontend Architecture, Design Tokens, and Full-Stack Integration

## Context

With the backend fully tested and running (FastAPI, PostgreSQL, SQLAlchemy 2.0, Alembic, Gemini RAG), the user experience requires a modern, responsive, and intuitive web application:
1. **Interactive Catalogue Discovery**: Browse 34 states and union territories, 575 verified attractions, and local food items with comprehensive filtering by state, category, budget tier, best season, search keywords, and hidden gems.
2. **AI Trip Planner User Flow**: Grounded trip generation modal with duration sliders, budget configuration, dietary choices, and interest chips.
3. **Conversational Itinerary Refinement**: Seamless chat widget enabling travelers to tweak schedules, swap attractions, and adjust budgets in natural language.
4. **Itemized Budget Visualization**: Visual cost breakdown across accommodation, food, activities, and transport against the traveler's target budget.
5. **Non-Intrusive Authentication**: Anonymous travelers can freely explore and generate itineraries; authentication is prompted only when saving itineraries or accessing "My Plans".
6. **Design System & Theme**: Indian heritage palette (Terracotta `#E05D38`, Amber Gold `#D97706`, Backwaters Teal `#0D5C46`) supporting both Dark and Light modes.

## Decisions

1. **Framework & Tooling**:
   - React 19 + TypeScript 5.8 + Vite 6 for instant HMR and optimized production bundles.
   - Material UI (MUI v6) with `@emotion/react` and `@emotion/styled` for accessible, component-rich enterprise UI.
   - Axios client configured with JWT interceptors, correlation IDs, and unified error handling.

2. **Design Tokens & Indian Heritage Theme**:
   - Defined custom semantic design tokens in `frontend/src/theme/tokens.ts`:
     - Primary: Terracotta `#E05D38`
     - Secondary: Amber Gold `#D97706`
     - Accent: Backwaters Teal `#0D5C46`
     - Category-specific palettes (Beaches, Hill Stations, Temples, Wildlife, Forts, Treks, Nature).
   - Dynamic dark/light mode toggle with persistence in `localStorage`.

3. **Component Architecture**:
   - **Layout**: `Navbar` (logo, tab navigation, AI Planner CTA, theme toggle, user profile menu), `Footer`.
   - **Catalogue**:
     - `HeroBanner`: Search input, popular category quick pills, and trip planner CTA.
     - `StateGrid` & `StateCard`: Region tabs (North, South, East, West, Central, Northeast, Islands) and state overview cards.
     - `PlaceExplorer`, `PlaceFilter`, and `PlaceCard`: Multi-attribute search and filtering with pagination and hidden gem highlights.
     - `PlaceDetailModal`: Complete attraction overview, entry fees, daily costs, authentic dishes (with veg/non-veg tags), recommended eateries, and destination budget tiers.
   - **AI Trip Planner**:
     - `PlannerModal`: Multi-attribute trip configuration, itinerary generation state, itemized budget view, and save workflow.
     - `BudgetCard`: Itemized cost breakdown (accommodation, food, activities, local transport) with budget comparison indicators.
     - `ItineraryView`: Day-by-day accordion schedule with timing, attraction badges, culinary pairings, and local travel tips.
     - `ChatWidget`: Conversational refinement box supporting natural language requests and dynamic plan updates.
   - **User Accounts & Saved Plans**:
     - `AuthModal`: Tabbed Sign In and Register dialog.
     - `SavedPlansView`: Dashboard of user's saved itineraries with viewing, renaming, and deletion actions.

4. **Vite Development Proxy & Production Bundling**:
   - Configured Vite development server to proxy `/api` requests to `http://localhost:8000`, eliminating CORS in local environments.
   - Configured Rollup manual chunking splitting `@mui` and `axios` into isolated vendor chunks under 400 kB.

## Consequences

- Full-stack end-to-end integration is verified and compiling with zero TypeScript errors (`tsc -b`).
- Responsive across mobile, tablet, and desktop devices.
- Seamless authentication experience matching BRD specifications.

