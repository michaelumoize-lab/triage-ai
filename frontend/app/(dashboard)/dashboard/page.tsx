import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import type { Consultation, Patient } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

// ============================================
// TYPES
// ============================================

type ConsultationWithPatient = Consultation & {
  patient: Pick<Patient, "name"> | null;
};

type StatCardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
  variant?: "default" | "primary" | "destructive" | "success" | "warning";
};

type QuickActionCardProps = {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
};

type ActivityItemProps = {
  id: string; // ✅ Added id for the link
  patientName: string;
  diagnosis: string | null;
  time: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
};

type StatusColorKey = "PENDING" | "COMPLETED" | "CANCELLED";
type StatusVariantMap = Record<
  StatusColorKey,
  "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
>;

// ============================================
// ICON HELPERS
// ============================================

import {
  Users,
  Stethoscope,
  AlertTriangle,
  ClipboardList,
  Plus,
  UserPlus,
} from "lucide-react";

// ============================================
// PAGE COMPONENT
// ============================================

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/sign-in");
  }

  const [patients, consultations, stats] = await Promise.all([
    db.getPatients(session.user.id),
    db.getConsultations(session.user.id),
    // Get stats
    (async () => {
      const allPatients = await db.getPatients(session.user.id, true);
      const allConsultations = await db.getConsultations(session.user.id);
      const urgentCases = allConsultations.filter((c) => c.isEmergency);

      return {
        totalPatients: allPatients.length,
        totalConsultations: allConsultations.length,
        urgentCases: urgentCases.length,
        todayConsultations: allConsultations.filter(
          (c) =>
            new Date(c.createdAt).toDateString() === new Date().toDateString(),
        ).length,
      };
    })(),
  ]);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, Dr. {session.user.name} 👋
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your patients today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={<Users className="h-5 w-5" />}
          variant="default"
        />
        <StatCard
          title="Today's Consultations"
          value={stats.todayConsultations}
          icon={<Stethoscope className="h-5 w-5" />}
          variant="primary"
        />
        <StatCard
          title="Urgent Cases"
          value={stats.urgentCases}
          icon={<AlertTriangle className="h-5 w-5" />}
          variant="destructive"
        />
        <StatCard
          title="Total Consultations"
          value={stats.totalConsultations}
          icon={<ClipboardList className="h-5 w-5" />}
          variant="success"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <QuickActionCard
          title="New Diagnosis"
          description="Enter patient symptoms for AI analysis"
          href="/diagnosis/new"
          icon={<Plus className="h-6 w-6" />}
        />
        <QuickActionCard
          title="View Patients"
          description="See all patient records and history"
          href="/patients"
          icon={<UserPlus className="h-6 w-6" />}
        />
      </div>

      {/* Recent Consultations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Consultations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(consultations as ConsultationWithPatient[])
            .slice(0, 5)
            .map((consultation) => (
              <ActivityItem
                key={consultation.id}
                id={consultation.id} // ✅ pass the id
                patientName={consultation.patient?.name || "Unknown Patient"}
                diagnosis={consultation.predictedDisease || "Pending"}
                time={new Date(consultation.createdAt).toLocaleDateString()}
                status={consultation.status as StatusColorKey}
              />
            ))}
          {consultations.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No consultations yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// STAT CARD COMPONENT
// ============================================

function StatCard({ title, value, icon, variant = "default" }: StatCardProps) {
  const variantStyles: Record<NonNullable<StatCardProps["variant"]>, string> = {
    default: "bg-card text-card-foreground border-border",
    primary: "bg-primary/10 text-primary border-primary/20",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
    success:
      "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    warning:
      "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  };

  return (
    <Card className={cn("border", variantStyles[variant])}>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <div
          className={cn(
            "rounded-full p-3",
            variant === "default" && "bg-muted",
            variant === "primary" && "bg-primary/20",
            variant === "destructive" && "bg-destructive/20",
            variant === "success" && "bg-green-500/20",
            variant === "warning" && "bg-yellow-500/20",
          )}
        >
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// QUICK ACTION CARD COMPONENT
// ============================================

function QuickActionCard({
  title,
  description,
  href,
  icon,
}: QuickActionCardProps) {
  return (
    <Link href={href}>
      <Card className="cursor-pointer border-2 border-border transition-all hover:border-primary hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ============================================
// ACTIVITY ITEM COMPONENT – now clickable
// ============================================

function ActivityItem({
  id,
  patientName,
  diagnosis,
  time,
  status,
}: ActivityItemProps) {
  const statusVariant: StatusVariantMap = {
    PENDING: "warning",
    COMPLETED: "success",
    CANCELLED: "destructive",
  };

  const statusLabels: Record<StatusColorKey, string> = {
    PENDING: "Pending",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  const borderColors: Record<StatusColorKey, string> = {
    PENDING: "border-warning",
    COMPLETED: "border-success",
    CANCELLED: "border-destructive",
  };

  return (
    <Link
      href={`/consultations/${id}`}
      className="block hover:bg-muted/50 rounded-lg transition-colors"
    >
      <div
        className={cn(
          "flex items-center justify-between border-l-4 pl-4 py-2 pr-2",
          borderColors[status],
        )}
      >
        <div>
          <p className="font-medium">{patientName}</p>
          <p className="text-sm text-muted-foreground">{diagnosis}</p>
        </div>
        <div className="text-right">
          <Badge variant={statusVariant[status]}>{statusLabels[status]}</Badge>
          <p className="mt-1 text-xs text-muted-foreground">{time}</p>
        </div>
      </div>
    </Link>
  );
}
