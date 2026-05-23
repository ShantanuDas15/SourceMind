import os
from crawl4ai import AsyncWebCrawler
from loguru import logger

async def crawl_url(url: str) -> str:
    """
    Crawls a given URL and returns the extracted Markdown content.
    Uses crawl4ai AsyncWebCrawler.
    """
    logger.info(f"Starting web crawl for: {url}")
    
    # We use a context manager to ensure proper cleanup of the headless browser
    async with AsyncWebCrawler(verbose=True) as crawler:
        try:
            result = await crawler.arun(url=url)
            
            if not result.success:
                logger.error(f"Failed to crawl {url}: {result.error_message}")
                raise ValueError(f"Failed to crawl URL: {result.error_message}")
                
            logger.info(f"Successfully extracted {len(result.markdown)} characters of markdown from {url}")
            return result.markdown
            
        except Exception as e:
            logger.error(f"Exception during web crawling for {url}: {str(e)}")
            raise
