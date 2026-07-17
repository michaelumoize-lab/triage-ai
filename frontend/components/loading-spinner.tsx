// components/loading-spinner.tsx
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  message?: string;
}

const sizeMap = {
  sm: "h-6 w-6 border-2",
  md: "h-10 w-10 border-3",
  lg: "h-16 w-16 border-4",
};

export function LoadingSpinner({
  className,
  size = "md",
  message = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div
        className={cn(
          "animate-spin rounded-full border-primary/20 border-t-primary",
          sizeMap[size],
          className,
        )}
      />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
