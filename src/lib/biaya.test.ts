import { describe, expect, it } from "vitest";
import { estimasiBiayaHarian, formatRupiah, statusAnggaran } from "./biaya";

describe("perkiraan biaya & anggaran", () => {
  it("menjumlah harga × multiplier, dibulatkan ke Rp100", () => {
    expect(
      estimasiBiayaHarian([
        { estimasiHarga: 8000, multiplier: 1.25 }, // 10.000
        { estimasiHarga: 12000, multiplier: 0.75 }, // 9.000
        { estimasiHarga: 5050, multiplier: 1 }, // 5.050
      ]),
    ).toEqual({ total: 24100, lengkap: true });
  });

  it("menandai data harga yang tidak lengkap", () => {
    expect(estimasiBiayaHarian([{ estimasiHarga: null, multiplier: 1 }, { estimasiHarga: 7000, multiplier: 1 }])).toEqual({
      total: 7000,
      lengkap: false,
    });
  });

  it("status terhadap anggaran", () => {
    expect(statusAnggaran(30000, null)).toEqual({ status: "tanpa_anggaran", selisih: 0 });
    expect(statusAnggaran(30000, 35000)).toEqual({ status: "dalam_anggaran", selisih: 5000 });
    expect(statusAnggaran(30000, 30000)).toEqual({ status: "dalam_anggaran", selisih: 0 });
    expect(statusAnggaran(42000, 35000)).toEqual({ status: "di_atas_anggaran", selisih: 7000 });
  });

  it("format rupiah", () => {
    expect(formatRupiah(15000)).toBe("Rp15.000");
  });
});
