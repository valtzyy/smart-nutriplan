import { selisihHari, tambahHari, tanggalJakarta } from "./date";

export interface MetricProfile {
  id: string;
  created_at: string;
  onboarding_selesai: boolean;
}
export interface MetricEvent {
  user_id: string | null;
  nama: string;
  created_at: string;
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
}

/** Semua metrik traksi /admin, dihitung di zona Asia/Jakarta. Fungsi murni. */
export function computeAdminMetrics(input: {
  profiles: MetricProfile[];
  events: MetricEvent[];
  plans: MetricPlan[];
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

  return {
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
