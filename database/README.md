# Base de datos TecnoStock (SQL Server 2022)

Scripts de inicialización en `init/`:
- `01_tablas.sql` … `06_sp_dashboard.sql`: tablas, índices y procedimientos almacenados.
- `99_seed_demo.sql`: datos de demostración.

En Docker, el servicio `db-init` ejecuta estos scripts automáticamente sobre el contenedor `tecnostock-db`.

## Conexión con SSMS o Azure Data Studio

1. Asegúrate de que Docker esté levantado: `docker compose up -d db`.
2. Abre SSMS o Azure Data Studio.
3. Datos de conexión:
   - Servidor: `localhost,<DB_PORT_HOST>` (por defecto `localhost,1433`)
   - Autenticación: SQL Server Authentication
   - Usuario: `sa`
   - Contraseña: valor de `MSSQL_SA_PASSWORD` en tu `.env`
   - Base de datos: `DB_NAME` (por defecto `TecnoStockDB`)
4. Si SSMS muestra error de certificado, marca “Trust server certificate”.
5. En Azure Data Studio: New Connection → Microsoft SQL Server → Server `localhost,<puerto>` → Authentication type: SQL Login.

## Notas

- El backend se conecta con `DB_SERVER=db` y puerto `1433` dentro de Docker.
- Desde tu PC usa `localhost` y el puerto publicado (`DB_PORT_HOST`).
- No ejecutes `docker compose down -v` si quieres conservar los datos (borra el volumen `sqlserver_data`).
