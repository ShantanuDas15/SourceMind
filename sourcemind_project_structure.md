# 📂 SourceMind — Project Structure

> **Architecture:** Decoupled Monorepo · FastAPI Backend + React Frontend  
> **Aligned To:** [sourcemind_techstack.md](./sourcemind_techstack.md)  
> **Last Updated:** May 2026

---

## Table of Contents

1. [High-Level Overview](#1-high-level-overview)
2. [Root Directory](#2-root-directory)
3. [Backend — `backend/`](#3-backend--backend)
4. [Frontend — `frontend/`](#4-frontend--frontend)
5. [Docker & DevOps](#5-docker--devops)
6. [File Count Summary](#6-file-count-summary)
7. [Version Reference](#7-version-reference)

---

## 1. High-Level Overview

```
SourceMind/
├── backend/                    # Python · FastAPI · LangGraph · RAG pipeline
├── frontend/                   # TypeScript · React 19 · Vite 8
├── docker/                     # Dockerfiles + docker-compose
├── docs/                       # Architecture docs + ADRs
├── scripts/                    # Utility scripts (setup, seed, etc.)
├── .github/                    # CI/CD workflows (optional)
├── .env.example                # Template environment variables
├── .gitignore
├── LICENSE
├── README.md
└── docker-compose.yml          # Orchestrates backend + chromadb
```

---

## 2. Root Directory

```
SourceMind/
│
│── .env.example                # Template with all required env vars (never real keys)
│── .gitignore                  # Python, Node, IDE, .env, chroma_db/, dist/
│── docker-compose.yml          # Services: backend, chromadb
│── LICENSE                     # MIT / Apache 2.0
│── README.md                   # Project overview, setup, usage, screenshots
│── Makefile                    # Common commands: make dev, make build, make test
│
├── backend/                    # ← Python backend (§3)
├── frontend/                   # ← React frontend (§4)
├── docker/                     # ← Docker configs (§5)
├── docs/                       # ← Documentation
│   ├── sourcemind_techstack.md
│   ├── sourcemind_project_structure.md
│   └── architecture.md         # System diagrams + ADRs
│
└── scripts/
    ├── setup_backend.sh        # Create venv, install deps, pull Ollama models
    ├── setup_frontend.sh       # npm install + env setup
    └── seed_data.sh            # Optional: pre-ingest sample docs for demo
```

### Key Root Files

| File | Purpose |
|---|---|
| `.env.example` | Documents all env vars — copy to `backend/.env` and `frontend/.env` |
| `docker-compose.yml` | Runs `backend` + `chromadb` services; frontend runs standalone via Vite |
| `Makefile` | Shortcut commands for dev, test, build, lint across both stacks |
| `README.md` | First touchpoint — setup instructions, feature list, demo GIF |

---

## 3. Backend — `backend/`

> **Runtime:** Python `3.12.3` · pip + venv  
> **Framework:** FastAPI `0.136.1` · Uvicorn `0.47.0`  
> **Orchestration:** LangChain `1.3.1` · LangGraph `1.2.1`

```
backend/
│
│── .env                            # 🔒 API keys (git-ignored)
│── .env.example                    # Template for backend env vars
│── requirements.txt                # Pinned Python dependencies
│── pyproject.toml                  # Project metadata (optional, for tooling)
│── pytest.ini                      # Pytest configuration
│
├── app/
│   │── __init__.py
│   │── main.py                     # FastAPI app factory + lifespan events
│   │── config.py                   # Settings via Pydantic BaseSettings + .env
│   │
│   ├── api/                        # ── HTTP Layer ──────────────────────
│   │   │── __init__.py
│   │   │── router.py               # Aggregates all route modules
│   │   ├── routes/
│   │   │   │── __init__.py
│   │   │   │── ingest.py           # POST /api/ingest
│   │   │   │── query.py            # POST /api/query
│   │   │   │── stream.py          # GET  /api/stream (SSE endpoint)
│   │   │   │── sources.py          # GET  /api/sources · DELETE /api/clear
│   │   │   └── eval.py             # GET  /api/eval/metrics
│   │   ├── schemas/
│   │   │   │── __init__.py
│   │   │   │── requests.py         # Pydantic request models
│   │   │   │── responses.py        # Pydantic response models
│   │   │   └── events.py           # SSE event data models
│   │   └── dependencies.py         # FastAPI Depends() — DB sessions, auth
│   │
│   ├── agents/                     # ── Orchestration Layer ─────────────
│   │   │── __init__.py
│   │   │── graph.py                # LangGraph state graph definition
│   │   │── state.py                # AgentState TypedDict
│   │   │── planner.py              # Planner node — decides next action
│   │   └── nodes/
│   │       │── __init__.py
│   │       │── web_search.py       # web_search_tool → Crawl4AI
│   │       │── pdf_ingest.py       # pdf_ingest_tool → PyMuPDF
│   │       │── youtube.py          # youtube_tool → youtube-transcript-api
│   │       │── retrieve.py         # retrieve_tool → EnsembleRetriever
│   │       └── synthesize.py       # synthesize_tool → Groq streaming LLM
│   │
│   ├── ingestion/                  # ── Data Ingestion Layer ────────────
│   │   │── __init__.py
│   │   │── web_crawler.py          # Crawl4AI AsyncWebCrawler wrapper
│   │   │── pdf_parser.py           # PyMuPDF / PyMuPDFLoader wrapper
│   │   │── youtube_fetcher.py      # youtube-transcript-api wrapper
│   │   │── chunker.py              # RecursiveCharacterTextSplitter config
│   │   └── pipeline.py             # Orchestrates: crawl → chunk → embed → store
│   │
│   ├── retrieval/                  # ── Vector Store & Retrieval Layer ──
│   │   │── __init__.py
│   │   │── vectorstore.py          # ChromaDB client init + collection mgmt
│   │   │── embeddings.py           # Ollama nomic-embed-text wrapper
│   │   │── bm25_retriever.py       # rank-bm25 keyword retriever
│   │   │── hybrid_retriever.py     # EnsembleRetriever (60% dense + 40% BM25)
│   │   └── qdrant_store.py         # Qdrant Cloud adapter (deployment swap-in)
│   │
│   ├── llm/                        # ── LLM & AI Layer ─────────────────
│   │   │── __init__.py
│   │   │── groq_client.py          # Groq SDK + langchain-groq wrapper
│   │   │── prompts/
│   │   │   │── __init__.py
│   │   │   │── system_prompts.py   # System prompt templates
│   │   │   │── planner_prompts.py  # Planner agent prompt
│   │   │   └── synthesis_prompts.py # Report synthesis prompt with citations
│   │   └── streaming.py            # SSE streaming generator utility
│   │
│   ├── evaluation/                 # ── Evaluation Layer ────────────────
│   │   │── __init__.py
│   │   │── ragas_evaluator.py      # RAGAS metric computation
│   │   │── metrics.py              # Faithfulness, relevancy, precision, recall
│   │   └── store.py                # In-memory eval results cache
│   │
│   ├── memory/                     # ── Conversation Memory ────────────
│   │   │── __init__.py
│   │   └── conversation.py         # ConversationBufferWindowMemory (k=5)
│   │
│   ├── middleware/                  # ── Middleware ──────────────────────
│   │   │── __init__.py
│   │   │── cors.py                 # CORS config for React frontend
│   │   │── logging.py              # Request/response logging middleware
│   │   └── error_handler.py        # Global exception handler
│   │
│   └── utils/                      # ── Utilities ──────────────────────
│       │── __init__.py
│       │── logger.py               # Loguru configuration
│       │── validators.py           # URL, file type validators
│       └── helpers.py              # Shared helper functions
│
├── tests/                          # ── Test Suite ──────────────────────
│   │── __init__.py
│   │── conftest.py                 # Shared fixtures (test client, mock LLM)
│   ├── unit/
│   │   │── __init__.py
│   │   │── test_chunker.py         # Chunking logic tests
│   │   │── test_embeddings.py      # Embedding wrapper tests
│   │   │── test_hybrid_retriever.py # Retrieval blend tests
│   │   │── test_web_crawler.py     # Crawl4AI wrapper tests
│   │   │── test_pdf_parser.py      # PDF parsing tests
│   │   │── test_youtube_fetcher.py # Transcript fetcher tests
│   │   └── test_ragas_evaluator.py # RAGAS metric tests
│   ├── integration/
│   │   │── __init__.py
│   │   │── test_ingest_endpoint.py # POST /api/ingest e2e
│   │   │── test_query_endpoint.py  # POST /api/query e2e
│   │   │── test_stream_endpoint.py # GET /api/stream SSE e2e
│   │   └── test_pipeline.py        # Full ingest → retrieve → synthesize
│   └── fixtures/
│       ├── sample.pdf              # Test PDF document
│       ├── sample_transcript.json  # Mock YouTube transcript
│       └── sample_webpage.html     # Mock crawled HTML
│
├── chroma_db/                      # 🔒 Git-ignored · ChromaDB persistent storage
│   └── .gitkeep
│
└── logs/                           # 🔒 Git-ignored · Loguru output
    └── .gitkeep
```

### Backend Key Files — Purpose Reference

| File | Layer | Description |
|---|---|---|
| `app/main.py` | Backend | FastAPI app factory; registers routers, middleware, lifespan |
| `app/config.py` | Backend | Pydantic `BaseSettings` — loads `.env`, validates config |
| `app/api/routes/stream.py` | Backend | SSE endpoint; yields tokens via `StreamingResponse` |
| `app/agents/graph.py` | Orchestration | LangGraph `StateGraph` — defines ReAct loop nodes + edges |
| `app/agents/state.py` | Orchestration | `AgentState` TypedDict — messages, sources, plan, status |
| `app/ingestion/pipeline.py` | Ingestion | Async pipeline: source → chunks → embeddings → ChromaDB |
| `app/retrieval/hybrid_retriever.py` | Retrieval | `EnsembleRetriever` — 60% Chroma dense + 40% BM25 |
| `app/llm/groq_client.py` | LLM | Groq API wrapper with fallback model support |
| `app/evaluation/ragas_evaluator.py` | Evaluation | Computes RAGAS metrics per query |

---

## 4. Frontend — `frontend/`

> **Runtime:** Node.js `22.x` LTS · npm `10.x`  
> **Framework:** React `19.2.x` · Vite `8.0.x` · TypeScript `5.8.x`  
> **Styling:** Tailwind CSS `4.3.x`

```
frontend/
│
│── .env                            # 🔒 Git-ignored · VITE_API_URL
│── .env.example                    # Template: VITE_API_URL=http://localhost:8000
│── package.json                    # Dependencies + scripts
│── package-lock.json               # Lockfile (auto-generated)
│── tsconfig.json                   # TypeScript compiler config (strict mode)
│── tsconfig.app.json               # App-specific TS config (extends base)
│── tsconfig.node.json              # Node/Vite TS config (extends base)
│── vite.config.ts                  # Vite config — React plugin, Tailwind plugin, proxy
│── eslint.config.js                # ESLint 9 flat config
│── .prettierrc                     # Prettier formatting rules
│── index.html                      # HTML entry point (Vite SPA shell)
│
├── public/
│   │── favicon.svg                 # App favicon
│   │── og-image.png                # OpenGraph meta image
│   └── robots.txt                  # SEO: allow all crawlers
│
├── src/
│   │── main.tsx                    # React root — renders <App /> into DOM
│   │── App.tsx                     # Root component — layout shell + provider wrappers
│   │── vite-env.d.ts               # Vite environment type declarations
│   │
│   ├── api/                        # ── API Client Layer ────────────────
│   │   │── client.ts               # Axios instance — baseURL, interceptors, error handling
│   │   │── ingest.ts               # postIngest(sources) → POST /api/ingest
│   │   │── query.ts                # postQuery(question) → POST /api/query
│   │   │── stream.ts               # startStream(query) → GET /api/stream (SSE via fetch)
│   │   │── sources.ts              # getSources() → GET /api/sources
│   │   │── eval.ts                 # getEvalMetrics() → GET /api/eval/metrics
│   │   └── clear.ts               # clearSources() → DELETE /api/clear
│   │
│   ├── components/                 # ── UI Components ──────────────────
│   │   ├── layout/
│   │   │   │── Header.tsx          # App header — logo, title, theme toggle
│   │   │   │── Sidebar.tsx         # Left sidebar — source list, eval metrics
│   │   │   │── MainPanel.tsx       # Main content area wrapper
│   │   │   └── Footer.tsx          # Footer — version, credits
│   │   │
│   │   ├── chat/
│   │   │   │── ChatContainer.tsx   # Scrollable message list + auto-scroll
│   │   │   │── ChatMessage.tsx     # Single message bubble (user vs assistant)
│   │   │   │── StreamingMessage.tsx # Live Markdown render via Streamdown
│   │   │   │── ChatInput.tsx       # Input bar — textarea + send button
│   │   │   └── ThinkingIndicator.tsx # Agent "thinking" animation
│   │   │
│   │   ├── ingestion/
│   │   │   │── IngestPanel.tsx     # Tab container for ingestion sources
│   │   │   │── UrlInput.tsx        # Web URL input with validation
│   │   │   │── PdfUpload.tsx       # Drag-and-drop PDF upload zone
│   │   │   │── YoutubeInput.tsx    # YouTube URL/ID input
│   │   │   │── ProgressStepper.tsx # Multi-step pipeline progress indicator
│   │   │   └── SourceTypeIcon.tsx  # Icon by source type (web/pdf/youtube)
│   │   │
│   │   ├── sources/
│   │   │   │── SourceList.tsx      # List of all ingested documents
│   │   │   │── SourceCard.tsx      # Individual source — title, type, metadata
│   │   │   └── CitationPanel.tsx   # Expandable evidence panel per source
│   │   │
│   │   ├── eval/
│   │   │   │── EvalDashboard.tsx   # RAGAS metrics overview panel
│   │   │   │── MetricsCard.tsx     # Single metric — gauge/progress display
│   │   │   └── MetricsHistory.tsx  # Metrics trend over queries (optional)
│   │   │
│   │   └── common/
│   │       │── Button.tsx          # Reusable button variants
│   │       │── Card.tsx            # Reusable card container
│   │       │── Modal.tsx           # Reusable modal dialog
│   │       │── Spinner.tsx         # Loading spinner
│   │       │── EmptyState.tsx      # "No data" placeholder
│   │       └── ErrorBoundary.tsx   # React error boundary wrapper
│   │
│   ├── hooks/                      # ── Custom Hooks ───────────────────
│   │   │── useSSE.ts               # SSE streaming hook (fetch + ReadableStream)
│   │   │── useChat.ts              # Chat message management + streaming state
│   │   │── useIngest.ts            # Ingestion actions + progress tracking
│   │   │── useEval.ts              # Fetch + cache RAGAS metrics
│   │   │── useSources.ts           # Source list CRUD operations
│   │   └── useTheme.ts             # Dark/light mode toggle
│   │
│   ├── stores/                     # ── Zustand State Stores ───────────
│   │   │── chatStore.ts            # Messages array, streaming flag, appendToken()
│   │   │── ingestStore.ts          # Ingestion sources, progress steps, status
│   │   │── evalStore.ts            # RAGAS metric scores cache
│   │   │── sourceStore.ts          # Ingested documents list
│   │   └── uiStore.ts              # UI state — sidebar open, theme, modals
│   │
│   ├── types/                      # ── TypeScript Type Definitions ────
│   │   │── index.ts                # Re-exports all types
│   │   │── api.ts                  # API request/response interfaces
│   │   │── chat.ts                 # Message, StreamState types
│   │   │── ingestion.ts            # IngestSource, IngestProgress types
│   │   │── eval.ts                 # RAGASMetrics, MetricScore types
│   │   └── sources.ts              # Source, SourceMetadata types
│   │
│   ├── styles/                     # ── Styling ────────────────────────
│   │   │── index.css               # @import "tailwindcss"; + custom CSS
│   │   └── animations.css          # Keyframe animations (streaming cursor, fade-in)
│   │
│   ├── utils/                      # ── Utility Functions ──────────────
│   │   │── formatters.ts           # Date formatting, byte size display
│   │   │── validators.ts           # URL validation, file type checks
│   │   │── constants.ts            # API routes, default config values
│   │   └── cn.ts                   # Tailwind className merge utility
│   │
│   └── assets/                     # ── Static Assets ──────────────────
│       │── logo.svg                # App logo
│       └── placeholder.svg         # Empty state illustration
│
└── tests/                          # ── Frontend Test Suite ─────────────
    │── setup.ts                    # Vitest global setup
    ├── unit/
    │   │── useSSE.test.ts          # SSE hook unit tests
    │   │── useChat.test.ts         # Chat hook unit tests
    │   │── chatStore.test.ts       # Zustand store tests
    │   └── formatters.test.ts      # Utility function tests
    └── components/
        │── ChatMessage.test.tsx    # Component render tests
        │── IngestPanel.test.tsx    # Ingestion UI tests
        └── EvalDashboard.test.tsx  # Metrics display tests
```

### Frontend Key Files — Purpose Reference

| File | Layer | Description |
|---|---|---|
| `vite.config.ts` | Build | Vite config — `@vitejs/plugin-react`, `@tailwindcss/vite`, dev proxy to FastAPI |
| `src/main.tsx` | Entry | React 19 `createRoot` — renders `<App />` |
| `src/App.tsx` | Root | Layout shell — Header, Sidebar, MainPanel; wraps providers |
| `src/api/client.ts` | API | Axios instance — `baseURL` from `VITE_API_URL`, error interceptors |
| `src/api/stream.ts` | API | SSE handler — `fetch` + `ReadableStream` for token streaming |
| `src/components/chat/StreamingMessage.tsx` | UI | Renders LLM tokens in real-time using Streamdown |
| `src/hooks/useSSE.ts` | Hook | Manages SSE lifecycle — connect, buffer tokens, cleanup |
| `src/stores/chatStore.ts` | State | Zustand store — message array, `appendToken()`, `isStreaming` |
| `src/styles/index.css` | Style | Tailwind CSS 4.3 import + custom design tokens |

---

## 5. Docker & DevOps

```
docker/
│── backend.Dockerfile              # Python 3.12-slim · pip install · uvicorn
│── chromadb.Dockerfile             # ChromaDB server (optional — can use docker image)
└── nginx.conf                      # Reverse proxy config (production only)

.github/                             # ── CI/CD (Optional) ──────────────
└── workflows/
    │── backend-ci.yml              # Lint + test backend on push
    │── frontend-ci.yml             # Lint + build + test frontend on push
    └── deploy.yml                  # Deploy to Vercel + Railway on main
```

### `docker-compose.yml` (Root)

```yaml
# Services: backend + chromadb
# Frontend runs standalone via `npm run dev` or deployed to Vercel

services:
  backend:
    build:
      context: ./backend
      dockerfile: ../docker/backend.Dockerfile
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    volumes:
      - ./backend:/app
      - chroma_data:/app/chroma_db
    depends_on:
      - chromadb
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  chromadb:
    image: chromadb/chroma:latest
    ports:
      - "8100:8000"
    volumes:
      - chroma_data:/chroma/chroma

volumes:
  chroma_data:
```

### `backend.Dockerfile`

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# System deps for PyMuPDF + Crawl4AI
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 6. File Count Summary

| Area | Directories | Files | Primary Language |
|---|---|---|---|
| **Root** | 5 | 6 | Config |
| **Backend** | 18 | 52 | Python `3.12` |
| **Frontend** | 19 | 58 | TypeScript `5.8` |
| **Docker / CI** | 3 | 6 | YAML / Dockerfile |
| **Docs** | 1 | 3 | Markdown |
| **Scripts** | 1 | 3 | Bash |
| **Total** | **47** | **128** | — |

---

## 7. Version Reference

All versions are pinned to the tech stack document for consistency.

### Backend (Python)

| Package | Version | Role |
|---|---|---|
| Python | `3.12.3` | Runtime |
| FastAPI | `0.136.1` | Web framework |
| Uvicorn | `0.47.0` | ASGI server |
| Pydantic | `2.13.4` | Data validation |
| LangChain | `1.3.1` | Orchestration |
| LangGraph | `1.2.1` | Agent framework |
| langchain-core | `1.4.0` | Core abstractions |
| langchain-community | `0.4.1` | Community integrations |
| langchain-groq | `1.1.2` | Groq LLM integration |
| ChromaDB | `1.5.9` | Vector store |
| rank-bm25 | `0.2.2` | BM25 keyword retrieval |
| Crawl4AI | `0.8.6` | Web crawler |
| PyMuPDF | `1.27.2.3` | PDF parser |
| youtube-transcript-api | `1.2.4` | YouTube transcripts |
| httpx | `0.28.1` | Async HTTP client |
| RAGAS | `0.4.3` | RAG evaluation |
| sentence-transformers | `5.5.1` | Fallback embeddings |
| python-dotenv | `1.2.2` | Env management |
| Loguru | `0.7.3` | Logging |

### Frontend (Node.js)

| Package | Version | Role |
|---|---|---|
| Node.js | `22.x` LTS | Runtime |
| React | `19.2.x` | UI library |
| React DOM | `19.2.x` | DOM renderer |
| Vite | `8.0.x` | Build tool |
| TypeScript | `5.8.x` | Type system |
| Tailwind CSS | `4.3.x` | Styling |
| @tailwindcss/vite | `4.3.x` | Vite plugin |
| @vitejs/plugin-react | `4.5.x` | React Vite plugin |
| Axios | `1.9.x` | HTTP client |
| Zustand | `5.x` | State management |
| Streamdown | latest | Streaming Markdown |
| Lucide React | latest | Icons |
| ESLint | `9.x` | Linting |
| Prettier | `3.x` | Formatting |
| Vitest | `3.x` | Testing |

### Infrastructure

| Tool | Version | Role |
|---|---|---|
| Docker | `27.x` | Containerization |
| Docker Compose | `v2.x` | Service orchestration |
| Ollama | `0.5.x` | Local embedding model server |
| Vercel | — | Frontend deployment (free) |
| Railway | — | Backend deployment (free) |

---

> **Note:** This structure follows a **clean separation of concerns** — each backend module maps directly to a layer in the tech stack (Ingestion, Retrieval, LLM, Orchestration, Evaluation). The frontend mirrors this with dedicated API modules, stores, and component groups per feature domain.

---

*Generated by Lead Architect · May 2026*
