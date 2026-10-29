"""Servicio de Dashboard."""

from repositories import dashboard_repository


def indicadores(conn):
    return dashboard_repository.indicadores(conn)
