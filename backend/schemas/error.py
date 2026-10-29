"""Schema de error."""

from pydantic import BaseModel


class ErrorResponse(BaseModel):
    code: str
    detail: str
    errors: list[dict] | None = None
