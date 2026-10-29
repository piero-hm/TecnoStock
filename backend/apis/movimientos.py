"""Router de movimientos."""

from datetime import date

from fastapi import APIRouter, Depends, Query, status

from core.database import get_connection
from core.deps import get_current_user
from schemas.movimiento import MovimientoCreate, MovimientoResponse
from services import movimiento_service

router = APIRouter(tags=["Movimientos"])


@router.post("/movimientos/entradas", response_model=MovimientoResponse, status_code=status.HTTP_201_CREATED)
def entrada(data: MovimientoCreate, conn=Depends(get_connection), user=Depends(get_current_user)):
    return movimiento_service.registrar_entrada(conn, data, user["id"])


@router.post("/movimientos/salidas", response_model=MovimientoResponse, status_code=status.HTTP_201_CREATED)
def salida(data: MovimientoCreate, conn=Depends(get_connection), user=Depends(get_current_user)):
    return movimiento_service.registrar_salida(conn, data, user["id"])


@router.get("/movimientos", response_model=list[MovimientoResponse])
def listar(
    producto_id: int | None = Query(default=None),
    fecha_desde: date | None = Query(default=None),
    fecha_hasta: date | None = Query(default=None),
    tipo: str | None = Query(default=None, pattern="^(ENTRADA|SALIDA)$"),
    conn=Depends(get_connection),
    user=Depends(get_current_user),
):
    return movimiento_service.listar(conn, producto_id, fecha_desde, fecha_hasta, tipo)
