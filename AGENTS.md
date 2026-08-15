# AGENTS.md

## Cursor Cloud specific instructions

Orion is a data-management platform shipped as **two coexisting stacks over one PostgreSQL database**:

- **v1 (legacy)** — Streamlit app at repo root (`app.py`, `views/`, `ui/`, `services/`, `modules/`, `dw/`, `db/`). Deps in `requirements.txt`. Serves on **:8501**.
- **v2 (modern)** — FastAPI backend (`backend/`, deps in `backend/requirements.txt`) on **:8000** + React/Vite frontend (`frontend/`, npm) on **:5173**. Documented in `README-MODERN.md`.

Both share the local PostgreSQL DB `orion` (schemas `orion_ods` + `orion_dw`), created/seeded by `.cursor/db/init_db.sh`.

### Services & how they run here
The environment (`.cursor/environment.json`) auto-starts all three services in terminals: `streamlit` (:8501), `api` (:8000), `frontend` (:5173). Postgres is a local cluster started by `.cursor/start.sh` on each boot. To run a service manually, use the exact commands in `.cursor/environment.json` terminals rather than the `scripts/start-*.sh` helpers — `scripts/start-api.sh`, `scripts/start-frontend.sh`, and `scripts/start-modern.sh` are **macOS-oriented** (they source `scripts/macos_python_env.sh` and hardcode `/opt/homebrew/bin`) and are not the right entrypoints on this Linux VM.

- Python (both stacks) uses the shared venv at `.venv` (e.g. `./.venv/bin/python`, `./.venv/bin/streamlit`).
- Vite defaults to IPv6 `localhost` only; the `frontend` terminal passes `--host 0.0.0.0`. Reach the app at `http://localhost:5173`. Vite proxies `/api` → `http://127.0.0.1:8000`, so the `api` service must be up for the SPA to work.

### Login / hello-world
Default admin is created automatically **only when the user table is empty** (via `ensure_default_admin`, backend lifespan + Streamlit startup). Credentials: username `admin`, password `orion_dev_password`. Both stacks accept the same login.

### Config / env gotchas
- `.env` is gitignored and auto-created by `.cursor/install.sh` with DB credentials matching `.cursor/db/init_db.sh` defaults (`orion_user` / `orion_dev_password`). The app also defaults to these values in code, so it works even without `.env`. Do **not** copy `.env.example` verbatim — its placeholder password does not match the seeded DB.
- The backend loads `.env` via `python-dotenv` (does not override already-set env vars) but does **not** read `.cursor/runtime.env`; the terminals source `runtime.env` first so Tailscale remote-DB mode still works.
- `.cursor/start.sh` tunnels to a **remote** DB only if the `TAILSCALE_AUTHKEY` secret is set; leave it unset for normal local development.

### Lint / test / build
- Frontend typecheck + build: `cd frontend && npm run build` (`tsc -b && vite build`).
- There is no dedicated Python linter config and no automated test suite in the repo; validate changes by running the relevant service and exercising it.
