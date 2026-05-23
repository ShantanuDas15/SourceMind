from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

def setup_cors(app: FastAPI) -> None:
    # Support multiple origins: the configured one plus common Vite fallback ports
    origins = [
        settings.FRONTEND_ORIGIN,
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
    ]
    # Deduplicate while preserving order
    unique_origins = list(dict.fromkeys(origins))

    app.add_middleware(
        CORSMiddleware,
        allow_origins=unique_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
