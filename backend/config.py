import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "mysecretkey")
    JWT_SECRET = os.getenv("JWT_SECRET", "myjwtsecretkey123")      # For Auth Routes
    JWT_SECRET_KEY = os.getenv("JWT_SECRET", "myjwtsecretkey123")  # For JWT Manager
    
    JWT_EXPIRY_HOURS = 12 
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=12)

    # ✅ THIS FIXES THE CRASH
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"

    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/hirelytic")
    