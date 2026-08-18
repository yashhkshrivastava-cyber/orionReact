import sys
from pathlib import Path

from fastapi import APIRouter, Depends

from app.dependencies import require_page

_ROOT = Path(__file__).resolve().parents[3]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from db.dashboard import get_dashboard_data

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("")
def get_dashboard(_user=Depends(require_page("dashboard"))):
    return get_dashboard_data()
