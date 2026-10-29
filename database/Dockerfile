# Imagen "db-init": solo sirve para ejecutar los scripts SQL contra el contenedor db.
# Usamos la imagen de SQL Server porque ya trae sqlcmd (mssql-tools18).
FROM mcr.microsoft.com/mssql/server:2022-latest

USER root
COPY init/ /scripts/
COPY run-init.sh /run-init.sh
# Por si algun editor de Windows dejo saltos de linea CRLF
RUN sed -i 's/\r$//' /run-init.sh
USER mssql

ENTRYPOINT ["/bin/bash", "/run-init.sh"]
