// app/(dashboard)/diagnosis/history/_components/consultations-table.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Search, Eye, Calendar, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Consultation, Patient } from "@prisma/client";

// ============================================
// TYPES
// ============================================

type ConsultationWithPatient = Consultation & {
  patient: Pick<Patient, "id" | "name" | "gender" | "age"> | null;
};

interface ConsultationsTableProps {
  consultations: ConsultationWithPatient[];
}

type StatusType = "PENDING" | "COMPLETED" | "CANCELLED";

// ============================================
// HELPERS
// ============================================

const statusLabels: Record<StatusType, string> = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const statusColors: Record<StatusType, string> = {
  PENDING:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400",
  COMPLETED:
    "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400",
};

// ============================================
// COMPONENT
// ============================================

export function ConsultationsTable({ consultations }: ConsultationsTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusType | "ALL">("ALL");

  const filtered = useMemo(() => {
    return consultations.filter((consultation) => {
      if (statusFilter !== "ALL" && consultation.status !== statusFilter) {
        return false;
      }
      if (search) {
        const patientName = consultation.patient?.name?.toLowerCase() || "";
        const disease = consultation.predictedDisease?.toLowerCase() || "";
        const query = search.toLowerCase();
        return patientName.includes(query) || disease.includes(query);
      }
      return true;
    });
  }, [consultations, search, statusFilter]);

  if (consultations.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center space-y-4">
          <Activity className="mx-auto h-16 w-16 text-muted-foreground/50" />
          <div>
            <h3 className="text-lg font-semibold">No diagnoses yet</h3>
            <p className="text-sm text-muted-foreground">
              Start a new diagnosis to see results here
            </p>
          </div>
          <Link
            href="/diagnosis/new"
            className={buttonVariants({ variant: "default" })}
          >
            New Diagnosis
          </Link>{" "}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient or disease..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-[180px]">
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as StatusType | "ALL")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <span className="text-sm text-muted-foreground">
          Showing {filtered.length} of {consultations.length}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Diagnosis</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((consultation) => (
              <TableRow
                key={consultation.id}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium">
                  <Link
                    href={`/consultations/${consultation.id}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {consultation.patient?.name || "Unknown Patient"}
                  </Link>
                </TableCell>{" "}
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {new Date(consultation.createdAt).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  {consultation.predictedDisease || (
                    <span className="text-muted-foreground italic">
                      Pending
                    </span>
                  )}
                  {consultation.confidence !== null && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {(consultation.confidence * 100).toFixed(0)}%
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {consultation.isEmergency && (
                    <Badge variant="destructive" className="mr-2">
                      🚨 Emergency
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={statusColors[consultation.status as StatusType]}
                  >
                    {statusLabels[consultation.status as StatusType]}
                  </Badge>
                </TableCell>
                <TableCell
                  className="text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "cursor-pointer",
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Link
                          href={`/consultations/${consultation.id}`}
                          className="flex w-full items-center"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No consultations match your filters.
        </div>
      )}
    </div>
  );
}
