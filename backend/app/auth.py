import hashlib
import hmac
import re
import time
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional

import bcrypt

from app.config import env, session_secret, session_ttl_seconds
from app.database import db_cursor, get_connection

APP_USER_TABLE = "orion_ods.app_user"
ROLES = ("admin", "editor", "viewer")

ROLE_PAGES = {
    "admin": {"home", "dashboard", "data", "admin"},
    "editor": {"home", "dashboard", "data"},
    "viewer": {"home", "dashboard"},
}

ROLE_LABELS = {
    "admin": "Admin — full access + user management",
    "editor": "Editor — dashboard and data management",
    "viewer": "Viewer — dashboard only",
}

ROLE_DEFAULT_DATA_ACCESS = {
    "admin": (True, True),
    "editor": (True, False),
    "viewer": (False, False),
}

USER_SELECT_COLUMNS = (
    "id, username, display_name, role, is_active, "
    "ods_access, dw_access, created_timestamp"
)

USERNAME_PATTERN = re.compile(r"^[a-zA-Z0-9._-]{3,32}$")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def make_session_token(user_id: int) -> str:
    exp = int(time.time()) + session_ttl_seconds()
    payload = f"{user_id}:{exp}"
    sig = hmac.new(session_secret(), payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}:{sig}"


def parse_session_token(token: str) -> Optional[int]:
    try:
        user_id_str, exp_str, sig = token.split(":")
        payload = f"{user_id_str}:{exp_str}"
        expected = hmac.new(session_secret(), payload.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return None
        if int(exp_str) < time.time():
            return None
        return int(user_id_str)
    except (ValueError, TypeError):
        return None


def session_cookie_max_age() -> int:
    return session_ttl_seconds()


def _session_user_from_row(row, columns):
    user = dict(zip(columns, row))
    user.pop("password_hash", None)
    if "ods_access" not in user:
        ods_default, dw_default = ROLE_DEFAULT_DATA_ACCESS.get(user.get("role"), (False, False))
        user["ods_access"] = ods_default
        user["dw_access"] = dw_default
    return user


def _fetch_user_by_username(username: str):
    with db_cursor() as cur:
        cur.execute(
            f"""
            SELECT id, username, display_name, password_hash, role, is_active,
                   ods_access, dw_access
            FROM {APP_USER_TABLE}
            WHERE username = %s
            """,
            (username,),
        )
        row = cur.fetchone()
        if not row:
            return None
        cols = [desc[0] for desc in cur.description]
        return dict(zip(cols, row))


def fetch_user_by_id(user_id: int):
    with db_cursor() as cur:
        cur.execute(
            f"SELECT {USER_SELECT_COLUMNS} FROM {APP_USER_TABLE} WHERE id = %s",
            (user_id,),
        )
        row = cur.fetchone()
        if not row:
            return None
        cols = [desc[0] for desc in cur.description]
        return _session_user_from_row(row, cols)


def list_users():
    with db_cursor() as cur:
        cur.execute(
            f"SELECT {USER_SELECT_COLUMNS} FROM {APP_USER_TABLE} ORDER BY username"
        )
        rows = cur.fetchall()
        cols = [desc[0] for desc in cur.description]
        return [_session_user_from_row(row, cols) for row in rows]


def _user_count() -> int:
    with db_cursor() as cur:
        cur.execute(f"SELECT COUNT(*) FROM {APP_USER_TABLE}")
        return cur.fetchone()[0]


def count_active_admins(exclude_user_id: Optional[int] = None) -> int:
    with db_cursor() as cur:
        if exclude_user_id is None:
            cur.execute(
                f"SELECT COUNT(*) FROM {APP_USER_TABLE} WHERE role = 'admin' AND is_active = TRUE"
            )
        else:
            cur.execute(
                f"""
                SELECT COUNT(*) FROM {APP_USER_TABLE}
                WHERE role = 'admin' AND is_active = TRUE AND id <> %s
                """,
                (exclude_user_id,),
            )
        return cur.fetchone()[0]


def validate_username(username: str) -> Optional[str]:
    username = username.strip()
    if not USERNAME_PATTERN.match(username):
        return "Username must be 3-32 characters and use letters, numbers, dots, dashes, or underscores."
    return None


def validate_password(password: str) -> Optional[str]:
    if len(password) < 8:
        return "Password must be at least 8 characters."
    return None


def create_user(
    username: str,
    display_name: str,
    password: str,
    role: str = "viewer",
    *,
    ods_access: Optional[bool] = None,
    dw_access: Optional[bool] = None,
):
    username = username.strip()
    display_name = display_name.strip()
    if role not in ROLES:
        raise ValueError("Invalid role.")
    if err := validate_username(username):
        raise ValueError(err)
    if err := validate_password(password):
        raise ValueError(err)
    if not display_name:
        raise ValueError("Display name is required.")
    if _fetch_user_by_username(username):
        raise ValueError("Username already exists.")

    default_ods, default_dw = ROLE_DEFAULT_DATA_ACCESS[role]
    ods_access = default_ods if ods_access is None else ods_access
    dw_access = default_dw if dw_access is None else dw_access

    with db_cursor(commit=True) as cur:
        cur.execute(
            f"""
            INSERT INTO {APP_USER_TABLE} (
                username, display_name, password_hash, role, ods_access, dw_access
            ) VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (username, display_name, hash_password(password), role, ods_access, dw_access),
        )


def update_user_data_access(user_id: int, ods_access: bool, dw_access: bool, acting_user_id: int):
    target = fetch_user_by_id(user_id)
    if not target:
        raise ValueError("User not found.")
    if user_id == acting_user_id and not ods_access and not dw_access:
        raise ValueError("You cannot remove all data access from your own account.")
    with db_cursor(commit=True) as cur:
        cur.execute(
            f"""
            UPDATE {APP_USER_TABLE}
            SET ods_access = %s, dw_access = %s, updated_timestamp = CURRENT_TIMESTAMP
            WHERE id = %s
            """,
            (ods_access, dw_access, user_id),
        )


def update_user_role(user_id: int, role: str, acting_user_id: int):
    if role not in ROLES:
        raise ValueError("Invalid role.")
    target = fetch_user_by_id(user_id)
    if not target:
        raise ValueError("User not found.")
    if target["role"] == "admin" and role != "admin" and count_active_admins(exclude_user_id=user_id) == 0:
        raise ValueError("Cannot change role of the last active admin.")
    if user_id == acting_user_id and role != "admin":
        raise ValueError("You cannot remove your own admin access.")
    with db_cursor(commit=True) as cur:
        cur.execute(
            f"UPDATE {APP_USER_TABLE} SET role = %s, updated_timestamp = CURRENT_TIMESTAMP WHERE id = %s",
            (role, user_id),
        )


def set_user_active(user_id: int, is_active: bool, acting_user_id: int):
    target = fetch_user_by_id(user_id)
    if not target:
        raise ValueError("User not found.")
    if user_id == acting_user_id and not is_active:
        raise ValueError("You cannot disable your own account.")
    if target["role"] == "admin" and not is_active and count_active_admins(exclude_user_id=user_id) == 0:
        raise ValueError("Cannot disable the last active admin.")
    with db_cursor(commit=True) as cur:
        cur.execute(
            f"UPDATE {APP_USER_TABLE} SET is_active = %s, updated_timestamp = CURRENT_TIMESTAMP WHERE id = %s",
            (is_active, user_id),
        )


def update_user_password(user_id: int, password: str):
    if err := validate_password(password):
        raise ValueError(err)
    with db_cursor(commit=True) as cur:
        cur.execute(
            f"""
            UPDATE {APP_USER_TABLE}
            SET password_hash = %s, updated_timestamp = CURRENT_TIMESTAMP
            WHERE id = %s
            """,
            (hash_password(password), user_id),
        )
        if cur.rowcount == 0:
            raise ValueError("User not found.")


def delete_user(user_id: int, acting_user_id: int):
    target = fetch_user_by_id(user_id)
    if not target:
        raise ValueError("User not found.")
    if user_id == acting_user_id:
        raise ValueError("You cannot delete your own account.")
    if target["role"] == "admin" and count_active_admins(exclude_user_id=user_id) == 0:
        raise ValueError("Cannot delete the last active admin.")
    with db_cursor(commit=True) as cur:
        cur.execute(f"DELETE FROM {APP_USER_TABLE} WHERE id = %s", (user_id,))


def ensure_default_admin():
    if _user_count() > 0:
        return
    username = env("ORION_ADMIN_USERNAME", "admin")
    password = env("ORION_ADMIN_PASSWORD", "orion_dev_password")
    create_user(username, username.title(), password, role="admin")


def authenticate(username: str, password: str):
    user = _fetch_user_by_username(username.strip())
    if not user or not user["is_active"]:
        return None
    if not verify_password(password, user["password_hash"]):
        return None
    return _to_session_user(user)


def _to_session_user(user: dict) -> dict:
    ods_default, dw_default = ROLE_DEFAULT_DATA_ACCESS.get(user["role"], (False, False))
    return {
        "id": user["id"],
        "username": user["username"],
        "display_name": user["display_name"],
        "role": user["role"],
        "ods_access": user.get("ods_access", ods_default),
        "dw_access": user.get("dw_access", dw_default),
    }


def can_access_ods(user: Optional[Dict]) -> bool:
    if not user:
        return False
    if "ods_access" in user:
        return bool(user["ods_access"])
    return user.get("role") in ("admin", "editor")


def can_access_dw(user: Optional[Dict]) -> bool:
    if not user:
        return False
    if "dw_access" in user:
        return bool(user["dw_access"])
    return user.get("role") == "admin"


def can_access_page(user: Optional[Dict], page_id: str) -> bool:
    if not user:
        return False
    if page_id == "data":
        return can_access_ods(user) or can_access_dw(user)
    return page_id in ROLE_PAGES.get(user["role"], set())


def is_admin(user: Optional[Dict]) -> bool:
    return bool(user and user.get("role") == "admin")
