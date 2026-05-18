import sys
import os
import json

# Add project root to PYTHONPATH
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.append(ROOT_DIR)

from backend.extensions import mongo
from app import create_app

app = create_app()

# Compute correct path to JSON file
JSON_PATH = os.path.join(ROOT_DIR, "backend", "data", "categories", "all_categories.json")

with open(JSON_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

with app.app_context():
    collection = mongo.db.interview_categories

    print("Clearing old interview category data…")
    collection.delete_many({})

    print("Seeding new interview categories…")
    for category_name, category_data in data.items():
        doc = {
            "category": category_name,
            "questions": category_data.get("questions", []),
            "resources": category_data.get("resources", {})
        }
        collection.insert_one(doc)

    print("\nDONE — All interview categories seeded successfully!")
