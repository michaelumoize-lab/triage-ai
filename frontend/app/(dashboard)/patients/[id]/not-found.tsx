// app/(dashboard)/patients/[id]/not-found.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserX } from "lucide-react";

export default function PatientNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center">
            <UserX className="h-16 w-16 text-muted-foreground/50" />
          </div>
          <CardTitle className="mt-4">Patient Not Found</CardTitle>
          <CardDescription>
            The patient you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/patients">
            <Button>Back to Patients</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
