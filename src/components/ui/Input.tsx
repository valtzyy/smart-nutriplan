import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "./cn";

interface InputProps extends Omit<ComponentProps<"input">, "id"> {
  label: string;
  suffix?: string;
  error?: string;
  /** Elemen di kanan kotak (mis. tombol tampil/sembunyi sandi). */
  trailing?: ReactNode;
  id?: string;
}

export function Input({ label, suffix, error, trailing, className, id, ...rest }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={inputId} className="text-label-style text-text-muted">
        {label}
      </label>
      <div
        className={cn(
          "flex h-13 items-center rounded-md border-[1.5px] bg-surface px-4 focus-within:border-primary-strong focus-within:ring-2 focus-within:ring-primary-strong/30",
          error ? "border-danger-text" : "border-border",
        )}
      >
        <input
          id={inputId}
          className="h-full min-w-0 flex-1 bg-transparent text-body text-text outline-none placeholder:text-text-muted/70"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...rest}
        />
        {suffix && <span className="ml-2 text-body text-text-muted">{suffix}</span>}
        {trailing}
      </div>
      {error && (
        <p id={errorId} className="text-caption text-danger-text">
          {error}
        </p>
      )}
    </div>
  );
}
