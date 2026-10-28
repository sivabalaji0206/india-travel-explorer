"""Planner service orchestrating RAG candidate retrieval, LLM generation, and guardrails."""

from datetime import date
from decimal import Decimal
import logging

from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.exceptions import BadRequestError, EntityNotFoundError
from app.models.food import Food
from app.models.place import Place
from app.models.user import User
from app.prompts.planner_prompts import (
    SYSTEM_PROMPT,
    build_chat_prompt,
    build_plan_prompt,
)
from app.repositories.food_repository import FoodRepository
from app.repositories.llm_usage_repository import LlmUsageRepository
from app.repositories.place_repository import PlaceRepository
from app.repositories.state_repository import StateRepository
from app.schemas.planner import (
    BudgetBreakdown,
    DayPlan,
    ItineraryMealItem,
    ItineraryPlaceItem,
    PlannerChatRequest,
    PlannerChatResponse,
    TripPlanRequest,
    TripPlanResponse,
)
from app.services.llm_client import LlmClient

logger = logging.getLogger(__name__)

OFF_TOPIC_KEYWORDS = (
    "python",
    "code",
    "recipe",
    "crypto",
    "bitcoin",
    "stocks",
    "president",
    "prime minister",
    "hack",
)


class PlannerService:
    """Manages RAG-grounded trip generation and conversational refinements."""

    def __init__(
        self,
        state_repo: StateRepository | None = None,
        place_repo: PlaceRepository | None = None,
        food_repo: FoodRepository | None = None,
        llm_usage_repo: LlmUsageRepository | None = None,
        llm_client: LlmClient | None = None,
        settings: Settings | None = None,
    ) -> None:
        self.state_repo = state_repo or StateRepository()
        self.place_repo = place_repo or PlaceRepository()
        self.food_repo = food_repo or FoodRepository()
        self.llm_usage_repo = llm_usage_repo or LlmUsageRepository()
        self.settings = settings or get_settings()
        self.llm_client = llm_client or LlmClient(self.settings)

    def generate_itinerary(
        self,
        db: Session,
        request: TripPlanRequest,
        user: User | None = None,
    ) -> TripPlanResponse:
        """Retrieve verified state places and generate an itinerary with zero hallucinations."""
        state = self.state_repo.get_state_by_id(db, request.state_id)
        if not state:
            raise EntityNotFoundError("State", request.state_id)

        # Rate-limiting / cost control check for authenticated users (BRD Section 10)
        today = date.today()
        if user and self.llm_usage_repo.has_exceeded_limit(
            db, user.id, today, self.settings.llm_daily_request_limit
        ):
            raise BadRequestError(
                f"You have reached your daily limit of {self.settings.llm_daily_request_limit} "
                "AI itinerary generations. Please try again tomorrow."
            )

        # RAG Retrieval Step: Fetch verified places matching preferences
        places = self.place_repo.get_rag_candidates(
            db,
            state_id=request.state_id,
            interests=request.interests,
            budget_level=request.budget_tier,
            limit=self.settings.rag_max_places,
        )

        # FR-19: Clear notice if verified data is insufficient
        if len(places) < 2:
            raise BadRequestError(
                f"Insufficient verified attractions in our database for {state.name} "
                "to generate an accurate itinerary. Our team is actively expanding coverage."
            )

        # RAG Retrieval Step: Fetch regional culinary dishes
        foods = self.food_repo.get_rag_foods(
            db,
            state_id=request.state_id,
            food_type=request.food_preference,
            limit=15,
        )

        if self.llm_client.has_api_key:
            prompt = build_plan_prompt(state.name, request, places, foods)
            try:
                raw_json, prompt_tokens, comp_tokens = self.llm_client.generate_json(
                    system_instruction=SYSTEM_PROMPT,
                    prompt=prompt,
                    retries=self.settings.llm_invalid_json_retries,
                )
                if user:
                    self.llm_usage_repo.record_usage(
                        db,
                        user_id=user.id,
                        usage_date=today,
                        prompt_tokens=prompt_tokens,
                        completion_tokens=comp_tokens,
                    )
                return TripPlanResponse.model_validate(raw_json)
            except Exception as exc:
                logger.warning("LLM API generation failed (%s). Using grounded fallback.", exc)

        # Grounded deterministic fallback (used when GEMINI_API_KEY is not set or during tests)
        return self._build_grounded_fallback_plan(state.name, request, places, foods)

    def chat_follow_up(
        self,
        db: Session,
        request: PlannerChatRequest,
        user: User | None = None,
    ) -> PlannerChatResponse:
        """Handle follow-up conversation, adjustments, or queries with travel guardrails."""
        state = self.state_repo.get_state_by_id(db, request.state_id)
        if not state:
            raise EntityNotFoundError("State", request.state_id)

        # FR-21: Guardrail - check for off-topic query
        msg_lower = request.message.lower()
        if any(word in msg_lower for word in OFF_TOPIC_KEYWORDS):
            return PlannerChatResponse(
                reply=(
                    "I am your India Travel Explorer AI assistant. I can only help you plan "
                    "travel itineraries, suggest verified attractions, and recommend local cuisine."
                ),
                updated_plan=None,
            )

        # Retrieve candidate places in case modification requires replacement
        places = self.place_repo.get_rag_candidates(
            db,
            state_id=request.state_id,
            limit=self.settings.rag_max_places,
        )
        foods = self.food_repo.get_rag_foods(db, state_id=request.state_id, limit=10)

        if self.llm_client.has_api_key:
            history_str = "\n".join(
                f"{turn.role.value.capitalize()}: {turn.content}"
                for turn in request.chat_history[-self.settings.chat_history_turns :]
            )
            prompt = build_chat_prompt(
                state_name=state.name,
                current_plan=request.current_plan,
                chat_history_str=history_str,
                new_message=request.message,
                places=places,
                foods=foods,
            )
            try:
                raw_json, p_tokens, c_tokens = self.llm_client.generate_json(
                    system_instruction=SYSTEM_PROMPT,
                    prompt=prompt,
                    retries=self.settings.llm_invalid_json_retries,
                )
                if user:
                    self.llm_usage_repo.record_usage(
                        db,
                        user_id=user.id,
                        usage_date=date.today(),
                        prompt_tokens=p_tokens,
                        completion_tokens=c_tokens,
                    )
                return PlannerChatResponse.model_validate(raw_json)
            except Exception as exc:
                logger.warning("LLM chat follow-up failed (%s).", exc)

        return PlannerChatResponse(
            reply=(
                f"I've noted your preference for {request.message}. All scheduled spots remain "
                f"verified attractions in {state.name}. Safe travels!"
            ),
            updated_plan=None,
        )

    def _build_grounded_fallback_plan(
        self,
        state_name: str,
        request: TripPlanRequest,
        places: list[Place],
        foods: list[Food],
    ) -> TripPlanResponse:
        """Deterministic, grounded plan builder ensuring 100% valid schema."""
        days: list[DayPlan] = []
        num_places = len(places)
        places_per_day = max(1, min(3, num_places // request.duration_days))

        total_entry = Decimal("0")
        total_food = Decimal("0")

        for d in range(1, request.duration_days + 1):
            start_idx = ((d - 1) * places_per_day) % num_places
            end_idx = min(start_idx + places_per_day, num_places)
            day_places_raw = places[start_idx:end_idx] or [places[0]]

            dest_name = (
                day_places_raw[0].destination.name if day_places_raw[0].destination else state_name
            )

            day_places = [
                ItineraryPlaceItem(
                    place_id=p.id,
                    place_name=p.name,
                    category=p.category,
                    description=p.description or f"Visit the iconic {p.name}",
                    entry_fee=p.entry_fee or Decimal("0"),
                    recommended_time="Morning" if idx == 0 else "Afternoon",
                    is_hidden_gem=p.is_hidden_gem,
                )
                for idx, p in enumerate(day_places_raw)
            ]
            for dp in day_places:
                total_entry += dp.entry_fee

            day_meals: list[ItineraryMealItem] = []
            if foods:
                food_item = foods[(d - 1) % len(foods)]
                meal = ItineraryMealItem(
                    meal_type="Lunch",
                    dish_name=food_item.name,
                    food_type=food_item.food_type,
                    avg_price=food_item.avg_price,
                )
                day_meals.append(meal)
                total_food += food_item.avg_price * 2  # lunch + dinner estimate

            day_budget = Decimal(round(float(request.total_budget) / request.duration_days, 2))
            days.append(
                DayPlan(
                    day_number=d,
                    theme=f"Exploring {dest_name} & Heritage",
                    destination_name=dest_name,
                    places=day_places,
                    meals=day_meals,
                    day_budget=day_budget,
                    travel_tips="Start early to beat the heat. Carry water and modest attire.",
                )
            )

        accom_est = Decimal(round(float(request.total_budget) * 0.40, 2))
        trans_est = Decimal(round(float(request.total_budget) * 0.20, 2))
        breakdown = BudgetBreakdown(
            accommodation_estimate=accom_est,
            food_estimate=total_food or Decimal(round(float(request.total_budget) * 0.25, 2)),
            activities_and_entry=total_entry,
            local_transport_estimate=trans_est,
            total_estimated_cost=request.total_budget,
        )

        return TripPlanResponse(
            state_id=request.state_id,
            state_name=state_name,
            trip_title=f"{request.duration_days}-Day Explorer Trip to {state_name}",
            total_days=request.duration_days,
            total_budget=request.total_budget,
            budget_breakdown=breakdown,
            days=days,
            overall_advice=(
                "Best visited during the recommended season. All attractions are verified "
                "from our catalogue. Always respect local customs at religious sites."
            ),
        )
