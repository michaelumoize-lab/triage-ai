import type { Metadata } from "next";
import { Suspense } from "react";
import { SignUpForm } from "./sign-up-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignUp() {
  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <Suspense fallback={<div>Loading...</div>}>
        {" "}
        <SignUpForm />
      </Suspense>
    </main>
  );
}
