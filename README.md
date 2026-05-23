<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/brain-circuit.svg" alt="SourceMind Logo" width="120" height="120" />
  
  # SourceMind
  
  **A Production-Ready, Self-Evaluating Agentic RAG Workspace**
  
  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
  [![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)](https://langchain.com/)
  [![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

  *SourceMind is a powerful, containerized Retrieval-Augmented Generation (RAG) platform that enables users to ingest web pages and PDFs, and converse with a LangGraph-powered AI agent equipped with conversational memory and real-time performance evaluation.*
</div>

---

## ✨ Features

- **Agentic Retrieval:** Utilizes LangGraph to construct a ReAct loop, allowing the agent to intelligently query a hybrid vectorstore (BM25 + ChromaDB semantic search).
- **Conversational Memory:** Employs a stateless backend architecture with frontend-driven conversational context, ensuring the AI perfectly recalls prior messages.
- **Self-Evaluating RAG (RAGAS):** Integrates an LLM-as-a-judge to dynamically evaluate answers against source contexts for **Faithfulness** and **Answer Relevancy**, displayed in an elegant UI dashboard.
- **Real-Time Streaming:** Streams Llama 3 responses dynamically via Server-Sent Events (SSE) with robust markdown rendering.
- **Multi-Modal Ingestion:** Supports async document parsing via `Crawl4AI` (web scraping) and `PyMuPDF` (PDF extraction).
- **Premium User Interface:** Built with React 18, Vite, and Tailwind CSS. Features deep dark-mode integration, glassmorphism, responsive mobile layouts, and a global Zustand state manager.
- **Enterprise Resilience:** Features API circuit breakers, exponential backoff retries (`tenacity`), and graceful degradation to source lists during LLM outages.
- **Fully Dockerized:** Effortless deployment via `docker-compose`, bridging a production Nginx proxy with FastAPI and Ollama instances.

## 🏗️ Architecture

SourceMind is built on a modern, decoupled monorepo architecture:

### 🐍 Backend (FastAPI / LangGraph)
- **Framework:** FastAPI running on Python 3.12 via Uvicorn.
- **LLM Engine:** Groq API (Llama 3 70b/8b) for blazing-fast inference.
- **Embeddings:** Local Ollama (`nomic-embed-text`) ensuring privacy and zero embedding costs.
- **Vector Database:** ChromaDB local persistent volume.
- **Orchestration:** LangGraph state machine tracking `AgentState` for retrieval and synthesis.

### ⚛️ Frontend (React / Vite)
- **Framework:** React 18 powered by Vite.
- **State Management:** Zustand with local-storage persistence for chat history, evaluations, and ingestion status.
- **Styling:** Tailwind CSS, Lucide React icons, and custom CSS for ultra-premium animations.
- **Networking:** Native `fetch` API handling complex asynchronous POST requests for SSE streams.

---

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- A [Groq API Key](https://console.groq.com/keys)

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ShantanuDas15/SourceMind.git
   cd SourceMind
   ```

2. **Configure Environment Variables:**
   ```bash
   cp backend/.env.example backend/.env
   ```
   *Open `backend/.env` and insert your `GROQ_API_KEY`.*

3. **Start the Docker Stack:**
   ```bash
   docker compose up -d --build
   ```
   *This single command builds the FastAPI backend, compiles the Vite frontend into an Nginx container, and pulls the Ollama embedding model.*

4. **Access the Application:**
   Open your browser and navigate to: **`http://localhost:3000`**

---

## 📖 Usage Guide

1. **Ingest Knowledge:**
   - Navigate to the **Ingest** tab in the sidebar.
   - Upload a PDF document or paste a public Web URL.
   - Wait for the pipeline to finish parsing, chunking, embedding, and storing the data.

2. **Chat & Retrieve:**
   - Go to the **Chat** interface.
   - Ask complex questions related to your ingested documents.
   - Watch the Llama 3 model stream its grounded answer back in real-time, complete with markdown citations.

3. **Evaluate RAG Performance:**
   - Underneath any AI response, click the **"Evaluate RAG Performance"** button.
   - SourceMind will use a 70B parameter LLM-as-a-judge to score the answer's *Faithfulness* to the source text and *Relevancy* to your prompt.

---

## 🛠️ Development Phases

This project was systematically built across 6 rigid development phases:

- [x] **Phase 1:** Foundation & "Hello World"
- [x] **Phase 2:** Core Document Ingestion Pipeline
- [x] **Phase 3:** Agentic Retrieval, ReAct Graph & LLM Streaming
- [x] **Phase 4:** Frontend UI Skeleton, State Management & Tailwind
- [x] **Phase 5:** Full Stack API Integration & Components
- [x] **Phase 6:** RAGAS Evaluation, Conversational Memory & Dockerization

*(Detailed technical requirements for each phase can be found in `docs/sourcemind_development_phases.md`)*

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

<div align="center">
  <i>Built with ❤️ by Shantanu Das.</i>
</div>
