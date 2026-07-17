# backend/test_llm.py
from dotenv import load_dotenv
load_dotenv()  # ✅ Load environment variables first

from app.services.llm_client import llm_client

try:
    result = llm_client.generate_disease_explanation("Pneumonia")
    print("SUCCESS:", result)
except Exception as e:
    print("ERROR:", e)