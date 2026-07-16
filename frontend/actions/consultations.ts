// actions/consultations.ts
"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import type { ConsultationStatus } from "@prisma/client";

export async function updateConsultation(data: {
  consultationId: string;
  doctorNotes?: string;
  status?: ConsultationStatus;
  actualDiagnosis?: string;
}) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  await db.updateConsultation(data.consultationId, session.user.id, {
    doctorNotes: data.doctorNotes,
    status: data.status,
    actualDiagnosis: data.actualDiagnosis,
    updatedBy: session.user.id,
  });

  revalidatePath(`/consultations/${data.consultationId}`);
  revalidatePath(`/patients/*`);
}

export async function updateConsultationWithNewDiagnosis(data: {
  consultationId: string;
  symptoms: number[];
  selectedSymptoms: string[];
  symptomNames: string[];
  predictedDisease: string;
  confidence: number;
  topPredictions: Array<{ condition: string; probability: number }>;
  isEmergency: boolean;
  emergencySymptoms: string[];
}) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  await db.updateConsultation(data.consultationId, session.user.id, {
    symptoms: data.symptoms,
    selectedSymptoms: data.selectedSymptoms,
    symptomNames: data.symptomNames,
    predictedDisease: data.predictedDisease,
    confidence: data.confidence,
    topPredictions: data.topPredictions,
    isEmergency: data.isEmergency,
    emergencySymptoms: data.emergencySymptoms,
    updatedBy: session.user.id,
  });

  revalidatePath(`/consultations/${data.consultationId}`);
  revalidatePath(`/patients/*`);
}
