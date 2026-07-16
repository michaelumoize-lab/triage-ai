// components/logo.tsx
import Image from "next/image";

export function Logo({ className = "h-10 w-10" }) {
  return (
    <Image
      src="/logo.svg"
      alt="TriageAI Logo"
      width={40}
      height={40}
      className={className}
    />
  );
}
