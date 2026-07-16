"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PatientSelector } from "./patient-selector";
import { SymptomSelector } from "./symptom-selector";
import { DiagnosisResult } from "./diagnosis-result";
import { DiagnosisActions } from "./diagnosis-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Patient, Symptom } from "@prisma/client";

// ============================================
// TYPES
// ============================================

interface DiagnosisFormProps {
  patients: Patient[];
  symptoms: Symptom[];
  preselectedPatientId: string | null;
  doctorId: string;
}

interface DiagnosisItem {
  condition: string;
  probability: number;
}

interface DiagnosisResponse {
  patient_id: string;
  triage_level:
    | "immediate"
    | "emergency"
    | "urgent"
    | "semi_urgent"
    | "non_urgent";
  primary_diagnosis: DiagnosisItem;
  differential_diagnoses: DiagnosisItem[];
  red_flags: string[];
  recommended_specialist: string;
  confidence_score: number;
  treatment_urgency?: string;
}

// ============================================
// COMPONENT
// ============================================

export function DiagnosisForm({
  patients,
  symptoms,
  preselectedPatientId,
  doctorId,
}: DiagnosisFormProps) {
  const router = useRouter();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    preselectedPatientId,
  );
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [result, setResult] = useState<DiagnosisResponse | null>(null);
  const [step, setStep] = useState<"select" | "symptoms" | "result">("select");

  const diagnosisMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: selectedPatientId,
          symptoms: selectedSymptoms,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Diagnosis failed");
      }

      return response.json() as Promise<DiagnosisResponse>;
    },
    onSuccess: (data) => {
      setResult(data);
      setStep("result");
      toast.success("Diagnosis complete!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to get diagnosis");
    },
  });

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
    setStep("symptoms");
  };

  const handleSymptomsSubmit = () => {
    if (selectedSymptoms.length === 0) {
      toast.error("Please select at least one symptom");
      return;
    }
    diagnosisMutation.mutate();
  };

  const handleReset = () => {
    setResult(null);
    setSelectedSymptoms([]);
    setStep("select");
  };

  const handleSave = async () => {
    if (!result || !selectedPatientId) return;

    try {
      const response = await fetch("/api/diagnosis/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatientId,
          symptoms: selectedSymptoms,
          predictedDisease: result.primary_diagnosis.condition,
          confidence: result.primary_diagnosis.probability,
          topPredictions: result.differential_diagnoses, // ✅ Already the correct shape
          isEmergency:
            result.triage_level === "immediate" ||
            result.triage_level === "emergency",
          emergencySymptoms: result.red_flags || [],
          status: "COMPLETED",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save diagnosis");
      }

      const data = await response.json();
      toast.success("Diagnosis saved successfully!");
      router.push(`/patients/${selectedPatientId}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save diagnosis",
      );
    }
  };

  if (step === "select") {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Select Patient</h2>
            <p className="text-sm text-muted-foreground">
              Choose a patient to begin the diagnosis
            </p>
            <PatientSelector
              patients={patients}
              onSelect={handlePatientSelect}
              preselectedId={preselectedPatientId}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === "symptoms") {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Select Symptoms</h2>
                  <p className="text-sm text-muted-foreground">
                    Select all symptoms the patient is experiencing
                  </p>
                </div>
                <Button variant="outline" onClick={() => setStep("select")}>
                  Change Patient
                </Button>
              </div>
              <div className="text-sm">
                Patient:{" "}
                <span className="font-medium">
                  {patients.find((p) => p.id === selectedPatientId)?.name}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <SymptomSelector
          symptoms={symptoms}
          selectedSymptoms={selectedSymptoms}
          onToggle={(symptomName) => {
            setSelectedSymptoms((prev) =>
              prev.includes(symptomName)
                ? prev.filter((s) => s !== symptomName)
                : [...prev, symptomName],
            );
          }}
          onSubmit={handleSymptomsSubmit}
          isLoading={diagnosisMutation.isPending}
          selectedCount={selectedSymptoms.length}
        />
      </div>
    );
  }

  if (step === "result" && result) {
    return (
      <div className="space-y-6">
        <DiagnosisResult result={result} />

        <DiagnosisActions
          onSave={handleSave}
          onRetry={handleReset}
          isSaving={false}
        />
      </div>
    );
  }

  return null;
}
