# backend/routes/resume_files.py
from flask import Blueprint, jsonify, send_file
from backend.extensions import mongo
import io

# ✅ ADDED (for tracking downloads)
from datetime import datetime
from bson import ObjectId

resume_files_bp = Blueprint("resume_files_bp", __name__)

# List uploaded resume metadata for a user
@resume_files_bp.route("/list/<user_id>", methods=["GET"])
def list_uploaded_resumes(user_id):
    try:
        files = list(mongo.db.resume_files.find({"user_id": user_id}))
        out = []
        for f in files:
            out.append({
                "_id": f.get("_id"),
                "filename": f.get("filename"),
                "content_type": f.get("content_type"),
                "uploaded_at": f.get("uploaded_at"),
                # presence flag to help debugging
                "has_binary": ("data" in f)
            })
        return jsonify(out), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Preview / download an uploaded resume
@resume_files_bp.route("/get/<resume_id>", methods=["GET"])
def get_uploaded_resume(resume_id):
    try:
        f = mongo.db.resume_files.find_one({"_id": resume_id})
        if not f:
            return jsonify({"error": "Resume metadata not found"}), 404

        # If your system stores raw bytes in "data", serve them.
        if f.get("data"):

            # ✅ ADDED: TRACK RESUME DOWNLOAD (REAL-TIME DASHBOARD)
            mongo.db.resume_downloads.insert_one({
                "user_id": ObjectId(f.get("user_id")),
                "resume_id": resume_id,
                "downloaded_at": datetime.utcnow()
            })

            return send_file(
                io.BytesIO(f["data"]),
                mimetype=f.get("content_type", "application/octet-stream"),
                download_name=f.get("filename", "resume")
            )

        # If no binary present, inform the frontend so you can check your storage flow.
        return jsonify({
            "error": "Resume stored as metadata only; raw bytes not available on server. If you expect a binary, confirm upload-storage logic."
        }), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500
