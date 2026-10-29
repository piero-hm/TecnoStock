# PROMPT 1 — BASE DE DATOS (SQL Server)

> **Cómo usarlo:** abre tu agente dentro de la carpeta raíz del proyecto.
> 1) Pega la **PARTE A** en el `AGENTS.md` de `database/` (créalo si no existe).
> 2) Pega la **PARTE B** como la tarea.
> Haz este prompt **primero**: el backend depende de estos procedimientos.

---

## PARTE A — Para `database/AGENTS.md` (reglas permanentes)

```markdown
# Reglas de la carpeta database/

- Motor: SQL Server 2022 (T-SQL) corriendo en Docker. No hay SQL Server instalado en la máquina del desarrollador.
- La fuente de verdad de tablas, procedimientos, columnas devueltas y códigos de error es `docs/CONTRATOS.md` (sección 1). Si hay duda, se respeta ese documento. No renombres nada.
- Los scripts viven en `database/init/` y se ejecutan en orden alfabético con `sqlcmd` desde `run-init.sh` (ya existe, no lo modifiques).
- Los scripts NO contienen `CREATE DATABASE` ni `USE`: la base ya existe y `sqlcmd` se conecta con `-d`.
- Todos los scripts son IDEMPOTENTES (se pueden ejecutar muchas veces sin error ni duplicar datos):
  tablas con `IF OBJECT_ID(...) IS NULL`, índices con `IF NOT EXISTS (SELECT ... FROM sys.indexes ...)`,
  procedimientos con `CREATE OR ALTER PROCEDURE`, datos de ejemplo con `IF NOT EXISTS`.
- Separa lotes con `GO`. `CREATE OR ALTER PROCEDURE` debe ser la primera sentencia de su lote.
- Usa NVARCHAR y literales `N'...'` para texto. Evita caracteres no ASCII en identificadores y comentarios.
- Nombres: tablas en singular y PascalCase (`Producto`), procedimientos `usp_<Entidad>_<Accion>`, columnas en snake_case.
- Cada procedimiento: `SET NOCOUNT ON;`, parámetros tipados, validaciones al inicio, errores con `THROW` usando el formato `N'CODIGO|mensaje en español'`.
- Cada archivo empieza con un comentario breve (qué contiene y por qué), y cada procedimiento con 2-4 líneas explicando su regla de negocio. El estudiante debe poder explicar todo en una sustentación oral: prefiere SQL claro sobre SQL "ingenioso".
- Nunca borres físicamente productos ni movimientos. No hay procedimiento de eliminación de productos.
```

---

## PARTE B — La tarea

```markdown
Eres un DBA/desarrollador T-SQL senior. Implementa la base de datos del sistema de inventario "TecnoStock S.A.C."

## Contexto
Lee primero `docs/CONTRATOS.md` (sección 1: tablas, procedimientos, result sets y códigos de error). Es el contrato exacto
que consumirá el backend FastAPI. Impleméntalo tal cual, sin cambiar nombres, parámetros ni columnas devueltas.

## Qué debes crear (en `database/init/`)

| Archivo | Contenido |
|---|---|
| `01_tablas.sql` | Tablas `Usuario`, `Categoria`, `Producto`, `Movimiento` con PK, FK, UNIQUE, CHECK (incluido el CHECK de coherencia de stock en `Movimiento`), DEFAULTs e índices del contrato. FKs sin CASCADE. |
| `02_sp_usuario.sql` | `usp_Usuario_Crear`, `usp_Usuario_ObtenerPorUsername` |
| `03_sp_categoria.sql` | `usp_Categoria_Crear`, `usp_Categoria_Listar` |
| `04_sp_producto.sql` | `usp_Producto_Crear`, `_Actualizar`, `_Desactivar`, `_Activar`, `_ObtenerPorId`, `_Listar`, `_StockBajo` |
| `05_sp_movimiento.sql` | `usp_Movimiento_RegistrarEntrada`, `usp_Movimiento_RegistrarSalida`, `usp_Movimiento_Listar` |
| `06_sp_dashboard.sql` | `usp_Dashboard_Indicadores` |
| `99_seed_demo.sql` | Datos de demostración **solo si no existen**: 4 categorías (Laptops, Periféricos, Almacenamiento, Redes) y ~10 productos realistas (código tipo `LAP-001`) creados mediante los procedimientos `usp_Categoria_Crear`/`usp_Producto_Crear`, y luego algunas entradas y salidas con los procedimientos de movimiento (deja al menos 2 productos con stock <= stock mínimo para probar el indicador de stock bajo). Los movimientos de demo usan `@usuario_id = NULL`. |

Además crea `database/tests/verificacion.sql`: un script **manual** (no se ejecuta automáticamente) que prueba con `PRINT` y `TRY/CATCH`:
1. Entrada válida actualiza stock y crea movimiento con `stock_anterior`/`stock_posterior` correctos.
2. Salida válida.
3. Salida mayor al stock → `STOCK_INSUFICIENTE`, y el stock y el historial **no cambian**.
4. Cantidad 0 o negativa → `CANTIDAD_INVALIDA`.
5. Código de producto duplicado → `PRODUCTO_CODIGO_DUPLICADO`.
6. Movimiento sobre producto desactivado → `PRODUCTO_INACTIVO`.
7. `DELETE` físico de un producto con movimientos → falla por la FK.
8. Filtro de `usp_Movimiento_Listar` por producto y por rango de fechas (extremos inclusivos).
Debe terminar limpiando lo que creó o ejecutarse dentro de una transacción que haga ROLLBACK al final.

## Reglas de implementación obligatorias

1. **Transacciones en entradas/salidas** (reglas de negocio 4, 5 y 6): `SET XACT_ABORT ON;` + `BEGIN TRY ... BEGIN CATCH`;
   `BEGIN TRANSACTION`; leer el producto con `WITH (UPDLOCK, ROWLOCK)` (evita que dos salidas simultáneas dejen stock negativo);
   validar producto existente y activo, cantidad > 0, motivo no vacío; calcular `stock_anterior` y `stock_posterior`;
   `UPDATE Producto` (y `fecha_actualizacion`); `INSERT Movimiento`; `COMMIT`; después hacer el `SELECT` final con la fila del movimiento.
   En el `CATCH`: `IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION; THROW;`.
   Las validaciones que fallan ANTES de abrir la transacción lanzan `THROW` directamente.
2. **El stock solo cambia por movimientos.** `usp_Producto_Crear` crea con `stock_actual = 0`; `usp_Producto_Actualizar` no toca `stock_actual`.
3. **Duplicados:** valida unicidad de `codigo`/`nombre` con un `IF EXISTS` para dar el mensaje claro del contrato, y deja además el índice UNIQUE como red de seguridad.
   Al actualizar un producto, la validación de código duplicado debe excluir al propio producto (`id <> @id`).
4. **Productos:** `usp_Producto_Listar` busca con `LIKE '%' + @busqueda + '%'` sobre código **o** nombre, filtra por categoría si viene, y por defecto solo activos.
   Calcula `stock_bajo` con `CASE WHEN stock_actual <= stock_minimo THEN 1 ELSE 0 END` (tipo BIT) y trae `categoria_nombre` con JOIN.
5. **Movimientos:** `usp_Movimiento_Listar` hace JOIN con `Producto` y `Usuario` (LEFT JOIN), orden `fecha DESC, id DESC`, filtros opcionales
   y rango inclusivo: `fecha >= @fecha_desde AND fecha < DATEADD(DAY, 1, @fecha_hasta)`.
6. **Dashboard:** valor del inventario = `SUM(stock_actual * precio_compra)` y `SUM(stock_actual * precio_venta)` de productos **activos**, con `ISNULL(..., 0)`.
7. Todos los `THROW` con el formato `N'CODIGO|mensaje'` y los números de la tabla 1.4 de `CONTRATOS.md`. Los mensajes de stock insuficiente incluyen disponible y solicitado
   (usa `FORMATMESSAGE` o concatenación con `CAST`).
8. Los procedimientos que devuelven datos devuelven **exactamente un result set** con las columnas del contrato (nada de PRINT ni result sets extra,
   porque el backend lee el primero).
9. Sin cursores, sin SQL dinámico, sin triggers, sin vistas indexadas ni índices filtrados (`sqlcmd` y la idempotencia se complican).

## Cómo verificar (hazlo tú mismo si tienes Docker disponible)

```bash
cp .env.example .env            # si aún no existe
docker compose up -d db
docker compose up --build db-init      # debe terminar con "Base de datos lista." y código 0
docker compose up --build db-init      # segunda vez: tampoco debe fallar (idempotencia)
docker compose exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -d TecnoStockDB -i /dev/stdin < database/tests/verificacion.sql
```
Si no puedes ejecutar Docker, revisa a mano la sintaxis (lotes con `GO`, `CREATE OR ALTER` primero en el lote, comas, nombres de columna idénticos al contrato).

## Entrega
- Archivos listados arriba, sin tocar `database/Dockerfile` ni `database/run-init.sh`.
- Al final, un resumen de máximo 10 líneas: qué hace cada archivo y 3 decisiones técnicas que el estudiante debe saber explicar (transacción + UPDLOCK, CHECK de coherencia, códigos de error con `|`).
```
