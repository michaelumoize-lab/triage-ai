// app/(dashboard)/consultations/[id]/_components/consultation-detail.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  updateConsultation,
  updateConsultationWithNewDiagnosis,
} from "@/actions/consultations";
import {
  Calendar,
  User as UserIcon,
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  FileText,
  Brain,
  Activity,
  Edit,
  X,
} from "lucide-react";
import type { Consultation, Patient, User, Symptom } from "@prisma/client";
import Link from "next/link";
import { SymptomSelector } from "@/app/(dashboard)/diagnosis/new/_components/symptom-selector"; // adjust path if needed

// ============================================
// TYPES
// ============================================

type ConsultationWithRelations = Consultation & {
  patient: Patient | null;
  doctor: Pick<User, "id" | "name" | "specialty"> | null;
  feedback: {
    id: string;
    wasCorrect: boolean;
    actualDisease: string;
    confidenceRating: number | null;
    comments: string | null;
  } | null;
};

interface ConsultationDetailProps {
  consultation: ConsultationWithRelations;
  allSymptoms: Symptom[];
}

type StatusType = "PENDING" | "COMPLETED" | "CANCELLED";

// ============================================
// HELPERS
// ============================================

const statusLabels: Record<StatusType, string> = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const statusColors: Record<StatusType, string> = {
  PENDING:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400",
  COMPLETED:
    "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400",
};

// ============================================
// COMPONENT
// ============================================

export function ConsultationDetail({
  consultation,
  allSymptoms,
}: ConsultationDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditingSymptoms, setIsEditingSymptoms] = useState(false);
  const [isReDiagnosing, setIsReDiagnosing] = useState(false);
  const [notes, setNotes] = useState(consultation.doctorNotes || "");
  const [status, setStatus] = useState<StatusType>(
    consultation.status as StatusType,
  );
  const [actualDiagnosis, setActualDiagnosis] = useState(
    consultation.actualDiagnosis || "",
  );

  // For symptom editing
  const initialSymptoms = (consultation.symptomNames as string[]) || [];
  const [editedSymptoms, setEditedSymptoms] =
    useState<string[]>(initialSymptoms);

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateConsultation({
          consultationId: consultation.id,
          doctorNotes: notes,
          status,
          actualDiagnosis: actualDiagnosis || undefined,
        });
        toast.success("Consultation updated successfully");
        router.refresh();
      } catch {
        toast.error("Failed to update consultation");
      }
    });
  };

  const handleReDiagnose = async () => {
    if (editedSymptoms.length === 0) {
      toast.error("Please select at least one symptom");
      return;
    }

    setIsReDiagnosing(true);
    try {
      // 1. Call diagnosis API with new symptoms
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: consultation.patientId,
          symptoms: editedSymptoms,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Re-diagnosis failed");
      }

      const result = await response.json();

      // 2. Build the 132‑length symptom array
      const symptomArray = new Array(132).fill(0);
      editedSymptoms.forEach((symptomName) => {
        const symptom = allSymptoms.find((s) => s.name === symptomName);
        if (symptom) symptomArray[symptom.index] = 1;
      });

      // 3. Save the updated diagnosis
      await updateConsultationWithNewDiagnosis({
        consultationId: consultation.id,
        symptoms: symptomArray,
        selectedSymptoms: editedSymptoms,
        symptomNames: editedSymptoms,
        predictedDisease: result.primary_diagnosis.condition,
        confidence: result.primary_diagnosis.probability,
        topPredictions: result.differential_diagnoses,
        isEmergency:
          result.triage_level === "immediate" ||
          result.triage_level === "emergency",
        emergencySymptoms: result.red_flags || [],
      });

      toast.success("Diagnosis re-run successfully");
      router.refresh();
      setIsEditingSymptoms(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to re-run diagnosis",
      );
    } finally {
      setIsReDiagnosing(false);
    }
  };

  // Parse symptoms from JSON
  const symptomNames = (consultation.symptomNames as string[]) || [];
  const topPredictions =
    (consultation.topPredictions as Array<{
      condition: string;
      probability: number;
    }>) || [];

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(consultation.createdAt).toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {consultation.patient?.name || "Unknown Patient"}
                </span>
              </div>
              {consultation.doctor && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Stethoscope className="h-4 w-4" />
                  Dr. {consultation.doctor.name}
                  {consultation.doctor.specialty &&
                    ` • ${consultation.doctor.specialty}`}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {consultation.isEmergency && (
                <Badge variant="destructive">🚨 Emergency</Badge>
              )}
              <Badge className={statusColors[status]}>
                {statusLabels[status]}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Confidence Score</p>
              <div className="flex items-center gap-3 mt-1">
                <Progress
                  value={(consultation.confidence || 0) * 100}
                  className="h-2 flex-1"
                />
                <span className="text-sm font-medium">
                  {((consultation.confidence || 0) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className={statusColors[status]}>
                {statusLabels[status]}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary Diagnosis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            AI Diagnosis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Predicted Disease</p>
            <p className="text-2xl font-bold">
              {consultation.predictedDisease || "Not available"}
            </p>
          </div>

          {topPredictions.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Top Predictions
              </p>
              <div className="space-y-2">
                {topPredictions.map((pred, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm min-w-[120px]">
                      {pred.condition}
                    </span>
                    <Progress
                      value={pred.probability * 100}
                      className="h-2 flex-1"
                    />
                    <span className="text-sm font-medium min-w-[40px]">
                      {(pred.probability * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {consultation.explanation && (
            <div>
              <p className="text-sm text-muted-foreground">Explanation</p>
              <p className="text-sm mt-1">
                {typeof consultation.explanation === "string"
                  ? consultation.explanation
                  : JSON.stringify(consultation.explanation)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Symptoms – with Edit mode */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-muted-foreground" />
            Selected Symptoms
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditingSymptoms(!isEditingSymptoms)}
            className="gap-1"
          >
            {isEditingSymptoms ? (
              <>
                <X className="h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <Edit className="h-4 w-4" />
                Edit
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {isEditingSymptoms ? (
            <div className="space-y-4">
              <SymptomSelector
                symptoms={allSymptoms}
                selectedSymptoms={editedSymptoms}
                onToggle={(symptomName) => {
                  setEditedSymptoms((prev) =>
                    prev.includes(symptomName)
                      ? prev.filter((s) => s !== symptomName)
                      : [...prev, symptomName],
                  );
                }}
                onSubmit={handleReDiagnose}
                isLoading={isReDiagnosing}
                selectedCount={editedSymptoms.length}
              />
              <div className="text-sm text-muted-foreground">
                {editedSymptoms.length} symptoms selected
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {symptomNames.length > 0 ? (
                symptomNames.map((symptom) => (
                  <Badge key={symptom} variant="secondary">
                    {symptom.replace(/_/g, " ")}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No symptoms recorded
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Red Flags */}
      {consultation.emergencySymptoms &&
        consultation.emergencySymptoms.length > 0 && (
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Red Flags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1">
                {consultation.emergencySymptoms.map((flag, index) => (
                  <li
                    key={index}
                    className="text-sm text-red-600 dark:text-red-400"
                  >
                    {flag.replace(/_/g, " ")}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

      {/* Feedback */}
      {consultation.feedback && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Doctor&apos;s Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-4">
              <Badge
                variant={
                  consultation.feedback.wasCorrect ? "default" : "destructive"
                }
              >
                {consultation.feedback.wasCorrect
                  ? "✅ Correct"
                  : "❌ Incorrect"}
              </Badge>
              {consultation.feedback.confidenceRating && (
                <span className="text-sm text-muted-foreground">
                  Confidence: {consultation.feedback.confidenceRating}/5
                </span>
              )}
            </div>
            {consultation.feedback.actualDisease && (
              <p className="text-sm">
                <span className="font-medium">Actual Disease:</span>{" "}
                {consultation.feedback.actualDisease}
              </p>
            )}
            {consultation.feedback.comments && (
              <p className="text-sm text-muted-foreground">
                {consultation.feedback.comments}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Doctor's Notes & Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-muted-foreground" />
            Clinical Review
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="actualDiagnosis">
              Actual Diagnosis (if different from AI)
            </Label>
            <Input
              id="actualDiagnosis"
              placeholder="Enter the final diagnosis"
              value={actualDiagnosis}
              onChange={(e) => setActualDiagnosis(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Doctor&apos;s Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add your clinical notes..."
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(val) => setStatus(val as StatusType)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/patients/${consultation.patientId}`)}
            >
              View Patient
            </Button>
            {!consultation.feedback ? (
              <Link href={`/consultations/${consultation.id}/feedback`}>
                <Button variant="outline">Submit Feedback</Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/consultations/${consultation.id}/feedback`)
                }
              >
                Update Feedback
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
