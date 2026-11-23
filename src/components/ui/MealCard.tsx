import { UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { formatAngka } from "@/lib/labels";
import { Badge } from "./Badge";

interface MealCardProps {
  href: string;
  slotLabel: string;
  nama: string;
  porsi: string;
  kalori: number;
  fotoUrl?: string | null;
  labelSelisih?: boolean;
  /** Tombol "Ganti" (form server action) dirender oleh pemanggil. */
  swap?: ReactNode;
}

export function MealCard({ href, slotLabel, nama, porsi, kalori, fotoUrl, labelSelisih, swap }: MealCardProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <Link href={href} className="-m-1 flex items-center gap-3 rounded-md p-1 transition-colors active:bg-primary-soft/70">
        <span className="relative flex size-18 shrink-0 items-center justify-center overflow-hidden rounded-md bg-accent-soft text-text">
          {fotoUrl ? (
            <Image src={fotoUrl} alt={nama} fill sizes="72px" className="object-cover" unoptimized />
          ) : (
            <UtensilsCrossed size={28} aria-hidden />
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-label-style uppercase text-primary-strong">{slotLabel}</span>
          <span className="text-body font-semibold text-text">{nama}</span>
          <span className="line-clamp-2 text-small text-text-muted">{porsi}</span>
        </span>
        <span className="flex shrink-0 flex-col items-end">
          <span className="text-h3-style text-text">{formatAngka(kalori)}</span>
          <span className="text-caption text-text-muted">kkal</span>
        </span>
      </Link>
      {(labelSelisih || swap) && (
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
          {labelSelisih ? <Badge variant="accent">Kalori sedikit berbeda dari target</Badge> : <span />}
          {swap}
        </div>
      )}
    </div>
  );
}
