"""Repositorio de Dashboard (solo procedimientos almacenados)."""

from repositories.base import call_proc_one


def indicadores(conn) -> dict | None:
    return call_proc_one(conn, "EXEC dbo.usp_Dashboard_Indicadores")
