from flask import Blueprint, request, jsonify
from backend.extensions import mongo
from datetime import datetime

recruiter_profile_bp = Blueprint("recruiter_profile_bp", __name__)

# -----------------------------
# GET PROFILE
# -----------------------------
@recruiter_profile_bp.route("/<user_id>", methods=["GET"])
def get_recruiter_profile(user_id):
    profile = mongo.db.recruiter_profiles.find_one(
        {"user_id": user_id},
        {"_id": 0}
    )

    if not profile:
        return jsonify({}), 200

    return jsonify(profile), 200


# -----------------------------
# CREATE / UPDATE PROFILE
# -----------------------------
@recruiter_profile_bp.route("/update", methods=["POST"])
def update_profile():
    data = request.json
    user_id = data["user_id"]

    mongo.db.recruiter_profiles.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "name": data.get("name"),
                "email": data.get("email"),
                "phone": data.get("phone"),
                "institution": data.get("institution"),
                "role": data.get("role"),
                "location": data.get("location"),
                "updated_at": datetime.utcnow()
            }
        },
        upsert=True
    )

    return jsonify({"success": True})
