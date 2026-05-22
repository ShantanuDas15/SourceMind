# 🧠 SourceMind — Complete Tech Stack

> **Project Type:** Intermediate Generative AI · Solo Developer  
> **Cost:** 100% Free (Development + Deployment)  
> **Last Updated:** May 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Runtime & Environment](#3-runtime--environment)
4. [LLM & AI Layer](#4-llm--ai-layer)
5. [Orchestration Layer](#5-orchestration-layer)
6. [Data Ingestion Layer](#6-data-ingestion-layer)
7. [Vector Store & Retrieval Layer](#7-vector-store--retrieval-layer)
8. [Backend Layer](#8-backend-layer)
9. [Frontend Layer](#9-frontend-layer)
10. [Evaluation Layer](#10-evaluation-layer)
11. [DevOps & Deployment Layer](#11-devops--deployment-layer)
12. [Complete Dependency Reference](#12-complete-dependency-reference)

---

## 1. Project Overview

A multi-source Retrieval-Augmented Generation (RAG) research agent. User provides a topic or question; the agent autonomously crawls the web, parses PDFs, and fetches YouTube transcripts. Content is chunked, embedded, stored in a vector database, and retrieved via hybrid search. A hosted LLM synthesizes a cited research report with streaming output.

**Core Data Flow:**

```
User Topic
    │
    ▼
┌─────────────────────────────────────┐
│  Ingestion Agent (Crawl4AI + tools) │
│  Web Pages │ PDFs │ YouTube Transcripts │
└────────────────────┬────────────────┘
                     │ Raw text chunks
                     ▼
┌─────────────────────────────────────┐
│  Embedding Pipeline                 │
│  nomic-embed-text (Ollama, local)   │
└────────────────────┬────────────────┘
                     │ Vectors + metadata
                     ▼
┌─────────────────────────────────────┐
│  Hybrid Retrieval                   │
│  ChromaDB (vector) + BM25 (keyword) │
└────────────────────┬────────────────┘
                     │ Top-k context
                     ▼
┌─────────────────────────────────────┐
│  LLM Synthesis (Groq — Llama 3.3 70B) │
│  Streaming · Citations · Report     │
└─────────────────────────────────────┘
```

---

## 2. System Architecture

### Architecture Pattern

| Concern | Decision | Rationale |
|---|---|---|
| Agent Pattern | ReAct Loop via LangGraph | Gives recruiters a visible thought trace |
| RAG Strategy | Hybrid BM25 + Dense Retrieval | Outperforms pure vector search on precision |
| Chunking | Recursive Character + Semantic | Preserves context boundaries |
| LLM Inference | Groq Cloud free tier | ~300 tokens/sec — fast enough for streaming demo |
| Embeddings | Local Ollama (nomic-embed-text) | Zero API cost, privacy-safe |
| Serving | FastAPI async + SSE | Production-grade streaming pattern |
| UI | React 19 + Vite 8 | Production-grade SPA; Vercel-native; decoupled from backend |

---

## 3. Runtime & Environment

| Component | Tool | Version | Notes |
|---|---|---|---|
| Language | Python | `3.12.3` | Stable; full LangChain + FastAPI + Crawl4AI compat |
| Package Manager (Backend) | pip + venv | `24.x` | Standard; no Poetry overhead for solo project |
| Package Manager (Frontend) | npm | `10.x` | Node.js package manager for React frontend |
| Local LLM Runtime | Ollama | `0.5.x` | Serves nomic-embed-text locally on RTX 4060 |
| Env Management | python-dotenv | `1.2.2` | `.env` file for API keys |
| Logging | Loguru | `0.7.3` | Drop-in replacement for stdlib logging |

> **Note for your hardware:** Ollama on RTX 4060 (8GB VRAM) handles `nomic-embed-text` (274M params) with ease. No quantization needed.

---

## 4. LLM & AI Layer

### 4.1 Language Model

| Component | Tool | Version / Model | Free Tier |
|---|---|---|---|
| LLM Provider | Groq API | SDK `0.14.x` | ✅ 14,400 req/day free |
| Primary Model | `llama-3.3-70b-versatile` | Meta Llama 3.3 70B | ✅ Free on Groq |
| Fallback Model | `llama-3.1-8b-instant` | Meta Llama 3.1 8B | ✅ Free on Groq |
| LangChain Integration | `langchain-groq` | `1.1.2` | Wraps Groq SDK cleanly |

**Why Llama 3.3 70B on Groq:** Groq's LPU inference delivers ~300 tok/sec on 70B — demo-ready streaming that visually impresses. No GPU cost.

### 4.2 Embeddings

| Component | Tool | Version / Model | Free Tier |
|---|---|---|---|
| Embedding Model | `nomic-embed-text-v1.5` | via Ollama | ✅ 100% local |
| Dimensions | 768 | — | — |
| Context Window | 8192 tokens | — | — |
| LangChain Integration | `langchain-community` (OllamaEmbeddings) | `0.4.1` | — |

**Fallback option:** `sentence-transformers` `5.5.1` with `all-MiniLM-L6-v2` if Ollama not available in deployment.

---

## 5. Orchestration Layer

| Component | Tool | Version | Purpose |
|---|---|---|---|
| Primary Orchestrator | LangChain | `1.3.1` | RAG chain, prompt templates, memory |
| Agent Framework | LangGraph | `1.2.1` | Stateful ReAct agent loop with visible step trace |
| Core Abstractions | langchain-core | `1.4.0` | Runnables, LCEL pipeline |
| Community Integrations | langchain-community | `0.4.1` | ChromaDB retriever, BM25 retriever, loaders |
| Chunking | `RecursiveCharacterTextSplitter` | (in langchain) | 1000 char chunks, 200 char overlap |
| Hybrid Retrieval | `EnsembleRetriever` (BM25 + Chroma) | (in langchain) | 60% dense + 40% sparse |
| BM25 Backend | rank-bm25 | `0.2.2` | Keyword retrieval for hybrid search |
| Memory | `ConversationBufferWindowMemory` | (in langchain) | Last 5 turns context window |

### Agent Tool Set (LangGraph Nodes)

```
AgentState
├── web_search_tool        → Crawl4AI AsyncWebCrawler
├── pdf_ingest_tool        → PyMuPDF loader
├── youtube_tool           → youtube-transcript-api
├── retrieve_tool          → EnsembleRetriever (ChromaDB + BM25)
└── synthesize_tool        → Groq streaming LLM call
```

---

## 6. Data Ingestion Layer

### 6.1 Web Crawling

| Component | Tool | Version | Notes |
|---|---|---|---|
| Web Crawler | Crawl4AI | `0.8.6` | Async, JS-rendering via Playwright, Markdown output |
| HTML→Markdown | Built-in Crawl4AI | — | Clean extraction, strips nav/ads |
| Async HTTP | httpx | `0.28.1` | Fallback for simple GET requests |

**Crawl4AI advantage:** Returns pre-cleaned Markdown. No BeautifulSoup post-processing needed. Handles SPAs via headless Chromium.

### 6.2 PDF Parsing

| Component | Tool | Version | Notes |
|---|---|---|---|
| PDF Parser | PyMuPDF (`fitz`) | `1.27.2.3` | Fastest Python PDF lib; handles scanned PDFs |
| LangChain Loader | `PyMuPDFLoader` | (in langchain-community) | Metadata-preserving page-level extraction |

### 6.3 YouTube Transcripts

| Component | Tool | Version | Notes |
|---|---|---|---|
| Transcript Fetcher | youtube-transcript-api | `1.2.4` | No API key needed; uses YouTube's public endpoint |
| Supported Inputs | Video URL or `?v=ID` | — | Auto-detects language, fetches auto-captions |

---

## 7. Vector Store & Retrieval Layer

### 7.1 Primary Vector Store

| Component | Tool | Version | Free Tier |
|---|---|---|---|
| Vector DB | ChromaDB | `1.5.9` | ✅ Local (dev) + embedded mode |
| Persistence | Local disk (`./chroma_db`) | — | No cloud dependency |
| Collection Strategy | Per-session + global knowledge base | — | Two named collections |
| Distance Metric | `cosine` | — | Best for text embeddings |

### 7.2 Cloud Vector Store (Optional / Deployment)

| Component | Tool | Version | Free Tier |
|---|---|---|---|
| Cloud Vector DB | Qdrant Cloud | REST API | ✅ 1GB free cluster |
| LangChain Integration | `langchain-qdrant` | `0.2.x` | Swap-in for ChromaDB |

> **Recommendation:** Use ChromaDB locally during dev. Switch to Qdrant Cloud on HF Spaces for persistent storage across sessions.

---

## 8. Backend Layer

| Component | Tool | Version | Purpose |
|---|---|---|---|
| Web Framework | FastAPI | `0.136.1` | Async API, SSE streaming endpoint |
| ASGI Server | Uvicorn | `0.47.0` | Production ASGI runner |
| Data Validation | Pydantic v2 | `2.13.4` | Request/response models, strict typing |
| Async Runtime | asyncio + anyio | (stdlib / FastAPI dep) | Concurrent ingestion tasks |
| File Uploads | FastAPI `UploadFile` | — | PDF drag-and-drop endpoint |
| CORS | FastAPI CORSMiddleware | — | Required — allows React frontend (Vite dev server / Vercel) to call API |

### Key Endpoints

```
POST /api/ingest          → trigger multi-source ingestion
GET  /api/stream          → SSE stream of LLM synthesis
POST /api/query           → single-turn Q&A with sources
GET  /api/sources         → list ingested docs + metadata
GET  /api/eval/metrics    → RAGAS evaluation scores (JSON)
DELETE /api/clear         → wipe session vector store
```

---

## 9. Frontend Layer

### 9.1 Core Framework

| Component | Tool | Version | Purpose |
|---|---|---|---|
| UI Library | React | `19.2.x` | Production-grade SPA; React Compiler auto-memoization |
| Build Tool | Vite | `8.0.x` | Rolldown-powered; fastest cold starts; native React 19 support |
| Language | TypeScript | `5.8.x` | Type safety matching Pydantic backend contracts |
| Styling | Tailwind CSS | `4.3.x` | CSS-first config; utility-first rapid UI development |
| HTTP Client | Axios | `1.9.x` | Interceptors for error handling, request/response transforms |
| SSE Client | Native `EventSource` + `fetch` fallback | Browser built-in | `fetch` ReadableStream for auth header support |
| Markdown Renderer | Streamdown | latest | Purpose-built for streaming LLM output; handles incomplete blocks |
| State Management | Zustand | `5.x` | Lightweight, zero-boilerplate; chat + ingestion + eval state |
| Icons | Lucide React | latest | Tree-shakeable, consistent icon set |

### 9.2 Dev Tooling

| Tool | Version | Purpose |
|---|---|---|
| ESLint | `9.x` | Linting with flat config |
| Prettier | `3.x` | Code formatting |
| Vitest | `3.x` | Unit testing (Vite-native) |

### 9.3 Component Architecture

```
src/
├── main.tsx                    # App entry point
├── App.tsx                     # Root layout + routing
├── api/
│   ├── client.ts               # Axios instance + interceptors
│   ├── ingest.ts               # POST /api/ingest
│   ├── query.ts                # POST /api/query
│   ├── stream.ts               # GET /api/stream (SSE handler)
│   └── sources.ts              # GET /api/sources, DELETE /api/clear
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── MainPanel.tsx
│   ├── chat/
│   │   ├── ChatContainer.tsx   # Message list + streaming display
│   │   ├── ChatMessage.tsx     # Single message (user/assistant)
│   │   ├── StreamingMessage.tsx # Token-by-token Markdown render
│   │   └── ChatInput.tsx       # Topic/question input bar
│   ├── ingestion/
│   │   ├── IngestPanel.tsx     # Ingestion controls container
│   │   ├── UrlInput.tsx        # Web URL input
│   │   ├── PdfUpload.tsx       # Drag-and-drop PDF zone
│   │   ├── YoutubeInput.tsx    # YouTube URL input
│   │   └── ProgressStepper.tsx # Multi-step pipeline progress
│   ├── sources/
│   │   ├── SourceList.tsx      # List of ingested documents
│   │   └── CitationPanel.tsx   # Collapsible source evidence
│   └── eval/
│       ├── MetricsCard.tsx     # RAGAS metric display card
│       └── EvalDashboard.tsx   # Faithfulness, relevancy, etc.
├── hooks/
│   ├── useSSE.ts               # SSE connection hook with cleanup
│   ├── useIngest.ts            # Ingestion state + API calls
│   └── useChat.ts              # Chat history + streaming state
├── stores/
│   ├── chatStore.ts            # Zustand: messages, streaming state
│   ├── ingestStore.ts          # Zustand: sources, ingestion progress
│   └── evalStore.ts            # Zustand: RAGAS metrics
├── types/
│   └── index.ts                # Shared TypeScript interfaces
├── styles/
│   └── index.css               # Tailwind imports + custom styles
└── utils/
    └── formatters.ts           # Date, source type formatting
```

### 9.4 SSE Streaming Pattern

```tsx
// hooks/useSSE.ts — Core streaming hook
import { useRef, useCallback } from 'react';
import { useChatStore } from '../stores/chatStore';

export function useSSE(apiBaseUrl: string) {
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const { appendToken, setStreaming } = useChatStore();

  const startStream = useCallback(async (query: string) => {
    setStreaming(true);
    const response = await fetch(
      `${apiBaseUrl}/api/stream?q=${encodeURIComponent(query)}`,
      { headers: { 'Accept': 'text/event-stream' } }
    );

    const reader = response.body!.getReader();
    readerRef.current = reader;
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          appendToken(line.slice(6));
        }
      }
    }
    setStreaming(false);
  }, [apiBaseUrl, appendToken, setStreaming]);

  const stopStream = useCallback(() => {
    readerRef.current?.cancel();
    setStreaming(false);
  }, [setStreaming]);

  return { startStream, stopStream };
}
```

> **Note:** Use `fetch` with `ReadableStream` instead of `EventSource` when custom headers (e.g., `Authorization`) are needed. Store reader refs for proper cleanup on component unmount.

---

## 10. Evaluation Layer

| Component | Tool | Version | Purpose |
|---|---|---|---|
| RAG Evaluation | RAGAS | `0.4.3` | Faithfulness, answer relevancy, context precision |
| Metrics Tracked | Faithfulness · Context Recall · Answer Relevancy | — | Auto-scores each query |
| Eval Dashboard | React `<EvalDashboard />` component | — | Sidebar metrics cards via `GET /api/eval/metrics` |

### RAGAS Metrics Explained

| Metric | What It Measures | Target |
|---|---|---|
| **Faithfulness** | LLM answer grounded in retrieved docs | > 0.85 |
| **Answer Relevancy** | Answer addresses the actual question | > 0.80 |
| **Context Precision** | Retrieved chunks actually useful | > 0.75 |
| **Context Recall** | All relevant info retrieved | > 0.70 |

---

## 11. DevOps & Deployment Layer

### 11.1 Local Development

| Component | Tool | Version | Notes |
|---|---|---|---|
| Containerization | Docker | `27.x` | Full stack in `docker-compose.yml` |
| Container Compose | Docker Compose | `v2.x` | Services: backend, chromadb (frontend deployed separately) |
| Dev Hot-Reload (Backend) | Uvicorn `--reload` | — | Auto-restarts on Python file changes |
| Dev Hot-Reload (Frontend) | Vite HMR | — | Instant module replacement on save |

### 11.2 Free Deployment Options (Ranked)

| Platform | Best For | Free Limits | Notes |
|---|---|---|---|
| **Vercel** | React frontend (static build) | Unlimited bandwidth | Native Vite detection; global CDN; instant deploys |
| **Railway.app** | FastAPI backend | 512MB RAM, $5 credit/mo | Dockerfile deploy; env vars via dashboard |
| **Render.com** | FastAPI backend (alt) | 512MB RAM, spins down | Free tier sufficient for demo load |
| **Cloudflare Pages** | React frontend (alt) | Unlimited bandwidth | Alternative to Vercel with edge functions |

### 11.3 Recommended Deployment Architecture

```
Vercel (React + Vite static build)
        │
        │ HTTPS + SSE (CORS-enabled)
        ▼
Railway.app (FastAPI backend)
        │
        ├── ChromaDB (local volume on Railway)
        │   OR
        └── Qdrant Cloud (free 1GB cluster)
```

### 11.4 Environment Variables

```env
# Backend .env (never commit — add to .gitignore)
GROQ_API_KEY=gsk_...
QDRANT_URL=https://...qdrant.io
QDRANT_API_KEY=...
OLLAMA_BASE_URL=http://localhost:11434
APP_ENV=development
LOG_LEVEL=INFO
FRONTEND_ORIGIN=http://localhost:5173   # CORS: Vite dev server
```

```env
# Frontend .env (Vite — prefixed with VITE_)
VITE_API_URL=http://localhost:8000      # FastAPI backend URL
```

---

## 12. Complete Dependency Reference

### `requirements.txt`

```txt
# ── LLM & AI ──────────────────────────────────────────────
langchain==1.3.1
langchain-core==1.4.0
langchain-community==0.4.1
langchain-groq==1.1.2
langgraph==1.2.1
sentence-transformers==5.5.1       # fallback embeddings (no Ollama)
ragas==0.4.3

# ── Vector Store ──────────────────────────────────────────
chromadb==1.5.9
rank-bm25==0.2.2

# ── Data Ingestion ────────────────────────────────────────
crawl4ai==0.8.6
pymupdf==1.27.2.3
youtube-transcript-api==1.2.4
httpx==0.28.1

# ── Backend ───────────────────────────────────────────────
fastapi==0.136.1
uvicorn[standard]==0.47.0
pydantic==2.13.4
python-dotenv==1.2.2

# ── Frontend ──────────────────────────────────────────────
# Frontend moved to React (see package.json below)
# No Python frontend dependency needed

# ── Utilities ─────────────────────────────────────────────
loguru==0.7.3
```

### Ollama Models (pull once)

```bash
ollama pull nomic-embed-text     # embeddings (274M, ~550MB)
ollama pull llama3.1:8b          # optional local LLM fallback (4.7GB)
```

### `package.json` (Frontend)

```json
{
  "name": "sourcemind-ui",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint ."
  },
  "dependencies": {
    "react": "^19.2.6",
    "react-dom": "^19.2.6",
    "axios": "^1.9.0",
    "zustand": "^5.0.0",
    "streamdown": "latest",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "@vitejs/plugin-react": "^4.5.0",
    "typescript": "~5.8.0",
    "vite": "^8.0.14",
    "tailwindcss": "^4.3.0",
    "@tailwindcss/vite": "^4.3.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "vitest": "^3.0.0"
  }
}
```

---

## Architecture Decision Summary

| Layer | Chosen Tool | Primary Reason |
|---|---|---|
| LLM | Groq + Llama 3.3 70B | Fastest free inference; demo-worthy streaming |
| Embeddings | Ollama + nomic-embed-text | Zero cost, 8192 ctx, MTEB top-tier |
| Orchestration | LangChain 1.x + LangGraph | Industry standard; visible agent trace |
| Vector DB | ChromaDB (local) → Qdrant (cloud) | Dev simplicity → zero-cost prod persistence |
| Web Crawl | Crawl4AI 0.8.6 | JS-capable; Markdown output; async |
| PDF | PyMuPDF 1.27.2.3 | Fastest; handles images + tables |
| YouTube | youtube-transcript-api 1.2.4 | No API key; 100% free |
| Backend | FastAPI 0.136.1 | Async + SSE streaming; Pydantic v2 native |
| Frontend | React 19.2.x + Vite 8.x + TypeScript 5.8.x | Production-grade SPA; decoupled architecture |
| Styling | Tailwind CSS 4.3.x | Utility-first; CSS-first config |
| State | Zustand 5.x | Lightweight; zero-boilerplate |
| Streaming Render | Streamdown | Purpose-built for LLM token streaming |
| Eval | RAGAS 0.4.3 | Industry-standard RAG metrics |
| Deploy | Vercel (frontend) + Railway (backend) | 100% free; production-credible |

---

*Architect: Senior GenAI Lead · Stack validated May 2026*  
*Frontend upgraded: Streamlit → React 19 + Vite 8 · Reviewed May 2026*
