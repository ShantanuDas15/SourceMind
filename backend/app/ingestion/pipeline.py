from app.ingestion.web_crawler import crawl_url
from app.ingestion.pdf_parser import parse_pdf
from app.ingestion.chunker import chunk_text
from app.retrieval.vectorstore import store_documents
from langchain_core.documents import Document
from loguru import logger
import uuid

async def process_url_ingestion(url: str, session_id: str = "sourcemind_default"):
    """
    Orchestrates the ingestion pipeline for a single URL:
    Parse -> Chunk -> Embed -> Store.
    """
    logger.info(f"--- Starting Ingestion Pipeline for {url} in session {session_id} ---")
    
    # 1. Parse
    markdown_content = await crawl_url(url)
    
    # 2. Chunk
    text_chunks = chunk_text(markdown_content)
    
    # Create LangChain Document objects
    documents = []
    source_id = str(uuid.uuid4())
    
    for i, chunk in enumerate(text_chunks):
        doc = Document(
            page_content=chunk,
            metadata={
                "source": url,
                "source_type": "web",
                "chunk_index": i,
                "source_id": source_id
            }
        )
        documents.append(doc)
        
    # 3 & 4. Embed & Store
    store_documents(documents, collection_name=session_id)
    
    logger.info(f"--- Completed Ingestion Pipeline for {url} in session {session_id} ---")
    return {"url": url, "chunks_stored": len(documents), "source_id": source_id}


async def process_pdf_ingestion(file_bytes: bytes, filename: str, session_id: str = "sourcemind_default"):
    """
    Orchestrates the ingestion pipeline for a PDF file:
    Parse -> Chunk -> Embed -> Store.
    """
    logger.info(f"--- Starting PDF Ingestion Pipeline for {filename} in session {session_id} ---")
    
    # 1. Parse
    raw_text = parse_pdf(file_bytes, filename)
    
    if not raw_text.strip():
        raise ValueError(f"No text could be extracted from {filename}")
    
    # 2. Chunk
    text_chunks = chunk_text(raw_text)
    
    # Create LangChain Document objects
    documents = []
    source_id = str(uuid.uuid4())
    
    for i, chunk in enumerate(text_chunks):
        doc = Document(
            page_content=chunk,
            metadata={
                "source": filename,
                "source_type": "pdf",
                "chunk_index": i,
                "source_id": source_id
            }
        )
        documents.append(doc)
    
    # 3 & 4. Embed & Store
    store_documents(documents, collection_name=session_id)
    
    logger.info(f"--- Completed PDF Ingestion Pipeline for {filename} in session {session_id} ---")
    return {"filename": filename, "chunks_stored": len(documents), "source_id": source_id}

