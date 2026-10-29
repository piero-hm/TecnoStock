# TecnoStock Backend

API REST (FastAPI) para el sistema de inventario. Sin ORM: toda persistencia via procedimientos almacenados de SQL Server.

## Capas
- `main.py` -> `apis/` -> `services/` -> `repositories/` (mas `schemas/` y `core/`).

## Ejecucion local
```bash
uv sync
cp .env.example .env
uv run uvicorn main:app
```
Sin `--reload`. Swagger en http://localhost:8000/docs.

## En Docker
Se ejecuta con `docker compose up --build` desde la raiz.

## Ejemplo de flujo: POST /movimientos/salidas
1. `apis/movimientos.py` valida el body con `MovimientoCreate` y llama al service.
2. `services/movimiento_service.py` pasa los datos al repository.
3. `repositories/movimiento_repository.py` ejecuta `EXEC dbo.usp_Movimiento_RegistrarSalida`.
4. El procedimiento actualiza stock y registra el movimiento en una transaccion con UPDLOCK.
5. El resultado vuelve como JSON al cliente.
