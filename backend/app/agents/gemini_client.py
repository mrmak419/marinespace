"""Gemini LLM client for ORCA Agent Orchestration.

Direct asynchronous integration with Google Gemini (gemini-2.5-flash)
using httpx for sub-second responses and zero dependency conflicts.
"""
import os
import httpx
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

# We use gemini-2.5-flash as primary, with gemini-2.5-flash-lite as fallback
GEMINI_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-flash-latest"
]


def get_api_key() -> str:
    return os.getenv("GEMINI_API_KEY", "").strip()


async def generate_response(prompt: str, system_instruction: Optional[str] = None) -> str:
    """Generate a full, untruncated response using Google Gemini."""
    key = get_api_key()
    if not key:
        return "⚠️ Google Gemini API key not configured. Please set GEMINI_API_KEY in backend/.env."

    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 2500,  # Generous headroom to prevent mid-sentence cutoff
        }
    }

    if system_instruction:
        payload["systemInstruction"] = {
            "parts": [{"text": system_instruction}]
        }

    async with httpx.AsyncClient(timeout=35.0) as client:
        for model in GEMINI_MODELS:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
            try:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts:
                            text = parts[0].get("text", "")
                            if text:
                                return text
                elif resp.status_code == 429:
                    # Rate limit or token quota, try next model
                    continue
            except Exception:
                continue

    return ""
