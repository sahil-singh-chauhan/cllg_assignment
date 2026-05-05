"""
Projects router — CRUD for Projects with RBAC.

Endpoints:
  POST /api/projects        -- Create a project (Admin only).
  GET  /api/projects        -- List projects.
                               Admin → all projects.
                               Member → only projects where they have assigned tasks.
"""

from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.models import Project, Task, User, UserRole
from app.schemas import ProjectCreate, ProjectResponse

router = APIRouter(prefix="/api/projects", tags=["Projects"])


# ---------------------------------------------------------------------------
# POST /api/projects  — Admin only
# ---------------------------------------------------------------------------

@router.post(
    "",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new project (Admin only)",
)
async def create_project(
    payload: ProjectCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_admin)],
) -> ProjectResponse:
    """
    Create a new project.

    - The authenticated admin becomes the **owner** of the project.
    - Returns **403** for non-admin users.
    """
    project = Project(
        name=payload.name,
        description=payload.description,
        owner_id=current_user.id,
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


# ---------------------------------------------------------------------------
# GET /api/projects  — Admin sees all; Member sees only their projects
# ---------------------------------------------------------------------------

@router.get(
    "",
    response_model=List[ProjectResponse],
    status_code=status.HTTP_200_OK,
    summary="List projects (filtered by role)",
)
async def list_projects(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> List[ProjectResponse]:
    """
    Return a list of projects visible to the current user.

    - **Admin**: returns every project in the system.
    - **Member**: returns only projects where this member has at least one
      assigned task (i.e. projects the member is actually involved in).
    """
    if current_user.role == UserRole.ADMIN:
        # Admins see everything
        result = await db.execute(select(Project))
        return result.scalars().all()

    # Members: find project_ids from their assigned tasks
    task_result = await db.execute(
        select(Task.project_id)
        .where(Task.assignee_id == current_user.id)
        .distinct()
    )
    project_ids = task_result.scalars().all()

    if not project_ids:
        return []

    project_result = await db.execute(
        select(Project).where(Project.id.in_(project_ids))
    )
    return project_result.scalars().all()
