from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter()

# ponytail: simple in-memory store for sources
_sources_db: Dict[str, List[Dict[str, Any]]] = {}

class SourcesRequest(BaseModel):
    session_id: str
    sources: List[Dict[str, Any]]

@router.get("/sources/{session_id}")
async def get_sources(session_id: str):
    return {"status": "success", "data": _sources_db.get(session_id, [])}

@router.post("/sources")
async def save_sources(req: SourcesRequest):
    _sources_db[req.session_id] = req.sources
    return {"status": "success"}

@router.delete("/sources/{session_id}")
async def clear_sources(session_id: str):
    _sources_db.pop(session_id, None)
    return {"status": "success"}
