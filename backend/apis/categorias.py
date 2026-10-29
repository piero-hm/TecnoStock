"""Router de categorias."""

from fastapi import APIRouter, Depends, status

from core.database import get_connection
from core.deps import get_current_user
from schemas.categoria import CategoriaCreate, CategoriaResponse
from services import categoria_service

router = APIRouter(tags=["Categorias"])


@router.get("/categorias", response_model=list[CategoriaResponse])
def listar(conn=Depends(get_connection), user=Depends(get_current_user)):
    return categoria_service.listar(conn)


@router.post("/categorias", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED)
def crear(data: CategoriaCreate, conn=Depends(get_connection), user=Depends(get_current_user)):
    return categoria_service.crear(conn, data)
