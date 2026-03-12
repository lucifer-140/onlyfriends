import os
import logging
import chromadb
from langchain_community.document_loaders import PyPDFLoader, WebBaseLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

logger = logging.getLogger(__name__)

# Initialize local ChromaDB client (stores data in a local folder)
persist_directory = "./chroma_db"
os.makedirs(persist_directory, exist_ok=True)
chroma_client = chromadb.PersistentClient(path=persist_directory)

# P2: Smaller chunks capture more focused facts; higher overlap preserves context at boundaries
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=200,
    length_function=len,
    separators=["\n\n", "\n", ". ", " "]
)


def _deduplicate_chunks(chunks: list[str]) -> list[str]:
    """P2: Remove near-duplicate chunks using first-100-char fingerprint."""
    seen = set()
    unique = []
    for chunk in chunks:
        fingerprint = chunk.strip()[:100]
        if fingerprint not in seen:
            seen.add(fingerprint)
            unique.append(chunk)
    return unique


def process_and_store_document(file_path: str, friend_id: str, original_filename: str) -> int:
    """Reads a PDF, splits into semantic chunks, deduplicates, and stores in ChromaDB."""
    loader = PyPDFLoader(file_path)
    pages = loader.load()

    if not pages:
        raise ValueError(f"PDF '{original_filename}' appears to be empty or unreadable.")

    chunks = text_splitter.split_documents(pages)
    documents = _deduplicate_chunks([chunk.page_content for chunk in chunks])

    collection = chroma_client.get_or_create_collection(
        name=f"friend_{friend_id}",
        metadata={"hnsw:space": "cosine"}
    )

    ids = [f"{original_filename}_chunk_{i}" for i in range(len(documents))]
    metadatas = [{"source": original_filename, "page": chunks[i].metadata.get("page", 0)} for i in range(len(documents))]

    collection.add(documents=documents, metadatas=metadatas, ids=ids)
    logger.info(f"[RAG] Stored {len(documents)} chunks for friend '{friend_id}' from '{original_filename}'")
    return len(documents)


def process_and_store_url(url: str, friend_id: str) -> int:
    """Scrapes a URL, splits into semantic chunks, and stores in ChromaDB."""
    loader = WebBaseLoader(url)
    pages = loader.load()

    # P2: Guard against JS-heavy pages that return near-nothing
    scraped_text = " ".join(p.page_content for p in pages).strip()
    if len(scraped_text) < 200:
        raise ValueError(
            f"The URL '{url}' returned too little content ({len(scraped_text)} chars). "
            "The page may require JavaScript rendering or be paywalled."
        )

    chunks = text_splitter.split_documents(pages)
    documents = _deduplicate_chunks([chunk.page_content for chunk in chunks])

    collection = chroma_client.get_or_create_collection(
        name=f"friend_{friend_id}",
        metadata={"hnsw:space": "cosine"}
    )

    safe_url = "".join(c if c.isalnum() else "_" for c in url)[:50]
    ids = [f"{safe_url}_chunk_{i}" for i in range(len(documents))]
    metadatas = [{"source": url, "page": 0} for _ in documents]

    collection.add(documents=documents, metadatas=metadatas, ids=ids)
    logger.info(f"[RAG] Stored {len(documents)} chunks for friend '{friend_id}' from URL '{url}'")
    return len(documents)


def query_friend_knowledge(friend_id: str, queryText: str, n_results: int = 4) -> str:
    """
    Searches ChromaDB for the most relevant chunks to the user's prompt.
    P1: Applies a relevance threshold — chunks with cosine distance > 0.75 are discarded
    to prevent loosely-related document facts from bleeding into the response.
    """
    try:
        collection = chroma_client.get_collection(name=f"friend_{friend_id}")
        results = collection.query(
            query_texts=[queryText],
            n_results=n_results,
            include=["documents", "distances"]
        )

        if not results["documents"] or not results["documents"][0]:
            return "No relevant internal company data found for this query."

        documents = results["documents"][0]
        distances = results["distances"][0]

        # P1: Relevance threshold — discard chunks that are too dissimilar
        RELEVANCE_THRESHOLD = 0.75  # cosine distance; lower = more similar
        relevant_chunks = [
            doc for doc, dist in zip(documents, distances)
            if dist < RELEVANCE_THRESHOLD
        ]

        if not relevant_chunks:
            logger.info(f"[RAG] All chunks below relevance threshold for query: '{queryText[:60]}'")
            return "No relevant internal company data found for this query."

        logger.info(f"[RAG] Returning {len(relevant_chunks)}/{len(documents)} relevant chunks for friend '{friend_id}'")
        return "\n\n[INTERNAL KNOWLEDGE CHUNK]: ".join(relevant_chunks)

    except Exception as e:
        # Collection doesn't exist yet — graceful fallback
        logger.warning(f"[RAG] Collection not found for friend '{friend_id}': {e}")
        return "No internal company data has been uploaded to this Digital Friend yet."
