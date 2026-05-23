from langchain_core.documents import Document
from app.retrieval.vectorstore import get_vectorstore
from app.retrieval.bm25_retriever import get_bm25_retriever
from loguru import logger
from typing import List


def hybrid_retrieve(query: str, k: int = 4, collection_name: str = "sourcemind_default") -> List[Document]:
    """
    Combines ChromaDB vector similarity search (semantic) with
    BM25 keyword search (lexical) using a simple score-based merge.

    Returns up to k unique documents ranked by combined relevance.
    """
    logger.info(f"Running hybrid retrieval for: '{query}'")

    # --- Semantic retrieval via ChromaDB ---
    vectorstore = get_vectorstore(collection_name)
    semantic_docs = vectorstore.similarity_search(query, k=k)
    logger.debug(f"Semantic search returned {len(semantic_docs)} docs")

    # --- Lexical retrieval via BM25 (uses cached singleton) ---
    bm25 = get_bm25_retriever(collection_name)
    keyword_docs = bm25.retrieve(query, k=k)
    logger.debug(f"BM25 search returned {len(keyword_docs)} docs")

    # --- Merge & deduplicate ---
    seen_contents = set()
    merged: List[Document] = []

    # Interleave: semantic first, then BM25 extras
    for doc in semantic_docs + keyword_docs:
        content_hash = hash(doc.page_content)
        if content_hash not in seen_contents:
            seen_contents.add(content_hash)
            merged.append(doc)

    result = merged[:k]
    logger.info(f"Hybrid retrieval returned {len(result)} unique documents")
    return result
