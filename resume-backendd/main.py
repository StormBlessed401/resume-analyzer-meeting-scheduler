from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re
import io
import PyPDF2

from services.skill_analyzer import analyze_skills

app = FastAPI()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# ==============================
# CORS (Allow frontend connection)
# ==============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# REQUEST MODEL (for Swagger JSON testing)
# ==============================
class AnalyzeRequest(BaseModel):
    resume: str
    jd: str


# ==============================
# EMAIL EXTRACTOR
# ==============================
def extract_email(text: str):
    match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    return match.group(0) if match else None


# ==============================
# PDF TEXT EXTRACTION
# ==============================
def extract_text_from_pdf(file: UploadFile):
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(file.file.read()))
    text = ""
    for page in pdf_reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted
    return text


# ==============================
# JSON ENDPOINT (Swagger testing)
# ==============================
@app.post("/analyze")
def analyze(request: AnalyzeRequest):

    result = analyze_skills(request.resume, request.jd)
    email = extract_email(request.resume)

    return {
        "matched_skills": result["matched_skills"],
        "missing_skills": result["missing_skills"],
        "match_percentage": result["match_percentage"],
        "candidate_email": email,
        "ats_score": result["ats_score"],
        "ats_breakdown": result["ats_breakdown"],
    }


# ==============================
# PDF ENDPOINT (Frontend use)
# ==============================
@app.post("/analyze-pdf")
async def analyze_pdf(
    file: UploadFile = File(...),
    jd: str = Form(...)
):
    resume_text = extract_text_from_pdf(file)

    # DEBUG — check these in your terminal
    print("=== RESUME TEXT LENGTH ===", len(resume_text))
    print("=== RESUME TEXT SAMPLE ===", resume_text[:300])

    result = analyze_skills(resume_text, jd)

    print("=== ATS RESULT ===", result["ats_score"])
    print("=== ATS BREAKDOWN ===", result["ats_breakdown"])

    email = extract_email(resume_text)

    return {
        "matched_skills": result["matched_skills"],
        "missing_skills": result["missing_skills"],
        "match_percentage": result["match_percentage"],
        "candidate_email": email,
        "ats_score": result["ats_score"],
        "ats_breakdown": result["ats_breakdown"],
    }
