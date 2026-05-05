"""
Auth router — handles user registration and login.

Endpoints:
  POST /api/auth/signup  -- Create a new user account.
  POST /api/auth/login   -- Authenticate and receive a JWT.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import LoginRequest, SignupRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


# ---------------------------------------------------------------------------
# POST /api/auth/signup
# ---------------------------------------------------------------------------

@router.post(
    "/signup",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def signup(
    payload: SignupRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserResponse:
    """
    Register a new user account.

    - Rejects duplicate e-mails with **409 Conflict**.
    - Stores a bcrypt hash of the password — the plain-text is never persisted.
    - The caller may specify `role` as `ADMIN` or `MEMBER` (defaults to `MEMBER`).
    """
    # Check for duplicate email
    result = await db.execute(select(User).where(User.email == payload.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A user with email '{payload.email}' already exists.",
        )

    new_user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user


# ---------------------------------------------------------------------------
# POST /api/auth/login
# ---------------------------------------------------------------------------

@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate and receive a JWT",
)
async def login(
    payload: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse:
    """
    Authenticate with email + password.

    On success returns:
    ```json
    {
      "access_token": "<jwt>",
      "token_type": "bearer",
      "user": { "id": 1, "name": "Alice", "email": "...", "role": "MEMBER" }
    }
    ```

    The JWT payload contains:
    - `sub`: user id (as string)
    - `role`: user role string
    - `exp`: expiry timestamp
    """
    # Look up user by email
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    # Use the same generic error for both "not found" and "wrong password"
    # to prevent user-enumeration attacks.
    invalid_credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if user is None or not verify_password(payload.password, user.password_hash):
        raise invalid_credentials_exception

    token = create_access_token(data={"sub": str(user.id), "role": user.role.value})

    return TokenResponse(access_token=token, user=user)


# ---------------------------------------------------------------------------
# GET /api/auth/me  (convenience — useful for frontend token validation)
# ---------------------------------------------------------------------------

@router.get(
    "/me",
    response_model=UserResponse,
    summary="Return the currently authenticated user",
)
async def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
) -> UserResponse:
    """Return the profile of the user identified by the Bearer token."""
    return current_user
