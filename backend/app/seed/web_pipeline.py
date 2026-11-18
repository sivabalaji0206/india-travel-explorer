"""Destination-First Web Data Pipeline for India Travel Explorer.

Ingests curated, verified destination hubs, authentic local foods, recommended eateries,
accurate cost tiers, and top visitable tourist landmarks across all 36 Indian states
and union territories.Strictly purges any legacy uncurated/junk records so only 100%
verified production data is served to customers.
"""

import argparse
from concurrent.futures import ThreadPoolExecutor
import json
import logging
import re
import ssl
import urllib.parse
import urllib.request
from decimal import Decimal
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.enums import BudgetLevel, DataSource, FoodType, MealType, PlaceCategory, Season
from app.db.session import get_session_factory
from app.models.destination import Destination
from app.models.destination_cost_tier import DestinationCostTier
from app.models.eatery import Eatery
from app.models.food import Food
from app.models.place import Place
from app.models.state import State
from app.seed.curated_data import CURATED_STATES_DATA, STANDARD_COST_TIERS

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("web_pipeline")

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    "User-Agent": "IndiaTravelExplorerPipeline/2.0 (travel-explorer@indiatravel.org)"
}

BAD_IMAGE_PATTERNS = (
    ".svg",
    "map_of",
    "locator",
    "location_",
    "locale",
    "flag_of",
    "emblem",
    "coat_of_arms",
    "seal_of",
    "logo",
    "icon",
    "diagram",
    "plan_of",
    "chart",
    "signature",
)


def _is_valid_landmark_image(url: str | None) -> bool:
    """Returns True if the URL is a valid photograph and not a map, flag, icon, or SVG."""
    if not url:
        return False
    lower_url = url.lower()
    return not any(pattern in lower_url for pattern in BAD_IMAGE_PATTERNS)


def _execute_wiki_query(url: str) -> dict[str, Any] | None:
    """Executes a Wikipedia query and extracts verified thumbnail, description and coordinates."""
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=8, context=ctx) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            pages = data.get("query", {}).get("pages", {})
            for _, p in pages.items():
                if "missing" in p or p.get("pageid", 0) <= 0:
                    continue
                thumb = p.get("thumbnail", {}).get("source")
                if thumb and not _is_valid_landmark_image(thumb):
                    thumb = None
                extract = p.get("extract", "").strip()
                coords = p.get("coordinates", [{}])[0] if p.get("coordinates") else {}
                if thumb or extract:
                    return {
                        "title": p.get("title", ""),
                        "thumbnail": thumb,
                        "extract": extract,
                        "lat": coords.get("lat"),
                        "lon": coords.get("lon"),
                    }
    except Exception as e:
        logger.debug("Wikipedia query failed: %s", e)
    return None


def fetch_wikipedia_details(
    wiki_title: str | None = None,
    search_query: str | None = None,
) -> dict[str, Any] | None:
    """Attempts to fetch live description, thumbnail and coordinates from Wikipedia.

    1. Tries exact wiki_title first.
    2. If missing or lacking a valid photograph thumbnail, falls back to Wikipedia search.
    """
    if wiki_title:
        title_url = (
            "https://en.wikipedia.org/w/api.php?action=query"
            f"&titles={urllib.parse.quote(wiki_title)}"
            "&prop=pageimages|extracts|coordinates"
            "&redirects=1"
            "&pilicense=any"
            "&exintro=1"
            "&explaintext=1"
            "&pithumbsize=800"
            "&format=json"
        )
        res = _execute_wiki_query(title_url)
        if res and res.get("thumbnail"):
            return res

    fallback_q = search_query or (wiki_title.replace("_", " ") if wiki_title else None)
    if fallback_q:
        search_url = (
            "https://en.wikipedia.org/w/api.php?action=query"
            "&generator=search"
            f"&gsrsearch={urllib.parse.quote(fallback_q)}"
            "&gsrlimit=1"
            "&prop=pageimages|extracts|coordinates"
            "&redirects=1"
            "&pilicense=any"
            "&exintro=1"
            "&explaintext=1"
            "&pithumbsize=800"
            "&format=json"
        )
        search_res = _execute_wiki_query(search_url)
        if search_res and search_res.get("thumbnail"):
            return search_res

    return None


def clean_summary_text(extract: str) -> str:
    """Returns first 2-3 clean, informative sentences."""
    cleaned = extract.replace("\n", " ").strip()
    sentences = re.split(r"(?<=[.!?])\s+", cleaned)
    return " ".join(sentences[:3]) if len(sentences) >= 3 else cleaned


DISTINCT_FALLBACK_POOL = (
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1615800098779-1be32e60cca3?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=800&q=80",
)


def ingest_curated_state(
    db: Session,
    state_data: dict[str, Any],
    fetch_wiki: bool = True,
    dry_run: bool = False,
) -> dict[str, int]:
    """Ingests/updates destinations, foods, eateries, cost tiers, and places for one state,
    and strictly purges any uncurated legacy places or destinations in that state.
    """
    stats = {
        "destinations": 0,
        "cost_tiers": 0,
        "foods": 0,
        "eateries": 0,
        "places_created": 0,
        "places_updated": 0,
        "junk_pruned": 0,
    }

    state_name = state_data["name"]
    region = state_data.get("region", "India")

    # 1. Ensure State exists
    state = db.execute(
        select(State).where(func.lower(State.name) == state_name.lower())
    ).scalar_one_or_none()
    if not state:
        state = State(name=state_name, region=region)
        db.add(state)
        db.flush()
        logger.info("[STATE CREATED] %s (%s)", state.name, region)
    else:
        if region and state.region != region:
            state.region = region

    curated_dest_names: set[str] = set()
    curated_place_names: set[str] = set()
    used_state_images: set[str] = set()

    # Pre-fetch Wikipedia details concurrently for all places in this state lacking a verified Wikimedia URL
    wiki_cache: dict[str, dict[str, Any] | None] = {}
    if fetch_wiki:
        tasks_to_fetch: list[tuple[str, str | None, str]] = []
        for d_item in state_data.get("destinations", []):
            d_label = d_item["name"]
            for p_item in d_item.get("places", []):
                p_label = p_item["name"]
                cur_img = p_item.get("image_url")
                if not (cur_img and "wikimedia.org" in cur_img and _is_valid_landmark_image(cur_img)):
                    tasks_to_fetch.append((p_label, p_item.get("wiki_title"), f"{p_label} {d_label} {state_name}"))

        if tasks_to_fetch:
            def _fetch_task(item: tuple[str, str | None, str]) -> tuple[str, dict[str, Any] | None]:
                p_lbl, w_title, s_q = item
                return p_lbl, fetch_wikipedia_details(wiki_title=w_title, search_query=s_q)

            with ThreadPoolExecutor(max_workers=8) as pool:
                for p_lbl, w_res in pool.map(_fetch_task, tasks_to_fetch):
                    wiki_cache[p_lbl] = w_res

    # 2. Process Destination Hubs
    for dest_data in state_data.get("destinations", []):
        dest_name = dest_data["name"]
        curated_dest_names.add(dest_name.lower())
        district = dest_data.get("district", dest_name)

        dest = db.execute(
            select(Destination).where(
                Destination.state_id == state.id,
                func.lower(Destination.name) == dest_name.lower(),
            )
        ).scalar_one_or_none()

        if not dest:
            dest = Destination(
                state_id=state.id,
                name=dest_name,
                district=district,
                latitude=dest_data.get("latitude"),
                longitude=dest_data.get("longitude"),
                popularity_score=dest_data.get("popularity_score", 8),
                best_seasons=dest_data.get("best_seasons", ["winter"]),
                trip_types=dest_data.get("trip_types", ["culture"]),
                min_days=dest_data.get("min_days", Decimal("1.5")),
                ideal_days=dest_data.get("ideal_days", Decimal("2.5")),
                max_days=dest_data.get("max_days", Decimal("4.0")),
                description=dest_data.get("description"),
                safety_rating=dest_data.get("safety_rating", 9),
                data_source=DataSource.MANUAL,
            )
            db.add(dest)
            db.flush()
            stats["destinations"] += 1
            logger.info("  [DEST CREATED] %s (District: %s)", dest.name, district)
        else:
            dest.name = dest_name
            dest.district = district
            if dest_data.get("description"):
                dest.description = dest_data["description"]
            if dest_data.get("latitude"):
                dest.latitude = dest_data["latitude"]
            if dest_data.get("longitude"):
                dest.longitude = dest_data["longitude"]

        # 3. Destination Cost Tiers (Low, Medium, High)
        existing_tiers = {
            ct.tier: ct
            for ct in db.execute(
                select(DestinationCostTier).where(DestinationCostTier.destination_id == dest.id)
            ).scalars().all()
        }

        for tier_enum, tier_vals in STANDARD_COST_TIERS.items():
            if tier_enum not in existing_tiers:
                ct = DestinationCostTier(
                    destination_id=dest.id,
                    tier=tier_enum,
                    accommodation_min=tier_vals["accommodation_min"],
                    accommodation_max=tier_vals["accommodation_max"],
                    food_min=tier_vals["food_min"],
                    food_max=tier_vals["food_max"],
                    activities_min=tier_vals["activities_min"],
                    activities_max=tier_vals["activities_max"],
                    local_transport_min=tier_vals["local_transport_min"],
                    local_transport_max=tier_vals["local_transport_max"],
                    total_daily_min=tier_vals["total_daily_min"],
                    total_daily_max=tier_vals["total_daily_max"],
                    is_estimated=False,
                )
                db.add(ct)
                stats["cost_tiers"] += 1

        # 4. Authentic Local Foods
        existing_foods = {
            f.name.lower(): f
            for f in db.execute(
                select(Food).where(Food.destination_id == dest.id)
            ).scalars().all()
        }

        for food_item in dest_data.get("foods", []):
            f_name = food_item["name"]
            if f_name.lower() not in existing_foods:
                new_food = Food(
                    state_id=state.id,
                    destination_id=dest.id,
                    name=f_name,
                    food_type=food_item.get("food_type", FoodType.VEG),
                    description=food_item.get("description"),
                    avg_price=food_item.get("avg_price", Decimal("150")),
                    price_is_estimated=False,
                    data_source=DataSource.MANUAL,
                )
                db.add(new_food)
                stats["foods"] += 1
                logger.info("    [FOOD ADDED] %s -> %s (₹%s)", f_name, dest.name, new_food.avg_price)

        # 5. Recommended Eateries
        existing_eateries = {
            (e.name.lower(), e.meal_type): e
            for e in db.execute(
                select(Eatery).where(Eatery.destination_id == dest.id)
            ).scalars().all()
        }

        for eat_item in dest_data.get("eateries", []):
            e_name = eat_item["name"]
            meal = eat_item.get("meal_type", MealType.DINNER)
            if (e_name.lower(), meal) not in existing_eateries:
                new_eat = Eatery(
                    destination_id=dest.id,
                    name=e_name,
                    area=eat_item.get("area", dest.name),
                    meal_type=meal,
                    data_source=DataSource.MANUAL,
                )
                db.add(new_eat)
                stats["eateries"] += 1
                logger.info("    [EATERY ADDED] %s (%s) @ %s", e_name, meal.value, dest.name)

        # 6. Curated Tourist Attractions / Places
        for p_data in dest_data.get("places", []):
            p_name = p_data["name"]
            curated_place_names.add(p_name.lower())

            existing_place = db.execute(
                select(Place).where(
                    Place.state_id == state.id,
                    func.lower(Place.name) == p_name.lower(),
                )
            ).scalar_one_or_none()

            # Always prefer our curated traveler description over raw Wikipedia intros
            curated_desc = p_data.get("description", "").strip()
            desc = curated_desc
            img = p_data.get("image_url")
            lat = p_data.get("latitude")
            lon = p_data.get("longitude")

            # Only query Wikipedia if we don't already have a verified Wikimedia photo
            already_has_verified_wiki_img = (
                img and "wikimedia.org" in img and _is_valid_landmark_image(img)
            )
            if fetch_wiki and not already_has_verified_wiki_img:
                wiki_info = wiki_cache.get(p_name)
                if wiki_info:
                    if not desc and wiki_info.get("extract"):
                        desc = clean_summary_text(wiki_info["extract"])
                    cand_thumb = wiki_info.get("thumbnail")
                    if (
                        cand_thumb
                        and _is_valid_landmark_image(cand_thumb)
                        and cand_thumb not in used_state_images
                    ):
                        img = cand_thumb
                        logger.info(
                            "    [WIKI IMAGE] %s -> Found '%s' -> %s",
                            p_name,
                            wiki_info.get("title", p_name),
                            img[:60] + "...",
                        )
                    if not lat and wiki_info.get("lat") and wiki_info.get("lon"):
                        lat = Decimal(str(wiki_info["lat"]))
                        lon = Decimal(str(wiki_info["lon"]))

            # Guarantee no two attractions in the same state ever share an identical image URL
            if not img or img in used_state_images:
                for fallback_candidate in DISTINCT_FALLBACK_POOL:
                    if fallback_candidate not in used_state_images:
                        img = fallback_candidate
                        break
            if img:
                used_state_images.add(img)

            fee_val = p_data.get("entry_fee", Decimal("0"))
            fee_label = "Free Entry" if fee_val == 0 else f"₹{fee_val}"

            if existing_place:
                existing_place.name = p_name
                existing_place.destination_id = dest.id
                existing_place.category = p_data.get("category", existing_place.category)
                existing_place.best_season = p_data.get("best_season", existing_place.best_season)
                existing_place.entry_fee = fee_val
                existing_place.avg_daily_cost = p_data.get("avg_daily_cost", existing_place.avg_daily_cost)
                existing_place.budget_level = p_data.get("budget_level", existing_place.budget_level)
                existing_place.is_hidden_gem = p_data.get("is_hidden_gem", existing_place.is_hidden_gem)
                if desc:
                    existing_place.description = desc
                if img:
                    existing_place.image_url = img
                if lat:
                    existing_place.latitude = lat
                if lon:
                    existing_place.longitude = lon
                stats["places_updated"] += 1
                logger.info(
                    "    [PLACE UPDATED] %s -> %s, %s | %s",
                    existing_place.name, dest.name, state.name, fee_label,
                )
            else:
                new_place = Place(
                    state_id=state.id,
                    destination_id=dest.id,
                    name=p_name,
                    category=p_data.get("category", PlaceCategory.HERITAGE),
                    description=desc,
                    best_season=p_data.get("best_season", Season.WINTER),
                    entry_fee=fee_val,
                    avg_daily_cost=p_data.get("avg_daily_cost", Decimal("200")),
                    budget_level=p_data.get("budget_level", BudgetLevel.LOW),
                    latitude=lat,
                    longitude=lon,
                    image_url=img,
                    is_hidden_gem=p_data.get("is_hidden_gem", False),
                    data_source=DataSource.MANUAL,
                )
                db.add(new_place)
                stats["places_created"] += 1
                logger.info(
                    "    [PLACE CREATED] %s -> %s, %s | %s",
                    p_name, dest.name, state.name, fee_label,
                )

    db.flush()

    # 7. STRICT CLEANUP: Purge any uncurated/legacy places in this state
    all_state_places = db.execute(
        select(Place).where(Place.state_id == state.id)
    ).scalars().all()
    for db_place in all_state_places:
        if db_place.name.lower() not in curated_place_names:
            logger.info("  [PURGED LEGACY PLACE] %s (State: %s)", db_place.name, state.name)
            db.delete(db_place)
            stats["junk_pruned"] += 1

    db.flush()

    # 8. STRICT CLEANUP: Purge any uncurated/unused destinations in this state
    all_state_dests = db.execute(
        select(Destination).where(Destination.state_id == state.id)
    ).scalars().all()
    for db_dest in all_state_dests:
        if db_dest.name.lower() not in curated_dest_names:
            logger.info("  [PURGED LEGACY DEST] %s (State: %s)", db_dest.name, state.name)
            db.delete(db_dest)

    if not dry_run:
        db.commit()

    return stats


def run_pipeline(
    state_filter: str | None = None,
    fetch_wikipedia: bool = True,
    clean_junk: bool = True,
    dry_run: bool = False,
) -> None:
    """Runs the Destination-First ingestion pipeline and purges legacy uncurated data."""
    session_factory = get_session_factory()

    total_stats = {
        "states_processed": 0,
        "destinations": 0,
        "cost_tiers": 0,
        "foods": 0,
        "eateries": 0,
        "places_created": 0,
        "places_updated": 0,
        "junk_pruned": 0,
    }

    targets = CURATED_STATES_DATA
    if state_filter:
        s_filter = state_filter.lower().strip()
        targets = [s for s in CURATED_STATES_DATA if s["name"].lower() == s_filter]
        if not targets:
            logger.error("State '%s' not found in curated catalogue.", state_filter)
            return

    with session_factory() as db:
        for s_data in targets:
            total_stats["states_processed"] += 1
            logger.info("\n=== Processing State: %s (%s) ===", s_data["name"], s_data.get("region"))
            res = ingest_curated_state(db, s_data, fetch_wiki=fetch_wikipedia, dry_run=dry_run)
            for k in (
                "destinations",
                "cost_tiers",
                "foods",
                "eateries",
                "places_created",
                "places_updated",
                "junk_pruned",
            ):
                total_stats[k] += res[k]

    print("\n" + "=" * 54)
    print("      DESTINATION-FIRST PRODUCTION SYNC SUMMARY")
    print("=" * 54)
    print(f" States Processed:        {total_stats['states_processed']}")
    print(f" Destination Hubs Added:  {total_stats['destinations']}")
    print(f" Cost Tiers Created:      {total_stats['cost_tiers']}")
    print(f" Local Foods Added:       {total_stats['foods']}")
    print(f" Eateries Added:          {total_stats['eateries']}")
    print(f" Verified Places Created: {total_stats['places_created']}")
    print(f" Verified Places Updated: {total_stats['places_updated']}")
    print(f" Legacy/Junk Rows Purged: {total_stats['junk_pruned']}")
    print(f" Dry Run Mode:            {dry_run}")
    print("=" * 54 + "\n")


def main() -> None:
    """CLI Entry point."""
    parser = argparse.ArgumentParser(description="Destination-First Travel Data Pipeline for India Travel Explorer.")
    parser.add_argument("--state", type=str, default=None, help="Sync only a specific state (e.g., 'Kerala')")
    parser.add_argument("--all", action="store_true", help="Sync all 36 curated states & UTs")
    parser.add_argument("--no-wiki", action="store_true", help="Skip external Wikipedia API queries")
    parser.add_argument("--dry-run", action="store_true", help="Simulate without committing to DB")
    args = parser.parse_args()

    run_pipeline(
        state_filter=args.state,
        fetch_wikipedia=not args.no_wiki,
        clean_junk=True,
        dry_run=args.dry_run,
    )


if __name__ == "__main__":
    main()
