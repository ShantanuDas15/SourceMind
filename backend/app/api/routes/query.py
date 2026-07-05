from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter()

# ponytail: simple in-memory store, avoiding full DB dependencies
_memory_db: Dict[str, List[Dict[str, Any]]] = {}

class ChatHistoryRequest(BaseModel):
    session_id: str
    messages: List[Dict[str, Any]]

@router.get("/query/{session_id}")
async def get_history(session_id: str):
    return {"status": "success", "data": _memory_db.get(session_id, [])}

@router.post("/query")
async def save_history(req: ChatHistoryRequest):
    _memory_db[req.session_id] = req.messages
    return {"status": "success"}

@router.delete("/query/{session_id}")
async def clear_history(session_id: str):
    _memory_db.pop(session_id, None)
    return {"status": "success"}
