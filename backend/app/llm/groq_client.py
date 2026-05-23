from langchain_groq import ChatGroq
from app.config import settings
from loguru import logger
from functools import lru_cache


@lru_cache(maxsize=1)
def get_llm(streaming: bool = True) -> ChatGroq:
    """
    Returns a cached ChatGroq LLM instance.
    The client is created once and reused across all requests,
    preserving the underlying HTTP connection pool.
    """
    if not settings.GROQ_API_KEY:
        raise ValueError(
            "GROQ_API_KEY is not set. Add it to your backend/.env file."
        )

    logger.info(f"Initializing Groq LLM: {settings.GROQ_MODEL} (timeout={settings.GROQ_TIMEOUT_SECONDS}s) — one-time")
    return ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model=settings.GROQ_MODEL,
        temperature=0.3,
        streaming=streaming,
        request_timeout=settings.GROQ_TIMEOUT_SECONDS,
    )
