"""Servicio de Usuario."""

from core.security import hash_password, verify_password
from repositories import usuario_repository


def obtener_por_username(conn, username: str):
    return usuario_repository.obtener_por_username(conn, username)


def login(conn, username: str, password: str):
    from core.exceptions import UnauthorizedError
    from core.security import create_access_token

    user = usuario_repository.obtener_por_username(conn, username)
    if user is None or not user.get("activo"):
        raise UnauthorizedError("CREDENCIALES_INVALIDAS", "Credenciales invalidas.", 401)
    if not verify_password(password, user["password_hash"]):
        raise UnauthorizedError("CREDENCIALES_INVALIDAS", "Credenciales invalidas.", 401)
    token = create_access_token(user["id"], user["username"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "usuario": {
            "id": user["id"],
            "username": user["username"],
            "nombre_completo": user["nombre_completo"],
        },
    }


def sembrar_admin(conn, username: str, password: str, nombre: str) -> None:
    if usuario_repository.obtener_por_username(conn, username) is None:
        usuario_repository.crear(conn, username, hash_password(password), nombre)
