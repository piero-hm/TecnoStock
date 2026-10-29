"""Router de autenticacion."""

from fastapi import APIRouter, Depends

from core.database import get_connection
from core.deps import get_current_user
from schemas.auth import LoginRequest, LoginResponse, MeResponse
from services import usuario_service

router = APIRouter(tags=["Autenticacion"])


@router.post("/auth/login", response_model=LoginResponse)
def login(data: LoginRequest, conn=Depends(get_connection)):
    return usuario_service.login(conn, data.username, data.password)


@router.get("/auth/me", response_model=MeResponse)
def me(current_user=Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "username": current_user["username"],
        "nombre_completo": current_user["nombre_completo"],
    }
