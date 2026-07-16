import { isAuthenticated } from "@/lib/session";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const isAuth = await isAuthenticated();

  if (isAuth) {
    redirect("/dashboard");
  }

  return children;
}
