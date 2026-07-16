from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from enum import Enum


class TriageLevel(str, Enum):
    """Triage priority levels"""
    IMMEDIATE = "immediate"
    EMERGENCY = "emergency"
    URGENT = "urgent"
    SEMI_URGENT = "semi_urgent"
    NON_URGENT = "non_urgent"


class SymptomInput(BaseModel):
    """
    Input model for diagnosis requests
    """
    patient_id: str = Field(..., description="Unique patient identifier")
    symptoms: List[str] = Field(..., description="List of symptoms")
    age: Optional[int] = Field(None, description="Patient age in years")
    gender: Optional[str] = Field(None, description="Patient gender")
    duration_days: Optional[int] = Field(None, description="Duration of symptoms in days")
    red_flags: Optional[List[str]] = Field(None, description="Emergency symptoms")
    
    class Config:
        json_schema_extra = {
            "example": {
                "patient_id": "P-2024-001",
                "symptoms": ["fever", "cough", "fatigue"],
                "age": 45,
                "gender": "female",
                "duration_days": 3,
                "red_flags": ["chest_pain"]
            }
        }


class DiagnosisItem(BaseModel):
    """Individual diagnosis with probability"""
    condition: str
    probability: float = Field(ge=0, le=1, description="Probability score between 0 and 1")


class DiagnosisResponse(BaseModel):
    """
    Response model for diagnosis
    """
    patient_id: str
    triage_level: TriageLevel
    primary_diagnosis: DiagnosisItem
    differential_diagnoses: List[DiagnosisItem] = Field(..., max_length=5)
    red_flags: List[str] = []
    recommended_specialist: str
    confidence_score: float = Field(ge=0, le=1)
    treatment_urgency: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "patient_id": "P-2024-001",
                "triage_level": "urgent",
                "primary_diagnosis": {
                    "condition": "Pneumonia",
                    "probability": 0.78
                },
                "differential_diagnoses": [
                    {"condition": "Bronchitis", "probability": 0.12},
                    {"condition": "Influenza", "probability": 0.08},
                    {"condition": "COVID-19", "probability": 0.02}
                ],
                "red_flags": ["chest_pain"],
                "recommended_specialist": "Pulmonologist",
                "confidence_score": 0.85,
                "treatment_urgency": "Patient should be seen within 24 hours"
            }
        }


class HealthStatus(BaseModel):
    """Health check response"""
    status: str
    service: str
    version: str