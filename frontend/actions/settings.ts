// actions/settings.ts
"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { z } from "zod";
import { auth } from "@/lib/auth";

// ============================================
// VALIDATION SCHEMAS
// ============================================

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  specialty: z.string().optional(),
  phone: z.string().optional(),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ============================================
// SERVER ACTIONS
// ============================================

export async function updateProfile(data: UpdateProfileInput) {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const validated = updateProfileSchema.parse(data);

  // Check if email is already taken by another user
  if (validated.email !== session.user.email) {
    const existingUser = await db.getUserByEmail(validated.email);
    if (existingUser && existingUser.id !== session.user.id) {
      throw new Error("Email already in use by another account");
    }
  }

  await db.updateUser(session.user.id, {
    name: validated.name,
    email: validated.email,
    specialty: validated.specialty,
    phone: validated.phone,
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function changePassword(data: ChangePasswordInput) {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const validated = changePasswordSchema.parse(data);

  // Use Better Auth to change password
  await auth.api.changePassword({
    headers: new Headers(),
    body: {
      currentPassword: validated.currentPassword,
      newPassword: validated.newPassword,
    },
  });

  revalidatePath("/settings");

  return { success: true };
}
