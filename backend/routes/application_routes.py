# backend/routes/application_bp.py
from flask import Blueprint, jsonify, request
from backend.extensions import mongo
from bson import ObjectId
from datetime import datetime

application_bp = Blueprint("application_bp", __name__)

# ---------------------------------------------------------
# CHECK IF USER ALREADY APPLIED
# ---------------------------------------------------------
@application_bp.route("/check/<user_id>/<job_id>", methods=["GET"])
def check_application(user_id, job_id):
    exists = mongo.db.applications.find_one({"user_id": user_id, "job_id": job_id})
    return jsonify({"applied": exists is not None}), 200


# ---------------------------------------------------------
# LIST APPLIED JOBS FOR A USER
# ---------------------------------------------------------
@application_bp.route("/list/<user_id>", methods=["GET"])
def list_applied_jobs(user_id):
    apps = list(
        mongo.db.applications.find({"user_id": user_id}).sort("applied_at", -1)
    )
    if not apps:
        return jsonify([]), 200

    job_ids = []
    for a in apps:
        try:
            job_ids.append(ObjectId(a["job_id"]))
        except:
            continue

    jobs = list(mongo.db.jobs.find({"_id": {"$in": job_ids}}))
    job_map = {str(j["_id"]): j for j in jobs}

    results = []
    for a in apps:
        job_doc = job_map.get(a["job_id"])
        if not job_doc:
            continue

        applied_at = a.get("applied_at")
        if hasattr(applied_at, "isoformat"):
            applied_at = applied_at.isoformat()

        item = {
            "job_id": a["job_id"],
            "title": job_doc.get("title", ""),
            "institution": job_doc.get("institution", ""),
            "category": job_doc.get("category", ""),
            "subject": job_doc.get("subject", ""),
            "location": job_doc.get("location", ""),
            "salary": job_doc.get("salary", ""),
            "experience_required": job_doc.get("experience_required", ""),
            "applied_at": applied_at
        }

        # Attach resume_meta if present
        if a.get("resume_meta"):
            item["resume_meta"] = a.get("resume_meta")

        results.append(item)

    return jsonify(results), 200


# ---------------------------------------------------------
# APPLY FOR JOB
# Only AI-generated resumes will be used.
# ---------------------------------------------------------
@application_bp.route("/apply", methods=["POST"])
def apply_job():
    data = request.json or {}
    user_id = data.get("user_id")
    job_id = data.get("job_id")
    resume_id = data.get("resume_id")  # Must be generated resume ID

    if not user_id or not job_id:
        return jsonify({"error": "user_id and job_id are required"}), 400

    existing = mongo.db.applications.find_one({"user_id": user_id, "job_id": job_id})

    # -----------------------------------------------------
    # UPDATE EXISTING APPLICATION
    # -----------------------------------------------------
    if existing:
        update_data = {}
        if resume_id:
            update_data["resume_id"] = resume_id
            try:
                gen = mongo.db.generated_resumes.find_one({"_id": ObjectId(resume_id)})
                if gen:
                    # IMPORTANT: Store CORRECT relative path for AI resumes
                    pdf_path = f"generated/{user_id}/{gen.get('pdf_filename')}"
                    docx_path = f"generated/{user_id}/{gen.get('docx_filename')}"

                    update_data["resume_meta"] = {
                        "type": "generated",
                        "resume_id": str(gen["_id"]),
                        "pdf": pdf_path,
                        "docx": docx_path,
                        "file_name": gen.get("pdf_filename"),
                        "owner_user_id": user_id
                    }

            except Exception:
                pass

        if update_data:
            mongo.db.applications.update_one({"_id": existing["_id"]}, {"$set": update_data})
            return jsonify({"message": "Application updated with resume"}), 200

        return jsonify({"message": "Already applied"}), 409

    # -----------------------------------------------------
    # NEW APPLICATION
    # -----------------------------------------------------
    record = {
        "user_id": user_id,
        "job_id": job_id,
        "applied_at": datetime.utcnow()
    }

    if resume_id:
        record["resume_id"] = resume_id
        try:
            gen = mongo.db.generated_resumes.find_one({"_id": ObjectId(resume_id)})
            if gen:
                pdf_path = f"generated/{user_id}/{gen.get('pdf_filename')}"
                docx_path = f"generated/{user_id}/{gen.get('docx_filename')}"

                record["resume_meta"] = {
                    "type": "generated",
                    "resume_id": str(gen["_id"]),
                    "pdf": pdf_path,
                    "docx": docx_path,
                    "file_name": gen.get("pdf_filename"),
                    "owner_user_id": user_id
                }
        except Exception:
            pass

    mongo.db.applications.insert_one(record)
    return jsonify({"message": "Application submitted", "applied": True}), 201


# ---------------------------------------------------------
# LIST APPLIED JOB IDs FOR BADGE MARKING
# ---------------------------------------------------------
@application_bp.route("/applied/<user_id>", methods=["GET"])
def applied_job_ids(user_id):
    try:
        apps = list(mongo.db.applications.find(
            {"user_id": user_id},
            {"job_id": 1, "_id": 0}
        ))

        applied_ids = []
        for a in apps:
            job_id = a.get("job_id")
            if isinstance(job_id, ObjectId):
                applied_ids.append(str(job_id))
            else:
                applied_ids.append(job_id)

        return jsonify(applied_ids), 200

    except Exception as e:
        print("Error in /applied route:", e)
        return jsonify({"error": "Failed to fetch applied jobs"}), 500
