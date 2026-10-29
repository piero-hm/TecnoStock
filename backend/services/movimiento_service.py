"""Servicio de Movimiento."""

from core.exceptions import ValidationAppError
from repositories import movimiento_repository


def registrar_entrada(conn, data, usuario_id):
    return movimiento_repository.registrar_entrada(
        conn, data.producto_id, data.cantidad, data.fecha, data.motivo, usuario_id
    )


def registrar_salida(conn, data, usuario_id):
    return movimiento_repository.registrar_salida(
        conn, data.producto_id, data.cantidad, data.fecha, data.motivo, usuario_id
    )


def listar(conn, producto_id, fecha_desde, fecha_hasta, tipo):
    if fecha_desde is not None and fecha_hasta is not None and fecha_desde > fecha_hasta:
        raise ValidationAppError("DATOS_INVALIDOS", "fecha_desde debe ser <= fecha_hasta.", 422)
    return movimiento_repository.listar(conn, producto_id, fecha_desde, fecha_hasta, tipo)
