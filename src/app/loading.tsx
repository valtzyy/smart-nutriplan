import { LoadingLabel } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";

export default function Loading() {
  return (
    <main className="flex flex-1 items-center justify-center py-20 text-primary-strong">
      <LoadingLabel />
      <Spinner />
    </main>
  );
}
