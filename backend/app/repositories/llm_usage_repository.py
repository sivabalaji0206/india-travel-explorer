"""Repository for tracking daily LLM usage and enforcing rate/cost limits."""

from datetime import date

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.models.llm_usage import LlmUsage


class LlmUsageRepository:
    """Encapsulates usage tracking and daily budget limits."""

    def get_daily_usage(self, db: Session, user_id: int, usage_date: date) -> LlmUsage | None:
        """Fetch usage row for a user on a given date."""
        stmt = select(LlmUsage).where(
            LlmUsage.user_id == user_id,
            LlmUsage.usage_date == usage_date,
        )
        return db.execute(stmt).scalar_one_or_none()

    def record_usage(
        self,
        db: Session,
        *,
        user_id: int,
        usage_date: date,
        prompt_tokens: int = 0,
        completion_tokens: int = 0,
    ) -> LlmUsage:
        """Increment daily request count and tokens consumed."""
        stmt = (
            insert(LlmUsage)
            .values(
                user_id=user_id,
                usage_date=usage_date,
                request_count=1,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
            )
            .on_conflict_do_update(
                index_elements=["user_id", "usage_date"],
                set_={
                    "request_count": LlmUsage.request_count + 1,
                    "prompt_tokens": LlmUsage.prompt_tokens + prompt_tokens,
                    "completion_tokens": LlmUsage.completion_tokens + completion_tokens,
                },
            )
            .returning(LlmUsage)
        )
        result = db.execute(stmt).scalar_one()
        db.commit()
        return result

    def has_exceeded_limit(
        self,
        db: Session,
        user_id: int,
        usage_date: date,
        daily_limit: int,
    ) -> bool:
        """Check if user has reached their maximum allowed requests for the day."""
        usage = self.get_daily_usage(db, user_id, usage_date)
        if not usage:
            return False
        return usage.request_count >= daily_limit
