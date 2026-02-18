import os
import json
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ==============================
# CONFIG
# ==============================
SIMILARITY_THRESHOLD = 0.3

# ==============================
# SKILL ALIASES
# ==============================
SKILL_ALIASES = {
    "machine learning": ["ml"],
    "artificial intelligence": ["ai"],
    "natural language processing": ["nlp"],
    "deep learning": ["dl"],
}

# ==============================
# LOAD SKILLS DATABASE
# ==============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SKILLS_PATH = os.path.join(BASE_DIR, "skills.json")

with open(SKILLS_PATH, "r", encoding="utf-8") as f:
    SKILL_DB = json.load(f)

# ==============================
# HELPERS
# ==============================
def normalize(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9+.# ]", " ", text)
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
# MAIN ANALYSIS FUNCTION
# ==============================
def analyze_skills(resume_text: str, jd_text: str):

    resume_text_norm = normalize(resume_text)
    jd_text_norm = normalize(jd_text)

    required_skills = extract_required_skills(jd_text)

    if not required_skills:
        return {
            "matched_skills": [],
            "missing_skills": [],
            "match_percentage": 0,
            "candidate_email": extract_email(resume_text),
        }

    matched = []
    missing = []

    # ==============================
    # TF-IDF SETUP (LIGHTWEIGHT)
    # ==============================
    vectorizer = TfidfVectorizer(ngram_range=(1, 2))
    corpus = [resume_text_norm] + [skill.lower() for skill in required_skills]
    vectors = vectorizer.fit_transform(corpus)

    resume_vector = vectors[0]
    skill_vectors = vectors[1:]

    similarities = cosine_similarity(skill_vectors, resume_vector)

    for idx, skill in enumerate(required_skills):
        skill_lower = skill.lower()

        # ==========================
        # 1️⃣ DIRECT EXACT MATCH
        # ==========================
        if re.search(r"\b" + re.escape(skill_lower) + r"\b", resume_text_norm):
            matched.append(skill)
            continue

        # ==========================
        # 2️⃣ ALIAS MATCH
        # ==========================
        if skill_lower in SKILL_ALIASES:
            if any(
                re.search(r"\b" + re.escape(alias) + r"\b", resume_text_norm)
                for alias in SKILL_ALIASES[skill_lower]
            ):
                matched.append(skill)
                continue

        # ==========================
        # 3️⃣ SEMANTIC FALLBACK (TF-IDF)
        # ==========================
        if similarities[idx][0] >= SIMILARITY_THRESHOLD:
            matched.append(skill)
        else:
            missing.append(skill)

    match_percentage = round(
        (len(matched) / len(required_skills)) * 100, 2
    )

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "match_percentage": match_percentage,
        "candidate_email": extract_email(resume_text),
    }
