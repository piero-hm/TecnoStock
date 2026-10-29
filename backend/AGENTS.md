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
