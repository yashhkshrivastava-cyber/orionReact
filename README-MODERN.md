# Orion v2 — React + FastAPI

Modern rewrite of the Orion Streamlit app using **React (Vite + TypeScript)** and **FastAPI**.

The original Streamlit app (`app.py`) is unchanged. The new stack lives in `backend/` and `frontend/`.

## Architecture

```
frontend/          React SPA (Vite, React Router, Recharts)
backend/           FastAPI REST API (reuses same PostgreSQL schema)
scripts/           start-api.sh, start-frontend.sh, start-modern.sh
```

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript, Vite, React Router, Recharts |
| Backend | FastAPI, psycopg2, bcrypt |
| Database | PostgreSQL (`orion_ods` + `orion_dw`) — same as v1 |

## Features ported

- Cookie-based session auth (admin / editor / viewer roles)
- Home launch screen with workspace cards
- Dashboard with KPIs and charts sourced from `orion_ods` (cases, employees, expense types)
- Data Management — ODS CRUD for all 6 entities
- DW SCD Type 2 load for Business Domain
- Admin panel — user CRUD, roles, ODS/DW access
- Indian state/city dropdowns via bharatpin

## Prerequisites

- PostgreSQL running (same setup as v1: `bash scripts/install-mac.sh`)
- `.env` configured (copy from `.env.example`)
- Node.js 18+ and npm (for frontend)

## Quick start

```bash
# 1. Bootstrap DB + Python venv (if not done)
bash scripts/install-mac.sh

# 2. Install backend deps (use python -m pip — required on macOS 26)
source scripts/macos_python_env.sh
.venv/bin/python -m pip install -r backend/requirements.txt

# 3. Install frontend deps (requires Node — brew install node)
cd frontend && npm install && cd ..

# 4. Start both services (from repo root)
bash scripts/start-modern.sh
```

Or run separately:

```bash
bash scripts/start-api.sh        # http://127.0.0.1:8000
bash scripts/start-frontend.sh   # http://localhost:5173
```

Open **http://localhost:5173** and sign in with your admin credentials from `.env`.

## Troubleshooting (macOS 26)

If `pip install` fails with truststore, pyexpat, or wheel errors:

```bash
source scripts/macos_python_env.sh   # fixes Homebrew pyexpat
.venv/bin/python -m pip install -r backend/requirements.txt
```

Always run start scripts from the **repo root**, not from `frontend/`.

If `npm` is not found: `brew install node`

## API

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/login` | Sign in (sets httpOnly cookie) |
| `POST /api/auth/logout` | Sign out |
| `GET /api/auth/me` | Current user |
| `GET /api/dashboard` | Dashboard metrics from ODS |
| `GET/POST/PUT/DELETE /api/entities/...` | ODS CRUD |
| `GET/POST /api/dw/...` | DW preview & load |
| `GET/POST/PATCH/DELETE /api/users/...` | Admin user management |
| `GET /api/location/states` | Indian states |
| `GET /api/location/cities?state=` | Districts for state |

## Environment

Uses the same `.env` as the Streamlit app. Optional:

```env
ORION_API_PORT=8000
```

## Production build

```bash
cd frontend && npm run build
# Serve frontend/dist/ with nginx or similar; proxy /api to uvicorn
```

```bash
uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000
```
