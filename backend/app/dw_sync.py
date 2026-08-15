from datetime import datetime, timezone
from typing import Dict

from app.database import get_connection


def _utcnow():
    return datetime.now(timezone.utc)


def _expire_ods_deleted_codes(cur, now) -> int:
    cur.execute(
        """
        WITH missing AS (
            SELECT DISTINCT d.business_domain_code
            FROM orion_dw.dim_business_domain d
            WHERE d.is_current = TRUE
              AND NOT EXISTS (
                  SELECT 1
                  FROM orion_ods.business_domain o
                  WHERE o.business_domain_code = d.business_domain_code
              )
        )
        UPDATE orion_dw.dim_business_domain d
        SET
            is_expired = TRUE,
            is_current = FALSE,
            effective_to = COALESCE(d.effective_to, %s),
            dw_last_updated_timestamp = %s
        FROM missing m
        WHERE d.business_domain_code = m.business_domain_code
        """,
        (now, now),
    )
    return cur.rowcount


def sync_business_domain() -> Dict[str, int]:
    conn = get_connection()
    cur = conn.cursor()
    stats = {"inserted": 0, "versioned": 0, "expired": 0, "unchanged": 0}

    try:
        cur.execute(
            """
            SELECT business_domain_code, business_domain_name,
                   created_timestamp, last_updated_timestamp
            FROM orion_ods.business_domain
            """
        )
        ods_rows = {
            row[0]: {
                "business_domain_code": row[0],
                "business_domain_name": row[1],
                "created_timestamp": row[2],
                "last_updated_timestamp": row[3],
            }
            for row in cur.fetchall()
        }

        cur.execute(
            """
            SELECT business_domain_sk, business_domain_code, business_domain_name
            FROM orion_dw.dim_business_domain
            WHERE is_current = TRUE
            """
        )
        current_dims = {
            row[1]: {"sk": row[0], "business_domain_name": row[2]}
            for row in cur.fetchall()
        }

        now = _utcnow()

        for code, ods in ods_rows.items():
            current = current_dims.get(code)
            if current is None:
                cur.execute(
                    """
                    INSERT INTO orion_dw.dim_business_domain (
                        business_domain_code, business_domain_name,
                        effective_from, effective_to, is_current, is_expired,
                        source_created_timestamp, source_last_updated_timestamp,
                        dw_created_timestamp, dw_last_updated_timestamp
                    ) VALUES (%s, %s, %s, NULL, TRUE, FALSE, %s, %s, %s, %s)
                    """,
                    (
                        ods["business_domain_code"],
                        ods["business_domain_name"],
                        now,
                        ods["created_timestamp"],
                        ods["last_updated_timestamp"],
                        now,
                        now,
                    ),
                )
                stats["inserted"] += 1
                continue

            if current["business_domain_name"] == ods["business_domain_name"]:
                stats["unchanged"] += 1
                continue

            cur.execute(
                """
                UPDATE orion_dw.dim_business_domain
                SET effective_to = %s, is_current = FALSE, is_expired = FALSE,
                    dw_last_updated_timestamp = %s
                WHERE business_domain_sk = %s
                """,
                (now, now, current["sk"]),
            )
            cur.execute(
                """
                INSERT INTO orion_dw.dim_business_domain (
                    business_domain_code, business_domain_name,
                    effective_from, effective_to, is_current, is_expired,
                    source_created_timestamp, source_last_updated_timestamp,
                    dw_created_timestamp, dw_last_updated_timestamp
                ) VALUES (%s, %s, %s, NULL, TRUE, FALSE, %s, %s, %s, %s)
                """,
                (
                    ods["business_domain_code"],
                    ods["business_domain_name"],
                    now,
                    ods["created_timestamp"],
                    ods["last_updated_timestamp"],
                    now,
                    now,
                ),
            )
            stats["versioned"] += 1

        stats["expired"] = _expire_ods_deleted_codes(cur, now)
        conn.commit()
        return stats
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


DW_SYNC = {"Business Domain": sync_business_domain}
