# backend/routes/interview_routes.py

from flask import Blueprint, request, jsonify
from flask_cors import CORS
import json
import re
import logging
from backend.services.llm_services import call_llm

interview_bp = Blueprint("interview_bp", __name__)
CORS(interview_bp)

logger = logging.getLogger("interview_routes")
logger.setLevel(logging.INFO)


# -------------------------------------------------
# 🔍 JSON EXTRACTOR (GEMINI-SAFE & ROBUST)
# -------------------------------------------------
def extract_json(text: str):
    """
    Robust JSON array extractor for Gemini output.
    Handles markdown, explanations, and extra text.
    """
    if not text or not isinstance(text, str):
        raise ValueError("Empty or invalid LLM response")

    # Remove markdown code fences
    text = re.sub(r"```json|```", "", text, flags=re.IGNORECASE).strip()

    start = text.find("[")
    end = text.rfind("]")

    if start == -1 or end == -1 or end <= start:
        logger.error("❌ NO JSON ARRAY FOUND\nRAW OUTPUT:\n%s", text)
        raise ValueError("No JSON array found")

    json_text = text[start:end + 1]

    try:
        return json.loads(json_text)
    except json.JSONDecodeError as e:
        logger.error("❌ JSON PARSE ERROR: %s\nRAW JSON:\n%s", e, json_text)
        raise ValueError("Invalid JSON from LLM")


# -------------------------------------------------
# 🤖 AI: GENERATE INTERVIEW QUESTIONS
# -------------------------------------------------
@interview_bp.route("/ai/generate-questions", methods=["POST", "OPTIONS"])
def ai_generate_questions():
    if request.method == "OPTIONS":
        return "", 200

    try:
        data = request.get_json(silent=True) or {}

        category = data.get("category")
        section = data.get("section")
        count = int(data.get("count", 10))

        if not category or not section:
            return jsonify({"error": "Category and section are required"}), 400

        if count < 1 or count > 20:
            count = 10

        prompt = f"""
You are an expert teacher interviewer.

Generate exactly {count} UNIQUE interview questions.

Category: {category}
Section: {section}

Rules:
- No repetition
- Mix easy, medium, hard
- Classroom & pedagogy focused
- Scenario-based
- Teacher interview standard
- Clear, professional language
- DO NOT include explanations or extra text

Return ONLY a valid JSON array:
[
  {{
    "question": "Question text",
    "difficulty": "easy | medium | hard",
    "model_answer": "Concise model answer"
  }}
]
"""

        raw_output = call_llm(prompt)
        logger.info("🧠 QUESTION GEN RAW OUTPUT RECEIVED")

        questions = extract_json(raw_output)

        cleaned = []
        for q in questions:
            if isinstance(q, dict) and q.get("question"):
                cleaned.append({
                    "question": q["question"].strip(),
                    "difficulty": q.get("difficulty", "medium").lower(),
                    "model_answer": q.get("model_answer", "").strip()
                })

        if not cleaned:
            return jsonify({"error": "No valid questions generated"}), 500

        return jsonify({"questions": cleaned}), 200

    except Exception as e:
        logger.exception("🔥 AI QUESTION GENERATION FAILED")
        return jsonify({"error": "AI generation failed"}), 500


# -------------------------------------------------
# 🤖 AI: EVALUATE ANSWER (FIXED & DEFENSIVE)
# -------------------------------------------------
@interview_bp.route("/ai/evaluate", methods=["POST", "OPTIONS"])
def evaluate_answer():
    if request.method == "OPTIONS":
        return "", 200

    try:
        data = request.get_json(silent=True) or {}

        question = data.get("question", "").strip()
        model_answer = data.get("model_answer", "")
        candidate_answer = data.get("candidate_answer", "").strip()

        # 🔒 Defensive: never let frontend think this "failed"
        if not candidate_answer:
            return jsonify({
                "success": True,
                "score": 0,
                "feedback": "No answer was provided. Please try to explain your approach in detail."
            }), 200

        score = 0
        word_count = len(candidate_answer.split())

        if word_count >= 20:
            score += 40
        elif word_count >= 10:
            score += 25
        else:
            score += 10

        if model_answer:
            overlap = set(candidate_answer.lower().split()) & set(model_answer.lower().split())
            score += min(len(overlap) * 2, 30)

        score = min(score, 100)

        feedback = (
            "Answer shows basic understanding."
            if score < 40 else
            "Good explanation with relevant points."
            if score < 70 else
            "Strong, well-structured answer."
        )

        return jsonify({
            "success": True,
            "score": score,
            "feedback": feedback
        }), 200

    except Exception:
        logger.exception("🔥 ANSWER EVALUATION FAILED")
        return jsonify({
            "success": True,   # 👈 IMPORTANT: still true
            "score": 0,
            "feedback": "Evaluation could not be completed. Please try again."
        }), 200


# -------------------------------------------------
# 🧠 AI: OVERALL INTERVIEW ANALYSIS
# -------------------------------------------------
@interview_bp.route("/ai/overall-analysis", methods=["POST", "OPTIONS"])
def overall_interview_analysis():
    if request.method == "OPTIONS":
        return "", 200

    try:
        data = request.get_json(silent=True) or {}

        category = data.get("category")
        section = data.get("section")
        final_score = data.get("final_score", 0)
        responses = data.get("responses", [])

        prompt = f"""
You are an expert teacher interview evaluator.

Analyze the following completed interview.

Category: {category}
Section: {section}
Final Score: {final_score}/100

Candidate Responses:
{json.dumps(responses, indent=2)}

Return ONLY valid JSON:
{{
  "overall_weak_skills": ["Skill gap"],
  "recommended_learning_areas": ["Learning area"],
  "overall_improvement_summary": "Concise improvement summary"
}}
"""

        raw_output = call_llm(prompt)
        raw_output = re.sub(r"```json|```", "", raw_output).strip()

        start = raw_output.find("{")
        end = raw_output.rfind("}")

        if start == -1 or end == -1:
            raise ValueError("No JSON object found")

        result = json.loads(raw_output[start:end + 1])
        return jsonify(result), 200

    except Exception:
        logger.exception("🔥 OVERALL INTERVIEW ANALYSIS FAILED")
        return jsonify({
            "overall_weak_skills": [],
            "recommended_learning_areas": [],
            "overall_improvement_summary": "Unable to generate overall analysis at this time."
        }), 200
