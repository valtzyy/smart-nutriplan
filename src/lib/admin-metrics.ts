import { selisihHari, tambahHari, tanggalJakarta } from "./date";

export interface MetricProfile {
  id: string;
  created_at: string;
  onboarding_selesai: boolean;
  /** Kolom migrasi 0003; undefined bila belum tersedia. */
  dirujuk_oleh?: string | null;
}
export interface MetricFeedback {
  nps: number;
  created_at: string;
}

export interface NpsResult {
  /** % promotor (9–10) − % detraktor (0–6); null bila belum ada jawaban. */
  skor: number | null;
  jumlah: number;
  promotor: number;
  pasif: number;
  detraktor: number;
}

/** Kerangka AARRR (KERTAS KERJA minggu 11). Persentase dibulatkan 1 desimal; null = belum bisa dihitung. */
export interface AarrrMetrics {
  /** Acquisition: pendaftar baru 7 hari terakhir & 7 hari sebelumnya. */
  akuisisi7Hari: number;
  akuisisi7HariSebelumnya: number;
  /** Activation: % pendaftar yang selesai onboarding (dapat meal plan) DAN membuka ≥1 resep. */
  aktivasi: number | null;
  aktivasiJumlah: number;
  /** Retention: % pendaftar (≥7 hari lalu) yang kembali punya event di hari ke-1..7 setelah daftar. */
  retensiD7: number | null;
  /** Referral: % pengguna yang datang lewat tautan rujukan (null bila kolom rujukan belum ada). */
  rujukan: number | null;
  rujukanJumlah: number;
  nps: NpsResult;
  premium: PremiumMetrics;
}
export interface MetricEvent {
  user_id: string | null;
  nama: string;
  created_at: string;
  meta?: Record<string, unknown> | null;
}

/** Uji minat Premium (tanpa pembayaran) — pengganti sementara metrik Revenue. */
export interface PremiumMetrics {
  /** Pengguna unik yang membuka halaman Premium / menekan "Saya tertarik" / menekan chat ahli gizi. */
  melihat: number;
  tertarik: number;
  klikChat: number;
  /** % pengguna aktif 7 hari terakhir yang menyatakan tertarik; null bila belum ada pengguna aktif. */
  minat: number | null;
  /** Fitur premium yang dipilih, urut terbanyak. */
  fiturTeratas: Array<{ kode: string; jumlah: number }>;
}
export interface MetricPlan {
  tanggal: string;
}

export interface DailyRow {
  tanggal: string;
  penggunaBaru: number;
  penggunaAktif: number;
  mealPlanDibuat: number;
}

export interface AdminMetrics {
  totalPengguna: number;
  selesaiOnboarding: number;
  aktifHariIni: number;
  aktif7Hari: number;
  /** null bila belum ada pengguna yang daftar ≥ 1 hari lalu. */
  retensiD1: number | null;
  mealPlanHariIni: number;
  resepDibuka7Hari: number;
  slotKosong7Hari: number;
  harian: DailyRow[];
  aarrr: AarrrMetrics;
}

function persen(a: number, b: number): number | null {
  return b === 0 ? null : Math.round((a / b) * 1000) / 10;
}

export function hitungNps(feedback: MetricFeedback[]): NpsResult {
  let promotor = 0;
  let pasif = 0;
  let detraktor = 0;
  for (const f of feedback) {
    if (f.nps >= 9) promotor++;
    else if (f.nps >= 7) pasif++;
    else detraktor++;
  }
  const jumlah = feedback.length;
  return {
    skor: jumlah === 0 ? null : Math.round(((promotor - detraktor) / jumlah) * 100),
    jumlah,
    promotor,
    pasif,
    detraktor,
  };
}

/** Semua metrik traksi /admin, dihitung di zona Asia/Jakarta. Fungsi murni. */
export function computeAdminMetrics(input: {
  profiles: MetricProfile[];
  events: MetricEvent[];
  plans: MetricPlan[];
  feedback?: MetricFeedback[];
  today: string;
  days?: number;
}): AdminMetrics {
  const { profiles, events, plans, today } = input;
  const days = input.days ?? 14;
  const awal7 = tambahHari(today, -6);

  // user → set tanggal aktif
  const aktifPerHari = new Map<string, Set<string>>();
  const aktifPerUser = new Map<string, Set<string>>();
  let resep7 = 0;
  let slot7 = 0;
  for (const e of events) {
    const t = tanggalJakarta(e.created_at);
    if (t >= awal7 && t <= today) {
      if (e.nama === "recipe_viewed") resep7++;
      if (e.nama === "slot_empty") slot7++;
    }
    if (!e.user_id) continue;
    if (!aktifPerHari.has(t)) aktifPerHari.set(t, new Set());
    aktifPerHari.get(t)!.add(e.user_id);
    if (!aktifPerUser.has(e.user_id)) aktifPerUser.set(e.user_id, new Set());
    aktifPerUser.get(e.user_id)!.add(t);
  }

  const aktif7 = new Set<string>();
  for (const [t, users] of aktifPerHari) if (t >= awal7 && t <= today) for (const u of users) aktif7.add(u);

  // Retensi D1: dari pengguna yang daftar ≥ 1 hari lalu, % yang punya event pada hari setelah daftar.
  let eligible = 0;
  let retained = 0;
  for (const p of profiles) {
    const daftar = tanggalJakarta(p.created_at);
    if (selisihHari(daftar, today) < 1) continue;
    eligible++;
    if (aktifPerUser.get(p.id)?.has(tambahHari(daftar, 1))) retained++;
  }

  const baruPerHari = new Map<string, number>();
  for (const p of profiles) {
    const t = tanggalJakarta(p.created_at);
    baruPerHari.set(t, (baruPerHari.get(t) ?? 0) + 1);
  }
  const planPerHari = new Map<string, number>();
  for (const p of plans) planPerHari.set(p.tanggal, (planPerHari.get(p.tanggal) ?? 0) + 1);

  const harian: DailyRow[] = [];
  for (let i = 0; i < days; i++) {
    const t = tambahHari(today, -i);
    harian.push({
      tanggal: t,
      penggunaBaru: baruPerHari.get(t) ?? 0,
      penggunaAktif: aktifPerHari.get(t)?.size ?? 0,
      mealPlanDibuat: planPerHari.get(t) ?? 0,
    });
  }

  // ===== AARRR =====
  const daftarPerUser = new Map(profiles.map((p) => [p.id, tanggalJakarta(p.created_at)]));
  let akuisisi7 = 0;
  let akuisisiSebelumnya = 0;
  for (const t of daftarPerUser.values()) {
    const umur = selisihHari(t, today);
    if (umur >= 0 && umur <= 6) akuisisi7++;
    else if (umur >= 7 && umur <= 13) akuisisiSebelumnya++;
  }

  const bukaResep = new Set<string>();
  for (const e of events) if (e.nama === "recipe_viewed" && e.user_id) bukaResep.add(e.user_id);
  const aktif = profiles.filter((p) => p.onboarding_selesai && bukaResep.has(p.id)).length;

  let eligibleD7 = 0;
  let kembaliD7 = 0;
  for (const [id, daftar] of daftarPerUser) {
    if (selisihHari(daftar, today) < 7) continue;
    eligibleD7++;
    const hari = aktifPerUser.get(id);
    if (hari && [...hari].some((t) => {
      const d = selisihHari(daftar, t);
      return d >= 1 && d <= 7;
    })) kembaliD7++;
  }

  const adaKolomRujukan = profiles.some((p) => p.dirujuk_oleh !== undefined);
  const dirujuk = profiles.filter((p) => p.dirujuk_oleh).length;

  const unik = (nama: string) => new Set(events.filter((e) => e.nama === nama && e.user_id).map((e) => e.user_id));
  const tertarik = unik("premium_interest");
  const fiturCount = new Map<string, number>();
  // Hitung pilihan fitur dari minat TERAKHIR tiap pengguna (menghindari dobel bila menekan berkali-kali).
  const minatTerakhir = new Map<string, MetricEvent>();
  for (const e of events) {
    if (e.nama !== "premium_interest" || !e.user_id) continue;
    const prev = minatTerakhir.get(e.user_id);
    if (!prev || prev.created_at < e.created_at) minatTerakhir.set(e.user_id, e);
  }
  for (const e of minatTerakhir.values()) {
    const fitur = Array.isArray(e.meta?.fitur) ? (e.meta?.fitur as unknown[]) : [];
    for (const f of fitur) if (typeof f === "string") fiturCount.set(f, (fiturCount.get(f) ?? 0) + 1);
  }
  const tertarikAktif = [...tertarik].filter((u) => u && aktif7.has(u)).length;
  const premium: PremiumMetrics = {
    melihat: unik("premium_viewed").size,
    tertarik: tertarik.size,
    klikChat: unik("premium_chat_clicked").size,
    minat: persen(tertarikAktif, aktif7.size),
    fiturTeratas: [...fiturCount.entries()]
      .map(([kode, jumlah]) => ({ kode, jumlah }))
      .sort((a, b) => b.jumlah - a.jumlah || a.kode.localeCompare(b.kode)),
  };

  const aarrr: AarrrMetrics = {
    premium,
    akuisisi7Hari: akuisisi7,
    akuisisi7HariSebelumnya: akuisisiSebelumnya,
    aktivasi: persen(aktif, profiles.length),
    aktivasiJumlah: aktif,
    retensiD7: persen(kembaliD7, eligibleD7),
    rujukan: adaKolomRujukan ? persen(dirujuk, profiles.length) : null,
    rujukanJumlah: dirujuk,
    nps: hitungNps(input.feedback ?? []),
  };

  return {
    aarrr,
    totalPengguna: profiles.length,
    selesaiOnboarding: profiles.filter((p) => p.onboarding_selesai).length,
    aktifHariIni: aktifPerHari.get(today)?.size ?? 0,
    aktif7Hari: aktif7.size,
    retensiD1: eligible === 0 ? null : Math.round((retained / eligible) * 1000) / 10,
    mealPlanHariIni: planPerHari.get(today) ?? 0,
    resepDibuka7Hari: resep7,
    slotKosong7Hari: slot7,
    harian,
  };
}

export function toCsv(rows: DailyRow[]): string {
  const header = "tanggal,pengguna_baru,pengguna_aktif,meal_plan_dibuat";
  return [header, ...rows.map((r) => `${r.tanggal},${r.penggunaBaru},${r.penggunaAktif},${r.mealPlanDibuat}`)].join(
    "\n",
  );
}
