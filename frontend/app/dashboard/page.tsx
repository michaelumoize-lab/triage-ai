"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
        },
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <button
        onClick={handleSignOut}
        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        Sign Out
      </button>
    </div>
  );
}
