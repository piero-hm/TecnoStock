"""Repositorio de Categoria (solo procedimientos almacenados)."""

from repositories.base import call_proc, call_proc_one


def crear(conn, nombre: str, descripcion: str | None) -> dict | None:
    return call_proc_one(
        conn,
        "EXEC dbo.usp_Categoria_Crear ?, ?",
        (nombre, descripcion),
    )


def listar(conn) -> list[dict]:
    return call_proc(conn, "EXEC dbo.usp_Categoria_Listar")
