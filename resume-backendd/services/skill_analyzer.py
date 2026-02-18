import os
import json
import re
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# ==============================
# LOAD MODEL (only once)
# ==============================
model = SentenceTransformer("all-MiniLM-L6-v2")

SIMILARITY_THRESHOLD = 0.4

# ==============================
# SKILL ALIASES
# ==============================
SKILL_ALIASES = {
    "machine learning": ["ml"],
    "artificial intelligence": ["ai"],
    "natural language processing": ["nlp"],
    "deep learning": ["dl"]
}

# ==============================
# LOAD SKILLS DATABASE
# ==============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SKILLS_PATH = os.path.join(BASE_DIR, "skills.json")

with open(SKILLS_PATH, "r", encoding="utf-8") as f:
    SKILL_DB = json.load(f)


# ==============================
# EXTRACT REQUIRED SKILLS FROM JD
# ==============================
def extract_required_skills(jd_text: str):
    jd_text = jd_text.lower()
    required = []

    for skill in SKILL_DB:
        skill_lower = skill.lower()
        pattern = r"\b" + re.escape(skill_lower) + r"\b"
        if re.search(pattern, jd_text):
            required.append(skill)

    return list(set(required))


# ==============================
# EXTRACT EMAIL FROM RESUME
# ==============================
def extract_email(text: str):
    pattern = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
    match = re.search(pattern, text)
    return match.group(0) if match else None


# ==============================
# MAIN ANALYSIS FUNCTION
# ==============================
def analyze_skills(resume_text: str, jd_text: str):

    resume_lower = resume_text.lower()
    required_skills = extract_required_skills(jd_text)

    if not required_skills:
        return {
            "matched_skills": [],
            "missing_skills": [],
            "match_percentage": 0,
            "candidate_email": extract_email(resume_text),  # still extract email even if no skills
        }

    resume_embedding = model.encode([resume_text])

    matched = []
    missing = []

    for skill in required_skills:
        skill_lower = skill.lower()

        # ==========================
        # 1️⃣ DIRECT EXACT MATCH
        # ==========================
        pattern = r"\b" + re.escape(skill_lower) + r"\b"
        if re.search(pattern, resume_lower):
            matched.append(skill)
            continue

        # ==========================
        # 2️⃣ ALIAS MATCH
        # ==========================
        if skill_lower in SKILL_ALIASES:
            alias_found = False
            for alias in SKILL_ALIASES[skill_lower]:
                alias_pattern = r"\b" + re.escape(alias) + r"\b"
                if re.search(alias_pattern, resume_lower):
                    matched.append(skill)
                    alias_found = True
                    break
            if alias_found:
                continue

        # ==========================
        # 3️⃣ SEMANTIC SIMILARITY FALLBACK
        # ==========================
        skill_embedding = model.encode([skill])
        similarity = cosine_similarity(skill_embedding, resume_embedding)[0][0]

        if similarity >= SIMILARITY_THRESHOLD:
            matched.append(skill)
        else:
            missing.append(skill)

    match_percentage = round(
        (len(matched) / len(required_skills)) * 100,
        2
    )

    email = extract_email(resume_text)

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "match_percentage": match_percentage,  # ← missing comma was here
        "candidate_email": email,
    }