from app.agents.graph import compiled_graph
from loguru import logger
import json


async def stream_agent_response(query: str, session_id: str = "sourcemind_default", chat_history: list = None):
    """
    Async generator that invokes the LangGraph agent and yields
    SSE-formatted token events.

    Includes an error boundary: if any exception occurs mid-stream,
    an error event is emitted so the client always receives a clean
    termination signal.
    """
    if chat_history is None:
        chat_history = []
        
    logger.info(f"Streaming response for query: '{query}' in session {session_id} with {len(chat_history)} history messages")

    try:
        async for event in compiled_graph.astream_events(
            {"question": query, "session_id": session_id, "chat_history": chat_history}, version="v2"
        ):
            kind = event["event"]

            # Stream individual LLM tokens
            if kind == "on_chat_model_stream":
                content = event["data"]["chunk"].content
                if content:
                    yield f"data: {json.dumps({'token': content})}\n\n"

    except Exception as e:
        logger.error(f"SSE stream error: {e.__class__.__name__}: {e}")
        error_msg = "An error occurred while generating the response. Please try again."
        yield f"data: {json.dumps({'error': error_msg})}\n\n"

    # Always signal end of stream
    yield "data: [DONE]\n\n"
