"""
SQLAlchemy ORM Models for Team Task Manager.

Models:
  - User:    Stores authentication credentials and role.
  - Project: A container for tasks, owned by a User.
  - Task:    A unit of work belonging to a Project, assigned to a User.
"""

import enum
from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    Enum as SAEnum,
)
from sqlalchemy.orm import relationship

from app.database import Base


# ---------------------------------------------------------------------------
# Enumerations
# ---------------------------------------------------------------------------

class UserRole(str, enum.Enum):
    """Roles that a User can hold within the system."""
    ADMIN = "ADMIN"
    MEMBER = "MEMBER"


class TaskStatus(str, enum.Enum):
    """Lifecycle states of a Task."""
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class User(Base):
    """
    Represents an authenticated user of the application.

    Columns:
        id            -- Primary key.
        name          -- Display name of the user.
        email         -- Unique login identifier.
        password_hash -- Bcrypt hash of the user's password (never plaintext).
        role          -- Either ADMIN or MEMBER.

    Relationships:
        owned_projects -- Projects where this user is the owner.
        assigned_tasks -- Tasks assigned to this user.
    """
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(100), nullable=False)
    email         = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role          = Column(SAEnum(UserRole), nullable=False, default=UserRole.MEMBER)

    # Relationships
    owned_projects = relationship(
        "Project",
        back_populates="owner",
        foreign_keys="Project.owner_id",
        cascade="all, delete-orphan",
    )
    assigned_tasks = relationship(
        "Task",
        back_populates="assignee",
        foreign_keys="Task.assignee_id",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r} role={self.role}>"


class Project(Base):
    """
    A project groups related tasks together and is owned by one User.

    Columns:
        id          -- Primary key.
        name        -- Short descriptive name.
        description -- Optional longer description.
        owner_id    -- FK → users.id

    Relationships:
        owner -- The User who created/owns this project.
        tasks -- All tasks that belong to this project.
    """
    __tablename__ = "projects"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    owner_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Relationships
    owner = relationship(
        "User",
        back_populates="owned_projects",
        foreign_keys=[owner_id],
    )
    tasks = relationship(
        "Task",
        back_populates="project",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Project id={self.id} name={self.name!r}>"


class Task(Base):
    """
    A single unit of work within a Project, optionally assigned to a User.

    Columns:
        id          -- Primary key.
        title       -- Short task title.
        description -- Detailed description of work to be done.
        status      -- Current lifecycle state (PENDING / IN_PROGRESS / COMPLETED).
        due_date    -- Optional deadline; tasks past this date are considered overdue.
        project_id  -- FK → projects.id
        assignee_id -- FK → users.id (nullable; task may be unassigned)

    Relationships:
        project  -- The Project this task belongs to.
        assignee -- The User this task is assigned to (if any).
    """
    __tablename__ = "tasks"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    status      = Column(SAEnum(TaskStatus), nullable=False, default=TaskStatus.PENDING)
    due_date    = Column(DateTime(timezone=True), nullable=True)
    project_id  = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    assignee_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    project = relationship(
        "Project",
        back_populates="tasks",
    )
    assignee = relationship(
        "User",
        back_populates="assigned_tasks",
        foreign_keys=[assignee_id],
    )

    def __repr__(self) -> str:
        return f"<Task id={self.id} title={self.title!r} status={self.status}>"
