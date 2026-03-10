from reportlab.pdfgen import canvas

def create_sample_pdf(filename, content):
    c = canvas.Canvas(filename)
    y = 800
    for line in content:
        c.drawString(100, y, line)
        y -= 20
    c.save()

content = [
    "ACME CORP - HR GUIDELINES 2026",
    "Requirements for Software Engineers:",
    "- Must have at least 3 years of experience.",
    "- Must be proficient in Python and React.",
    "- Must have experience with Docker and AWS.",
    "Bonus Qualifications:",
    "- Experience with Vector Databases (ChromaDB)",
    "- Familiarity with LLMs (Llama 3)"
]

create_sample_pdf("mock_hr_guidelines.pdf", content)
print("Created mock_hr_guidelines.pdf")
