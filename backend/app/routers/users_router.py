from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.auth import (
    ROLE_DEFAULT_DATA_ACCESS,
    ROLE_LABELS,
    ROLES,
    create_user,
    delete_user,
    list_users,
    set_user_active,
    update_user_data_access,
    update_user_password,
    update_user_role,
)
from app.dependencies import require_admin

router = APIRouter(prefix="/users", tags=["users"])


class CreateUserRequest(BaseModel):
    username: str
    display_name: str
    password: str
    role: str = "viewer"
    ods_access: Optional[bool] = None
    dw_access: Optional[bool] = None


class UpdateRoleRequest(BaseModel):
    role: str


class UpdateActiveRequest(BaseModel):
    is_active: bool


class UpdateDataAccessRequest(BaseModel):
    ods_access: bool
    dw_access: bool


class UpdatePasswordRequest(BaseModel):
    password: str


def _serialize_ts(value):
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return value


def _serialize_user(user: dict) -> dict:
    return {
        "id": user["id"],
        "username": user["username"],
        "display_name": user["display_name"],
        "role": user["role"],
        "is_active": user["is_active"],
        "ods_access": user.get("ods_access", False),
        "dw_access": user.get("dw_access", False),
        "created_timestamp": _serialize_ts(user.get("created_timestamp")),
    }


@router.get("")
def get_users(_admin=Depends(require_admin)):
    return [_serialize_user(u) for u in list_users()]


@router.get("/meta")
def users_meta(_admin=Depends(require_admin)):
    return {
        "roles": [{"id": r, "label": ROLE_LABELS[r]} for r in ROLES],
        "default_data_access": {
            r: {"ods_access": v[0], "dw_access": v[1]} for r, v in ROLE_DEFAULT_DATA_ACCESS.items()
        },
    }


@router.post("")
def post_user(body: CreateUserRequest, admin=Depends(require_admin)):
    try:
        create_user(
            body.username,
            body.display_name,
            body.password,
            body.role,
            ods_access=body.ods_access,
            dw_access=body.dw_access,
        )
        return {"ok": True}
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.patch("/{user_id}/role")
def patch_role(user_id: int, body: UpdateRoleRequest, admin=Depends(require_admin)):
    try:
        update_user_role(user_id, body.role, admin["id"])
        return {"ok": True}
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.patch("/{user_id}/active")
def patch_active(user_id: int, body: UpdateActiveRequest, admin=Depends(require_admin)):
    try:
        set_user_active(user_id, body.is_active, admin["id"])
        return {"ok": True}
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.patch("/{user_id}/data-access")
def patch_data_access(user_id: int, body: UpdateDataAccessRequest, admin=Depends(require_admin)):
    try:
        update_user_data_access(user_id, body.ods_access, body.dw_access, admin["id"])
        return {"ok": True}
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.patch("/{user_id}/password")
def patch_password(user_id: int, body: UpdatePasswordRequest, _admin=Depends(require_admin)):
    try:
        update_user_password(user_id, body.password)
        return {"ok": True}
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.delete("/{user_id}")
def remove_user(user_id: int, admin=Depends(require_admin)):
    try:
        delete_user(user_id, admin["id"])
        return {"ok": True}
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
