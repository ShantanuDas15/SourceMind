from typing import TypedDict, List
from langchain_core.documents import Document


class AgentState(TypedDict):
    """State that flows through the LangGraph agent nodes."""
    question: str
    session_id: str
    chat_history: List[dict]
    context: List[Document]
    answer: str
