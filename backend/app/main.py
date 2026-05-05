"""
FastAPI application entry point for Team Task Manager.

On startup, this module:
  1. Imports all models so SQLAlchemy is aware of them.
  2. Runs create_all against the database engine to materialise any missing tables.

Routers registered here:
  - /api/auth      (Phase 2) -- signup, login, /me
  - /api/projects  (Phase 3) -- create & list projects (RBAC)
  - /api/tasks     (Phase 3) -- create, list, update-status (RBAC)
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base

# Import models so that Base.metadata is populated before create_all is called.
import app.models  # noqa: F401

# Routers
from app.routers import auth as auth_router
from app.routers import projects as projects_router
from app.routers import tasks as tasks_router
from app.routers import users as users_router


# ---------------------------------------------------------------------------
# Lifespan: runs once on startup and once on shutdown
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup (safe – skips existing tables)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[OK] Database tables verified / created successfully.")
    yield
    # Shutdown: dispose engine connections
    await engine.dispose()
    print("[--] Database engine disposed.")


# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Team Task Manager API",
    description=(
        "Backend API for the Team Task Manager application. "
        "Handles authentication, projects, tasks, and role-based access control."
    ),
    version="1.1.0",
    lifespan=lifespan,
    redirect_slashes=False,   # Prevents 307 redirects that bypass the Vite dev proxy
)

# Allow frontend dev server (and future Vercel domain) to call the API.
# Vite may bind to 5173, 5174, or 5175 depending on which port is free.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://task-manager-system-assignment.vercel.app",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",

    ],  # Update with Vercel URL after deploy
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Register routers
# ---------------------------------------------------------------------------

app.include_router(auth_router.router)
app.include_router(projects_router.router)
app.include_router(tasks_router.router)
app.include_router(users_router.router)


# ---------------------------------------------------------------------------
# Health-check endpoints
# ---------------------------------------------------------------------------

@app.get("/", tags=["Health"])
async def root():
    """Simple health-check endpoint."""
    return {"status": "ok", "message": "Team Task Manager API is running."}


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health-check for deployment platform uptime checks."""
    return {"status": "healthy", "version": "1.1.0"}
