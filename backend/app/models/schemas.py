# backend/app/models/schemas.py
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

# ============================================
# ENUMS
# ============================================

class TriageLevel(str, Enum):
    IMMEDIATE = "immediate"
    EMERGENCY = "emergency"
    URGENT = "urgent"
    SEMI_URGENT = "semi_urgent"
    NON_URGENT = "non_urgent"

# ============================================
# INPUT SCHEMAS
# ============================================

class SymptomInput(BaseModel):
    patient_id: str
    symptoms: List[str]
    age: Optional[int] = None
    gender: Optional[str] = None
    duration_days: Optional[int] = None
    red_flags: Optional[List[str]] = []

# ============================================
# OUTPUT SCHEMAS
# ============================================

class DiagnosisItem(BaseModel):
    condition: str
    probability: float = Field(ge=0, le=1)

class DiagnosisResponse(BaseModel):
    patient_id: str
    triage_level: TriageLevel
    primary_diagnosis: DiagnosisItem
    differential_diagnoses: List[DiagnosisItem]
    red_flags: List[str] = []
    recommended_specialist: str
    confidence_score: float = Field(ge=0, le=1)
    treatment_urgency: Optional[str] = None