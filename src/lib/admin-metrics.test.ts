import { describe, expect, it } from "vitest";
import { computeAdminMetrics, hitungNps, toCsv } from "./admin-metrics";

// Catatan: 17:00Z = 00:00 WIB hari berikutnya.
const profiles = [
  { id: "a", created_at: "2026-11-20T03:00:00Z", onboarding_selesai: true }, // daftar 20 Nov
  { id: "b", created_at: "2026-11-21T18:00:00Z", onboarding_selesai: true }, // daftar 22 Nov WIB
  { id: "c", created_at: "2026-11-23T02:00:00Z", onboarding_selesai: false }, // daftar hari ini
];
const events = [
  { user_id: "a", nama: "login", created_at: "2026-11-21T05:00:00Z" }, // a aktif 21 Nov (D1)
  { user_id: "a", nama: "recipe_viewed", created_at: "2026-11-23T05:00:00Z" },
  { user_id: "b", nama: "plan_viewed", created_at: "2026-11-22T20:00:00Z" }, // 23 Nov WIB (D1 untuk b)
  { user_id: "c", nama: "slot_empty", created_at: "2026-11-23T03:00:00Z" },
  { user_id: "a", nama: "recipe_viewed", created_at: "2026-11-10T05:00:00Z" }, // di luar 7 hari
];
const plans = [{ tanggal: "2026-11-23" }, { tanggal: "2026-11-23" }, { tanggal: "2026-11-22" }];

describe("metrik admin", () => {
  const m = computeAdminMetrics({ profiles, events, plans, today: "2026-11-23" });

  it("total & onboarding", () => {
    expect(m.totalPengguna).toBe(3);
    expect(m.selesaiOnboarding).toBe(2);
  });

  it("aktif hari ini & 7 hari (Asia/Jakarta)", () => {
    expect(m.aktifHariIni).toBe(3); // a, b (20:00Z = 03:00 WIB 23 Nov), c
    expect(m.aktif7Hari).toBe(3);
  });

  it("retensi D1 hanya dari pengguna yang daftar ≥ 1 hari lalu", () => {
    // eligible: a (20 Nov), b (22 Nov). Keduanya aktif keesokan harinya → 100%.
    expect(m.retensiD1).toBe(100);
  });

  it("meal plan, resep, slot kosong", () => {
    expect(m.mealPlanHariIni).toBe(2);
    expect(m.resepDibuka7Hari).toBe(1);
    expect(m.slotKosong7Hari).toBe(1);
  });

  it("tabel 14 hari", () => {
    expect(m.harian).toHaveLength(14);
    expect(m.harian[0]).toEqual({ tanggal: "2026-11-23", penggunaBaru: 1, penggunaAktif: 3, mealPlanDibuat: 2 });
    expect(m.harian[1]).toEqual({ tanggal: "2026-11-22", penggunaBaru: 1, penggunaAktif: 0, mealPlanDibuat: 1 });
    expect(m.harian[13].tanggal).toBe("2026-11-10");
  });

  it("retensi null bila belum ada pengguna eligible", () => {
    expect(computeAdminMetrics({ profiles: [profiles[2]], events: [], plans: [], today: "2026-11-23" }).retensiD1).toBeNull();
  });

  it("CSV", () => {
    expect(toCsv(m.harian.slice(0, 1))).toBe("tanggal,pengguna_baru,pengguna_aktif,meal_plan_dibuat\n2026-11-23,1,3,2");
  });
});

describe("AARRR & NPS", () => {
  it("akuisisi, aktivasi, retensi D7 & rujukan belum tersedia pada data awal", () => {
    const m = computeAdminMetrics({ profiles, events, plans, today: "2026-11-23" });
    expect(m.aarrr.akuisisi7Hari).toBe(3);
    expect(m.aarrr.akuisisi7HariSebelumnya).toBe(0);
    // a: onboarding selesai + buka resep; b: onboarding tanpa resep; c: belum onboarding → 1/3
    expect(m.aarrr.aktivasiJumlah).toBe(1);
    expect(m.aarrr.aktivasi).toBe(33.3);
    expect(m.aarrr.retensiD7).toBeNull(); // belum ada yang daftar ≥ 7 hari lalu
    expect(m.aarrr.rujukan).toBeNull(); // kolom rujukan (migrasi 0003) belum ada
    expect(m.aarrr.nps.skor).toBeNull();
  });

  it("retensi D7 menghitung kembali di hari ke-1..7 setelah daftar", () => {
    const p = [
      { id: "x", created_at: "2026-11-01T03:00:00Z", onboarding_selesai: true, dirujuk_oleh: null },
      { id: "y", created_at: "2026-11-01T03:00:00Z", onboarding_selesai: true, dirujuk_oleh: "x" },
      { id: "z", created_at: "2026-11-20T03:00:00Z", onboarding_selesai: true, dirujuk_oleh: null },
    ];
    const e = [
      { user_id: "x", nama: "plan_viewed", created_at: "2026-11-05T03:00:00Z" }, // hari ke-4 ✔
      { user_id: "y", nama: "plan_viewed", created_at: "2026-11-01T05:00:00Z" }, // hari ke-0 ✘
      { user_id: "y", nama: "plan_viewed", created_at: "2026-11-12T03:00:00Z" }, // hari ke-11 ✘
    ];
    const m = computeAdminMetrics({ profiles: p, events: e, plans: [], today: "2026-11-23" });
    expect(m.aarrr.retensiD7).toBe(50); // x & y eligible, hanya x kembali
    expect(m.aarrr.rujukan).toBe(33.3);
    expect(m.aarrr.rujukanJumlah).toBe(1);
    expect(m.aarrr.akuisisi7Hari).toBe(1);
  });

  it("NPS = %promotor − %detraktor", () => {
    const f = [9, 10, 8, 7, 3].map((nps) => ({ nps, created_at: "2026-11-23T03:00:00Z" }));
    expect(hitungNps(f)).toEqual({ skor: 20, jumlah: 5, promotor: 2, pasif: 2, detraktor: 1 });
    expect(hitungNps([]).skor).toBeNull();
  });
});
