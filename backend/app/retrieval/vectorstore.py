import os
from langchain_chroma import Chroma
from langchain_core.vectorstores import VectorStore
from app.retrieval.embeddings import get_embeddings_model
from app.retrieval.qdrant_store import get_qdrant_vectorstore
from app.config import settings
from loguru import logger
from functools import lru_cache
from typing import List
from langchain_core.documents import Document

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_DIR = os.path.join(BASE_DIR, "chroma_db")


@lru_cache(maxsize=4)
def get_vectorstore(collection_name: str = "sourcemind_default") -> VectorStore:
    """
    Returns a LangChain vectorstore instance.
    Uses Qdrant Cloud if QDRANT_URL is set, otherwise falls back to local ChromaDB.
    Cached per collection name — the DB connection is reused across calls.
    """
    if settings.QDRANT_URL and settings.QDRANT_API_KEY:
        logger.info(f"Using Qdrant Cloud for collection '{collection_name}'")
        return get_qdrant_vectorstore(collection_name)
        
    logger.info(f"Initializing Chroma vectorstore for collection '{collection_name}' — one-time per collection")
    return Chroma(
        collection_name=collection_name,
        embedding_function=get_embeddings_model(),
        persist_directory=DB_DIR
    )

def store_documents(documents: List[Document], collection_name: str = "sourcemind_default"):
    """
    Stores LangChain Documents into the ChromaDB collection.
    """
    logger.info(f"Storing {len(documents)} documents into collection '{collection_name}'")
    vectorstore = get_vectorstore(collection_name)
    vectorstore.add_documents(documents)
    # Note: In chromadb >= 0.4.x, persistence is handled automatically if persist_directory is set
    logger.info("Successfully stored documents.")
