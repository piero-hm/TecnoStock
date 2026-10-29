# TecnoStock — Plan de trabajo y guía de ejecución

Esta es la propuesta de cómo hacerlo, en el orden que reduce riesgos. Git/GitHub lo manejas tú.

## 1. Idea general (resumen de la arquitectura)

```
Navegador ──► nginx (frontend, :8080) ──/api──► FastAPI (backend, :8000) ──pyodbc──► SQL Server (db, :1433)
                 Angular 22 compilado           main→apis→services→repositories       tablas + procedimientos
```

- **Todo corre con `docker compose up --build`**, igual en Fedora y en Windows (Docker Desktop). No necesitas SQL Server, Node ni Python instalados para *ejecutar* el proyecto.
- **SQL Server** vive en un contenedor con volumen persistente. Un contenedor auxiliar (`db-init`) crea la base y ejecuta los `.sql` de `database/init/` (idempotentes) y termina. El backend solo arranca cuando eso salió bien.
- **Backend** sin ORM: la capa `repositories` solo llama `EXEC usp_...`. Es lo que la rúbrica premia ("consultas SQL directas" = nota 0 en Backend).
- **Frontend** compilado a estáticos y servido por nginx, que reenvía `/api` al backend. Por eso el Angular de producción usa `apiUrl: '/api/v1'` y funciona en cualquier PC sin cambiar nada. En desarrollo (`ng serve`) usa `http://localhost:8000/api/v1` y entra en juego CORS (tu diagrama).
- **Credenciales**: solo en `.env` (no se sube a GitHub); en el repo va `.env.example`.

## 2. Estructura del repositorio

```
tecnostock/
├── docker-compose.yml
├── .env.example            (.env real NO se sube)
├── .gitignore  .gitattributes
├── README.md               (lo pide la rúbrica: descripción + instalación + ejecución)
├── database/   Dockerfile, run-init.sh, init/*.sql, tests/verificacion.sql, AGENTS.md
├── backend/    Dockerfile, main.py, core/, apis/, services/, repositories/, schemas/, AGENTS.md
├── frontend/   Dockerfile, nginx.conf, src/app/{interfaces,services,core,layout,components,environments}, AGENTS.md
└── docs/       CONTRATOS.md, PLAN_DE_TRABAJO.md, prompts/
```

## 3. Cómo usar los prompts (orden recomendado)

La clave para que los tres agentes no se contradigan es `docs/CONTRATOS.md`: define tablas, procedimientos, endpoints, JSON y errores. Los tres prompts lo leen primero.

| Paso | Qué hacer | Resultado verificable |
|---|---|---|
| 0 | Copia esta carpeta a tu repo, `cp .env.example .env` y cambia las claves. Crea `README.md`. | `docker compose config` sin errores |
| 1 | **Prompt 1 – Base de datos**. Pega la Parte A en `database/AGENTS.md` y la Parte B como tarea. | `docker compose up --build db db-init` termina con "Base de datos lista." (y una segunda vez también) |
| 2 | **Prompt 2 – Backend**. Parte A en `backend/AGENTS.md`, Parte B como tarea. | `http://localhost:8000/docs` funciona; login devuelve token; salida excesiva → 409 |
| 3 | **Prompt 3 – Frontend**. Parte A en `frontend/AGENTS.md`, Parte B como tarea. | `http://localhost:8080` → login → recorrido completo |
| 4 | Prueba de aceptación completa (sección 5) y pulido. | Casillas de la rúbrica marcadas |

Sugerencia de ramas para que el historial de Git se vea bien (rúbrica de Gestión de versiones): `feature/base-de-datos`, `feature/backend-auth`, `feature/backend-productos`, `feature/backend-movimientos`, `feature/frontend-base`, `feature/frontend-productos`, … con un PR por rama. Si tu agente hace todo de una vez, pídele que trabaje por partes pequeñas y haz el commit tú entre una y otra.

## 4. Fedora → Windows: lo que suele fallar

| Problema | Solución |
|---|---|
| En Fedora, `docker compose` no existe | Instala Docker Engine desde el repo oficial de Docker (`docker-ce`, `docker-compose-plugin`) y `sudo systemctl enable --now docker`. Con Podman puede funcionar pero SQL Server y los healthchecks dan más problemas. |
| `permission denied` al usar docker | `sudo usermod -aG docker $USER` y vuelve a iniciar sesión. |
| SQL Server se reinicia solo / "not enough memory" | Necesita ≥ 2 GB libres para Docker. En Docker Desktop (Windows): Settings → Resources → Memory ≥ 4 GB. |
| Puerto 1433 ocupado en Windows (hay un SQL Server local) | En `.env` pon `DB_PORT_HOST=14330`. Solo cambia el puerto visible desde tu PC; los contenedores siguen usando 1433. |
| Puerto 8080 u 8000 ocupado | Cambia `FRONTEND_PORT` / `BACKEND_PORT` en `.env`. Si cambias `FRONTEND_PORT`, agrega ese origen a `CORS_ORIGINS` (solo importa en desarrollo con `ng serve`). |
| `db-init` falla con "Password validation failed" | La clave SA debe tener 8+ caracteres con mayúscula, minúscula, número y símbolo, y no usar `$`. Si ya se creó el volumen con otra clave: `docker compose down -v` y vuelve a levantar (⚠ borra los datos). |
| Scripts `.sh` con error `\r: command not found` | Saltos de línea CRLF de Windows. Por eso existe `.gitattributes` (fuerza LF) y el Dockerfile de `database` los limpia. |
| Cambié un `.sql` y no se aplica | `docker compose up --build db-init` (la imagen lleva los scripts adentro). Si cambiaste una **tabla** ya creada, los scripts idempotentes no la modifican: o añade un `ALTER` o reinicia con `down -v`. |
| La imagen de SQL Server no arranca en un PC con procesador ARM | La imagen es para x86-64. Los PC del laboratorio y tu Fedora normalmente lo son. |
| En la universidad no hay internet o bloquean Docker Hub / paquetes | Llega con las imágenes ya construidas: `docker compose build` en casa y `docker save`/`docker load`, o prueba el despliegue antes en otra red. Bootstrap por CDN también necesita internet. |

Comandos útiles:
```bash
docker compose up --build            # levantar todo (la primera vez tarda varios minutos)
docker compose up -d --build         # en segundo plano
docker compose logs -f backend       # ver logs de un servicio
docker compose ps                    # estado y salud
docker compose down                  # apagar (conserva los datos)
docker compose down -v               # apagar y BORRAR la base de datos (reinicio limpio)
```

Conectarte a la base con un cliente gráfico (Azure Data Studio, DBeaver): servidor `localhost,<DB_PORT_HOST>`, usuario `sa`, tu clave, "Trust server certificate" activado.

Desarrollo con recarga rápida (opcional): levanta solo la base (`docker compose up -d db db-init`), el backend con `uv run uvicorn main:app` (sin `--reload`, como en clase; necesita el driver ODBC 18 instalado en Fedora; si no quieres instalarlo, usa el backend en Docker) y el frontend con `npx ng serve` en `:4200`.

## 5. Prueba de aceptación (contra la rúbrica y la nota de sustentación)

**Funcionalidades y reglas de negocio**
- [ ] Crear categoría; no permite nombre duplicado.
- [ ] Crear producto con todos sus campos; código duplicado → error claro; precio 0 o negativo → error.
- [ ] Buscar por código/nombre y filtrar por categoría; editar; desactivar y reactivar.
- [ ] Entrada: sube el stock y aparece en el historial con stock anterior/posterior.
- [ ] Salida: baja el stock; una salida mayor al stock se rechaza y no cambia nada.
- [ ] Cantidad `0`, negativa o decimal → rechazada (formulario y API).
- [ ] Un producto con movimientos no se puede borrar; solo desactivar (su historial sigue visible).
- [ ] Dashboard: productos activos, stock bajo, valor del inventario, movimientos por rango de fechas.

**Frontend:** Signal Forms con mensajes de error; categorías cargadas desde la API (no escritas en el código); la lista se actualiza sola tras guardar; se ve bien a 360 px.
**Backend:** capas separadas; ningún SQL suelto (`grep -rniE "select |insert |update |delete " backend --include=*.py`); errores con códigos HTTP correctos.
**Base de datos:** PK/FK/CHECK/UNIQUE; todo por procedimientos almacenados; entradas y salidas con transacción; un cambio hecho directamente en SQL Server se ve al refrescar la app.
**Git:** ramas por funcionalidad, commits descriptivos, PRs, README con instalación y ejecución.

## 6. Prepararte para la sustentación (vale tanto como el código)

Te preguntarán por *tu* código aunque lo haya escrito la IA. Antes de entregar, que puedas explicar con tus palabras:
1. El recorrido de una salida: formulario Signal Form → service → interceptor → FastAPI (api → service → repository) → `usp_Movimiento_RegistrarSalida`.
2. Por qué el stock se actualiza **dentro de una transacción** con el historial, y qué hace `UPDLOCK` (dos salidas simultáneas no pueden dejar stock negativo).
3. Qué es CORS y por qué en Docker no hace falta (nginx hace de proxy) pero en `ng serve` sí.
4. Por qué no hay ORM y qué gana el proyecto con los procedimientos almacenados.
5. Para qué sirven `.env`, `environment.ts` y el `docker-compose.yml`.
Pide a tu agente al final de cada prompt "explícame el archivo X línea por línea" en lo que no entiendas.

## 7. README.md del repositorio (sugerencia de contenido para pedírselo al agente al final)

Descripción del proyecto · tecnologías · requisitos (Docker) · instalación (`git clone`, `cp .env.example .env`, editar claves) · ejecución (`docker compose up --build`) ·
URLs (app, Swagger, puertos) · usuario inicial · cómo reiniciar la base · estructura de carpetas · tabla de endpoints (resumen) · autor.
