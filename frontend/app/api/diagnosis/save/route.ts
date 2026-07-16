// app/api/diagnosis/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { z } from "zod";
import type { ConsultationStatus } from "@prisma/client";

// ============================================
// VALIDATION SCHEMAS
// ============================================

const topPredictionSchema = z.object({
  condition: z.string().min(1, "Condition is required"),
  probability: z.number().min(0).max(1, "Probability must be between 0 and 1"),
});

const saveDiagnosisSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  symptoms: z
    .array(z.string().min(1))
    .min(1, "At least one symptom is required"),
  predictedDisease: z.string().min(1, "Predicted disease is required"),
  confidence: z.number().min(0).max(1, "Confidence must be between 0 and 1"),
  topPredictions: z
    .array(topPredictionSchema)
    .min(1, "Top predictions are required"),
  isEmergency: z.boolean().default(false),
  emergencySymptoms: z.array(z.string()).default([]),
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).default("PENDING"),
});

type SaveDiagnosisInput = z.infer<typeof saveDiagnosisSchema>;

// ============================================
// HELPERS
// ============================================

/**
 * Build a 132-length feature vector from symptom names.
 * Uses model metadata to ensure correct length.
 */
async function buildFeatureVector(symptomNames: string[]): Promise<number[]> {
  const allSymptoms = await db.getSymptoms();
  const symptomMap = new Map(allSymptoms.map((s) => [s.name, s.index]));

  // Validate symptoms exist in the model
  const unknownSymptoms = symptomNames.filter((name) => !symptomMap.has(name));
  if (unknownSymptoms.length > 0) {
    throw new Error(`Unknown symptoms: ${unknownSymptoms.join(", ")}`);
  }

  const vector = new Array(132).fill(0);
  for (const name of symptomNames) {
    const index = symptomMap.get(name);
    if (index !== undefined) {
      vector[index] = 1;
    }
  }
  return vector;
}

/**
 * Verify that the patient belongs to the current doctor.
 */
async function verifyPatientOwnership(
  patientId: string,
  doctorId: string,
): Promise<boolean> {
  const patient = await db.getPatientById(patientId, doctorId);
  return !!patient;
}

// ============================================
// API ROUTE
// ============================================

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const validated = saveDiagnosisSchema.parse(body);

    // 3. Verify patient ownership
    const isOwner = await verifyPatientOwnership(
      validated.patientId,
      session.user.id,
    );
    if (!isOwner) {
      return NextResponse.json(
        { error: "Patient not found or access denied" },
        { status: 404 },
      );
    }

    // 4. Build feature vector (centralized, with validation)
    const symptomArray = await buildFeatureVector(validated.symptoms);

    // 5. Create consultation
    const consultation = await db.createConsultation({
      patientId: validated.patientId,
      doctorId: session.user.id,
      symptoms: symptomArray,
      selectedSymptoms: validated.symptoms,
      symptomNames: validated.symptoms,
      predictedDisease: validated.predictedDisease,
      confidence: validated.confidence,
      topPredictions: validated.topPredictions,
      isEmergency: validated.isEmergency,
      emergencySymptoms: validated.emergencySymptoms || [],
      status: validated.status as ConsultationStatus,
      createdBy: session.user.id,
    });

    return NextResponse.json(
      {
        success: true,
        consultationId: consultation.id,
        message: "Diagnosis saved successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 },
      );
    }

    console.error("Save diagnosis error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
