// app/(dashboard)/settings/page.tsx
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { SettingsForm } from "./_components/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile and account settings
        </p>
      </div>

      <SettingsForm user={session.user} />
    </div>
  );
}
