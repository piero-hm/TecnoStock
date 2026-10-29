# TecnoStock Backend

API REST con **FastAPI** para el sistema de inventario TecnoStock S.A.C. Toda la persistencia se hace mediante **procedimientos almacenados** de SQL Server (sin ORM).

## Arquitectura

Capas en `backend/`:

- `main.py`: punto de entrada de la aplicación.
- `apis/`: endpoints FastAPI (auth, categorias, productos, movimientos, dashboard).
- `services/`: lógica de negocio por recurso.
- `repositories/`: ejecución de procedimientos almacenados con pyodbc.
- `schemas/`: modelos Pydantic de entrada/salida y errores.
- `core/`: configuración (`config.py`), conexión a BD (`database.py`), seguridad JWT (`security.py`), dependencias (`deps.py`) y excepciones (`exceptions.py`).

Flujo típico: `apis/` valida el body → `services/` → `repositories/` ejecuta `EXEC dbo.usp_*` → SQL Server actualiza datos en transacción → respuesta JSON.

## Stack

- Python 3.12
- FastAPI + Uvicorn
- pyodbc (ODBC Driver 18 for SQL Server)
- Pydantic Settings (variables de entorno)
- SQL Server 2022

## Endpoints principales

Prefijo: `/api/v1`. Swagger: `/docs`. Salud: `GET /health`.

- Auth: `POST /auth/login`, `GET /auth/me`
- Categorías: `GET /categorias`, `POST /categorias`
- Productos: `GET /productos`, `GET /productos/stock-bajo`, `GET /productos/{id}`, `POST /productos`, `PUT /productos/{id}`, `PATCH /productos/{id}/desactivar`, `PATCH /productos/{id}/activar`
- Movimientos: `POST /movimientos/entradas`, `POST /movimientos/salidas`, `GET /movimientos`
- Dashboard: `GET /dashboard/indicadores`

Autenticación por JWT Bearer en todos los endpoints salvo `/health` y `/auth/login`.

## Variables de entorno

Se leen desde `.env` (ver `.env.example` en la raíz o `backend/.env.example`):

- `DB_SERVER`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`: conexión a SQL Server.
- `JWT_SECRET`, `JWT_EXPIRE_MINUTES`: firma y expiración de tokens.
- `CORS_ORIGINS`: orígenes permitidos (separados por coma).
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_NOMBRE`: usuario inicial creado al arrancar si no existe.

## Ejecución local

```bash
cd backend
uv sync
cp .env.example .env
uv run uvicorn main:app
```

Swagger disponible en http://localhost:8000/docs.

## Ejecución con Docker

Se ejecuta desde la raíz con:

```bash
docker compose up --build
```

El backend espera a que `db-init` termine correctamente antes de arrancar.

## Base de datos

- Todas las operaciones de persistencia pasan por procedimientos almacenados (`dbo.usp_*`).
- Los procedimientos usan transacciones con `UPDLOCK` para evitar condiciones de carrera en stock.
- Los errores de negocio se lanzan con códigos como `STOCK_INSUFICIENTE`, `PRODUCTO_NO_ENCONTRADO`, etc. y se traducen a HTTP por el backend.
- Ver `database/README.md` para conexión con SSMS/Azure Data Studio.

## Errores

Formato único:

```json
{ "code": "STOCK_INSUFICIENTE", "detail": "Stock insuficiente: disponible 3, solicitado 5." }
```

Validaciones de Pydantic devuelven `code: "VALIDACION"` con `errors: [{campo, mensaje}]`.

## Notas

- No existe `DELETE /productos/{id}`: los productos solo se desactivan/activan.
- El usuario del movimiento se toma del token JWT, no del cuerpo de la petición.
- Los decimales se serializan como número JSON, no como string.
