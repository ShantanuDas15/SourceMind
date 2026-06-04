import asyncio
from typing import Dict, List
from datasets import Dataset

from loguru import logger
from langchain_groq import ChatGroq

from app.config import settings
from app.retrieval.embeddings import get_embeddings_model

def get_evaluator_llm() -> ChatGroq:
    """Returns a deterministic LLM for grading."""
    return ChatGroq(
        model=settings.GROQ_MODEL, 
        api_key=settings.GROQ_API_KEY, 
        temperature=0.0
    )

async def evaluate_rag_response(question: str, answer: str, contexts: List[str]) -> Dict[str, float]:
    """
    Evaluates a RAG response using RAGAS Faithfulness and Answer Relevancy metrics.
    Runs entirely isolated from the main chat loop.
    """
    if not settings.GROQ_API_KEY:
        logger.warning("Skipping evaluation: GROQ_API_KEY is not set.")
        return {"faithfulness": 0.0, "answer_relevancy": 0.0}

    logger.info(f"Starting RAGAS evaluation for question: '{question[:50]}...'")
    
    # RAGAS requires specific keys: question, answer, contexts
    data = {
        "question": [question],
        "answer": [answer],
        "contexts": [contexts],
    }
    
    try:
        from ragas import evaluate
        from ragas.metrics import faithfulness, answer_relevancy
        dataset = Dataset.from_dict(data)
        
        # Run evaluation
        # ragas.evaluate runs synchronously in the current thread.
        # We wrap it in run_in_executor to avoid blocking the FastAPI event loop.
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: evaluate(
                dataset=dataset,
                metrics=[faithfulness, answer_relevancy],
                llm=get_evaluator_llm(),
                embeddings=get_embeddings_model(),
                raise_exceptions=False,
            )
        )
        
        scores = {
            "faithfulness": round(float(result.get("faithfulness", 0.0)), 2),
            "answer_relevancy": round(float(result.get("answer_relevancy", 0.0)), 2)
        }
        logger.info(f"RAGAS evaluation complete: {scores}")
        return scores
        
    except Exception as e:
        logger.error(f"RAGAS Evaluation failed: {e}")
        return {"faithfulness": 0.0, "answer_relevancy": 0.0}
