"""Import every model so ``Base.metadata`` is complete for Alembic and the ORM."""

from app.models.base import Base
from app.models.chat_message import ChatMessage
from app.models.destination import Destination
from app.models.destination_cost_tier import DestinationCostTier
from app.models.eatery import Eatery
from app.models.food import Food
from app.models.llm_usage import LlmUsage
from app.models.place import Place
from app.models.saved_plan import SavedPlan
from app.models.state import State
from app.models.user import User

__all__ = [
    "Base",
    "ChatMessage",
    "Destination",
    "DestinationCostTier",
    "Eatery",
    "Food",
    "LlmUsage",
    "Place",
    "SavedPlan",
    "State",
    "User",
]
