import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "./auth";

export const getServerSession = cache(async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
});

// Helper to check if user is authenticated
export const isAuthenticated = cache(async () => {
  const session = await getServerSession();
  return !!session;
});

// Helper to get current user
export const getCurrentUser = cache(async () => {
  const session = await getServerSession();
  return session?.user || null;
});
