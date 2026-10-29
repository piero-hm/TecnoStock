"""Schemas de Dashboard."""

from pydantic import BaseModel


class DashboardResponse(BaseModel):
    productos_activos: int
    productos_stock_bajo: int
    valor_inventario_compra: float
    valor_inventario_venta: float
