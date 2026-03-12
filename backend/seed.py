from database import SessionLocal, engine, Base
import models
import datetime
import rag
import os

# Make sure tables are created
Base.metadata.create_all(bind=engine)

# Map each friend to a real PDF we have in mock_documents/
MOCK_DOCS_DIR = os.path.join(os.path.dirname(__file__), "mock_documents")

friends_data = [
    {
        "id": "hr-policy-bot",
        "name": "HR Policy Bot",
        "department": "HR & Recruiting",
        "description": "Answers any question about ACME Corp employee policies, leave, benefits, and conduct.",
        "system_prompt": "You are an HR assistant for ACME Corporation. Answer employee questions accurately based on the ACME Employee Handbook. Be friendly, concise, and cite the relevant policy section when possible.",
        "dataSources": ["acme_employee_handbook_2025.pdf"],
        "pdf_file": "acme_employee_handbook_2025.pdf",
        "creator": "system"
    },
    {
        "id": "financial-analyzer",
        "name": "Financial Report Analyzer",
        "department": "Finance",
        "description": "Extracts insights and trends from ACME Corp's financial reports and metrics.",
        "system_prompt": "You are a senior financial analyst at ACME Corporation. Help stakeholders understand financial performance, key ratios, and business trends based on official financial data. Be precise and data-driven.",
        "dataSources": ["acme_financial_report_2024.pdf"],
        "pdf_file": "acme_financial_report_2024.pdf",
        "creator": "system"
    },
    {
        "id": "it-helpdesk",
        "name": "IT Helpdesk Assistant",
        "department": "IT",
        "description": "Helps employees understand IT security policies, password requirements, and device compliance.",
        "system_prompt": "You are an IT support specialist at ACME Corporation. Answer questions about IT security policies, device setup, data classification, and security incidents using official ACME IT policies. Be clear and procedural.",
        "dataSources": ["acme_it_security_policy_2024.pdf"],
        "pdf_file": "acme_it_security_policy_2024.pdf",
        "creator": "system"
    },
    {
        "id": "hr-recruiting-helper",
        "name": "Recruiting Assistant",
        "department": "HR & Recruiting",
        "description": "Guides hiring managers through the ACME recruitment process, interview stages, and offer guidelines.",
        "system_prompt": "You are a talent acquisition specialist at ACME Corporation. Help hiring managers understand the end-to-end recruitment process, interview best practices, scoring, and compensation guidelines based on the official ACME Hiring Guide.",
        "dataSources": ["acme_hiring_guide_2024.pdf"],
        "pdf_file": "acme_hiring_guide_2024.pdf",
        "creator": "system"
    },
    {
        "id": "product-advisor",
        "name": "Product Roadmap Advisor",
        "department": "Product",
        "description": "Answers questions about upcoming product features, timelines, and strategic themes.",
        "system_prompt": "You are a product manager at ACME Corporation. Help stakeholders understand what's being built, when it will be ready, and why these priorities were chosen, based on the official H1 2025 roadmap.",
        "dataSources": ["acme_product_roadmap_h1_2025.pdf"],
        "pdf_file": "acme_product_roadmap_h1_2025.pdf",
        "creator": "system"
    },
    {
        "id": "support-agent",
        "name": "Support Agent Bot",
        "department": "Customer Success",
        "description": "Guides support agents through SLAs, escalation procedures, and refund policies.",
        "system_prompt": "You are a senior customer support manager at ACME Corporation. Help support agents handle escalations, understand SLA commitments, apply refund policies, and monitor customer health using the official Support Playbook.",
        "dataSources": ["acme_support_playbook_2025.pdf"],
        "pdf_file": "acme_support_playbook_2025.pdf",
        "creator": "system"
    },
    {
        "id": "sales-advisor",
        "name": "Sales Enablement Bot",
        "department": "Sales",
        "description": "Helps sales reps with pricing, ICP, discount authority, and competitive positioning.",
        "system_prompt": "You are a revenue operations specialist at ACME Corporation. Help account executives qualify deals, understand pricing tiers, request discounts, and position ACME against competitors using the official Sales Playbook.",
        "dataSources": ["acme_sales_playbook_2025.pdf"],
        "pdf_file": "acme_sales_playbook_2025.pdf",
        "creator": "system"
    },
    {
        "id": "compliance-bot",
        "name": "Compliance Bot",
        "department": "Legal",
        "description": "Answers GDPR, SOC 2, and data retention policy questions for employees and enterprise clients.",
        "system_prompt": "You are a compliance and privacy officer at ACME Corporation. Help employees and enterprise clients understand ACME's data privacy obligations, GDPR compliance posture, SOC 2 certification, incident reporting procedures, and data retention schedules.",
        "dataSources": ["acme_data_privacy_compliance_2024.pdf"],
        "pdf_file": "acme_data_privacy_compliance_2024.pdf",
        "creator": "system"
    },
]


def seed_db():
    db = SessionLocal()

    # Check if we already seeded
    if db.query(models.Friend).first():
        print("Database already seeded. Skipping.")
        db.close()
        return

    print("Seeding PostgreSQL with Digital Friends...")
    for f in friends_data:
        friend = models.Friend(
            id=f["id"],
            name=f["name"],
            department=f["department"],
            description=f["description"],
            system_prompt=f["system_prompt"],
            dataSources=f["dataSources"],
            creator=f.get("creator", "system")
        )
        db.add(friend)

    # Add a sample chat history for the HR Policy Bot to demo it
    db.add(models.ChatMessage(
        friend_id="hr-policy-bot",
        role="user",
        text="How many annual leave days do I get per year?"
    ))
    db.add(models.ChatMessage(
        friend_id="hr-policy-bot",
        role="assistant",
        text="According to the ACME Employee Handbook 2025 (Section 4 – Leave Policies), you receive **18 annual leave days per year**, accrued monthly. Unused leave rolls over up to a maximum of 36 days."
    ))

    db.commit()
    print("✓ PostgreSQL seeded successfully.")
    db.close()


def seed_chromadb():
    """
    Pre-loads each friend's PDF into ChromaDB so they can answer questions immediately.
    This is idempotent — it uses get_or_create_collection so re-running is safe.
    """
    print("\nSeeding ChromaDB vector store with mock documents...")
    missing = []

    for f in friends_data:
        pdf_name = f.get("pdf_file")
        if not pdf_name:
            continue

        pdf_path = os.path.join(MOCK_DOCS_DIR, pdf_name)
        if not os.path.exists(pdf_path):
            missing.append(pdf_path)
            continue

        try:
            chunks = rag.process_and_store_document(
                file_path=pdf_path,
                friend_id=f["id"],
                original_filename=pdf_name
            )
            print(f"  ✓ {f['name']} ({f['id']}) — {chunks} chunks indexed from {pdf_name}")
        except Exception as e:
            print(f"  ✗ Failed to index {pdf_name} for {f['id']}: {e}")

    if missing:
        print(f"\n⚠ Missing PDF files (run generate_mock_pdfs.py first):")
        for m in missing:
            print(f"  - {m}")
    else:
        print("\n✓ ChromaDB seeded successfully. All Digital Friends now have knowledge!")


if __name__ == "__main__":
    seed_db()
    seed_chromadb()
