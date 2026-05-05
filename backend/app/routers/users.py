"""
Users router — admin utility endpoints.

Endpoints:
  GET /api/users  -- List all users (Admin only; used for task-assignee dropdowns).
"""

from typing import Annotated, List

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_admin
from app.models import User
from app.schemas import UserResponse

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get(
    "",
    response_model=List[UserResponse],
    summary="List all users (Admin only)",
)
async def list_users(
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[User, Depends(require_admin)],
) -> List[UserResponse]:
    """Return every registered user. Used by the frontend to populate assignee dropdowns."""
    result = await db.execute(select(User))
    return result.scalars().all()
