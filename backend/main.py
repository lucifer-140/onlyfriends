from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import requests.exceptions
import os
import shutil
import uuid
import re
import datetime
import logging
import rag
import json
from sqlalchemy.orm import Session
from fastapi import Depends
import models
from database import engine, get_db
import worker

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
OLLAMA_TIMEOUT_SECONDS = 120  # P0: Prevent UI hangs from long generations

# ── P0: Prompt injection patterns ────────────────────────────────────────────
INJECTION_PATTERNS = [
    r"ignore (all|previous|above) (instructions?|rules?|prompts?)",
    r"disregard (the|your|all) (above|previous|system)",
    r"you are now",
    r"new instruction(s)?:",
    r"system( )?prompt:",
    r"forget everything",
    r"override (the|all) (rules?|instructions?)",
]

def sanitize_user_input(text: str) -> str:
    """Guard against prompt injection attacks."""
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            raise HTTPException(
                status_code=400,
                detail="Your message contains restricted phrases. Please rephrase your request."
            )
    return text

# ── P0: Post-process response cleaner ────────────────────────────────────────
def clean_ai_response(text: str) -> str:
    """Strip preamble lines and trailing annotation notes from model output."""
    # Remove preamble openings — all observed variants
    preamble_patterns = [
        # "Here is the X" variants
        r"^here is (the |a |my )?(rewritten |updated |revised |drafted |completed )?(response|summary|rewrite|answer|email|memo|review|table|output|text|result|translation)[:\.]?\s*\n?",
        # "Here are X" variants
        r"^here are (the |three |3 |some |your )?(draft |rewritten |updated |revised )?(options?|subject lines?|bullets?|items?|points?|results?|metrics?|action items?)[:\.]?\s*\n?",
        # Dangling fragment endings from stripped preamble (e.g. "points based on the user's request:")
        r"^[a-z ]+based on (the |your |user.s )?(request|prompt|input|text|provided (data|information))[:\.]?\s*\n?",
        r"^[a-z ]+(each with a maximum of \d+ characters)[:\.]?\s*\n?",
        r"^(subject line options?|option \d|bullet points?|action items?)[,:]?\s*\n?",
        # Generic starters
        r"^based on (the|your) (provided |above |given )?",
        r"^sure[,!]?\s*(here is|here are|I'll|let me)?[:\.]?\s*\n?",
        r"^(I've|I have) (prepared|written|drafted|created|crafted)[^.]*\.\s*\n?",
        r"^(as requested|as per your request|per your request)[,:]?\s*\n?",
    ]
    for pattern in preamble_patterns:
        text = re.sub(pattern, "", text, flags=re.IGNORECASE)

    # Remove trailing (Note: ...) and similar annotation blocks
    text = re.sub(r"\n?\(Note:.*?\)\s*$", "", text, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r"\n?Note:.*?$", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\n?\[Meta:.*?\]\s*$", "", text, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r"\n?\(I'?ve? (followed|stayed|used|kept).*?\)\s*$", "", text, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r"\n?\(This response is.*?\)\s*$", "", text, flags=re.IGNORECASE | re.DOTALL)

    return text.strip()

# ── Self-contained prompt detector ───────────────────────────────────────────
SELF_CONTAINED_SIGNALS = [
    "from this", "only what's written", "only what is written",
    "factual only", "don't add new info", "do not add new info",
    "don't add information", "from this memo", "from this newsletter",
    "from this text", "from this email", "extract from", "only use",
    "only the above", "listed above", "3 bullet points only",
    "summarize this", "list action items from", "use only this text",
]

def is_prompt_self_contained(prompt: str) -> bool:
    """Returns True when the user provides all needed facts inline,
    OR when the prompt is a short open-ended creative task that should NOT
    pull from the RAG database (avoids context bleed from stored PDFs)."""
    prompt_lower = prompt.lower()

    # Explicit self-containment signals
    if any(sig in prompt_lower for sig in SELF_CONTAINED_SIGNALS):
        return True

    # Short prompts with inline structured data (bullets, numbers, percentages)
    has_inline_data = bool(re.search(r"(\d+%|\d+\.\d+|>\s*\d|•|-\s+\w)", prompt))
    if has_inline_data and len(prompt) < 800:
        return True

    # Short open-ended creative prompts (< 200 chars) that don't explicitly
    # reference a stored document — suppress RAG so the model doesn't substitute
    # PDF content for the user's requested topic.
    # e.g. "Email about Phoenix project. Under 80 words." → no RAG
    # e.g. "Based on our HR handbook, summarize..." → allow RAG
    DOCUMENT_REFERENCE_SIGNALS = [
        "based on", "from the", "from our", "in the document",
        "according to", "refer to", "the attached", "the file",
        "the policy", "the guide", "the handbook", "our documents",
    ]
    if len(prompt) < 200 and not any(sig in prompt_lower for sig in DOCUMENT_REFERENCE_SIGNALS):
        return True

    return False



class ChatRequest(BaseModel):
    friend_id: str
    prompt: str
    system_prompt: str = ""
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
    return [
        {
            "id": f.id, "name": f.name, "department": f.department,
            "description": f.description, "system_prompt": f.system_prompt,
            "dataSources": f.dataSources, "creator": f.creator
        }
        for f in friends
    ]

@app.get("/api/friends/me/{creator_id}")
def get_my_friends(creator_id: str, db: Session = Depends(get_db)):
    friends = db.query(models.Friend).filter(models.Friend.creator == creator_id).all()
    return [
        {
            "id": f.id, "name": f.name, "department": f.department,
            "description": f.description, "system_prompt": f.system_prompt,
            "dataSources": f.dataSources, "creator": f.creator
        }
        for f in friends
    ]

@app.get("/api/friends/{friend_id}")
def get_friend(friend_id: str, db: Session = Depends(get_db)):
    friend = db.query(models.Friend).filter(models.Friend.id == friend_id).first()
    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")
    return {
        "id": friend.id, "name": friend.name, "department": friend.department,
        "description": friend.description, "system_prompt": friend.system_prompt,
        "dataSources": friend.dataSources, "creator": friend.creator
    }

@app.post("/api/upload")
async def upload_file(friend_id: str = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Accepts a PDF document from Next.js and passes it to the local Langchain RAG processor."""
    temp_file_path = None
    try:
        temp_file_path = f"./temp_{uuid.uuid4()}_{file.filename}"
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # P2: File size guard — reject PDFs over 50MB
        file_size_mb = os.path.getsize(temp_file_path) / (1024 * 1024)
        if file_size_mb > 50:
            os.remove(temp_file_path)
            raise HTTPException(status_code=413, detail=f"File exceeds 50MB limit ({file_size_mb:.1f}MB). Please split the PDF.")

        worker.process_document_task.delay(temp_file_path, friend_id, file.filename)

        friend = db.query(models.Friend).filter(models.Friend.id == friend_id).first()
        if friend:
            ds = friend.dataSources[:] if friend.dataSources else []
            if file.filename not in ds:
                ds.append(file.filename)
                friend.dataSources = ds
                db.commit()

        logger.info(f"[UPLOAD] Queued '{file.filename}' for friend '{friend_id}'")
        return {"status": "queued", "file": file.filename, "message": "File processing has been queued in the background."}
    except HTTPException:
        raise
    except Exception as e:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=str(e))

class ScrapeRequest(BaseModel):
    friend_id: str
    url: str

@app.post("/api/scrape")
async def scrape_url(req: ScrapeRequest, db: Session = Depends(get_db)):
    """Accepts a URL from Next.js, scrapes it, and passes it to the local RAG processor."""
    try:
        worker.process_url_task.delay(req.url, req.friend_id)

        friend = db.query(models.Friend).filter(models.Friend.id == req.friend_id).first()
        if friend:
            ds = friend.dataSources[:] if friend.dataSources else []
            if req.url not in ds:
                ds.append(req.url)
                friend.dataSources = ds
                db.commit()

        logger.info(f"[SCRAPE] Queued URL '{req.url}' for friend '{req.friend_id}'")
        return {"status": "queued", "url": req.url, "message": "URL scraping has been queued in the background."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# P1: Paginated chat history
@app.get("/api/chat/{friend_id}")
def get_chat_history(friend_id: str, limit: int = 100, offset: int = 0, db: Session = Depends(get_db)):
    messages = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.friend_id == friend_id)
        .order_by(models.ChatMessage.timestamp.asc())
        .offset(offset).limit(limit).all()
    )
    return [{"role": m.role, "text": m.text} for m in messages]

@app.delete("/api/chat/{friend_id}")
def clear_chat_history(friend_id: str, db: Session = Depends(get_db)):
    """Deletes all chat messages for a given friend (used by the Clear button in the UI)."""
    deleted = db.query(models.ChatMessage).filter(models.ChatMessage.friend_id == friend_id).delete()
    db.commit()
    return {"status": "cleared", "deleted_count": deleted}

@app.post("/api/chat")
async def generate_chat(request: ChatRequest, db: Session = Depends(get_db)):
    """Fetches internal documents then queries the local Llama 3 model via Ollama."""

    # P0: Sanitize input against prompt injection
    sanitize_user_input(request.prompt)

    # 1. Retrieve relevant chunks from ChromaDB
    raw_context = rag.query_friend_knowledge(
        friend_id=request.friend_id,
        queryText=request.prompt,
        n_results=4
    )

    # 2. Build context block
    has_context = "No internal" not in raw_context and "No relevant" not in raw_context
    clean_context = raw_context.replace("[INTERNAL KNOWLEDGE CHUNK]: ", "").strip()

    # Suppress RAG context if user provides all facts inline (prevents context bleed)
    suppress_context = is_prompt_self_contained(request.prompt)
    context_block = f"""
BACKGROUND REFERENCE (use ONLY if the user's request does not contain the needed facts):
---
{clean_context}
---
""" if (has_context and not suppress_context) else ""

    today_str = datetime.date.today().strftime("%d %B %Y")

    final_prompt = f"""{request.system_prompt}

Today's date is {today_str}.

STRICT OUTPUT RULES — ranked by priority, follow every rule exactly:

RULE 1 — CONTEXT ISOLATION (HIGHEST PRIORITY — HARD STOP):
If the user has provided facts, data, text, bullets, or numbers directly in their request, those are the ONLY facts you may use. Completely discard background reference documents. Do NOT blend user-provided data with document data.

RULE 2 — NO INVENTED CONTENT:
Do NOT invent dates, names, metrics, future plans, events, or any detail not present in the user's request. If something is not stated, do not include it.

RULE 3 — NO BRACKET PLACEHOLDERS:
NO bracket placeholders ever: [Your Name], [Insert Date], [Today, X], [name], [text]. If a value is missing, ask one clarifying question. TODAY'S DATE = {today_str} — use it directly without wrapping in brackets.

RULE 4 — RESPECT LIMITS EXACTLY:
Respect word/sentence counts precisely ("under 80 words", "exactly 3 sentences"). Output the content only — no preamble like "Here is a summary:", no annotations like "(Note: ...)", no meta-commentary.

RULE 5 — FORMAT ONLY:
Follow the exact format or template requested. No preamble, no "Here is the response:", no explanations, no closing "(Note: I've followed the rules)".

RULE 6 — CONSISTENT TONE:
"high performer" → every sentence positive, no weaknesses. "critical review" → every sentence critical. Never mix tones or inject sentiment not requested.

RULE 7 — NO META ANNOTATIONS:
Do NOT output [Meta: ...], audience labels, tone labels, word count notes, or rule-compliance statements. These must never appear in output.

RULE 8 — NO FILLER LANGUAGE:
Banned phrases: "We're excited to announce", "game-changer", "I'm pleased to inform", "Thank you for your hard work and dedication", "testament to". Use direct language unless explicitly asked otherwise.
{context_block}
USER REQUEST:
{request.prompt}

RESPONSE:"""

    try:
        # P0: Timeout added — prevents UI hanging on slow model responses
        response = requests.post(OLLAMA_API_URL, json={
            "model": "llama3",
            "prompt": final_prompt,
            "stream": False,
            "options": {
                "temperature": 0.1,
                "top_p": 0.9,
                "num_predict": 2048,
                "repeat_penalty": 1.1
            }
        }, timeout=OLLAMA_TIMEOUT_SECONDS)
        response.raise_for_status()

        result = response.json()
        raw_response = result.get("response", "")

        # P0: Strip preamble and annotation noise from model output
        ai_response = clean_ai_response(raw_response)

        # Save to chat history
        db.add(models.ChatMessage(friend_id=request.friend_id, role="user", text=request.prompt))
        db.add(models.ChatMessage(friend_id=request.friend_id, role="assistant", text=ai_response))
        db.commit()

        logger.info(f"[CHAT] friend='{request.friend_id}' | tokens≈{len(ai_response.split())} | context_suppressed={suppress_context}")
        return {"response": ai_response}

    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="The AI model took too long to respond. Try a shorter or simpler prompt.")
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Ollama local runtime is not reachable. Is it running?")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
