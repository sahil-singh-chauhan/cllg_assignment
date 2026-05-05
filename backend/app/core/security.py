"""
Security utilities: password hashing and JWT token operations.

Uses:
  - passlib (bcrypt) for password hashing
  - python-jose for JWT creation and validation
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY: str = os.getenv("SECRET_KEY", "")
ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is not set.")

# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """Return a bcrypt hash of the given plain-text password."""
    return _pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Return True if *plain_password* matches *hashed_password*.
    Uses a constant-time comparison to prevent timing attacks.
    """
    return _pwd_context.verify(plain_password, hashed_password)


# ---------------------------------------------------------------------------
# JWT operations
# ---------------------------------------------------------------------------

def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    """
    Create and return a signed JWT access token.

    Args:
        data:          Payload dict to encode (must include "sub" claim).
        expires_delta: Optional custom expiry. Falls back to ACCESS_TOKEN_EXPIRE_MINUTES.

    Returns:
        Encoded JWT string.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """
    Decode and verify a JWT access token.

    Args:
        token: The raw JWT string from the Authorization header.

    Returns:
        The decoded payload dict.

    Raises:
        JWTError: If the token is invalid, expired, or tampered with.
    """
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
