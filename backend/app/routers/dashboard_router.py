from fastapi import APIRouter, Depends

from app.dashboard_service import build_dashboard
from app.dependencies import require_page

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("")
def get_dashboard(_user=Depends(require_page("dashboard"))):
    return build_dashboard()
