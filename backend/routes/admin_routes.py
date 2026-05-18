from flask import Blueprint, jsonify, request
from backend.extensions import mongo
from bson import ObjectId

admin_bp = Blueprint("admin_bp", __name__)

# --------------------------------------------------
# 📊 DASHBOARD SUMMARY STATS
# --------------------------------------------------
@admin_bp.route("/stats", methods=["GET"])
def get_stats():
    """Live counts for the dashboard overview cards."""
    try:
        users_count = mongo.db.users.count_documents({})
        jobs_count = mongo.db.jobs.count_documents({})
        apps_count = mongo.db.applications.count_documents({})
        return jsonify({
            "users": users_count,
            "jobs": jobs_count,
            "applications": apps_count
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --------------------------------------------------
# 👥 USER MANAGEMENT
# --------------------------------------------------
@admin_bp.route("/users", methods=["GET"])
def all_users():
    """Fetch all users excluding passwords for the directory."""
    try:
        users = list(mongo.db.users.find({}, {"password": 0}))
        for u in users:
            u["_id"] = str(u["_id"])
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route("/users/delete/<user_id>", methods=["DELETE"])
def delete_user(user_id):
    """Permanently remove a user from the system."""
    try:
        mongo.db.users.delete_one({"_id": ObjectId(user_id)})
        return jsonify({"message": "User removed successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --------------------------------------------------
# 💼 JOB MANAGEMENT
# --------------------------------------------------
@admin_bp.route("/jobs", methods=["GET"])
def all_jobs():
    """Fetch all live job posts."""
    try:
        jobs = list(mongo.db.jobs.find())
        for j in jobs:
            j["_id"] = str(j["_id"])
        return jsonify(jobs), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route("/jobs/delete/<job_id>", methods=["DELETE"])
def delete_admin_job(job_id):
    """Remove a job posting from the master list."""
    try:
        mongo.db.jobs.delete_one({"_id": ObjectId(job_id)})
        return jsonify({"message": "Job deleted by admin"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --------------------------------------------------
# 📝 APPLICATION LOGS
# --------------------------------------------------
@admin_bp.route("/applications", methods=["GET"])
def all_applications():
    """Fetch all job application logs."""
    try:
        apps = list(mongo.db.applications.find())
        for a in apps:
            a["_id"] = str(a["_id"])
        return jsonify(apps), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --------------------------------------------------
# ⭐ FEEDBACK MANAGEMENT
# --------------------------------------------------
@admin_bp.route("/feedbacks/submit", methods=["POST"])
def submit_feedback():
    """Endpoint for teachers and recruiters to submit feedback."""
    try:
        data = request.json
        # 🆕 Updated to include "name" so it displays correctly on the Admin Board
        mongo.db.feedbacks.insert_one({
            "name": data.get("name"), 
            "role": data.get("role"),
            "email": data.get("email"),
            "rating": int(data.get("rating")),
            "feedback": data.get("feedback"),
            "created_at": data.get("created_at")
        })
        return jsonify({"message": "Feedback submitted successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route("/feedbacks", methods=["GET"])
def get_feedbacks():
    """Fetch live feedback reports for the Admin Dashboard review board."""
    try:
        # Sort by most recent first
        feedbacks = list(mongo.db.feedbacks.find().sort("created_at", -1))
        for f in feedbacks:
            f["_id"] = str(f["_id"])
        return jsonify(feedbacks), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500