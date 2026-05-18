from passlib.hash import bcrypt
import jwt
import datetime
from flask import current_app as app

def hash_password(password: str) -> str:
    return bcrypt.hash(password)

def verify_password(password, hashed) -> bool:
    return bcrypt.verify(password, hashed)

def generate_jwt(payload, expires_minutes=60*24):
    payload_copy = payload.copy()
    payload_copy['exp'] = datetime.datetime.utcnow() + datetime.timedelta(minutes=expires_minutes)
    token = jwt.encode(payload_copy, app.config['JWT_SECRET'], algorithm='HS256')
    return token

def decode_jwt(token):
    return jwt.decode(token, app.config['JWT_SECRET'], algorithms=['HS256'])
