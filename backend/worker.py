import os
import logging
from celery import Celery
import rag

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

celery_app = Celery(
    "onlyfriends_tasks",
    broker="redis://localhost:16379/0",
    backend="redis://localhost:16379/0"
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_acks_late=True,          # P2: Re-queue task if worker crashes mid-execution
    worker_prefetch_multiplier=1, # P2: One task at a time (prevents OOM on large PDFs)
)

MAX_PDF_MB = 50

@celery_app.task(
    name="worker.process_document_task",
    bind=True,
    max_retries=3,
    default_retry_delay=30  # P2: Retry up to 3 times with 30s backoff on failure
)
def process_document_task(self, file_path: str, friend_id: str, original_filename: str):
    """Background task: process a PDF and store it in ChromaDB."""
    try:
        # P2: File size guard
        if os.path.exists(file_path):
            size_mb = os.path.getsize(file_path) / (1024 * 1024)
            if size_mb > MAX_PDF_MB:
                logger.error(f"[CELERY] ❌ File '{original_filename}' is {size_mb:.1f}MB — exceeds {MAX_PDF_MB}MB limit")
                os.remove(file_path)
                return {"status": "error", "message": f"File exceeds {MAX_PDF_MB}MB limit."}

        chunks = rag.process_and_store_document(file_path, friend_id, original_filename)
        logger.info(f"[CELERY] ✅ Indexed {chunks} chunks from '{original_filename}' for friend '{friend_id}'")

        if os.path.exists(file_path):
            os.remove(file_path)

        return {"status": "success", "chunks": chunks}

    except Exception as exc:
        logger.error(f"[CELERY] ❌ Failed to process '{original_filename}' for friend '{friend_id}': {exc}")
        if os.path.exists(file_path):
            os.remove(file_path)
        # P2: Retry on failure
        raise self.retry(exc=exc, countdown=30)


@celery_app.task(
    name="worker.process_url_task",
    bind=True,
    max_retries=3,
    default_retry_delay=30
)
def process_url_task(self, url: str, friend_id: str):
    """Background task: scrape a URL and store it in ChromaDB."""
    try:
        chunks = rag.process_and_store_url(url, friend_id)
        logger.info(f"[CELERY] ✅ Scraped and indexed {chunks} chunks from '{url}' for friend '{friend_id}'")
        return {"status": "success", "chunks": chunks}

    except Exception as exc:
        logger.error(f"[CELERY] ❌ Failed to scrape '{url}' for friend '{friend_id}': {exc}")
        raise self.retry(exc=exc, countdown=30)
