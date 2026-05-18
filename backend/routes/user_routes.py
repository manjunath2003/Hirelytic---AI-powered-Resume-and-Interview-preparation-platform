from flask import Blueprint, jsonify
from bson import ObjectId
from backend.extensions import mongo

user_bp = Blueprint("user_bp", __name__)

@user_bp.route("/profile/<user_id>", methods=["GET"])
def get_profile(user_id):
    try:
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404

        user["_id"] = str(user["_id"])
        return jsonify(user)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
