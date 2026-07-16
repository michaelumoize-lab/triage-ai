// app/(dashboard)/consultations/[id]/page.tsx
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ConsultationDetail } from "./_components/consultation-detail";

type PageParams = Promise<{ id: string }>;

export default async function ConsultationDetailPage({
  params,
}: {
  params: PageParams;
}) {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const { id } = await params;
  const consultation = await db.getConsultationById(id, session.user.id);
  if (!consultation) notFound();

  // ✅ Fetch all symptoms for editing
  const allSymptoms = await db.getSymptoms();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Consultation Details
        </h1>
        <p className="text-muted-foreground">
          Review the AI diagnosis and add your clinical notes
        </p>
      </div>

      <ConsultationDetail
        consultation={consultation}
        allSymptoms={allSymptoms}
      />
    </div>
  );
}
