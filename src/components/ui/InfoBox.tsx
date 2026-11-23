import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "./cn";

interface InfoBoxProps {
  variant?: "warning" | "tips";
  children: ReactNode;
  className?: string;
}

export function InfoBox({ variant = "warning", children, className }: InfoBoxProps) {
  return (
    <div
      role="note"
      className={cn(
        "flex gap-3 rounded-md p-4 text-small text-text",
        variant === "warning" ? "bg-accent-soft" : "bg-primary-soft",
        className,
      )}
    >
      <Info
        size={20}
        aria-hidden
        className={cn("shrink-0", variant === "warning" ? "text-text" : "text-primary-strong")}
      />
      <div>{children}</div>
    </div>
  );
}
