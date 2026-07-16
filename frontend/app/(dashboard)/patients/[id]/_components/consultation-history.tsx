// app/(dashboard)/patients/[id]/_components/consultation-history.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Calendar, Activity } from "lucide-react";
import type { Consultation } from "@prisma/client";
import Link from "next/link";

interface ConsultationHistoryProps {
  consultations: Consultation[];
}

export function ConsultationHistory({
  consultations,
}: ConsultationHistoryProps) {
  const statusColors: Record<string, string> = {
    PENDING:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    COMPLETED:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  const statusLabels: Record<string, string> = {
    PENDING: "Pending",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  if (consultations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Consultation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Stethoscope className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">
              No consultations yet
            </p>
            <p className="text-xs text-muted-foreground/70">
              Start a new diagnosis for this patient
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consultation History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {consultations.map((consultation) => (
          <Link
            key={consultation.id}
            href={`/consultations/${consultation.id}`}
            className="block transition-colors hover:bg-muted/50 rounded-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-4 hover:border-primary/30 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {consultation.predictedDisease || "Awaiting diagnosis"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(consultation.createdAt).toLocaleDateString()}
                  </span>
                  {consultation.confidence !== null && (
                    <span>
                      Confidence: {(consultation.confidence * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusColors[consultation.status]}>
                  {statusLabels[consultation.status] || consultation.status}
                </Badge>
                {consultation.isEmergency && (
                  <Badge variant="destructive">🚨 Emergency</Badge>
                )}
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
