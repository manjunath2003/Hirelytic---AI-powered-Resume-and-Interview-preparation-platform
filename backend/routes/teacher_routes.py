from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from backend.extensions import mongo
from datetime import datetime, timedelta

teacher_bp = Blueprint("teacher", __name__)

# --- 📊 ANALYTICS ROUTE ---
@teacher_bp.route("/analytics-summary", methods=["GET"])
@jwt_required()
def get_analytics_summary():
    try:
        user_id = get_jwt_identity()  # STRING ID (matches DB)

        # 1. JOB FUNNEL
        jobs_avail = mongo.db.jobs.count_documents({})

        jobs_applied = mongo.db.applications.count_documents({
            "user_id": user_id
        })

        jobs_shortlisted = mongo.db.applications.count_documents({
            "user_id": user_id,
            "status": "shortlisted"
        })

        interviews_attended = mongo.db.applications.count_documents({
            "user_id": user_id,
            "status": "interview_scheduled"
        })

        # 2. RESUME STATS  ✅ FIXED
        res_generated = mongo.db.resumes.count_documents({
            "user_id": user_id
        })

        res_downloaded = mongo.db.resume_downloads.count_documents({
            "user_id": user_id
        })

        # 3. SCORES
        latest_skill = mongo.db.teacher_skill_tests.find_one(
            {"user_id": user_id}
        )

        skill_score = (
            latest_skill.get("latest", {}).get("final_score", 0)
            if latest_skill else 0
        )

        latest_resume = mongo.db.resumes.find_one(
            {"user_id": user_id},
            sort=[("created_at", -1)]
        )

        resume_score = (
            latest_resume.get("resume_score")
            or latest_resume.get("strength", 0)
            if latest_resume else 0
        )

        # 4. ACTIVITY GRAPH
        activity_data = []
        for i in range(5, -1, -1):
            date_threshold = datetime.now() - timedelta(days=i * 30)
            month_name = date_threshold.strftime("%b")

            count = mongo.db.applications.count_documents({
                "user_id": user_id,
                "applied_at": {
                    "$gte": date_threshold.replace(day=1)
                }
            })

            activity_data.append({
                "name": month_name,
                "value": count
            })

        return jsonify({
            "resumeScore": resume_score,
            "resumesGenerated": res_generated,
            "resumesDownloaded": res_downloaded,
            "jobsAvailable": jobs_avail,
            "jobsApplied": jobs_applied,
            "jobsShortlisted": jobs_shortlisted,
            "interviewsAttended": interviews_attended,
            "interviewPrep": 70,
            "skillScore": skill_score,
            "activityData": activity_data
        }), 200

    except Exception as e:
        print(f"Analytics Error: {e}")
        return jsonify({"error": "Failed to fetch analytics"}), 500


# --- 👤 PROFILE ROUTES (UNCHANGED & CORRECT) ---
@teacher_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = mongo.db.users.find_one(
        {"_id": ObjectId(user_id)},
        {"password": 0}
    )
    if not user:
        return jsonify({"error": "User not found"}), 404

    user["_id"] = str(user["_id"])
    return jsonify({"profile": user})


@teacher_bp.route("/update-profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.get_json()

    mongo.db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": data}
    )

    return jsonify({"message": "Profile updated successfully!"})
