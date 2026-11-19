"""Destination-First Web Data Pipeline for India Travel Explorer.

Ingests curated, verified destination hubs, authentic local foods, recommended eateries,
accurate cost tiers, and top visitable tourist landmarks across all 36 Indian states
and union territories. Features automated Wikipedia + Wikidata dynamic ingestion to discover,
extract coordinates, clean summaries, and high-res Wikimedia photos for attractions.
"""

import argparse
from concurrent.futures import ThreadPoolExecutor
import json
import logging
import math
import re
import ssl
import urllib.parse
import urllib.request
from decimal import Decimal
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.enums import BudgetLevel, DataSource, FoodType, MealType, PlaceCategory, Season
from app.db.session import get_engine, get_session_factory
from app.models import Base
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
    ".pdf",
    ".djvu",
    ".tif",
    ".tiff",
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
    "census",
    "graph",
    "drawing",
    "actor",
    "actress",
    "politician",
    "portrait",
    "headshot",
    "profile_photo",
    "cropped",
    "minister",
    "leader",
    "cricketer",
    "player",
)


def _is_valid_landmark_image(url: str | None) -> bool:
    """Returns True if the URL is an authentic Wikimedia photograph and not a map, flag, icon, or SVG."""
    if not url:
        return False
    lower_url = url.lower()
    if "wikimedia.org" not in lower_url:
        return False
    return not any(pattern in lower_url for pattern in BAD_IMAGE_PATTERNS)


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two GPS coordinates in kilometers."""
    r_km = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    )
    return 2 * r_km * math.asin(math.sqrt(a))


def clean_summary_text(extract: str) -> str:
    """Returns first 2-3 clean, informative sentences."""
    cleaned = extract.replace("\n", " ").strip()
    sentences = re.split(r"(?<=[.!?])\s+", cleaned)
    return " ".join(sentences[:3]) if len(sentences) >= 3 else cleaned


def _execute_wiki_query(url: str) -> dict[str, Any] | None:
    """Executes a Wikipedia query and extracts verified thumbnail, description and coordinates."""
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=10, context=ctx) as resp:
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


def fetch_wikimedia_commons_photo(
    title: str,
    state_name: str = "",
    category: str = "",
) -> str | None:
    """Option A: Searches Wikimedia Commons directly for authentic photographs of a specific landmark."""
    clean_name = re.sub(r"\(.*?\)", "", title).strip()
    words = [
        w for w in re.split(r"[\s\-_,]+", clean_name)
        if len(w) >= 3 and w.lower() not in ("the", "and", "for", "near", "district", "state")
    ]
    if not words:
        return None

    # Progressive Commons query search
    search_queries = [
        f'"{clean_name}" {state_name}' if state_name else None,
        f'"{clean_name}"',
        f"{clean_name} {category}" if category else None,
        f"{clean_name} {state_name}" if state_name else None,
        clean_name,
    ]
    search_queries = [sq for sq in search_queries if sq]

    for sq in search_queries:
        commons_url = (
            "https://commons.wikimedia.org/w/api.php?action=query"
            f"&generator=search&gsrsearch={urllib.parse.quote(sq)}"
            "&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url|mime&format=json"
        )
        req = urllib.request.Request(commons_url, headers=HEADERS)
        try:
            with urllib.request.urlopen(req, timeout=5, context=ctx) as r:
                data = json.loads(r.read().decode("utf-8"))
                pages = data.get("query", {}).get("pages", {})
                for pid, p in pages.items():
                    p_title = p.get("title", "").lower()
                    ii = p.get("imageinfo", [{}])[0]
                    u = ii.get("url", "")
                    mime = ii.get("mime", "").lower()

                    if not (u and ("image/jpeg" in mime or "image/png" in mime or "image/webp" in mime)):
                        continue
                    if not _is_valid_landmark_image(u) or any(b in p_title for b in BAD_IMAGE_PATTERNS):
                        continue
                    # Relevance check: title must match at least one significant place name word
                    if any(w.lower() in p_title for w in words):
                        return u
        except Exception:
            pass

    return None


def fetch_wikipedia_details(
    wiki_title: str | None = None,
    search_query: str | None = None,
    state_name: str = "",
) -> dict[str, Any] | None:
    """Attempts to fetch live description, thumbnail and coordinates from Wikipedia & Commons."""
    res = None
    if wiki_title:
        title_url = (
            "https://en.wikipedia.org/w/api.php?action=query"
            f"&titles={urllib.parse.quote(wiki_title)}"
            "&prop=pageimages|extracts|coordinates"
            "&redirects=1"
            "&pilicense=any"
            "&exintro=1"
            "&explaintext=1"
            "&pithumbsize=960"
            "&format=json"
        )
        res = _execute_wiki_query(title_url)
        if res and res.get("thumbnail") and _is_valid_landmark_image(res["thumbnail"]):
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
            "&pithumbsize=960"
            "&format=json"
        )
        search_res = _execute_wiki_query(search_url)
        if search_res and search_res.get("thumbnail") and _is_valid_landmark_image(search_res["thumbnail"]):
            return search_res
        if not res and search_res:
            res = search_res

    # Option A: Commons Deep Search if thumbnail was missing
    target_name = wiki_title or fallback_q
    if target_name:
        commons_photo = fetch_wikimedia_commons_photo(target_name, state_name=state_name)
        if commons_photo:
            if not res:
                res = {"title": target_name, "thumbnail": commons_photo, "extract": "", "lat": None, "lon": None}
            else:
                res["thumbnail"] = commons_photo

    return res


def infer_place_attributes(title: str, extract: str) -> tuple[PlaceCategory, Season, BudgetLevel, Decimal]:
    """Infers category, season, budget level and entry fee from landmark title and extract."""
    text = (title + " " + extract).lower()

    if any(k in text for k in ("temple", "mandir", "masjid", "mosque", "dargah", "church", "cathedral", "shrine", "basilica", "ashram", "gurdwara", "monastery")):
        cat = PlaceCategory.TEMPLE
    elif any(k in text for k in ("national park", "wildlife sanctuary", "tiger reserve", "zoo", "safari", "bird sanctuary", "deer park", "fauna")):
        cat = PlaceCategory.WILDLIFE
    elif any(k in text for k in ("waterfall", "falls", "lake", "dam", "reservoir", "river", "valley", "gorge", "cave")):
        cat = PlaceCategory.NATURE
    elif any(k in text for k in ("beach", "cove", "sea shore", "coast")):
        cat = PlaceCategory.BEACH
    elif any(k in text for k in ("hill", "hills", "peak", "ghat", "ridge")):
        cat = PlaceCategory.HILL_STATION
    elif any(k in text for k in ("film city", "amusement", "water park", "theme park", "planetarium", "science centre", "shilparamam", "bazaar", "mall")):
        cat = PlaceCategory.CITY
    elif any(k in text for k in ("trek", "rock climbing", "rafting", "kayak")):
        cat = PlaceCategory.ADVENTURE
    else:
        cat = PlaceCategory.HERITAGE

    if "waterfall" in text or "falls" in text:
        season = Season.MONSOON
    elif "beach" in text or "hill" in text:
        season = Season.WINTER
    elif "lake" in text or "park" in text or "museum" in text or "temple" in text:
        season = Season.ALL_YEAR
    else:
        season = Season.WINTER

    if "film city" in text or "amusement" in text:
        budget = BudgetLevel.HIGH
        fee = Decimal("1000")
    elif any(k in text for k in ("palace", "museum", "national park", "zoo", "safari")):
        budget = BudgetLevel.MEDIUM
        fee = Decimal("50")
    else:
        budget = BudgetLevel.LOW
        fee = Decimal("0") if cat in (PlaceCategory.TEMPLE, PlaceCategory.NATURE, PlaceCategory.BEACH) else Decimal("25")

    return cat, season, budget, fee


def get_wiki_categories_for_state(state_name: str) -> list[str]:
    """Generates comprehensive Wikipedia category targets for any Indian state or UT."""
    slug = state_name.replace(" ", "_")
    cats = [
        f"Category:Tourist_attractions_in_{slug}",
        f"Category:Forts_in_{slug}",
        f"Category:Waterfalls_of_{slug}",
        f"Category:Lakes_of_{slug}",
        f"Category:Hindu_temples_in_{slug}",
        f"Category:Protected_areas_of_{slug}",
        f"Category:National_parks_in_{slug}",
        f"Category:Wildlife_sanctuaries_in_{slug}",
        f"Category:Monuments_and_memorials_in_{slug}",
        f"Category:Museums_in_{slug}",
        f"Category:Archaeological_sites_in_{slug}",
        f"Category:Religious_buildings_and_structures_in_{slug}",
        f"Category:Dams_in_{slug}",
    ]

    s_lower = state_name.lower()
    if s_lower == "telangana":
        cats.extend(["Category:Tourist_attractions_in_Hyderabad,_India", "Category:Lakes_of_Hyderabad,_India"])
    elif s_lower == "kerala":
        cats.extend(["Category:Tourist_attractions_in_Kochi", "Category:Beaches_of_Kerala", "Category:Hill_stations_in_Kerala"])
    elif s_lower == "tamil nadu":
        cats.extend(["Category:Tourist_attractions_in_Chennai", "Category:Temples_in_Tamil_Nadu", "Category:Hill_stations_in_Tamil_Nadu"])
    elif s_lower == "karnataka":
        cats.extend(["Category:Tourist_attractions_in_Bangalore", "Category:Temples_in_Karnataka", "Category:Waterfalls_of_Karnataka"])
    elif s_lower == "maharashtra":
        cats.extend(["Category:Tourist_attractions_in_Mumbai", "Category:Caves_of_Maharashtra", "Category:Hill_stations_in_Maharashtra"])
    elif s_lower == "rajasthan":
        cats.extend(["Category:Tourist_attractions_in_Jaipur", "Category:Palaces_in_Rajasthan", "Category:Forts_in_Rajasthan"])
    elif s_lower == "uttar pradesh":
        cats.extend(["Category:Tourist_attractions_in_Agra", "Category:Tourist_attractions_in_Varanasi", "Category:Temples_in_Uttar_Pradesh"])
    elif s_lower == "delhi":
        cats.extend(["Category:Monuments_and_memorials_in_Delhi", "Category:Museums_in_Delhi"])
    elif s_lower == "goa":
        cats.extend(["Category:Beaches_of_Goa", "Category:Churches_in_Goa"])
    elif s_lower == "punjab":
        cats.extend(["Category:Tourist_attractions_in_Punjab,_India", "Category:Gurdwaras_in_Punjab,_India"])
    elif s_lower == "west bengal":
        cats.extend(["Category:Tourist_attractions_in_Kolkata", "Category:Hill_stations_in_West_Bengal"])
    elif s_lower == "himachal pradesh":
        cats.extend(["Category:Hill_stations_in_Himachal_Pradesh", "Category:Passes_of_Himachal_Pradesh"])
    elif s_lower == "uttarakhand":
        cats.extend(["Category:Hill_stations_in_Uttarakhand", "Category:Hindu_pilgrimage_sites_in_Uttarakhand"])
    elif s_lower == "jammu and kashmir":
        cats.extend(["Category:Tourist_attractions_in_Srinagar", "Category:Lakes_of_Jammu_and_Kashmir"])
    elif s_lower == "ladakh":
        cats.extend(["Category:Buddhist_monasteries_in_Ladakh", "Category:Passes_of_Ladakh"])
    elif s_lower == "andhra pradesh":
        cats.extend(["Category:Tourist_attractions_in_Visakhapatnam", "Category:Temples_in_Andhra_Pradesh"])
    elif s_lower == "andaman and nicobar islands":
        cats.extend(["Category:Tourist_attractions_in_the_Andaman_and_Nicobar_Islands", "Category:Islands_of_the_Andaman_and_Nicobar_Islands"])

    return cats


def discover_state_attractions_from_wiki(state_name: str) -> list[dict[str, Any]]:
    """Crawls Wikipedia categories concurrently and resolves coordinates via Wikipedia & Wikidata P625."""
    logger.info("  [WIKI CRAWLER] Starting category discovery for %s...", state_name)
    categories = get_wiki_categories_for_state(state_name)

    candidate_titles: set[str] = set()
    ignored_prefixes = (
        "list of", "template:", "tourism in", "category:", "history of",
        "geography of", "districts of", "transport in", "economy of"
    )

    def _fetch_category_members(cat: str) -> list[str]:
        url = (
            "https://en.wikipedia.org/w/api.php?action=query"
            f"&list=categorymembers&cmtitle={urllib.parse.quote(cat)}"
            "&cmlimit=100&cmnamespace=0&format=json"
        )
        req = urllib.request.Request(url, headers=HEADERS)
        res: list[str] = []
        try:
            with urllib.request.urlopen(req, timeout=8, context=ctx) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                for m in data.get("query", {}).get("categorymembers", []):
                    title = m.get("title", "").strip()
                    if title and not any(title.lower().startswith(p) for p in ignored_prefixes):
                        res.append(title)
        except Exception as e:
            logger.debug("Failed to query category %s: %s", cat, e)
        return res

    with ThreadPoolExecutor(max_workers=8) as pool:
        for cat_titles in pool.map(_fetch_category_members, categories):
            candidate_titles.update(cat_titles)

    logger.info("  [WIKI CRAWLER] Discovered %d candidate article titles for %s", len(candidate_titles), state_name)

    title_list = list(candidate_titles)
    chunk_size = 35
    chunks = [title_list[i : i + chunk_size] for i in range(0, len(title_list), chunk_size)]
    wiki_items: list[dict[str, Any]] = []
    missing_coords_qid: dict[str, dict[str, Any]] = {}

    def _fetch_page_chunk(chunk: list[str]) -> list[dict[str, Any]]:
        joined = "|".join(chunk)
        url = (
            "https://en.wikipedia.org/w/api.php?action=query"
            f"&titles={urllib.parse.quote(joined)}"
            "&prop=pageimages|extracts|coordinates|pageprops"
            "&pithumbsize=960"
            "&pilicense=any"
            "&exintro=1"
            "&explaintext=1"
            "&redirects=1"
            "&format=json"
        )
        req = urllib.request.Request(url, headers=HEADERS)
        parsed_items: list[dict[str, Any]] = []
        try:
            with urllib.request.urlopen(req, timeout=10, context=ctx) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                pages = data.get("query", {}).get("pages", {})
                for pid, p in pages.items():
                    if int(pid) <= 0 or "missing" in p:
                        continue
                    t = p.get("title", "")
                    extract = p.get("extract", "").strip()
                    if len(extract) < 40:
                        continue
                    coords = p.get("coordinates", [{}])[0] if p.get("coordinates") else {}
                    lat = coords.get("lat")
                    lon = coords.get("lon")

                    thumb = p.get("thumbnail", {}).get("source")
                    if thumb and not _is_valid_landmark_image(thumb):
                        thumb = None

                    parsed_items.append({
                        "name": t,
                        "extract": clean_summary_text(extract),
                        "latitude": Decimal(str(lat)) if lat else None,
                        "longitude": Decimal(str(lon)) if lon else None,
                        "image_url": thumb,
                        "qid": p.get("pageprops", {}).get("wikibase_item"),
                    })
        except Exception as e:
            logger.debug("Failed to fetch chunk: %s", e)
        return parsed_items

    with ThreadPoolExecutor(max_workers=8) as pool:
        for chunk_res in pool.map(_fetch_page_chunk, chunks):
            for item in chunk_res:
                wiki_items.append(item)
                if not item["latitude"] and item["qid"]:
                    missing_coords_qid[item["qid"]] = item

    # Concurrently resolve missing coordinates via Wikidata P625
    if missing_coords_qid:
        qids = list(missing_coords_qid.keys())
        q_chunks = [qids[i : i + 40] for i in range(0, len(qids), 40)]

        def _fetch_wikidata_chunk(q_chunk: list[str]) -> None:
            q_url = (
                "https://www.wikidata.org/w/api.php?action=wbgetentities"
                f"&ids={'|'.join(q_chunk)}&props=claims&format=json"
            )
            req = urllib.request.Request(q_url, headers=HEADERS)
            try:
                with urllib.request.urlopen(req, timeout=10, context=ctx) as resp:
                    wd = json.loads(resp.read().decode("utf-8"))
                    entities = wd.get("entities", {})
                    for qid, edata in entities.items():
                        claims = edata.get("claims", {})
                        p625 = claims.get("P625", [{}])[0].get("mainsnak", {}).get("datavalue", {}).get("value", {})
                        if p625 and p625.get("latitude") and p625.get("longitude"):
                            missing_coords_qid[qid]["latitude"] = Decimal(str(p625["latitude"]))
                            missing_coords_qid[qid]["longitude"] = Decimal(str(p625["longitude"]))
            except Exception as e:
                logger.debug("Wikidata coords fetch failed: %s", e)

        with ThreadPoolExecutor(max_workers=6) as pool:
            pool.map(_fetch_wikidata_chunk, q_chunks)

    # Filter to valid tourist locations inside India geographical boundaries
    valid_places: list[dict[str, Any]] = []
    non_tourist_terms = (
        "film festival", "corporation", "secretariat", "assembly", "hospital",
        "university", "station", "airport", "canal", "barrage", "project", "cemetery",
        "highway", "expressway", "railway", "flyover", "bridge", "constituency"
    )

    # Option A: Deep search Wikimedia Commons for candidates lacking a verified lead image
    missing_photos = [
        it for it in wiki_items
        if it.get("latitude") and it.get("longitude")
        and not (it.get("image_url") and _is_valid_landmark_image(it["image_url"]))
    ]
    if missing_photos:
        def _resolve_candidate_photo(it: dict[str, Any]) -> None:
            ph = fetch_wikimedia_commons_photo(it["name"], state_name=state_name)
            if ph:
                it["image_url"] = ph

        with ThreadPoolExecutor(max_workers=8) as pool:
            list(pool.map(_resolve_candidate_photo, missing_photos))

    for item in wiki_items:
        lat = item["latitude"]
        lon = item["longitude"]
        if not (lat and lon):
            continue
        # Standard India Bounding Box
        if not (6.0 <= float(lat) <= 37.5 and 68.0 <= float(lon) <= 97.5):
            continue

        lower_n = item["name"].lower()
        if any(term in lower_n for term in non_tourist_terms):
            continue

        # Option B: Strict photo quality requirement - discard candidates without authentic photo
        img = item.get("image_url")
        if not (img and "wikimedia.org" in img and _is_valid_landmark_image(img)):
            continue

        cat, season, budget, fee = infer_place_attributes(item["name"], item["extract"])
        item["category"] = cat
        item["best_season"] = season
        item["budget_level"] = budget
        item["entry_fee"] = fee
        item["avg_daily_cost"] = Decimal("200") if budget == BudgetLevel.LOW else Decimal("450")
        item["is_hidden_gem"] = cat in (PlaceCategory.NATURE, PlaceCategory.WILDLIFE)
        valid_places.append(item)

    logger.info("  [WIKI CRAWLER] Successfully extracted %d verified places with GPS for %s", len(valid_places), state_name)
    return valid_places


def ingest_curated_state(
    db: Session,
    state_data: dict[str, Any],
    fetch_wiki: bool = True,
    dry_run: bool = False,
) -> dict[str, int]:
    """Ingests/updates destinations, foods, eateries, cost tiers, and places for one state."""
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
                return p_lbl, fetch_wikipedia_details(wiki_title=w_title, search_query=s_q, state_name=state_name)

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

        # 3. Destination Cost Tiers
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

        # 6. Flagship Curated Places
        for p_data in dest_data.get("places", []):
            p_name = p_data["name"]
            curated_place_names.add(p_name.lower())

            existing_place = db.execute(
                select(Place).where(
                    Place.state_id == state.id,
                    func.lower(Place.name) == p_name.lower(),
                )
            ).scalar_one_or_none()

            desc = p_data.get("description", "").strip()
            img = p_data.get("image_url")
            lat = p_data.get("latitude")
            lon = p_data.get("longitude")

            already_has_verified_wiki_img = (
                img and "wikimedia.org" in img and _is_valid_landmark_image(img)
            )
            if not already_has_verified_wiki_img:
                img = None

            if fetch_wiki and not img:
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
                    if not lat and wiki_info.get("lat") and wiki_info.get("lon"):
                        lat = Decimal(str(wiki_info["lat"]))
                        lon = Decimal(str(wiki_info["lon"]))

                if not img:
                    deep_thumb = fetch_wikimedia_commons_photo(p_name, state_name=state_name)
                    if deep_thumb and _is_valid_landmark_image(deep_thumb) and deep_thumb not in used_state_images:
                        img = deep_thumb

            # Option B: Strict photo quality requirement - never ingest or keep a place without an authentic photograph
            if not (img and "wikimedia.org" in img and _is_valid_landmark_image(img)):
                if existing_place:
                    logger.info("  [PURGED PLACE WITHOUT PHOTO] %s (State: %s)", p_name, state.name)
                    db.delete(existing_place)
                    stats["junk_pruned"] += 1
                continue

            used_state_images.add(img)
            curated_place_names.add(p_name.lower())

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

    db.flush()

    # 6b. AUTOMATED WIKIPEDIA DISCOVERY & INGESTION ACROSS ALL STATES
    if fetch_wiki:
        discovered_places = discover_state_attractions_from_wiki(state_name)
        state_dest_objs = db.execute(
            select(Destination).where(Destination.state_id == state.id)
        ).scalars().all()

        for wiki_p in discovered_places:
            p_name = wiki_p["name"]

            # Cluster to nearest destination hub using GPS coordinates
            nearest_dest = None
            if state_dest_objs and wiki_p.get("latitude") and wiki_p.get("longitude"):
                nearest_dest = min(
                    state_dest_objs,
                    key=lambda d: haversine_km(
                        float(wiki_p["latitude"]),
                        float(wiki_p["longitude"]),
                        float(d.latitude or 0),
                        float(d.longitude or 0),
                    ),
                )
                min_dist = haversine_km(
                    float(wiki_p["latitude"]),
                    float(wiki_p["longitude"]),
                    float(nearest_dest.latitude or 0),
                    float(nearest_dest.longitude or 0),
                )
                # Geographic validation: discard if more than 350 km from all hubs in this state
                if min_dist > 350.0:
                    continue

            img = wiki_p.get("image_url")
            # Option B: Strict quality requirement - must have verified authentic Wikimedia photo
            if not (img and "wikimedia.org" in img and _is_valid_landmark_image(img)):
                continue
            if img in used_state_images:
                continue

            used_state_images.add(img)
            curated_place_names.add(p_name.lower())
            target_dest_id = nearest_dest.id if nearest_dest else state_dest_objs[0].id

            existing_place = db.execute(
                select(Place).where(
                    Place.state_id == state.id,
                    func.lower(Place.name) == p_name.lower(),
                )
            ).scalar_one_or_none()

            fee_val = wiki_p.get("entry_fee", Decimal("0"))

            if existing_place:
                existing_place.destination_id = target_dest_id
                if not existing_place.description and wiki_p.get("extract"):
                    existing_place.description = wiki_p["extract"]
                if img and ("wikimedia.org" in img or not existing_place.image_url):
                    existing_place.image_url = img
                if wiki_p.get("latitude"):
                    existing_place.latitude = wiki_p["latitude"]
                if wiki_p.get("longitude"):
                    existing_place.longitude = wiki_p["longitude"]
                stats["places_updated"] += 1
            else:
                new_place = Place(
                    state_id=state.id,
                    destination_id=target_dest_id,
                    name=p_name,
                    category=wiki_p.get("category", PlaceCategory.HERITAGE),
                    description=wiki_p.get("extract", ""),
                    best_season=wiki_p.get("best_season", Season.WINTER),
                    entry_fee=fee_val,
                    avg_daily_cost=wiki_p.get("avg_daily_cost", Decimal("200")),
                    budget_level=wiki_p.get("budget_level", BudgetLevel.LOW),
                    latitude=wiki_p.get("latitude"),
                    longitude=wiki_p.get("longitude"),
                    image_url=img,
                    is_hidden_gem=wiki_p.get("is_hidden_gem", False),
                    data_source=DataSource.MANUAL,
                )
                db.add(new_place)
                stats["places_created"] += 1
                logger.info(
                    "    [WIKI INGESTED] %s -> %s Hub: %s",
                    p_name,
                    state_name,
                    nearest_dest.name if nearest_dest else "Main",
                )

    db.flush()

    # 7. STRICT CLEANUP: Purge any uncurated/legacy places OR places lacking authentic photo
    all_state_places = db.execute(
        select(Place).where(Place.state_id == state.id)
    ).scalars().all()
    for db_place in all_state_places:
        has_valid_photo = (
            db_place.image_url
            and "wikimedia.org" in db_place.image_url
            and _is_valid_landmark_image(db_place.image_url)
        )
        if db_place.name.lower() not in curated_place_names or not has_valid_photo:
            logger.info("  [PURGED UNVERIFIED PLACE] %s (State: %s)", db_place.name, state.name)
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
    # Ensure all tables and constraints exist on a fresh database
    Base.metadata.create_all(bind=get_engine())
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
    parser.add_argument("--state", type=str, default=None, help="Sync only a specific state (e.g., 'Telangana')")
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
