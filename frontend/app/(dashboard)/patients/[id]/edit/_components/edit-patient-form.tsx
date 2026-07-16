// app/(dashboard)/patients/[id]/edit/_components/edit-patient-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updatePatient } from "@/actions/patients";
import type { Patient } from "@prisma/client";

// ============================================
// TYPES
// ============================================

interface EditPatientFormProps {
  patient: Patient;
}

// ============================================
// COMPONENT
// ============================================

export function EditPatientForm({ patient }: EditPatientFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // All state fields are guaranteed to be strings
  const [formData, setFormData] = useState({
    name: patient.name ?? "",
    age: patient.age?.toString() ?? "",
    gender: patient.gender ?? "",
    bloodType: patient.bloodType ?? "UNKNOWN",
    phone: patient.phone ?? "",
    email: patient.email ?? "",
    address: patient.address ?? "",
    allergies: patient.allergies ?? "",
    chronicConditions: Array.isArray(patient.chronicConditions)
      ? patient.chronicConditions.join(", ")
      : "",
    medications: Array.isArray(patient.medications)
      ? patient.medications.join(", ")
      : "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic age validation
    const age = Number(formData.age);
    if (formData.age && (isNaN(age) || age < 0 || age > 150)) {
      toast.error("Please enter a valid age (0-150)");
      return;
    }

    startTransition(async () => {
      try {
        const formDataObj = new FormData();
        formDataObj.append("name", formData.name);

        if (formData.age) formDataObj.append("age", formData.age);
        if (formData.gender) formDataObj.append("gender", formData.gender);
        if (formData.bloodType)
          formDataObj.append("bloodType", formData.bloodType);
        if (formData.phone) formDataObj.append("phone", formData.phone);
        if (formData.email) formDataObj.append("email", formData.email);
        if (formData.address) formDataObj.append("address", formData.address);
        if (formData.allergies)
          formDataObj.append("allergies", formData.allergies);

        formDataObj.append("chronicConditions", formData.chronicConditions);
        formDataObj.append("medications", formData.medications);

        await updatePatient(patient.id, formDataObj);
        toast.success("Patient updated successfully");
        router.push(`/patients/${patient.id}`);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update patient",
        );
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Patient Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, age: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender || undefined}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, gender: val ?? "" }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodType">Blood Type</Label>
              <Select
                value={formData.bloodType}
                onValueChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    bloodType: val ?? "UNKNOWN",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A_POSITIVE">A Positive</SelectItem>
                  <SelectItem value="A_NEGATIVE">A Negative</SelectItem>
                  <SelectItem value="B_POSITIVE">B Positive</SelectItem>
                  <SelectItem value="B_NEGATIVE">B Negative</SelectItem>
                  <SelectItem value="AB_POSITIVE">AB Positive</SelectItem>
                  <SelectItem value="AB_NEGATIVE">AB Negative</SelectItem>
                  <SelectItem value="O_POSITIVE">O Positive</SelectItem>
                  <SelectItem value="O_NEGATIVE">O Negative</SelectItem>
                  <SelectItem value="UNKNOWN">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Medical Info */}
          <div className="space-y-4 pt-2 border-t">
            <h3 className="font-medium">Medical Information</h3>
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Input
                id="allergies"
                placeholder="e.g., Penicillin, Peanuts"
                value={formData.allergies}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    allergies: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chronicConditions">Chronic Conditions</Label>
              <Input
                id="chronicConditions"
                placeholder="e.g., Diabetes, Hypertension (comma separated)"
                value={formData.chronicConditions}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    chronicConditions: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medications">Current Medications</Label>
              <Input
                id="medications"
                placeholder="e.g., Metformin, Lisinopril (comma separated)"
                value={formData.medications}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    medications: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 pt-4 border-t">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/patients/${patient.id}`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
