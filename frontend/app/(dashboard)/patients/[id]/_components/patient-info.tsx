// app/(dashboard)/patients/[id]/_components/patient-info.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin, AlertCircle, Pill, FileText } from "lucide-react";
import type { Patient } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

interface PatientInfoProps {
  patient: Patient;
}

export function PatientInfo({ patient }: PatientInfoProps) {
  const hasMedicalInfo =
    patient.allergies ||
    patient.chronicConditions?.length ||
    patient.medications?.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {patient.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{patient.phone}</span>
            </div>
          )}
          {patient.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{patient.email}</span>
            </div>
          )}
          {patient.address && (
            <div className="flex items-center gap-2 text-sm sm:col-span-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{patient.address}</span>
            </div>
          )}
          {!patient.phone && !patient.email && !patient.address && (
            <p className="text-sm text-muted-foreground">
              No contact information available
            </p>
          )}
        </div>

        {/* Medical Information */}
        {hasMedicalInfo && (
          <>
            <hr className="my-4" />
            <div className="space-y-4">
              {patient.allergies && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    Allergies
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {patient.allergies}
                  </p>
                </div>
              )}

              {patient.chronicConditions &&
                patient.chronicConditions.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <FileText className="h-4 w-4" />
                      Chronic Conditions
                    </div>
                    <div className="flex flex-wrap gap-2 pl-6">
                      {(patient.chronicConditions as string[]).map(
                        (condition, index) => (
                          <Badge key={index} variant="secondary">
                            {condition}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {patient.medications && patient.medications.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Pill className="h-4 w-4" />
                    Medications
                  </div>
                  <div className="flex flex-wrap gap-2 pl-6">
                    {(patient.medications as string[]).map(
                      (medication, index) => (
                        <Badge key={index} variant="outline">
                          {medication}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {!hasMedicalInfo && (
          <p className="text-sm text-muted-foreground">
            No medical information available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
