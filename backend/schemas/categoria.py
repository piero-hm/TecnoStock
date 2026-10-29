"""Schemas de Categoria."""

from datetime import datetime

from pydantic import BaseModel, Field


class CategoriaCreate(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    descripcion: str | None = Field(default=None, max_length=255)


class CategoriaResponse(BaseModel):
    id: int
    nombre: str
    descripcion: str | None
    fecha_creacion: datetime
