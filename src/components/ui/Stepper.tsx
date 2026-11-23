import { cn } from "./cn";

export function Stepper({ step, total = 3 }: { step: number; total?: number }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-caption text-text-muted">
        Langkah {step} dari {total}
      </span>
      <div className="flex gap-2" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={cn("h-1 flex-1 rounded-[2px]", i < step ? "bg-primary-strong" : "bg-border")} />
        ))}
      </div>
    </div>
  );
}
