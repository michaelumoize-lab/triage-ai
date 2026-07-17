# backend/app/services/llm_client.py
import os
import json
import logging
import re
from typing import Dict, Any
from groq import Groq

from dotenv import load_dotenv

load_dotenv() 

logger = logging.getLogger(__name__)

class LLMClient:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set")
        self.client = Groq(api_key=self.api_key)
        self.model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    def generate_disease_explanation(self, disease_name: str) -> Dict[str, Any]:
        prompt = f"""
You are a medical reference assistant. Provide a clinical summary for the disease "{disease_name}".

Return ONLY valid JSON with these exact keys:
{{
    "description": "A 2-3 sentence explanation covering pathophysiology, typical presentation, and key clinical features.",
    "treatment": "1-2 sentences on common treatment approaches (medications, lifestyle, etc.).",
    "symptoms": ["list", "of", "3-5", "key", "symptoms"],
    "specialist": "The recommended specialist type (e.g., Pulmonologist, Cardiologist)"
}}

Be accurate and concise. Use plain language that a doctor would find useful.
"""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a medical reference assistant. Return only valid JSON without markdown formatting."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=600,
            )
            content = response.choices[0].message.content.strip()
            # Parse JSON robustly
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                # Try to extract JSON from markdown fences
                json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', content, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group(1))
                # Fallback to finding any object
                json_match = re.search(r'(\{.*\})', content, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group(1))
                raise
        except Exception as e:
            logger.error(f"LLM generation failed: {e}")
            raise

llm_client = LLMClient()