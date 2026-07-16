// app/(dashboard)/diagnosis/new/page.tsx
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { DiagnosisForm } from "./_components/diagnosis-form";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  patientId?: string;
}>;

export default async function NewDiagnosisPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getServerSession();
  if (!session) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const preselectedPatientId = params.patientId || null;

  // Fetch patients for the dropdown
  const patients = await db.getPatients(session.user.id);

  // Fetch symptoms for the selector
  const symptoms = await db.getSymptoms();

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Diagnosis</h1>
        <p className="text-muted-foreground">
          Select a patient, choose symptoms, and get AI-powered diagnosis
        </p>
      </div>

      <DiagnosisForm
        patients={patients}
        symptoms={symptoms}
        preselectedPatientId={preselectedPatientId}
        doctorId={session.user.id}
      />
    </div>
  );
}
