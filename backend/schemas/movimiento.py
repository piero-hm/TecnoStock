"""Schemas de Movimiento."""

from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class MovimientoCreate(BaseModel):
    producto_id: int
    cantidad: int = Field(..., gt=0)
    fecha: datetime
    motivo: str = Field(..., min_length=1, max_length=255)

    @field_validator("motivo")
    @classmethod
    def strip_motivo(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("no puede estar vacio")
        return value


class MovimientoResponse(BaseModel):
    id: int
    producto_id: int
    producto_codigo: str
    producto_nombre: str
    tipo: str
    cantidad: int
    fecha: datetime
    motivo: str
    stock_anterior: int
    stock_posterior: int
    usuario_username: str | None
    fecha_registro: datetime
