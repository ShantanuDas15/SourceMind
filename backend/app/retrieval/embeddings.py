from langchain_huggingface import HuggingFaceEmbeddings
from loguru import logger
from functools import lru_cache


@lru_cache(maxsize=1)
def get_embeddings_model() -> HuggingFaceEmbeddings:
    """
    Returns the configured HuggingFace Embeddings model.
    Cached as a singleton — the model weights are loaded exactly once
    and reused across all subsequent calls.
    """
    logger.info("Loading HuggingFace embeddings model (all-MiniLM-L6-v2) — one-time initialization")
    return HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2"
    )
