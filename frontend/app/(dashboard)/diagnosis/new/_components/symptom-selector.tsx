// app/(dashboard)/diagnosis/new/_components/symptom-selector.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Symptom } from "@prisma/client";

interface SymptomSelectorProps {
  symptoms: Symptom[];
  selectedSymptoms: string[];
  onToggle: (symptomName: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  selectedCount: number;
}

export function SymptomSelector({
  symptoms,
  selectedSymptoms,
  onToggle,
  onSubmit,
  isLoading,
  selectedCount,
}: SymptomSelectorProps) {
  const [search, setSearch] = useState("");

  const filteredSymptoms = symptoms.filter((symptom) =>
    symptom.name.toLowerCase().includes(search.toLowerCase()),
  );

  const clearSearch = () => setSearch("");

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search symptoms..."
            className="pl-9 pr-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Selected count */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {selectedCount} symptoms selected
          </span>
          <span className="text-sm text-muted-foreground">
            {filteredSymptoms.length} symptoms shown
          </span>
        </div>

        {/* Symptoms grid */}
        <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto p-1">
          {filteredSymptoms.map((symptom) => {
            const isSelected = selectedSymptoms.includes(symptom.name);
            const displayName = symptom.name.replace(/_/g, " ");

            return (
              <button
                key={symptom.id}
                onClick={() => onToggle(symptom.name)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm transition-all whitespace-nowrap",
                  isSelected
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted hover:bg-muted/80 text-foreground",
                )}
              >
                {displayName}
              </button>
            );
          })}
        </div>

        {filteredSymptoms.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No symptoms match your search
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              // Deselect all
              selectedSymptoms.forEach((s) => onToggle(s));
            }}
            disabled={selectedCount === 0}
          >
            Clear All
          </Button>
          <Button
            onClick={onSubmit}
            disabled={selectedCount === 0 || isLoading}
          >
            {isLoading ? "Analyzing..." : "Analyze Symptoms"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
