from database import SessionLocal, engine, Base
import models
import datetime

# Make sure tables are created
Base.metadata.create_all(bind=engine)

def seed_db():
    db = SessionLocal()
    
    # Check if we already seeded
    if db.query(models.Friend).first():
        print("Database already seeded. Skipping.")
        db.close()
        return

    friends_data = [
        {
            "id": "contract-reviewer",
            "name": "Contract Reviewer",
            "department": "Legal",
            "description": "Analyzes legal contracts and highlights key terms, risks, and obligations.",
            "system_prompt": "You are a senior paralegal at ACME Corp reviewing contracts.",
            "dataSources": ["ACME_NDA_Template.pdf", "Vendor_Agreement_Q4.docx"]
        },
        {
            "id": "meeting-summarizer",
            "name": "Meeting Summarizer",
            "department": "Operations",
            "description": "Creates comprehensive summaries from meeting transcripts with action items.",
            "system_prompt": "You are an executive assistant for ACME Corp. Summarize transcripts.",
            "dataSources": ["Q3_AllHands_Transcript.txt"]
        },
        {
            "id": "resume-screener",
            "name": "Resume Screener",
            "department": "HR & Recruiting",
            "description": "Screens candidate resumes against job requirements and provides scores.",
            "system_prompt": "You are a recruiter at ACME Corp. Grade resumes 1-10.",
            "dataSources": ["Senior_Dev_Job_Description.pdf", "JD_Doe_Resume.pdf"]
        },
        {
            "id": "sales-proposal-gen",
            "name": "Sales Proposal Generator",
            "department": "Sales",
            "description": "Generates customized sales proposals based on client data and templates.",
            "system_prompt": "You are an enterprise account executive at ACME Corp.",
            "dataSources": ["ACME_Product_Deck_2025.pdf", "Pricing_Sheet_v2.xlsx"]
        },
        {
            "id": "financial-analyzer",
            "name": "Financial Report Analyzer",
            "department": "Finance",
            "description": "Extracts insights and trends from quarterly financial reports.",
            "system_prompt": "You are a financial analyst at ACME Corp focusing on cost-saving.",
            "dataSources": ["Q3_Financial_Review.pdf", "Budget_Forecast_2025.xlsx"]
        },
        {
            "id": "email-helper",
            "name": "Email Response Helper",
            "department": "Customer Success",
            "description": "Drafts professional email responses based on context and tone.",
            "system_prompt": "You are a customer success manager for ACME Corp SaaS products.",
            "dataSources": ["CS_Playbook.pdf"]
        },
         {
            "id": "interview-gen",
            "name": "Interview Question Generator",
            "department": "HR & Recruiting",
            "description": "Creates role-specific interview questions from job descriptions.",
            "system_prompt": "You are an HR director at ACME Corp.",
            "dataSources": ["Engineering_Interview_Guide.pdf"]
        },
        {
            "id": "compliance-checker",
            "name": "Compliance Checker",
            "department": "Legal",
            "description": "Reviews documents for regulatory compliance issues.",
            "system_prompt": "You are a compliance officer at ACME Corp ensuring SOC2 compliance.",
            "dataSources": ["SOC2_Audit_Prep.pdf"]
        }
    ]

    for f in friends_data:
        friend = models.Friend(
            id=f["id"],
            name=f["name"],
            department=f["department"],
            description=f["description"],
            system_prompt=f["system_prompt"],
            dataSources=f["dataSources"]
        )
        db.add(friend)
    
    # Add a mock chat for the contract reviewer to prove it works
    msg1 = models.ChatMessage(
        friend_id="contract-reviewer",
        role="user",
        text="Can you summarize the liability clause in the Vendor Agreement?"
    )
    msg2 = models.ChatMessage(
        friend_id="contract-reviewer",
        role="assistant",
        text="Based on the ACME Corp Vendor Agreement (Q4), the liability clause is capped at $50,000 for direct damages, and excludes all indirect, consequential, or punitive damages. Is there a specific risk you are concerned about?"
    )
    db.add(msg1)
    db.add(msg2)

    db.commit()
    print("Database successfully seeded with ACME Corp mock data!")
    db.close()

if __name__ == "__main__":
    seed_db()
