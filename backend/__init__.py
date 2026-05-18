from flask import Flask, send_file, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager  # ✅ 1. IMPORT THIS
from backend.config import Config
from backend.extensions import mongo
from dotenv import load_dotenv
from backend.indexes import create_indexes
import os

load_dotenv()

def create_app():
    app = Flask(
        __name__,
        static_folder=os.path.join(os.getcwd(), "uploads"),
        static_url_path="/uploads"
    )
    app.config.from_object(Config)

    # ------------------ JWT CONFIGURATION ------------------
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]
    app.config["JWT_HEADER_NAME"] = "Authorization"
    app.config["JWT_HEADER_TYPE"] = "Bearer"
    
    # ✅ 2. INITIALIZE JWT MANAGER (This was missing!)
    jwt = JWTManager(app)

    # ------------------ CORS ------------------
    CORS(
        app,
        resources={
            r"/api/*": {"origins": "http://localhost:3000"},
            r"/admin/*": {"origins": "http://localhost:3000"}
        },
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "Accept"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    # ------------------ MongoDB ------------------
    mongo.init_app(app)
    
    # Only create indexes if connection is successful (optional check)
    with app.app_context():
        try:
            create_indexes(app)
        except Exception as e:
            print(f"Index creation skipped: {e}")

    # ------------------ HOME ------------------
    @app.route("/")
    def home():
        return "Hirelytic Backend is Running!"

    # ------------------ UPLOADS ------------------
    @app.route("/uploads/<path:filename>")
    def uploaded_files(filename):
        uploads_dir = os.path.abspath(os.path.join(os.getcwd(), "uploads"))
        file_path = os.path.join(uploads_dir, filename)

        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=False)

        return jsonify({
            "error": "File not found",
            "filename": filename
        }), 404

    # ------------------ IMPORT ROUTES ------------------
    from backend.routes.auth_routes import auth_bp
    from backend.routes.interview_routes import interview_bp
    from backend.routes.profile_routes import profile_bp
    from backend.routes.user_routes import user_bp
    from backend.routes.teacher_routes import teacher_bp
    from backend.routes.skill_routes import skill_bp
    from backend.routes.recruiter_routes import recruiter_bp
    from backend.routes.jobs_routes import jobs_bp
    from backend.routes.resume_parser import resume_parser_bp
    from backend.routes.resume_builder_ai import resume_ai_bp
    from backend.routes.application_routes import application_bp
    from backend.routes.resume_files import resume_files_bp
    from backend.routes.notification_routes import notification_bp
    from backend.routes.interview_schedule_routes import interview_schedule_bp
    from backend.routes.recruiter_profile_routes import recruiter_profile_bp
    from backend.routes.resume_builder_manual import resume_builder_manual_bp
    from backend.routes.admin_routes import admin_bp 
    
    # ------------------ REGISTER BLUEPRINTS ------------------
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(interview_bp, url_prefix="/api/interview")
    app.register_blueprint(profile_bp, url_prefix="/api/profile")
    app.register_blueprint(user_bp, url_prefix="/api/user")
    app.register_blueprint(teacher_bp, url_prefix="/api/teacher")
    app.register_blueprint(skill_bp, url_prefix="/api/skills")
    app.register_blueprint(recruiter_bp, url_prefix="/api/recruiter")
    app.register_blueprint(jobs_bp, url_prefix="/api/jobs")
    app.register_blueprint(application_bp, url_prefix="/api/applications")
    app.register_blueprint(resume_files_bp, url_prefix="/api/resume_files")
    app.register_blueprint(resume_parser_bp, url_prefix="/api/resume")
    app.register_blueprint(resume_ai_bp, url_prefix="/api/resume_ai")
    app.register_blueprint(notification_bp, url_prefix="/api/notifications")
    app.register_blueprint(interview_schedule_bp, url_prefix="/api/interview-schedule")
    app.register_blueprint(recruiter_profile_bp, url_prefix="/api/recruiter-profile")
    app.register_blueprint(resume_builder_manual_bp , url_prefix="/api/resume_builder")
    app.register_blueprint(admin_bp, url_prefix="/admin")
    
    return app
