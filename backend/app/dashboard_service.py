"""Dashboard metrics derived from orion_ods operational data."""

from __future__ import annotations

from calendar import month_abbr
from datetime import datetime
from typing import Any

from app.database import db_cursor

MONTH_LABELS = [month_abbr[i] for i in range(1, 13)]


def _ytd_month_count() -> int:
    return datetime.now().month


def _month_slots() -> int:
    return _ytd_month_count()


def _format_inr(amount: float | None) -> str:
    if amount is None or amount == 0:
        return "₹0"
    value = float(amount)
    if abs(value) >= 100_000:
        return f"₹{value / 100_000:.1f}L"
    if abs(value) >= 1_000:
        return f"₹{value / 1_000:.1f}K"
    return f"₹{value:.0f}"

def _fetch_scalar(query: str, params: tuple = ()) -> Any:
    with db_cursor() as cur:
        cur.execute(query, params)
        row = cur.fetchone()
        return row[0] if row else None


def _fetch_all(query: str, params: tuple = ()) -> list[tuple]:
    with db_cursor() as cur:
        cur.execute(query, params)
        return cur.fetchall()


def build_dashboard() -> dict:
    year = datetime.now().year
    month_slots = _month_slots()
    month_labels = MONTH_LABELS[:month_slots]

    total_revenue = _fetch_scalar(
        """
        SELECT COALESCE(SUM(monthly_expected_revenue), 0)
        FROM orion_ods.case
        WHERE case_status = 'Active'
        """
    )
    committed_revenue = _fetch_scalar(
        """
        SELECT COALESCE(SUM(monthly_expected_revenue), 0)
        FROM orion_ods.case
        WHERE case_status = 'Active' AND case_onboarded IS TRUE
        """
    )

    active_cases = _fetch_scalar(
        "SELECT COUNT(*) FROM orion_ods.case WHERE case_status = 'Active'"
    ) or 0
    total_cases = _fetch_scalar("SELECT COUNT(*) FROM orion_ods.case") or 0
    open_opportunities = _fetch_scalar(
        """
        SELECT COUNT(*) FROM orion_ods.case
        WHERE case_status = 'Active' AND COALESCE(case_onboarded, FALSE) IS FALSE
        """
    ) or 0

    active_employees = _fetch_scalar(
        "SELECT COUNT(*) FROM orion_ods.employee WHERE employee_status = 'Active'"
    ) or 0
    inactive_employees = _fetch_scalar(
        "SELECT COUNT(*) FROM orion_ods.employee WHERE employee_status = 'Inactive'"
    ) or 0
    total_km = _fetch_scalar(
        """
        SELECT COALESCE(SUM(monthly_allowed_km), 0)
        FROM orion_ods.case
        WHERE case_status = 'Active'
        """
    ) or 0

    expense_type_count = _fetch_scalar("SELECT COUNT(*) FROM orion_ods.expense_type") or 0

    revenue_delta = ""
    revenue_delta_type = "neutral"
    if float(total_revenue or 0) > 0 and float(committed_revenue or 0) > 0:
        pct = (float(committed_revenue) / float(total_revenue) - 0.5) * 100
        if pct > 0:
            revenue_delta = f"+{pct:.0f}% committed"
            revenue_delta_type = "positive"
        elif pct < 0:
            revenue_delta = f"{pct:.0f}% committed"
            revenue_delta_type = "negative"

    metrics = [
        {
            "label": "Revenue",
            "value": _format_inr(total_revenue),
            "delta": revenue_delta,
            "delta_type": revenue_delta_type,
        },
        {
            "label": "Expense",
            "value": f"{expense_type_count} types",
            "delta": "From ODS expense catalog",
            "delta_type": "neutral",
        },
        {
            "label": "Headcount",
            "value": str(active_employees + inactive_employees),
            "delta": f"{active_employees} active" if active_employees else "",
            "delta_type": "positive" if active_employees else "neutral",
        },
        {
            "label": "Active Cases",
            "value": str(active_cases),
            "delta": f"{total_cases} total" if total_cases else "",
            "delta_type": "neutral",
        },
        {
            "label": "KM Allowance",
            "value": str(int(total_km)),
            "delta": "Active cases (monthly)",
            "delta_type": "neutral",
        },
        {
            "label": "Open Opportunities",
            "value": str(open_opportunities),
            "delta": "Cases not yet onboarded",
            "delta_type": "neutral",
        },
    ]

    # Revenue by month: group active cases on case_start_date (fallback created_timestamp)
    month_rows = _fetch_all(
        """
        SELECT
            EXTRACT(MONTH FROM COALESCE(case_start_date, created_timestamp::date))::int AS month_num,
            COALESCE(case_onboarded, FALSE) AS onboarded,
            COALESCE(monthly_expected_revenue, 0) AS revenue
        FROM orion_ods.case
        WHERE case_status = 'Active'
          AND EXTRACT(YEAR FROM COALESCE(case_start_date, created_timestamp::date)) = %s
        """,
        (year,),
    )

    prospective_by_month = [0.0] * month_slots
    committed_by_month = [0.0] * month_slots
    for month_num, onboarded, revenue in month_rows:
        if month_num is None or month_num < 1 or month_num > month_slots:
            continue
        idx = month_num - 1
        amount = float(revenue or 0)
        if onboarded:
            committed_by_month[idx] += amount
        else:
            prospective_by_month[idx] += amount

    # Expense chart: no ledger in ODS — show expense_type catalog growth by created month
    expense_rows = _fetch_all(
        """
        SELECT
            EXTRACT(MONTH FROM created_timestamp)::int AS month_num,
            COUNT(*) AS cnt
        FROM orion_ods.expense_type
        WHERE EXTRACT(YEAR FROM created_timestamp) = %s
        GROUP BY 1
        """,
        (year,),
    )
    expense_by_month = [0.0] * month_slots
    for month_num, cnt in expense_rows:
        if month_num and 1 <= month_num <= month_slots:
            expense_by_month[month_num - 1] = float(cnt)

    headcount = [
        {"type": "Active", "count": int(active_employees)},
        {"type": "Inactive", "count": int(inactive_employees)},
    ]

    pipeline_rows = _fetch_all(
        """
        SELECT
            CASE
                WHEN COALESCE(case_onboarded, FALSE) IS FALSE THEN 'Prospective'
                WHEN case_status = 'Active' THEN 'Active'
                ELSE 'Inactive'
            END AS stage,
            COUNT(*) AS cnt
        FROM orion_ods.case
        GROUP BY 1
        ORDER BY cnt DESC
        """
    )
    pipeline = [{"stage": stage, "count": int(cnt)} for stage, cnt in pipeline_rows]

    case_revenue_rows = _fetch_all(
        """
        SELECT case_name, COALESCE(monthly_expected_revenue, 0)
        FROM orion_ods.case
        WHERE case_status = 'Active'
        ORDER BY monthly_expected_revenue DESC NULLS LAST, case_name
        LIMIT 10
        """
    )
    case_revenue = [
        {"case": name, "revenue": float(rev or 0)} for name, rev in case_revenue_rows
    ]

    top_case = case_revenue_rows[0][0] if case_revenue_rows else "—"

    best_month_idx = max(
        range(month_slots),
        key=lambda i: prospective_by_month[i] + committed_by_month[i],
        default=0,
    )
    best_month = month_labels[best_month_idx] if any(prospective_by_month + committed_by_month) else "—"

    efficiency = "—"
    if total_cases:
        efficiency = f"{round((active_cases / total_cases) * 100)}%"

    snapshot = [
        {"label": "Top Performing Case", "value": top_case},
        {"label": "Highest Revenue Month", "value": best_month},
        {"label": "Case Efficiency", "value": efficiency},
    ]

    return {
        "metrics": metrics,
        "revenue": {
            "months": month_labels,
            "prospective": [int(v) for v in prospective_by_month],
            "committed": [int(v) for v in committed_by_month],
        },
        "expense": {
            "months": month_labels,
            "types": [int(v) for v in expense_by_month],
        },
        "headcount": headcount,
        "pipeline": pipeline,
        "case_revenue": case_revenue,
        "snapshot": snapshot,
    }
