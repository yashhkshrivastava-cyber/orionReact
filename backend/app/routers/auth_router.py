from datetime import date, datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel

from app.auth import (
    ROLE_LABELS,
    ROLE_PAGES,
    ROLES,
    authenticate,
    can_access_ods,
    can_access_dw,
    can_access_page,
    make_session_token,
    session_cookie_max_age,
)
from app.config import SESSION_COOKIE_NAME
from app.dependencies import get_current_user, get_optional_user

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


def _serialize_user(user: dict) -> dict:
    pages = [p for p in ("home", "dashboard", "data", "admin") if can_access_page(user, p)]
    return {
        **user,
        "pages": pages,
        "can_ods": can_access_ods(user),
        "can_dw": can_access_dw(user),
    }


@router.post("/login")
def login(body: LoginRequest, response: Response):
    user = authenticate(body.username, body.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = make_session_token(user["id"])
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        max_age=session_cookie_max_age(),
        path="/",
    )
    return _serialize_user(user)


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key=SESSION_COOKIE_NAME, path="/")
    return {"ok": True}


@router.get("/me")
def me(user=Depends(get_current_user)):
    return _serialize_user(user)


@router.get("/config")
def auth_config(user=Depends(get_optional_user)):
    return {
        "roles": [{"id": r, "label": ROLE_LABELS[r]} for r in ROLES],
        "role_pages": {k: list(v) for k, v in ROLE_PAGES.items()},
        "authenticated": user is not None,
        "user": _serialize_user(user) if user else None,
    }
