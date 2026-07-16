import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import List, Dict, Optional, Set
import logging

logger = logging.getLogger(__name__)

class PredictionService:
    def __init__(self):
        self.model_dir = Path(__file__).parent.parent / "models"
        logger.info(f"Looking for models in: {self.model_dir}")
        self.model = None
        self.label_encoder = None
        self.symptom_columns = None
        self._load_assets()
        # Build a set of known disease labels for exact matching
        self.known_diseases: Set[str] = set(self.label_encoder.classes_) if self.label_encoder else set()

    def _load_assets(self):
        try:
            self.model = joblib.load(self.model_dir / "triage_model.pkl")
            self.label_encoder = joblib.load(self.model_dir / "label_encoder.pkl")
            self.symptom_columns = joblib.load(self.model_dir / "symptom_columns.pkl")
            logger.info(f"✅ Model loaded: {len(self.symptom_columns)} symptoms, {len(self.label_encoder.classes_)} diseases")
        except FileNotFoundError as e:
            logger.error(f"❌ Model files not found at {self.model_dir}")
            raise RuntimeError("Model assets not found. Run 'scripts/train_model.py' first.") from e
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            raise RuntimeError(f"Failed to load model: {e}") from e

    def predict(self, symptoms: List[str]) -> Dict:
        """Predict disease from symptom list."""
        # 1. Validate input symptoms
        if not symptoms:
            raise ValueError("Empty symptom list provided.")
        unknown = sorted(set(symptoms) - set(self.symptom_columns))
        if unknown:
            raise ValueError(f"Unknown symptoms: {', '.join(unknown)}")

        # 2. Build feature vector
        feature = np.zeros(len(self.symptom_columns))
        for i, col in enumerate(self.symptom_columns):
            if col in symptoms:
                feature[i] = 1
        X = pd.DataFrame([feature], columns=self.symptom_columns)

        # 3. Predict probabilities
        probs = self.model.predict_proba(X)[0]
        top_indices = np.argsort(probs)[-3:][::-1]

        predictions = []
        for idx in top_indices:
            predictions.append({
                "condition": self.label_encoder.inverse_transform([idx])[0],
                "probability": float(probs[idx])
            })

        return {
            "primary_diagnosis": predictions[0],
            "differential_diagnoses": predictions[1:],
            "confidence": predictions[0]["probability"]
        }

    def get_triage_level(self, symptoms: List[str], red_flags: Optional[List[str]] = None) -> str:
        """
        Determine triage level based ONLY on red‑flag rules (acuity), NOT on model confidence.
        """
        # Combine symptoms and red flags
        all_symptoms = set(symptoms + (red_flags if red_flags else []))

        # Emergency rules (exact matches)
        emergency_rules = {
            "chest_pain": "immediate",
            "shortness_of_breath": "immediate",
            "coma": "immediate",
            "stomach_bleeding": "emergency",
            "acute_liver_failure": "emergency",
            "blood_in_sputum": "emergency",
        }

        for sym in all_symptoms:
            if sym in emergency_rules:
                return emergency_rules[sym]

        # No red flags → non‑urgent by default
        return "non_urgent"

    def get_red_flags(self, symptoms: List[str], input_red_flags: Optional[List[str]] = None) -> List[str]:
        """Return red flags from both input and auto-detection."""
        flags = set()
        if input_red_flags:
            flags.update(input_red_flags)

        # Auto-detect from symptoms (exact matches)
        auto_detect = {
            "chest_pain",
            "shortness_of_breath",
            "coma",
            "stomach_bleeding",
            "acute_liver_failure",
            "blood_in_sputum",
        }
        for symptom in symptoms:
            if symptom in auto_detect:
                flags.add(symptom)

        return sorted(flags)

    def get_specialist_recommendation(self, disease: str) -> str:
        """
        Map exact disease label to a specialist.
        Uses a canonical mapping that matches the exact labels from the model.
        """
        # This mapping must exactly match the labels emitted by the label_encoder.
        # All keys are taken from the training data's "prognosis" column.
        specialist_map = {
            "Fungal infection": "Dermatologist",
            "Allergy": "Allergist",
            "GERD": "Gastroenterologist",
            "Chronic cholestasis": "Hepatologist",
            "Drug Reaction": "Dermatologist",
            "Peptic ulcer disease": "Gastroenterologist",
            "AIDS": "Infectious Disease Specialist",
            "Diabetes": "Endocrinologist",
            "Gastroenteritis": "Gastroenterologist",
            "Bronchial Asthma": "Pulmonologist",
            "Hypertension": "Cardiologist",
            "Migraine": "Neurologist",
            "Cervical spondylosis": "Orthopedic Surgeon",
            "Jaundice": "Hepatologist",
            "Malaria": "Infectious Disease Specialist",
            "Chicken pox": "Dermatologist",
            "Dengue": "Infectious Disease Specialist",
            "Typhoid": "Infectious Disease Specialist",
            "Hepatitis A": "Hepatologist",
            "Hepatitis B": "Hepatologist",
            "Hepatitis C": "Hepatologist",
            "Hepatitis D": "Hepatologist",
            "Hepatitis E": "Hepatologist",
            "Alcoholic hepatitis": "Hepatologist",
            "Tuberculosis": "Pulmonologist",
            "Common Cold": "General Practitioner",
            "Pneumonia": "Pulmonologist",
            "Dimorphic hemorrhoids": "General Surgeon",
            "Heart attack": "Cardiologist",
            "Varicose veins": "Vascular Surgeon",
            "Hypothyroidism": "Endocrinologist",
            "Hyperthyroidism": "Endocrinologist",
            "Hypoglycemia": "Endocrinologist",
            "Osteoarthritis": "Orthopedic Surgeon",
            "Arthritis": "Rheumatologist",
            "Vertigo": "Neurologist",
            "Acne": "Dermatologist",
            "Urinary tract infection": "Urologist",
            "Psoriasis": "Dermatologist",
            "Impetigo": "Dermatologist",
        }

        # If the disease is not in the map, log a warning and return a default.
        if disease not in specialist_map:
            logger.warning(f"No specialist mapping for disease: '{disease}'. Using General Practitioner.")
            # Optionally, you could also check against known diseases to catch typos.
            if disease not in self.known_diseases:
                logger.warning(f"Unrecognised disease: '{disease}'. It may not match the model's labels.")
            return "General Practitioner"

        return specialist_map[disease]