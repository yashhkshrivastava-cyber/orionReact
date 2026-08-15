from app.database import db_cursor


def insert(table, columns, values):
    cols = ", ".join(columns)
    placeholders = ", ".join(["%s"] * len(values))
    query = f"INSERT INTO {table} ({cols}) VALUES ({placeholders})"
    with db_cursor(commit=True) as cur:
        cur.execute(query, values)


def update(table, columns, values, record_id, pk_column="id"):
    set_clause = ", ".join([f"{col} = %s" for col in columns])
    set_clause += ", last_updated_timestamp = CURRENT_TIMESTAMP"
    query = f"UPDATE {table} SET {set_clause} WHERE {pk_column} = %s"
    with db_cursor(commit=True) as cur:
        cur.execute(query, values + [record_id])


def delete_record(table, record_id, pk_column="id"):
    with db_cursor(commit=True) as cur:
        cur.execute(f"DELETE FROM {table} WHERE {pk_column} = %s", (record_id,))


def fetch_dropdown(table, display_col, pk_column="id"):
    with db_cursor() as cur:
        cur.execute(f"SELECT {pk_column}, {display_col} FROM {table}")
        return cur.fetchall()


def fetch_by_id(table, record_id, pk_column="id"):
    with db_cursor() as cur:
        cur.execute(f"SELECT * FROM {table} WHERE {pk_column} = %s", (record_id,))
        row = cur.fetchone()
        if not row:
            return None
        cols = [desc[0] for desc in cur.description]
        return dict(zip(cols, row))


def fetch_top_n(table, n=10):
    query = f"""
    SELECT * FROM {table}
    ORDER BY created_timestamp DESC
    LIMIT {n}
    """
    with db_cursor() as cur:
        cur.execute(query)
        data = cur.fetchall()
        cols = [desc[0] for desc in cur.description]
        return cols, data
