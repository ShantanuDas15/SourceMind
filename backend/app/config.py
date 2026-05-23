from pydantic_settings import BaseSettings
from loguru import logger


class Settings(BaseSettings):
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    OLLAMA_BASE_URL: str = "http://localhost:11434"

    # LLM (Groq)
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_TIMEOUT_SECONDS: int = 30
    GROQ_MAX_RETRIES: int = 3

    # Circuit Breaker
    CIRCUIT_BREAKER_FAILURE_THRESHOLD: int = 5
    CIRCUIT_BREAKER_RECOVERY_TIMEOUT: int = 30

    # BM25 Cache
    BM25_CACHE_TTL_SECONDS: int = 60

    # Cloud Vector Store (Optional for Production)
    QDRANT_URL: str = ""
    QDRANT_API_KEY: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Fail-fast validation at startup
if settings.GROQ_API_KEY:
    logger.info("✅ GROQ_API_KEY is configured")
else:
    logger.warning(
        "⚠️  GROQ_API_KEY is not set. The /api/stream endpoint will use "
        "graceful degradation (returning retrieved sources without LLM synthesis). "
        "Add GROQ_API_KEY to your backend/.env file to enable full functionality."
    )
