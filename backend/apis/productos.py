"""Router de productos."""

from fastapi import APIRouter, Depends, Query, status

from core.database import get_connection
from core.deps import get_current_user
from schemas.producto import ProductoCreate, ProductoResponse, ProductoUpdate
from services import producto_service

router = APIRouter(tags=["Productos"])


@router.get("/productos/stock-bajo", response_model=list[ProductoResponse])
def stock_bajo(conn=Depends(get_connection), user=Depends(get_current_user)):
    return producto_service.stock_bajo(conn)


@router.get("/productos", response_model=list[ProductoResponse])
def listar(
    busqueda: str | None = Query(default=None),
    categoria_id: int | None = Query(default=None),
    incluir_inactivos: bool = Query(default=False),
    conn=Depends(get_connection),
    user=Depends(get_current_user),
):
    return producto_service.listar(conn, busqueda, categoria_id, incluir_inactivos)


@router.get("/productos/{id}", response_model=ProductoResponse)
def obtener(id: int, conn=Depends(get_connection), user=Depends(get_current_user)):
    return producto_service.obtener_por_id(conn, id)


@router.post("/productos", response_model=ProductoResponse, status_code=status.HTTP_201_CREATED)
def crear(data: ProductoCreate, conn=Depends(get_connection), user=Depends(get_current_user)):
    return producto_service.crear(conn, data)


@router.put("/productos/{id}", response_model=ProductoResponse)
def actualizar(id: int, data: ProductoUpdate, conn=Depends(get_connection), user=Depends(get_current_user)):
    return producto_service.actualizar(conn, id, data)


@router.patch("/productos/{id}/desactivar", response_model=ProductoResponse)
def desactivar(id: int, conn=Depends(get_connection), user=Depends(get_current_user)):
    return producto_service.desactivar(conn, id)


@router.patch("/productos/{id}/activar", response_model=ProductoResponse)
def activar(id: int, conn=Depends(get_connection), user=Depends(get_current_user)):
    return producto_service.activar(conn, id)
