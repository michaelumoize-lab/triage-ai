// app/(dashboard)/diagnosis/new/_components/patient-selector.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Patient } from "@prisma/client";

interface PatientSelectorProps {
  patients: Patient[];
  onSelect: (patientId: string) => void;
  preselectedId?: string | null;
}

export function PatientSelector({
  patients,
  onSelect,
  preselectedId,
}: PatientSelectorProps) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    preselectedId || null,
  );

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(search.toLowerCase()) ||
      patient.email?.toLowerCase().includes(search.toLowerCase()) ||
      patient.phone?.includes(search),
  );

  const handleSelect = (patientId: string) => {
    setSelectedId(patientId);
    onSelect(patientId);
  };

  if (patients.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <User className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">
            No patients found
          </p>
          <p className="text-xs text-muted-foreground/70">
            Add a patient first to start a diagnosis
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search patients..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
        {filteredPatients.map((patient) => (
          <button
            key={patient.id}
            onClick={() => handleSelect(patient.id)}
            className={cn(
              "p-3 text-left rounded-lg border transition-all hover:border-primary",
              selectedId === patient.id
                ? "border-primary bg-primary/5"
                : "border-transparent hover:bg-muted/50",
            )}
          >
            <p className="font-medium">{patient.name}</p>
            <p className="text-sm text-muted-foreground">
              {patient.age ? `${patient.age} years` : "Age unknown"} •{" "}
              {patient.gender || "Gender unknown"}
            </p>
            {patient.phone && (
              <p className="text-xs text-muted-foreground">{patient.phone}</p>
            )}
          </button>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No patients match your search
        </p>
      )}

      <div className="flex justify-end">
        <Button
          onClick={() => selectedId && onSelect(selectedId)}
          disabled={!selectedId}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
