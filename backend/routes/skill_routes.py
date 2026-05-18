from flask import Blueprint, request, jsonify
from backend.extensions import mongo
from datetime import datetime
from backend.questions.skill_questions import questions

skill_bp = Blueprint("skill_bp", __name__)

# -----------------------------------------------------------
# CATEGORY WEIGHTS (if needed later)
# -----------------------------------------------------------
CATEGORY_WEIGHTS = {
    "communication": 20,
    "subject_knowledge": 20,
    "classroom_management": 20,
    "pedagogy": 20,
    "digital_literacy": 10,
    "psychology": 10
}

# -----------------------------------------------------------
# 1) SEND QUESTIONS TO FRONTEND
# -----------------------------------------------------------
@skill_bp.route("/questions", methods=["GET"])
def get_skill_questions():
    return jsonify({"questions": questions}), 200


# -----------------------------------------------------------
# 2) SUBMIT TEST ANSWERS (STORE RESULT IN DB)
# -----------------------------------------------------------
@skill_bp.route("/submit/<user_id>", methods=["POST"])
def submit_skill_test(user_id):
    try:
        data = request.json
        answers = data.get("answers", {})

        total = len(questions)
        correct = 0

        category_scores = {}

        for q in questions:
            qid = q["id"]
            cat = q["category"]

            if cat not in category_scores:
                category_scores[cat] = {"correct": 0, "total": 0}

            category_scores[cat]["total"] += 1

            if answers.get(qid) == q["correct"]:
                correct += 1
                category_scores[cat]["correct"] += 1

        # Final Score
        final_score = round((correct / total) * 100)

        # Weak Categories (<60%)
        weak_categories = []
        for cat, sc in category_scores.items():
            percent = (sc["correct"] / sc["total"]) * 100
            if percent < 60:
                weak_categories.append(cat)

        # -----------------------------------------
        # STORE IN skill_results COLLECTION
        # -----------------------------------------
        record = {
            "user_id": user_id,
            "answers": answers,
            "final_score": final_score,
            "category_scores": {
                cat: {
                    "correct": sc["correct"],
                    "total": sc["total"],
                    "percent": round((sc["correct"] / sc["total"]) * 100),
                }
                for cat, sc in category_scores.items()
            },
            "weak_categories": weak_categories,
            "submitted_at": datetime.utcnow(),
        }

        mongo.db.skill_results.insert_one(record)

        # -------------------------------------------------
        # ✅ ADDED: DASHBOARD REAL-TIME SKILL SCORE SOURCE
        # -------------------------------------------------
        mongo.db.skill_reports.insert_one({
            "user_id": user_id,
            "final_score": final_score,
            "created_at": datetime.utcnow()
        })

        # ALSO STORE HISTORY (teacher_skill_tests)
        doc = mongo.db.teacher_skill_tests.find_one({"user_id": user_id})

        attempt_entry = {
            "final_score": final_score,
            "weak_categories": weak_categories,
            "answers": answers,
            "category_scores": record["category_scores"],
            "submitted_at": datetime.utcnow(),
        }

        if not doc:
            mongo.db.teacher_skill_tests.insert_one({
                "user_id": user_id,
                "latest": attempt_entry,
                "attempts": [attempt_entry]
            })
        else:
            mongo.db.teacher_skill_tests.update_one(
                {"user_id": user_id},
                {
                    "$set": {"latest": attempt_entry},
                    "$push": {"attempts": attempt_entry}
                }
            )

        return jsonify({
            "message": "Test submitted successfully",
            "final_score": final_score,
            "weak_categories": weak_categories,
            "category_scores": record["category_scores"]
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -----------------------------------------------------------
# 3) GET LATEST SKILL REPORT
# -----------------------------------------------------------
@skill_bp.route("/report/<user_id>", methods=["GET"])
def get_latest_report(user_id):
    try:
        doc = mongo.db.teacher_skill_tests.find_one({"user_id": user_id})

        if not doc or "latest" not in doc:
            return jsonify({"error": "No test found"}), 404

        latest = doc["latest"]
        latest["submitted_at"] = latest["submitted_at"].isoformat()

        return jsonify(latest), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -----------------------------------------------------------
# 4) GET FULL SKILL TEST HISTORY
# -----------------------------------------------------------
@skill_bp.route("/history/<user_id>", methods=["GET"])
def get_test_history(user_id):
    try:
        doc = mongo.db.teacher_skill_tests.find_one({"user_id": user_id})

        if not doc:
            return jsonify({"error": "No history found"}), 404

        for attempt in doc["attempts"]:
            attempt["submitted_at"] = attempt["submitted_at"].isoformat()

        return jsonify(doc["attempts"]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
