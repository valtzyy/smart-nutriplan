/** Perkiraan biaya bahan meal plan (fungsi murni). */

const rupiah = new Intl.NumberFormat("id-ID");

/** 15000 → "Rp15.000". */
export function formatRupiah(n: number): string {
  return `Rp${rupiah.format(Math.round(n))}`;
}

/** Bulatkan ke Rp100 terdekat. */
export function bulatkanRatusan(n: number): number {
  return Math.round(n / 100) * 100;
}

export interface ItemBiaya {
  estimasiHarga: number | null;
  multiplier: number;
}

export interface EstimasiBiaya {
  /** Total perkiraan (dibulatkan ke Rp100) dari menu yang punya data harga. */
  total: number;
  /** false bila ada menu terisi tanpa data harga (total jadi perkiraan bawah). */
  lengkap: boolean;
}

/** Jumlah `estimasi_harga × multiplier` untuk slot yang terisi. */
export function estimasiBiayaHarian(items: ItemBiaya[]): EstimasiBiaya {
  let total = 0;
  let lengkap = true;
  for (const it of items) {
    if (it.estimasiHarga == null) {
      lengkap = false;
      continue;
    }
    total += it.estimasiHarga * it.multiplier;
  }
  return { total: bulatkanRatusan(total), lengkap };
}

export type StatusAnggaran = "tanpa_anggaran" | "dalam_anggaran" | "di_atas_anggaran";

/** Bandingkan perkiraan biaya dengan anggaran harian pengguna (null = belum diatur). */
export function statusAnggaran(total: number, anggaran: number | null): { status: StatusAnggaran; selisih: number } {
  if (anggaran == null) return { status: "tanpa_anggaran", selisih: 0 };
  const selisih = total - anggaran;
  return { status: selisih > 0 ? "di_atas_anggaran" : "dalam_anggaran", selisih: Math.abs(selisih) };
}
