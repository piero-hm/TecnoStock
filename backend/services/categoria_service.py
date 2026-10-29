"""Servicio de Categoria."""

from repositories import categoria_repository


def crear(conn, data):
    return categoria_repository.crear(conn, data.nombre, data.descripcion)


def listar(conn):
    return categoria_repository.listar(conn)
