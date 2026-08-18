"""Dashboard metrics must come from Postgres ODS, never placeholders."""

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from db.connection import get_connection
from db.dashboard import get_dashboard_data


def _metric(data, label):
    for item in data["metrics"]:
        if item["label"] == label:
            return item["value"]
    raise AssertionError(f"missing metric: {label}")


class DashboardDataTests(unittest.TestCase):
    def test_metrics_match_live_table_counts(self):
        data = get_dashboard_data()
        conn = get_connection()
        cur = conn.cursor()
        try:
            cur.execute("SELECT COUNT(*) FROM orion_ods.client WHERE client_status = 'Active'")
            active_clients = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM orion_ods.case WHERE COALESCE(case_status, 'Active') = 'Active'")
            active_cases = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM orion_ods.employee")
            employees = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM orion_ods.business_domain")
            domains = cur.fetchone()[0]
            cur.execute(
                """
                SELECT COALESCE(SUM(monthly_expected_revenue), 0)
                FROM orion_ods.case
                WHERE COALESCE(case_status, 'Active') = 'Active'
                """
            )
            revenue = float(cur.fetchone()[0] or 0)
        finally:
            cur.close()
            conn.close()

        self.assertEqual(_metric(data, "Active clients"), f"{active_clients:,}")
        self.assertEqual(_metric(data, "Active cases"), f"{active_cases:,}")
        self.assertEqual(_metric(data, "Headcount"), f"{employees:,}")
        self.assertEqual(_metric(data, "Business domains"), f"{domains:,}")
        if revenue == 0:
            self.assertEqual(_metric(data, "Expected monthly revenue"), "₹0")
        self.assertTrue(any(row["type"] == "Active" and row["count"] >= 1 for row in data["clients_by_status"]))
        if active_cases == 0:
            self.assertEqual(data["case_revenue"], [])
            self.assertEqual(data["snapshot"][0]["value"], "—")
        if employees == 0:
            self.assertEqual(data["headcount"], [])

    def test_inserted_case_appears_then_is_removed(self):
        before = get_dashboard_data()
        before_cases = int(_metric(before, "Active cases").replace(",", ""))

        conn = get_connection()
        cur = conn.cursor()
        case_code = None
        try:
            cur.execute("SELECT client_code FROM orion_ods.client ORDER BY client_code LIMIT 1")
            client_code = cur.fetchone()[0]
            cur.execute("SELECT client_name FROM orion_ods.client WHERE client_code = %s", (client_code,))
            client_name = cur.fetchone()[0]
            cur.execute("SELECT capability_code FROM orion_ods.capability ORDER BY capability_code LIMIT 1")
            capability_code = cur.fetchone()[0]
            cur.execute(
                "SELECT business_domain_code, business_domain_name FROM orion_ods.business_domain ORDER BY business_domain_code LIMIT 1"
            )
            domain_code, domain_name = cur.fetchone()

            cur.execute(
                """
                INSERT INTO orion_ods.case (
                    case_name, client_code, case_status, capability_code,
                    monthly_expected_revenue, monthly_allowed_km, business_domain_code
                )
                VALUES (%s, %s, 'Active', %s, %s, %s, %s)
                RETURNING case_code
                """,
                ("Dashboard Probe Case", client_code, capability_code, 250000, 40, domain_code),
            )
            case_code = cur.fetchone()[0]
            conn.commit()

            data = get_dashboard_data()
            self.assertEqual(int(_metric(data, "Active cases").replace(",", "")), before_cases + 1)
            self.assertEqual(_metric(data, "Expected monthly revenue"), "₹2.5L")
            self.assertEqual(_metric(data, "Monthly allowed KM"), "40")
            self.assertEqual(data["case_revenue"][0]["case"], "Dashboard Probe Case")
            self.assertEqual(data["case_revenue"][0]["revenue"], 250000.0)
            self.assertEqual(data["cases_by_domain"][0]["domain"], domain_name)
            self.assertEqual(data["snapshot"][0]["value"], "Dashboard Probe Case")
            self.assertEqual(data["snapshot"][1]["value"], client_name)
            self.assertEqual(data["snapshot"][2]["value"], domain_name)
        finally:
            if case_code:
                cur.execute("DELETE FROM orion_ods.case WHERE case_code = %s", (case_code,))
                conn.commit()
            cur.close()
            conn.close()

        data = get_dashboard_data()
        self.assertEqual(int(_metric(data, "Active cases").replace(",", "")), before_cases)
        self.assertFalse(any(row["case"] == "Dashboard Probe Case" for row in data["case_revenue"]))


if __name__ == "__main__":
    unittest.main()
