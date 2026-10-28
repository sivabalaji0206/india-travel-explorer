"""API v1 routers aggregate."""

from fastapi import APIRouter

from app.api.v1.destinations import router as destinations_router
from app.api.v1.foods import router as foods_router
from app.api.v1.health import router as health_router
from app.api.v1.places import router as places_router
from app.api.v1.states import router as states_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(states_router)
api_router.include_router(destinations_router)
api_router.include_router(places_router)
api_router.include_router(foods_router)

__all__ = ["api_router"]
