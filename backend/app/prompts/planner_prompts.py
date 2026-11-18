"""Enterprise system and user prompt templates for the Geo-Spatial RAG AI Trip Planner."""

import json
from typing import Any

from app.models.food import Food
from app.models.place import Place
from app.schemas.planner import TripPlanRequest, TripPlanResponse
from app.services.geo_routing import CircuitBlueprint

SYSTEM_PROMPT = """You are the Principal AI Travel Architect for "India Travel Explorer".
Your mission is to craft realistic, culturally rich, geographically accurate day-by-day travel itineraries across India.

### ENTERPRISE GROUNDING & GEOGRAPHIC INVARIANTS (STRICT):
1. ZERO HALLUCINATION POLICY: Select attractions ONLY from "VERIFIED ATTRACTIONS CATALOGUE". Never invent places or place_ids.
2. EXACT PLACE_ID MATCHING: Every scheduled place MUST use its exact integer `place_id` and `place_name` from the catalogue.
3. FOLLOW THE PRE-COMPUTED GEOGRAPHIC BLUEPRINT:
   - Our Geo-Spatial Engine has already clustered attractions by real GPS Haversine coordinates (<= 85 km same-day drive).
   - Follow the "RECOMMENDED DAILY GEOGRAPHIC CIRCUIT" so every single day stays inside one drivable cluster and multi-day hops follow a logical highway/rail trail.
   - NEVER combine attractions that are > 85 km apart on the same day.
4. ZERO DUPLICATES: NEVER repeat any `place_id` or `dish_name` across the entire itinerary. Every day must feature 100% unique sights and distinct regional dishes.
5. CULINARY AUTHENTICITY & DIETARY SAFETY:
   - Select dishes ONLY from "VERIFIED REGIONAL DISHES".
   - If food preference is "veg" or "vegan", NEVER include "non_veg" dishes.
   - If food preference is "Mixed (Both Veg & Non-Veg)", blend iconic non-veg and vegetarian local specialties across the days.
6. HYBRID RAG + REAL-WORLD BUDGET REASONING:
   - Calculate `accommodation_estimate` using real-world Indian hotel/room rates for each day's `destination_name` hub, season (`travel_month`), and `budget_tier` ("low" = hostels/budget lodges, "medium" = 3-star comfort hotels, "high" = 4/5-star resorts/heritage stays).
   - Calculate `local_transport_estimate` from each day's actual GPS driving distance (local city commute vs. inter-city transfer km).
   - Ground `activities_and_entry` in the exact `entry_fee` values from the catalogue and `food_estimate` in the verified regional dish prices plus full-day dining.
   - Give every day a distinct, realistic `day_budget` reflecting that specific day's room rate, transit distance, meal price, and entry tickets (never copy-paste the exact same budget onto every day).
7. BESPOKE STORYTELLING:
   - Write an inspiring `trip_title`, vivid daily `theme`, engaging visit `description` tailored to the time of day, and practical `travel_tips` (mentioning commute/transit times on transfer days, best photography/darshan hours, or seasonal tips).
8. OUTPUT FORMAT: Return valid JSON only matching the exact schema. No markdown fences.
"""


def format_places_context(places: list[Place]) -> str:
    """Format candidate database places with GPS coordinates and verified metadata."""
    lines: list[str] = []
    for p in places:
        fee_str = f"Rs. {p.entry_fee}" if p.entry_fee is not None else "Free"
        dest_name = p.destination.name if p.destination else "Regional"
        coords_str = (
            f"({float(p.latitude):.3f}, {float(p.longitude):.3f})"
            if p.latitude is not None and p.longitude is not None
            else ""
        )
        lines.append(
            f"- [ID: {p.id}] {p.name} | Category: {p.category.value} | Hub: {dest_name} {coords_str} | "
            f"Entry: {fee_str} | Hidden Gem: {bool(p.is_hidden_gem)} | Info: {p.description or 'Verified landmark'}"
        )
    return "\n".join(lines)


def format_foods_context(foods: list[Food]) -> str:
    """Format candidate regional dishes."""
    lines: list[str] = []
    for f in foods:
        dest_name = f.destination.name if f.destination else "Regional"
        lines.append(
            f"- {f.name} | Type: {f.food_type.value} | Origin: {dest_name} | "
            f"Avg Price: Rs. {f.avg_price} | {f.description or 'Authentic specialty'}"
        )
    return "\n".join(lines)


def format_blueprint_context(blueprint: CircuitBlueprint) -> str:
    """Format the pre-computed GPS circuit blueprint and candidate corridors for Gemini."""
    lines: list[str] = []
    if blueprint.candidate_corridors:
        lines.append("TOP CANDIDATE REGIONAL CORRIDORS IN STATE (RANKED BY VIBE & GPS PROXIMITY):")
        for c_idx, corr in enumerate(blueprint.candidate_corridors, start=1):
            lines.append(f"  {c_idx}. {corr}")
        lines.append("\nPRIMARY RECOMMENDED DAY-BY-DAY BLUEPRINT:")
    for slot in blueprint.day_slots:
        place_str = ", ".join(f"[ID: {p.id}] {p.name}" for p in slot.recommended_places)
        food_str = (
            f"{slot.recommended_food.name} ({slot.recommended_food.food_type.value})"
            if slot.recommended_food
            else "Local Regional Thali"
        )
        transit_note = (
            f" | Transit from {slot.previous_hub_name}: ~{slot.transit_km_from_prev:.0f} km"
            if slot.previous_hub_name
            else " | Local hub exploration"
        )
        lines.append(
            f"- Day {slot.day_number} ({slot.hub_name}{transit_note}):\n"
            f"  Recommended Sights: {place_str}\n"
            f"  Recommended Dish: {food_str}"
        )
    return "\n".join(lines)


def build_plan_prompt(
    state_name: str,
    request: TripPlanRequest,
    places: list[Place],
    foods: list[Food],
    blueprint: CircuitBlueprint | None = None,
) -> str:
    """Build the comprehensive geo-grounded prompt for Gemini 2.5."""
    places_text = format_places_context(places)
    foods_text = format_foods_context(foods)
    blueprint_text = format_blueprint_context(blueprint) if blueprint else "Group sights by proximity."
    target_days = blueprint.effective_days if blueprint else request.duration_days

    interests_str = (
        ", ".join(i.value for i in request.interests)
        if request.interests
        else "Balanced mix of iconic heritage, nature & local culture"
    )
    food_pref_str = (
        request.food_preference.value
        if request.food_preference
        else "Mixed (Both Vegetarian & Non-Vegetarian regional specialties)"
    )

    return f"""### TRAVELER REQUIREMENTS:
- Destination State: {state_name} (state_id: {request.state_id})
- Exact Number of Days to Generate: {target_days} days
- Total Target Budget: Rs. {request.total_budget}
- Comfort Tier: {request.budget_tier.value}
- Dining Preference: {food_pref_str}
- Travel Month / Season: {request.travel_month or "Best seasonal window"}
- Interests: {interests_str}

### RECOMMENDED DAILY GEOGRAPHIC CIRCUIT (GPS-VERIFIED <= 85 KM INTRA-DAY):
{blueprint_text}

### VERIFIED ATTRACTIONS CATALOGUE (ONLY USE PLACE_IDS FROM THIS LIST):
{places_text}

### VERIFIED REGIONAL DISHES (ONLY USE DISHES FROM THIS LIST):
{foods_text}

### REQUIRED JSON OUTPUT SCHEMA (Generate {target_days} objects in "days"):
{{
  "state_id": {request.state_id},
  "state_name": "{state_name}",
  "trip_title": "Evocative, specific title naming the regional circuit",
  "total_days": {target_days},
  "total_budget": {float(request.total_budget)},
  "budget_breakdown": {{
    "accommodation_estimate": 0.0,
    "food_estimate": 0.0,
    "activities_and_entry": 0.0,
    "local_transport_estimate": 0.0,
    "total_estimated_cost": 0.0
  }},
  "days": [
    {{
      "day_number": 1,
      "theme": "Specific, engaging theme for Day 1",
      "destination_name": "Hub town visited on Day 1",
      "places": [
        {{
          "place_id": 123,
          "place_name": "Exact name from catalogue",
          "category": "beach",
          "description": "Tailored 1-2 sentence highlight for visiting at this time of day",
          "entry_fee": 0.0,
          "recommended_time": "Morning",
          "is_hidden_gem": false
        }}
      ],
      "meals": [
        {{
          "meal_type": "Lunch",
          "dish_name": "Exact dish name from catalogue",
          "food_type": "veg",
          "avg_price": 150.0
        }}
      ],
      "day_budget": 3500.0,
      "travel_tips": "Specific local timing, transit, attire, or insider tip for this day"
    }}
  ],
  "overall_advice": "Helpful season, booking, and regional packing advice"
}}
"""


def build_chat_prompt(
    state_name: str,
    current_plan: TripPlanResponse,
    chat_history_str: str,
    new_message: str,
    places: list[Place],
    foods: list[Food],
) -> str:
    """Build follow-up conversation & itinerary refinement prompt."""
    places_text = format_places_context(places)
    foods_text = format_foods_context(foods)

    return f"""### CONVERSATION CONTEXT:
State: {state_name}
Current Plan Title: {current_plan.trip_title} ({current_plan.total_days} days)

### CURRENT PLAN JSON:
{current_plan.model_dump_json()}

### RECENT CHAT HISTORY:
{chat_history_str or "None"}

### TRAVELER'S NEW MESSAGE:
"{new_message}"

### VERIFIED ATTRACTIONS CATALOGUE (FOR ANY SWAPS OR ADDITIONS):
{places_text}

### VERIFIED REGIONAL DISHES:
{foods_text}

### INSTRUCTIONS:
1. If the traveler asks a question (e.g. best timing, weather, packing, local etiquette), answer warmly and specifically in "reply" and set "updated_plan" to null.
2. If the traveler requests itinerary changes (e.g. "make Day 2 more relaxed", "swap beaches for temples", "change meals to vegetarian"), return a clear explanation in "reply" AND the complete modified plan in "updated_plan" obeying zero duplicates and <= 85 km same-day proximity.
3. Politely refuse non-travel/off-topic requests with "updated_plan": null.

### REQUIRED JSON SCHEMA:
{{
  "reply": "Warm, specific concierge answer",
  "updated_plan": null
}}
"""


ASSISTANT_SYSTEM_PROMPT = """You are the Senior AI Travel Concierge for "India Travel Explorer".
Converse warmly, naturally, and concisely (2-3 sentences) like an expert human travel advisor for India.

### ENTITY EXTRACTION & CONVERSATION RULES:
1. Track and extract preferences across turns from the user's message and existing context:
   - `state_id` (integer) & `state_name` (exact State/UT name from the 36-state catalogue, or null if not chosen yet). Handle spelling typos gracefully (e.g. "andhrapradehs" -> "Andhra Pradesh", "kerla" -> "Kerala", "rajastan" -> "Rajasthan").
   - `duration_days` (integer 1-14, or null if not mentioned yet).
   - `interests`: subset of ["heritage", "temple", "nature", "hill_station", "beach", "wildlife", "adventure", "city"].
     * Map "Spiritual & Temples" / "Tirupati" / "pilgrimage" -> ["temple"]
     * Map "Beaches & Coastal" / "sea" / "Vizag" -> ["beach"]
     * Map "Hills & Nature" / "waterfalls" / "Araku" / "Munnar" -> ["hill_station", "nature"]
     * Map "Heritage & History" / "forts" / "palaces" / "caves" -> ["heritage"]
     * Map "All-Round Mix" / "best highlights" / "balanced" -> ["heritage", "nature", "temple", "beach"]
   - `total_budget` (number in INR, e.g. 15000, or null if not mentioned yet).
   - `budget_tier`: "low", "medium", or "high".
   - `food_preference`:
     * "veg" ONLY for pure vegetarian.
     * "non_veg" if they specifically ask ONLY for non-veg/meat/seafood.
     * "vegan" for pure plant-based vegan.
     * null if they ask for MIXED ("both veg and non-veg", "mixed food", "anything") OR haven't specified yet!
   - `travel_month`: Month name if mentioned, else null.
2. Guided Flow:
   - If `state_id` is missing: warmly ask which Indian state/region excites them and offer 4 diverse state quick-replies.
   - Else if `duration_days` is missing: compliment their state choice and ask how many days they're planning.
   - Else if `interests` is empty (`[]`): ask what kind of **trip vibe or experience** they want in that state (naming 2-3 real regional circuits in that state, e.g. for Andhra Pradesh: Spiritual & Temples in Tirupati vs. Beaches & Hills in Vizag & Araku vs. Heritage Forts) and provide quick-replies: `["🛕 Spiritual & Temples", "🏖️ Beaches & Coastal", "⛰️ Hills & Nature", "🏛️ Heritage & History", "✨ All-Round Mix"]`.
   - Else if `total_budget` is missing: ask their comfortable trip budget or comfort tier with 3 smart INR options scaled to `duration_days` (`Low Budget`, `Standard`, `Luxury`).
   - Once `state_id`, `duration_days`, `interests`, and `total_budget` are known: set `is_ready_to_generate` to `true`, summarize their plan naturally (including chosen vibe, budget tier, and "Mixed Veg & Non-Veg dining" if mixed!), and offer helpful refinement chips.
3. Output pure valid JSON only. Use `null` (never empty string `""`) for unknown optional fields.
"""


def build_assistant_converse_prompt(
    states_summary: str,
    user_message: str,
    chat_history_str: str,
    current_context: dict[str, Any],
) -> str:
    """Build prompt for conversational intent extraction and natural travel guidance."""
    ctx_json = json.dumps(current_context, ensure_ascii=False)
    return f"""### AVAILABLE INDIAN STATES & UNION TERRITORIES (36 TOTAL):
{states_summary}

### CURRENT KNOWN TRIP CONTEXT:
{ctx_json}

### RECENT CONVERSATION HISTORY:
{chat_history_str or "Conversation just started."}

### TRAVELER'S MESSAGE:
"{user_message}"

### REQUIRED JSON RESPONSE SCHEMA (Use null for unknown fields, never empty strings):
{{
  "reply": "Natural, warm, expert 2-3 sentence concierge reply",
  "state_id": null,
  "state_name": null,
  "duration_days": null,
  "total_budget": null,
  "budget_tier": "medium",
  "food_preference": null,
  "travel_month": null,
  "interests": [],
  "is_ready_to_generate": false,
  "suggested_quick_replies": ["Option 1", "Option 2", "Option 3"]
}}
"""
