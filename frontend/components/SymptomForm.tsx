"use client";

import { useState } from "react";
import { SymptomFormProps, SymptomFormData } from "../types";

// List of common symptoms from your backend
const AVAILABLE_SYMPTOMS: string[] = [
  "fever",
  "cough",
  "fatigue",
  "headache",
  "sore_throat",
  "muscle_pain",
  "joint_pain",
  "chest_pain",
  "shortness_of_breath",
  "nausea",
  "vomiting",
  "diarrhea",
  "abdominal_pain",
  "skin_rash",
  "itching",
  "dizziness",
  "runny_nose",
  "sneezing",
  "loss_of_appetite",
  "weight_loss",
  "sweating",
];

export default function SymptomForm({ onSubmit, loading }: SymptomFormProps) {
  const [formData, setFormData] = useState<SymptomFormData>({
    patientId: "",
    symptoms: [],
    age: "",
    gender: "",
    duration: "",
    redFlags: [],
  });

  const handleSymptomToggle = (symptom: string): void => {
    setFormData((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom],
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (formData.symptoms.length === 0) {
      alert("Please select at least one symptom");
      return;
    }
    onSubmit(formData);
  };

  const handleReset = (): void => {
    setFormData({
      patientId: "",
      symptoms: [],
      age: "",
      gender: "",
      duration: "",
      redFlags: [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient ID */}
      <div>
        <label
          htmlFor="patientId"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Patient ID (optional)
        </label>
        <input
          id="patientId"
          type="text"
          name="patientId"
          value={formData.patientId}
          onChange={handleInputChange}
          placeholder="e.g., P-2024-001"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Symptoms */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Symptoms <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_SYMPTOMS.map((symptom) => (
            <button
              key={symptom}
              type="button"
              onClick={() => handleSymptomToggle(symptom)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                formData.symptoms.includes(symptom)
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {symptom.replace("_", " ")}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Selected: {formData.symptoms.length} symptoms
        </p>
      </div>

      {/* Patient Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="age"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Age
          </label>
          <input
            id="age"
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            placeholder="e.g., 45"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="0"
            max="150"
          />
        </div>

        <div>
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="duration"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Duration (days)
          </label>
          <input
            id="duration"
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            placeholder="e.g., 3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className={`flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Diagnosing..." : "Get Diagnosis"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
