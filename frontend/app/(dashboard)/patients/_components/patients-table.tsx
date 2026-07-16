// app/(dashboard)/patients/_components/patients-table.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  MoreHorizontal,
  Search,
  Eye,
  Stethoscope,
  Archive,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { archivePatient, unarchivePatient } from "@/actions/patients";
import { toast } from "sonner";
import Link from "next/link";
import type { Patient } from "@prisma/client";
import { AddPatientButton } from "./add-patient-button";

type PatientWithLastVisit = Patient & {
  consultations: { createdAt: Date }[];
};

interface PatientsTableProps {
  patients: PatientWithLastVisit[];
  total: number;
  totalPages: number;
  currentPage: number;
  search: string;
  showArchived: boolean;
}

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function PatientsTable({
  patients,
  total,
  totalPages,
  currentPage,
  search: initialSearch,
  showArchived,
}: PatientsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(initialSearch);

  // Debounce the search value (300ms delay)
  const debouncedSearch = useDebounce(searchValue, 300);

  // Update URL when debounced search changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }
    params.set("page", "1");

    if (debouncedSearch !== initialSearch) {
      startTransition(() => {
        router.push(`/patients?${params.toString()}`);
      });
    }
  }, [debouncedSearch, initialSearch, router, searchParams]);

  // Toggle archived view
  const toggleShowArchived = () => {
    const params = new URLSearchParams(searchParams);
    if (showArchived) {
      params.delete("showArchived");
    } else {
      params.set("showArchived", "true");
    }
    params.set("page", "1");
    router.push(`/patients?${params.toString()}`);
  };

  const handleArchive = (patientId: string) => {
    startTransition(async () => {
      try {
        await archivePatient(patientId);
        toast.success("Patient archived successfully");
        router.refresh();
      } catch {
        toast.error("Failed to archive patient");
      }
    });
  };

  const handleUnarchive = (patientId: string) => {
    startTransition(async () => {
      try {
        await unarchivePatient(patientId);
        toast.success("Patient restored from archive");
        router.refresh();
      } catch {
        toast.error("Failed to restore patient");
      }
    });
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (searchValue) params.set("search", searchValue);
    params.set("page", String(page));
    router.push(`/patients?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearchValue("");
    const params = new URLSearchParams(searchParams);
    params.delete("search");
    params.set("page", "1");
    router.push(`/patients?${params.toString()}`);
  };

  if (patients.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center space-y-4">
          <User className="mx-auto h-16 w-16 text-muted-foreground/50" />
          <div>
            <h3 className="text-lg font-semibold">No patients found</h3>
            <p className="text-sm text-muted-foreground">
              {searchValue
                ? `No results found for "${searchValue}"`
                : "Add your first patient to get started"}
            </p>
          </div>
          {!searchValue && <AddPatientButton />}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar + Toggle */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            className="pl-8 pr-8"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            aria-label="Search patients"
          />
          {searchValue && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          onClick={toggleShowArchived}
          className={cn(
            "px-3 py-1.5 text-sm rounded-md border transition-colors",
            showArchived
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:bg-accent",
          )}
        >
          {showArchived ? "Showing Archived" : "Show Archived"}
        </button>

        {isPending && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow
                key={patient.id}
                onClick={() => router.push(`/patients/${patient.id}`)}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium">{patient.name}</TableCell>
                <TableCell>{patient.age ?? "—"}</TableCell>
                <TableCell>{patient.gender ?? "—"}</TableCell>
                <TableCell>
                  {patient.consultations[0]
                    ? new Date(
                        patient.consultations[0].createdAt,
                      ).toLocaleDateString()
                    : "Never"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      patient.isArchived && "bg-muted/50 text-muted-foreground",
                    )}
                  >
                    {patient.isArchived ? "Archived" : "Active"}
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
                          href={`/patients/${patient.id}`}
                          className="flex w-full items-center"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link
                          href={`/diagnosis/new?patientId=${patient.id}`}
                          className="flex w-full items-center"
                        >
                          <Stethoscope className="mr-2 h-4 w-4" />
                          Diagnose
                        </Link>
                      </DropdownMenuItem>
                      {!patient.isArchived ? (
                        <DropdownMenuItem
                          onClick={() => handleArchive(patient.id)}
                          disabled={isPending}
                          className="flex w-full items-center"
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleUnarchive(patient.id)}
                          disabled={isPending}
                          className="flex w-full items-center"
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          Restore (Unarchive)
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {patients.length} of {total} patients
          </span>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    currentPage < totalPages && goToPage(currentPage + 1)
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
