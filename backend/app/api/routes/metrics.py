from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from app.evaluation.ragas_evaluator import evaluate_rag_response
from app.retrieval.vectorstore import get_vectorstore

router = APIRouter()

class EvalRequest(BaseModel):
    question: str = Field(..., description="The original user query")
    answer: str = Field(..., description="The generated answer from the AI")
    session_id: str = Field("sourcemind_default", description="Session ID to retrieve context")
    contexts: Optional[List[str]] = Field(default=None, description="Optional contexts")

class EvalResponse(BaseModel):
    faithfulness: float
    answer_relevancy: float

@router.post("/evaluate", response_model=EvalResponse)
async def evaluate_endpoint(req: EvalRequest):
    """
    Evaluates a generated RAG answer using RAGAS Faithfulness and Answer Relevancy.
    """
    try:
        contexts = req.contexts
        if not contexts:
            # Retrieve contexts on the fly
            vectorstore = get_vectorstore(req.session_id)
            # Replicate retrieval step
            docs = vectorstore.similarity_search(req.question, k=4)
            contexts = [doc.page_content for doc in docs]
            
        if not contexts or all(not c.strip() for c in contexts):
            return EvalResponse(faithfulness=0.0, answer_relevancy=0.0)

        scores = await evaluate_rag_response(
            question=req.question,
            answer=req.answer,
            contexts=contexts
        )
        return EvalResponse(
            faithfulness=scores.get("faithfulness", 0.0),
            answer_relevancy=scores.get("answer_relevancy", 0.0)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")

