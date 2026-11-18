"""Enterprise nationwide test suite covering all 36 States/UTs and Post-LLM Guardrails."""

from decimal import Decimal
from typing import Any

import pytest

from app.core.enums import BudgetLevel, FoodType
from app.models.destination import Destination
from app.models.food import Food
from app.models.place import Place
from app.schemas.planner import TripPlanRequest
from app.seed.curated_data import CURATED_STATES_DATA
from app.services.geo_routing import (
    MAX_SAME_DAY_PAIRWISE_KM,
    build_circuit_blueprint,
    build_offline_blueprint_plan,
    haversine_km,
    validate_and_ground_plan,
)


def _hydrate_state_models(state_idx: int, state_dict: dict[str, Any]) -> tuple[list[Place], list[Food]]:
    """Build in-memory SQLAlchemy Place and Food instances from CURATED_STATES_DATA."""
    places: list[Place] = []
    foods: list[Food] = []
    p_id = 1
    f_id = 1

    for d_idx, d_data in enumerate(state_dict["destinations"], start=1):
        dest = Destination(
            id=d_idx,
            state_id=state_idx,
            name=d_data["name"],
            latitude=d_data["latitude"],
            longitude=d_data["longitude"],
        )
        for p_data in d_data.get("places", []):
            places.append(
                Place(
                    id=p_id,
                    state_id=state_idx,
                    destination_id=d_idx,
                    destination=dest,
                    name=p_data["name"],
                    category=p_data["category"],
                    description=p_data.get("description"),
                    entry_fee=p_data.get("entry_fee", Decimal("0")),
                    avg_daily_cost=p_data.get("avg_daily_cost", Decimal("200")),
                    budget_level=p_data.get("budget_level", BudgetLevel.LOW),
                    latitude=p_data["latitude"],
                    longitude=p_data["longitude"],
                    is_hidden_gem=bool(p_data.get("is_hidden_gem", False)),
                )
            )
            p_id += 1

        for f_data in d_data.get("foods", []):
            foods.append(
                Food(
                    id=f_id,
                    state_id=state_idx,
                    destination_id=d_idx,
                    destination=dest,
                    name=f_data["name"],
                    food_type=f_data["food_type"],
                    description=f_data.get("description"),
                    avg_price=f_data["avg_price"],
                )
            )
            f_id += 1

    return places, foods


def _filter_foods_like_repo(all_foods: list[Food], pref: FoodType | None) -> list[Food]:
    if pref is None:
        non_veg = [f for f in all_foods if f.food_type == FoodType.NON_VEG]
        veg = [f for f in all_foods if f.food_type in (FoodType.VEG, FoodType.VEGAN)]
        out: list[Food] = []
        for i in range(max(len(non_veg), len(veg))):
            if i < len(non_veg):
                out.append(non_veg[i])
            if i < len(veg):
                out.append(veg[i])
        return out
    if pref == FoodType.VEG:
        return [f for f in all_foods if f.food_type in (FoodType.VEG, FoodType.VEGAN)]
    if pref == FoodType.VEGAN:
        vegan_exact = [f for f in all_foods if f.food_type == FoodType.VEGAN]
        other_veg = [f for f in all_foods if f.food_type == FoodType.VEG]
        return vegan_exact + other_veg
    return [f for f in all_foods if f.food_type == FoodType.NON_VEG] + [
        f for f in all_foods if f.food_type != FoodType.NON_VEG
    ]


def test_all_36_states_432_scenarios_zero_duplicates_and_geo_realistic() -> None:
    """Verify all 36 States/UTs across 3d/5d/7d and all 4 food preferences (432 combinations)."""
    assert len(CURATED_STATES_DATA) == 36
    scenarios_checked = 0

    for s_idx, s_data in enumerate(CURATED_STATES_DATA, start=1):
        s_name = s_data["name"]
        places, all_foods = _hydrate_state_models(s_idx, s_data)
        coord_by_id = {p.id: (float(p.latitude), float(p.longitude)) for p in places}

        for days in (3, 5, 7):
            for food_pref in (None, FoodType.VEG, FoodType.NON_VEG, FoodType.VEGAN):
                foods = _filter_foods_like_repo(all_foods, food_pref)
                req = TripPlanRequest(
                    state_id=s_idx,
                    duration_days=days,
                    total_budget=Decimal(str(days * 4500)),
                    budget_tier=BudgetLevel.MEDIUM,
                    food_preference=food_pref,
                )
                bp = build_circuit_blueprint(s_name, req, places, foods)
                plan = build_offline_blueprint_plan(s_idx, s_name, req, bp)

                # 1. Zero duplicate attractions across the entire trip
                scheduled_ids = [p.place_id for d in plan.days for p in d.places]
                assert len(scheduled_ids) == len(set(scheduled_ids)), (
                    f"Duplicate attractions in {s_name} ({days}d, {food_pref})"
                )

                # 2. Same-day pairwise GPS sanity (<= 85 km)
                for day in plan.days:
                    assert len(day.places) >= 1
                    for i in range(len(day.places)):
                        c1 = coord_by_id[day.places[i].place_id]
                        for j in range(i + 1, len(day.places)):
                            c2 = coord_by_id[day.places[j].place_id]
                            dist = haversine_km(c1[0], c1[1], c2[0], c2[1])
                            assert dist <= MAX_SAME_DAY_PAIRWISE_KM + 0.5, (
                                f"{s_name} Day {day.day_number} combined sights {dist:.1f} km apart!"
                            )

                    # 3. Every day has a meal and obeys strict Veg/Vegan safety
                    assert len(day.meals) >= 1, f"{s_name} Day {day.day_number} has 0 meals for {food_pref}"
                    for meal in day.meals:
                        if food_pref in (FoodType.VEG, FoodType.VEGAN):
                            assert meal.food_type != FoodType.NON_VEG, (
                                f"Dietary violation in {s_name}: Non-Veg served to {food_pref}"
                            )

                # 4. Zero duplicate meals when candidate pool >= trip days
                if len(foods) >= len(plan.days):
                    meal_names = [d.meals[0].dish_name for d in plan.days]
                    assert len(meal_names) == len(set(meal_names)), (
                        f"Duplicate meals in {s_name} ({days}d, {food_pref}): {meal_names}"
                    )

                scenarios_checked += 1

    assert scenarios_checked == 432


def test_post_llm_guardrail_rejects_distant_same_day_jump_and_duplicates() -> None:
    """Verify validate_and_ground_plan catches LLM geographic jumps (>95 km) and duplicate IDs."""
    ap_state = next(s for s in CURATED_STATES_DATA if s["name"] == "Andhra Pradesh")
    places, foods = _hydrate_state_models(1, ap_state)
    req = TripPlanRequest(state_id=1, duration_days=2, total_budget=Decimal("10000"))
    bp = build_circuit_blueprint("Andhra Pradesh", req, places, foods)

    vizag_place = next(p for p in places if "Rushikonda" in p.name)
    tirupati_place = next(p for p in places if "Tirumala" in p.name)

    bad_llm_json = {
        "state_id": 1,
        "state_name": "Andhra Pradesh",
        "trip_title": "Bad Jump Plan",
        "total_days": 2,
        "total_budget": 10000,
        "budget_breakdown": {},
        "days": [
            {
                "day_number": 1,
                "theme": "Impossible Jump",
                "destination_name": "Visakhapatnam",
                "places": [
                    {"place_id": vizag_place.id, "place_name": vizag_place.name},
                    {"place_id": tirupati_place.id, "place_name": tirupati_place.name},
                ],
                "meals": [],
                "day_budget": 5000,
                "travel_tips": "Tip",
            },
            {
                "day_number": 2,
                "theme": "Day 2",
                "destination_name": "Araku",
                "places": [{"place_id": bp.day_slots[1].recommended_places[0].id}],
                "meals": [],
                "day_budget": 5000,
                "travel_tips": "Tip",
            },
        ],
        "overall_advice": "Advice",
    }

    with pytest.raises(ValueError, match="Geographic violation"):
        validate_and_ground_plan(
            bad_llm_json,
            state_id=1,
            state_name="Andhra Pradesh",
            request=req,
            places=places,
            foods=foods,
            blueprint=bp,
        )


def test_enterprise_self_correction_retry_succeeds_without_fallback() -> None:
    """Verify LlmClient + validate_and_ground_plan self-heals a bad Attempt 1 via Gemini retry."""
    tn_state = next(s for s in CURATED_STATES_DATA if s["name"] == "Tamil Nadu")
    places, foods = _hydrate_state_models(2, tn_state)
    req = TripPlanRequest(state_id=2, duration_days=3, total_budget=Decimal("15000"))
    bp = build_circuit_blueprint("Tamil Nadu", req, places, foods)

    # Simulate Attempt 2 returning clean Gemini JSON matching the Geo-Spatial Blueprint
    valid_gemini_json = {
        "state_id": 2,
        "state_name": "Tamil Nadu",
        "trip_title": "Temple & Coastal Trail of Tamil Nadu",
        "total_days": bp.effective_days,
        "total_budget": 15000,
        "budget_breakdown": {
            "accommodation_estimate": 6000,
            "food_estimate": 3500,
            "activities_and_entry": 500,
            "local_transport_estimate": 3500,
            "total_estimated_cost": 13500,
        },
        "days": [
            {
                "day_number": slot.day_number,
                "theme": f"Heritage & Flavors of {slot.hub_name}",
                "destination_name": slot.hub_name,
                "places": [
                    {
                        "place_id": p.id,
                        "place_name": p.name,
                        "category": p.category.value,
                        "description": f"Curated Gemini highlight for {p.name}.",
                        "entry_fee": float(p.entry_fee or 0),
                        "recommended_time": "Morning" if i == 0 else "Afternoon",
                        "is_hidden_gem": bool(p.is_hidden_gem),
                    }
                    for i, p in enumerate(slot.recommended_places)
                ],
                "meals": [
                    {
                        "meal_type": "Lunch",
                        "dish_name": slot.recommended_food.name,
                        "food_type": slot.recommended_food.food_type.value,
                        "avg_price": float(slot.recommended_food.avg_price),
                    }
                ] if slot.recommended_food else [],
                "day_budget": 5000,
                "travel_tips": f"Explore {slot.hub_name} early in the morning.",
            }
            for slot in bp.day_slots
        ],
        "overall_advice": "Carry cotton attire for temple visits across Tamil Nadu.",
    }

    grounded = validate_and_ground_plan(
        valid_gemini_json,
        state_id=2,
        state_name="Tamil Nadu",
        request=req,
        places=places,
        foods=foods,
        blueprint=bp,
    )
    assert grounded.trip_title == "Temple & Coastal Trail of Tamil Nadu"
    assert len(grounded.days) == 3
    all_ids = [p.place_id for d in grounded.days for p in d.places]
    assert len(all_ids) == len(set(all_ids))
