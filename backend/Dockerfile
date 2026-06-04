# ============================================
# Stage 1: Builder — install Python dependencies
# ============================================
FROM python:3.12-slim AS builder

# Install system deps needed for building native extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast dependency resolution
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Copy dependency manifests first for Docker layer caching
COPY requirements.txt pyproject.toml ./

# Install dependencies into a virtual environment
RUN uv venv /opt/venv && \
    . /opt/venv/bin/activate && \
    uv pip install -r requirements.txt pydantic-settings

# Install playwright browsers
RUN . /opt/venv/bin/activate && playwright install chromium

# ============================================
# Stage 2: Runtime — lean production image
# ============================================
FROM python:3.12-slim AS runtime

# Copy the virtual environment from the builder
COPY --from=builder /opt/venv /opt/venv

# Ensure the venv is on PATH
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Install system dependencies for Playwright
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 \
    libxss1 \
    libasound2t64 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy application code
COPY . .

# Expose the Hugging Face Spaces default port
EXPOSE 7860

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:7860/api/health')" || exit 1

# Start the server on port 7860
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
