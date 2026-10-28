"""Domain and application exceptions with structured error details."""


class AppException(Exception):
    """Base exception for all application errors."""

    def __init__(
        self,
        message: str,
        *,
        status_code: int = 500,
        code: str = "INTERNAL_ERROR",
        details: dict[str, object] | list[object] | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.code = code
        self.details = details


class EntityNotFoundError(AppException):
    """Raised when a requested resource does not exist in the database."""

    def __init__(self, entity_name: str, identifier: object) -> None:
        super().__init__(
            message=f"{entity_name} with identifier '{identifier}' not found.",
            status_code=404,
            code="ENTITY_NOT_FOUND",
            details={"entity": entity_name, "identifier": str(identifier)},
        )


class BadRequestError(AppException):
    """Raised when incoming client parameters or request bodies violate business rules."""

    def __init__(
        self, message: str, *, details: dict[str, object] | list[object] | None = None
    ) -> None:
        super().__init__(
            message=message,
            status_code=400,
            code="BAD_REQUEST",
            details=details,
        )


class ConflictError(AppException):
    """Raised when a unique constraint or resource state conflicts."""

    def __init__(
        self, message: str, *, details: dict[str, object] | list[object] | None = None
    ) -> None:
        super().__init__(
            message=message,
            status_code=409,
            code="CONFLICT",
            details=details,
        )
