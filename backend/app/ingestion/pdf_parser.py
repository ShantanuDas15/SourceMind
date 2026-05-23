import pymupdf
from loguru import logger
from typing import List

def parse_pdf(file_bytes: bytes, filename: str = "uploaded.pdf") -> str:
    """
    Extracts text from a PDF file using PyMuPDF.
    Accepts raw bytes (from an uploaded file) and returns concatenated text.
    """
    logger.info(f"Parsing PDF: {filename}")
    
    doc = pymupdf.open(stream=file_bytes, filetype="pdf")
    
    pages_text: List[str] = []
    for page_num, page in enumerate(doc):
        text = page.get_text()
        if text.strip():
            pages_text.append(text)
        logger.debug(f"Page {page_num + 1}: extracted {len(text)} characters")
    
    doc.close()
    
    full_text = "\n\n".join(pages_text)
    logger.info(f"Successfully extracted {len(full_text)} characters from {len(pages_text)} pages of {filename}")
    
    return full_text
