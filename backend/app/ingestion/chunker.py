from langchain_text_splitters import RecursiveCharacterTextSplitter
from loguru import logger
from typing import List

def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[str]:
    """
    Splits text into overlapping chunks using RecursiveCharacterTextSplitter.
    """
    logger.info(f"Chunking text of length {len(text)} (size={chunk_size}, overlap={chunk_overlap})")
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", " ", ""]
    )
    
    chunks = text_splitter.split_text(text)
    logger.info(f"Generated {len(chunks)} chunks")
    
    return chunks
