"""Security and cryptographic operations: password hashing and JWT token handling."""

from datetime import UTC, datetime, timedelta
from typing import Any

import bcrypt
import jwt


def hash_password(plain_password: str) -> str:
    """Hash a plaintext password using bcrypt with a random salt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(plain_password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except (ValueError, TypeError):
        return False


def create_access_token(
    data: dict[str, Any],
    *,
    expires_delta: timedelta,
    secret_key: str,
    algorithm: str = "HS256",
) -> str:
    """Encode payload claims into a signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(UTC) + expires_delta
    to_encode.update({"exp": expire, "iat": datetime.now(UTC)})
    return jwt.encode(to_encode, secret_key, algorithm=algorithm)


def decode_access_token(
    token: str,
    *,
    secret_key: str,
    algorithm: str = "HS256",
) -> dict[str, Any]:
    """Decode and verify a signed JWT token, raising jwt exceptions if invalid or expired."""
    return jwt.decode(token, secret_key, algorithms=[algorithm])
