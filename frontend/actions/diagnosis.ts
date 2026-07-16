"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";

export async function saveDiagnosis(data: {
  patientId: string;
  symptoms: number[];
  selectedSymptoms: string[];
  symptomNames: string[];
  predictedDisease: string;
  confidence: number;
  topPredictions: Array<{ condition: string; probability: number }>; // ✅ changed from 'disease' to 'condition'
  isEmergency: boolean;
  emergencySymptoms: string[];
}) {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const consultation = await db.createConsultation({
    patientId: data.patientId,
    doctorId: session.user.id,
    symptoms: data.symptoms,
    selectedSymptoms: data.selectedSymptoms,
    symptomNames: data.symptomNames,
    predictedDisease: data.predictedDisease,
    confidence: data.confidence,
    topPredictions: data.topPredictions, // now matches the expected type
    isEmergency: data.isEmergency,
    emergencySymptoms: data.emergencySymptoms,
    createdBy: session.user.id,
  });

  revalidatePath(`/patients/${data.patientId}`);
  revalidatePath("/dashboard");

  return consultation;
}

export async function updateConsultationWithDoctorFeedback(data: {
  consultationId: string;
  actualDiagnosis: string;
  doctorNotes: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
}) {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  await db.updateConsultation(data.consultationId, session.user.id, {
    actualDiagnosis: data.actualDiagnosis,
    doctorNotes: data.doctorNotes,
    status: data.status,
    updatedBy: session.user.id,
  });

  revalidatePath(`/consultations/${data.consultationId}`);
}

export async function submitFeedback(data: {
  consultationId: string;
  wasCorrect: boolean;
  actualDisease: string;
  confidenceRating: number;
  comments?: string;
}) {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  await db.createFeedback({
    consultationId: data.consultationId,
    doctorId: session.user.id,
    wasCorrect: data.wasCorrect,
    actualDisease: data.actualDisease,
    confidenceRating: data.confidenceRating,
    comments: data.comments,
  });

  revalidatePath(`/consultations/${data.consultationId}`);
}
