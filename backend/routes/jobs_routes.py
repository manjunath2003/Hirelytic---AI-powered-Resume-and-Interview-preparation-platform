from flask import Blueprint, jsonify, request
from backend.extensions import mongo
from bson import ObjectId
from datetime import datetime

jobs_bp = Blueprint("jobs_bp", __name__)

# -----------------------------------------------------------
# GET JOB DETAILS
# -----------------------------------------------------------
@jobs_bp.route("/job/<job_id>", methods=["GET"])
def get_job_details(job_id):
    try:
        job = mongo.db.jobs.find_one({"_id": ObjectId(job_id)})
    except:
        return jsonify({"error": "Invalid job ID"}), 400

    if not job:
        return jsonify({"error": "Job not found"}), 404

    job["_id"] = str(job["_id"])
    return jsonify(job), 200


# -----------------------------------------------------------
# SEARCH + FILTER + PAGINATION
# -----------------------------------------------------------
@jobs_bp.route("/search", methods=["GET"])
def search_jobs():
    query = request.args.get("q", "")
    subject = request.args.get("subject", "")
    location = request.args.get("location", "")
    category = request.args.get("category", "")

    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    skip = (page - 1) * limit

    filters = {}

    if query:
        filters["$or"] = [
            {"title": {"$regex": query, "$options": "i"}},
            {"subject": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}},
        ]

    if subject:
        filters["subject"] = {"$regex": subject, "$options": "i"}

    if location:
        filters["location"] = {"$regex": location, "$options": "i"}

    if category:
        filters["category"] = category

    total = mongo.db.jobs.count_documents(filters)

    jobs = list(
        mongo.db.jobs.find(filters)
        .sort("_id", 1)
        .skip(skip)
        .limit(limit)
    )

    for j in jobs:
        j["_id"] = str(j["_id"])

    return jsonify({
        "jobs": jobs,
        "total": total,
        "page": page,
        "limit": limit
    })


# -----------------------------------------------------------
# APPLY FOR A JOB (Corrected resume_meta paths)
# -----------------------------------------------------------
@jobs_bp.route("/apply", methods=["POST"])
def apply_for_job():
    data = request.json
    user_id = data.get("user_id")
    job_id = data.get("job_id")
    resume_id = data.get("resume_id")

    exists = mongo.db.applications.find_one({"user_id": user_id, "job_id": job_id})
    if exists:
        return jsonify({"message": "Already applied"}), 409

    record = {
        "user_id": user_id,
        "job_id": job_id,
        "applied_at": datetime.utcnow()
    }

    if resume_id:
        record["resume_id"] = resume_id

        # ---------------------------------------------------
        # TRY: Uploaded resume
        # ---------------------------------------------------
        uploaded = mongo.db.resume_files.find_one({"_id": resume_id})
        if uploaded:
            owner = uploaded.get("user_id")
            filename = uploaded.get("filename")

            record["resume_meta"] = {
                "resume_id": uploaded.get("_id"),
                "file_name": filename,
                "type": "uploaded",
                # Correct path under /uploads/
                "pdf": f"{owner}/{filename}",
                "owner_user_id": owner
            }

        else:
            # ---------------------------------------------------
            # TRY: Generated resume
            # ---------------------------------------------------
            try:
                gen = mongo.db.generated_resumes.find_one({"_id": ObjectId(resume_id)})
                if gen:
                    owner = gen.get("user_id")
                    pdf_name = gen.get("pdf_filename")
                    docx_name = gen.get("docx_filename")

                record["resume_meta"] = {
                    "resume_id": str(gen["_id"]),
                    "type": "generated",
                    "file_name": pdf_name,
                    "pdf": f"generated_resumes/{owner}/{pdf_name}",
                    "docx": f"generated_resumes/{owner}/{docx_name}",
                    "owner_user_id": owner
}
            except:
                pass

    mongo.db.applications.insert_one(record)
    return jsonify({"message": "Application submitted"}), 201


# -----------------------------------------------------------
# GET ALL JOBS POSTED BY EMPLOYER
# -----------------------------------------------------------
@jobs_bp.route("/employer/<employer_id>", methods=["GET"])
def get_jobs_by_employer(employer_id):
    try:
        # find jobs where employer_id == employer_id OR posted_by == employer_id
        jobs = list(mongo.db.jobs.find({
            "$or": [
                {"employer_id": employer_id},
                {"posted_by": employer_id}
            ]
        }).sort("_id", -1))

        for job in jobs:
            job["_id"] = str(job["_id"])
            if "created_at" in job:
                try:
                    job["created_at"] = job["created_at"].isoformat()
                except:
                    pass

        return jsonify(jobs), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400



# -----------------------------------------------------------
# GET ALL APPLICATIONS FOR RECRUITER JOBS
# -----------------------------------------------------------
@jobs_bp.route("/recruiter/applications/<recruiter_id>", methods=["GET"])
def get_recruiter_applications(recruiter_id):
    try:
        # ----------------------------------------
        # Fetch all jobs posted by this recruiter
        # Use $or so we catch both employer_id and posted_by fields
        # ----------------------------------------
        jobs = list(mongo.db.jobs.find({
            "$or": [
                {"employer_id": recruiter_id},
                {"posted_by": recruiter_id}
            ]
        }))
        job_ids = [str(job["_id"]) for job in jobs]

        if not job_ids:
            return jsonify([]), 200

        # ----------------------------------------
        # Fetch all applications for these jobs
        # ----------------------------------------
        apps = list(
            mongo.db.applications.find({"job_id": {"$in": job_ids}})
            .sort("applied_at", -1)
        )

        job_map = {str(job["_id"]): job for job in jobs}
        results = []

        for a in apps:
            a["_id"] = str(a["_id"])

            if "applied_at" in a:
                try:
                    a["applied_at"] = a["applied_at"].isoformat()
                except:
                    pass

            job = job_map.get(a["job_id"])
            if job:
                a["job_title"] = job.get("title")
                a["institution"] = job.get("institution")

            # Read teacher profile from teacher_profiles
            profile = mongo.db.teacher_profiles.find_one({"user_id": a.get("user_id")}) or {}

            a["applicant_name"] = profile.get("name", "Unknown")
            a["applicant_email"] = profile.get("email", profile.get("Not provided"))
            a["applicant_phone"] = profile.get("phone", "Not provided")

            # Extra fields you requested
            a["applicant_experience"] = profile.get("experience", "Not provided")
            a["applicant_qualification"] = profile.get("qualification", "Not provided")
            a["applicant_skills"] = profile.get("skills", "Not provided")
            a["applicant_age"] = profile.get("age", "Not provided")
            a["applicant_about"] = profile.get("about", "")
            photo = profile.get("profilePhoto") or profile.get("photo")
            if photo:
                a["applicant_photo"] = f"http://localhost:5000/{photo}"
            else:
                a["applicant_photo"] = None

            # Fix resume_meta path for generated AI resumes (if present)
            meta = a.get("resume_meta")
            if meta and meta.get("type") == "generated":
                uid = meta.get("owner_user_id") or meta.get("user_id") or a.get("user_id")
                fname = meta.get("file_name") or meta.get("pdf") or meta.get("pdf_filename")
                if uid and fname:
                    meta["pdf"] = f"generated/{uid}/{fname}"
                meta["docx"] = None
                a["resume_meta"] = meta

            results.append(a)

        return jsonify(results), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
