"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  CheckCircle,
  Activity,
  Stethoscope,
  Loader2,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ============================================
// TYPES
// ============================================

interface DiagnosisResultProps {
  result: {
    patient_id: string;
    triage_level:
      | "immediate"
      | "emergency"
      | "urgent"
      | "semi_urgent"
      | "non_urgent";
    primary_diagnosis: {
      condition: string;
      probability: number;
    };
    differential_diagnoses: {
      condition: string;
      probability: number;
    }[];
    red_flags: string[];
    recommended_specialist: string;
    confidence_score: number;
    treatment_urgency?: string;
  };
}

interface DiseaseExplanation {
  name: string;
  description: string;
  treatment: string;
  symptoms: string[];
  specialist: string;
  category?: string | null;
}

// ============================================
// HELPERS
// ============================================

const triageColors = {
  immediate:
    "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-400",
  emergency:
    "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-400",
  urgent:
    "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-400",
  semi_urgent:
    "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-400",
  non_urgent:
    "bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-400",
};

const triageLabels = {
  immediate: "🔴 Immediate",
  emergency: "🟠 Emergency",
  urgent: "🟡 Urgent",
  semi_urgent: "🟢 Semi-Urgent",
  non_urgent: "🔵 Non-Urgent",
};

// ============================================
// COMPONENT
// ============================================

export function DiagnosisResult({ result }: DiagnosisResultProps) {
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [explanation, setExplanation] = useState<DiseaseExplanation | null>(
    null,
  );
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

  const handleLearnMore = async () => {
    if (explanation) {
      setIsExplanationOpen(true);
      return;
    }

    setIsLoadingExplanation(true);
    try {
      const response = await fetch(
        `/api/v1/disease/${encodeURIComponent(result.primary_diagnosis.condition)}/explain`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch explanation");
      }
      const data = await response.json();
      setExplanation(data);
      setIsExplanationOpen(true);
    } catch (error) {
      toast.error("Could not load disease explanation. Please try again.");
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Triage Level */}
        <Card className={cn("border-2", triageColors[result.triage_level])}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Triage Level</p>
                <p className="text-2xl font-bold">
                  {triageLabels[result.triage_level]}
                </p>
                {result.treatment_urgency && (
                  <p className="text-sm mt-1">{result.treatment_urgency}</p>
                )}
              </div>
              <Activity className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>

        {/* Primary Diagnosis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Primary Diagnosis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">
                {result.primary_diagnosis.condition}
              </p>
              <div className="flex items-center gap-3">
                <Progress
                  value={result.primary_diagnosis.probability * 100}
                  className="h-2 flex-1"
                />
                <span className="text-sm font-medium min-w-12">
                  {(result.primary_diagnosis.probability * 100).toFixed(0)}%
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                Confidence: {(result.confidence_score * 100).toFixed(0)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Differential Diagnoses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Differential Diagnoses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.differential_diagnoses.map((dx, index) => (
              <div key={index} className="flex items-center justify-between">
                <span>{dx.condition}</span>
                <span className="text-sm text-muted-foreground">
                  {(dx.probability * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Red Flags */}
        {result.red_flags.length > 0 && (
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Red Flags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1">
                {result.red_flags.map((flag, index) => (
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

        {/* Specialist */}
        {result.recommended_specialist && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Recommended Specialist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">
                {result.recommended_specialist}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Learn More Button */}
        <Button
          variant="outline"
          onClick={handleLearnMore}
          disabled={isLoadingExplanation}
          className="w-full sm:w-auto"
        >
          {isLoadingExplanation ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <BookOpen className="mr-2 h-4 w-4" />
              Learn More About {result.primary_diagnosis.condition}
            </>
          )}
        </Button>
      </div>

      {/* Explanation Dialog */}
      <Dialog open={isExplanationOpen} onOpenChange={setIsExplanationOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {explanation?.name || result.primary_diagnosis.condition}
            </DialogTitle>
            {explanation?.category && (
              <DialogDescription className="text-sm text-muted-foreground">
                Category: {explanation.category}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4">
            {explanation?.description && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  Overview
                </h4>
                <p className="text-sm leading-relaxed">
                  {explanation.description}
                </p>
              </div>
            )}
            {explanation?.symptoms && explanation.symptoms.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  Common Symptoms
                </h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {explanation.symptoms.map((symptom) => (
                    <li key={symptom}>{symptom}</li>
                  ))}
                </ul>
              </div>
            )}
            {explanation?.treatment && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  Treatment
                </h4>
                <p className="text-sm leading-relaxed">
                  {explanation.treatment}
                </p>
              </div>
            )}
            {explanation?.specialist && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  Recommended Specialist
                </h4>
                <p className="text-sm font-medium">{explanation.specialist}</p>
              </div>
            )}
            {!explanation && (
              <div className="text-center py-8 text-muted-foreground">
                No explanation available.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
