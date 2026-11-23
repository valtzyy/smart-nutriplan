"use client";

import { RefreshCw } from "lucide-react";
import { useActionState } from "react";
import { buatUlangAction, gantiSlotAction } from "@/app/meal-plan/actions";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { Spinner } from "@/components/ui/Spinner";
import { Toast } from "@/components/ui/Toast";
import type { MealSlot } from "@/lib/nutrition/constants";

export function SwapButton({ slot, enabled, slotLabel }: { slot: MealSlot; enabled: boolean; slotLabel: string }) {
  const [state, action, pending] = useActionState(gantiSlotAction, null);
  if (!enabled) {
    return <span className="text-caption text-text-muted">Belum ada menu lain yang cocok</span>;
  }
  return (
    <form action={action}>
      <input type="hidden" name="slot" value={slot} />
      <button
        type="submit"
        disabled={pending}
        aria-label={`Ganti menu ${slotLabel.toLowerCase()}`}
        className={cn(
          "inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-surface px-4 text-label-style text-primary-strong transition duration-100 select-none hover:bg-primary-soft active:scale-95 active:bg-primary-soft disabled:opacity-50",
        )}
      >
        {pending ? <Spinner /> : <RefreshCw size={16} aria-hidden />}
        Ganti
      </button>
      <Toast message={state?.error} trigger={state} />
    </form>
  );
}

export function RegenerateButton({ sisa }: { sisa: number }) {
  const [state, action, pending] = useActionState(buatUlangAction, null);
  const habis = sisa <= 0;
  return (
    <form action={action} className="flex flex-col gap-2">
      <Button type="submit" variant="secondary" loading={pending} disabled={habis}>
        <RefreshCw size={18} aria-hidden />
        Buat ulang meal plan
      </Button>
      <p className="text-center text-small text-text-muted">
        {habis ? "Batas buat ulang hari ini sudah habis. Coba ganti per menu." : `Sisa ${sisa} kali hari ini`}
      </p>
      <Toast message={state?.error} trigger={state} />
    </form>
  );
}
