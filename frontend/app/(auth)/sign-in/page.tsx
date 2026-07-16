import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "./sign-in-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignIn() {
  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <Suspense fallback={<div>Loading...</div>}>
        {" "}
        <SignInForm />
      </Suspense>
    </main>
  );
}
