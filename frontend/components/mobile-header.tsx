// components/mobile-header.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, Stethoscope } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";

export function MobileHeader() {
  const { toggleMobileSidebar } = useUIStore();

  return (
    <header className="md:hidden flex items-center justify-between p-4 border-b bg-background">
      <Link href="/dashboard" className="flex items-center gap-2">
        <Stethoscope className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">TriageAI</span>
      </Link>
      <Button variant="ghost" size="icon" onClick={toggleMobileSidebar}>
        <Menu className="h-5 w-5" />
      </Button>
    </header>
  );
}
