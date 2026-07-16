// app/(dashboard)/patients/_components/add-patient-button.tsx
"use client";

import { useState, useTransition } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { createPatient } from "@/actions/patients";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AddPatientButton() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await createPatient(formData);
        toast.success("Patient added successfully");
        setOpen(false);
        router.refresh();
      } catch {
        toast.error("Failed to add patient");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(buttonVariants({ variant: "default" }), "cursor-pointer")}
        disabled={isPending}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Patient
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" name="age" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select name="gender">
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" />
          </div>

          {/* Medical Info */}
          <hr className="my-2" />
          <p className="text-sm font-medium">Medical Information</p>

          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Input
              id="allergies"
              name="allergies"
              placeholder="e.g., Penicillin, Peanuts"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="chronicConditions">Chronic Conditions</Label>
            <Input
              id="chronicConditions"
              name="chronicConditions"
              placeholder="e.g., Diabetes, Hypertension (comma separated)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="medications">Current Medications</Label>
            <Input
              id="medications"
              name="medications"
              placeholder="e.g., Metformin, Lisinopril (comma separated)"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className={cn(buttonVariants({ variant: "outline" }))}
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={cn(buttonVariants({ variant: "default" }))}
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save Patient"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
