// Input types
export interface SymptomInput {
  patient_id: string;
  symptoms: string[];
  age?: number | null;
  gender?: string | null;
  duration_days?: number | null;
  red_flags?: string[];
}

// Response types
export interface DiagnosisItem {
  condition: string;
  probability: number;
}

export type TriageLevel =
  | "immediate"
  | "emergency"
  | "urgent"
  | "semi_urgent"
  | "non_urgent";

export interface DiagnosisResponse {
  patient_id: string;
  triage_level: TriageLevel;
  primary_diagnosis: DiagnosisItem;
  differential_diagnoses: DiagnosisItem[];
  red_flags: string[];
  recommended_specialist: string;
  confidence_score: number;
  treatment_urgency?: string;
}

// Form data types
export interface SymptomFormData {
  patientId: string;
  symptoms: string[];
  age: string;
  gender: string;
  duration: string;
  redFlags: string[];
}

// Component props types
export interface SymptomFormProps {
  onSubmit: (data: SymptomFormData) => void;
  loading: boolean;
}

export interface DiagnosisResultProps {
  diagnosis: DiagnosisResponse;
  onReset: () => void;
}
