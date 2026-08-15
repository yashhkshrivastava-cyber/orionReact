import os
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / ".env")

SESSION_COOKIE_NAME = "orion_session"
DEFAULT_SESSION_TTL_DAYS = 7


def env(name: str, default: str = "") -> str:
    return os.environ.get(name, default)


def db_settings() -> dict:
    return {
        "host": env("ORION_DB_HOST", "localhost"),
        "database": env("ORION_DB_NAME", "orion"),
        "user": env("ORION_DB_USER", "orion_user"),
        "password": env("ORION_DB_PASSWORD", "orion_dev_password"),
        "port": int(env("ORION_DB_PORT", "5432")),
    }


def session_secret() -> bytes:
    return env(
        "ORION_SESSION_SECRET",
        "orion-dev-session-secret-change-in-production",
    ).encode()


def session_ttl_seconds() -> int:
    days = int(env("ORION_SESSION_TTL_DAYS", str(DEFAULT_SESSION_TTL_DAYS)))
    return max(1, days) * 86400
