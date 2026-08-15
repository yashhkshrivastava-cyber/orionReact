from datetime import date, datetime
from decimal import Decimal
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.db_utils import delete_record, fetch_by_id, fetch_dropdown, fetch_top_n, insert, update
from app.dependencies import get_current_user, require_ods
from app.entities import ENTITIES

router = APIRouter(prefix="/entities", tags=["entities"])


def _get_entity(name: str) -> dict:
    if name not in ENTITIES:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown entity")
    return ENTITIES[name]


def _serialize_value(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, bool):
        return value
    return value


def _serialize_record(record: dict) -> dict:
    return {k: _serialize_value(v) for k, v in record.items()}


def _coerce_input(value: Any, field_type: str) -> Any:
    if value is None or value == "":
        return None
    if field_type == "boolean":
        if isinstance(value, bool):
            return value
        return str(value).lower() in ("true", "1", "yes")
    if field_type == "integer":
        return int(value)
    if field_type == "number":
        return float(value)
    if field_type == "date":
        if isinstance(value, date):
            return value
        return value  # psycopg2 accepts ISO date strings
    return value


def _validate_payload(entity: dict, payload: dict, *, for_update: bool = False) -> dict:
    form_fields = entity["form_fields"]
    cleaned = {}
    for key, config in form_fields.items():
        if key not in payload:
            if for_update:
                continue
            if config.get("optional"):
                cleaned[key] = None
            elif config["type"] in ("text", "select", "state", "dependent_select"):
                raise HTTPException(status_code=400, detail=f"Missing field: {key}")
            continue
        value = _coerce_input(payload[key], config["type"])
        if value is None and not config.get("optional") and config["type"] == "text":
            if not for_update:
                raise HTTPException(status_code=400, detail=f"{config['label']} is required")
        cleaned[key] = value
    return cleaned


class RecordPayload(BaseModel):
    data: dict


@router.get("")
def list_entity_names(user=Depends(get_current_user)):
    from app.auth import can_access_ods

    if not can_access_ods(user):
        raise HTTPException(status_code=403, detail="ODS access required")
    return {
        "entities": [
            {
                "name": name,
                "primary_key": meta["primary_key"],
                "display_column": meta["display_column"],
                "form_fields": meta["form_fields"],
            }
            for name, meta in ENTITIES.items()
        ]
    }


@router.get("/{name}/preview")
def preview_records(name: str, _user=Depends(require_ods)):
    entity = _get_entity(name)
    cols, rows = fetch_top_n(entity["table"], 10)
    return {
        "columns": cols,
        "rows": [{cols[i]: _serialize_value(row[i]) for i in range(len(cols))} for row in rows],
    }


@router.get("/{name}/options")
def entity_options(name: str, _user=Depends(require_ods)):
    entity = _get_entity(name)
    pk = entity["primary_key"]
    display = entity["display_column"]
    records = fetch_dropdown(entity["table"], display, pk)
    return [{"id": r[0], "label": r[1]} for r in records]


@router.get("/{name}/field-options/{field_name}")
def field_options(name: str, field_name: str, _user=Depends(require_ods)):
    entity = _get_entity(name)
    config = entity["form_fields"].get(field_name)
    if not config:
        raise HTTPException(status_code=404, detail="Unknown field")
    if "options" in config:
        return [{"id": o, "label": o} for o in config["options"]]
    if "source_table" in config:
        records = fetch_dropdown(
            config["source_table"],
            config["source_display_column"],
            config.get("source_pk_column", "id"),
        )
        return [{"id": r[0], "label": r[1]} for r in records]
    raise HTTPException(status_code=400, detail="Field has no options")


@router.get("/{name}/records/{record_id}")
def get_record(name: str, record_id: str, _user=Depends(require_ods)):
    entity = _get_entity(name)
    record = fetch_by_id(entity["table"], record_id, entity["primary_key"])
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return _serialize_record(record)


@router.post("/{name}/records")
def create_record(name: str, body: RecordPayload, _user=Depends(require_ods)):
    entity = _get_entity(name)
    cleaned = _validate_payload(entity, body.data)
    if not cleaned:
        raise HTTPException(status_code=400, detail="No data provided")
    insert(entity["table"], list(cleaned.keys()), list(cleaned.values()))
    return {"ok": True}


@router.put("/{name}/records/{record_id}")
def update_record(name: str, record_id: str, body: RecordPayload, _user=Depends(require_ods)):
    entity = _get_entity(name)
    existing = fetch_by_id(entity["table"], record_id, entity["primary_key"])
    if not existing:
        raise HTTPException(status_code=404, detail="Record not found")
    cleaned = _validate_payload(entity, body.data, for_update=True)
    if not cleaned:
        raise HTTPException(status_code=400, detail="No data provided")
    update(entity["table"], list(cleaned.keys()), list(cleaned.values()), record_id, entity["primary_key"])
    return {"ok": True}


@router.delete("/{name}/records/{record_id}")
def remove_record(name: str, record_id: str, _user=Depends(require_ods)):
    entity = _get_entity(name)
    existing = fetch_by_id(entity["table"], record_id, entity["primary_key"])
    if not existing:
        raise HTTPException(status_code=404, detail="Record not found")
    delete_record(entity["table"], record_id, entity["primary_key"])
    return {"ok": True}
