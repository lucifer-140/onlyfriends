"""
seed_chroma.py — Seeds ChromaDB with the mock PDFs for all pre-built Digital Friends.
Run this once after `seed.py` to give the pre-built friends actual knowledge to query.
"""
import os
import sys

# Ensure we run from the backend directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

import rag

MOCK_DOCS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mock_documents")

# Map each friend to the best matching mock PDF
FRIEND_DOCUMENT_MAP = {
    "resume-screener":    "acme_hiring_guide_2024.pdf",
    "interview-gen":      "acme_hiring_guide_2024.pdf",
    "financial-analyzer": "acme_financial_report_2024.pdf",
    "contract-reviewer":  "acme_data_privacy_compliance_2024.pdf",
    "compliance-checker": "acme_data_privacy_compliance_2024.pdf",
    "email-helper":       "acme_support_playbook_2025.pdf",
    "meeting-summarizer": "acme_employee_handbook_2025.pdf",
    "sales-proposal-gen": "acme_sales_playbook_2025.pdf",
}

def seed_chroma():
    if not os.path.exists(MOCK_DOCS_DIR):
        print(f"ERROR: mock_documents/ directory not found. Run generate_mock_pdfs.py first.")
        sys.exit(1)

    print("Seeding ChromaDB for pre-built Digital Friends...\n")
    total_chunks = 0

    for friend_id, pdf_name in FRIEND_DOCUMENT_MAP.items():
        pdf_path = os.path.join(MOCK_DOCS_DIR, pdf_name)

        if not os.path.exists(pdf_path):
            print(f"  [SKIP] {friend_id} — '{pdf_name}' not found")
            continue

        try:
            # Check if collection already has data
            collection_name = f"friend_{friend_id}"
            try:
                existing = rag.chroma_client.get_collection(collection_name)
                count = existing.count()
                if count > 0:
                    print(f"  [SKIP] {friend_id} — already has {count} chunks in ChromaDB")
                    continue
            except Exception:
                pass  # Collection doesn't exist yet, proceed to create

            chunks = rag.process_and_store_document(pdf_path, friend_id, pdf_name)
            total_chunks += chunks
            print(f"  [OK]   {friend_id} — indexed {chunks} chunks from '{pdf_name}'")
        except Exception as e:
            print(f"  [ERR]  {friend_id} — {e}")

    print(f"\nDone! {total_chunks} total chunks added to ChromaDB.")
    print("Your pre-built Digital Friends now have real knowledge to query.\n")

    # Show current collections
    print("Active ChromaDB Collections:")
    for col in rag.chroma_client.list_collections():
        try:
            count = rag.chroma_client.get_collection(col.name).count()
            print(f"  • {col.name}: {count} chunks")
        except:
            print(f"  • {col.name}")

if __name__ == "__main__":
    seed_chroma()
