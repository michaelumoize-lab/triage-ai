from fastapi import APIRouter, HTTPException
from app.models.schemas import SymptomInput, DiagnosisResponse, TriageLevel, DiagnosisItem
from app.services.prediction_service import PredictionService
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize prediction service
try:
    prediction_service = PredictionService()
    logger.info("✅ Prediction service initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize prediction service: {e}")
    prediction_service = None


@router.post("/diagnose", response_model=DiagnosisResponse)
async def diagnose(symptoms: SymptomInput):
    """
    Endpoint for differential diagnosis using ML model.
    """
    if prediction_service is None:
        raise HTTPException(
            status_code=503,
            detail="Prediction service not available. Please check model files."
        )

    try:
        # Get prediction from the model
        result = prediction_service.predict(symptoms.symptoms)

        # Compute red flags (merge input + auto-detection)
        red_flags = prediction_service.get_red_flags(symptoms.symptoms, symptoms.red_flags)

        # Get triage level (considers both symptoms and red_flags)
        triage_level_str = prediction_service.get_triage_level(symptoms.symptoms, red_flags)
        triage_level = TriageLevel(triage_level_str)

        # Get specialist recommendation
        specialist = prediction_service.get_specialist_recommendation(
            result["primary_diagnosis"]["condition"]
        )

        # Determine treatment urgency based on triage
        if triage_level_str in ["immediate", "emergency"]:
            treatment_urgency = "Patient should be seen immediately"
        elif triage_level_str == "urgent":
            treatment_urgency = "Patient should be seen within 24 hours"
        elif triage_level_str == "semi_urgent":
            treatment_urgency = "Patient should be seen within 1 week"
        else:
            treatment_urgency = "Routine follow-up"

        # Build response
        diagnosis = DiagnosisResponse(
            patient_id=symptoms.patient_id,
            triage_level=triage_level,
            primary_diagnosis=DiagnosisItem(
                condition=result["primary_diagnosis"]["condition"],
                probability=result["primary_diagnosis"]["probability"]
            ),
            differential_diagnoses=[
                DiagnosisItem(
                    condition=dx["condition"],
                    probability=dx["probability"]
                )
                for dx in result["differential_diagnoses"]
            ],
            red_flags=red_flags,
            recommended_specialist=specialist,
            confidence_score=result["confidence"],
            treatment_urgency=treatment_urgency
        )

        return diagnosis

    except Exception as e:
        logger.exception("Error in diagnosis")
        raise HTTPException(status_code=500, detail="Diagnosis service failed")