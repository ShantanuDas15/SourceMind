from app.agents.state import AgentState
from app.llm.groq_client import get_llm
from app.llm.prompts.system_prompts import RAG_SYSTEM_PROMPT
from app.llm.circuit_breaker import groq_circuit_breaker, CircuitState
from langchain_core.messages import SystemMessage, HumanMessage
from loguru import logger
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential_jitter,
    retry_if_exception_type,
)
import httpx


# Retry configuration: 3 attempts, exponential backoff (1s→2s→4s) + jitter
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential_jitter(initial=1, max=8, jitter=2),
    retry=retry_if_exception_type((httpx.TimeoutException, httpx.HTTPStatusError, ConnectionError)),
    before_sleep=lambda retry_state: logger.warning(
        f"[Synthesize Node] Retry attempt {retry_state.attempt_number} after error: "
        f"{retry_state.outcome.exception().__class__.__name__}"
    ),
)
def _invoke_llm(messages: list):
    """Invoke the LLM with retry logic. Separated for testability."""
    llm = get_llm(streaming=True)
    return llm.invoke(messages)


def synthesize_node(state: AgentState) -> dict:
    """
    Agent node: builds a prompt from retrieved context and the user's question,
    then invokes the Groq LLM to generate a grounded answer.

    Includes:
    - Circuit breaker: short-circuits if Groq is known to be down
    - Retry with exponential backoff + jitter
    - Graceful degradation fallback
    """
    question = state["question"]
    context_docs = state.get("context", [])

    # Build context string from retrieved documents
    context_parts = []
    for i, doc in enumerate(context_docs):
        source = doc.metadata.get("source", "unknown")
        context_parts.append(f"[Source {i+1}: {source}]\n{doc.page_content}")

    context_str = "\n\n---\n\n".join(context_parts) if context_parts else "No context available."

    # --- Circuit Breaker Check ---
    if not groq_circuit_breaker.is_call_permitted:
        logger.error(
            f"[Synthesize Node] Circuit breaker OPEN — skipping Groq API call. "
            f"Will retry in {groq_circuit_breaker.recovery_timeout}s."
        )
        return _build_fallback_answer(question, context_docs)

    from langchain_core.messages import AIMessage

    # Build messages
    system_msg = SystemMessage(content=RAG_SYSTEM_PROMPT.format(context=context_str))
    
    # Inject chat history
    history_msgs = []
    for msg in state.get("chat_history", []):
        if msg.get("role") == "user":
            history_msgs.append(HumanMessage(content=msg.get("content", "")))
        elif msg.get("role") == "assistant":
            history_msgs.append(AIMessage(content=msg.get("content", "")))
            
    human_msg = HumanMessage(content=question)
    
    messages = [system_msg] + history_msgs + [human_msg]

    logger.info(f"[Synthesize Node] Generating answer with {len(context_docs)} context docs and {len(history_msgs)} history msgs")

    try:
        response = _invoke_llm(messages)
        groq_circuit_breaker.record_success()
        return {"answer": response.content}

    except Exception as e:
        groq_circuit_breaker.record_failure()
        logger.error(
            f"[Synthesize Node] LLM call failed after retries: {e.__class__.__name__}"
        )
        return _build_fallback_answer(question, context_docs)


def _build_fallback_answer(question: str, context_docs: list) -> dict:
    """
    Graceful degradation: return the retrieved sources when the LLM is unavailable.
    """
    source_list = []
    for i, doc in enumerate(context_docs):
        source = doc.metadata.get("source", "unknown")
        source_list.append(f"- **Source {i+1}:** {source}")

    sources_md = "\n".join(source_list) if source_list else "- No sources found."

    fallback = (
        "⚠️ **AI service temporarily unavailable.**\n\n"
        "I was unable to generate a synthesized answer, but here are the "
        "relevant sources I found for your query:\n\n"
        f"**Query:** {question}\n\n"
        f"**Retrieved Sources:**\n{sources_md}\n\n"
        "_The AI service should recover shortly. Please try again in a moment._"
    )
    return {"answer": fallback}
