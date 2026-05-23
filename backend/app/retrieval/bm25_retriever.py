import time
from rank_bm25 import BM25Okapi
from langchain_core.documents import Document
from app.retrieval.vectorstore import get_vectorstore
from loguru import logger
from typing import List


class BM25RetrieverLocal:
    """
    BM25 keyword-based retriever that operates over documents
    already stored in the ChromaDB collection.

    Uses a TTL-based cache to avoid rebuilding the BM25 index
    on every query. The index is rebuilt only when the cache expires.
    """

    def __init__(self, collection_name: str = "sourcemind_default", cache_ttl: int = 60):
        self.collection_name = collection_name
        self._cache_ttl = cache_ttl
        self._documents: List[Document] = []
        self._corpus: List[List[str]] = []
        self._bm25: BM25Okapi | None = None
        self._last_build_time: float = 0.0

    def _should_rebuild(self) -> bool:
        """Check if the BM25 index cache has expired."""
        if self._bm25 is None:
            return True
        return (time.time() - self._last_build_time) > self._cache_ttl

    def _load_corpus(self):
        """Load all documents from ChromaDB and build the BM25 index."""
        if not self._should_rebuild():
            logger.debug("BM25 index cache is still fresh, skipping rebuild")
            return

        vectorstore = get_vectorstore(self.collection_name)
        collection = vectorstore._collection
        results = collection.get(include=["documents", "metadatas"])

        self._documents = []
        self._corpus = []

        if results["documents"]:
            for doc_text, meta in zip(results["documents"], results["metadatas"]):
                self._documents.append(
                    Document(page_content=doc_text, metadata=meta or {})
                )
                # Tokenize by whitespace for BM25
                self._corpus.append(doc_text.lower().split())

        if self._corpus:
            self._bm25 = BM25Okapi(self._corpus)
            self._last_build_time = time.time()
            logger.info(f"BM25 index built with {len(self._corpus)} documents (TTL={self._cache_ttl}s)")
        else:
            logger.warning("No documents found in collection for BM25 index")

    def retrieve(self, query: str, k: int = 4) -> List[Document]:
        """Retrieve top-k documents by BM25 keyword relevance."""
        self._load_corpus()

        if not self._bm25 or not self._documents:
            return []

        tokenized_query = query.lower().split()
        scores = self._bm25.get_scores(tokenized_query)

        # Pair scores with documents and sort descending
        scored_docs = sorted(
            zip(scores, self._documents), key=lambda x: x[0], reverse=True
        )

        top_docs = [doc for _, doc in scored_docs[:k]]
        logger.info(f"BM25 retrieved {len(top_docs)} documents for query: '{query}'")
        return top_docs


# Module-level dictionary to cache instances per collection
_bm25_instances: dict[str, BM25RetrieverLocal] = {}


def get_bm25_retriever(collection_name: str = "sourcemind_default", cache_ttl: int = 60) -> BM25RetrieverLocal:
    """Returns a cached BM25 retriever instance per collection."""
    global _bm25_instances
    if collection_name not in _bm25_instances:
        _bm25_instances[collection_name] = BM25RetrieverLocal(collection_name, cache_ttl)
    return _bm25_instances[collection_name]
