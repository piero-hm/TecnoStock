"""Repositorio de Usuario (solo procedimientos almacenados)."""

from repositories.base import call_proc, call_proc_one


def crear(conn, username: str, password_hash: str, nombre_completo: str) -> dict | None:
    return call_proc_one(
        conn,
        "EXEC dbo.usp_Usuario_Crear ?, ?, ?",
        (username, password_hash, nombre_completo),
    )


def obtener_por_username(conn, username: str) -> dict | None:
    return call_proc_one(
        conn,
        "EXEC dbo.usp_Usuario_ObtenerPorUsername ?",
        (username,),
    )
