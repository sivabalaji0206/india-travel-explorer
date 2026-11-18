"""Enterprise Planner Service orchestrating Geo-Spatial RAG, Gemini 2.5 LLM, and Circuit-Breaker Failover."""

from datetime import date
from decimal import Decimal
import difflib
import logging
import re
from typing import Any

from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.enums import BudgetLevel, FoodType, PlaceCategory
from app.core.exceptions import BadRequestError, EntityNotFoundError, ExternalServiceError
from app.models.food import Food
from app.models.place import Place
from app.models.user import User
from app.prompts.planner_prompts import (
    ASSISTANT_SYSTEM_PROMPT,
    SYSTEM_PROMPT,
    build_assistant_converse_prompt,
    build_chat_prompt,
    build_plan_prompt,
)
from app.repositories.food_repository import FoodRepository
from app.repositories.llm_usage_repository import LlmUsageRepository
from app.repositories.place_repository import PlaceRepository
from app.repositories.state_repository import StateRepository
from app.schemas.planner import (
    DayPlan,
    ItineraryMealItem,
    ItineraryPlaceItem,
    PlannerAssistantRequest,
    PlannerAssistantResponse,
    PlannerChatRequest,
    PlannerChatResponse,
    TripPlanRequest,
    TripPlanResponse,
)
from app.services.geo_routing import (
    build_circuit_blueprint,
    build_offline_blueprint_plan,
    validate_and_ground_plan,
)
from app.services.llm_client import LlmClient

logger = logging.getLogger(__name__)

OFF_TOPIC_KEYWORDS = (
    "python",
    "write code",
    "sql",
    "crypto",
    "bitcoin",
    "stock market",
    "president",
    "prime minister",
    "hack",
)


class PlannerService:
    """Enterprise RAG-grounded AI Trip Planner with Geo-Spatial pre-routing and circuit-breaker resilience."""

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
        """Cluster verified state attractions by GPS, invoke Gemini 2.5, and enforce strict guardrails."""
        state = self.state_repo.get_state_by_id(db, request.state_id)
        if not state:
            raise EntityNotFoundError("State", request.state_id)

        today = date.today()
        if user and self.llm_usage_repo.has_exceeded_limit(
            db, user.id, today, self.settings.llm_daily_request_limit
        ):
            raise BadRequestError(
                f"You have reached your daily limit of {self.settings.llm_daily_request_limit} "
                "AI itinerary generations. Please try again tomorrow."
            )

        max_candidates = max(self.settings.rag_max_places if self.settings else 40, 40)
        places = self.place_repo.get_rag_candidates(
            db,
            state_id=request.state_id,
            interests=request.interests,
            budget_level=request.budget_tier,
            limit=max_candidates,
        )

        if len(places) < 2:
            raise BadRequestError(
                f"Insufficient verified attractions in our database for {state.name} "
                "to generate an accurate itinerary. Our team is actively expanding coverage."
            )

        foods = self.food_repo.get_rag_foods(
            db,
            state_id=request.state_id,
            food_type=request.food_preference,
            limit=30,
        )

        # Stage 1: Deterministic Haversine GPS Clustering & Contiguous Circuit Blueprint
        blueprint = build_circuit_blueprint(state.name, request, places, foods)

        # Stage 2 & 3: Primary Gemini 2.5 Generation + Self-Correcting Guardrail, with Circuit-Breaker Failover
        if self.llm_client.has_api_key:
            prompt = build_plan_prompt(state.name, request, places, foods, blueprint)
            grounded_holder: list[TripPlanResponse] = []

            def _validate_itinerary(parsed_json: dict[str, Any]) -> TripPlanResponse:
                validated = validate_and_ground_plan(
                    parsed_json,
                    state_id=request.state_id,
                    state_name=state.name,
                    request=request,
                    places=places,
                    foods=foods,
                    blueprint=blueprint,
                )
                grounded_holder.clear()
                grounded_holder.append(validated)
                return validated

            try:
                _, prompt_tokens, comp_tokens = self.llm_client.generate_json(
                    system_instruction=SYSTEM_PROMPT,
                    prompt=prompt,
                    retries=self.settings.llm_invalid_json_retries if self.settings else 2,
                    thinking_budget=1024,
                    validator=_validate_itinerary,
                )
                if user:
                    self.llm_usage_repo.record_usage(
                        db,
                        user_id=user.id,
                        usage_date=today,
                        prompt_tokens=prompt_tokens,
                        completion_tokens=comp_tokens,
                    )
                return grounded_holder[0]
            except (ExternalServiceError, Exception) as exc:
                logger.warning(
                    "Upstream Gemini API unavailable during generate_itinerary (%s). "
                    "Engaging Geo-Spatial Circuit Engine failover.",
                    exc,
                )

        return build_offline_blueprint_plan(request.state_id, state.name, request, blueprint)

    def chat_follow_up(
        self,
        db: Session,
        request: PlannerChatRequest,
        user: User | None = None,
    ) -> PlannerChatResponse:
        """Handle itinerary Q&A and live plan refinements via Gemini 2.5 with circuit-breaker failover."""
        state = self.state_repo.get_state_by_id(db, request.state_id)
        if not state:
            raise EntityNotFoundError("State", request.state_id)

        msg_lower = request.message.lower()
        if any(word in msg_lower for word in OFF_TOPIC_KEYWORDS):
            return PlannerChatResponse(
                reply=(
                    "I am your India Travel Explorer AI assistant. I can only help you plan "
                    "travel itineraries, suggest verified attractions, and recommend local cuisine."
                ),
                updated_plan=None,
            )

        today = date.today()
        if user and self.llm_usage_repo.has_exceeded_limit(
            db, user.id, today, self.settings.llm_daily_request_limit
        ):
            raise BadRequestError("Daily AI refinement limit reached. Please try again tomorrow.")

        places = self.place_repo.get_rag_candidates(db, state_id=request.state_id, limit=40)
        foods = self.food_repo.get_rag_foods(db, state_id=request.state_id, limit=30)

        max_turns = self.settings.chat_history_turns if self.settings else 6
        history_str = "\n".join(
            f"{turn.role.value.capitalize()}: {turn.content}"
            for turn in request.chat_history[-max_turns:]
        )

        if self.llm_client.has_api_key:
            prompt = build_chat_prompt(
                state.name,
                request.current_plan,
                history_str,
                request.message,
                places,
                foods,
            )
            validated_chat_holder: list[PlannerChatResponse] = []

            def _validate_chat(parsed_json: dict[str, Any]) -> PlannerChatResponse:
                reply_text = str(parsed_json.get("reply") or "").strip()
                if not reply_text:
                    raise ValueError("Chat response must contain a non-empty 'reply' string.")

                raw_updated = parsed_json.get("updated_plan")
                grounded_plan: TripPlanResponse | None = None
                if isinstance(raw_updated, dict):
                    raw_days = raw_updated.get("days")
                    day_len = len(raw_days) if isinstance(raw_days, list) and raw_days else request.current_plan.total_days
                    synth_req = TripPlanRequest(
                        state_id=request.state_id,
                        duration_days=day_len,
                        total_budget=request.current_plan.total_budget,
                    )
                    bp = build_circuit_blueprint(state.name, synth_req, places, foods)
                    grounded_plan = validate_and_ground_plan(
                        raw_updated,
                        state_id=request.state_id,
                        state_name=state.name,
                        request=synth_req,
                        places=places,
                        foods=foods,
                        blueprint=bp,
                    )

                resp = PlannerChatResponse(reply=reply_text, updated_plan=grounded_plan)
                validated_chat_holder.clear()
                validated_chat_holder.append(resp)
                return resp

            try:
                _, prompt_tokens, comp_tokens = self.llm_client.generate_json(
                    system_instruction=SYSTEM_PROMPT,
                    prompt=prompt,
                    retries=self.settings.llm_invalid_json_retries if self.settings else 2,
                    thinking_budget=768,
                    validator=_validate_chat,
                )
                if user:
                    self.llm_usage_repo.record_usage(
                        db,
                        user_id=user.id,
                        usage_date=today,
                        prompt_tokens=prompt_tokens,
                        completion_tokens=comp_tokens,
                    )
                return validated_chat_holder[0]
            except (ExternalServiceError, Exception) as exc:
                logger.warning(
                    "Upstream Gemini API unavailable during chat_follow_up (%s). "
                    "Engaging local refinement engine.",
                    exc,
                )

        return self._local_refine_itinerary(state.name, request, places, foods)

    def _local_refine_itinerary(
        self,
        state_name: str,
        request: PlannerChatRequest,
        places: list[Place],
        foods: list[Food],
    ) -> PlannerChatResponse:
        """Intelligent local itinerary refiner when upstream LLM is unreachable."""
        msg = request.message.lower()
        plan = request.current_plan

        # Detect hub switch or circuit change request (e.g. "switch to Tirupati", "different region", "temple circuit", "keep cost under budget")
        known_hubs = {
            p.destination.name.lower()
            for p in places
            if p.destination and p.destination.name
        }
        requested_hub: str | None = None
        for h_name in known_hubs:
            if h_name in msg or any(part in msg for part in h_name.split() if len(part) >= 4):
                requested_hub = h_name
                break

        if requested_hub or "different" in msg or "another" in msg or "circuit" in msg or "budget" in msg or "cheaper" in msg:
            new_budget = plan.total_budget
            new_tier = BudgetLevel.MEDIUM
            if "budget" in msg or "cheaper" in msg or "low" in msg or "under" in msg:
                new_budget = Decimal(str(round(float(plan.total_budget) * 0.80 / 100.0) * 100))
                new_tier = BudgetLevel.LOW
            new_interests: list[PlaceCategory] = []
            if "temple" in msg or "spiritual" in msg or "tirupati" in msg:
                new_interests = [PlaceCategory.TEMPLE]
            elif "beach" in msg or "coast" in msg:
                new_interests = [PlaceCategory.BEACH]
            elif "hill" in msg or "nature" in msg or "waterfall" in msg:
                new_interests = [PlaceCategory.HILL_STATION, PlaceCategory.NATURE]
            elif "heritage" in msg or "fort" in msg:
                new_interests = [PlaceCategory.HERITAGE]

            current_hubs = {d.destination_name for d in plan.days[:2] if d.destination_name}
            excl = current_hubs if ("different" in msg or "another" in msg or "switch" in msg) and not requested_hub else None
            synth_req = TripPlanRequest(
                state_id=request.state_id,
                duration_days=plan.total_days,
                total_budget=new_budget,
                budget_tier=new_tier,
                interests=new_interests,
            )
            bp = build_circuit_blueprint(
                state_name,
                synth_req,
                places,
                foods,
                preferred_hub=requested_hub,
                excluded_hubs=excl,
            )
            rebuilt = build_offline_blueprint_plan(request.state_id, state_name, synth_req, bp)
            day_bullets = "\n".join(
                f"• **Day {d.day_number} – {d.destination_name} (₹{int(d.day_budget):,}):** "
                f"{', '.join(p.place_name for p in d.places)}"
                + (f" | *Dining: {d.meals[0].dish_name}*" if d.meals else "")
                for d in rebuilt.days
            )
            return PlannerChatResponse(
                reply=(
                    f"I have updated your itinerary to **{rebuilt.trip_title}** "
                    f"(Estimated Total: **₹{int(rebuilt.budget_breakdown.total_estimated_cost):,}**):\n\n"
                    f"{day_bullets}\n\n"
                    "The interactive itinerary card below has been refreshed with the full schedule!"
                ),
                updated_plan=rebuilt,
            )
        day_match = re.search(r"day\s*(\d+)", msg)
        target_day_num = int(day_match.group(1)) if day_match else (2 if len(plan.days) >= 2 else 1)
        target_day_num = max(1, min(len(plan.days), target_day_num))

        if "relax" in msg or "less" in msg or "lighter" in msg or "easy" in msg:
            new_days: list[DayPlan] = []
            for d in plan.days:
                if d.day_number == target_day_num and len(d.places) > 2:
                    trimmed = d.places[:2]
                    new_days.append(
                        d.model_copy(
                            update={
                                "places": trimmed,
                                "theme": f"Relaxed Exploration of {d.destination_name}",
                                "travel_tips": f"Pace kept intentionally relaxed in {d.destination_name} with leisure time between visits.",
                            }
                        )
                    )
                else:
                    new_days.append(d)
            updated = plan.model_copy(update={"days": new_days})
            return PlannerChatResponse(
                reply=(
                    f"I have made **Day {target_day_num} ({plan.days[target_day_num - 1].destination_name})** "
                    "more relaxed with fewer stops and extra leisure time!"
                ),
                updated_plan=updated,
            )

        if "food" in msg or "dish" in msg or "veg" in msg or "street" in msg:
            used_dishes = {m.dish_name.lower() for d in plan.days for m in d.meals}
            want_veg = "veg" in msg and "non" not in msg
            cand_foods = [
                f for f in foods
                if f.name.lower() not in used_dishes
                and (not want_veg or f.food_type in (FoodType.VEG, FoodType.VEGAN))
            ] or foods
            if cand_foods:
                chosen = cand_foods[0]
                new_days = []
                for d in plan.days:
                    if d.day_number == target_day_num:
                        new_meal = ItineraryMealItem(
                            meal_type="Lunch & Street Specialty",
                            dish_name=chosen.name,
                            food_type=chosen.food_type,
                            avg_price=chosen.avg_price,
                        )
                        new_days.append(d.model_copy(update={"meals": [new_meal]}))
                    else:
                        new_days.append(d)
                updated = plan.model_copy(update={"days": new_days})
                return PlannerChatResponse(
                    reply=(
                        f"Updated **Day {target_day_num}** dining to feature **{chosen.name}** "
                        f"(₹{chosen.avg_price}), an authentic local specialty of {state_name}!"
                    ),
                    updated_plan=updated,
                )

        if "swap" in msg or "replace" in msg or "nature" in msg or "beach" in msg or "temple" in msg or "heritage" in msg:
            scheduled_ids = {p.place_id for d in plan.days for p in d.places}
            target_day = plan.days[target_day_num - 1]
            unvisited = [p for p in places if p.id not in scheduled_ids]
            if unvisited and target_day.places:
                replacement = unvisited[0]
                updated_places = list(target_day.places[:-1]) + [
                    ItineraryPlaceItem(
                        place_id=replacement.id,
                        place_name=replacement.name,
                        category=replacement.category,
                        description=replacement.description or f"Explore {replacement.name}.",
                        entry_fee=replacement.entry_fee or Decimal("0"),
                        recommended_time="Sunset / Evening",
                        is_hidden_gem=bool(replacement.is_hidden_gem),
                    )
                ]
                new_days = [
                    d.model_copy(update={"places": updated_places}) if d.day_number == target_day_num else d
                    for d in plan.days
                ]
                updated = plan.model_copy(update={"days": new_days})
                return PlannerChatResponse(
                    reply=(
                        f"I swapped the final stop on **Day {target_day_num}** with **{replacement.name}** "
                        f"({replacement.category.value.replace('_', ' ').title()})!"
                    ),
                    updated_plan=updated,
                )

        return PlannerChatResponse(
            reply=(
                f"For your **{state_name}** itinerary, mornings between **7:30 AM and 10:00 AM** are ideal "
                "for major landmarks, while late afternoons are best for scenic viewpoints and coastal/nature spots."
            ),
            updated_plan=None,
        )

    def converse(
        self,
        db: Session,
        request: PlannerAssistantRequest,
    ) -> PlannerAssistantResponse:
        """Intelligently parse intent, extract travel entities, and converse via Gemini 2.5 with failover."""
        states = self.state_repo.list_states_with_counts(db)
        states_summary = "\n".join(
            f"- [ID: {s['id']}] {s['name']} ({s.get('region', 'India')}) - {s.get('place_count', 0)} verified attractions"
            for s in states
        )

        current_ctx = {
            "state_id": request.state_id,
            "state_name": next((s["name"] for s in states if s["id"] == request.state_id), None),
            "duration_days": request.duration_days,
            "total_budget": float(request.total_budget) if request.total_budget else None,
            "budget_tier": request.budget_tier.value if request.budget_tier else "medium",
            "food_preference": request.food_preference.value if request.food_preference else None,
            "travel_month": request.travel_month,
            "interests": [i.value for i in request.interests] if request.interests else [],
        }

        history_str = "\n".join(
            f"{turn.role.value.capitalize()}: {turn.content}"
            for turn in request.chat_history[-6:]
        )

        if self.llm_client.has_api_key:
            prompt = build_assistant_converse_prompt(
                states_summary=states_summary,
                user_message=request.message,
                chat_history_str=history_str,
                current_context=current_ctx,
            )
            assistant_holder: list[PlannerAssistantResponse] = []

            def _validate_assistant(parsed_json: dict[str, Any]) -> PlannerAssistantResponse:
                resp = self._bind_verified_state(
                    PlannerAssistantResponse.model_validate(parsed_json),
                    states,
                )
                assistant_holder.clear()
                assistant_holder.append(resp)
                return resp

            try:
                self.llm_client.generate_json(
                    system_instruction=ASSISTANT_SYSTEM_PROMPT,
                    prompt=prompt,
                    retries=self.settings.llm_invalid_json_retries if self.settings else 2,
                    thinking_budget=512,
                    validator=_validate_assistant,
                )
                return assistant_holder[0]
            except (ExternalServiceError, Exception) as exc:
                logger.warning(
                    "Upstream Gemini API unavailable during converse (%s). "
                    "Engaging intelligent local NLU engine.",
                    exc,
                )

        return self._offline_converse_parser(request, states)

    def _bind_verified_state(
        self,
        resp: PlannerAssistantResponse,
        states: list[dict[str, Any]],
    ) -> PlannerAssistantResponse:
        """Ensure state_id and state_name always match an exact database State record."""
        by_id = {int(s["id"]): s for s in states}
        by_name = {str(s["name"]).lower(): s for s in states}

        matched_state: dict[str, Any] | None = None
        if resp.state_id and resp.state_id in by_id:
            matched_state = by_id[resp.state_id]
        elif resp.state_name:
            lower_name = resp.state_name.lower().strip()
            if lower_name in by_name:
                matched_state = by_name[lower_name]
            else:
                close = difflib.get_close_matches(lower_name, list(by_name.keys()), n=1, cutoff=0.72)
                if close:
                    matched_state = by_name[close[0]]

        if matched_state is None:
            return resp

        budget = resp.total_budget
        if resp.is_ready_to_generate and resp.duration_days and not budget:
            budget = Decimal(str(resp.duration_days * 4500))

        return PlannerAssistantResponse(
            reply=resp.reply,
            state_id=int(matched_state["id"]),
            state_name=str(matched_state["name"]),
            duration_days=resp.duration_days,
            total_budget=budget,
            budget_tier=resp.budget_tier or BudgetLevel.MEDIUM,
            food_preference=resp.food_preference,
            travel_month=resp.travel_month,
            interests=resp.interests,
            is_ready_to_generate=bool(
                resp.is_ready_to_generate
                or (matched_state and resp.duration_days and budget and resp.interests)
            ),
            suggested_quick_replies=resp.suggested_quick_replies,
        )

    def _offline_converse_parser(
        self,
        request: PlannerAssistantRequest,
        states: list[dict[str, Any]],
    ) -> PlannerAssistantResponse:
        """High-accuracy NLU entity extractor for step-by-step and single-shot travel queries."""
        msg = request.message.lower()
        # Strip commas inside numbers like "₹12,000" -> "₹12000"
        normalized_msg = re.sub(r"(\d),(\d{3})", r"\1\2", msg)
        compact_msg = re.sub(r"[^a-z0-9\s]", " ", normalized_msg)

        detected_state_id = request.state_id
        detected_state_name = next((s["name"] for s in states if s["id"] == request.state_id), None)

        # 1. Exact or fuzzy state matching across all 36 States & UTs
        for s in states:
            s_lower = s["name"].lower()
            s_nospace = s_lower.replace(" ", "")
            if s_lower in compact_msg or s_nospace in compact_msg.replace(" ", ""):
                detected_state_id = s["id"]
                detected_state_name = s["name"]
                break
        if not detected_state_name:
            stop_words = {
                "plan", "days", "trip", "food", "with", "under", "budget", "make",
                "more", "from", "visit", "want", "travel", "show", "incl", "including",
            }
            words = [w for w in compact_msg.split() if len(w) >= 4 and w not in stop_words]
            state_map = {s["name"].lower().replace(" ", ""): s for s in states}
            for i in range(len(words)):
                for span in (2, 1):
                    cand = "".join(words[i : i + span])
                    close = difflib.get_close_matches(cand, list(state_map.keys()), n=1, cutoff=0.76)
                    if close:
                        st = state_map[close[0]]
                        detected_state_id = st["id"]
                        detected_state_name = st["name"]
                        break
                if detected_state_name:
                    break

        # 2. Duration extraction
        detected_days = request.duration_days
        days_match = re.search(r"\b(\d{1,2})\s*(?:days?|d\b|nights?)", normalized_msg)
        if days_match:
            detected_days = min(14, max(1, int(days_match.group(1))))
        elif "weekend" in normalized_msg:
            detected_days = 3
        elif "week" in normalized_msg:
            detected_days = 7

        # 3. Budget extraction (supports "₹12,000", "15k", "20000")
        detected_budget = request.total_budget
        detected_tier = request.budget_tier or BudgetLevel.MEDIUM
        k_match = re.search(r"\b(\d+(?:\.\d+)?)\s*k\b", normalized_msg)
        num_match = re.search(r"(?:rs\.?|inr|₹)?\s*\b(\d{4,6})\b", normalized_msg)
        if k_match:
            detected_budget = Decimal(str(int(float(k_match.group(1)) * 1000)))
        elif num_match:
            detected_budget = Decimal(num_match.group(1))

        if any(w in normalized_msg for w in ("low", "backpacker", "hostel", "budget")):
            detected_tier = BudgetLevel.LOW
        elif any(w in normalized_msg for w in ("luxury", "resort", "premium", "5 star")):
            detected_tier = BudgetLevel.HIGH

        # 4. Food preference extraction (distinguishes Mixed Veg+NonVeg from single diet)
        detected_food = request.food_preference
        has_food_mention = False
        is_mixed_food = (
            "mixed" in normalized_msg
            or "both" in normalized_msg
            or (
                bool(re.search(r"\bveg(?:etarian)?\b", re.sub(r"non[\s-]*veg(?:etarian)?", "", normalized_msg)))
                and bool(re.search(r"non[\s-]*veg", normalized_msg))
            )
        )
        if is_mixed_food:
            detected_food = None
            has_food_mention = True
        elif re.search(r"non[\s-]*veg|meat|chicken|seafood|fish|mutton", normalized_msg):
            detected_food = FoodType.NON_VEG
            has_food_mention = True
        elif "vegan" in normalized_msg:
            detected_food = FoodType.VEGAN
            has_food_mention = True
        elif re.search(r"\bveg(?:etarian)?\b", normalized_msg):
            detected_food = FoodType.VEG
            has_food_mention = True

        # 5. Travel month extraction
        detected_month = request.travel_month
        months_list = (
            "january", "february", "march", "april", "may", "june",
            "july", "august", "september", "october", "november", "december",
        )
        for m_name in months_list:
            if m_name in normalized_msg:
                detected_month = m_name.capitalize()
                break

        # 6. Interests / Trip Vibe extraction
        interests_set = set(request.interests)
        if any(
            phrase in normalized_msg
            for phrase in ("all round", "all-round", "best mix", "top highlights", "balanced", "everything")
        ):
            interests_set.update(
                (PlaceCategory.HERITAGE, PlaceCategory.NATURE, PlaceCategory.TEMPLE, PlaceCategory.BEACH)
            )
        else:
            category_kw_map = {
                PlaceCategory.BEACH: ("beach", "sea", "coast", "island", "vizag", "visakhapatnam"),
                PlaceCategory.HERITAGE: ("fort", "palace", "heritage", "history", "monument", "gandikota", "lepakshi"),
                PlaceCategory.TEMPLE: ("temple", "shrine", "spiritual", "sacred", "pilgrimage", "tirupati", "srikalahasti", "darshan"),
                PlaceCategory.NATURE: ("nature", "waterfall", "lake", "backwater", "falls"),
                PlaceCategory.HILL_STATION: ("hill", "mountain", "valley", "tea", "araku", "munnar"),
                PlaceCategory.WILDLIFE: ("safari", "wildlife", "tiger", "national park"),
                PlaceCategory.ADVENTURE: ("adventure", "trek", "rafting", "camping"),
                PlaceCategory.CITY: ("city", "market", "museum", "bazaar"),
            }
            for cat, kws in category_kw_map.items():
                if any(kw in normalized_msg for kw in kws):
                    interests_set.add(cat)

        # Smart budget default when user provides state + days + vibe + food in one go
        if (
            detected_state_name
            and detected_days
            and interests_set
            and not detected_budget
            and (has_food_mention or "generate" in normalized_msg)
        ):
            detected_budget = Decimal(str(detected_days * 4000))

        is_ready = False
        if not detected_state_name:
            reply = (
                "Namaste! I'd love to curate your India itinerary. "
                "Which **State or Union Territory** are you excited to explore?"
            )
            quick_replies = ["Kerala", "Rajasthan", "Goa", "Himachal Pradesh", "Andhra Pradesh"]
        elif not detected_days:
            reply = (
                f"**{detected_state_name}** is an incredible choice! "
                f"How many **days** would you like to spend exploring {detected_state_name}?"
            )
            quick_replies = ["3 Days", "4 Days", "5 Days", "7 Days"]
        elif not interests_set:
            reply = (
                f"A **{detected_days}-day trip to {detected_state_name}** sounds fantastic! "
                "What kind of **trip vibe or experience** are you looking for? "
                "(e.g., **Spiritual & Temples**, **Beaches & Coastal**, **Hills & Nature**, or **Heritage & History**)"
            )
            quick_replies = [
                "🛕 Spiritual & Temples",
                "🏖️ Beaches & Coastal",
                "⛰️ Hills & Nature",
                "🏛️ Heritage & History",
                "✨ All-Round Mix",
            ]
        elif not detected_budget:
            med = detected_days * 4500
            reply = (
                f"Got it! What is your approximate **total budget or comfort tier** for this "
                f"**{detected_days}-day {detected_state_name}** itinerary?"
            )
            quick_replies = [
                f"₹{int(med * 0.60):,} (Low Budget)",
                f"₹{med:,} (Standard)",
                f"₹{int(med * 1.75):,} (Luxury)",
            ]
        else:
            is_ready = True
            food_label = (
                "Mixed (Veg & Non-Veg)"
                if detected_food is None
                else detected_food.value.replace("_", " ").title()
            )
            vibe_label = (
                "All-Round Mix"
                if len(interests_set) >= 3
                else ", ".join(c.value.replace("_", " ").title() for c in sorted(interests_set, key=lambda x: x.value))
            )
            reply = (
                f"All preferences set! A **{detected_days}-day {detected_state_name}** circuit "
                f"focused on **{vibe_label}** around **₹{int(detected_budget):,}** ({detected_tier.value.title()} tier) "
                f"with **{food_label}** local specialties. Click below to generate your day-by-day plan!"
            )
            quick_replies = ["Pure Veg Food", "Mixed Veg & Non-Veg", "Low Budget Tier", "Luxury Tier"]

        return PlannerAssistantResponse(
            reply=reply,
            state_id=detected_state_id,
            state_name=detected_state_name,
            duration_days=detected_days,
            total_budget=detected_budget,
            budget_tier=detected_tier,
            food_preference=detected_food,
            travel_month=detected_month,
            interests=list(interests_set),
            is_ready_to_generate=is_ready,
            suggested_quick_replies=quick_replies,
        )
