// app/(dashboard)/patients/[id]/_components/patient-header.tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Patient } from "@prisma/client";

interface PatientHeaderProps {
  patient: Patient & {
    consultations: { createdAt: Date }[];
  };
}

export function PatientHeader({ patient }: PatientHeaderProps) {
  const lastVisit = patient.consultations[0]?.createdAt;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {patient.name}
              </h1>
              <Badge
                variant="outline"
                className={cn(
                  patient.isArchived && "bg-muted/50 text-muted-foreground",
                )}
              >
                {patient.isArchived ? "Archived" : "Active"}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>ID: {patient.id}</span>
              <span>•</span>
              <span>Age: {patient.age ?? "Not specified"}</span>
              <span>•</span>
              <span>Gender: {patient.gender ?? "Not specified"}</span>
              <span>•</span>
              <span>Blood Type: {patient.bloodType}</span>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <div>
              Created: {new Date(patient.createdAt).toLocaleDateString()}
            </div>
            <div>
              Last Visit:{" "}
              {lastVisit ? new Date(lastVisit).toLocaleDateString() : "Never"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
