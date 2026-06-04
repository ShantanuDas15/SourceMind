from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from app.retrieval.embeddings import get_embeddings_model
from app.config import settings
from loguru import logger
from functools import lru_cache

@lru_cache(maxsize=4)
def get_qdrant_vectorstore(collection_name: str = "sourcemind_default") -> QdrantVectorStore:
    """
    Returns a LangChain Qdrant vectorstore instance connected to Qdrant Cloud.
    Cached per collection name — the DB connection is reused across calls.
    """
    logger.info(f"Initializing Qdrant vectorstore for collection '{collection_name}'")
    
    if not settings.QDRANT_URL or not settings.QDRANT_API_KEY:
        raise ValueError("QDRANT_URL and QDRANT_API_KEY must be set to use Qdrant Cloud.")
    
    client = QdrantClient(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY,
    )
    
    return QdrantVectorStore(
        client=client,
        collection_name=collection_name,
        embedding=get_embeddings_model()
    )
