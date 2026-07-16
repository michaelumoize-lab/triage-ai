// app/api/diagnosis/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import type { ConsultationStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const requiredFields = [
      "patientId",
      "symptoms",
      "predictedDisease",
      "confidence",
      "topPredictions",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 },
        );
      }
    }

    // Fetch all symptoms to build the 132-array
    const allSymptoms = await db.getSymptoms();

    // Convert symptom names to 132-array
    const symptomArray = new Array(132).fill(0);
    body.symptoms.forEach((symptomName: string) => {
      const symptom = allSymptoms.find((s) => s.name === symptomName);
      if (symptom) {
        symptomArray[symptom.index] = 1;
      }
    });

    // Create consultation
    const consultation = await db.createConsultation({
      patientId: body.patientId,
      doctorId: session.user.id,
      symptoms: symptomArray,
      selectedSymptoms: body.symptoms,
      symptomNames: body.symptoms,
      predictedDisease: body.predictedDisease,
      confidence: body.confidence,
      topPredictions: body.topPredictions,
      isEmergency: body.isEmergency || false,
      emergencySymptoms: body.emergencySymptoms || [],
      status: body.status || "PENDING",
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
    console.error("Save diagnosis error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
