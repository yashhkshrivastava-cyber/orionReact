from typing import Optional

from fastapi import Cookie, Depends, HTTPException, status

from app.auth import (
    can_access_dw,
    can_access_ods,
    can_access_page,
    fetch_user_by_id,
    is_admin,
    parse_session_token,
)
from app.config import SESSION_COOKIE_NAME


def get_current_user(
    orion_session: Optional[str] = Cookie(default=None, alias=SESSION_COOKIE_NAME),
):
    if not orion_session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    user_id = parse_session_token(orion_session)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")
    user = fetch_user_by_id(user_id)
    if not user or not user.get("is_active"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account inactive")
    return {
        "id": user["id"],
        "username": user["username"],
        "display_name": user["display_name"],
        "role": user["role"],
        "ods_access": user.get("ods_access", False),
        "dw_access": user.get("dw_access", False),
    }


def get_optional_user(
    orion_session: Optional[str] = Cookie(default=None, alias=SESSION_COOKIE_NAME),
):
    if not orion_session:
        return None
    user_id = parse_session_token(orion_session)
    if not user_id:
        return None
    user = fetch_user_by_id(user_id)
    if not user or not user.get("is_active"):
        return None
    return {
        "id": user["id"],
        "username": user["username"],
        "display_name": user["display_name"],
        "role": user["role"],
        "ods_access": user.get("ods_access", False),
        "dw_access": user.get("dw_access", False),
    }


def require_page(page_id: str):
    def _dep(user=Depends(get_current_user)):
        if not can_access_page(user, page_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        return user

    return _dep


def require_admin(user=Depends(get_current_user)):
    if not is_admin(user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user


def require_ods(user=Depends(get_current_user)):
    if not can_access_ods(user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="ODS access required")
    return user


def require_dw(user=Depends(get_current_user)):
    if not can_access_dw(user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="DW access required")
    return user
