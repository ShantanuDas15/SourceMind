from app.agents.state import AgentState
from app.retrieval.hybrid_retriever import hybrid_retrieve
from loguru import logger


def retrieve_node(state: AgentState) -> dict:
    """
    Agent node: retrieves relevant documents for the user's question
    using the hybrid (semantic + BM25) retriever.
    """
    question = state["question"]
    session_id = state.get("session_id", "sourcemind_default")
    logger.info(f"[Retrieve Node] Searching for: '{question}' in session {session_id}")

    docs = hybrid_retrieve(question, k=4, collection_name=session_id)
    logger.info(f"[Retrieve Node] Found {len(docs)} documents")

    return {"context": docs}
