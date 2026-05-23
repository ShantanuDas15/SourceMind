from fastapi import APIRouter, HTTPException, UploadFile, File
from app.api.schemas.requests import IngestRequest
from app.ingestion.pipeline import process_url_ingestion, process_pdf_ingestion
from loguru import logger

router = APIRouter()

@router.post("/ingest")
async def ingest_source(request: IngestRequest):
    try:
        url_str = str(request.url)
        logger.info(f"Received ingestion request for URL: {url_str} in session {request.session_id}")
        
        result = await process_url_ingestion(url_str, session_id=request.session_id)
        
        return {
            "status": "success",
            "message": "Source ingested successfully",
            "data": result
        }
    except Exception as e:
        # Log the full exception internally for debugging
        logger.exception(f"Ingestion failed for URL request")
        # Return a sanitized message to the client — never expose raw exception details
        raise HTTPException(
            status_code=500,
            detail="Ingestion failed. Please check the URL and try again."
        )


@router.post("/ingest/pdf")
async def ingest_pdf(session_id: str = "sourcemind_default", file: UploadFile = File(...)):
    """Accepts a PDF file upload and ingests it into the vector store."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")
    
    try:
        file_bytes = await file.read()
        logger.info(f"Received PDF upload: {file.filename} ({len(file_bytes)} bytes) for session {session_id}")
        
        result = await process_pdf_ingestion(file_bytes, file.filename, session_id=session_id)
        
        return {
            "status": "success",
            "message": "PDF ingested successfully",
            "data": result
        }
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        # Log the full exception internally for debugging
        logger.exception(f"PDF ingestion failed for: {file.filename}")
        # Return a sanitized message to the client
        raise HTTPException(
            status_code=500,
            detail="PDF ingestion failed. Please ensure the file is a valid PDF and try again."
        )
