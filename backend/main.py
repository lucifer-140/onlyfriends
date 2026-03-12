from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
import shutil
import uuid
import rag
import json
from sqlalchemy.orm import Session
from fastapi import Depends
import models
from database import engine, get_db
import worker

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="OnlyFriends API", version="1.0.0")

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_API_URL = "http://localhost:11434/api/generate"

class ChatRequest(BaseModel):
    friend_id: str
    prompt: str
    system_prompt: str = ""
    # In a full flow, this would be actual file UUIDs parsed from the DB
    context_files: list[str] = []

@app.get("/health")
def health_check():
    return {"status": "healthy"}

class FriendConfig(BaseModel):
    id: str
    name: str
    department: str
    description: str
    system_prompt: str
    creator: str = "system"
    
@app.post("/api/friends")
def create_friend(config: FriendConfig, db: Session = Depends(get_db)):
    db_friend = models.Friend(
        id=config.id,
        name=config.name,
        department=config.department,
        description=config.description,
        system_prompt=config.system_prompt,
        dataSources=[],
        creator=config.creator
    )
    # If friend exists, update it. Else insert.
    existing = db.query(models.Friend).filter(models.Friend.id == config.id).first()
    if existing:
        existing.name = config.name
        existing.department = config.department
        existing.description = config.description
        existing.system_prompt = config.system_prompt
        existing.creator = config.creator
    else:
        db.add(db_friend)
    db.commit()
    return {"status": "success", "id": config.id}

@app.get("/api/friends")
def get_all_friends(db: Session = Depends(get_db)):
    friends = db.query(models.Friend).all()
    # Serialize for frontend
    return [
        {
            "id": f.id,
            "name": f.name,
            "department": f.department,
            "description": f.description,
            "system_prompt": f.system_prompt,
            "dataSources": f.dataSources,
            "creator": f.creator
        }
        for f in friends
    ]

@app.get("/api/friends/me/{creator_id}")
def get_my_friends(creator_id: str, db: Session = Depends(get_db)):
    friends = db.query(models.Friend).filter(models.Friend.creator == creator_id).all()
    return [
        {
            "id": f.id,
            "name": f.name,
            "department": f.department,
            "description": f.description,
            "system_prompt": f.system_prompt,
            "dataSources": f.dataSources,
            "creator": f.creator
        }
        for f in friends
    ]

@app.get("/api/friends/{friend_id}")
def get_friend(friend_id: str, db: Session = Depends(get_db)):
    friend = db.query(models.Friend).filter(models.Friend.id == friend_id).first()
    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")
    return {
        "id": friend.id,
        "name": friend.name,
        "department": friend.department,
        "description": friend.description,
        "system_prompt": friend.system_prompt,
        "dataSources": friend.dataSources,
        "creator": friend.creator
    }

@app.post("/api/upload")
async def upload_file(friend_id: str = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Accepts a PDF document from Next.js and passes it to the local Langchain RAG processor.
    """
    try:
        # Save temp file
        temp_file_path = f"./temp_{uuid.uuid4()}_{file.filename}"
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Pass job to Celery background worker
        worker.process_document_task.delay(temp_file_path, friend_id, file.filename)
        
        # Update friend config with the new data source immediately mapping
        friend = db.query(models.Friend).filter(models.Friend.id == friend_id).first()
        if friend:
            ds = friend.dataSources[:] if friend.dataSources else []
            if file.filename not in ds:
                ds.append(file.filename)
                friend.dataSources = ds
                db.commit()
                
        return {"status": "queued", "file": file.filename, "message": "File processing has been queued in the background."}
    except Exception as e:
        # If API submission fails, try to cleanup temp file immediately
        if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=str(e))

class ScrapeRequest(BaseModel):
    friend_id: str
    url: str

@app.post("/api/scrape")
async def scrape_url(req: ScrapeRequest, db: Session = Depends(get_db)):
    """
    Accepts a URL from Next.js, scrapes it, and passes it to the local RAG processor.
    """
    try:
        worker.process_url_task.delay(req.url, req.friend_id)
        
        # Update friend config with the new data source immediately
        friend = db.query(models.Friend).filter(models.Friend.id == req.friend_id).first()
        if friend:
            ds = friend.dataSources[:] if friend.dataSources else []
            if req.url not in ds:
                ds.append(req.url)
                friend.dataSources = ds
                db.commit()
                
        return {"status": "queued", "url": req.url, "message": "URL scraping has been queued in the background."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat/{friend_id}")
def get_chat_history(friend_id: str, db: Session = Depends(get_db)):
    messages = db.query(models.ChatMessage).filter(models.ChatMessage.friend_id == friend_id).order_by(models.ChatMessage.timestamp.asc()).all()
    return [{"role": m.role, "text": m.text} for m in messages]

@app.post("/api/chat")
async def generate_chat(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Simulates fetching internal documents and then sending them to the Local Llama 3 Model.
    """
    # 1. Retrieve the most relevant semantic chunks from the local Vector DB
    mock_internal_knowledge = rag.query_friend_knowledge(
        friend_id=request.friend_id, 
        queryText=request.prompt,
        n_results=4
    )

    # 2. Build the final prompt for Llama 3 with strict quality guardrails
    has_context = "No internal" not in mock_internal_knowledge
    context_block = f"""
--- INTERNAL COMPANY DOCUMENTS ---
{mock_internal_knowledge}
--- END OF DOCUMENTS ---
""" if has_context else ""

    final_prompt = f"""{request.system_prompt}

STRICT OUTPUT RULES (follow these exactly):
1. ONLY use facts that appear in the documents provided or facts explicitly stated by the user. Do NOT invent dates, names, metrics, features, or plans that are not present.
2. Do NOT use placeholder brackets like [Start Date], [Your Name], [Insert Here], etc. If a required value is missing, ask the user for it in a short clarifying question instead of guessing.
3. If the user specifies a word limit (e.g. "under 150 words", "in 3 sentences"), count carefully and stay within that limit. Do NOT exceed it.
4. Do NOT add generic filler phrases like "We're excited to announce", "This is a testament to", "Thank you for your hard work and dedication", or "game-changer" unless the user explicitly asks for them.
5. If asked to follow a specific template or format, output ONLY that format. Do not add preamble, commentary, or closing remarks outside the template.
6. Maintain consistent tone and sentiment throughout. If the user says "high performer", do not describe them with weakness language. If the user says "formal", stay formal throughout.
7. If you are unsure of any required detail, say so explicitly. Do not guess or hallucinate.
{context_block}
USER REQUEST:
{request.prompt}

RESPONSE:"""

    try:
        # 3. Call local Ollama runtime
        response = requests.post(OLLAMA_API_URL, json={
            "model": "llama3",
            "prompt": final_prompt,
            "stream": False,
            "options": {
                "temperature": 0.1,      # Low = more consistent/deterministic outputs
                "top_p": 0.9,            # Prevents wildly different word choices
                "num_predict": 2048,     # Max tokens (~1500 words) - prevents runaway outputs
                "repeat_penalty": 1.1    # Discourages repeated generic filler phrases
            }
        })
        response.raise_for_status()
        
        result = response.json()
        ai_response = result.get("response", "")
        
        # 4. Save to chat history DB
        user_msg = models.ChatMessage(friend_id=request.friend_id, role="user", text=request.prompt)
        assistant_msg = models.ChatMessage(friend_id=request.friend_id, role="assistant", text=ai_response)
        db.add(user_msg)
        db.add(assistant_msg)
        db.commit()
        
        return {"response": ai_response}
        
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Ollama local runtime is not reachable. Is the service running?")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
