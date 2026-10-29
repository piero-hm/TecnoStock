"""Schemas de Producto."""

from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class ProductoBase(BaseModel):
    codigo: str = Field(..., min_length=1, max_length=30)
    nombre: str = Field(..., min_length=1, max_length=150)
    descripcion: str | None = Field(default=None, max_length=500)
    categoria_id: int
    precio_compra: float = Field(..., gt=0)
    precio_venta: float = Field(..., gt=0)
    stock_minimo: int = Field(default=0, ge=0)

    @field_validator("codigo", "nombre")
    @classmethod
    def strip_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("no puede estar vacio")
        return value

    @field_validator("precio_compra", "precio_venta")
    @classmethod
    def max_dos_decimales(cls, value: float) -> float:
        if round(value, 2) != value:
            raise ValueError("maximo 2 decimales")
        return value


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(ProductoBase):
    pass


class ProductoResponse(BaseModel):
    id: int
    codigo: str
    nombre: str
    descripcion: str | None
    categoria_id: int
    categoria_nombre: str
    precio_compra: float
    precio_venta: float
    stock_actual: int
    stock_minimo: int
    activo: bool
    stock_bajo: bool
    fecha_creacion: datetime
    fecha_actualizacion: datetime
