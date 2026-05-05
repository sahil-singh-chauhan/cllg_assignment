"""
Tasks router — CRUD for Tasks with RBAC.

Endpoints:
  POST  /api/tasks                   -- Create a task (Admin only).
  GET   /api/tasks                   -- List tasks.
                                        Admin → all tasks.
                                        Member → only tasks assigned to them.
  PATCH /api/tasks/{task_id}/status  -- Update task status.
                                        Admin → any task.
                                        Member → only their own assigned tasks.
"""

from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.models import Project, Task, User, UserRole
from app.schemas import TaskCreate, TaskResponse, TaskStatusUpdate

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


# ---------------------------------------------------------------------------
# POST /api/tasks  — Admin only
# ---------------------------------------------------------------------------

@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task (Admin only)",
)
async def create_task(
    payload: TaskCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_admin)],
) -> TaskResponse:
    """
    Create a new task inside an existing project and assign it to a user.

    - **project_id** must reference an existing project (returns 404 otherwise).
    - **assignee_id** must reference an existing user (returns 404 otherwise).
    - Returns **403** for non-admin users.
    """
    # Validate project exists
    project_result = await db.execute(
        select(Project).where(Project.id == payload.project_id)
    )
    if project_result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id={payload.project_id} does not exist.",
        )

    # Validate assignee exists
    assignee_result = await db.execute(
        select(User).where(User.id == payload.assignee_id)
    )
    if assignee_result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id={payload.assignee_id} does not exist.",
        )

    task = Task(
        title=payload.title,
        description=payload.description,
        due_date=payload.due_date,
        project_id=payload.project_id,
        assignee_id=payload.assignee_id,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


# ---------------------------------------------------------------------------
# GET /api/tasks  — Admin sees all; Member sees only their assigned tasks
# ---------------------------------------------------------------------------

@router.get(
    "",
    response_model=List[TaskResponse],
    status_code=status.HTTP_200_OK,
    summary="List tasks (filtered by role)",
)
async def list_tasks(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> List[TaskResponse]:
    """
    Return a list of tasks visible to the current user.

    - **Admin**: returns all tasks in the system.
    - **Member**: returns only tasks where `assignee_id` matches their `user_id`.
    """
    if current_user.role == UserRole.ADMIN:
        result = await db.execute(select(Task))
        return result.scalars().all()

    result = await db.execute(
        select(Task).where(Task.assignee_id == current_user.id)
    )
    return result.scalars().all()


# ---------------------------------------------------------------------------
# PATCH /api/tasks/{task_id}/status  — Admin any task; Member only own tasks
# ---------------------------------------------------------------------------

@router.patch(
    "/{task_id}/status",
    response_model=TaskResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a task's status",
)
async def update_task_status(
    task_id: int,
    payload: TaskStatusUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> TaskResponse:
    """
    Update the status of a task.

    Allowed values for `status`: `PENDING`, `IN_PROGRESS`, `COMPLETED`.

    **RBAC rules:**
    - **Admin**: may update any task.
    - **Member**: may only update tasks that are assigned to them.
      Returns **403** if they attempt to update another user's task.

    Returns **404** if the task does not exist.
    """
    # Fetch the task
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id={task_id} does not exist.",
        )

    # Enforce member-level ownership check
    if current_user.role == UserRole.MEMBER and task.assignee_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to update a task that is not assigned to you.",
        )

    task.status = payload.status
    await db.commit()
    await db.refresh(task)
    return task
