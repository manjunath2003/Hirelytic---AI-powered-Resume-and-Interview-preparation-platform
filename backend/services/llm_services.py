import os
import requests
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError("❌ GROQ_API_KEY not found")

def call_llm(prompt: str) -> str:
    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "llama-3.1-8b-instant",  # ✅ SAFE, ACTIVE
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7
        },
        timeout=30
    )

    if response.status_code != 200:
        raise RuntimeError(response.text)

    return response.json()["choices"][0]["message"]["content"]
