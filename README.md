# 📋 Team Task Manager

A full-stack web application where users can create projects, assign tasks to team members, and track progress — with role-based access control separating **Admins** from **Members**.

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| **Frontend** | https://task-manager-system-assignment.vercel.app |
| **Backend API** | https://task-manager-system-assignment.onrender.com/api |
| **API Docs** | https://task-manager-system-assignment.onrender.com/docs |

> **Note on first load:** The backend is hosted on Render's free tier, which spins down after inactivity. The first request after a period of idle may take 20–30 seconds to wake up. A banner in the UI will notify you while this happens. A cron-based ping service runs every 10 minutes to minimise downtime.

---

## 🏗️ Architecture

```
┌─────────────────────┐        ┌──────────────────────────┐        ┌──────────────────┐
│   Frontend (React)  │  REST  │   Backend (FastAPI)       │  SQL   │  Database        │
│   Hosted on Vercel  │ ──────▶│   Hosted on Render        │ ──────▶│  PostgreSQL       │
│                     │        │                           │        │  Hosted on        │
└─────────────────────┘        └──────────────────────────┘        │  Supabase        │
                                                                    └──────────────────┘
```

This three-service split was deliberately chosen so **all three tiers remain 100% free** for reviewers to access:

- **Vercel** — free, globally distributed CDN for the React SPA
- **Render** — free tier for the FastAPI Python backend
- **Supabase** — free managed PostgreSQL with automatic backups and SSL

> **Deployment note:** The assignment brief specified Railway for deployment. However, Railway's free one-time credits were already exhausted from a prior project. The architecture above achieves the same result (fully deployed, live, and functional) using equivalent free-tier services.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client with JWT interceptors |
| **Tailwind CSS** | Utility-first styling |

### Backend
| Technology | Purpose |
|---|---|
| **Python 3.11** | Language |
| **FastAPI** | REST API framework |
| **SQLAlchemy 2 (async)** | ORM with async support |
| **asyncpg** | Async PostgreSQL driver |
| **Pydantic v2** | Request/response validation |
| **python-jose** | JWT creation & verification |
| **passlib + bcrypt** | Password hashing |
| **Uvicorn** | ASGI server |

### Database
| Technology | Purpose |
|---|---|
| **PostgreSQL** | Relational database |
| **Supabase** | Managed PostgreSQL hosting |

---

## 🐍 Why Python / FastAPI?

The assignment did not mandate a specific backend language. Python with FastAPI was chosen for the following reasons:

- **Proficiency** — Python is my primary language; I have significantly more experience with it than with Node.js / Express.js.
- **Async performance** — FastAPI is built on Starlette + asyncio, offering non-blocking I/O comparable to Node.js without sacrificing readability.
- **Automatic API docs** — FastAPI auto-generates interactive Swagger UI (`/docs`) and ReDoc (`/redoc`) from type annotations — zero extra work.
- **Type safety** — Pydantic v2 provides runtime validation, serialization, and clear error messages out of the box.
- **Concise code** — A route with validation, auth dependency, and DB access typically requires ~10 lines vs. significantly more boilerplate in Express.
- **Industry adoption** — FastAPI is widely used in production (Uber, Netflix, Microsoft) and is the most starred Python web framework on GitHub.

---

## ✅ Features

- **Authentication** — JWT-based signup & login
- **Role-Based Access Control** — Admin and Member roles with different permissions
- **Projects** — Create and manage projects (Admin only)
- **Tasks** — Create, assign, and update task status (`Pending → In Progress → Done`)
- **Dashboard** — Overview of all tasks with status and overdue tracking
- **Overdue Detection** — Tasks past their due date are flagged automatically

---

## 🔑 Test Credentials

Use these pre-created accounts to review the app without signing up.

### Admin Accounts
| Name | Email | Password | Role |
|---|---|---|---|
| Admin Tester | `admin@test.com` | `Password123!` | ADMIN |
| admin2 | `admin2@test.com` | `Password123!` | ADMIN |

### Member Accounts
| Name | Email | Password | Role |
|---|---|---|---|
| Member Tester | `member@test.com` | `Password123!` | MEMBER |
| member2 | `member2@test.com` | `Password123!` | MEMBER |

> **Admin vs Member:** Admins can create projects and tasks and assign them to members. Members can view their assigned tasks and update task status.

---

## 🚀 Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- A PostgreSQL database (or use the Supabase project — ask for `.env` credentials)

---

### Backend

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create the environment file
cp .env.example .env
# Fill in your DATABASE_URL, SECRET_KEY, etc. (see .env.example for reference)

# 5. Start the development server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

---

### Frontend

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create the environment file
cp .env.example .env
# Leave VITE_API_URL blank — Vite will proxy /api to localhost:8000 automatically

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 📁 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── core/           # Config & security utilities
│   │   ├── routers/        # API route handlers (auth, projects, tasks, users)
│   │   ├── database.py     # SQLAlchemy async engine & session
│   │   ├── models.py       # ORM models (User, Project, Task)
│   │   ├── schemas.py      # Pydantic request/response schemas
│   │   ├── dependencies.py # FastAPI dependency injection (auth guard)
│   │   └── main.py         # App entrypoint, CORS, router registration
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── api/            # Axios instance + per-resource API functions
    │   ├── components/     # Reusable UI components (Navbar, Modals, etc.)
    │   ├── context/        # AuthContext (global user state)
    │   ├── pages/          # LoginPage, SignupPage, DashboardPage
    │   └── App.jsx         # Route configuration
    ├── vercel.json         # SPA rewrite rule for Vercel
    └── vite.config.js      # Vite config with dev proxy
```

---

## 🔒 Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (supports `postgres://` and `postgresql://`) |
| `SECRET_KEY` | Random secret for signing JWTs (`openssl rand -hex 32`) |
| `ALGORITHM` | JWT algorithm — `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime in minutes — `30` |

### Frontend (`frontend/.env`)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Full backend URL including `/api` suffix. Leave blank for local dev (Vite proxy handles it). |

---

## 📜 API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Login, returns JWT |
| `GET` | `/api/projects` | Required | List all projects |
| `POST` | `/api/projects` | Admin | Create a project |
| `GET` | `/api/tasks` | Required | List all tasks |
| `POST` | `/api/tasks` | Admin | Create a task |
| `PATCH` | `/api/tasks/{id}/status` | Required | Update task status |
| `GET` | `/api/users` | Required | List all users |

Full interactive documentation: https://task-manager-system-assignment.onrender.com/docs
