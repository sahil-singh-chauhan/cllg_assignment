"""
FastAPI reusable dependencies for route protection and RBAC.

Exported:
  get_current_user  -- Validates the Bearer JWT; returns the User ORM object.
  require_admin     -- Wraps get_current_user; raises 403 if role is not ADMIN.
"""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.database import get_db
from app.models import User, UserRole

# FastAPI security scheme — extracts the Bearer token from the Authorization header.
_bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(_bearer_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """
    Dependency: validate the JWT and return the corresponding User from the DB.

    Raises:
        401 UNAUTHORIZED  -- token missing, malformed, expired, or user not found.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_access_token(credentials.credentials)
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    return user


async def require_admin(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """
    Dependency: ensure the authenticated user holds the ADMIN role.

    Raises:
        403 FORBIDDEN -- user is authenticated but has MEMBER role.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required to access this resource.",
        )
    return current_user
