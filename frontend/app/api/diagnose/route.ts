// app/api/diagnose/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.patient_id) {
      return NextResponse.json(
        { detail: "patient_id is required" },
        { status: 400 },
      );
    }

    if (
      !body.symptoms ||
      !Array.isArray(body.symptoms) ||
      body.symptoms.length === 0
    ) {
      return NextResponse.json(
        { detail: "At least one symptom is required" },
        { status: 400 },
      );
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
    const response = await fetch(`${backendUrl}/api/v1/diagnose`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        patient_id: body.patient_id,
        symptoms: body.symptoms,
        age: body.age || null,
        gender: body.gender || null,
        duration_days: body.duration_days || null,
        red_flags: body.red_flags || [],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("FastAPI error:", errorData);
      return NextResponse.json(
        { detail: `Backend error: ${errorData}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Diagnosis API error:", error);
    return NextResponse.json(
      {
        detail:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
