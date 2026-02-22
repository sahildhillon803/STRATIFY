from typing import List, Union
from pydantic import AnyHttpUrl, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # --- Core Settings ---
    PROJECT_NAME: str = "STRATA-AI"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # --- Security ---
    # MUST be a standard 'str' so python-jose can use it directly
    SECRET_KEY: str 
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days default

    # --- Database ---
    # We use 'str' here to avoid validation errors with some mongodb+srv formats
    MONGODB_URI: str

    # --- LLM Configuration (Groq) ---
    GROQ_API_KEY: str
    LLM_MODEL: str = "llama-3.3-70b-versatile"
    LLM_TEMPERATURE: float = Field(default=0.2, ge=0.0, le=2.0)

    # --- Google OAuth ---
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # --- Rate Limiting ---
    RATE_LIMIT_PER_MINUTE: int = 60

    # --- CORS Configuration ---
    # Parses a comma-separated string from .env into a list
    BACKEND_CORS_ORIGINS: List[str] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # --- Pydantic Config to load .env ---
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

# Instantiate the settings
settings = Settings()