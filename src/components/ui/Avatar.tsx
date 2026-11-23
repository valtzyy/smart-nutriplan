import { inisial } from "@/lib/labels";
import { cn } from "./cn";

export function Avatar({ nama, size = "md" }: { nama: string; size?: "md" | "lg" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary-soft font-heading font-semibold text-primary-strong",
        size === "md" ? "size-11 text-body" : "size-18 text-h2",
      )}
    >
      {inisial(nama)}
    </span>
  );
}
