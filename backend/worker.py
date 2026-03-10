import os
from celery import Celery
import rag

celery_app = Celery(
    "onlyfriends_tasks",
    broker="redis://localhost:16379/0",
    backend="redis://localhost:16379/0"
)

# Optional: configure celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

@celery_app.task(name="worker.process_document_task")
def process_document_task(file_path: str, friend_id: str, original_filename: str):
    """
    Background task to process a PDF and store it in ChromaDB without blocking the API.
    """
    try:
        chunks = rag.process_and_store_document(file_path, friend_id, original_filename)
        print(f"[{friend_id}] Successfully indexed {chunks} chunks for {original_filename}")
        
        # Cleanup temp file
        if os.path.exists(file_path):
            os.remove(file_path)
            
        return {"status": "success", "chunks": chunks}
    except Exception as e:
        print(f"Error processing document {original_filename}: {e}")
        # Cleanup temp file on failure too
        if os.path.exists(file_path):
            os.remove(file_path)
        return {"status": "error", "message": str(e)}

@celery_app.task(name="worker.process_url_task")
def process_url_task(url: str, friend_id: str):
    """
    Background task to scrape a URL and store it in ChromaDB.
    """
    try:
        chunks = rag.process_and_store_url(url, friend_id)
        print(f"[{friend_id}] Successfully scraped and indexed {chunks} chunks for {url}")
        return {"status": "success", "chunks": chunks}
    except Exception as e:
        print(f"Error scraping URL {url}: {e}")
        return {"status": "error", "message": str(e)}
