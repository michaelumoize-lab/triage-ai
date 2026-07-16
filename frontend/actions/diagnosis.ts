"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { z } from "zod";
import type { ConsultationStatus } from "@prisma/client";

// ============================================
// VALIDATION SCHEMAS
// ============================================

const topPredictionSchema = z.object({
  condition: z.string().min(1),
  probability: z.number().min(0).max(1),
});

const saveDiagnosisSchema = z.object({
  patientId: z.string().min(1),
  symptoms: z.array(z.number().int().min(0).max(1)).min(1), // at least one symptom
  selectedSymptoms: z.array(z.string()).min(1),
  symptomNames: z.array(z.string()).min(1),
  predictedDisease: z.string().min(1),
  confidence: z.number().min(0).max(1),
  topPredictions: z.array(topPredictionSchema).min(1),
  isEmergency: z.boolean().default(false),
  emergencySymptoms: z.array(z.string()).default([]),
});

const feedbackSchema = z.object({
  consultationId: z.string().min(1),
  wasCorrect: z.boolean(),
  actualDisease: z.string().min(1),
  confidenceRating: z.number().int().min(1).max(5),
  comments: z.string().optional(),
});

// ============================================
// HELPERS (shared with API route)
// ============================================

/**
 * Verify that the patient belongs to the doctor.
 */
async function verifyPatientOwnership(
  patientId: string,
  doctorId: string,
): Promise<boolean> {
  const patient = await db.getPatientById(patientId, doctorId);
  return !!patient;
}

/**
 * Verify that the consultation belongs to the doctor.
 */
async function verifyConsultationOwnership(
  consultationId: string,
  doctorId: string,
): Promise<boolean> {
  const consultation = await db.getConsultationById(consultationId, doctorId);
  return !!consultation;
}

// ============================================
// SERVER ACTIONS
// ============================================

export async function saveDiagnosis(data: unknown) {
  // 1. Authenticate
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  // 2. Validate input
  const validated = saveDiagnosisSchema.parse(data);

  // 3. Verify patient ownership
  const isOwner = await verifyPatientOwnership(
    validated.patientId,
    session.user.id,
  );
  if (!isOwner) {
    throw new Error("Patient not found or access denied");
  }

  // 4. Create consultation
  const consultation = await db.createConsultation({
    patientId: validated.patientId,
    doctorId: session.user.id,
    symptoms: validated.symptoms,
    selectedSymptoms: validated.selectedSymptoms,
    symptomNames: validated.symptomNames,
    predictedDisease: validated.predictedDisease,
    confidence: validated.confidence,
    topPredictions: validated.topPredictions,
    isEmergency: validated.isEmergency,
    emergencySymptoms: validated.emergencySymptoms,
    createdBy: session.user.id,
  });

  revalidatePath(`/patients/${validated.patientId}`);
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

export async function submitFeedback(data: unknown) {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  // 1. Validate input
  const validated = feedbackSchema.parse(data);

  // 2. Verify consultation ownership
  const isOwner = await verifyConsultationOwnership(
    validated.consultationId,
    session.user.id,
  );
  if (!isOwner) {
    throw new Error("Consultation not found or access denied");
  }

  // 3. Create feedback
  await db.createFeedback({
    consultationId: validated.consultationId,
    doctorId: session.user.id,
    wasCorrect: validated.wasCorrect,
    actualDisease: validated.actualDisease,
    confidenceRating: validated.confidenceRating,
    comments: validated.comments,
  });

  revalidatePath(`/consultations/${validated.consultationId}`);
}
