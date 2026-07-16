// app/(dashboard)/consultations/[id]/feedback/_components/feedback-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { submitFeedback } from "@/actions/feedback";
import type { Consultation, Patient, Feedback } from "@prisma/client";

interface FeedbackFormProps {
  consultation: Consultation & {
    patient: Patient | null;
  };
  existingFeedback: Feedback | null;
}

export function FeedbackForm({
  consultation,
  existingFeedback,
}: FeedbackFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [wasCorrect, setWasCorrect] = useState<boolean | undefined>(
    existingFeedback?.wasCorrect ?? undefined,
  );
  const [actualDisease, setActualDisease] = useState<string>(
    existingFeedback?.actualDisease ?? "",
  );
  const [confidenceRating, setConfidenceRating] = useState<string>(
    existingFeedback?.confidenceRating?.toString() ?? "",
  );
  const [comments, setComments] = useState<string>(
    existingFeedback?.comments ?? "",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (wasCorrect === undefined) {
      toast.error("Please indicate if the AI diagnosis was correct");
      return;
    }

    if (!actualDisease.trim()) {
      toast.error("Please enter the actual disease");
      return;
    }

    startTransition(async () => {
      try {
        const result = await submitFeedback({
          consultationId: consultation.id,
          wasCorrect,
          actualDisease: actualDisease.trim(),
          confidenceRating: confidenceRating
            ? parseInt(confidenceRating)
            : undefined,
          comments: comments.trim() || undefined,
        });

        toast.success(result.message);
        router.push(`/consultations/${consultation.id}`);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to submit feedback",
        );
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Feedback for {consultation.patient?.name || "Patient"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Predicted Disease:</span>
              <span className="font-medium ml-2">
                {consultation.predictedDisease || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Confidence:</span>
              <span className="font-medium ml-2">
                {consultation.confidence
                  ? `${(consultation.confidence * 100).toFixed(0)}%`
                  : "N/A"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium ml-2">
                {new Date(consultation.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium ml-2">{consultation.status}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Was AI Correct? */}
          <div className="space-y-2">
            <Label>Was the AI diagnosis correct? *</Label>
            <div className="flex gap-4">
              <button
                type="button"
                className={
                  wasCorrect === true
                    ? "px-4 py-2 rounded-lg border border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                    : "px-4 py-2 rounded-lg border border-muted hover:border-green-200"
                }
                onClick={() => setWasCorrect(true)}
              >
                ✅ Yes
              </button>
              <button
                type="button"
                className={
                  wasCorrect === false
                    ? "px-4 py-2 rounded-lg border border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
                    : "px-4 py-2 rounded-lg border border-muted hover:border-red-200"
                }
                onClick={() => setWasCorrect(false)}
              >
                ❌ No
              </button>
            </div>
          </div>

          {/* Actual Disease */}
          <div className="space-y-2">
            <Label htmlFor="actualDisease">Actual Disease *</Label>
            <Input
              id="actualDisease"
              placeholder="Enter the correct diagnosis"
              value={actualDisease}
              onChange={(e) => setActualDisease(e.target.value)}
              required
            />
          </div>

          {/* Confidence Rating */}
          <div className="space-y-2">
            <Label htmlFor="confidenceRating">Your Confidence (1-5)</Label>
            <Select
              value={confidenceRating} // always a string, never undefined
              onValueChange={(val) => setConfidenceRating(val ?? "")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Very Low</SelectItem>
                <SelectItem value="2">2 - Low</SelectItem>
                <SelectItem value="3">3 - Moderate</SelectItem>
                <SelectItem value="4">4 - High</SelectItem>
                <SelectItem value="5">5 - Very High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments">Additional Comments</Label>
            <Textarea
              id="comments"
              placeholder="Any additional feedback about the diagnosis..."
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending
                ? existingFeedback
                  ? "Updating..."
                  : "Submitting..."
                : existingFeedback
                  ? "Update Feedback"
                  : "Submit Feedback"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/consultations/${consultation.id}`)}
            >
              Cancel
            </Button>
          </div>

          {existingFeedback && (
            <p className="text-sm text-muted-foreground mt-2">
              You already submitted feedback for this consultation. You can
              update it here.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
