import random

from fastapi import APIRouter, Depends

from app.dependencies import require_page

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("")
def get_dashboard(_user=Depends(require_page("dashboard"))):
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    return {
        "metrics": [
            {"label": "Revenue", "value": "₹12.4L", "delta": "+12%", "delta_type": "positive"},
            {"label": "Expense", "value": "₹8.1L", "delta": "-4%", "delta_type": "negative"},
            {"label": "Headcount", "value": "124", "delta": "+3", "delta_type": "positive"},
            {"label": "Active Cases", "value": "32", "delta": "", "delta_type": "neutral"},
            {"label": "KM Today", "value": "328", "delta": "", "delta_type": "neutral"},
            {"label": "Open Opportunities", "value": "18", "delta": "", "delta_type": "neutral"},
        ],
        "revenue": {
            "months": months,
            "prospective": [random.randint(4000, 1200000) for _ in months],
            "committed": [random.randint(80000, 2000000) for _ in months],
        },
        "expense": {
            "months": months,
            "prospective": [random.randint(200000, 800000) for _ in months],
            "committed": [random.randint(60000, 140000) for _ in months],
        },
        "headcount": [{"type": "Active", "count": 96}, {"type": "Inactive", "count": 28}],
        "pipeline": [
            {"stage": "Proposal", "count": 8},
            {"stage": "Financial Bid", "count": 5},
            {"stage": "Technical Bid", "count": 5},
        ],
        "case_revenue": [
            {"case": f"Case {c}", "revenue": random.randint(100, 500)}
            for c in ["A", "B", "C", "D", "E"]
        ],
        "snapshot": [
            {"label": "Top Performing Case", "value": "Case B"},
            {"label": "Highest Revenue Month", "value": "March"},
            {"label": "Efficiency Score", "value": "87%"},
        ],
    }
