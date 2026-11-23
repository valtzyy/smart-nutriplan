import { DISCLAIMER } from "@/lib/brand";
import { cn } from "./cn";

export function Disclaimer({ className }: { className?: string }) {
  return <p className={cn("text-caption text-text-muted", className)}>{DISCLAIMER}</p>;
}
