# backend/app/services/llm_client.py
import os
import json
import logging
from typing import Dict, Any
from groq import Groq

logger = logging.getLogger(__name__)

class LLMClient:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set")
        
        self.client = Groq(api_key=self.api_key)
        # Using the same model you already use in your study assistant
        self.model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    def generate_disease_explanation(self, disease_name: str) -> Dict[str, Any]:
        """
        Generate a structured disease explanation using Groq's LLM.
        Returns a dict with keys: description, treatment, symptoms, specialist.
        """
        prompt = f"""
You are a medical reference assistant. Provide a clinical summary for the disease "{disease_name}".

Return ONLY valid JSON with these exact keys:
{{
    "description": "A 2-3 sentence explanation covering pathophysiology, typical presentation, and key clinical features.",
    "treatment": "1-2 sentences on common treatment approaches (medications, lifestyle, etc.).",
    "symptoms": ["list", "of", "3-5", "key", "symptoms"],
    "specialist": "The recommended specialist type (e.g., Pulmonologist, Cardiologist)"
}}

Be accurate and concise. Use plain language that a doctor would find useful. Do NOT include any additional text outside the JSON block.
"""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a medical reference assistant. You return only valid JSON without any markdown formatting or extra text."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=600,
                # Groq does NOT support response_format, so we'll rely on the prompt to enforce JSON.
            )
            
            content = response.choices[0].message.content.strip()
            
            # Attempt to parse JSON; if it fails, try to extract JSON from the string
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                # Sometimes the model wraps JSON in ```json ... ``` markers
                import re
                json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', content, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group(1))
                # Fallback: try to find anything that looks like a JSON object
                json_match = re.search(r'(\{.*\})', content, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group(1))
                # If all fails, re-raise
                raise
            
        except Exception as e:
            logger.error(f"Failed to generate explanation for {disease_name}: {e}")
            # Return a minimal fallback (or re-raise)
            raise RuntimeError(f"LLM generation failed: {str(e)}")

# Singleton instance – will raise error if missing API key
llm_client = LLMClient()