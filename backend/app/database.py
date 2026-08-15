from contextlib import contextmanager

import psycopg2

from app.config import db_settings


def get_connection():
    return psycopg2.connect(**db_settings())


@contextmanager
def db_cursor(commit=False):
    conn = get_connection()
    cur = conn.cursor()
    try:
        yield cur
        if commit:
            conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()
