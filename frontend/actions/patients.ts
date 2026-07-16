// actions/patients.ts
"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { z } from "zod";
import type { Gender, BloodType } from "@prisma/client";

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createPatientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.coerce.number().int().min(0).max(150).optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  bloodType: z
    .enum([
      "A_POSITIVE",
      "A_NEGATIVE",
      "B_POSITIVE",
      "B_NEGATIVE",
      "AB_POSITIVE",
      "AB_NEGATIVE",
      "O_POSITIVE",
      "O_NEGATIVE",
      "UNKNOWN",
    ])
    .default("UNKNOWN"),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  allergies: z.string().optional(),
  chronicConditions: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
});

type CreatePatientInput = z.infer<typeof createPatientSchema>;

// ============================================
// HELPER: Parse FormData
// ============================================

function parsePatientFormData(formData: FormData) {
  const chronicConditionsRaw = formData.get("chronicConditions") as string;
  const medicationsRaw = formData.get("medications") as string;

  return {
    name: formData.get("name") as string,
    age: formData.get("age") ? Number(formData.get("age")) : undefined,
    gender: (formData.get("gender") as string) || undefined,
    bloodType: (formData.get("bloodType") as string) || "UNKNOWN",
    phone: (formData.get("phone") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    allergies: (formData.get("allergies") as string) || undefined,
    chronicConditions:
      chronicConditionsRaw
        ?.split(",")
        .filter(Boolean)
        .map((s) => s.trim()) ?? [],
    medications:
      medicationsRaw
        ?.split(",")
        .filter(Boolean)
        .map((s) => s.trim()) ?? [],
  };
}

// ============================================
// CREATE PATIENT
// ============================================

export async function createPatient(formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const rawData = parsePatientFormData(formData);
  const validated = createPatientSchema.parse(rawData);

  await db.createPatient({
    userId: session.user.id,
    name: validated.name,
    age: validated.age,
    gender: validated.gender as Gender | undefined,
    bloodType: validated.bloodType as BloodType,
    phone: validated.phone,
    email: validated.email,
    address: validated.address,
    allergies: validated.allergies,
    chronicConditions: validated.chronicConditions,
    medications: validated.medications,
  });

  revalidatePath("/patients");
  return { success: true };
}

// ============================================
// UPDATE PATIENT
// ============================================

export async function updatePatient(patientId: string, formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const rawData = parsePatientFormData(formData);
  const validated = createPatientSchema.partial().parse(rawData);

  // Build update object – only include defined fields
  const updateData: {
    name?: string;
    age?: number;
    gender?: Gender;
    bloodType?: BloodType;
    phone?: string;
    email?: string;
    address?: string;
    allergies?: string;
    chronicConditions?: string[];
    medications?: string[];
  } = {};

  if (validated.name !== undefined) updateData.name = validated.name;
  if (validated.age !== undefined) updateData.age = validated.age;
  if (validated.gender !== undefined)
    updateData.gender = validated.gender as Gender;
  if (validated.bloodType !== undefined)
    updateData.bloodType = validated.bloodType as BloodType;
  if (validated.phone !== undefined) updateData.phone = validated.phone;
  if (validated.email !== undefined) updateData.email = validated.email;
  if (validated.address !== undefined) updateData.address = validated.address;
  if (validated.allergies !== undefined)
    updateData.allergies = validated.allergies;
  if (validated.chronicConditions !== undefined)
    updateData.chronicConditions = validated.chronicConditions;
  if (validated.medications !== undefined)
    updateData.medications = validated.medications;

  await db.updatePatient(patientId, session.user.id, updateData);

  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/patients");
  return { success: true };
}

// ============================================
// ARCHIVE PATIENT
// ============================================

export async function archivePatient(patientId: string) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  await db.archivePatient(patientId, session.user.id);
  revalidatePath("/patients");
  return { success: true };
}

// ============================================
// UNARCHIVE PATIENT
// ============================================

export async function unarchivePatient(patientId: string) {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  await db.updatePatient(patientId, session.user.id, {
    isArchived: false,
  });

  revalidatePath("/patients");
  return { success: true };
}
