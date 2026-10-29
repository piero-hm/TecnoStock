"""Schemas de autenticacion."""

from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class UsuarioAuth(BaseModel):
    id: int
    username: str
    nombre_completo: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioAuth


class MeResponse(BaseModel):
    id: int
    username: str
    nombre_completo: str
