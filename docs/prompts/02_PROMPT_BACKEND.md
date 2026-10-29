# PROMPT 2 — BACKEND (FastAPI, sin ORM)

> **Cómo usarlo:** abre tu agente en la raíz del proyecto.
> 1) Pega la **PARTE A** en el `AGENTS.md` de `backend/` (créalo si no existe).
> 2) Pega la **PARTE B** como la tarea.
> Hazlo **después** del prompt de base de datos.

---

## PARTE A — Para `backend/AGENTS.md` (reglas permanentes)

```markdown
# Reglas de la carpeta backend/

## Stack
- Python 3.12, FastAPI, Uvicorn, Pydantic v2 + pydantic-settings, pyodbc (driver "ODBC Driver 18 for SQL Server"), PyJWT, bcrypt.
- Gestor de paquetes: **uv** (`pyproject.toml` + `uv.lock`, se commitea el lock). No se usa `requirements.txt` ni `pip install` a mano.
- El servidor se ejecuta con `uv run uvicorn main:app` **SIN `--reload`** (así se trabaja en clase; el reload carga las máquinas). Para ver cambios se reinicia el comando.
- Base de datos: SQL Server. **NO se usa ORM** (nada de SQLAlchemy, SQLModel, Tortoise, etc.).
- Configuración y credenciales: SOLO por variables de entorno / archivo `.env` (DB_SERVER, DB_PORT, DB_USER, DB_PASS, DB_NAME, ...). Nunca en el código. `.env` no se sube a git; existe `.env.example`.

## Arquitectura por capas (estructura vista en clase)
main.py -> apis -> services -> repositories, más schemas (y un paquete core de apoyo).

backend/
  main.py             # crea la app, CORS, handlers de errores, registra routers, /health, siembra del admin
  core/               # config.py (settings), database.py (conexión), security.py (hash + JWT), exceptions.py, deps.py
  apis/               # routers FastAPI: SOLO HTTP (parámetros, status codes, llamar al service)
  services/           # reglas de negocio y orquestación; sin SQL y sin objetos HTTP
  repositories/       # ÚNICO lugar que habla con SQL Server, y solo con procedimientos almacenados
  schemas/            # modelos Pydantic de entrada y salida

Responsabilidades (se evalúan en la sustentación):
- apis: valida entrada con schemas, llama a UN service, devuelve el schema de respuesta. Cero SQL, cero reglas de negocio, cero try/except de pyodbc.
- services: aplica reglas de negocio (ej. hash de contraseña, usuario que registra el movimiento, rango de fechas), llama a repositories, lanza excepciones propias (AppError y subclases).
- repositories: ejecuta `EXEC dbo.usp_...` con parámetros `?` y convierte las filas en dict/schemas. **Prohibido** escribir SELECT/INSERT/UPDATE/DELETE en el código Python: todas las operaciones de base de datos son llamadas a procedimientos almacenados.
- schemas: validaciones de forma/rango (Field, validators) iguales a las de `docs/CONTRATOS.md` sección 2.1.

## Convenciones
- Fuente de verdad de endpoints, JSON, errores y procedimientos: `docs/CONTRATOS.md`. No inventes rutas ni nombres.
- Conexión pyodbc con `autocommit=True` (cada procedimiento maneja su propia transacción), una conexión por petición (dependencia que abre y cierra), parámetros siempre con `?`.
- Errores de negocio: los procedimientos lanzan mensajes `CODIGO|mensaje`; el repositorio/`core/exceptions.py` los traduce a excepciones propias con su código HTTP según la tabla 1.4 de CONTRATOS. Formato de error único: `{"code": "...", "detail": "..."}`.
- Nunca devuelvas trazas ni mensajes técnicos al cliente en errores 500; regístralos con `logging`.
- Código simple y legible, con docstring corto en español al inicio de cada módulo explicando su responsabilidad. El estudiante debe poder explicarlo todo.
- No modifiques `backend/Dockerfile` ni el `docker-compose.yml` de la raíz salvo error real (y avisa).
```

---

## PARTE B — La tarea

```markdown
Eres un desarrollador backend senior de Python/FastAPI. Implementa el backend del sistema de inventario "TecnoStock S.A.C.".

## Contexto
Lee primero `docs/CONTRATOS.md` completo (secciones 1 a 4) y los scripts de `database/init/` (ya existen los procedimientos almacenados).
El backend es una API REST para una app Angular. Sigue la arquitectura y las reglas de `backend/AGENTS.md`.

## Qué debes crear (en `backend/`)

1. Proyecto **uv** en `backend/`: `pyproject.toml` (`requires-python = ">=3.12"`, nombre `tecnostock-backend`) y `uv.lock`.
   Créalos con `uv init --bare` (o equivalente) y `uv add fastapi uvicorn pydantic-settings pyodbc PyJWT bcrypt` (pydantic llega con fastapi). No crees `requirements.txt`.
   Ejecuta `uv lock` para dejar `uv.lock` actualizado y no lo borres: el `Dockerfile` ya existe y hace `uv sync --frozen` con esos dos archivos y arranca `uv run uvicorn main:app` (sin `--reload`).
   No incluyas `.venv/` en el repo (ya está en `.gitignore`).
2. `.env.example` para ejecución local fuera de Docker (DB_SERVER=localhost, DB_PORT=1433 o el que uses en `DB_PORT_HOST`, DB_USER=sa, DB_PASS, DB_NAME, JWT_SECRET, JWT_EXPIRE_MINUTES, CORS_ORIGINS, ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_NOMBRE).
3. **core/**
   - `config.py`: clase `Settings(BaseSettings)` que lee variables de entorno y `.env` (los nombres exactos de CONTRATOS sección 3). `CORS_ORIGINS` se convierte en lista.
   - `database.py`: arma la cadena de conexión
     `DRIVER={ODBC Driver 18 for SQL Server};SERVER=<host>,<puerto>;DATABASE=<db>;UID=<user>;PWD={<pass>};Encrypt=yes;TrustServerCertificate=yes`
     (escapando `}` en la contraseña), y expone una dependencia FastAPI `get_connection()` con `yield` que abre la conexión con `autocommit=True` y la cierra siempre.
   - `security.py`: `hash_password` / `verify_password` con bcrypt (usa el paquete `bcrypt` directamente, NO passlib), `create_access_token` / `decode_token` con PyJWT (claim `sub` = id de usuario, expiración desde settings).
   - `exceptions.py`: `AppError(code, detail, status_code)` y subclases (`NotFoundError`, `ConflictError`, `ValidationAppError`, `UnauthorizedError`), más la función que traduce un `pyodbc.Error` en `AppError` leyendo el patrón `CODIGO|mensaje` del texto del error (tabla 1.4 de CONTRATOS). Cualquier otro `pyodbc.Error` → `ERROR_INTERNO` 500 (log del detalle). Prueba con un error real: el texto del error de pyodbc incluye el mensaje del THROW junto con prefijos del driver y sufijos como `(50041) (SQLExecDirectW)`; tu regex debe extraer solo el mensaje legible.
   - `deps.py`: dependencia `get_current_user` (lee `Authorization: Bearer`, valida el JWT, consulta el usuario vía service y exige `activo`).
4. **repositories/** (`usuario_repository.py`, `categoria_repository.py`, `producto_repository.py`, `movimiento_repository.py`, `dashboard_repository.py`):
   una clase o conjunto de funciones por entidad que reciben la conexión, ejecutan `EXEC dbo.usp_...` con parámetros `?` y devuelven diccionarios con el nombre de columna (usa `cursor.description`).
   Un helper común en `repositories/base.py` (ejecutar procedimiento y devolver una fila / varias filas) evita repetir código.
   Importante: lee el result set **antes** de cerrar el cursor y maneja procedimientos que lanzan error antes de devolver filas.
5. **schemas/**: `auth`, `categoria`, `producto`, `movimiento`, `dashboard`, `error` (entrada y salida, con las validaciones de CONTRATOS 2.1).
   Los decimales de salida deben serializarse como número JSON (usa `float` en los schemas de respuesta o un serializer), no como string.
6. **services/**: `auth_service` (login: busca usuario, verifica hash, genera token; siembra del admin), `categoria_service`, `producto_service`, `movimiento_service`
   (el `usuario_id` viene del usuario autenticado; valida `fecha_desde <= fecha_hasta`), `dashboard_service`.
7. **apis/**: un router por recurso con exactamente las rutas de CONTRATOS sección 2 (prefijo `/api/v1`, tags en español, `response_model`, `status_code=201` al crear).
   Todas protegidas con `Depends(get_current_user)` salvo `/auth/login`. `GET /productos/stock-bajo` se declara antes que `/productos/{id}`.
8. `main.py`:
   - `FastAPI(title="TecnoStock API", version="1.0.0")` con `lifespan` que **siembra el usuario administrador** si no existe
     (usa `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_NOMBRE`; hash bcrypt; idempotente).
   - `CORSMiddleware` con `allow_origins=settings.cors_origins`, métodos y headers permitidos (incluye `Authorization`), `allow_credentials=False`.
   - Handlers globales: `AppError` → JSON `{code, detail}`; `RequestValidationError` → 422 con `code: "VALIDACION"` y lista `errors`; `Exception` → 500 genérico.
   - `GET /health` → `{"status": "ok"}` (no toca la base de datos, sin auth).
9. Un `backend/README.md` corto con: estructura de capas, cómo ejecutar local (`uv sync` y luego `uv run uvicorn main:app`, sin `--reload`) y en Docker, y una tabla "qué capa hace qué" con 1 ejemplo real del proyecto
   (por ejemplo el recorrido de `POST /movimientos/salidas` por api → service → repository → `usp_Movimiento_RegistrarSalida`).

## Reglas clave que deben cumplirse (se evalúan)
- Cero SQL "suelto": solo `EXEC dbo.usp_...`. Un `grep -rniE "select |insert |update |delete " backend --include=*.py` no debe encontrar SQL en el código.
- Entradas/salidas: la API NO calcula ni actualiza stock; solo llama al procedimiento (que ya lo hace dentro de una transacción). Una salida mayor al stock devuelve HTTP 409 con `STOCK_INSUFICIENTE`.
- Los endpoints devuelven datos frescos: no hay caché en memoria.
- Cantidad entera > 0; precios > 0; stock mínimo >= 0; código único (409); no existe `DELETE` de productos.
- Credenciales solo desde variables de entorno; nada de contraseñas en el repo.
- Si la base de datos no responde: error 503/500 controlado con mensaje genérico, no traza.

## Cómo verificar (hazlo si tienes Docker; si no, deja los comandos en el README)

```bash
docker compose up --build -d
docker compose logs backend | tail -n 30
curl -s http://localhost:8000/health
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"Admin_12345"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["access_token"])')
curl -s http://localhost:8000/api/v1/productos -H "Authorization: Bearer $TOKEN" | head -c 400
# salida mayor al stock -> debe dar 409 y {"code":"STOCK_INSUFICIENTE",...}
curl -s -X POST http://localhost:8000/api/v1/movimientos/salidas -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"producto_id":1,"cantidad":99999,"fecha":"2026-10-28T10:00:00","motivo":"prueba"}'
```
Comprueba también: sin token → 401; cantidad `0` → 422; código duplicado → 409; filtros de `/movimientos` por producto y fechas; `/dashboard/indicadores`; y que tras registrar una entrada, `GET /productos/{id}` muestra el stock nuevo.

## Entrega
Código completo y funcionando. Al final, un resumen de máximo 10 líneas con el flujo de una petición por las capas y 3 decisiones técnicas que el estudiante debe saber explicar
(autocommit + transacción dentro del procedimiento, traducción de errores `CODIGO|mensaje`, por qué el stock no se calcula en Python).
```
