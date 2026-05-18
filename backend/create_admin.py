from backend.extensions import mongo
from werkzeug.security import generate_password_hash

def create_admin():
    admin_email = "admin@gmail.com"
    admin_password = "admin123"

    if mongo.db.users.find_one({"email": admin_email}):
        print("Admin already exists.")
        return

    hashed = generate_password_hash(admin_password)

    mongo.db.users.insert_one({
        "name": "Admin",
        "email": admin_email,
        "password": hashed,
        "role": "admin"
    })

    print("Admin created successfully with email:", admin_email)

