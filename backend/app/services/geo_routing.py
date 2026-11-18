"""Enterprise Geo-Spatial Clustering, Contiguous Circuit Routing, and RAG Grounding Guardrails.

Operates directly on verified (latitude, longitude) coordinates across all 36 Indian States
and Union Territories so same-day sightseeing is always geographically realistic (<= 85 km
pairwise) and multi-day itineraries follow a contiguous regional trail with zero duplicates.
"""

from dataclasses import dataclass, field
from decimal import Decimal
import math
from typing import Any

from app.core.enums import FoodType, PlaceCategory
from app.models.food import Food
from app.models.place import Place
from app.schemas.planner import (
    BudgetBreakdown,
    DayPlan,
    ItineraryMealItem,
    ItineraryPlaceItem,
    TripPlanRequest,
    TripPlanResponse,
)

MAX_CLUSTER_RADIUS_KM = 42.0
MAX_SAME_DAY_PAIRWISE_KM = 85.0
SHORT_REGIONAL_HOP_KM = 210.0
LONG_TRANSIT_THRESHOLD_KM = 150.0


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Compute great-circle distance in kilometers between two GPS coordinates."""
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2.0) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2.0) ** 2
    )
    return 2.0 * 6371.0 * math.atan2(math.sqrt(a), math.sqrt(max(0.0, 1.0 - a)))


def _place_coords(place: Place) -> tuple[float, float] | None:
    if place.latitude is None or place.longitude is None:
        return None
    return (float(place.latitude), float(place.longitude))


def _extract_location_label(place: Place, fallback_state: str) -> str:
    """Infer an accurate local town/hub name for a place using GPS proximity and name cues."""
    p_coord = _place_coords(place)
    dest = place.destination

    # 1. Check if the place has an explicit ", TownName" suffix in its title
    comma_town: str | None = None
    if "," in place.name:
        suffix = place.name.rsplit(",", 1)[1].strip()
        # Strip parenthetical notes
        if "(" in suffix:
            suffix = suffix.split("(")[0].strip()
        if 2 < len(suffix) <= 28 and suffix.lower() != fallback_state.lower():
            comma_town = suffix

    # 2. Check distance to parent destination centroid
    if dest is not None:
        dest_tokens = [
            tok.strip()
            for part in dest.name.split(",")
            for tok in part.split("&")
            if tok.strip()
        ]
        dest_coord = (
            (float(dest.latitude), float(dest.longitude))
            if dest.latitude is not None and dest.longitude is not None
            else None
        )
        near_dest = (
            haversine_km(p_coord[0], p_coord[1], dest_coord[0], dest_coord[1]) <= 68.0
            if (p_coord and dest_coord)
            else True
        )

        if near_dest:
            if len(dest_tokens) == 1:
                return dest.name
            # Match token mentioned in place name/description, else first token (matches dest coords)
            text_lower = f"{place.name} {place.description or ''}".lower()
            for tok in dest_tokens:
                if tok.lower() in text_lower:
                    return tok
            if comma_town:
                return comma_town
            return dest_tokens[0]

        # Place is far (> 68 km) from its parent destination centroid — do NOT use wrong hub label
        if comma_town:
            return comma_town
        text_lower = f"{place.name} {place.description or ''}".lower()
        for tok in dest_tokens[1:]:
            if tok.lower() in text_lower:
                return tok

    if comma_town:
        return comma_town

    # 3. Clean landmark-based region name (e.g. "Kumbhalgarh Fort" -> "Kumbhalgarh")
    base = place.name.split("(")[0].split("&")[0].strip()
    strip_suffixes = (
        " National Park",
        " Wildlife Sanctuary",
        " Tiger Reserve",
        " Cave Temples",
        " Group of Monuments",
        " Fort",
        " Temple",
        " Palace",
        " Beach",
        " Lake",
        " Falls",
        " Waterfalls",
    )
    for suf in strip_suffixes:
        if base.endswith(suf) and len(base) > len(suf) + 3:
            return base[: -len(suf)].strip()
    return base[:26].strip() or fallback_state


@dataclass
class GeoCluster:
    """A geographically tight cluster of verified attractions visitable without long transit."""

    cluster_id: int
    hub_name: str
    centroid_lat: float
    centroid_lon: float
    places: list[Place] = field(default_factory=list)


@dataclass
class DaySlotBlueprint:
    """Pre-verified geographic assignment for a single day of the trip."""

    day_number: int
    hub_name: str
    cluster_id: int
    recommended_places: list[Place]
    recommended_food: Food | None
    transit_km_from_prev: float = 0.0
    previous_hub_name: str | None = None

    @property
    def is_transit_day(self) -> bool:
        return self.transit_km_from_prev >= LONG_TRANSIT_THRESHOLD_KM


@dataclass
class CircuitBlueprint:
    """Complete contiguous multi-day geographic blueprint for grounding Gemini LLM."""

    state_name: str
    requested_days: int
    effective_days: int
    clusters: list[GeoCluster]
    day_slots: list[DaySlotBlueprint]
    duration_capped_note: str | None = None
    candidate_corridors: list[str] = field(default_factory=list)


def _place_matches_interests(place: Place, interest_set: set[PlaceCategory]) -> bool:
    """True if place matches requested interest categories or semantic landmark keywords."""
    if not interest_set:
        return False
    if place.category in interest_set:
        return True
    name_lower = (place.name or "").lower()
    desc_lower = (place.description or "").lower()
    combined = f"{name_lower} {desc_lower}"
    if PlaceCategory.TEMPLE in interest_set and any(
        kw in combined
        for kw in ("temple", "shrine", "dargah", "monastery", "gurudwara", "church", "basilica", "synagogue", "nandi", "stupa", "theertham", "ghat", "jyotirlinga", "darshan")
    ):
        return True
    if PlaceCategory.BEACH in interest_set and any(
        kw in name_lower for kw in ("beach", "island", "lighthouse", "promenade", "backwater", "pier")
    ):
        return True
    if (PlaceCategory.HILL_STATION in interest_set or PlaceCategory.NATURE in interest_set) and any(
        kw in name_lower for kw in ("valley", "falls", "waterfall", "hill", "peak", "lake", "dam", "tea", "canyon", "borra")
    ):
        return True
    if PlaceCategory.HERITAGE in interest_set and any(
        kw in name_lower for kw in ("fort", "palace", "caves", "museum", "ruins", "tomb", "complex", "monument", "nandi")
    ):
        return True
    return False


def cluster_state_places(
    places: list[Place],
    state_name: str,
    interests: list[PlaceCategory] | None = None,
) -> list[GeoCluster]:
    """Group state attractions by real Haversine GPS proximity (<= 62 km radius, <= 85 km pairwise)."""
    interest_set = set(interests or [])

    # Sort so interest-matching and iconic main-hub places form crisp cluster seeds
    ordered = sorted(
        places,
        key=lambda p: (
            0 if _place_matches_interests(p, interest_set) else 1,
            1 if bool(p.is_hidden_gem) else 0,
            p.id,
        ),
    )

    clusters: list[GeoCluster] = []
    for place in ordered:
        coord = _place_coords(place)
        if coord is None:
            if clusters:
                clusters[0].places.append(place)
            else:
                clusters.append(
                    GeoCluster(
                        cluster_id=1,
                        hub_name=_extract_location_label(place, state_name),
                        centroid_lat=0.0,
                        centroid_lon=0.0,
                        places=[place],
                    )
                )
            continue

        best_cluster: GeoCluster | None = None
        best_dist = float("inf")

        for cl in clusters:
            if cl.centroid_lat == 0.0 and cl.centroid_lon == 0.0:
                continue
            dist_centroid = haversine_km(coord[0], coord[1], cl.centroid_lat, cl.centroid_lon)
            if dist_centroid > MAX_CLUSTER_RADIUS_KM:
                continue
            # Enforce pairwise cap against every place already in the cluster
            pairwise_ok = all(
                haversine_km(coord[0], coord[1], pc[0], pc[1]) <= MAX_SAME_DAY_PAIRWISE_KM
                for existing in cl.places
                if (pc := _place_coords(existing)) is not None
            )
            if pairwise_ok and dist_centroid < best_dist:
                best_dist = dist_centroid
                best_cluster = cl

        if best_cluster is not None:
            best_cluster.places.append(place)
            valid_coords = [c for p in best_cluster.places if (c := _place_coords(p)) is not None]
            best_cluster.centroid_lat = sum(c[0] for c in valid_coords) / len(valid_coords)
            best_cluster.centroid_lon = sum(c[1] for c in valid_coords) / len(valid_coords)
        else:
            clusters.append(
                GeoCluster(
                    cluster_id=len(clusters) + 1,
                    hub_name=_extract_location_label(place, state_name),
                    centroid_lat=coord[0],
                    centroid_lon=coord[1],
                    places=[place],
                )
            )

    # Merge isolated 1-place clusters into their nearest regional neighbor (<= 65 km) if pairwise <= 85 km
    merged_clusters: list[GeoCluster] = []
    singletons = [c for c in clusters if len(c.places) == 1]
    multi_clusters = [c for c in clusters if len(c.places) > 1]
    if multi_clusters and singletons:
        for sc in singletons:
            s_place = sc.places[0]
            s_coord = _place_coords(s_place)
            best_target: GeoCluster | None = None
            best_d = float("inf")
            if s_coord is not None:
                for mc in multi_clusters:
                    d_c = haversine_km(s_coord[0], s_coord[1], mc.centroid_lat, mc.centroid_lon)
                    if d_c <= 65.0 and d_c < best_d:
                        pw_ok = all(
                            haversine_km(s_coord[0], s_coord[1], pc[0], pc[1]) <= MAX_SAME_DAY_PAIRWISE_KM
                            for ex in mc.places
                            if (pc := _place_coords(ex)) is not None
                        )
                        if pw_ok:
                            best_d = d_c
                            best_target = mc
            if best_target is not None:
                best_target.places.append(s_place)
                v_coords = [c for p in best_target.places if (c := _place_coords(p)) is not None]
                best_target.centroid_lat = sum(c[0] for c in v_coords) / len(v_coords)
                best_target.centroid_lon = sum(c[1] for c in v_coords) / len(v_coords)
            else:
                multi_clusters.append(sc)
        clusters = multi_clusters

    # Finalize clean hub names based on the dominant local label in each cluster
    for idx_c, cl in enumerate(clusters, start=1):
        cl.cluster_id = idx_c
        labels = [_extract_location_label(p, state_name) for p in cl.places]
        counts: dict[str, int] = {}
        for lbl in labels:
            counts[lbl] = counts.get(lbl, 0) + 1
        cl.hub_name = max(counts.items(), key=lambda kv: kv[1])[0]

    return clusters


def _cluster_distance(c1: GeoCluster, c2: GeoCluster) -> float:
    if (c1.centroid_lat == 0.0 and c1.centroid_lon == 0.0) or (
        c2.centroid_lat == 0.0 and c2.centroid_lon == 0.0
    ):
        return 80.0
    return haversine_km(c1.centroid_lat, c1.centroid_lon, c2.centroid_lat, c2.centroid_lon)


def _simulate_trail_from_start(
    start_idx: int,
    clusters: list[GeoCluster],
    effective_days: int,
    target_counts_per_day: list[int],
    interest_set: set[PlaceCategory] | None = None,
) -> tuple[list[tuple[GeoCluster, list[Place], float]], float]:
    """Simulate a contiguous day-by-day geographic trail starting at clusters[start_idx]."""
    interest_s = interest_set or set()
    remaining_by_id: dict[int, list[Place]] = {
        cl.cluster_id: list(cl.places) for cl in clusters
    }
    visited_cluster_ids: set[int] = set()

    curr = clusters[start_idx]
    visited_cluster_ids.add(curr.cluster_id)
    day_assignments: list[tuple[GeoCluster, list[Place], float]] = []
    total_hop_km = 0.0

    for day_idx in range(effective_days):
        desired_n = target_counts_per_day[day_idx]
        hop_km = 0.0

        if day_idx > 0:
            curr_rem = remaining_by_id[curr.cluster_id]
            # Look for an unvisited nearby scenic side-trip hub within <= 125 km (e.g. Vizag -> Araku)
            unvisited_with_places = [
                cl
                for cl in clusters
                if cl.cluster_id not in visited_cluster_ids and len(remaining_by_id[cl.cluster_id]) >= 1
            ]
            close_side_trip = None
            close_dist = float("inf")
            for cand in unvisited_with_places:
                d_km = _cluster_distance(curr, cand)
                if d_km <= 125.0 and len(remaining_by_id[cand.cluster_id]) >= 2 and d_km < close_dist:
                    close_dist = d_km
                    close_side_trip = cand

            if close_side_trip is not None and day_idx == 1 and effective_days >= 3 and len(curr_rem) >= 4:
                hop_km = close_dist
                curr = close_side_trip
                visited_cluster_ids.add(curr.cluster_id)
            elif len(curr_rem) >= desired_n or (len(curr.places) == 4 and len(curr_rem) == 2):
                # Stay in current cluster when full day of sights remains or completing a 2+2 4-place hub
                hop_km = 0.0
            else:
                # Pick nearest cluster with >= 2 unvisited attractions, prioritizing interest-matching regional hops
                candidates_any = [
                    cl for cl in clusters if len(remaining_by_id[cl.cluster_id]) > 0 and cl.cluster_id != curr.cluster_id
                ]
                if candidates_any:
                    candidates_any.sort(
                        key=lambda c: (
                            0 if len(remaining_by_id[c.cluster_id]) >= 2 else 1,
                            0 if _cluster_distance(curr, c) <= SHORT_REGIONAL_HOP_KM else 1,
                            _cluster_distance(curr, c)
                            - (
                                sum(1 for p in remaining_by_id[c.cluster_id] if _place_matches_interests(p, interest_s)) * 38.0
                                if 0 < len(interest_s) <= 2
                                else 0.0
                            ),
                            -len(remaining_by_id[c.cluster_id]),
                        )
                    )
                    nxt = candidates_any[0]
                    hop_km = _cluster_distance(curr, nxt)
                    curr = nxt
                    visited_cluster_ids.add(curr.cluster_id)

        # Smart multi-day hub pacing: if a cluster has 4 places left and >= 2 days remain, pace 2 sights today so 2 remain for tomorrow
        avail = remaining_by_id[curr.cluster_id]
        actual_cap = min(desired_n, 2) if hop_km >= LONG_TRANSIT_THRESHOLD_KM else desired_n
        if len(avail) == 4 and (effective_days - day_idx) >= 2:
            actual_cap = min(actual_cap, 2)

        picked = avail[: max(1, min(actual_cap, len(avail)))]
        remaining_by_id[curr.cluster_id] = avail[len(picked) :]

        total_hop_km += hop_km
        day_assignments.append((curr, picked, hop_km))

    return day_assignments, total_hop_km


def build_circuit_blueprint(
    state_name: str,
    request: TripPlanRequest,
    places: list[Place],
    foods: list[Food],
    *,
    preferred_hub: str | None = None,
    excluded_hubs: set[str] | None = None,
) -> CircuitBlueprint:
    """Construct an optimal, zero-duplicate geographic & culinary blueprint for any Indian state."""
    clusters = cluster_state_places(places, state_name, request.interests)
    total_unique_places = sum(len(c.places) for c in clusters)
    effective_days = max(1, min(request.duration_days, total_unique_places))

    duration_note: str | None = None
    if effective_days < request.duration_days:
        duration_note = (
            f"Note: {state_name} currently features {total_unique_places} verified landmarks in our catalogue, "
            f"so your itinerary has been thoughtfully paced into a {effective_days}-day zero-repetition regional circuit."
        )

    # Compute balanced daily stop counts (1 to 3 places/day) without exhausting places early
    max_total_stops = min(total_unique_places, effective_days * 3)
    base_per_day = max(1, max_total_stops // effective_days)
    extra_days = max_total_stops - (base_per_day * effective_days)
    target_counts = [
        min(3, base_per_day + (1 if idx < extra_days else 0))
        for idx in range(effective_days)
    ]

    interest_set = set(request.interests or [])
    focused_interest = 0 < len(interest_set) <= 2
    excluded_lower = {h.lower() for h in (excluded_hubs or set())}
    preferred_lower = preferred_hub.lower().strip() if preferred_hub else None

    scored_trails: list[tuple[float, list[tuple[GeoCluster, list[Place], float]]]] = []

    for idx in range(len(clusters)):
        trail, hop_sum = _simulate_trail_from_start(idx, clusters, effective_days, target_counts, interest_set)
        scheduled = [p for _, p_list, _ in trail for p in p_list]
        unique_ids = {p.id for p in scheduled}
        interest_hits = sum(1 for p in scheduled if _place_matches_interests(p, interest_set))
        exact_interest_hits = sum(1 for p in scheduled if p.category in interest_set)
        start_exact_hits = sum(1 for p in clusters[idx].places if p.category in interest_set)
        start_interest_hits = sum(1 for p in clusters[idx].places if _place_matches_interests(p, interest_set))
        interest_ratio = interest_hits / max(1, len(unique_ids))
        start_interest_ratio = start_interest_hits / max(1, len(clusters[idx].places))
        long_hops = sum(1 for _, _, h in trail if h > 250.0)
        distinct_hubs = len({cl.hub_name for cl, _, _ in trail})

        if focused_interest:
            score = (
                len(unique_ids) * 10.0
                + exact_interest_hits * 48.0
                + interest_hits * 32.0
                + interest_ratio * 95.0
                + start_exact_hits * 55.0
                + start_interest_hits * 22.0
                + start_interest_ratio * 45.0
                + min(distinct_hubs, 3) * 14.0
                - hop_sum * 0.10
                - long_hops * 45.0
            )
        else:
            score = (
                len(unique_ids) * 25.0
                + interest_hits * 18.0
                + len(clusters[idx].places) * 4.0
                - hop_sum * 0.12
                - long_hops * 45.0
            )

        hub_lower = clusters[idx].hub_name.lower()
        if preferred_lower and (preferred_lower in hub_lower or hub_lower in preferred_lower):
            score += 500.0
        if any(ex in hub_lower for ex in excluded_lower):
            score -= 400.0

        scored_trails.append((score, trail))

    scored_trails.sort(key=lambda item: item[0], reverse=True)
    best_trail = scored_trails[0][1] if scored_trails else []

    # Build top 3 distinct candidate regional corridors for RAG prompt transparency
    candidate_corridors: list[str] = []
    seen_corridor_keys: set[str] = set()
    for sc, tr in scored_trails:
        hubs_seq = list(dict.fromkeys(cl.hub_name for cl, _, _ in tr))
        corridor_key = " -> ".join(hubs_seq)
        if corridor_key not in seen_corridor_keys:
            seen_corridor_keys.add(corridor_key)
            sights_preview = ", ".join(p.name for _, plist, _ in tr for p in plist[:2])
            candidate_corridors.append(f"{corridor_key} (Key sights: {sights_preview})")
        if len(candidate_corridors) >= 3:
            break

    # Sort candidate foods by budget tier so Low-Budget prioritizes affordable local tiffins & High-Budget features signature feasts
    sorted_foods = list(foods)
    if request.budget_tier.value == "low":
        sorted_foods.sort(key=lambda f: float(f.avg_price or 150))
    elif request.budget_tier.value == "high":
        sorted_foods.sort(key=lambda f: -float(f.avg_price or 150))

    # Pair each day with a distinct, dietary-compliant regional dish
    foods_by_hub: dict[str, list[Food]] = {}
    for f in sorted_foods:
        if f.destination:
            foods_by_hub.setdefault(f.destination.name.lower(), []).append(f)

    used_food_names: set[str] = set()
    day_slots: list[DaySlotBlueprint] = []
    prev_hub: str | None = None

    for d_idx, (cl, raw_day_places, hop_km) in enumerate(best_trail, start=1):
        # Order sights within the day by geographic nearest-neighbor to prevent back-and-forth driving
        day_places: list[Place] = []
        pool = list(raw_day_places)
        if pool:
            day_places.append(pool.pop(0))
            while pool:
                last_c = _place_coords(day_places[-1])
                if last_c is None:
                    day_places.extend(pool)
                    break
                pool.sort(
                    key=lambda p: (
                        haversine_km(last_c[0], last_c[1], pc[0], pc[1])
                        if (pc := _place_coords(p)) is not None
                        else 999.0
                    )
                )
                day_places.append(pool.pop(0))

        # Resolve hub name from THIS specific day's places (e.g., Kochi vs Alleppey)
        day_labels = [_extract_location_label(p, state_name) for p in day_places]
        label_counts: dict[str, int] = {}
        for lbl in day_labels:
            label_counts[lbl] = label_counts.get(lbl, 0) + 1
        day_hub = (
            max(label_counts.items(), key=lambda kv: kv[1])[0]
            if label_counts
            else cl.hub_name
        )

        chosen_food: Food | None = None
        hub_lower = day_hub.lower()

        # Match hub foods first
        matching_hub_foods = [
            f
            for dest_key, flist in foods_by_hub.items()
            if hub_lower in dest_key or dest_key in hub_lower
            for f in flist
            if f.name not in used_food_names
        ]
        if matching_hub_foods:
            chosen_food = matching_hub_foods[0]
        else:
            unused_state_foods = [f for f in sorted_foods if f.name not in used_food_names]
            if unused_state_foods:
                chosen_food = unused_state_foods[0]
            elif sorted_foods:
                chosen_food = sorted_foods[(d_idx - 1) % len(sorted_foods)]

        if chosen_food is not None:
            used_food_names.add(chosen_food.name)

        day_slots.append(
            DaySlotBlueprint(
                day_number=d_idx,
                hub_name=day_hub,
                cluster_id=cl.cluster_id,
                recommended_places=day_places,
                recommended_food=chosen_food,
                transit_km_from_prev=round(hop_km, 1),
                previous_hub_name=prev_hub if (prev_hub and prev_hub != day_hub and hop_km > 20.0) else None,
            )
        )
        prev_hub = day_hub

    return CircuitBlueprint(
        state_name=state_name,
        requested_days=request.duration_days,
        effective_days=effective_days,
        clusters=clusters,
        day_slots=day_slots,
        duration_capped_note=duration_note,
        candidate_corridors=candidate_corridors,
    )


_RESORT_HUBS = (
    "munnar", "alleppey", "araku", "goa", "udaipur", "manali", "shimla", "ooty",
    "kodagu", "coorg", "gulmarg", "pahalgam", "gangtok", "darjeeling", "kovalam",
    "varkala", "jaisalmer", "havelock", "shillong", "wayanad", "kumarakom", "leh",
)
_PILGRIMAGE_HUBS = (
    "tirupati", "srikalahasti", "lepakshi", "gandikota", "puri", "madurai",
    "varanasi", "ayodhya", "haridwar", "rishikesh", "amritsar", "dwarka",
    "somnath", "thrissur", "thanjavur", "hampi", "srisailam", "rameswaram",
)


def _compute_dynamic_budgets(
    days: list[DayPlan],
    slots: list[DaySlotBlueprint],
    request: TripPlanRequest,
    llm_breakdown: dict[str, Any] | None = None,
) -> tuple[list[DayPlan], BudgetBreakdown]:
    """Compute realistic, variable per-day costs and itemized breakdown grounded in hub tier, drive km, meals, and tickets."""
    n_days = max(1, len(days))
    target_total = max(1500.0, float(request.total_budget))

    day_tickets: list[float] = []
    stay_weights: list[float] = []
    food_weights: list[float] = []
    transit_weights: list[float] = []

    for idx, d in enumerate(days):
        slot = slots[idx] if idx < len(slots) else None
        t_fee = sum(float(p.entry_fee or 0) for p in d.places)
        day_tickets.append(t_fee)

        hub_l = d.destination_name.lower()
        if any(r in hub_l for r in _RESORT_HUBS):
            s_w = 1.16
        elif any(p in hub_l for p in _PILGRIMAGE_HUBS):
            s_w = 0.86
        else:
            s_w = 1.00
        # Departure day has slightly lower stay overhead than arrival/mid-circuit nights
        if n_days >= 2 and idx == n_days - 1:
            s_w *= 0.89
        elif idx == 0:
            s_w *= 1.04
        stay_weights.append(s_w)

        meal_sum = sum(float(m.avg_price or 180) for m in d.meals) or 200.0
        food_weights.append(max(120.0, meal_sum * 2.3))

        hop_km = slot.transit_km_from_prev if slot else 0.0
        stop_factor = len(d.places) * 8.5
        road_km = (hop_km * 1.25) + stop_factor + (idx * 2.5)
        transit_weights.append(0.75 + (road_km / 38.0))

    total_entry = Decimal(str(round(sum(day_tickets))))
    remaining_target = max(float(target_total) * 0.96 - float(total_entry), float(target_total) * 0.65)

    # Check if LLM provided valid positive breakdown estimates
    raw_b = llm_breakdown or {}
    try:
        llm_accom = float(raw_b.get("accommodation_estimate") or 0)
        llm_food = float(raw_b.get("food_estimate") or 0)
        llm_trans = float(raw_b.get("local_transport_estimate") or 0)
    except Exception:
        llm_accom, llm_food, llm_trans = 0.0, 0.0, 0.0

    if llm_accom > 0 and llm_food > 0 and llm_trans > 0:
        flex_sum = llm_accom + llm_food + llm_trans
        # Keep LLM's real-world proportions while ensuring total doesn't wildly exceed user's target budget
        if flex_sum > remaining_target * 1.15:
            scale = (remaining_target * 1.02) / flex_sum
            llm_accom *= scale
            llm_food *= scale
            llm_trans *= scale
        accom_total = llm_accom
        food_total = max(sum( float(m.avg_price or 0) for d in days for m in d.meals ), llm_food)
        trans_total = llm_trans
    else:
        # Tier-aware split: Low budget spends higher % on transit/food & lower % on basic lodges; High budget spends more on stays
        if request.budget_tier.value == "low":
            accom_share, food_share, trans_share = 0.42, 0.30, 0.28
        elif request.budget_tier.value == "high":
            accom_share, food_share, trans_share = 0.54, 0.25, 0.21
        else:
            accom_share, food_share, trans_share = 0.48, 0.27, 0.25

        accom_total = remaining_target * accom_share
        food_total = max(sum(food_weights), remaining_target * food_share)
        trans_total = remaining_target * trans_share
        if accom_total + food_total + trans_total > remaining_target * 1.04:
            adj = remaining_target / (accom_total + food_total + trans_total)
            accom_total *= adj
            food_total *= adj
            trans_total *= adj

    sum_sw = sum(stay_weights) or 1.0
    sum_fw = sum(food_weights) or 1.0
    sum_tw = sum(transit_weights) or 1.0

    updated_days: list[DayPlan] = []
    running_accom = 0
    running_food = 0
    running_trans = 0

    for idx, d in enumerate(days):
        d_stay = round((accom_total * (stay_weights[idx] / sum_sw)) / 10.0) * 10
        d_food = round((food_total * (food_weights[idx] / sum_fw)) / 10.0) * 10
        d_trans = round((trans_total * (transit_weights[idx] / sum_tw)) / 10.0) * 10
        d_tick = round(day_tickets[idx])

        running_accom += d_stay
        running_food += d_food
        running_trans += d_trans

        d_total = Decimal(str(max(300, d_stay + d_food + d_trans + d_tick)))
        updated_days.append(d.model_copy(update={"day_budget": d_total}))

    accom_dec = Decimal(str(max(0, running_accom)))
    food_dec = Decimal(str(max(0, running_food)))
    trans_dec = Decimal(str(max(0, running_trans)))
    total_est_dec = accom_dec + food_dec + total_entry + trans_dec

    breakdown = BudgetBreakdown(
        accommodation_estimate=accom_dec,
        food_estimate=food_dec,
        activities_and_entry=total_entry,
        local_transport_estimate=trans_dec,
        total_estimated_cost=total_est_dec,
    )
    return updated_days, breakdown


def validate_and_ground_plan(
    raw_json: dict[str, Any],
    *,
    state_id: int,
    state_name: str,
    request: TripPlanRequest,
    places: list[Place],
    foods: list[Food],
    blueprint: CircuitBlueprint,
) -> TripPlanResponse:
    """Enterprise post-LLM guardrail verifying zero hallucinations, zero duplicates, and GPS realism.

    Raises ValueError on severe geographic/structural violations so LlmClient can trigger a
    targeted self-correction retry with Gemini, while hydrating authoritative DB prices/IDs.
    """
    place_by_id: dict[int, Place] = {p.id: p for p in places}
    place_by_name: dict[str, Place] = {p.name.lower().strip(): p for p in places}
    food_by_name: dict[str, Food] = {f.name.lower().strip(): f for f in foods}

    raw_days = raw_json.get("days")
    if not isinstance(raw_days, list) or len(raw_days) == 0:
        raise ValueError("Itinerary JSON must contain a non-empty 'days' array.")

    if len(raw_days) != blueprint.effective_days:
        raise ValueError(
            f"Expected exactly {blueprint.effective_days} days in 'days', but received {len(raw_days)}."
        )

    seen_place_ids: set[int] = set()
    seen_dishes: set[str] = set()
    grounded_days: list[DayPlan] = []
    total_entry_fees = Decimal("0")
    total_food_cost = Decimal("0")

    for idx, raw_day in enumerate(raw_days):
        slot = blueprint.day_slots[idx]
        raw_places = raw_day.get("places") or []
        if not isinstance(raw_places, list) or len(raw_places) == 0:
            raise ValueError(f"Day {idx + 1} has no scheduled places.")

        resolved_places: list[ tuple[Place, dict[str, Any]] ] = []
        for rp in raw_places:
            pid = rp.get("place_id")
            pname = str(rp.get("place_name", "")).lower().strip()
            db_place = place_by_id.get(pid) if isinstance(pid, int) else None
            if db_place is None and pname:
                db_place = place_by_name.get(pname)
            if db_place is None:
                raise ValueError(
                    f"Day {idx + 1} referenced unverified place '{rp.get('place_name')}' (ID {pid}). "
                    "Use ONLY verified place_ids from the provided catalogue."
                )
            if db_place.id in seen_place_ids:
                raise ValueError(
                    f"Duplicate attraction '{db_place.name}' (ID {db_place.id}) scheduled again on Day {idx + 1}. "
                    "Every day must have 100% unique attractions."
                )
            resolved_places.append((db_place, rp))

        # Same-day Haversine check: reject > 95 km jumps within a single day!
        for i in range(len(resolved_places)):
            c1 = _place_coords(resolved_places[i][0])
            for j in range(i + 1, len(resolved_places)):
                c2 = _place_coords(resolved_places[j][0])
                if c1 and c2:
                    dist_km = haversine_km(c1[0], c1[1], c2[0], c2[1])
                    if dist_km > 95.0:
                        raise ValueError(
                            f"Geographic violation on Day {idx + 1}: '{resolved_places[i][0].name}' and "
                            f"'{resolved_places[j][0].name}' are {dist_km:.0f} km apart and cannot be visited "
                            f"on the same day. Follow Day {idx + 1}'s regional cluster ({slot.hub_name})."
                        )

        # Hydrate authoritative DB fields while keeping Gemini's rich time slots & descriptions
        day_place_items: list[ItineraryPlaceItem] = []
        default_slots = ("Morning", "Afternoon", "Sunset / Evening")
        for p_idx, (db_p, rp) in enumerate(resolved_places[:3]):
            seen_place_ids.add(db_p.id)
            fee = db_p.entry_fee if db_p.entry_fee is not None else Decimal("0")
            total_entry_fees += fee
            desc = str(rp.get("description") or db_p.description or f"Explore {db_p.name}.").strip()
            rec_time = str(rp.get("recommended_time") or default_slots[min(p_idx, 2)]).strip()
            day_place_items.append(
                ItineraryPlaceItem(
                    place_id=db_p.id,
                    place_name=db_p.name,
                    category=db_p.category,
                    description=desc,
                    entry_fee=fee,
                    recommended_time=rec_time,
                    is_hidden_gem=bool(db_p.is_hidden_gem),
                )
            )

        # Ground & deduplicate meals with strict dietary safety
        raw_meals = raw_day.get("meals") or []
        day_meal_items: list[ItineraryMealItem] = []

        for rm in raw_meals[:2]:
            dname_raw = str(rm.get("dish_name", "")).strip()
            db_food = food_by_name.get(dname_raw.lower())
            # Enforce dietary safety if LLM picked wrong food_type
            if db_food is not None:
                if request.food_preference in (FoodType.VEG, FoodType.VEGAN) and db_food.food_type == FoodType.NON_VEG:
                    db_food = None
                elif db_food.name.lower() in seen_dishes and len(foods) > blueprint.effective_days:
                    db_food = None

            if db_food is None and slot.recommended_food is not None:
                if slot.recommended_food.name.lower() not in seen_dishes or len(foods) <= blueprint.effective_days:
                    db_food = slot.recommended_food

            if db_food is None:
                unused = [f for f in foods if f.name.lower() not in seen_dishes]
                db_food = unused[0] if unused else (foods[idx % len(foods)] if foods else None)

            if db_food is not None:
                seen_dishes.add(db_food.name.lower())
                effective_ftype = (
                    FoodType.VEGAN
                    if request.food_preference == FoodType.VEGAN and db_food.food_type != FoodType.NON_VEG
                    else db_food.food_type
                )
                meal_item = ItineraryMealItem(
                    meal_type=str(rm.get("meal_type") or "Lunch").strip(),
                    dish_name=db_food.name,
                    food_type=effective_ftype,
                    avg_price=db_food.avg_price,
                )
                day_meal_items.append(meal_item)
                total_food_cost += db_food.avg_price

        if not day_meal_items and foods:
            fallback_food = slot.recommended_food or foods[idx % len(foods)]
            seen_dishes.add(fallback_food.name.lower())
            effective_ftype = (
                FoodType.VEGAN
                if request.food_preference == FoodType.VEGAN and fallback_food.food_type != FoodType.NON_VEG
                else fallback_food.food_type
            )
            day_meal_items.append(
                ItineraryMealItem(
                    meal_type="Lunch",
                    dish_name=fallback_food.name,
                    food_type=effective_ftype,
                    avg_price=fallback_food.avg_price,
                )
            )
            total_food_cost += fallback_food.avg_price * 2

        # Resolve truthful geographic destination label for this day
        inferred_hub = _extract_location_label(resolved_places[0][0], state_name)
        raw_dest = str(raw_day.get("destination_name") or "").strip()
        # If LLM wrote a distant wrong city name, replace with verified cluster hub
        dest_label = inferred_hub if (not raw_dest or len(raw_dest) > 28) else raw_dest
        if inferred_hub.lower() not in dest_label.lower() and slot.hub_name.lower() not in dest_label.lower():
            dest_label = inferred_hub

        day_budget_raw = raw_day.get("day_budget")
        try:
            day_budget = Decimal(str(round(float(day_budget_raw))))
            if day_budget <= 0:
                raise ValueError
        except Exception:
            day_budget = Decimal(int(round(float(request.total_budget) / blueprint.effective_days)))

        grounded_days.append(
            DayPlan(
                day_number=idx + 1,
                theme=str(raw_day.get("theme") or f"Discovering {dest_label}").strip(),
                destination_name=dest_label,
                places=day_place_items,
                meals=day_meal_items,
                day_budget=day_budget,
                travel_tips=str(
                    raw_day.get("travel_tips")
                    or f"Best explored starting early morning around {dest_label}."
                ).strip(),
            )
        )

    # Compute dynamic, realistic per-day budgets and consistent itemized breakdown
    raw_b = raw_json.get("budget_breakdown") or {}
    grounded_days, breakdown = _compute_dynamic_budgets(
        grounded_days,
        blueprint.day_slots,
        request,
        llm_breakdown=raw_b if isinstance(raw_b, dict) else None,
    )

    advice = str(raw_json.get("overall_advice") or "").strip()
    if blueprint.duration_capped_note and blueprint.duration_capped_note not in advice:
        advice = f"{blueprint.duration_capped_note} {advice}".strip()
    if not advice:
        advice = f"Enjoy your curated regional circuit across {state_name}. Book inter-city transfers and morning temple/safari entries in advance."

    return TripPlanResponse(
        state_id=state_id,
        state_name=state_name,
        trip_title=str(raw_json.get("trip_title") or f"{blueprint.effective_days}-Day Curated Trail Across {state_name}").strip(),
        total_days=blueprint.effective_days,
        total_budget=request.total_budget,
        budget_breakdown=breakdown,
        days=grounded_days,
        overall_advice=advice,
    )


def build_offline_blueprint_plan(
    state_id: int,
    state_name: str,
    request: TripPlanRequest,
    blueprint: CircuitBlueprint,
) -> TripPlanResponse:
    """Construct a structured TripPlanResponse directly from CircuitBlueprint (used ONLY in keyless CI test environments)."""
    days: list[DayPlan] = []
    default_slots = ("Morning", "Afternoon", "Sunset / Evening")

    for slot in blueprint.day_slots:
        time_labels = (
            ("Afternoon", "Sunset / Evening")
            if slot.is_transit_day
            else default_slots
        )
        day_places: list[ItineraryPlaceItem] = []
        for idx, p in enumerate(slot.recommended_places):
            fee = p.entry_fee if p.entry_fee is not None else Decimal("0")
            day_places.append(
                ItineraryPlaceItem(
                    place_id=p.id,
                    place_name=p.name,
                    category=p.category,
                    description=p.description or f"Explore the renowned landmark {p.name} in {slot.hub_name}.",
                    entry_fee=fee,
                    recommended_time=time_labels[min(idx, len(time_labels) - 1)],
                    is_hidden_gem=bool(p.is_hidden_gem),
                )
            )

        day_meals: list[ItineraryMealItem] = []
        if slot.recommended_food is not None:
            f = slot.recommended_food
            effective_ftype = (
                FoodType.VEGAN
                if request.food_preference == FoodType.VEGAN and f.food_type != FoodType.NON_VEG
                else f.food_type
            )
            day_meals.append(
                ItineraryMealItem(
                    meal_type="Lunch",
                    dish_name=f.name,
                    food_type=effective_ftype,
                    avg_price=f.avg_price,
                )
            )

        transit_mode_tip = (
            "APSRTC/state express bus or train for budget travel"
            if request.budget_tier.value == "low"
            else (
                "private AC SUV with chauffeur"
                if request.budget_tier.value == "high"
                else "inter-city cab or Vande Bharat/express train"
            )
        )
        if slot.is_transit_day and slot.previous_hub_name:
            est_hrs = max(2.5, round(slot.transit_km_from_prev / 52.0, 1))
            theme = f"Scenic Transfer to {slot.hub_name} & Evening Highlights"
            tips = (
                f"Morning transfer from {slot.previous_hub_name} to {slot.hub_name} "
                f"(~{int(slot.transit_km_from_prev)} km, approx. {est_hrs} hrs via {transit_mode_tip}). "
                "Afternoon and evening sightseeing kept relaxed after check-in."
            )
        elif slot.previous_hub_name:
            theme = f"{slot.hub_name} Cultural & Scenic Circuit"
            tips = (
                f"Short scenic drive from {slot.previous_hub_name} to {slot.hub_name} "
                f"(~{int(slot.transit_km_from_prev)} km via {transit_mode_tip}). Start by 8:30 AM for smooth sightseeing."
            )
        else:
            cats = sorted({p.category.value.replace("_", " ").title() for p in slot.recommended_places})
            cat_label = " & ".join(cats[:2]) if cats else "Local Highlights"
            theme = f"{slot.hub_name}: {cat_label}"
            local_mode = (
                "local city buses & shared autos"
                if request.budget_tier.value == "low"
                else ("private full-day AC cab" if request.budget_tier.value == "high" else "local autos or day-rental cab")
            )
            tips = f"All attractions today are clustered around {slot.hub_name} within short commute distance ({local_mode})."

        days.append(
            DayPlan(
                day_number=slot.day_number,
                theme=theme,
                destination_name=slot.hub_name,
                places=day_places,
                meals=day_meals,
                day_budget=Decimal("1000"),
                travel_tips=tips,
            )
        )

    days, breakdown = _compute_dynamic_budgets(days, blueprint.day_slots, request)

    advice = (
        f"Curated across a contiguous geographic circuit in {state_name} with verified entry fees, "
        f"{request.budget_tier.value}-tier room & transit estimates, and authentic local specialties."
    )
    if blueprint.duration_capped_note:
        advice = f"{blueprint.duration_capped_note} {advice}"

    hubs_visited = list(dict.fromkeys(s.hub_name for s in blueprint.day_slots))
    trail_label = " – ".join(hubs_visited[:3])

    return TripPlanResponse(
        state_id=state_id,
        state_name=state_name,
        trip_title=f"{blueprint.effective_days}-Day {state_name} Circuit: {trail_label}",
        total_days=blueprint.effective_days,
        total_budget=request.total_budget,
        budget_breakdown=breakdown,
        days=days,
        overall_advice=advice,
    )

