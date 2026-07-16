"use client";

import { useState } from "react";
import SymptomForm from "../components/SymptomForm";
import DiagnosisResult from "../components/DiagnosisResult";
import LoadingSpinner from "../components/LoadingSpinner";
import { SymptomFormData, DiagnosisResponse } from "../types";

export default function Home() {
  const [diagnosis, setDiagnosis] = useState<DiagnosisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleDiagnose = async (formData: SymptomFormData) => {
    setLoading(true);
    setError(null);
    setDiagnosis(null);

    try {
      const response = await fetch("/api/v1/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_id: formData.patientId || `P-${Date.now()}`,
          symptoms: formData.symptoms,
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender || null,
          duration_days: formData.duration ? parseInt(formData.duration) : null,
          red_flags: formData.redFlags || [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Diagnosis failed");
      }

      const data: DiagnosisResponse = await response.json();
      setDiagnosis(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDiagnosis(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block p-3 bg-blue-600 rounded-full mb-4">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800">TriageAI</h1>
          <p className="text-gray-600 mt-2">
            AI-Powered Clinical Triage & Differential Diagnosis
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {!diagnosis && !loading && (
            <SymptomForm onSubmit={handleDiagnose} loading={loading} />
          )}

          {loading && <LoadingSpinner />}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
              <button
                onClick={handleReset}
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {diagnosis && (
            <DiagnosisResult diagnosis={diagnosis} onReset={handleReset} />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>⚠️ For demonstration purposes only. Not for actual medical use.</p>
        </div>
      </div>
    </main>
  );
}
