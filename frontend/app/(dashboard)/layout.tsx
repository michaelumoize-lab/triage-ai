// app/(dashboard)/layout.tsx
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-1">
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
