# backend/indexes.py

from backend.extensions import mongo
import logging

def create_indexes(app):
    """
    Creates all MongoDB indexes for the Hirelytic platform.
    Called once during app initialization.
    """
    with app.app_context():
        try:
            db = mongo.db

            # USERS
            db.users.create_index("email", unique=True)
            db.users.create_index([("name", 1)])

            # JOBS
            db.jobs.create_index([
                ("job_title", "text"),
                ("description", "text"),
                ("required_skills", "text")
            ], name="jobs_text_idx")
            db.jobs.create_index("posted_at")

            # RESUMES
            db.resumes.create_index([
                ("skills", "text"),
                ("summary", "text"),
                ("headline", "text")
            ], name="resumes_text_idx")
            db.resumes.create_index("user_id")

            # INTERVIEWS
            db.interviews.create_index("user_id")
            db.interviews.create_index("job_id")

            logging.info("Indexes created successfully")

        except Exception as e:
            logging.exception("Failed to create indexes: %s", e)
