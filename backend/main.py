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
async def upload_file(friend_id: str, file: UploadFile, db: Session = Depends(get_db)):
    """
    Accepts a PDF document from Next.js and passes it to the local Langchain RAG processor.
    """
    try:
        # Save temp file
        temp_file_path = f"./temp_{uuid.uuid4()}_{file.filename}"
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Parse and store embeddings in local ChromaDB
        chunks_added = rag.process_and_store_document(
            file_path=temp_file_path, 
            friend_id=friend_id, 
            original_filename=file.filename
        )
        
        # Update friend config with the new data source
        friend = db.query(models.Friend).filter(models.Friend.id == friend_id).first()
        if friend:
            ds = friend.dataSources[:] if friend.dataSources else []
            if file.filename not in ds:
                ds.append(file.filename)
                friend.dataSources = ds
                db.commit()
        
        # Cleanup
        os.remove(temp_file_path)
        
        return {"status": "success", "chunks_stored": chunks_added, "file": file.filename}
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

    # 2. Build the final prompt for Llama 3
    final_prompt = f"""
    System Instructions: {request.system_prompt}
    
    Internal Company Data:
    {mock_internal_knowledge}
    
    User Request: {request.prompt}
    """

    try:
        # 3. Call local Ollama runtime
        response = requests.post(OLLAMA_API_URL, json={
            "model": "llama3",
            "prompt": final_prompt,
            "stream": False
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
