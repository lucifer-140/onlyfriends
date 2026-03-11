"""
Generate a realistic suite of ACME Corp mock PDF documents for testing OnlyFriends RAG pipeline.
Produces 8 diverse company documents covering HR, finance, IT, product, and legal domains.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
import os

OUTPUT_DIR = "mock_documents"
os.makedirs(OUTPUT_DIR, exist_ok=True)

styles = getSampleStyleSheet()

# Custom styles
title_style = ParagraphStyle("DocTitle", parent=styles["Title"], fontSize=22, spaceAfter=12, textColor=colors.HexColor("#1A1A2E"))
heading1_style = ParagraphStyle("H1", parent=styles["Heading1"], fontSize=14, spaceAfter=6, spaceBefore=14, textColor=colors.HexColor("#16213E"))
heading2_style = ParagraphStyle("H2", parent=styles["Heading2"], fontSize=12, spaceAfter=4, spaceBefore=10, textColor=colors.HexColor("#0F3460"))
body_style = ParagraphStyle("Body", parent=styles["BodyText"], fontSize=10, spaceAfter=6, leading=14, alignment=TA_JUSTIFY)
bullet_style = ParagraphStyle("Bullet", parent=styles["BodyText"], fontSize=10, spaceAfter=4, leftIndent=20, leading=14)
meta_style = ParagraphStyle("Meta", parent=styles["BodyText"], fontSize=9, textColor=colors.grey, spaceAfter=2)
center_style = ParagraphStyle("Center", parent=styles["BodyText"], fontSize=10, alignment=TA_CENTER)

def build_pdf(filename, elements):
    path = os.path.join(OUTPUT_DIR, filename)
    doc = SimpleDocTemplate(path, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    doc.build(elements)
    print(f"  ✓ Generated: {path}")

def divider():
    return HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey, spaceAfter=8, spaceBefore=4)

def p(text, style=None):
    return Paragraph(text, style or body_style)

def h1(text):
    return Paragraph(text, heading1_style)

def h2(text):
    return Paragraph(text, heading2_style)

def b(text):
    return Paragraph(f"&bull; {text}", bullet_style)

def sp(n=1):
    return Spacer(1, n * 0.3 * cm)

# ──────────────────────────────────────────────
# 1. EMPLOYEE HANDBOOK
# ──────────────────────────────────────────────
def generate_employee_handbook():
    elems = [
        p("ACME CORPORATION", meta_style),
        Paragraph("Employee Handbook 2025", title_style),
        p("Version 4.2 | Human Resources Department | Effective January 1, 2025", meta_style),
        divider(), sp(),

        h1("1. Welcome to ACME Corporation"),
        p("Welcome to the ACME family! This handbook outlines our policies, culture, and the resources available to you as an employee. Please read it carefully and retain it for future reference."),
        p("ACME Corporation was founded in 2001 and has grown to serve over 50,000 customers globally. Our mission is to deliver innovative solutions that create real business value for our clients."),

        h1("2. Code of Conduct"),
        h2("2.1 Professional Behavior"),
        p("All employees are expected to maintain the highest standards of professional conduct. This includes respectful communication, punctuality, and adherence to company policies."),
        b("Treat all colleagues, clients, and partners with respect and dignity."),
        b("Avoid conflicts of interest and disclose any potential conflicts to your manager."),
        b("Protect confidential company and client information at all times."),
        b("Report any suspected violations of law or company policy to HR."),

        h2("2.2 Anti-Harassment Policy"),
        p("ACME has zero tolerance for workplace harassment or discrimination of any kind based on race, gender, age, religion, sexual orientation, or disability. Violations will result in immediate disciplinary action up to and including termination."),

        h1("3. Work Hours & Attendance"),
        p("Standard office hours are Monday through Friday, 9:00 AM to 6:00 PM local time. Employees are expected to be present and engaged during core hours of 10:00 AM to 4:00 PM. Flexible work arrangements may be approved by department managers on a case-by-case basis."),

        h2("3.1 Remote Work Policy"),
        p("Employees may work remotely up to 2 days per week after completing their 90-day probationary period. Remote work must be pre-approved by your direct manager and requires a secure, distraction-free environment."),

        h1("4. Leave Policies"),
        p("ACME provides competitive leave benefits to support employee wellbeing and work-life balance."),
        b("Annual Leave: 18 days per year, accrued monthly. Unused leave rolls over up to a maximum of 36 days."),
        b("Sick Leave: 12 days per year. A medical certificate is required for absences exceeding 3 consecutive days."),
        b("Maternity Leave: 16 weeks fully paid. Additional 8 weeks may be taken at 50% pay."),
        b("Paternity Leave: 4 weeks fully paid."),
        b("Bereavement Leave: 5 days for immediate family, 3 days for extended family."),
        b("Public Holidays: All employees observe 13 national public holidays per year."),

        h1("5. Benefits & Compensation"),
        h2("5.1 Health Insurance"),
        p("ACME provides comprehensive medical, dental, and vision insurance for all full-time employees. Coverage begins on day one. Employees may add dependents during the annual enrollment window in November."),

        h2("5.2 Performance Reviews"),
        p("Performance reviews are conducted annually in December. Mid-year check-ins occur in June. Salary increments are tied to performance ratings and are effective from February 1st of each year. The standard increment range is 3% to 12% based on rating."),

        h2("5.3 Employee Assistance Program (EAP)"),
        p("All employees have access to our free, confidential Employee Assistance Program which offers counseling, financial advice, and legal consultations. Contact HR for the program access code."),

        h1("6. IT & Security Policies"),
        p("All company data must be stored on approved platforms. Personal cloud storage (Google Drive personal, Dropbox, etc.) must not be used for company data. All devices must have company-approved endpoint protection software installed."),

        h1("7. Disciplinary Procedures"),
        p("ACME follows a progressive disciplinary process: verbal warning → written warning → final written warning → termination. HR must be involved from the written warning stage onwards. Gross misconduct may result in immediate termination without prior warnings."),
    ]
    build_pdf("acme_employee_handbook_2025.pdf", elems)


# ──────────────────────────────────────────────
# 2. ANNUAL FINANCIAL REPORT
# ──────────────────────────────────────────────
def generate_financial_report():
    elems = [
        p("ACME CORPORATION", meta_style),
        Paragraph("Annual Financial Report 2024", title_style),
        p("Fiscal Year Ended December 31, 2024 | Finance Department | Confidential", meta_style),
        divider(), sp(),

        h1("Executive Summary"),
        p("Fiscal Year 2024 was a landmark year for ACME Corporation. Total revenue grew by 23% year-over-year to $142.7 million, driven by strong performance in our SaaS business unit and successful entry into the APAC market. Net profit margin improved to 18.4%, up from 14.1% in FY2023."),

        h1("Revenue Breakdown"),
        sp(),
        Table([
            ["Business Unit", "FY2023 ($M)", "FY2024 ($M)", "YoY Growth"],
            ["SaaS Platform", "58.2", "79.4", "+36.4%"],
            ["Professional Services", "34.1", "38.6", "+13.2%"],
            ["Support & Maintenance", "14.7", "17.9", "+21.8%"],
            ["Hardware & Licenses", "8.9", "6.8", "-23.6%"],
            ["Total", "115.9", "142.7", "+23.1%"],
        ], colWidths=[7*cm, 3.5*cm, 3.5*cm, 3.5*cm],
        style=TableStyle([
            ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#16213E")),
            ("TEXTCOLOR", (0,0), (-1,0), colors.white),
            ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
            ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#F0F4FF")]),
            ("GRID", (0,0), (-1,-1), 0.5, colors.lightgrey),
            ("ALIGN", (1,0), (-1,-1), "CENTER"),
            ("FONTNAME", (0,-1), (-1,-1), "Helvetica-Bold"),
        ])),
        sp(),

        h1("Key Financial Metrics"),
        b("Gross Profit Margin: 68.3% (up from 63.1% in FY2023)"),
        b("EBITDA: $38.2M representing a 26.8% EBITDA margin"),
        b("Operating Cash Flow: $31.6M"),
        b("Free Cash Flow: $22.1M after $9.5M capital expenditure"),
        b("Customer Acquisition Cost (CAC): $4,200 per enterprise customer"),
        b("Lifetime Value (LTV): $67,000 average per enterprise customer"),
        b("LTV:CAC Ratio: 15.95x (industry benchmark: 3x)"),

        h1("Regional Performance"),
        b("North America: $84.3M revenue (59% of total), 18% growth"),
        b("Europe: $38.7M revenue (27% of total), 29% growth"),
        b("APAC: $19.7M revenue (14% of total), first full year of operations"),

        h1("Headcount & Operating Costs"),
        p("Total headcount grew from 487 to 623 employees by year end. Employee costs represent 42% of total operating expenses. We invested $4.1M in employee training and development, a 67% increase from the prior year."),

        h1("FY2025 Outlook"),
        p("Management projects revenue of $175M to $185M for FY2025, representing 23% to 30% growth. Key growth drivers include the launch of ACME AI Suite in Q2 2025, expansion of the European team, and deepening APAC partnerships. We will continue to invest in R&D at approximately 15% of revenue."),
    ]
    build_pdf("acme_financial_report_2024.pdf", elems)


# ──────────────────────────────────────────────
# 3. IT SECURITY POLICY
# ──────────────────────────────────────────────
def generate_it_security_policy():
    elems = [
        p("ACME CORPORATION", meta_style),
        Paragraph("IT Security & Data Protection Policy", title_style),
        p("Version 3.1 | IT Department | Classification: Internal | Last Updated: Oct 2024", meta_style),
        divider(), sp(),

        h1("1. Purpose & Scope"),
        p("This policy establishes the rules and guidelines for protecting ACME Corporation's information assets, IT infrastructure, and customer data. It applies to all employees, contractors, vendors, and any third parties with access to ACME systems."),

        h1("2. Password Policy"),
        b("Minimum length: 14 characters."),
        b("Must include uppercase, lowercase, numbers, and at least one special character."),
        b("Passwords must not be reused for the last 12 rotations."),
        b("Mandatory rotation every 90 days for all privileged accounts."),
        b("Multi-factor authentication (MFA) is mandatory for all systems."),
        b("Password managers (1Password or Bitwarden Business) are approved and encouraged."),

        h1("3. Device Security"),
        h2("3.1 Endpoint Requirements"),
        p("All devices accessing ACME systems must have: full disk encryption enabled, company-approved antivirus (CrowdStrike Falcon), automatic OS updates configured, and screen lock after 5 minutes of inactivity."),

        h2("3.2 Mobile Device Management"),
        p("All mobile devices used for work must be enrolled in ACME's MDM system (Jamf for macOS/iOS, Intune for Windows/Android). Lost or stolen devices must be reported to IT within 1 hour for remote wipe."),

        h1("4. Data Classification"),
        Table([
            ["Classification", "Description", "Examples", "Controls"],
            ["Public", "Freely shareable", "Press releases, marketing", "None"],
            ["Internal", "For employees only", "Policies, org charts", "Login required"],
            ["Confidential", "Sensitive business data", "Customer data, financials", "Encryption + Access log"],
            ["Restricted", "Highly sensitive", "PII, trade secrets", "MFA + Encryption + Audit"],
        ], colWidths=[4*cm, 4.5*cm, 4.5*cm, 4.5*cm],
        style=TableStyle([
            ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#16213E")),
            ("TEXTCOLOR", (0,0), (-1,0), colors.white),
            ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
            ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#F0F4FF")]),
            ("GRID", (0,0), (-1,-1), 0.5, colors.lightgrey),
            ("FONTSIZE", (0,0), (-1,-1), 9),
        ])),
        sp(),

        h1("5. Acceptable Use Policy"),
        p("Company IT resources are provided for business use. Limited personal use is permitted but must not interfere with work performance. The following are strictly prohibited:"),
        b("Accessing, storing, or distributing illegal content."),
        b("Cryptocurrency mining using company resources."),
        b("Installing unauthorized software or browser extensions."),
        b("Sharing credentials with colleagues or third parties."),
        b("Connecting personal NAS or network devices to the corporate network."),

        h1("6. Incident Response"),
        p("Report all security incidents to security@acmecorp.com and the IT helpdesk within 1 hour of discovery. Incidents include: suspected phishing, ransomware, data leaks, unauthorized access, and lost devices."),
        p("SLA for incident response: Critical P1 incidents – 30 minute response, 4 hour resolution target. Major P2 – 2 hour response, 24 hour resolution target."),

        h1("7. Third-Party & Vendor Access"),
        p("Vendors requiring system access must sign the ACME Vendor Security Agreement and complete the annual security assessment questionnaire. All vendor access is time-limited and logged. The IT team reviews active vendor permissions quarterly."),
    ]
    build_pdf("acme_it_security_policy_2024.pdf", elems)


# ──────────────────────────────────────────────
# 4. HIRING & RECRUITMENT GUIDE
# ──────────────────────────────────────────────
def generate_hiring_guide():
    elems = [
        p("ACME CORPORATION", meta_style),
        Paragraph("Recruitment & Hiring Guide", title_style),
        p("Human Resources Department | For Internal Use Only | Version 2.4", meta_style),
        divider(), sp(),

        h1("1. The ACME Hiring Philosophy"),
        p("We hire for cultural fit first, skills second. Every candidate we bring on board should embody our four core values: Ownership, Curiosity, Collaboration, and Impact. We prioritize building diverse teams and actively work to eliminate bias at every stage of the hiring process."),

        h1("2. Requisition Process"),
        p("All new hires and backfills must be approved before posting. The process is:"),
        b("Step 1: Hiring manager submits a Job Requisition Form (JRF) in Workday."),
        b("Step 2: Department Head approves the requisition."),
        b("Step 3: Finance confirms budget availability."),
        b("Step 4: HR reviews and activates the posting within 3 business days."),

        h1("3. Interview Process"),
        h2("Standard Interview Stages"),
        Table([
            ["Stage", "Owner", "Duration", "Purpose"],
            ["HR Screen", "Talent Acquisition", "30 min", "Culture, motivation, logistics"],
            ["Hiring Manager", "Department Head", "45-60 min", "Role fit, experience deep dive"],
            ["Technical / Skills", "Senior IC", "60-90 min", "Hard skill assessment"],
            ["Panel Interview", "2-3 cross-functional", "60 min", "Collaboration, values assessment"],
            ["Offer Call", "Talent Acquisition", "30 min", "Compensation discussion"],
        ], colWidths=[4*cm, 4.5*cm, 2.5*cm, 6.5*cm],
        style=TableStyle([
            ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#16213E")),
            ("TEXTCOLOR", (0,0), (-1,0), colors.white),
            ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
            ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#F0F4FF")]),
            ("GRID", (0,0), (-1,-1), 0.5, colors.lightgrey),
            ("FONTSIZE", (0,0), (-1,-1), 9),
        ])),
        sp(),

        h1("4. Scoring & Decision Making"),
        p("Interviewers must submit scorecards within 24 hours of the interview via Greenhouse. Scores are on a 1-4 scale: 1 = Strong No, 2 = No, 3 = Yes, 4 = Strong Yes. A candidate requires an average score of 3.0 or higher to proceed. Hiring decisions require consensus from all panel interviewers."),

        h2("Prohibited Interview Questions"),
        p("Interviewers must not ask about: age, marital status, pregnancy plans, religion, national origin, or disabilities. Any such questions constitute a legal liability for ACME. Contact HR if a candidate volunteers such information."),

        h1("5. Offer Management"),
        p("All offers are benchmarked against the Radford Technology Compensation Survey at the 65th percentile for base salary. Offers include base salary, annual performance bonus (10-20% of base), equity (RSUs with 4-year vest, 1-year cliff), and benefits package."),

        h1("6. Background Checks"),
        p("All offers are contingent on background check clearance which includes: criminal record check (7 years), employment verification (last 3 roles), education verification, and credit check for Finance roles. Background checks are conducted by our third-party provider, Checkr."),

        h1("7. Onboarding"),
        p("New hires must complete pre-boarding paperwork no later than 5 business days before their start date. The first week follows a structured onboarding plan managed by HR. Hiring managers are responsible for completing a 30-60-90 day plan collaboratively with the new hire within the first week."),
    ]
    build_pdf("acme_hiring_guide_2024.pdf", elems)


# ──────────────────────────────────────────────
# 5. PRODUCT ROADMAP Q1-Q2 2025
# ──────────────────────────────────────────────
def generate_product_roadmap():
    elems = [
        p("ACME CORPORATION", meta_style),
        Paragraph("Product Roadmap — H1 2025", title_style),
        p("Product Management | Classification: Confidential | Last Updated: Jan 15, 2025", meta_style),
        divider(), sp(),

        h1("Strategic Themes"),
        p("Our H1 2025 roadmap is focused on three strategic themes: AI-powered automation, enterprise scalability, and developer experience. These themes directly support our FY2025 revenue targets and our positioning against key competitors."),

        h1("Q1 2025 (Jan – Mar)"),
        h2("ACME AI Suite – Phase 1 (P0)"),
        p("Launch the inaugural ACME AI Suite with three core capabilities:"),
        b("Smart Summarization: Automatic meeting and document summaries using LLM integration."),
        b("Predictive Analytics Dashboard: ML-powered forecasting for pipeline and churn prediction."),
        b("AI-Assisted Workflows: Natural language workflow creation for non-technical users."),
        p("ETA: March 31, 2025. Team: 4 engineers, 1 PM, 1 designer. Dependency: Data pipeline upgrade (Q4 2024 complete ✓)."),

        h2("Enterprise SSO & SCIM 2.0 (P0)"),
        p("Full support for SAML 2.0, OAuth 2.0, and SCIM 2.0 for automated user provisioning/deprovisioning. Required to close 6 enterprise deals currently in late-stage negotiations. ETA: February 14, 2025."),

        h2("Mobile App v3.0 (P1)"),
        p("Complete redesign of the iOS and Android apps with offline mode, biometric authentication, and push notifications ETA: March 2025."),

        h1("Q2 2025 (Apr – Jun)"),
        h2("ACME AI Suite – Phase 2 (P0)"),
        b("Custom AI Model Training: Allow enterprise customers to fine-tune models on their own data."),
        b("AI Auditing & Compliance: Full audit trails for all AI-generated actions."),
        b("API for AI Suite: Public API enabling partners to build on ACME AI capabilities."),

        h2("Multi-Region Data Residency (P0)"),
        p("Support for EU (Frankfurt), APAC (Singapore), and US (Virginia) data residency. Required for EU and Singapore enterprise customers. Blocks over $8M in identified ARR."),

        h2("Advanced Reporting Engine (P1)"),
        p("Self-serve reporting with drag-and-drop report builder, custom metrics, scheduled exports, and white-label PDF reporting for customers."),

        h1("Deprioritized for H1 2025"),
        b("Native Zapier Integration — moved to H2 2025."),
        b("Desktop App (Electron) — moved to H2 2025."),
        b("Marketplace/Plugins — moved to FY2026."),
    ]
    build_pdf("acme_product_roadmap_h1_2025.pdf", elems)


# ──────────────────────────────────────────────
# 6. CUSTOMER SUPPORT PLAYBOOK
# ──────────────────────────────────────────────
def generate_support_playbook():
    elems = [
        p("ACME CORPORATION", meta_style),
        Paragraph("Customer Support Playbook", title_style),
        p("Customer Success Department | Version 5.0 | For Internal Use", meta_style),
        divider(), sp(),

        h1("1. Support Tiers & SLAs"),
        Table([
            ["Plan", "Hours", "P1 Response", "P2 Response", "P3 Response", "Dedicated CSM"],
            ["Standard", "Business hours", "4 hours", "8 hours", "48 hours", "No"],
            ["Professional", "Business hours", "2 hours", "4 hours", "24 hours", "Shared"],
            ["Enterprise", "24/7/365", "30 min", "2 hours", "8 hours", "Yes"],
            ["Strategic", "24/7/365", "15 min", "1 hour", "4 hours", "Dedicated"],
        ], colWidths=[3*cm, 3.5*cm, 2.5*cm, 2.5*cm, 2.5*cm, 3.5*cm],
        style=TableStyle([
            ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#16213E")),
            ("TEXTCOLOR", (0,0), (-1,0), colors.white),
            ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
            ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#F0F4FF")]),
            ("GRID", (0,0), (-1,-1), 0.5, colors.lightgrey),
            ("FONTSIZE", (0,0), (-1,-1), 9),
        ])),
        sp(),

        h1("2. Priority Definitions"),
        h2("P1 – Critical"),
        p("System is fully down or a core feature is completely unavailable affecting all or most users. Examples: login failure, data unavailability, complete API outage. All hands on deck. Incident commander must be assigned within 15 minutes."),

        h2("P2 – Major"),
        p("Significant feature impairment affecting a subset of users or a non-critical workflow. Examples: slow performance, reporting failures, integration errors. Engineering must acknowledge within SLA."),

        h2("P3 – Minor"),
        p("Minor inconvenience or cosmetic issues with available workarounds. Examples: UI glitches, non-critical notification failures, documentation clarifications."),

        h1("3. Handling Escalations"),
        b("Step 1: Support agent documents the issue fully in Zendesk with all reproduction steps."),
        b("Step 2: Agent attempts resolution using the internal Knowledge Base."),
        b("Step 3: If unresolved within 30 minutes, escalate to Tier 2 (Senior Support)."),
        b("Step 4: If Tier 2 cannot resolve within SLA, escalate to Engineering with full context."),
        b("Step 5: CSM notifies the customer proactively with an update, even if no resolution yet."),

        h1("4. Refund & Credit Policy"),
        p("Customers are eligible for service credits when ACME fails to meet its SLA commitments. Credits are calculated as:"),
        b("99.9% to 99.5% uptime: 10% monthly credit for affected service."),
        b("99.5% to 99.0% uptime: 25% monthly credit for affected service."),
        b("Below 99.0% uptime: 50% monthly credit for affected service."),
        p("Credits must be requested within 30 days of the incident. Maximum annual credit is capped at 25% of the annual contract value. Credits do not apply to incidents caused by customer action, force majeure, or scheduled maintenance."),

        h1("5. Customer Health Monitoring"),
        p("All accounts are assigned a health score (1-100) in Gainsight updated weekly. Accounts scoring below 50 are flagged as 'At Risk' and require a check-in call within 5 business days. CSMs review their portfolio dashboard every Monday morning."),
        b("Green (70-100): Healthy, monitor monthly."),
        b("Yellow (50-69): Watch, bi-weekly check-in."),
        b("Red (0-49): At risk, weekly executive engagement required."),
    ]
    build_pdf("acme_support_playbook_2025.pdf", elems)


# ──────────────────────────────────────────────
# 7. SALES PLAYBOOK
# ──────────────────────────────────────────────
def generate_sales_playbook():
    elems = [
        p("ACME CORPORATION", meta_style),
        Paragraph("Enterprise Sales Playbook 2025", title_style),
        p("Revenue Operations | Confidential | Version 3.0 | January 2025", meta_style),
        divider(), sp(),

        h1("1. Ideal Customer Profile (ICP)"),
        p("ACME's primary ICP is B2B technology companies with 200 to 5,000 employees in North America and Europe, having an annual IT budget exceeding $2M, operating in regulated industries (fintech, healthtech, legaltech), and actively growing their engineering teams."),

        h2("Negative ICP Signals"),
        b("Companies with fewer than 50 employees or under $500K ARR."),
        b("Non-technology-first businesses (traditional manufacturing, brick-and-mortar retail)."),
        b("Companies currently under bankruptcy protection or undergoing M&A disruption."),

        h1("2. The ACME Sales Methodology"),
        p("ACME follows the MEDDPICC qualification framework to drive consistent, high-quality pipeline."),
        b("M – Metrics: What is the quantified business impact of solving this problem?"),
        b("E – Economic Buyer: Are we engaged with the person who controls the budget?"),
        b("D – Decision Criteria: What does the customer require to make a purchase decision?"),
        b("D – Decision Process: What are the steps and stakeholders involved in approving?"),
        b("P – Paper Process: Legal, security, and procurement timelines."),
        b("I – Identify Pain: What is the compelling event driving urgency?"),
        b("C – Champions: Who is our internal advocate with influence and trust?"),
        b("C – Competition: Who are we competing against and what is our differentiation?"),

        h1("3. Pricing & Packaging"),
        Table([
            ["Tier", "Users", "Annual Price", "Key Features"],
            ["Starter", "Up to 25", "$18,000", "Core platform, email support, 99.9% SLA"],
            ["Professional", "Up to 200", "$54,000", "Starter + SSO, API access, phone support"],
            ["Enterprise", "Unlimited", "$120,000+", "Pro + Custom AI, dedicated CSM, 99.99% SLA"],
            ["Strategic", "Unlimited", "Custom", "Enterprise + custom dev, on-premise option"],
        ], colWidths=[3*cm, 2.5*cm, 3*cm, 9*cm],
        style=TableStyle([
            ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#16213E")),
            ("TEXTCOLOR", (0,0), (-1,0), colors.white),
            ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
            ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#F0F4FF")]),
            ("GRID", (0,0), (-1,-1), 0.5, colors.lightgrey),
            ("FONTSIZE", (0,0), (-1,-1), 9),
        ])),
        sp(),

        h2("Discount Authority"),
        b("AE (Account Executive): Up to 10% without approval."),
        b("Regional VP of Sales: Up to 20%."),
        b("CRO: Up to 30%."),
        b("Above 30%: Chief Executive Officer approval required."),
        p("Discounts must be justified in Salesforce with a valid business reason. Time-limited discounts (quarter-end) must not be promised to customers."),

        h1("4. Competitive Intelligence"),
        h2("vs. CompetitorX"),
        p("ACME wins on: data privacy (100% on-premise option), AI capabilities (proprietary models), and customer support (industry-leading NPS of 72). CompetitorX has stronger brand recognition and a larger partner ecosystem. Counter with total cost of ownership analysis and reference customers."),

        h2("vs. CompetitorY"),
        p("Price objections from CompetitorY deals should be countered with the ROI calculator. On average, ACME customers see a 312% ROI over 3 years. Request the customer's manual process costs to build a business case."),
    ]
    build_pdf("acme_sales_playbook_2025.pdf", elems)


# ──────────────────────────────────────────────
# 8. COMPLIANCE & PRIVACY POLICY
# ──────────────────────────────────────────────
def generate_compliance_policy():
    elems = [
        p("ACME CORPORATION", meta_style),
        Paragraph("Data Privacy & Compliance Policy", title_style),
        p("Legal & Compliance | Classification: Internal | Version 2.1 | Updated Aug 2024", meta_style),
        divider(), sp(),

        h1("1. Overview"),
        p("ACME Corporation is committed to protecting the privacy and security of all personal data we collect and process. This policy documents our compliance posture across GDPR, CCPA, SOC 2 Type II, and ISO 27001 frameworks."),

        h1("2. Data We Collect"),
        h2("Customer Data"),
        p("We collect and process: contact information (name, email, phone), account and payment information, usage and activity logs, and support ticket history. This data is used solely for providing and improving the ACME platform."),

        h2("Employee Data"),
        p("For employees, we collect: identity documents, tax information, employment history, payroll data, performance reviews, and access logs. This data is retained for the duration of employment plus 7 years as required by law."),

        h1("3. Data Retention Schedule"),
        Table([
            ["Data Type", "Retention Period", "Disposal Method"],
            ["Customer Account Data", "Lifetime of contract + 3 years", "Secure deletion"],
            ["Usage Logs & Analytics", "24 months", "Automated purge"],
            ["Support Tickets", "5 years", "Anonymization then archive"],
            ["Financial Records", "7 years (tax law)", "Secure archival"],
            ["Employee Records", "7 years post-employment", "Shredding + digital wipe"],
            ["Security Audit Logs", "12 months", "Automated purge"],
        ], colWidths=[5*cm, 5.5*cm, 7*cm],
        style=TableStyle([
            ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#16213E")),
            ("TEXTCOLOR", (0,0), (-1,0), colors.white),
            ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
            ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#F0F4FF")]),
            ("GRID", (0,0), (-1,-1), 0.5, colors.lightgrey),
            ("FONTSIZE", (0,0), (-1,-1), 9),
        ])),
        sp(),

        h1("4. GDPR Compliance"),
        p("For customers in the European Economic Area, ACME acts as a Data Processor under the GDPR. Our customers remain the Data Controller for their end-user data. We maintain a signed Data Processing Agreement (DPA) with all EU customers."),
        b("Legal basis for processing: Contractual necessity (Article 6(1)(b))."),
        b("Data Subject Rights: We respond to access/deletion requests within 30 days."),
        b("Data Transfers: EU data remains within EU (Frankfurt AWS region) by default."),
        b("Breach Notification: We notify affected customers within 72 hours of discovery."),

        h1("5. SOC 2 Type II"),
        p("ACME maintains SOC 2 Type II certification covering Security, Availability, and Confidentiality Trust Service Criteria. Our most recent audit was completed in September 2024 with zero exceptions. The audit report is available to enterprise customers under NDA upon request."),

        h1("6. Incident Reporting"),
        p("Any potential data breach or privacy incident must be reported immediately to privacy@acmecorp.com and the CISO. Do not attempt to investigate independently. The legal team will determine notification obligations within 24 hours."),

        h1("7. Third-Party Sub-Processors"),
        b("Amazon Web Services (AWS): Primary cloud infrastructure — US, EU, APAC."),
        b("Stripe: Payment processing — PCI DSS Level 1 certified."),
        b("Zendesk: Customer support ticketing — SOC 2 Type II certified."),
        b("Workday: HR and payroll — SOC 2 Type II certified."),
        b("Snowflake: Analytics data warehouse — SOC 2 Type II certified."),
        p("A full list of sub-processors is available at acmecorp.com/legal/subprocessors."),
    ]
    build_pdf("acme_data_privacy_compliance_2024.pdf", elems)


# ──────────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────────
if __name__ == "__main__":
    print("Generating ACME Corp mock PDF documents...\n")
    generate_employee_handbook()
    generate_financial_report()
    generate_it_security_policy()
    generate_hiring_guide()
    generate_product_roadmap()
    generate_support_playbook()
    generate_sales_playbook()
    generate_compliance_policy()
    print(f"\n✅ All 8 documents generated in: ./{OUTPUT_DIR}/")
    print("\nDocuments:")
    for f in sorted(os.listdir(OUTPUT_DIR)):
        size = os.path.getsize(os.path.join(OUTPUT_DIR, f)) // 1024
        print(f"  • {f} ({size} KB)")
