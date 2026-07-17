// app/(auth)/reset-password/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "./reset-password-form";
import { LoadingSpinner } from "@/components/loading-spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reset Password",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold text-center">
            Reset Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <LoadingSpinner size="md" message="Loading reset form..." />
            }
          >
            {token ? (
              <ResetPasswordForm token={token} />
            ) : (
              <div
                role="alert"
                className="text-center text-sm text-destructive"
              >
                Invalid or missing reset token. Please request a new password
                reset link.
              </div>
            )}
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
