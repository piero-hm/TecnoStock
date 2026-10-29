"""Configuracion de la aplicacion desde variables de entorno."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DB_SERVER: str
    DB_PORT: int = 1433
    DB_USER: str
    DB_PASS: str
    DB_NAME: str
    JWT_SECRET: str
    JWT_EXPIRE_MINUTES: int = 480
    CORS_ORIGINS: str = "http://localhost:4200"
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str
    ADMIN_NOMBRE: str = "Administrador"

    @property
    def cors_origins(self) -> list[str]:
        return [item.strip() for item in self.CORS_ORIGINS.split(",") if item.strip()]


settings = Settings()
