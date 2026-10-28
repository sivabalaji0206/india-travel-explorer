# ADR 0002: Seed Data Pipeline and REST Catalogue API

## Context

The raw Kaggle tourism datasets consist of:
1. `india_tourism_dataset.json`: 100 travel destinations with rich arrays of attractions, hidden gems, cost breakdowns by tier (budget, mid-range, luxury), transport info, culture, and cuisine notes.
2. `india-tourism-food-dataset.csv`: 68 tourist towns with local dishes, eateries by meal (breakfast/lunch/dinner), entry fees, and daily budgets.

We needed:
1. An idempotent, verifiable data pipeline to normalize these disparate sources into PostgreSQL with zero duplicate records upon re-execution.
2. A clean, layered REST API architecture (`routes -> services -> repositories -> models`) serving the state, destination, attraction, and culinary catalogue with filtering, search, pagination, and unified error envelopes.

## Decisions

1. **Entity Normalization**:
   - Mapped destinations separately from child attractions (`places`) to capture regional context (e.g. Munnar vs Tea Museum) and prevent denormalized loss of cost tier structures.
   - Introduced `destination_cost_tiers` and `eateries` to cleanly link local dining and tier-based budgets.
   - Preserved `places` as the core RAG retrieval unit with `category`, `budget_level`, `best_season`, and `avg_daily_cost`.

2. **Classification & Mapping Rules**:
   - Decoupled classification rules from code into JSON mapping files under `backend/data/mappings/` (keywords, thresholds, season rules, food rules).
   - Inferred values and excluded non-food/generic items are automatically audited to `backend/data/review/inferred_values.csv` and `excluded_items.csv`.

3. **Catalogue REST API Design**:
   - **Layered Architecture**: Routers handle HTTP concerns, input validation, and parameter extraction. Services execute business logic. Repositories execute database queries with SQLAlchemy 2.0.
   - **Pagination**: Uniform `PaginatedResponse[T]` with `PageMeta` (`page`, `page_size`, `total_items`, `total_pages`, `has_next`, `has_previous`).
   - **Error Handling**: Custom `AppException` hierarchy mapped via exception handlers to a standard `{ "error": { "code": ..., "message": ..., "details": ... }, "request_id": ... }` envelope.
   - **Observability**: Request correlation ID via `X-Request-ID` and structured request logging.

## Consequences

- The database holds 34 states, 155 destinations, 465 cost tiers, 575 verified places, 245 foods, and 402 eateries.
- State list queries compute attraction and destination counts in a single aggregated outer join query without N+1 overhead.
- All endpoints are covered by automated unit and integration tests (49 passing tests).
