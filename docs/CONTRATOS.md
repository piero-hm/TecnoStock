# CONTRATOS DEL SISTEMA TecnoStock (fuente de verdad)

Este documento lo leen los tres agentes (base de datos, backend y frontend).
Si algo del prompt contradice este documento, **gana este documento**.
Convención global: nombres en **español** y en **snake_case** en BD, JSON e interfaces TypeScript
(así no hay que traducir nombres entre capas).

---

## 1. Base de datos (SQL Server 2022)

Base de datos: la del valor de `DB_NAME` (por defecto `TecnoStockDB`). Esquema: `dbo`.

### 1.1 Tablas

| Tabla | Columnas | Restricciones |
|---|---|---|
| `Usuario` | `id INT IDENTITY PK`, `username NVARCHAR(50)`, `password_hash NVARCHAR(255)`, `nombre_completo NVARCHAR(100)`, `activo BIT DEFAULT 1`, `fecha_creacion DATETIME2(0) DEFAULT SYSUTCDATETIME()` | `username` UNIQUE NOT NULL |
| `Categoria` | `id INT IDENTITY PK`, `nombre NVARCHAR(100)`, `descripcion NVARCHAR(255) NULL`, `fecha_creacion DATETIME2(0)` | `nombre` UNIQUE NOT NULL |
| `Producto` | `id INT IDENTITY PK`, `codigo NVARCHAR(30)`, `nombre NVARCHAR(150)`, `descripcion NVARCHAR(500) NULL`, `categoria_id INT FK→Categoria`, `precio_compra DECIMAL(12,2)`, `precio_venta DECIMAL(12,2)`, `stock_actual INT DEFAULT 0`, `stock_minimo INT DEFAULT 0`, `activo BIT DEFAULT 1`, `fecha_creacion`, `fecha_actualizacion` | `codigo` UNIQUE NOT NULL · CHECK `precio_compra > 0` · CHECK `precio_venta > 0` · CHECK `stock_actual >= 0` · CHECK `stock_minimo >= 0` |
| `Movimiento` | `id BIGINT IDENTITY PK`, `producto_id INT FK→Producto`, `tipo VARCHAR(7)`, `cantidad INT`, `fecha DATETIME2(0)`, `motivo NVARCHAR(255)`, `stock_anterior INT`, `stock_posterior INT`, `usuario_id INT NULL FK→Usuario`, `fecha_registro DATETIME2(0) DEFAULT SYSUTCDATETIME()` | CHECK `tipo IN ('ENTRADA','SALIDA')` · CHECK `cantidad > 0` · CHECK de coherencia: (`ENTRADA` y `stock_posterior = stock_anterior + cantidad`) o (`SALIDA` y `stock_posterior = stock_anterior - cantidad`) · **FK sin CASCADE** (un producto con movimientos no se puede borrar físicamente) |

Índices recomendados: `Movimiento(producto_id, fecha)`, `Movimiento(fecha)`, `Producto(categoria_id)`, `Producto(nombre)`.

### 1.2 Procedimientos almacenados

Todos en `dbo`, creados con `CREATE OR ALTER PROCEDURE`, con `SET NOCOUNT ON`.
**Todas las operaciones de persistencia pasan por estos procedimientos** (el backend no escribe SQL propio).

| Procedimiento | Parámetros | Devuelve (result set) |
|---|---|---|
| `usp_Usuario_Crear` | `@username, @password_hash, @nombre_completo` | 1 fila: `id, username, nombre_completo, activo` |
| `usp_Usuario_ObtenerPorUsername` | `@username` | 0/1 fila: `id, username, password_hash, nombre_completo, activo` |
| `usp_Categoria_Crear` | `@nombre, @descripcion` | 1 fila: `id, nombre, descripcion, fecha_creacion` |
| `usp_Categoria_Listar` | — | N filas (orden por nombre) |
| `usp_Producto_Crear` | `@codigo, @nombre, @descripcion, @categoria_id, @precio_compra, @precio_venta, @stock_minimo` | 1 fila de producto (ver 1.3). Stock inicial siempre 0 (el stock solo cambia por movimientos) |
| `usp_Producto_Actualizar` | `@id, @codigo, @nombre, @descripcion, @categoria_id, @precio_compra, @precio_venta, @stock_minimo` | 1 fila de producto. **No modifica `stock_actual`** |
| `usp_Producto_Desactivar` | `@id` | 1 fila de producto |
| `usp_Producto_Activar` | `@id` | 1 fila de producto |
| `usp_Producto_ObtenerPorId` | `@id` | 0/1 fila de producto |
| `usp_Producto_Listar` | `@busqueda NVARCHAR(100)=NULL` (LIKE sobre código o nombre), `@categoria_id INT=NULL`, `@incluir_inactivos BIT=0` | N filas de producto (orden por nombre) |
| `usp_Producto_StockBajo` | — | N filas de producto **activos** con `stock_actual <= stock_minimo` |
| `usp_Movimiento_RegistrarEntrada` | `@producto_id, @cantidad, @fecha, @motivo, @usuario_id` | 1 fila de movimiento (ver 1.3) |
| `usp_Movimiento_RegistrarSalida` | `@producto_id, @cantidad, @fecha, @motivo, @usuario_id` | 1 fila de movimiento |
| `usp_Movimiento_Listar` | `@producto_id INT=NULL, @fecha_desde DATE=NULL, @fecha_hasta DATE=NULL, @tipo VARCHAR(7)=NULL` | N filas de movimiento, más recientes primero. El rango es **inclusivo** en ambos extremos |
| `usp_Dashboard_Indicadores` | — | 1 fila: `productos_activos, productos_stock_bajo, valor_inventario_compra, valor_inventario_venta` (suma de `stock_actual * precio` solo de productos activos) |

**Entradas y salidas** (`usp_Movimiento_Registrar*`): `SET XACT_ABORT ON`, `BEGIN TRY/CATCH`, `BEGIN TRANSACTION`;
leen el producto con `WITH (UPDLOCK, ROWLOCK)`; validan; actualizan `Producto.stock_actual`;
insertan en `Movimiento` (`stock_anterior`/`stock_posterior`); `COMMIT`; y recién entonces hacen el `SELECT` de la fila.
Si algo falla: `ROLLBACK` y se relanza el error con `THROW`.

### 1.3 Columnas de los result sets

- **Fila de producto:** `id, codigo, nombre, descripcion, categoria_id, categoria_nombre, precio_compra, precio_venta, stock_actual, stock_minimo, activo, stock_bajo, fecha_creacion, fecha_actualizacion` (`stock_bajo` = 1 si `stock_actual <= stock_minimo`).
- **Fila de movimiento:** `id, producto_id, producto_codigo, producto_nombre, tipo, cantidad, fecha, motivo, stock_anterior, stock_posterior, usuario_username, fecha_registro`.

### 1.4 Errores de negocio (convención para que el backend los entienda)

Los procedimientos lanzan errores con `THROW <número>, N'<CODIGO>|<mensaje legible en español>', 1;`
El texto **siempre empieza con el código en MAYÚSCULAS seguido de `|`**. El backend lee ese código (no el número).

| Código | Número | Cuándo | HTTP |
|---|---|---|---|
| `USUARIO_DUPLICADO` | 50010 | username ya existe | 409 |
| `CATEGORIA_DUPLICADA` | 50020 | nombre de categoría ya existe | 409 |
| `CATEGORIA_NO_ENCONTRADA` | 50021 | `categoria_id` inexistente | 404 |
| `PRODUCTO_CODIGO_DUPLICADO` | 50030 | código de producto ya existe | 409 |
| `PRODUCTO_NO_ENCONTRADO` | 50031 | `producto_id` inexistente | 404 |
| `PRODUCTO_INACTIVO` | 50032 | movimiento sobre producto desactivado | 409 |
| `CANTIDAD_INVALIDA` | 50040 | cantidad nula o `<= 0` | 422 |
| `STOCK_INSUFICIENTE` | 50041 | la salida dejaría stock negativo | 409 |
| `MOTIVO_REQUERIDO` | 50043 | motivo vacío | 422 |
| `DATOS_INVALIDOS` | 50050 | precio `<= 0`, stock mínimo `< 0`, nombre/código vacío | 422 |

---

## 2. API REST (FastAPI)

Prefijo: `/api/v1`. Documentación Swagger en `/docs`. Salud: `GET /health` (sin prefijo, sin auth) → `{"status":"ok"}`.
Autenticación: **JWT Bearer** en todos los endpoints salvo `/health` y `/auth/login`.
JSON en snake_case. Decimales (`precio_*`, `valor_*`) se serializan como **número JSON**, no como string.
Fechas: ISO 8601 (`2026-10-28T14:30:00`). Códigos: `201` al crear, `200` en el resto.

| Método y ruta | Cuerpo / query | Respuesta |
|---|---|---|
| `POST /auth/login` | `{username, password}` (JSON) | `{access_token, token_type:"bearer", usuario:{id, username, nombre_completo}}` |
| `GET /auth/me` | — | `{id, username, nombre_completo}` |
| `GET /categorias` | — | `Categoria[]` |
| `POST /categorias` | `{nombre, descripcion?}` | `Categoria` (201) |
| `GET /productos` | `?busqueda=&categoria_id=&incluir_inactivos=false` | `Producto[]` |
| `GET /productos/stock-bajo` | — | `Producto[]` *(declarar esta ruta ANTES de `/productos/{id}`)* |
| `GET /productos/{id}` | — | `Producto` |
| `POST /productos` | `{codigo, nombre, descripcion?, categoria_id, precio_compra, precio_venta, stock_minimo}` | `Producto` (201) |
| `PUT /productos/{id}` | mismos campos que crear | `Producto` |
| `PATCH /productos/{id}/desactivar` | — | `Producto` |
| `PATCH /productos/{id}/activar` | — | `Producto` |
| `POST /movimientos/entradas` | `{producto_id, cantidad, fecha, motivo}` | `Movimiento` (201) |
| `POST /movimientos/salidas` | `{producto_id, cantidad, fecha, motivo}` | `Movimiento` (201) |
| `GET /movimientos` | `?producto_id=&fecha_desde=YYYY-MM-DD&fecha_hasta=YYYY-MM-DD&tipo=ENTRADA\|SALIDA` | `Movimiento[]` |
| `GET /dashboard/indicadores` | — | `{productos_activos, productos_stock_bajo, valor_inventario_compra, valor_inventario_venta}` |

No existe `DELETE /productos/{id}` (regla de negocio 7: solo se desactiva).
El usuario del movimiento sale del token (no del cuerpo de la petición).

### 2.1 Validaciones en la API (Pydantic) — mismas reglas que la BD

- `codigo`: 1–30 caracteres, sin espacios en los extremos. `nombre`: 1–150. `descripcion`: máx. 500.
- `precio_compra` y `precio_venta`: número `> 0`, máximo 2 decimales.
- `stock_minimo`: entero `>= 0`.
- `cantidad`: entero `> 0` (rechazar `2.5`, `0`, negativos y texto).
- `motivo`: 1–255 caracteres. `fecha`: obligatoria. `tipo` (filtro): solo `ENTRADA` o `SALIDA`.
- `fecha_desde <= fecha_hasta` si vienen ambas.

### 2.2 Formato único de errores

Todos los errores (negocio, validación, no autenticado, inesperados) devuelven:

```json
{ "code": "STOCK_INSUFICIENTE", "detail": "Stock insuficiente: disponible 3, solicitado 5." }
```

- Validación de Pydantic → HTTP 422, `code: "VALIDACION"`, `detail` resumido y además `"errors": [{"campo": "cantidad", "mensaje": "..."}]`.
- Credenciales incorrectas → 401 `CREDENCIALES_INVALIDAS`. Token ausente/vencido → 401 `NO_AUTENTICADO`.
- Error inesperado → 500 `ERROR_INTERNO` con mensaje genérico (el detalle técnico solo va al log, nunca al cliente).
- Códigos de negocio → ver tabla 1.4.

---

## 3. Variables de entorno

| Variable | Quién la usa | Nota |
|---|---|---|
| `DB_SERVER`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` | backend, db-init | En Docker: `db`, `1433`, `sa`, clave, nombre de la BD |
| `JWT_SECRET`, `JWT_EXPIRE_MINUTES` | backend | |
| `CORS_ORIGINS` | backend | Lista separada por comas |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_NOMBRE` | backend (siembra el primer usuario al arrancar) | |

Ver `docker-compose.yml` y `.env.example` en la raíz: **no se modifican sin necesidad**.

## 4. Cómo se conecta el frontend con el backend

- **Docker (producción):** el navegador llama a `/api/v1/...` en el mismo origen; nginx reenvía `/api/` al contenedor `backend`. `environment.prod.ts` → `apiUrl: '/api/v1'`.
- **Desarrollo local con `ng serve` (puerto 4200):** `environment.ts` → `apiUrl: 'http://localhost:8000/api/v1'`; funciona por CORS (el backend permite `http://localhost:4200`).
