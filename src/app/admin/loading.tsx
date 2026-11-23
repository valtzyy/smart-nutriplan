import { LoadingLabel, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="flex flex-col gap-4 px-6 py-6">
      <LoadingLabel />
      <Skeleton className="h-7 w-40" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-lg" />
    </main>
  );
}
