import type { Metadata } from "next";
import { Suspense } from "react";
import { SignUpForm } from "./sign-up-form";
import { LoadingSpinner } from "@/components/loading-spinner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignUp() {
  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <Suspense
        fallback={
          <LoadingSpinner size="lg" message="Loading sign-up form..." />
        }
      >
        <SignUpForm />
      </Suspense>
    </main>
  );
}
