"""Conexion a SQL Server con pyodbc (autocommit=True)."""

import pyodbc

from fastapi import Depends

from core.config import settings


def build_connection_string() -> str:
    password = settings.DB_PASS.replace("}", "}}")
    return (
        "DRIVER={ODBC Driver 18 for SQL Server};"
        f"SERVER={settings.DB_SERVER},{settings.DB_PORT};"
        f"DATABASE={settings.DB_NAME};"
        f"UID={settings.DB_USER};"
        f"PWD={{{password}}};"
        "Encrypt=yes;TrustServerCertificate=yes"
    )


def get_connection():
    conn = pyodbc.connect(build_connection_string(), autocommit=True)
    try:
        yield conn
    finally:
        conn.close()
