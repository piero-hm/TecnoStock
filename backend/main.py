"""Aplicacion principal FastAPI."""

import logging
from contextlib import asynccontextmanager

import pyodbc
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.config import settings
from core.database import build_connection_string
from core.exceptions import AppError
from services import usuario_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("tecnostock")

from apis import auth, categorias, dashboard, movimientos, productos


@asynccontextmanager
async def lifespan(app: FastAPI):
    conn = pyodbc.connect(build_connection_string(), autocommit=True)
    try:
        usuario_service.sembrar_admin(
            conn, settings.ADMIN_USERNAME, settings.ADMIN_PASSWORD, settings.ADMIN_NOMBRE
        )
    finally:
        conn.close()
    yield


app = FastAPI(title="TecnoStock API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": exc.code, "detail": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        campo = ".".join(str(part) for part in err.get("loc", [])[1:])
        errors.append({"campo": campo, "mensaje": err.get("msg")})
    return JSONResponse(
        status_code=422,
        content={"code": "VALIDACION", "detail": "Datos invalidos.", "errors": errors},
    )


@app.exception_handler(Exception)
async def generic_error_handler(request: Request, exc: Exception):
    logger.exception("Error no controlado: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"code": "ERROR_INTERNO", "detail": "Error interno del servidor."},
    )


@app.get("/health")
def health():
    return {"status": "ok"}


for router_module in (auth, categorias, productos, movimientos, dashboard):
    app.include_router(router_module.router, prefix="/api/v1")
