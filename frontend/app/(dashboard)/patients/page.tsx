import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PatientsTable } from "./_components/patients-table";
import { AddPatientButton } from "./_components/add-patient-button";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  search?: string;
  page?: string;
  showArchived?: string;
}>;

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getServerSession();
  if (!session) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const requestedPage = Number(params.page ?? "1");
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const search = params.search ?? "";
  const showArchived = params.showArchived === "true";

  const { items, total, totalPages } = await db.searchPatients({
    userId: session.user.id,
    search,
    page,
    pageSize: 10,
    includeArchived: showArchived,
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">
            Manage your patient records and consultations
          </p>
        </div>
        <AddPatientButton />
      </div>

      <PatientsTable
        patients={items}
        total={total}
        totalPages={totalPages}
        currentPage={page}
        search={search}
        showArchived={showArchived}
      />
    </div>
  );
}
