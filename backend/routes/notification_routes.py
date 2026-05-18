from flask import Blueprint, jsonify, request
from backend.extensions import mongo
from datetime import datetime
from bson import ObjectId

notification_bp = Blueprint("notification_bp", __name__)

# --------------------------------------------------
# GET ALL NOTIFICATIONS FOR TEACHER
# --------------------------------------------------
@notification_bp.route("/<teacher_id>", methods=["GET"])
def get_notifications(teacher_id):
    notes = list(
        mongo.db.notifications.find(
            {"teacher_id": teacher_id}
        ).sort("created_at", -1)
    )

    for n in notes:
        # Ensure _id is string
        n["_id"] = str(n["_id"])

        # ✅ Ensure created_at exists (fallback)
        if "created_at" not in n:
            n["created_at"] = datetime.utcnow().isoformat()
        else:
            try:
                n["created_at"] = n["created_at"].isoformat()
            except:
                pass

        # ✅ Ensure read field exists
        if "read" not in n:
            n["read"] = False

        # ✅ Ensure meta exists
        if "meta" not in n or n["meta"] is None:
            n["meta"] = {}

    return jsonify(notes), 200


# --------------------------------------------------
# GET UNREAD COUNT
# --------------------------------------------------
@notification_bp.route("/unread-count/<teacher_id>", methods=["GET"])
def unread_count(teacher_id):
    count = mongo.db.notifications.count_documents(
        {"teacher_id": teacher_id, "read": False}
    )
    return jsonify({"count": count}), 200


# --------------------------------------------------
# MARK ALL AS READ
# --------------------------------------------------
@notification_bp.route("/mark-read/<teacher_id>", methods=["POST"])
def mark_as_read(teacher_id):
    mongo.db.notifications.update_many(
        {"teacher_id": teacher_id, "read": False},
        {
            "$set": {
                "read": True,
                "read_at": datetime.utcnow()
            }
        }
    )
    return jsonify({"status": "ok"}), 200
