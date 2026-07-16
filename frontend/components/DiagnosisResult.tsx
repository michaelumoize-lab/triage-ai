"use client";

import { DiagnosisResultProps, TriageLevel } from "../types";

export default function DiagnosisResult({
  diagnosis,
  onReset,
}: DiagnosisResultProps) {
  const getTriageColor = (level: TriageLevel): string => {
    const colors: Record<TriageLevel, string> = {
      immediate: "text-red-600 bg-red-50 border-red-200",
      emergency: "text-orange-600 bg-orange-50 border-orange-200",
      urgent: "text-yellow-600 bg-yellow-50 border-yellow-200",
      semi_urgent: "text-blue-600 bg-blue-50 border-blue-200",
      non_urgent: "text-green-600 bg-green-50 border-green-200",
    };
    return colors[level] || "text-gray-600 bg-gray-50";
  };

  const getTriageLabel = (level: TriageLevel): string => {
    const labels: Record<TriageLevel, string> = {
      immediate: "🔴 Immediate",
      emergency: "🟠 Emergency",
      urgent: "🟡 Urgent",
      semi_urgent: "🟢 Semi-Urgent",
      non_urgent: "🔵 Non-Urgent",
    };
    return labels[level] || level;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Diagnosis Results</h2>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          New Diagnosis
        </button>
      </div>

      {/* Patient ID */}
      <div className="text-sm text-gray-500">
        Patient: <span className="font-medium">{diagnosis.patient_id}</span>
      </div>

      {/* Triage Level */}
      <div
        className={`p-4 rounded-lg border-2 ${getTriageColor(diagnosis.triage_level)}`}
      >
        <p className="font-semibold text-lg">
          Triage Level: {getTriageLabel(diagnosis.triage_level)}
        </p>
        {diagnosis.treatment_urgency && (
          <p className="mt-1">{diagnosis.treatment_urgency}</p>
        )}
      </div>

      {/* Primary Diagnosis */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-600 font-semibold">
          Primary Diagnosis
        </p>
        <p className="text-xl font-bold text-green-800">
          {diagnosis.primary_diagnosis.condition}
        </p>
        <p className="text-sm text-green-600">
          Confidence:{" "}
          {(diagnosis.primary_diagnosis.probability * 100).toFixed(1)}%
        </p>
      </div>

      {/* Differential Diagnoses */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Differential Diagnoses
        </p>
        <div className="space-y-2">
          {diagnosis.differential_diagnoses.map((dx, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-2"
            >
              <span className="text-gray-700">{dx.condition}</span>
              <span className="text-sm font-medium text-gray-500">
                {(dx.probability * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Confidence Score */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-600 font-semibold">
          Overall Confidence
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-blue-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${diagnosis.confidence_score * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-blue-800">
            {(diagnosis.confidence_score * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Red Flags */}
      {diagnosis.red_flags && diagnosis.red_flags.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600 font-semibold">⚠️ Red Flags</p>
          <ul className="list-disc list-inside text-red-700">
            {diagnosis.red_flags.map((flag, index) => (
              <li key={index}>{flag.replace("_", " ")}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Specialist */}
      {diagnosis.recommended_specialist && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-600 font-semibold">
            Recommended Specialist
          </p>
          <p className="text-purple-800 font-medium">
            {diagnosis.recommended_specialist}
          </p>
        </div>
      )}
    </div>
  );
}
