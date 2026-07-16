// app/(dashboard)/consultations/[id]/feedback/page.tsx
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { FeedbackForm } from "./_components/feedback-form";

export const dynamic = "force-dynamic";

type PageParams = Promise<{
  id: string;
}>;

export default async function FeedbackPage({ params }: { params: PageParams }) {
  const session = await getServerSession();
  if (!session) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const consultation = await db.getConsultationById(id, session.user.id);

  if (!consultation) {
    notFound();
  }

  // Check if feedback already exists
  const existingFeedback = await db.getFeedbackByConsultationId(id);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          AI Diagnosis Feedback
        </h1>
        <p className="text-muted-foreground">
          Help us improve the AI by providing feedback on the diagnosis
        </p>
      </div>

      <FeedbackForm
        consultation={consultation}
        existingFeedback={existingFeedback}
      />
    </div>
  );
}
