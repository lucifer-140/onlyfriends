import os
import chromadb
from langchain_community.document_loaders import PyPDFLoader, WebBaseLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Initialize local ChromaDB client (stores data in a local folder)
persist_directory = "./chroma_db"
os.makedirs(persist_directory, exist_ok=True)
chroma_client = chromadb.PersistentClient(path=persist_directory)

def process_and_store_document(file_path: str, friend_id: str, original_filename: str):
    """
    Reads a PDF, splits it into semantic chunks, and stores it in the vector DB.
    """
    # 1. Load the document
    loader = PyPDFLoader(file_path)
    pages = loader.load()
    
    # 2. Split into smaller chunks for embeddings
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )
    chunks = text_splitter.split_documents(pages)
    
    # 3. Get or create collection for this friend
    # Using Llama 3 for embeddings requires an external model, 
    # but for simplicity locally we use Chroma's built-in default embedding function (all-MiniLM-L6-v2) 
    # which runs entirely on the CPU locally and is very fast.
    collection = chroma_client.get_or_create_collection(
        name=f"friend_{friend_id}",
        metadata={"hnsw:space": "cosine"}
    )
    
    # 4. Store in Vector DB
    documents = [chunk.page_content for chunk in chunks]
    ids = [f"{original_filename}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [{"source": original_filename, "page": chunk.metadata.get("page", 0)} for chunk in chunks]
    
    collection.add(
        documents=documents,
        metadatas=metadatas,
        ids=ids
    )
    
    return len(chunks)

def process_and_store_url(url: str, friend_id: str):
    """
    Scrapes a URL, splits it into semantic chunks, and stores it in the vector DB.
    """
    loader = WebBaseLoader(url)
    pages = loader.load()
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )
    chunks = text_splitter.split_documents(pages)
    
    collection = chroma_client.get_or_create_collection(
        name=f"friend_{friend_id}",
        metadata={"hnsw:space": "cosine"}
    )
    
    documents = [chunk.page_content for chunk in chunks]
    # create safe ID
    safe_url = "".join(c if c.isalnum() else "_" for c in url)[:50]
    ids = [f"{safe_url}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [{"source": url, "page": 0} for chunk in chunks]
    
    collection.add(
        documents=documents,
        metadatas=metadatas,
        ids=ids
    )
    
    return len(chunks)

def query_friend_knowledge(friend_id: str, queryText: str, n_results: int = 3) -> str:
    """
    Searches the Vector DB for the most relevant chunks to the user's prompt.
    """
    try:
        collection = chroma_client.get_collection(name=f"friend_{friend_id}")
        results = collection.query(
            query_texts=[queryText],
            n_results=n_results
        )
        
        # Combine the retrieved text chunks into a single context string
        if not results['documents'] or not results['documents'][0]:
            return "No relevant internal company data found for this query."
            
        context_chunks = results['documents'][0]
        return "\n\n".join([f"[INTERNAL KNOWLEDGE CHUNK]: {chunk}" for chunk in context_chunks])
        
    except Exception as e:
        # Collection might not exist yet if no files uploaded
        return "No internal company data has been uploaded to this Digital Friend yet."
