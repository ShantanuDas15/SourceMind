# 🚀 SourceMind — Phase-Wise Development Roadmap

> **Objective:** Break down the complex FastAPI + React + LangGraph monorepo into manageable, testable, and isolated development phases to minimize cognitive load and prevent cascading integration issues.
> **Last Updated:** May 2026

---

## 🎯 Methodology: "Walking Skeleton" First
Instead of building the entire backend and then the entire frontend, we will build vertically. We start with a foundational "Hello World" connection between the layers, then progressively layer on complexity (Ingestion → Agentic Retrieval → UI Integration → Evaluation).

---

## 🟢 Phase 1: Foundation & "Hello World"
**Goal:** Establish the runtime environments, dependency management, and verify end-to-end communication between the frontend and backend.

### Backend Tasks
1. **Environment:** Initialize Python 3.12.3 `venv` and install `requirements.txt`.
2. **Configuration:** Set up `app/config.py` using Pydantic to read from `.env`.
3. **Core API:** Implement `app/main.py` with FastAPI initialization and CORS middleware (`app/middleware/cors.py`) configured to allow `localhost:5173`.
4. **Health Check:** Create a basic `GET /api/health` route.

### Frontend Tasks
1. **Environment:** Run `npm install` and verify Vite + Tailwind CSS configuration.
2. **API Client:** Configure `src/api/client.ts` (Axios) to point to the backend URL.
3. **Connection Test:** Write a simple `useEffect` in `App.tsx` to ping `GET /api/health` and display "Connected to Backend".

**✅ Milestone 1:** Backend runs on `localhost:8000`, Frontend runs on `localhost:5173`, and they can successfully talk to each other without CORS errors.

---

## 🟡 Phase 2: Core Ingestion Pipeline (Backend)
**Goal:** Successfully convert raw data (URLs, PDFs, YouTube) into vector embeddings and store them in ChromaDB. *Do not touch LLMs or Agents yet.*

1. **Document Parsers:** 
   - Implement `web_crawler.py` (Crawl4AI) for async scraping.
   - Implement `pdf_parser.py` (PyMuPDF).
2. **Chunking & Embeddings:** 
   - Implement `chunker.py` using LangChain's Recursive Character Splitter.
   - Configure Ollama `nomic-embed-text` in `embeddings.py`.
3. **Vector Database:** 
   - Initialize the local ChromaDB client in `vectorstore.py`.
4. **Pipeline Orchestration:** 
   - Wire the steps together in `pipeline.py`: *Parse → Chunk → Embed → Store*.
5. **API Endpoint:** 
   - Implement `POST /api/ingest` in `routes/ingest.py`.

**✅ Milestone 2:** You can send a POST request via Postman/cURL with a URL, and verify that chunks are successfully saved in the local `chroma_db/` folder.

---

## 🟠 Phase 3: Agentic Retrieval & LLM (Backend)
**Goal:** Enable the backend to understand questions, search the vector database, and stream LLM responses.

1. **Retrieval Setup:** 
   - Implement `bm25_retriever.py` and combine it with ChromaDB in `hybrid_retriever.py` (Ensemble Retriever).
2. **LLM Setup:** 
   - Configure `groq_client.py` and test API key authentication.
   - Build the `streaming.py` utility to handle Server-Sent Events (SSE) generation.
3. **Prompts & State:** 
   - Define system prompts (`system_prompts.py`) and `AgentState` TypedDict.
4. **LangGraph Orchestration:** 
   - Implement agent nodes (`retrieve.py`, `synthesize.py`).
   - Construct the StateGraph in `graph.py` to handle the ReAct loop.
5. **API Endpoint:** 
   - Implement `GET /api/stream` to expose the LangGraph output as a streaming SSE response.

**✅ Milestone 3:** You can run `curl -N http://localhost:8000/api/stream?q="summary"` and see Markdown tokens streaming into your terminal in real-time.

---

## 🔵 Phase 4: Frontend UI Skeleton & State
**Goal:** Build the static UI and client-side state architecture without worrying about backend data yet. Use mock data to ensure pixel-perfect Tailwind styling.

1. **Layout Shell:** 
   - Build `Header.tsx`, `Sidebar.tsx`, and `MainPanel.tsx`.
2. **State Management:** 
   - Implement Zustand stores: `chatStore.ts` (mock messages), `ingestStore.ts` (mock progress).
3. **Chat Interface:** 
   - Build `ChatContainer.tsx` and `ChatInput.tsx`.
   - Implement `StreamingMessage.tsx` using `streamdown` to render Markdown.
4. **Ingestion Interface:** 
   - Build `IngestPanel.tsx` with tabs for URL, PDF, and YouTube.
5. **Theming:** 
   - Ensure the UI feels premium (glassmorphism, subtle animations, dark mode).

**✅ Milestone 4:** The React app looks complete. You can type in the chat box and add mock messages to the screen, and switch between ingestion tabs fluidly.

---

## 🟣 Phase 5: Full Stack Integration
**Goal:** Connect the beautiful React frontend to the fully functional FastAPI backend.

1. **Hook up Ingestion:** 
   - Connect `IngestPanel.tsx` to the `POST /api/ingest` endpoint using Axios.
   - Update `ingestStore.ts` to reflect real pipeline progress (parsing... embedding... done).
2. **Hook up Chat Streaming:** 
   - Implement the `useSSE.ts` hook using the native browser `fetch` and `ReadableStream`.
   - Connect the chat input to trigger the SSE stream and append tokens dynamically to `chatStore.ts`.
3. **Source Management:** 
   - Connect `SourceList.tsx` to `GET /api/sources`.

**✅ Milestone 5:** A complete end-to-end user flow. A user can paste a URL in the UI, wait for it to process, ask a question about it in the chat, and watch the answer stream in.

---

## ⚙️ Phase 6: Evaluation, Polish & Deployment
**Goal:** Ensure the application is production-ready, accurate, and deployed to the cloud.

1. **RAGAS Evaluation:** 
   - Implement `ragas_evaluator.py` in the backend.
   - Build `EvalDashboard.tsx` in the frontend to display Faithfulness and Answer Relevance scores.
2. **Memory:** 
   - Inject `conversation.py` into the LangGraph state to enable multi-turn chat context.
3. **Error Handling:** 
   - Test edge cases (invalid URLs, broken PDFs, rate limits) and ensure UI shows graceful error toasts.
4. **Dockerization:** 
   - Test the `docker-compose.yml` locally to ensure the backend and ChromaDB run cleanly in containers.
5. **Deployment:** 
   - Deploy backend to Railway.
   - Deploy frontend to Vercel (updating CORS and VITE_API_URL).

**✅ Final Milestone:** The application is live on the internet, secure, and actively evaluating its own RAG performance.

---
*Generated by Lead Architect · May 2026*
