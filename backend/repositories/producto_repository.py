"""Repositorio de Producto (solo procedimientos almacenados)."""

from repositories.base import call_proc, call_proc_one


def crear(conn, codigo, nombre, descripcion, categoria_id, precio_compra, precio_venta, stock_minimo) -> dict | None:
    return call_proc_one(
        conn,
        "EXEC dbo.usp_Producto_Crear ?, ?, ?, ?, ?, ?, ?",
        (codigo, nombre, descripcion, categoria_id, precio_compra, precio_venta, stock_minimo),
    )


def actualizar(conn, id, codigo, nombre, descripcion, categoria_id, precio_compra, precio_venta, stock_minimo) -> dict | None:
    return call_proc_one(
        conn,
        "EXEC dbo.usp_Producto_Actualizar ?, ?, ?, ?, ?, ?, ?, ?",
        (id, codigo, nombre, descripcion, categoria_id, precio_compra, precio_venta, stock_minimo),
    )


def desactivar(conn, id) -> dict | None:
    return call_proc_one(conn, "EXEC dbo.usp_Producto_Desactivar ?", (id,))


def activar(conn, id) -> dict | None:
    return call_proc_one(conn, "EXEC dbo.usp_Producto_Activar ?", (id,))


def obtener_por_id(conn, id) -> dict | None:
    return call_proc_one(conn, "EXEC dbo.usp_Producto_ObtenerPorId ?", (id,))


def listar(conn, busqueda, categoria_id, incluir_inactivos) -> list[dict]:
    return call_proc(
        conn,
        "EXEC dbo.usp_Producto_Listar ?, ?, ?",
        (busqueda, categoria_id, 1 if incluir_inactivos else 0),
    )


def stock_bajo(conn) -> list[dict]:
    return call_proc(conn, "EXEC dbo.usp_Producto_StockBajo")
