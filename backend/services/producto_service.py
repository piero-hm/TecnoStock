"""Servicio de Producto."""

from repositories import producto_repository


def crear(conn, data):
    return producto_repository.crear(
        conn,
        data.codigo,
        data.nombre,
        data.descripcion,
        data.categoria_id,
        data.precio_compra,
        data.precio_venta,
        data.stock_minimo,
    )


def actualizar(conn, id, data):
    return producto_repository.actualizar(
        conn,
        id,
        data.codigo,
        data.nombre,
        data.descripcion,
        data.categoria_id,
        data.precio_compra,
        data.precio_venta,
        data.stock_minimo,
    )


def desactivar(conn, id):
    return producto_repository.desactivar(conn, id)


def activar(conn, id):
    return producto_repository.activar(conn, id)


def obtener_por_id(conn, id):
    return producto_repository.obtener_por_id(conn, id)


def listar(conn, busqueda, categoria_id, incluir_inactivos):
    return producto_repository.listar(conn, busqueda, categoria_id, incluir_inactivos)


def stock_bajo(conn):
    return producto_repository.stock_bajo(conn)
