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

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (3.10+)
- **PostgreSQL** (Running locally on `127.0.0.1:5432`, configure database `onlyfriends`, user `admin`/`admin`)
- **Ollama** installed on your host machine.

### 2. Configure Local AI
Make sure the Ollama service is running. Pull the required models:
```bash
ollama pull llama3
ollama pull nomic-embed-text
```

### 3. Backend Setup
Navigate into the `backend` directory, install requirements, and run the server.

```bash
cd backend
python -m venv env
source env/Scripts/activate # or `env/bin/activate` on mac/linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 4. Database Seeding (Optional)
To populate the database with mock ACME Corp data, an ACME seed script is included:
```bash
python seed.py
```

### 5. Frontend Setup
In a separate terminal, navigate into the `frontend` directory, install packages, and start the development server.

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:3000`.

## Next Steps / Roadmap
- [ ] Incorporate Web Scraping / URL Ingestion for live data source attachment.
- [ ] Implement Celery + Redis background processing to unblock the API during massive document embedding tasks.
- [ ] Integrate user authentication systems (Auth.js or Clerk).
