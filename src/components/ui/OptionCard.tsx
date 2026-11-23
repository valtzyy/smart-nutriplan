"use client";

import { cn } from "./cn";

interface OptionCardProps {
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

export function OptionCard({ title, description, selected, onSelect }: OptionCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg p-4 text-left transition-colors",
        selected ? "border-2 border-primary-strong bg-primary-soft" : "border border-border bg-surface hover:border-primary",
      )}
    >
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-body font-semibold text-text">{title}</span>
        <span className="text-small text-text-muted">{description}</span>
      </span>
      <span
        aria-hidden
        className={cn(
          "flex size-5.5 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-primary-strong" : "border-border",
        )}
      >
        {selected && <span className="size-2.5 rounded-full bg-primary-strong" />}
      </span>
    </button>
  );
}
