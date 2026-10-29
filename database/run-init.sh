#!/bin/bash
# Crea la base de datos (si no existe) y ejecuta en orden alfabetico todos los
# scripts de /scripts. Todos los scripts deben ser IDEMPOTENTES.
#   -C  confia en el certificado del servidor (desarrollo)
#   -b  si hay un error SQL, sqlcmd termina con codigo != 0 (y el compose falla)
#   -I  QUOTED_IDENTIFIER ON (sqlcmd lo trae OFF por defecto)
set -euo pipefail

SQLCMD=/opt/mssql-tools18/bin/sqlcmd
SERVER="${DB_SERVER},${DB_PORT:-1433}"

echo ">> Esperando a SQL Server en ${SERVER}..."
for i in $(seq 1 30); do
  if $SQLCMD -S "$SERVER" -U "$DB_USER" -P "$DB_PASS" -C -b -Q "SELECT 1" -o /dev/null 2>/dev/null; then
    break
  fi
  sleep 2
done

echo ">> Creando base de datos [${DB_NAME}] si no existe..."
$SQLCMD -S "$SERVER" -U "$DB_USER" -P "$DB_PASS" -C -b \
  -Q "IF DB_ID(N'${DB_NAME}') IS NULL CREATE DATABASE [${DB_NAME}];"

shopt -s nullglob
for f in $(ls /scripts/*.sql | sort); do
  echo ">> Ejecutando $(basename "$f")"
  $SQLCMD -S "$SERVER" -U "$DB_USER" -P "$DB_PASS" -d "$DB_NAME" -C -b -I -i "$f"
done

echo ">> Base de datos lista."
