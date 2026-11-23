import type { ReactNode } from "react";
import { cn } from "./cn";

interface BadgeProps {
  variant?: "primary" | "accent";
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = "primary", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-label-style",
        variant === "primary" ? "bg-primary-soft text-primary-strong" : "bg-accent-soft text-text",
        className,
      )}
    >
      {children}
    </span>
  );
}
