"""Live dashboard metrics from orion_ods. No placeholder or random values."""

from decimal import Decimal

from db.connection import get_connection

_EMPTY = "—"


def _as_float(value) -> float:
    if value is None:
        return 0.0
    if isinstance(value, Decimal):
        return float(value)
    return float(value)


def _format_inr(value) -> str:
    amount = _as_float(value)
    if amount >= 100000:
        text = f"{amount / 100000:.1f}".rstrip("0").rstrip(".")
        return f"₹{text}L"
    if amount >= 1000:
        text = f"{amount / 1000:.1f}".rstrip("0").rstrip(".")
        return f"₹{text}K"
    return f"₹{amount:,.0f}"


def _format_int(value) -> str:
    return f"{int(value or 0):,}"


def _scalar(cur, sql, params=None, default=0):
    cur.execute(sql, params or ())
    row = cur.fetchone()
    if not row or row[0] is None:
        return default
    return row[0]


def _rows(cur, sql, params=None):
    cur.execute(sql, params or ())
    columns = [desc[0] for desc in cur.description]
    return [dict(zip(columns, row)) for row in cur.fetchall()]


def _named_counts(rows, name_key, count_key="count"):
    return [
        {name_key: row[name_key], count_key: int(row[count_key])}
        for row in rows
        if row[count_key]
    ]


def get_dashboard_data() -> dict:
    conn = get_connection()
    cur = conn.cursor()
    try:
        active_revenue = _scalar(
            cur,
            """
            SELECT COALESCE(SUM(monthly_expected_revenue), 0)
            FROM orion_ods.case
            WHERE COALESCE(case_status, 'Active') = 'Active'
            """,
        )
        allowed_km = _scalar(
            cur,
            """
            SELECT COALESCE(SUM(monthly_allowed_km), 0)
            FROM orion_ods.case
            WHERE COALESCE(case_status, 'Active') = 'Active'
            """,
        )
        active_clients = _scalar(
            cur,
            "SELECT COUNT(*) FROM orion_ods.client WHERE client_status = 'Active'",
        )
        active_cases = _scalar(
            cur,
            "SELECT COUNT(*) FROM orion_ods.case WHERE COALESCE(case_status, 'Active') = 'Active'",
        )
        headcount = _scalar(cur, "SELECT COUNT(*) FROM orion_ods.employee")
        domains = _scalar(cur, "SELECT COUNT(*) FROM orion_ods.business_domain")

        clients_by_status = _named_counts(
            _rows(
                cur,
                """
                SELECT COALESCE(client_status, 'Unknown') AS type, COUNT(*)::int AS count
                FROM orion_ods.client
                GROUP BY 1
                ORDER BY count DESC, type
                """,
            ),
            "type",
        )
        clients_by_type = _named_counts(
            _rows(
                cur,
                """
                SELECT COALESCE(client_type, 'Unknown') AS type, COUNT(*)::int AS count
                FROM orion_ods.client
                GROUP BY 1
                ORDER BY count DESC, type
                """,
            ),
            "type",
        )
        headcount_by_status = _named_counts(
            _rows(
                cur,
                """
                SELECT COALESCE(employee_status, 'Unknown') AS type, COUNT(*)::int AS count
                FROM orion_ods.employee
                GROUP BY 1
                ORDER BY count DESC, type
                """,
            ),
            "type",
        )
        cases_by_domain = _named_counts(
            _rows(
                cur,
                """
                SELECT COALESCE(bd.business_domain_name, 'Unassigned') AS domain,
                       COUNT(*)::int AS count
                FROM orion_ods.case c
                LEFT JOIN orion_ods.business_domain bd
                  ON bd.business_domain_code = c.business_domain_code
                GROUP BY 1
                ORDER BY count DESC, domain
                """,
            ),
            "domain",
        )
        case_revenue = [
            {"case": row["case_name"], "revenue": _as_float(row["revenue"])}
            for row in _rows(
                cur,
                """
                SELECT case_name, COALESCE(monthly_expected_revenue, 0) AS revenue
                FROM orion_ods.case
                ORDER BY monthly_expected_revenue DESC NULLS LAST, case_name
                LIMIT 10
                """,
            )
        ]

        top_case = _scalar(
            cur,
            """
            SELECT case_name
            FROM orion_ods.case
            WHERE monthly_expected_revenue IS NOT NULL
            ORDER BY monthly_expected_revenue DESC, case_name
            LIMIT 1
            """,
            default=None,
        )
        top_client = _scalar(
            cur,
            """
            SELECT cl.client_name
            FROM orion_ods.case c
            JOIN orion_ods.client cl ON cl.client_code = c.client_code
            GROUP BY cl.client_name
            ORDER BY COUNT(*) DESC, cl.client_name
            LIMIT 1
            """,
            default=None,
        )
        top_domain = _scalar(
            cur,
            """
            SELECT bd.business_domain_name
            FROM orion_ods.case c
            JOIN orion_ods.business_domain bd
              ON bd.business_domain_code = c.business_domain_code
            GROUP BY bd.business_domain_name
            ORDER BY COUNT(*) DESC, bd.business_domain_name
            LIMIT 1
            """,
            default=None,
        )

        return {
            "metrics": [
                {
                    "label": "Expected monthly revenue",
                    "value": _format_inr(active_revenue),
                    "delta": "",
                    "delta_type": "neutral",
                },
                {
                    "label": "Active clients",
                    "value": _format_int(active_clients),
                    "delta": "",
                    "delta_type": "neutral",
                },
                {
                    "label": "Active cases",
                    "value": _format_int(active_cases),
                    "delta": "",
                    "delta_type": "neutral",
                },
                {
                    "label": "Headcount",
                    "value": _format_int(headcount),
                    "delta": "",
                    "delta_type": "neutral",
                },
                {
                    "label": "Monthly allowed KM",
                    "value": _format_int(allowed_km),
                    "delta": "",
                    "delta_type": "neutral",
                },
                {
                    "label": "Business domains",
                    "value": _format_int(domains),
                    "delta": "",
                    "delta_type": "neutral",
                },
            ],
            "clients_by_status": clients_by_status,
            "clients_by_type": clients_by_type,
            "headcount": headcount_by_status,
            "cases_by_domain": cases_by_domain,
            "case_revenue": case_revenue,
            "snapshot": [
                {"label": "Top case by expected revenue", "value": top_case or _EMPTY},
                {"label": "Client with most cases", "value": top_client or _EMPTY},
                {"label": "Domain with most cases", "value": top_domain or _EMPTY},
            ],
        }
    finally:
        cur.close()
        conn.close()
