import { BottomNav, BottomNavSpacer } from "./BottomNav";
import { LoadingLabel, MealCardSkeleton, Skeleton } from "./Skeleton";

export function BerandaSkeleton() {
  return (
    <>
      <main className="flex flex-1 flex-col gap-6 px-6 pt-6">
        <LoadingLabel />
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-7 w-40" />
          </div>
          <Skeleton className="size-11 rounded-full" />
        </div>
        <div className="flex flex-col gap-4 rounded-lg bg-primary-strong/90 p-5">
          <div className="h-3 w-32 animate-pulse rounded-md bg-on-primary/30" />
          <div className="h-10 w-40 animate-pulse rounded-md bg-on-primary/30" />
          <div className="h-2 w-full animate-pulse rounded-full bg-on-primary/25" />
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-md bg-on-primary/15" />
            ))}
          </div>
        </div>
        <Skeleton className="h-5 w-36" />
        <MealCardSkeleton />
        <Skeleton className="h-13 w-full" />
        <BottomNavSpacer />
      </main>
      <BottomNav />
    </>
  );
}

export function MealPlanSkeleton() {
  return (
    <>
      <main className="flex flex-1 flex-col gap-5 px-6 pt-6">
        <LoadingLabel />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-7 w-32 rounded-full" />
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
        {[0, 1, 2, 3].map((i) => (
          <MealCardSkeleton key={i} />
        ))}
        <BottomNavSpacer />
      </main>
      <BottomNav />
    </>
  );
}

export function DetailSkeleton() {
  return (
    <main className="flex flex-1 flex-col gap-6 px-6 pt-6 pb-10">
      <LoadingLabel />
      <Skeleton className="size-11 rounded-full" />
      <Skeleton className="aspect-[16/10] w-full rounded-lg" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </main>
  );
}

export function FormSkeleton({ withNav = false }: { withNav?: boolean }) {
  return (
    <>
      <main className="flex flex-1 flex-col gap-6 px-6 pt-6">
        <LoadingLabel />
        <Skeleton className="size-11 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-full" />
        </div>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-13 w-full" />
          </div>
        ))}
        {withNav && <BottomNavSpacer />}
      </main>
      {withNav && <BottomNav />}
    </>
  );
}
