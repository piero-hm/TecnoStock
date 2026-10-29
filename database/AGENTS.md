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
