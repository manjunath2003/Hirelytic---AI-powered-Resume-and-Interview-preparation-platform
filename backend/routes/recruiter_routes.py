from flask import Blueprint, request, jsonify
from backend.extensions import mongo
from datetime import datetime

recruiter_bp = Blueprint("recruiter_bp", __name__)

# ----------------------------
# POST JOB ROUTE GOES HERE
# ----------------------------
@recruiter_bp.route("/jobs/create", methods=["POST"])
def create_job():
    data = request.json

    # accept either posted_by or employer_id from frontend; default to posted_by
    posted_by = data.get("posted_by") or data.get("employer_id")

    mongo.db.jobs.insert_one({
        "title": data.get("title"),
        "category": data.get("category"),
        "subject": data.get("subject"),
        "location": data.get("location"),
        "salary": data.get("salary"),
        "experience_required": int(data.get("experience_required", 0)),
        "description": data.get("description"),
        "posted_by": posted_by,
        # also set employer_id to keep schema consistent
        "employer_id": posted_by,
        "created_at": datetime.now()
    })

    return jsonify({"message": "Job posted successfully"}), 201


@recruiter_bp.route("/jobs/<recruiter_id>", methods=["GET"])
def get_recruiter_jobs(recruiter_id):
    jobs = list(mongo.db.jobs.find({"posted_by": recruiter_id}))
    for job in jobs:
        job["_id"] = str(job["_id"])
    return jsonify(jobs)

from bson import ObjectId

@recruiter_bp.route("/jobs/update/<job_id>", methods=["PUT"])
def update_job(job_id):
    data = request.json
    mongo.db.jobs.update_one(
        {"_id": ObjectId(job_id)},
        {"$set": data}
    )
    return jsonify({"message": "Job updated successfully"})

@recruiter_bp.route("/jobs/delete/<job_id>", methods=["DELETE"])
def delete_job(job_id):
    mongo.db.jobs.delete_one({"_id": ObjectId(job_id)})
    return jsonify({"message": "Job deleted successfully"})
