import { cn } from "./cn";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-border/70", className)} />;
}

/** Penanda aksesibel bahwa halaman sedang dimuat. */
export function LoadingLabel() {
  return (
    <span role="status" className="sr-only">
      Sedang memuat…
    </span>
  );
}

export function MealCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
      <Skeleton className="size-18 shrink-0" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <Skeleton className="h-6 w-10" />
    </div>
  );
}
