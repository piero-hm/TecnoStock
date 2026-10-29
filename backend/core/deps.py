"""Dependencias compartidas: usuario autenticado."""

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from core.database import get_connection
from core.exceptions import UnauthorizedError
from core.security import decode_token

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    conn=Depends(get_connection),
):
    if credentials is None:
        raise UnauthorizedError("NO_AUTENTICADO", "Token ausente.", 401)
    try:
        payload = decode_token(credentials.credentials)
    except Exception:
        raise UnauthorizedError("NO_AUTENTICADO", "Token invalido o vencido.", 401)
    user_id = payload.get("sub")
    username = payload.get("username")
    if user_id is None or username is None:
        raise UnauthorizedError("NO_AUTENTICADO", "Token invalido.", 401)
    from services import usuario_service

    user = usuario_service.obtener_por_username(conn, username)
    if user is None or not user.get("activo"):
        raise UnauthorizedError("NO_AUTENTICADO", "Usuario inactivo o no encontrado.", 401)
    if str(user["id"]) != str(user_id):
        raise UnauthorizedError("NO_AUTENTICADO", "Token invalido.", 401)
    return user
