// app/(dashboard)/layout.tsx
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { ReactNode } from "react";

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
    <div className="flex min-h-screen">
      <Sidebar user={session.user} />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
