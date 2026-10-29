# TecnoStock S.A.C. — Sistema de inventario de equipos informáticos

TecnoStock es una aplicación web para gestionar el inventario de equipos informáticos de una tienda/empresa: productos, categorías, stock mínimo, entradas y salidas de mercadería, historial de movimientos, alertas de stock bajo y un dashboard con indicadores y estadísticas.

## Arquitectura

- `frontend/`: Angular 22 (componentes standalone) + Bootstrap 5.3 + CSS propio. Interfaz oscura moderna.
- `backend/`: FastAPI (Python) con API REST. Sin ORM: toda la persistencia se hace mediante procedimientos almacenados de SQL Server.
- `database/`: scripts SQL de tablas, índices, procedimientos almacenados y datos de demostración.
- `docker-compose.yml`: orquesta SQL Server, inicialización de la BD, backend y frontend (nginx).

## Arranque rápido (Docker)

```bash
cp .env.example .env
# Edita .env y cambia al menos MSSQL_SA_PASSWORD y JWT_SECRET
docker compose up --build
```

URLs:
- Frontend: http://localhost:8080 (o el puerto de `FRONTEND_PORT`)
- API/Swagger: http://localhost:8000/docs

Credenciales iniciales (se crean al arrancar el backend):
- Usuario: `admin` (o `ADMIN_USERNAME`)
- Contraseña: `Admin_12345` (o `ADMIN_PASSWORD`)

## Estructura del proyecto

```text
TecnoStock/
  frontend/     # Angular
  backend/      # FastAPI
  database/     # SQL Server (scripts init)
  docs/         # Contratos y plan de trabajo
  docker-compose.yml
  .env.example
```

## Variables de entorno

Copiar `.env.example` a `.env`. El archivo `.env` no se sube a GitHub (está en `.gitignore`).

Variables principales:
- `MSSQL_SA_PASSWORD`: contraseña del usuario `sa` de SQL Server.
- `DB_NAME`: nombre de la base de datos (por defecto `TecnoStockDB`).
- `DB_PORT_HOST`: puerto publicado en tu PC para SQL Server (por defecto `1433`).
- `JWT_SECRET`: clave para firmar tokens JWT.
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_NOMBRE`: usuario inicial.

## Conexión a SQL Server (SSMS / Azure Data Studio)

La base de datos corre en el contenedor `tecnostock-db`. Para conectarte desde SSMS o Azure Data Studio en tu PC:

- Servidor: `localhost,<DB_PORT_HOST>` (por defecto `localhost,1433`; si cambiaste `DB_PORT_HOST`, usa ese puerto)
- Autenticación: SQL Server Authentication (no Windows)
- Usuario: `sa`
- Contraseña: valor de `MSSQL_SA_PASSWORD` del `.env`
- Base de datos: `DB_NAME` (por defecto `TecnoStockDB`)

Notas:
- Si el puerto `1433` está ocupado en Windows por un SQL Server local, cambia `DB_PORT_HOST` en `.env` (por ejemplo `14333`) y reinicia con `docker compose up -d`.
- Dentro de la red de Docker el backend se conecta con `DB_SERVER=db` y puerto `1433`; desde tu PC siempre usa `localhost` y el puerto publicado.
- Si SSMS pide cifrado, habilita “Trust server certificate” (el contenedor usa certificado autofirmado).
- En Azure Data Studio: New Connection → Connection type: Microsoft SQL Server → Server: `localhost,<puerto>` → Authentication type: SQL Login → User name: `sa` → Password: `MSSQL_SA_PASSWORD`.

## Desarrollo local (sin Docker)

Backend:
```bash
cd backend
uv sync
cp .env.example .env
uv run uvicorn main:app
```

Frontend:
```bash
cd frontend
npm install
npm start
```

El frontend de desarrollo usa `http://localhost:8000/api/v1` (ver `src/environments/environment.development.ts`).

## Rutas principales del frontend

- `/login`
- `/dashboard`
- `/productos`, `/productos/nuevo`, `/productos/:id/editar`
- `/categorias`
- `/movimientos/entrada`, `/movimientos/salida`, `/movimientos`
- `/stock-bajo`

## API

La API REST está documentada en Swagger: http://localhost:8000/docs. Prefijo: `/api/v1`.
Fuentes de datos del frontend: `GET /productos`, `GET /productos/stock-bajo`, `GET /movimientos` y `GET /dashboard/indicadores`.

## Licencia

Proyecto académico/demostrativo. Ajusta según tus necesidades.
