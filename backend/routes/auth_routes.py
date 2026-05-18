from flask import Blueprint, request, jsonify
from backend.extensions import mongo
from werkzeug.security import generate_password_hash, check_password_hash
from backend.security import create_jwt_token
from datetime import datetime

auth_bp = Blueprint("auth", __name__)

# ---------------------- SIGNUP ----------------------
@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data received"}), 400

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role")

        if not all([name, email, password, role]):
            return jsonify({"error": "Missing fields"}), 400

        # normalize role (VERY IMPORTANT)
        role = role.lower()

        if mongo.db.users.find_one({"email": email}):
            return jsonify({"error": "Email already registered"}), 409

        hashed_pw = generate_password_hash(password)

        user_doc = {
            "name": name,
            "email": email,
            "password": hashed_pw,
            "role": role
        }

        result = mongo.db.users.insert_one(user_doc)
        user_id = str(result.inserted_id)

        # ---------------- CREATE PROFILES ----------------
        if role == "teacher":
            mongo.db.teacher_profiles.insert_one({
                "user_id": user_id,
                "phone": "",
                "age": "",
                "gender": "",
                "qualification": "",
                "experience": "",
                "skills": [],
                "preferred_subject": "",
                "preferred_location": "",
                "job_type": "",
                "profilePhoto": ""
            })

        elif role == "employer":
            # 🔥 NEW: recruiter profile (CORRECT SYSTEM)
            mongo.db.recruiter_profiles.insert_one({
                "user_id": user_id,
                "name": name,
                "email": email,
                "phone": "",
                "institution": "",
                "role": "Recruiter",
                "location": "",
                "created_at": datetime.utcnow()
            })

        return jsonify({
            "message": "Registered successfully",
            "user_id": user_id,
            "role": role
        }), 201

    except Exception as e:
        print("🔥 REGISTER ERROR 🔥", e)
        return jsonify({"error": "Server error"}), 500


# ---------------------- LOGIN ----------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data received"}), 400

        email = data.get("email")
        password = data.get("password")

        user = mongo.db.users.find_one({"email": email})

        if not user:
            return jsonify({"error": "User not found"}), 401

        if not check_password_hash(user["password"], password):
            return jsonify({"error": "Wrong password"}), 401

        user_id = str(user["_id"])
        role = user.get("role", "teacher")

        # 🔥 ENSURE RECRUITER PROFILE EXISTS (SAFE UPSERT)
        if role == "employer":
            mongo.db.recruiter_profiles.update_one(
                {"user_id": user_id},
                {
                    "$setOnInsert": {
                        "user_id": user_id,
                        "name": user.get("name"),
                        "email": user.get("email"),
                        "phone": "",
                        "institution": "",
                        "role": "Recruiter",
                        "location": "",
                        "created_at": datetime.utcnow()
                    }
                },
                upsert=True
            )

        token = create_jwt_token(user_id, role)

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user_id": user_id,
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "role": role
        }), 200

    except Exception as e:
        print("🔥 LOGIN ERROR 🔥", e)
        return jsonify({"error": "Server error"}), 500
