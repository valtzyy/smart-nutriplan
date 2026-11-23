import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SLOT_LABEL } from "@/lib/labels";
import type { MealSlot } from "@/lib/nutrition/constants";

export function pesanSlotKosong(slot: MealSlot): string {
  return `Belum ada menu ${SLOT_LABEL[slot].toLowerCase()} yang cocok dengan pantanganmu.`;
}

/** Kartu slot tanpa kandidat (PRD 5.7). */
export function SlotEmpty({ slot }: { slot: MealSlot }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-label-style uppercase text-primary-strong">{SLOT_LABEL[slot]}</span>
      <EmptyState
        compact
        title={pesanSlotKosong(slot)}
        action={
          <ButtonLink href="/profil/edit" variant="secondary">
            Ubah pantangan
          </ButtonLink>
        }
      />
    </div>
  );
}

/** Semua slot kosong: halaman EmptyState penuh. */
export function AllSlotsEmpty() {
  return (
    <EmptyState
      title="Belum ada menu yang cocok dengan pantanganmu."
      text="Coba kurangi pantangan supaya kami bisa menyusun meal plan untukmu."
      action={<ButtonLink href="/profil/edit">Ubah pantangan</ButtonLink>}
    />
  );
}
