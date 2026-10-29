# Backend FastAPI + driver ODBC 18 de Microsoft (necesario para pyodbc -> SQL Server)
# Dependencias gestionadas con uv (pyproject.toml + uv.lock), como en clase.
FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    UV_PYTHON_DOWNLOADS=never \
    UV_LINK_MODE=copy

RUN apt-get update \
 && apt-get install -y --no-install-recommends curl gnupg2 ca-certificates unixodbc unixodbc-dev gcc g++ \
 && curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg \
 && curl -fsSL https://packages.microsoft.com/config/debian/12/prod.list -o /etc/apt/sources.list.d/mssql-release.list \
 && apt-get update \
 && ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql18 \
 && rm -rf /var/lib/apt/lists/*

# uv (binario oficial)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Primero solo los archivos de dependencias (aprovecha la cache de Docker)
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY . .

EXPOSE 8000
# Sin --reload (en produccion/Docker y para no cargar las maquinas)
CMD ["uv", "run", "--frozen", "--no-dev", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
