// app/(dashboard)/patients/[id]/page.tsx
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PatientHeader } from "./_components/patient-header";
import { PatientInfo } from "./_components/patient-info";
import { ConsultationHistory } from "./_components/consultation-history";
import { PatientActions } from "./_components/patient-actions";

export const dynamic = "force-dynamic";

type PageParams = Promise<{
  id: string;
}>;

export default async function PatientDetailPage({
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
    <div className="p-6 space-y-6">
      <PatientHeader patient={patient} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Patient Info */}
        <div className="lg:col-span-2 space-y-6">
          <PatientInfo patient={patient} />
          <ConsultationHistory consultations={patient.consultations} />
        </div>

        {/* Right Column: Actions */}
        <div className="lg:col-span-1">
          <PatientActions
            patientId={patient.id}
            isArchived={patient.isArchived}
          />
        </div>
      </div>
    </div>
  );
}
