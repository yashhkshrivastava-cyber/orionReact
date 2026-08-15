from fastapi import APIRouter, Depends, HTTPException, status

from app.database import db_cursor
from app.dependencies import require_dw
from app.dw_sync import DW_SYNC
from app.entities import DW_DIMENSIONS

router = APIRouter(prefix="/dw", tags=["dw"])


def _serialize_row(cols, row):
    result = {}
    for i, col in enumerate(cols):
        val = row[i]
        if hasattr(val, "isoformat"):
            val = val.isoformat()
        elif isinstance(val, bool):
            val = val
        result[col] = val
    return result


@router.get("/dimensions")
def list_dimensions(_user=Depends(require_dw)):
    return {"dimensions": list(DW_SYNC.keys())}


@router.get("/{dimension}/preview")
def preview_dimension(dimension: str, _user=Depends(require_dw)):
    meta = DW_DIMENSIONS.get(dimension)
    if not meta:
        raise HTTPException(status_code=404, detail="Unknown dimension")
    with db_cursor() as cur:
        cur.execute(meta["preview_query"])
        rows = cur.fetchall()
        cols = [desc[0] for desc in cur.description]
    return {"columns": cols, "rows": [_serialize_row(cols, r) for r in rows]}


@router.post("/{dimension}/load")
def run_load(dimension: str, _user=Depends(require_dw)):
    sync_fn = DW_SYNC.get(dimension)
    if not sync_fn:
        raise HTTPException(status_code=404, detail="No load configured for this dimension")
    try:
        stats = sync_fn()
        return {"ok": True, "stats": stats}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
