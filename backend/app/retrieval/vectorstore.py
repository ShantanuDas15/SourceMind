import os
from langchain_chroma import Chroma
from app.retrieval.embeddings import get_embeddings_model
from loguru import logger
from functools import lru_cache
from typing import List
from langchain_core.documents import Document

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_DIR = os.path.join(BASE_DIR, "chroma_db")


@lru_cache(maxsize=4)
def get_vectorstore(collection_name: str = "sourcemind_default") -> Chroma:
    """
    Returns a LangChain Chroma vectorstore instance.
    Cached per collection name — the DB connection is reused across calls.
    """
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
