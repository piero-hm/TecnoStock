"""Router de dashboard."""

from fastapi import APIRouter, Depends

from core.database import get_connection
from core.deps import get_current_user
from schemas.dashboard import DashboardResponse
from services import dashboard_service

router = APIRouter(tags=["Dashboard"])


@router.get("/dashboard/indicadores", response_model=DashboardResponse)
def indicadores(conn=Depends(get_connection), user=Depends(get_current_user)):
    return dashboard_service.indicadores(conn)
