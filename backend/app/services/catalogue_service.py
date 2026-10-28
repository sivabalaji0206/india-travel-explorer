"""Catalogue service orchestrating state, destination, place, and food business logic."""

from sqlalchemy.orm import Session

from app.core.enums import BudgetLevel, FoodType, PlaceCategory, Season
from app.core.exceptions import EntityNotFoundError
from app.repositories.destination_repository import DestinationRepository
from app.repositories.eatery_repository import EateryRepository
from app.repositories.food_repository import FoodRepository
from app.repositories.place_repository import PlaceRepository
from app.repositories.state_repository import StateRepository
from app.schemas.common import PageMeta, PaginatedResponse
from app.schemas.destination import (
    DestinationCostTierResponse,
    DestinationDetailResponse,
    DestinationSummaryResponse,
)
from app.schemas.eatery import EateryResponse
from app.schemas.food import FoodResponse
from app.schemas.place import PlaceDetailResponse, PlaceSummaryResponse
from app.schemas.state import StateResponse


class CatalogueService:
    """Business logic for querying states, destinations, places, eateries and foods."""

    def __init__(
        self,
        state_repo: StateRepository | None = None,
        destination_repo: DestinationRepository | None = None,
        place_repo: PlaceRepository | None = None,
        food_repo: FoodRepository | None = None,
        eatery_repo: EateryRepository | None = None,
    ) -> None:
        self.state_repo = state_repo or StateRepository()
        self.destination_repo = destination_repo or DestinationRepository()
        self.place_repo = place_repo or PlaceRepository()
        self.food_repo = food_repo or FoodRepository()
        self.eatery_repo = eatery_repo or EateryRepository()

    def list_states(self, db: Session, *, region: str | None = None) -> list[StateResponse]:
        """Return all Indian states with aggregated place and destination counts."""
        states = self.state_repo.list_states_with_counts(db, region=region)
        return [StateResponse.model_validate(s) for s in states]

    def get_state(self, db: Session, state_id: int) -> StateResponse:
        """Return state details by ID or raise EntityNotFoundError."""
        state = self.state_repo.get_state_with_counts(db, state_id)
        if not state:
            raise EntityNotFoundError("State", state_id)
        return StateResponse.model_validate(state)

    def list_destinations(
        self,
        db: Session,
        *,
        state_id: int | None = None,
        search: str | None = None,
        trip_type: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedResponse[DestinationSummaryResponse]:
        """Return paginated destinations matching filters."""
        if state_id is not None and not self.state_repo.get_state_by_id(db, state_id):
            raise EntityNotFoundError("State", state_id)

        offset = (page - 1) * page_size
        items_data, total_items = self.destination_repo.list_destinations(
            db,
            state_id=state_id,
            search=search,
            trip_type=trip_type,
            limit=page_size,
            offset=offset,
        )

        items = [DestinationSummaryResponse.model_validate(d) for d in items_data]
        meta = PageMeta.create(page=page, page_size=page_size, total_items=total_items)
        return PaginatedResponse[DestinationSummaryResponse](items=items, meta=meta)

    def get_destination(self, db: Session, destination_id: int) -> DestinationDetailResponse:
        """Return full destination detail with cost tiers, eateries, and foods."""
        dest = self.destination_repo.get_destination_detail(db, destination_id)
        if not dest:
            raise EntityNotFoundError("Destination", destination_id)

        cost_tiers = [DestinationCostTierResponse.model_validate(ct) for ct in dest.cost_tiers]
        eateries = [EateryResponse.model_validate(e) for e in dest.eateries]
        foods = [
            FoodResponse(
                id=f.id,
                state_id=f.state_id,
                destination_id=f.destination_id,
                destination_name=dest.name,
                name=f.name,
                food_type=f.food_type,
                description=f.description,
                avg_price=f.avg_price,
                price_is_estimated=f.price_is_estimated,
                data_source=f.data_source,
            )
            for f in dest.foods
        ]

        return DestinationDetailResponse(
            id=dest.id,
            state_id=dest.state_id,
            state_name=dest.state.name if dest.state else None,
            name=dest.name,
            district=dest.district,
            latitude=dest.latitude,
            longitude=dest.longitude,
            altitude_m=dest.altitude_m,
            popularity_score=dest.popularity_score,
            best_seasons=dest.best_seasons or [],
            trip_types=dest.trip_types or [],
            min_days=dest.min_days,
            ideal_days=dest.ideal_days,
            max_days=dest.max_days,
            description=dest.description,
            local_culture=dest.local_culture,
            festivals_events=dest.festivals_events,
            suggested_itinerary=dest.suggested_itinerary,
            safety_rating=dest.safety_rating,
            permits_required=dest.permits_required,
            permits_details=dest.permits_details,
            nearest_airport=dest.nearest_airport,
            nearest_railway_station=dest.nearest_railway_station,
            source_last_updated=dest.source_last_updated,
            data_source=dest.data_source,
            cost_tiers=cost_tiers,
            eateries=eateries,
            foods=foods,
        )

    def list_places(
        self,
        db: Session,
        *,
        state_id: int | None = None,
        destination_id: int | None = None,
        category: PlaceCategory | None = None,
        budget_level: BudgetLevel | None = None,
        best_season: Season | None = None,
        search: str | None = None,
        is_hidden_gem: bool | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedResponse[PlaceSummaryResponse]:
        """Return paginated places with state and destination names."""
        if state_id is not None and not self.state_repo.get_state_by_id(db, state_id):
            raise EntityNotFoundError("State", state_id)

        offset = (page - 1) * page_size
        items_data, total_items = self.place_repo.list_places(
            db,
            state_id=state_id,
            destination_id=destination_id,
            category=category,
            budget_level=budget_level,
            best_season=best_season,
            search=search,
            is_hidden_gem=is_hidden_gem,
            limit=page_size,
            offset=offset,
        )

        items = [PlaceSummaryResponse.model_validate(p) for p in items_data]
        meta = PageMeta.create(page=page, page_size=page_size, total_items=total_items)
        return PaginatedResponse[PlaceSummaryResponse](items=items, meta=meta)

    def get_place_detail(self, db: Session, place_id: int) -> PlaceDetailResponse:
        """Return place details enriched with nearby foods, eateries and budget tiers."""
        place = self.place_repo.get_place_by_id(db, place_id)
        if not place:
            raise EntityNotFoundError("Place", place_id)

        dest = place.destination
        nearby_foods_raw = self.food_repo.get_foods_by_destination_id(db, dest.id, limit=6)
        # If destination has few foods, fall back to state level foods
        if len(nearby_foods_raw) < 3:
            state_foods = self.food_repo.get_foods_by_state_id(db, place.state_id, limit=6)
            existing_ids = {f.id for f in nearby_foods_raw}
            for sf in state_foods:
                if sf.id not in existing_ids:
                    nearby_foods_raw.append(sf)

        nearby_foods = [
            FoodResponse(
                id=f.id,
                state_id=f.state_id,
                destination_id=f.destination_id,
                destination_name=f.destination.name if f.destination else dest.name,
                name=f.name,
                food_type=f.food_type,
                description=f.description,
                avg_price=f.avg_price,
                price_is_estimated=f.price_is_estimated,
                data_source=f.data_source,
            )
            for f in nearby_foods_raw
        ]

        nearby_eateries_raw = self.eatery_repo.get_eateries_by_destination_id(db, dest.id, limit=10)
        nearby_eateries = [EateryResponse.model_validate(e) for e in nearby_eateries_raw]

        cost_tiers = (
            [DestinationCostTierResponse.model_validate(ct) for ct in dest.cost_tiers]
            if dest.cost_tiers
            else []
        )

        return PlaceDetailResponse(
            id=place.id,
            state_id=place.state_id,
            state_name=place.state.name,
            destination_id=place.destination_id,
            destination_name=dest.name,
            name=place.name,
            category=place.category,
            description=place.description,
            best_season=place.best_season,
            entry_fee=place.entry_fee,
            avg_daily_cost=place.avg_daily_cost,
            budget_level=place.budget_level,
            latitude=place.latitude,
            longitude=place.longitude,
            image_url=place.image_url,
            is_hidden_gem=place.is_hidden_gem,
            data_source=place.data_source,
            nearby_foods=nearby_foods,
            nearby_eateries=nearby_eateries,
            cost_tiers=cost_tiers,
        )

    def list_foods(
        self,
        db: Session,
        *,
        state_id: int | None = None,
        destination_id: int | None = None,
        food_type: FoodType | None = None,
        search: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedResponse[FoodResponse]:
        """Return paginated food items with destination names."""
        if state_id is not None and not self.state_repo.get_state_by_id(db, state_id):
            raise EntityNotFoundError("State", state_id)

        offset = (page - 1) * page_size
        items_data, total_items = self.food_repo.list_foods(
            db,
            state_id=state_id,
            destination_id=destination_id,
            food_type=food_type,
            search=search,
            limit=page_size,
            offset=offset,
        )

        items = [FoodResponse.model_validate(f) for f in items_data]
        meta = PageMeta.create(page=page, page_size=page_size, total_items=total_items)
        return PaginatedResponse[FoodResponse](items=items, meta=meta)
