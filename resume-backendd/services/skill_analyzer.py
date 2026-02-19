import os
import json
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

SIMILARITY_THRESHOLD = 0.3

SKILL_ALIASES = {
    "machine learning": ["ml"],
    "artificial intelligence": ["ai"],
    "natural language processing": ["nlp"],
    "deep learning": ["dl"],
}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SKILLS_PATH = os.path.join(BASE_DIR, "skills.json")

with open(SKILLS_PATH, "r", encoding="utf-8") as f:
    SKILL_DB = json.load(f)


# ==============================
# HELPERS
# ==============================
def normalize(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9+.#% ]", " ", text)
    return text


def extract_email(text: str):
    pattern = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
    match = re.search(pattern, text)
    return match.group(0) if match else None


def extract_required_skills(jd_text: str):
    jd_text = normalize(jd_text)
    required = []

    for skill in SKILL_DB:
        pattern = r"\b" + re.escape(skill.lower()) + r"\b"
        if re.search(pattern, jd_text):
            required.append(skill)

    return list(set(required))


# ==============================
# ATS SCORING SYSTEM
# ==============================
def ats_score(resume_text, jd_skills):
    resume_text_norm = normalize(resume_text)

    # 1️⃣ Keyword Score (30)
    matched = sum(
        1 for skill in jd_skills
        if re.search(r"\b" + re.escape(skill.lower()) + r"\b", resume_text_norm)
    )
    keyword_score = (matched / len(jd_skills)) * 30 if jd_skills else 0

    # 2️⃣ Section Structure (20)
    sections = ["education", "experience", "skills", "projects", "certifications"]
    found_sections = sum(1 for s in sections if s in resume_text_norm)
    structure_score = (found_sections / len(sections)) * 20

    # 3️⃣ Measurable Achievements (20)
    numbers = len(re.findall(r"\d+%|\d+", resume_text_norm))
    if numbers > 10:
        measurable_score = 20
    elif numbers > 5:
        measurable_score = 15
    elif numbers > 2:
        measurable_score = 10
    else:
        measurable_score = 5

    # 4️⃣ Formatting Simplicity (15)
    symbols = len(re.findall(r"[^\w\s.,%-]", resume_text))
    if symbols > 200:
        formatting_score = 5
    elif symbols > 100:
        formatting_score = 10
    else:
        formatting_score = 15

    # 5️⃣ Readability (15)
    sentences = resume_text.split(".")
    avg_len = (
        sum(len(s.split()) for s in sentences) / max(len(sentences), 1)
    )
    if avg_len < 20:
        readability_score = 15
    elif avg_len < 30:
        readability_score = 10
    else:
        readability_score = 5

    total = round(
        keyword_score
        + structure_score
        + measurable_score
        + formatting_score
        + readability_score
    )

    return {
        "ats_score": total,
        "ats_breakdown": {
            "keywords": round(keyword_score, 2),
            "structure": round(structure_score, 2),
            "measurable": measurable_score,
            "formatting": formatting_score,
            "readability": readability_score,
        },
    }


# ==============================
# MAIN ANALYSIS FUNCTION
# ==============================
def analyze_skills(resume_text: str, jd_text: str):

    resume_text_norm = normalize(resume_text)
    required_skills = extract_required_skills(jd_text)

    if not required_skills:
        return {
            "matched_skills": [],
            "missing_skills": [],
            "match_percentage": 0,
            "candidate_email": extract_email(resume_text),
            "ats_score": 0,
            "ats_breakdown": {},
        }

    matched = []
    missing = []

    vectorizer = TfidfVectorizer(ngram_range=(1, 2))
    corpus = [resume_text_norm] + [skill.lower() for skill in required_skills]
    vectors = vectorizer.fit_transform(corpus)

    resume_vector = vectors[0]
    skill_vectors = vectors[1:]
    similarities = cosine_similarity(skill_vectors, resume_vector)

    for idx, skill in enumerate(required_skills):
        skill_lower = skill.lower()

        if re.search(r"\b" + re.escape(skill_lower) + r"\b", resume_text_norm):
            matched.append(skill)
            continue

        if skill_lower in SKILL_ALIASES:
            if any(
                re.search(r"\b" + re.escape(alias) + r"\b", resume_text_norm)
                for alias in SKILL_ALIASES[skill_lower]
            ):
                matched.append(skill)
                continue

        if similarities[idx][0] >= SIMILARITY_THRESHOLD:
            matched.append(skill)
        else:
            missing.append(skill)

    match_percentage = round(
        (len(matched) / len(required_skills)) * 100, 2
    )

    # 🔥 ATS CALCULATION
    ats_results = ats_score(resume_text, required_skills)

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "match_percentage": match_percentage,
        "candidate_email": extract_email(resume_text),
        "ats_score": ats_results["ats_score"],
        "ats_breakdown": ats_results["ats_breakdown"],
    }
