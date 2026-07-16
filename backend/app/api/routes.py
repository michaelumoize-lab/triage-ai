from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.models.schemas import (  # Use full path
    SymptomInput,
    DiagnosisResponse,
    TriageLevel
)

router = APIRouter()

# Temporary in-memory storage
diagnosis_history = []


@router.post("/diagnose", response_model=DiagnosisResponse)
async def diagnose(symptoms: SymptomInput):
    """
    Endpoint for differential diagnosis.
    Currently returns mock data - will be replaced with ML model.
    """
    try:
        # Mock diagnosis response
        diagnosis = DiagnosisResponse(
            patient_id=symptoms.patient_id,
            triage_level=TriageLevel.URGENT,
            primary_diagnosis={
                "condition": "Sample Diagnosis",
                "probability": 0.75
            },
            differential_diagnoses=[
                {"condition": "Alternative Diagnosis 1", "probability": 0.15},
                {"condition": "Alternative Diagnosis 2", "probability": 0.07},
                {"condition": "Alternative Diagnosis 3", "probability": 0.03}
            ],
            red_flags=symptoms.red_flags if symptoms.red_flags else [],
            recommended_specialist="General Practitioner",
            confidence_score=0.85
        )
        
        # Store in history
        diagnosis_history.append({
            "patient_id": symptoms.patient_id,
            "symptoms": symptoms.symptoms,
            "diagnosis": diagnosis.dict()
        })
        
        return diagnosis
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{patient_id}")
async def get_history(patient_id: str):
    """Get diagnosis history for a patient."""
    history = [entry for entry in diagnosis_history if entry["patient_id"] == patient_id]
    if not history:
        raise HTTPException(status_code=404, detail="No history found for this patient")
    return {"history": history}


@router.get("/symptoms")
async def get_symptom_list():
    """Get the complete list of available symptoms."""
    sample_symptoms = [
        "itching", "skin_rash", "nodal_skin_eruptions", "continuous_sneezing",
        "shivering", "chills", "joint_pain", "stomach_pain", "acidity",
        "ulcers_on_tongue", "muscle_wasting", "vomiting", "burning_micturition",
        "spotting_urination", "fatigue", "weight_gain", "anxiety",
        "cold_hands_and_feets", "mood_swings", "weight_loss", "restlessness",
        "lethargy", "patches_in_throat", "irregular_sugar_level", "cough",
        "high_fever", "sunken_eyes", "breathlessness", "sweating",
        "dehydration", "indigestion", "headache", "yellowish_skin",
        "dark_urine", "nausea", "loss_of_appetite", "pain_behind_the_eyes",
        "back_pain", "constipation", "abdominal_pain", "diarrhoea",
        "mild_fever", "yellow_urine", "yellowing_of_eyes", "acute_liver_failure",
        "fluid_overload", "swelling_of_stomach", "swelled_lymph_nodes",
        "malaise", "blurred_and_distorted_vision", "phlegm", "throat_irritation",
        "redness_of_eyes", "sinus_pressure", "runny_nose", "congestion",
        "chest_pain", "weakness_in_limbs", "fast_heart_rate",
        "pain_during_bowel_movements", "pain_in_anal_region", "bloody_stool",
        "irritation_in_anus", "neck_pain", "dizziness", "cramps",
        "bruising", "obesity", "swollen_legs", "swollen_blood_vessels",
        "puffy_face_and_eyes", "enlarged_thyroid", "brittle_nails",
        "swollen_extremeties", "excessive_hunger", "extra_marital_contacts",
        "drying_and_tingling_lips", "slurred_speech", "knee_pain", "hip_joint_pain",
        "muscle_weakness", "stiff_neck", "swelling_joints", "movement_stiffness",
        "spinning_movements", "loss_of_balance", "unsteadiness",
        "weakness_of_one_body_side", "loss_of_smell", "bladder_discomfort",
        "foul_smell_of_urine", "continuous_feel_of_urine", "passage_of_gases",
        "internal_itching", "toxic_look_(typhos)", "depression", "irritability",
        "muscle_pain", "altered_sensorium", "red_spots_over_body",
        "belly_pain", "abnormal_menstruation", "dischromic_patches",
        "watering_from_eyes", "increased_appetite", "polyuria",
        "family_history", "mucoid_sputum", "rusty_sputum", "lack_of_concentration",
        "visual_disturbances", "receiving_blood_transfusion",
        "receiving_unsterile_injections", "coma", "stomach_bleeding",
        "distention_of_abdomen", "history_of_alcohol_consumption",
        "fluid_overload.1", "blood_in_sputum", "prominent_veins_on_calf",
        "palpitations", "painful_walking", "pus_filled_pimples",
        "blackheads", "scurring", "skin_peeling", "silver_like_dusting",
        "small_dents_in_nails", "inflammatory_nails", "blister",
        "red_sore_around_nose", "yellow_crust_ooze"
    ]
    return {"symptoms": sample_symptoms}


@router.get("/diseases")
async def get_disease_list():
    """Get the complete list of diseases the model can predict."""
    diseases = [
        "Fungal infection", "Allergy", "GERD", "Chronic cholestasis",
        "Drug Reaction", "Peptic ulcer disease", "AIDS", "Diabetes",
        "Gastroenteritis", "Bronchial Asthma", "Hypertension", "Migraine",
        "Cervical spondylosis", "Jaundice", "Malaria", "Chicken pox",
        "Dengue", "Typhoid", "hepatitis A", "Hepatitis B", "Hepatitis C",
        "Hepatitis D", "Hepatitis E", "Alcoholic hepatitis", "Tuberculosis",
        "Common Cold", "Pneumonia", "Dimorphic hemorrhoids",
        "Heart attack", "Varicose veins", "Hypothyroidism", "Hyperthyroidism",
        "Hypoglycemia", "Osteoarthritis", "Arthritis", "Vertigo",
        "Acne", "Urinary tract infection", "Psoriasis", "Impetigo"
    ]
    return {"diseases": diseases}