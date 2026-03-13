# OnlyFriends

OnlyFriends is a secure, local-first LLMOps platform that allows organizations to build, deploy, and interact with **Digital Friends**—custom AI assistants powered by Retrieval-Augmented Generation (RAG) using your own internal knowledge base.

Designed for uncompromising data privacy, the entire stack runs locally on your machine or private server. **No internal data or prompts are ever sent to an external API like OpenAI.**

## Features

- **100% Data Privacy:** Powered by local Ollama (Llama 3) for inference.
- **Retrieval-Augmented Generation:** Upload PDFs, TXTs, and other documents to local Vector storage (ChromaDB) to ground your AI's answers in company facts.
- **Workflow Dashboards:** A modern Next.js + Tailwind CSS UI to manage active workflows.
- **User Accounts & Personal Dashboards:** Teams can create, track, and share customized AI agents within the organization.

## Architecture

The architecture consists of a robust Next.js frontend connected to a FastAPI backend which orchestrates the local AI environment and databases.

1. **Frontend**: Next.js (React Router) + Shadcn UI + Tailwind CSS.
2. **Backend**: Python (FastAPI).
3. **Local AI Model**: Ollama (Llama 3 base model, `nomic-embed-text` for embeddings).
4. **Databases**: 
   - PostgreSQL (Relational DB storing Digital Friends, user history, and metadata)
   - ChromaDB (Vector DB managing document semantic search)

## Setup Instructions

To run the full OnlyFriends platform, follow these steps in separate terminals:

| Step | Terminal / Component | Command | Expected Output |
| :--- | :--- | :--- | :--- |
| 1 | **Database** | `docker start onlyfriends-pg` | `onlyfriends-pg` (container name) |
| 2 | **Redis** | `docker start onlyfriends-redis` | `onlyfriends-redis` (container name) |
| 3 | **FastAPI** | `cd backend` <br> `.\venv\Scripts\Activate.ps1` <br> `uvicorn main:app --reload --port 8000` | `Application startup complete.` |
| 4 | **Celery Worker** | `cd backend` <br> `.\venv\Scripts\Activate.ps1` <br> `celery -A worker.celery_app worker --loglevel=info --pool=solo` | `Connected to redis://localhost:16379/0` |
| 5 | **Frontend** | `cd frontend` <br> `npm run dev` | `Ready in ...ms` |

The application will then be available at `http://localhost:3000`.

## Features Stack
- **AI Model**: Ollama (Llama 3 base model, `nomic-embed-text` for embeddings).
- **Backend**: Python (FastAPI + SQLAlchemy).
- **Frontend**: Next.js (React Router) + Shadcn UI + Tailwind CSS.
- **Async Processing**: Celery + Redis.
- **Relational DB**: PostgreSQL.
- **Vector DB**: ChromaDB.

## Roadmap & Progress
- [x] **Web Scraping / URL Ingestion**: Ingest live data sources directly via URL.
- [x] **Background Processing**: Integrated Celery + Redis for deterministic, non-blocking RAG.
- [x] **Dynamic Sidebar**: Live "Attached Files" and data sources management in Workspace.
- [x] **Quality Guardrails**: Stripped preambles, anti-hallucination rules, and context isolation.
- [ ] **Auth Integration**: Enterprise-grade user authentication.
- [ ] **Multi-Agent Orchestration**: Specialized agents for collaborative tasks.
