from fastapi import FastAPI
from app.config import settings
from app.middleware.cors import setup_cors

app = FastAPI(
    title="SourceMind API",
    description="Backend for SourceMind multi-source RAG research agent",
    version="1.0.0"
)

# Set up CORS middleware
setup_cors(app)

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "message": "SourceMind Backend is running",
        "environment": settings.APP_ENV
    }
