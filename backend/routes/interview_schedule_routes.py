from flask import Blueprint, request, jsonify
from flask_cors import CORS
from backend.extensions import mongo
from backend.services.meeting_link_service import generate_meeting_link
from bson import ObjectId
from datetime import datetime

# ✅ Correct Blueprint
interview_schedule_bp = Blueprint("interview_schedule_bp", __name__)
CORS(interview_schedule_bp)

# ============================================================
#  SCHEDULE INTERVIEW
# ============================================================
@interview_schedule_bp.route("/schedule", methods=["POST", "OPTIONS"])
def schedule_interview():
    # ✅ Handle CORS preflight
    if request.method == "OPTIONS":
        return "", 200

    data = request.get_json(silent=True) or {}
    print("📥 Schedule interview payload:", data)

    # -------------------------------
    # ✅ Validate payload
    # -------------------------------
    if not data.get("application_id"):
        return jsonify({"error": "Missing application_id"}), 400

    if not data.get("teacher_id"):
        return jsonify({"error": "Missing teacher_id"}), 400

    if not data.get("interview"):
        return jsonify({"error": "Missing interview details"}), 400

    interview = data.get("interview", {})

    # -------------------------------
    # ✅ Validate ObjectId
    # -------------------------------
    try:
        application_id = ObjectId(data["application_id"])
    except Exception:
        return jsonify({"error": "Invalid application_id"}), 400

    # -------------------------------
    # 🔗 AUTO LINK FOR ONLINE
    # -------------------------------
    if interview.get("mode") == "online":
        interview["meeting_link"] = generate_meeting_link()
    else:
        interview["meeting_link"] = None

    # -------------------------------
    # ✅ Update application
    # -------------------------------
    mongo.db.applications.update_one(
        {"_id": application_id},
        {"$set": {
            "status": "shortlisted",
            "interview": interview
        }}
    )

    # -------------------------------
    # 🔔 Notification message
    # -------------------------------
    message = f"""
Your profile has been shortlisted.

Interview Details:
Date: {interview.get('date')}
Time: {interview.get('time')}
Mode: {interview.get('mode', '').capitalize()}
"""

    if interview.get("meeting_link"):
        message += f"\nJoin Link: {interview['meeting_link']}\n"

    message += f"""
Contact:
Email: {interview.get('contact_email')}
Phone: {interview.get('contact_phone')}
"""

    mongo.db.notifications.insert_one({
        "teacher_id": data["teacher_id"],
        "type": "interview",
        "title": "Interview Scheduled",
        "message": message.strip(),
        "meta": interview,
        "read": False,
        "created_at": datetime.utcnow()
    })

    return jsonify({"success": True}), 200


# ============================================================
#  REJECT CANDIDATE
# ============================================================
@interview_schedule_bp.route("/reject", methods=["POST", "OPTIONS"])
def reject_candidate():
    if request.method == "OPTIONS":
        return "", 200

    data = request.get_json(silent=True) or {}
    print("📥 Reject candidate payload:", data)

    application_id = data.get("application_id")
    teacher_id = data.get("teacher_id")
    message = data.get("message", "Your application has been rejected.")

    if not application_id or not teacher_id:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        application_id = ObjectId(application_id)
    except Exception:
        return jsonify({"error": "Invalid application_id"}), 400

    # ------------------------------------
    # Fetch application
    # ------------------------------------
    app = mongo.db.applications.find_one(
        {"_id": application_id}
    )

    job_title = None
    institution = None

    if app:
        job_id = app.get("job_id")
        if job_id:
            try:
                job = mongo.db.jobs.find_one(
                    {"_id": ObjectId(job_id)}
                )
                if job:
                    job_title = job.get("title")
                    institution = job.get("institution")
            except Exception:
                pass

    # ------------------------------------
    # Update application status
    # ------------------------------------
    mongo.db.applications.update_one(
        {"_id": application_id},
        {"$set": {"status": "rejected"}}
    )

    # ------------------------------------
    # Create notification
    # ------------------------------------
    mongo.db.notifications.insert_one({
        "teacher_id": teacher_id,
        "type": "rejection",
        "title": "Application Update",
        "message": message,
        "meta": {
            "job_title": job_title,
            "institution": institution
        },
        "read": False,
        "created_at": datetime.utcnow()
    })

    return jsonify({"success": True}), 200


# ============================================================
#  GET SHORTLISTED APPLICATIONS
# ============================================================
@interview_schedule_bp.route("/shortlisted/<recruiter_id>", methods=["GET"])
def get_shortlisted(recruiter_id):
    apps = list(
        mongo.db.applications.find({
            "recruiter_id": recruiter_id,
            "status": "shortlisted"
        })
    )

    for a in apps:
        a["_id"] = str(a["_id"])

    return jsonify(apps), 200
