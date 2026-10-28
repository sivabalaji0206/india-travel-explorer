"""System and user prompt templates for the RAG-grounded AI Trip Planner."""

from app.models.food import Food
from app.models.place import Place
from app.schemas.planner import TripPlanRequest, TripPlanResponse

SYSTEM_PROMPT = """You are an expert Indian Travel Planner AI for the "India Travel Explorer" application.
Your mission is to construct realistic, culturally enriching, day-by-day travel itineraries across India.

### CRITICAL GROUNDING RULES (RAG - RETRIEVAL AUGMENTED GENERATION):
1. ZERO HALLUCINATION POLICY: You MUST ONLY select attractions and tourist spots from the provided "VERIFIED ATTRACTIONS" list below. You must NEVER invent, hallucinate, or suggest any attraction that is not explicitly in that list.
2. DISH GROUNDING: You MUST ONLY suggest dishes from the provided "REGIONAL DISHES" list below.
3. DATA INTEGRITY: Every place in your itinerary MUST include its exact `place_id`, exact `place_name`, and exact `category` as listed in the verified database.
4. BUDGET DISCIPLINE: Adhere to the user's budget and comfort tier. Provide realistic itemized estimates for accommodation, food, entry fees, and local transport.
5. GEOGRAPHIC LOGIC: Group attractions logically by destination / town per day to minimize travel fatigue.
6. OFF-TOPIC REFUSAL: Politely decline any non-travel or off-topic requests.

### OUTPUT FORMAT:
You MUST respond with valid JSON only. Do not include markdown formatting or backticks around the JSON.
Follow the exact JSON structure specified in the user prompt.
"""


def format_places_context(places: list[Place]) -> str:
    """Format candidate database places as clear text items for LLM injection."""
    lines: list[str] = []
    for p in places:
        fee_str = f"Rs. {p.entry_fee}" if p.entry_fee is not None else "Free / Unknown"
        dest_name = p.destination.name if p.destination else "Unknown"
        lines.append(
            f"- [ID: {p.id}] {p.name} ({p.category.value}) in {dest_name} | "
            f"Entry: {fee_str} | Daily Cost: Rs. {p.avg_daily_cost} | "
            f"Hidden Gem: {p.is_hidden_gem} | Info: {p.description or 'Authentic attraction'}"
        )
    return "\n".join(lines)


def format_foods_context(foods: list[Food]) -> str:
    """Format candidate dishes as text items."""
    lines: list[str] = []
    for f in foods:
        dest_name = f.destination.name if f.destination else "Regional"
        lines.append(
            f"- {f.name} ({f.food_type.value}) from {dest_name} | "
            f"Avg Price: Rs. {f.avg_price} | {f.description or 'Local specialty'}"
        )
    return "\n".join(lines)


def build_plan_prompt(
    state_name: str,
    request: TripPlanRequest,
    places: list[Place],
    foods: list[Food],
) -> str:
    """Build the comprehensive prompt containing user constraints and retrieved RAG data."""
    places_text = format_places_context(places)
    foods_text = format_foods_context(foods)
    interests_str = (
        ", ".join(i.value for i in request.interests)
        if request.interests
        else "General sightseeing"
    )
    food_pref_str = (
        request.food_preference.value
        if request.food_preference
        else "No preference (all local dishes)"
    )

    return f"""### TRIP REQUIREMENTS:
- Destination State: {state_name}
- Duration: {request.duration_days} days
- Total Budget: Rs. {request.total_budget}
- Comfort Tier: {request.budget_tier.value}
- Food Preference: {food_pref_str}
- Month of Travel: {request.travel_month or "Any season"}
- Traveler Interests: {interests_str}

### VERIFIED ATTRACTIONS (ONLY USE PLACES FROM THIS LIST):
{places_text}

### REGIONAL DISHES (ONLY USE DISHES FROM THIS LIST):
{foods_text}

### REQUIRED JSON OUTPUT SCHEMA:
{{
  "state_id": {request.state_id},
  "state_name": "{state_name}",
  "trip_title": "Descriptive, exciting title for the trip",
  "total_days": {request.duration_days},
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
      "theme": "Theme of the day",
      "destination_name": "Town or Destination visited",
      "places": [
        {{
          "place_id": 123,
          "place_name": "Exact name from verified list",
          "category": "temple/beach/heritage/nature/etc",
          "description": "Engaging description of the visit",
          "entry_fee": 50.0,
          "recommended_time": "Morning/Afternoon/Sunset",
          "is_hidden_gem": false
        }}
      ],
      "meals": [
        {{
          "meal_type": "Breakfast/Lunch/Dinner",
          "dish_name": "Exact dish name from verified list",
          "food_type": "veg/non_veg/vegan",
          "avg_price": 120.0
        }}
      ],
      "day_budget": 3500.0,
      "travel_tips": "Local advice, commute notes or dress code"
    }}
  ],
  "overall_advice": "Practical packing, season and travel advice"
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
    """Build follow-up conversation prompt."""
    places_text = format_places_context(places)
    foods_text = format_foods_context(foods)

    return f"""### CONVERSATION CONTEXT:
State: {state_name}
Current Plan Title: {current_plan.trip_title} ({current_plan.total_days} days)

### CURRENT PLAN SUMMARY:
{current_plan.model_dump_json()}

### RECENT CHAT HISTORY:
{chat_history_str}

### USER'S NEW MESSAGE:
"{new_message}"

### VERIFIED ATTRACTIONS FOR ANY MODIFICATIONS:
{places_text}

### REGIONAL DISHES:
{foods_text}

### INSTRUCTIONS:
1. If the user asks a question about the plan or destination, answer helpfully in "reply" and set "updated_plan" to null.
2. If the user requests modifications (e.g. "make day 2 cheaper", "add beaches", "swap day 1 morning spot"), update the itinerary JSON adhering strictly to the verified places and return both "reply" explaining the changes AND the complete updated plan object in "updated_plan".
3. If off-topic, politely decline and set "updated_plan" to null.

### OUTPUT JSON SCHEMA:
{{
  "reply": "Your conversational answer to the traveler",
  "updated_plan": null or complete updated TripPlanResponse object
}}
"""
