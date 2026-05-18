from flask import Blueprint, request, jsonify
from backend.extensions import mongo
from bson import ObjectId
from werkzeug.utils import secure_filename
import os, time

profile_bp = Blueprint("profile_bp", __name__)

# Upload directory
UPLOAD_FOLDER = "uploads/profile_photos"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# =========================================================
# =============== 1️⃣ USER PROFILE ROUTES ==================
# =========================================================

# ----------- Get User Info (users collection) ------------
@profile_bp.route("/user/<user_id>", methods=["GET"])
def get_user_profile(user_id):
    try:
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)}, {"password": 0})
        if not user:
            return jsonify({"error": "User not found"}), 404

        user["_id"] = str(user["_id"])
        return jsonify({"profile": user}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------- Update User Info (users collection) ------------
@profile_bp.route("/user/update/<user_id>", methods=["POST"])
def update_user_profile(user_id):
    try:
        data = request.json

        mongo.db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": data}
        )

        return jsonify({"message": "User profile updated successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ------- Upload User Profile Photo -----------------------
@profile_bp.route("/user/uploadPhoto", methods=["POST"])
def upload_user_photo():
    try:
        user_id = request.form.get("user_id")

        if not user_id:
            return jsonify({"error": "User ID missing"}), 400

        if "photo" not in request.files:
            return jsonify({"error": "No photo uploaded"}), 400

        photo = request.files["photo"]
        filename = secure_filename(photo.filename)

        timestamp = int(time.time() * 1000)
        name, ext = os.path.splitext(filename)
        filename = f"{name}_{timestamp}{ext}"

        filepath = os.path.join(UPLOAD_FOLDER, filename)
        photo.save(filepath)

        db_path = f"{UPLOAD_FOLDER}/{filename}"

        mongo.db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"profilePhoto": db_path}}
        )

        return jsonify({"profilePhoto": db_path}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



# =========================================================
# ============ 2️⃣ TEACHER PROFILE ROUTES ==================
# =========================================================

# -------- Get Teacher Profile (teacher_profiles) ---------
@profile_bp.route("/get/<user_id>", methods=["GET"])
def get_teacher_profile(user_id):
    try:
        profile = mongo.db.teacher_profiles.find_one({"user_id": user_id})
        if not profile:
            return jsonify({"error": "Teacher profile not found"}), 404

        profile["_id"] = str(profile["_id"])
        return jsonify({"profile": profile}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



# -------- Update Teacher Profile (FULL FIXED VERSION) ----
@profile_bp.route("/update/<user_id>", methods=["POST"])
def update_teacher_profile(user_id):
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be JSON"}), 400

        data = request.json.copy()
        data.pop("_id", None)  # Remove unwanted field

        # Always sync email from users collection if missing
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)}, {"email": 1})
        user_email = user.get("email", "")

        # Clean and normalize fields
        cleaned_data = {
            "name": data.get("name", ""),
            "email": data.get("email", user_email),  # <-- ADDED FIX
            "age": data.get("age", ""),
            "phone": data.get("phone", ""),
            "gender": data.get("gender", ""),
            "qualification": data.get("qualification", ""),
            "experience": data.get("experience", ""),
            "skills": data.get("skills", ""),
            "preferred_subject": data.get("preferred_subject", ""),
            "preferred_location": data.get("preferred_location", ""),
            "job_type": data.get("job_type", ""),
            "about": data.get("about", ""),
        }

        mongo.db.teacher_profiles.update_one(
            {"user_id": user_id},
            {"$set": cleaned_data},
            upsert=True
        )

        return jsonify({"message": "Teacher profile updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



# ------- Upload Teacher Profile Photo --------------------
@profile_bp.route("/uploadPhoto/<user_id>", methods=["POST"])
def upload_teacher_photo(user_id):
    try:
        if "photo" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        photo = request.files["photo"]
        if photo.filename == "":
            return jsonify({"error": "No file selected"}), 400

        allowed_ext = {"png", "jpg", "jpeg", "gif", "webp"}
        ext = photo.filename.rsplit(".", 1)[-1].lower()

        if ext not in allowed_ext:
            return jsonify({"error": "Invalid file type"}), 400

        filename = secure_filename(photo.filename)
        timestamp = int(time.time() * 1000)
        name, ext2 = os.path.splitext(filename)
        filename = f"{name}_{timestamp}{ext2}"

        filepath = os.path.join(UPLOAD_FOLDER, filename)
        photo.save(filepath)

        db_path = f"{UPLOAD_FOLDER}/{filename}"

        mongo.db.teacher_profiles.update_one(
            {"user_id": user_id},
            {"$set": {"profilePhoto": db_path}},
            upsert=True
        )

        # Auto-calc profile strength
        profile = mongo.db.teacher_profiles.find_one({"user_id": user_id})

        weights = {
            "phone": 10,
            "age": 10,
            "gender": 10,
            "qualification": 15,
            "experience": 15,
            "skills": 15,
            "preferred_subject": 10,
            "preferred_location": 10,
            "profilePhoto": 5,
            "about": 10
        }

        score = sum(w for field, w in weights.items()
                    if profile.get(field) not in ["", None])

        score = min(100, score)

        mongo.db.teacher_profiles.update_one(
            {"user_id": user_id},
            {"$set": {"strength": score}}
        )

        return jsonify({"profilePhoto": db_path, "strength": score}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



# =========================================================
# =============== PROFILE STRENGTH ROUTE ==================
# =========================================================
@profile_bp.route("/strength/<user_id>", methods=["GET"])
def get_profile_strength(user_id):
    try:
        profile = mongo.db.teacher_profiles.find_one({"user_id": user_id})
        if not profile:
            return jsonify({"strength": 0}), 200

        weights = {
            "phone": 10,
            "age": 10,
            "gender": 10,
            "qualification": 15,
            "experience": 15,
            "skills": 15,
            "preferred_subject": 10,
            "preferred_location": 10,
            "profilePhoto": 5,
            "about": 10
        }

        score = sum(w for field, w in weights.items()
                    if profile.get(field) not in ["", None])

        return jsonify({"strength": min(score, 100)}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
