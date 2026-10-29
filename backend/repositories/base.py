"""Helper comun para ejecutar procedimientos almacenados."""

import pyodbc

from core.exceptions import translate_pyodbc_error


def call_proc(conn, sql: str, params: tuple = ()) -> list[dict]:
    cursor = conn.cursor()
    try:
        cursor.execute(sql, params)
    except pyodbc.Error as exc:
        cursor.close()
        raise translate_pyodbc_error(exc)
    columns = [col[0] for col in cursor.description] if cursor.description else []
    try:
        rows = cursor.fetchall()
    except pyodbc.Error as exc:
        cursor.close()
        raise translate_pyodbc_error(exc)
    result = [dict(zip(columns, row)) for row in rows]
    cursor.close()
    return result


def call_proc_one(conn, sql: str, params: tuple = ()) -> dict | None:
    rows = call_proc(conn, sql, params)
    return rows[0] if rows else None
