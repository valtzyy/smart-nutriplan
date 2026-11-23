export interface PorsiKomponen {
  nama: string;
  qty: number;
  satuan: string;
}

/** Bulatkan qty × multiplier: < 1 → kelipatan 0,25 (min 0,25); ≥ 1 → kelipatan 0,5. */
export function bulatkanTrt(x: number): number {
  if (x < 1) {
    return Math.max(0.25, Math.round(x / 0.25) * 0.25);
  }
  return Math.round(x / 0.5) * 0.5;
}

const PECAHAN: Record<number, string> = { 1: "¼", 2: "½", 3: "¾" };

/** 0,25 → ¼, 1,5 → 1½, 2 → 2. */
export function formatPecahan(x: number): string {
  const perempat = Math.round(x * 4);
  const utuh = Math.floor(perempat / 4);
  const sisa = perempat % 4;
  if (sisa === 0) return String(utuh);
  return `${utuh === 0 ? "" : utuh}${PECAHAN[sisa]}`;
}

/** Angka TRT untuk qty × multiplier, mis. (1, 1.25) → "1½". */
export function formatTakaran(qty: number, multiplier: number): string {
  return formatPecahan(bulatkanTrt(qty * multiplier));
}

/** "1½ centong nasi putih". */
export function formatKomponen(p: PorsiKomponen, multiplier = 1): string {
  return `${formatTakaran(p.qty, multiplier)} ${p.satuan} ${p.nama.toLowerCase()}`;
}

export function ringkasPorsi(porsi: PorsiKomponen[], multiplier = 1): string {
  return porsi.map((p) => formatKomponen(p, multiplier)).join(", ");
}
