"""Excepciones propias y traduccion de errores de pyodbc."""

import logging
import re

import pyodbc

logger = logging.getLogger("tecnostock")

CODIGO_HTTP = {
    "USUARIO_DUPLICADO": 409,
    "CATEGORIA_DUPLICADA": 409,
    "CATEGORIA_NO_ENCONTRADA": 404,
    "PRODUCTO_CODIGO_DUPLICADO": 409,
    "PRODUCTO_NO_ENCONTRADO": 404,
    "PRODUCTO_INACTIVO": 409,
    "CANTIDAD_INVALIDA": 422,
    "STOCK_INSUFICIENTE": 409,
    "MOTIVO_REQUERIDO": 422,
    "DATOS_INVALIDOS": 422,
    "CREDENCIALES_INVALIDAS": 401,
    "NO_AUTENTICADO": 401,
}


class AppError(Exception):
    def __init__(self, code: str, detail: str, status_code: int = 400):
        self.code = code
        self.detail = detail
        self.status_code = status_code
        super().__init__(f"{code}|{detail}")


class NotFoundError(AppError):
    pass


class ConflictError(AppError):
    pass


class ValidationAppError(AppError):
    pass


class UnauthorizedError(AppError):
    pass


def _clase_por_status(status_code: int):
    return {
        404: NotFoundError,
        409: ConflictError,
        422: ValidationAppError,
        401: UnauthorizedError,
    }.get(status_code, AppError)


def translate_pyodbc_error(exc: pyodbc.Error) -> AppError:
    text = str(exc)
    match = re.search(r"([A-Z][A-Z_]+)\|(.*)", text)
    if match:
        code = match.group(1)
        detail = re.sub(r"\s*\(\d+\).*", "", match.group(2)).strip()
        status_code = CODIGO_HTTP.get(code, 400)
        cls = _clase_por_status(status_code)
        return cls(code, detail, status_code)
    logger.exception("Error pyodbc no traducible: %s", text)
    return AppError("ERROR_INTERNO", "Error interno del servidor.", 500)
