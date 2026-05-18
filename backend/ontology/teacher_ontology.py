# backend/ontology/teacher_ontology.py
# Research-backed ontology module for Hirelytic (Updated & Optimized)

import re

# ----------------------------------------------------------
# Unified Normalization Helper
# ----------------------------------------------------------

def normalize(text: str):
    """Normalize text for matching."""
    if not text:
        return ""
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9 +]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text


# ----------------------------------------------------------
# Teacher Subject Ontology (expanded & cleaned)
# ----------------------------------------------------------

SUBJECT_SYNONYMS = {
    "maths": "mathematics",
    "math": "mathematics",
    "science teacher": "science",
    "social": "social science",
    "social studies": "social science",
    "cs": "computer science",
    "it": "computer science",
    "ict": "computer science",
}

TEACHER_SUBJECTS = {
    "mathematics": "Mathematics",
    "science": "Science",
    "physics": "Physics",
    "chemistry": "Chemistry",
    "biology": "Biology",
    "english": "English",
    "kannada": "Kannada",
    "hindi": "Hindi",
    "geography": "Geography",
    "history": "History",
    "civics": "Civics",
    "social science": "Social Science",
    "computer science": "Computer Science",
}


# ----------------------------------------------------------
# Certifications Ontology (expanded for India)
# ----------------------------------------------------------

TEACHER_CERTIFICATIONS = {
    "b.ed": "B.Ed",
    "bed": "B.Ed",
    "bachelor of education": "B.Ed",

    "m.ed": "M.Ed",
    "med": "M.Ed",

    "d.ed": "D.Ed",
    "d.el.ed": "D.El.Ed",

    "ctet": "CTET",
    "ctet paper 1": "CTET Paper 1",
    "ctet paper 2": "CTET Paper 2",

    "tet": "TET",
    "kartet": "KARTET",
    "uptet": "UPTET",
    "ktet": "KTET",
    "aptet": "APTET",

    "kset": "KSET",
    "net": "NET",
}

# ----------------------------------------------------------
# Degree Ontology (expanded)
# ----------------------------------------------------------

TEACHER_DEGREES = {
    "b.ed": "B.Ed",
    "m.ed": "M.Ed",
    "d.el.ed": "D.El.Ed",
    "d.ed": "D.Ed",
    "b.sc": "B.Sc",
    "m.sc": "M.Sc",
    "b.a": "B.A",
    "m.a": "M.A",
    "phd": "PhD",
    "ba b.ed": "BA + B.Ed Integrated",
    "bsc bed": "B.Sc + B.Ed Integrated",
}

# ----------------------------------------------------------
# Grade-Level Ontology
# ----------------------------------------------------------

GRADE_LEVELS = {
    "primary": "Primary (1–5)",
    "elementary": "Primary (1–5)",
    "middle school": "Middle (6–8)",
    "upper primary": "Middle (6–8)",
    "secondary": "Secondary (9–10)",
    "high school": "Secondary (9–10)",
    "higher secondary": "Higher Secondary (11–12)",
    "puc": "Higher Secondary (11–12)",
    "pre-university": "Higher Secondary (11–12)",
}


# ----------------------------------------------------------
# Experience Extractor
# ----------------------------------------------------------

def extract_experience_years(text):
    if not text:
        return None
    text = normalize(text)
    match = re.search(r"(\d{1,2})\s*(years|year|yrs|yr)", text)
    return int(match.group(1)) if match else None


# ----------------------------------------------------------
# Skill Heuristics
# ----------------------------------------------------------

def extract_skills(text):
    if not text:
        return []

    skills = []

    skill_patterns = [
        r"classroom management",
        r"lesson planning",
        r"curriculum development",
        r"communication",
        r"student engagement",
        r"assessment",
        r"technology integration",
        r"teaching aids",
        r"online teaching",
        r"behavior management",
    ]

    for sp in skill_patterns:
        if re.search(sp, text.lower()):
            skills.append(sp.title())

    # comma-separated lists
    if "," in text:
        items = [i.strip() for i in text.split(",")]
        skills.extend([i for i in items if len(i) > 2])

    skills.append(text.strip())
    return list(dict.fromkeys(skills))


# ----------------------------------------------------------
# Main Ontology Mapping Function
# ----------------------------------------------------------

def map_teacher_ontology(ner_sections: dict):
    """
    ner_sections = {
        "education": [...],
        "experience": [...],
        "skills": [...],
        "certifications": [...],
        "personal": [...]
    }
    """

    mapped = {
        "subjects": [],
        "certifications": [],
        "degrees": [],
        "grade_levels": [],
        "experience_years": None,
        "skills": [],
    }

    for section, entities in ner_sections.items():
        for ent in entities:
            raw = ent.get("text", "")
            norm = normalize(raw)

            # --------------------------------------
            # SUBJECT MAPPING
            # --------------------------------------
            for key, canonical in SUBJECT_SYNONYMS.items():
                if key in norm and canonical not in mapped["subjects"]:
                    mapped["subjects"].append(TEACHER_SUBJECTS[canonical])

            for key, canonical in TEACHER_SUBJECTS.items():
                if key in norm and canonical not in mapped["subjects"]:
                    mapped["subjects"].append(canonical)

            # --------------------------------------
            # CERTIFICATION MAPPING
            # --------------------------------------
            for key, canonical in TEACHER_CERTIFICATIONS.items():
                if key in norm and canonical not in mapped["certifications"]:
                    mapped["certifications"].append(canonical)

            # --------------------------------------
            # DEGREE MAPPING
            # --------------------------------------
            for key, canonical in TEACHER_DEGREES.items():
                if key in norm and canonical not in mapped["degrees"]:
                    mapped["degrees"].append(canonical)

            # --------------------------------------
            # GRADE LEVEL
            # --------------------------------------
            for key, canonical in GRADE_LEVELS.items():
                if key in norm and canonical not in mapped["grade_levels"]:
                    mapped["grade_levels"].append(canonical)

            # --------------------------------------
            # EXPERIENCE
            # --------------------------------------
            years = extract_experience_years(raw)
            if years and (mapped["experience_years"] is None or years > mapped["experience_years"]):
                mapped["experience_years"] = years

            # --------------------------------------
            # SKILLS
            # --------------------------------------
            if section == "skills":
                mapped["skills"].extend(extract_skills(raw))

    # Deduplicate
    mapped["subjects"] = list(dict.fromkeys(mapped["subjects"]))
    mapped["certifications"] = list(dict.fromkeys(mapped["certifications"]))
    mapped["degrees"] = list(dict.fromkeys(mapped["degrees"]))
    mapped["grade_levels"] = list(dict.fromkeys(mapped["grade_levels"]))
    mapped["skills"] = list(dict.fromkeys(mapped["skills"]))

    return mapped
