from flask_jwt_extended import create_access_token

def create_jwt_token(user_id, role):
    return create_access_token(
        identity=user_id,
        additional_claims={
            "role": role
        }
    )

# NOTE:
# Manual JWT verification using PyJWT has been intentionally removed.
# Flask-JWT-Extended handles token validation internally via @jwt_required().
