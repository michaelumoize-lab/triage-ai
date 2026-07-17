import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "./sign-in-form";
import { LoadingSpinner } from "@/components/loading-spinner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignIn() {
  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <Suspense
        fallback={
          <LoadingSpinner size="lg" message="Loading sign-in form..." />
        }
      >
        <SignInForm />
      </Suspense>
    </main>
  );
}
