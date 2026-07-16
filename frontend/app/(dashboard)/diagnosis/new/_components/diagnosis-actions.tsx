// app/(dashboard)/diagnosis/new/_components/diagnosis-actions.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Save, RotateCcw, Loader2 } from "lucide-react";

interface DiagnosisActionsProps {
  onSave: () => void;
  onRetry: () => void;
  isSaving: boolean;
}

export function DiagnosisActions({
  onSave,
  onRetry,
  isSaving,
}: DiagnosisActionsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={onSave} disabled={isSaving} className="min-w-[140px]">
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Diagnosis
          </>
        )}
      </Button>
      <Button variant="outline" onClick={onRetry} disabled={isSaving}>
        <RotateCcw className="mr-2 h-4 w-4" />
        Start New Diagnosis
      </Button>
    </div>
  );
}
