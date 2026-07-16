// app/(dashboard)/patients/[id]/_components/patient-actions.tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, Archive } from "lucide-react";
import { toast } from "sonner";
import { archivePatient } from "@/actions/patients";
import Link from "next/link";

interface PatientActionsProps {
  patientId: string;
  isArchived: boolean;
}

export function PatientActions({ patientId, isArchived }: PatientActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleArchive = () => {
    startTransition(async () => {
      try {
        await archivePatient(patientId);
        toast.success("Patient archived successfully");
        router.refresh();
      } catch {
        toast.error("Failed to archive patient");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* ✅ Fixed: Link wraps Button, icon inside Button */}
        <Link
          href={`/diagnosis/new?patientId=${patientId}`}
          className="block w-full"
        >
          <Button className="w-full">
            <Stethoscope className="mr-2 h-4 w-4" />
            New Diagnosis
          </Button>
        </Link>

        <Link href={`/patients/${patientId}/edit`}>
          <Button variant="outline" className="w-full mb-3">
            Edit Patient
          </Button>
        </Link>

        {!isArchived ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleArchive}
            disabled={isPending}
          >
            <Archive className="mr-2 h-4 w-4" />
            {isPending ? "Archiving..." : "Archive Patient"}
          </Button>
        ) : (
          <Button variant="outline" className="w-full" disabled>
            <Archive className="mr-2 h-4 w-4" />
            Patient Archived
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
