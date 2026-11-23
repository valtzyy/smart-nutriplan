"use client";

import { Check } from "lucide-react";
import { useId } from "react";
import { cn } from "./cn";

interface ChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  /** radio = pilih satu, checkbox = multi-pilih. */
  mode?: "radio" | "checkbox";
}

export function Chip({ label, selected, onToggle, mode = "checkbox" }: ChipProps) {
  return (
    <button
      type="button"
      role={mode}
      aria-checked={selected}
      onClick={onToggle}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 py-2 text-label-style transition duration-100 select-none active:scale-95",
        selected
          ? "border-primary-strong bg-primary-soft text-primary-strong"
          : "border-border bg-surface text-text hover:border-primary",
      )}
    >
      {selected && <Check size={16} aria-hidden />}
      {label}
    </button>
  );
}

interface ChipGroupProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  mode: "radio" | "checkbox";
  value: T[];
  onChange: (value: T[]) => void;
  error?: string;
}

export function ChipGroup<T extends string>({ label, options, mode, value, onChange, error }: ChipGroupProps<T>) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <span id={id} className="text-label-style text-text-muted">
        {label}
      </span>
      <div role={mode === "radio" ? "radiogroup" : "group"} aria-labelledby={id} className="flex flex-wrap gap-2">
        {options.map((o) => {
          const selected = value.includes(o.value);
          return (
            <Chip
              key={o.value}
              label={o.label}
              mode={mode}
              selected={selected}
              onToggle={() => {
                if (mode === "radio") onChange([o.value]);
                else onChange(selected ? value.filter((v) => v !== o.value) : [...value, o.value]);
              }}
            />
          );
        })}
      </div>
      {error && <p className="text-caption text-danger-text">{error}</p>}
    </div>
  );
}
