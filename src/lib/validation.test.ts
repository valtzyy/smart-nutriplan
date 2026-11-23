import { describe, expect, it } from "vitest";
import {
  anggaranSchema,
  daftarSchema,
  fieldErrors,
  normalisasiKodeRujukan,
  PESAN,
  profilTubuhSchema,
  resetSandiSchema,
  tujuanSchema,
  usiaDiLuarRentang,
} from "./validation";
import { homePathFor, safeNextPath } from "./onboarding";
import type { ProfileRow } from "./types";

describe("validasi form (PRD 5.5)", () => {
  it("daftar: pesan error sesuai PRD", () => {
    const r = daftarSchema.safeParse({ nama: "A", email: "bukan-email", password: "123", setuju: false });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(fieldErrors(r.error)).toEqual({
        nama: PESAN.nama,
        email: PESAN.email,
        password: PESAN.sandi,
        setuju: PESAN.setuju,
      });
    }
  });

  it("daftar valid", () => {
    expect(
      daftarSchema.safeParse({ nama: "Annisa", email: "annisa@contoh.com", password: "rahasia123", setuju: true })
        .success,
    ).toBe(true);
  });

  it("kode rujukan dinormalkan & disaring", () => {
    expect(normalisasiKodeRujukan(" ab12cd34 ")).toBe("AB12CD34");
    expect(normalisasiKodeRujukan("x")).toBeNull();
    expect(normalisasiKodeRujukan("<script>")).toBeNull();
    expect(normalisasiKodeRujukan(["AB12"])).toBeNull();
  });

  it("profil tubuh Annisa valid", () => {
    const r = profilTubuhSchema.safeParse({
      usia: "21",
      jenis_kelamin: "wanita",
      berat_badan: "55",
      tinggi_badan: "160",
      aktivitas_fisik: "sedang",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.usia).toBe(21);
  });

  it("profil tubuh: batas & pesan", () => {
    const r = profilTubuhSchema.safeParse({
      usia: "17",
      jenis_kelamin: "",
      berat_badan: "29",
      tinggi_badan: "231",
      aktivitas_fisik: "",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = fieldErrors(r.error);
      expect(e.jenis_kelamin).toBe(PESAN.jenisKelamin);
      expect(e.berat_badan).toBe(PESAN.bb);
      expect(e.tinggi_badan).toBe(PESAN.tb);
      expect(e.aktivitas_fisik).toBe(PESAN.aktivitas);
      expect(e.usia).toBeDefined();
    }
  });

  it("BB boleh 1 desimal, tidak 2", () => {
    const base = { usia: "30", jenis_kelamin: "pria", tinggi_badan: "170", aktivitas_fisik: "ringan" };
    expect(profilTubuhSchema.safeParse({ ...base, berat_badan: "55,5" }).success).toBe(true);
    expect(profilTubuhSchema.safeParse({ ...base, berat_badan: "55.55" }).success).toBe(false);
  });

  it("usia desimal ditolak", () => {
    const r = profilTubuhSchema.safeParse({
      usia: "21.5",
      jenis_kelamin: "pria",
      berat_badan: "60",
      tinggi_badan: "170",
      aktivitas_fisik: "ringan",
    });
    expect(r.success).toBe(false);
  });

  it("usia di luar rentang memicu kotak info", () => {
    expect(usiaDiLuarRentang("17")).toBe(true);
    expect(usiaDiLuarRentang("66")).toBe(true);
    expect(usiaDiLuarRentang("21")).toBe(false);
    expect(usiaDiLuarRentang("")).toBe(false);
  });

  it("tujuan wajib", () => {
    const r = tujuanSchema.safeParse({ tujuan: "" });
    expect(r.success).toBe(false);
    if (!r.success) expect(fieldErrors(r.error).tujuan).toBe(PESAN.tujuan);
  });

  it("reset sandi harus sama", () => {
    const r = resetSandiSchema.safeParse({ password: "rahasia123", confirm: "rahasia124" });
    expect(r.success).toBe(false);
    if (!r.success) expect(fieldErrors(r.error).confirm).toBe(PESAN.sandiBeda);
  });
});

describe("anggaran harian", () => {
  it.each([
    ["", null],
    ["35000", 35000],
    ["35.000", 35000],
    ["Rp 25.000", 25000],
    ["0", 0],
  ])("%s → %s", (raw, hasil) => {
    const r = anggaranSchema.safeParse(raw);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBe(hasil);
  });
  it.each(["-1", "abc", "1000001", "12,5"])("%s ditolak", (raw) => {
    const r = anggaranSchema.safeParse(raw);
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe(PESAN.anggaran);
  });
});

describe("pengalihan onboarding", () => {
  const kosong: ProfileRow = {
    id: "u",
    nama: "Annisa",
    role: "user",
    usia: null,
    jenis_kelamin: null,
    berat_badan: null,
    tinggi_badan: null,
    aktivitas_fisik: null,
    tujuan: null,
    anggaran_harian: null,
    onboarding_selesai: false,
    created_at: "",
    updated_at: "",
  };
  const step1 = { ...kosong, usia: 21, jenis_kelamin: "wanita", berat_badan: 55, tinggi_badan: 160, aktivitas_fisik: "sedang" } as const;

  it("pengguna baru → langkah 1", () => expect(homePathFor(kosong)).toBe("/onboarding/profil"));
  it("langkah 1 selesai → langkah 2", () => expect(homePathFor({ ...step1 })).toBe("/onboarding/tujuan"));
  it("langkah 2 selesai → langkah 3", () =>
    expect(homePathFor({ ...step1, tujuan: "turun" })).toBe("/onboarding/preferensi"));
  it("onboarding selesai → beranda", () =>
    expect(homePathFor({ ...step1, tujuan: "turun", onboarding_selesai: true })).toBe("/beranda"));
  it("flag selesai tapi data kurang → tetap onboarding", () =>
    expect(homePathFor({ ...kosong, onboarding_selesai: true })).toBe("/onboarding/profil"));

  it("safeNextPath menolak URL luar", () => {
    expect(safeNextPath("/meal-plan")).toBe("/meal-plan");
    expect(safeNextPath("https://jahat.com")).toBe("/");
    expect(safeNextPath("//jahat.com")).toBe("/");
    expect(safeNextPath(null, "/beranda")).toBe("/beranda");
  });
});
