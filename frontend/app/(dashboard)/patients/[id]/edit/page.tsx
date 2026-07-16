// app/(dashboard)/patients/[id]/edit/page.tsx
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { EditPatientForm } from "./_components/edit-patient-form";

export const dynamic = "force-dynamic";

type PageParams = Promise<{
  id: string;
}>;

export default async function EditPatientPage({
  params,
}: {
  params: PageParams;
}) {
  const session = await getServerSession();
  if (!session) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const patient = await db.getPatientById(id, session.user.id);

  if (!patient) {
    notFound();
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Patient</h1>
        <p className="text-muted-foreground">Update patient information</p>
      </div>

      <EditPatientForm patient={patient} />
    </div>
  );
}
