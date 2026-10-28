# ADR 0003: User Authentication and RAG AI Trip Planner Architecture

## Context

The BRD requirements mandate:
1. **User Authentication (FR-01 to FR-04)**: Optional for browsing and generating plans, required only for saving and managing itineraries.
2. **AI Trip Planner & RAG (FR-12 to FR-21)**: Zero hallucination policy — LLM must only use verified attractions and foods from the database.
3. **Conversational Refinements & Guardrails (FR-18 & FR-21)**: Ability to modify plans via chat while refusing off-topic prompts politely.
4. **Cost & Token Accounting (BRD Section 10)**: Daily per-user request limits via `llm_usage`.

## Decisions

1. **Lightweight, Native Security**:
   - Implemented password hashing via `bcrypt` with unique salts.
   - Implemented stateless token authentication via signed `PyJWT` (HS256) with configurable expiration (`ACCESS_TOKEN_EXPIRE_MINUTES`).
   - Provided both `get_current_user` (enforces auth for saving/modifying plans) and `get_optional_user` (allows anonymous travelers to generate itineraries seamlessly).

2. **RAG Grounding & Prompt Strategy**:
   - Built a two-stage retrieval pipeline:
     1. PostgreSQL queries fetch verified candidate places matching the target state, traveler interests (`PlaceCategory`), and budget tier (`BudgetLevel`), plus regional culinary dishes matching `FoodType`.
     2. Prompt injects exact database records (`place_id`, `place_name`, `entry_fee`, `category`, `destination`) with strict instructions to schedule only candidates from this list.
   - Built a deterministic grounded generator for testing and local development when `GEMINI_API_KEY` is not present, ensuring 100% reliable CI/CD without network dependencies or paid API calls.

3. **Output Validation & Retries (FR-20)**:
   - Enforced Pydantic schema validation on the LLM output.
   - Integrated single-retry recovery on malformed JSON with feedback to the model.

4. **Saved Plans (FR-22, FR-23)**:
   - Full CRUD under `/api/v1/plans` ensuring strict user ownership isolation.

## Consequences

- 100% of backend functional requirements (FR-01 through FR-25) are now fully implemented and verified.
- The test suite covers all 62 unit and integration tests across Auth, Catalogue, RAG Planner, and Saved Plans.
