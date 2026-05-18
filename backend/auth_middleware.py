from flask import request, jsonify
from functools import wraps
from backend.security import verify_jwt_token

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if "Authorization" in request.headers:
            token = request.headers["Authorization"].replace("Bearer ", "")

        if not token:
            return jsonify({"error": "Token missing"}), 401

        data = verify_jwt_token(token)

        if "error" in data:
            return jsonify(data), 401

        request.user = data  # attach user info to request
        return f(*args, **kwargs)

    return decorated
