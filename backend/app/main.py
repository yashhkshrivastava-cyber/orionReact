import sys
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

_ROOT = Path(__file__).resolve().parents[2]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from app.auth import ensure_default_admin
from app.routers import (
    auth_router,
    dashboard_router,
    dw_router,
    entities_router,
    location_router,
    users_router,
)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    ensure_default_admin()
    yield


app = FastAPI(title="Orion API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router, prefix="/api")
app.include_router(users_router.router, prefix="/api")
app.include_router(entities_router.router, prefix="/api")
app.include_router(dw_router.router, prefix="/api")
app.include_router(dashboard_router.router, prefix="/api")
app.include_router(location_router.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}
