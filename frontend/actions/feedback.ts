// actions/feedback.ts
"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { z } from "zod";

// ============================================
// VALIDATION SCHEMA
// ============================================

const feedbackSchema = z.object({
  consultationId: z.string(),
  wasCorrect: z.boolean(),
  actualDisease: z.string().min(1, "Please enter the actual disease"),
  confidenceRating: z.number().int().min(1).max(5).optional(),
  comments: z.string().optional(),
});

type FeedbackInput = z.infer<typeof feedbackSchema>;

// ============================================
// SERVER ACTIONS
// ============================================

export async function submitFeedback(data: FeedbackInput) {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  // Validate input
  const validated = feedbackSchema.parse(data);

  // Check if consultation exists and belongs to this doctor
  const consultation = await db.getConsultationById(
    validated.consultationId,
    session.user.id,
  );

  if (!consultation) {
    throw new Error("Consultation not found or you don't have access");
  }

  // Check if feedback already exists
  const existingFeedback = await db.getFeedbackByConsultationId(
    validated.consultationId,
  );

  if (existingFeedback) {
    // Update existing feedback
    await db.updateFeedback(existingFeedback.id, {
      wasCorrect: validated.wasCorrect,
      actualDisease: validated.actualDisease,
      confidenceRating: validated.confidenceRating,
      comments: validated.comments,
    });
    revalidatePath(`/consultations/${validated.consultationId}`);
    return { success: true, message: "Feedback updated successfully" };
  }

  // Create new feedback
  await db.createFeedback({
    consultationId: validated.consultationId,
    doctorId: session.user.id,
    wasCorrect: validated.wasCorrect,
    actualDisease: validated.actualDisease,
    confidenceRating: validated.confidenceRating,
    comments: validated.comments,
  });

  revalidatePath(`/consultations/${validated.consultationId}`);
  return { success: true, message: "Feedback submitted successfully" };
}
