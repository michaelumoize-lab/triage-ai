// app/(dashboard)/consultations/[id]/not-found.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function ConsultationNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center">
            <FileQuestion className="h-16 w-16 text-muted-foreground/50" />
          </div>
          <CardTitle className="mt-4">Consultation Not Found</CardTitle>
          <CardDescription>
            The consultation you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/diagnosis/history">
            <Button>Back to History</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
