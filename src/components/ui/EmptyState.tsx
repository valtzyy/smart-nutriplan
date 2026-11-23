import { UtensilsCrossed } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "./cn";

interface EmptyStateProps {
  title: string;
  text?: string;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}

export function EmptyState({ title, text, action, compact = false, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-surface text-center",
        compact ? "p-4" : "px-6 py-10",
        className,
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-accent-soft text-text",
          compact ? "size-12" : "size-16",
        )}
      >
        <UtensilsCrossed size={compact ? 22 : 28} aria-hidden />
      </span>
      <h3 className={compact ? "text-body font-semibold text-text" : "text-h3-style text-text"}>{title}</h3>
      {text && <p className="text-small text-text-muted">{text}</p>}
      {action && <div className="w-full">{action}</div>}
    </div>
  );
}
