// app/(dashboard)/diagnosis/history/page.tsx
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ConsultationsTable } from "./_components/consultations-table";

export const dynamic = "force-dynamic";

export default async function DiagnosisHistoryPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/sign-in");
  }

  // Fetch all consultations for this doctor
  const consultations = await db.getConsultations(session.user.id);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Diagnosis History</h1>
        <p className="text-muted-foreground">
          View all past AI-assisted diagnoses
        </p>
      </div>

      <ConsultationsTable consultations={consultations} />
    </div>
  );
}
