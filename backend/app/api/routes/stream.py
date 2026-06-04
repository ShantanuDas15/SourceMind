from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Dict
from app.llm.streaming import stream_agent_response

router = APIRouter()

MAX_QUERY_LENGTH = 2000

class Message(BaseModel):
    role: str
    content: str

class StreamRequest(BaseModel):
    q: str = Field(..., description="The user's question")
    session_id: str = Field("sourcemind_default", description="The session ID to scope retrieval to")
    history: List[Message] = Field(default=[], description="The chat history for this session")

@router.post("/stream")
async def stream_query(req: StreamRequest):
    """
    Streams an LLM-generated answer as Server-Sent Events.
    The response is grounded in documents previously ingested into ChromaDB.
    """
    # Input validation
    if not req.q.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    if len(req.q) > MAX_QUERY_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Query exceeds maximum length of {MAX_QUERY_LENGTH} characters."
        )

    # Convert Pydantic objects to dicts
    history_dicts = [{"role": msg.role, "content": msg.content} for msg in req.history]

    return StreamingResponse(
        stream_agent_response(req.q.strip(), req.session_id, history_dicts),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

@router.get("/title")
async def generate_title(q: str = Query(..., description="The user's first question")):
    """
    Generates a very short title for a new chat session based on the first query.
    """
    if not q.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
        
    from app.llm.groq_client import get_llm
    from app.llm.prompts.synthesis_prompts import TITLE_GENERATION_PROMPT
    from langchain_core.prompts import PromptTemplate
    
    llm = get_llm(streaming=False)
    prompt = PromptTemplate.from_template(TITLE_GENERATION_PROMPT)
    chain = prompt | llm
    
    try:
        response = await chain.ainvoke({"question": q[:500]}) # Limit input length for title
        title = response.content.strip().strip('"').strip("'")
        # Ensure it's not too long
        if len(title) > 50:
            title = title[:47] + "..."
        return {"title": title}
    except Exception as e:
        import logging
        logging.error(f"Failed to generate title: {e}")
        return {"title": "New Chat"}
