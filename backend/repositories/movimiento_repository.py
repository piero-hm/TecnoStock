"""Repositorio de Movimiento (solo procedimientos almacenados)."""

from datetime import date, datetime

from repositories.base import call_proc, call_proc_one


def registrar_entrada(conn, producto_id, cantidad, fecha, motivo, usuario_id) -> dict | None:
    return call_proc_one(
        conn,
        "EXEC dbo.usp_Movimiento_RegistrarEntrada ?, ?, ?, ?, ?",
        (producto_id, cantidad, fecha, motivo, usuario_id),
    )


def registrar_salida(conn, producto_id, cantidad, fecha, motivo, usuario_id) -> dict | None:
    return call_proc_one(
        conn,
        "EXEC dbo.usp_Movimiento_RegistrarSalida ?, ?, ?, ?, ?",
        (producto_id, cantidad, fecha, motivo, usuario_id),
    )


def listar(conn, producto_id, fecha_desde, fecha_hasta, tipo) -> list[dict]:
    return call_proc(
        conn,
        "EXEC dbo.usp_Movimiento_Listar ?, ?, ?, ?",
        (producto_id, fecha_desde, fecha_hasta, tipo),
    )
