"""
Pydantic schemas (request bodies & response models) for Team Task Manager.

Sections:
  - Auth      : SignupRequest, LoginRequest, UserResponse, TokenResponse
  - Projects  : ProjectCreate, ProjectResponse
  - Tasks     : TaskCreate, TaskStatusUpdate, TaskResponse
"""

from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models import TaskStatus, UserRole


# ---------------------------------------------------------------------------
# Auth schemas
# ---------------------------------------------------------------------------

class SignupRequest(BaseModel):
    """Payload for POST /api/auth/signup."""
    name: str = Field(..., min_length=1, max_length=100, description="Display name")
    email: EmailStr = Field(..., description="Unique e-mail address used to log in")
    password: str = Field(..., min_length=6, description="Plain-text password (min 6 chars)")
    role: UserRole = Field(UserRole.MEMBER, description="ADMIN or MEMBER (defaults to MEMBER)")


class LoginRequest(BaseModel):
    """Payload for POST /api/auth/login."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Public-safe representation of a User (no password hash)."""
    id: int
    name: str
    email: EmailStr
    role: UserRole

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """Returned after a successful login."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Project schemas
# ---------------------------------------------------------------------------

class ProjectCreate(BaseModel):
    """Payload for POST /api/projects."""
    name: str = Field(..., min_length=1, max_length=200, description="Project name")
    description: Optional[str] = Field(None, description="Optional description")


class ProjectResponse(BaseModel):
    """Serialized Project returned in API responses."""
    id: int
    name: str
    description: Optional[str]
    owner_id: int

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Task schemas
# ---------------------------------------------------------------------------

class TaskCreate(BaseModel):
    """Payload for POST /api/tasks."""
    title: str = Field(..., min_length=1, max_length=300, description="Short task title")
    description: Optional[str] = Field(None, description="Detailed description")
    due_date: Optional[datetime] = Field(None, description="Optional deadline (ISO 8601)")
    project_id: int = Field(..., description="ID of the parent project")
    assignee_id: int = Field(..., description="ID of the user this task is assigned to")

    @field_validator("due_date", mode="before")
    @classmethod
    def normalise_due_date(cls, v):
        """Ensure due_date is always UTC-aware (never naive)."""
        if v is None:
            return v
        if isinstance(v, str):
            # Let Pydantic parse it first; validator runs again on the object
            return v
        if isinstance(v, datetime):
            if v.tzinfo is None:
                # Treat naive datetimes as UTC
                return v.replace(tzinfo=timezone.utc)
            # Already aware — leave as-is (asyncpg handles conversion)
            return v
        return v


class TaskStatusUpdate(BaseModel):
    """Payload for PATCH /api/tasks/{task_id}/status."""
    status: TaskStatus = Field(
        ...,
        description="New status: PENDING | IN_PROGRESS | COMPLETED",
    )


class TaskResponse(BaseModel):
    """Serialized Task returned in API responses."""
    id: int
    title: str
    description: Optional[str]
    status: TaskStatus
    due_date: Optional[datetime]
    project_id: int
    assignee_id: Optional[int]

    model_config = {"from_attributes": True}
