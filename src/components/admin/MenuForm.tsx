"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { simpanMenu } from "@/app/admin/menu/actions";
import { Button } from "@/components/ui/Button";
import { ChipGroup } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { SLOT_LABEL, STATUS_MENU_LABEL, TUJUAN_LABEL } from "@/lib/labels";
import { DIET_GOALS, MEAL_SLOTS, type DietGoal, type MealSlot } from "@/lib/nutrition/constants";
import type { ActionState, AllergenRow, MenuStatus } from "@/lib/types";
import { fieldErrors, menuFormSchema, type MenuFormInput } from "@/lib/validation";

export interface MenuFormState {
  slug: string;
  nama: string;
  kategori: MealSlot | "";
  kalori: string;
  protein: string;
  karbohidrat: string;
  lemak: string;
  porsi: { nama: string; qty: string; satuan: string }[];
  bahan: string[];
  langkah: string[];
  cocok_untuk: DietGoal[];
  estimasi_harga: string;
  waktu_masak_menit: string;
  foto_url: string;
  sumber_gizi: string;
  dicek_ahli_gizi: boolean;
  status: MenuStatus;
  allergen_ids: number[];
}

export const MENU_KOSONG: MenuFormState = {
  slug: "",
  nama: "",
  kategori: "",
  kalori: "",
  protein: "",
  karbohidrat: "",
  lemak: "",
  porsi: [{ nama: "", qty: "1", satuan: "" }],
  bahan: [""],
  langkah: [""],
  cocok_untuk: [...DIET_GOALS],
  estimasi_harga: "",
  waktu_masak_menit: "",
  foto_url: "",
  sumber_gizi: "Estimasi tim (TKPI)",
  dicek_ahli_gizi: false,
  status: "draft",
  allergen_ids: [],
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function toInput(v: MenuFormState): MenuFormInput {
  const optNum = (s: string) => (s.trim() === "" ? null : s.trim());
  return {
    slug: v.slug || slugify(v.nama),
    nama: v.nama,
    kategori: v.kategori as MealSlot,
    kalori: v.kalori,
    protein: v.protein,
    karbohidrat: v.karbohidrat,
    lemak: v.lemak,
    porsi: v.porsi.map((p) => ({ nama: p.nama, qty: p.qty.replace(",", "."), satuan: p.satuan })),
    bahan: v.bahan.map((b) => b.trim()).filter(Boolean),
    langkah: v.langkah.map((l) => l.trim()).filter(Boolean),
    cocok_untuk: v.cocok_untuk,
    estimasi_harga: optNum(v.estimasi_harga),
    waktu_masak_menit: optNum(v.waktu_masak_menit),
    foto_url: v.foto_url.trim() === "" ? null : v.foto_url.trim(),
    sumber_gizi: v.sumber_gizi,
    dicek_ahli_gizi: v.dicek_ahli_gizi,
    status: v.status,
    allergen_ids: v.allergen_ids,
  } as MenuFormInput;
}

function ListEditor({
  label,
  items,
  onChange,
  error,
  multiline,
}: {
  label: string;
  items: string[];
  onChange: (v: string[]) => void;
  error?: string;
  multiline?: boolean;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-label-style text-text-muted">{label}</legend>
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-2">
          {multiline ? (
            <textarea
              aria-label={`${label} ${i + 1}`}
              value={it}
              rows={2}
              onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
              className="min-h-13 flex-1 rounded-md border-[1.5px] border-border bg-surface px-4 py-3 text-body outline-none focus:border-primary-strong"
            />
          ) : (
            <input
              aria-label={`${label} ${i + 1}`}
              value={it}
              onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
              className="h-13 min-w-0 flex-1 rounded-md border-[1.5px] border-border bg-surface px-4 text-body outline-none focus:border-primary-strong"
            />
          )}
          <button
            type="button"
            aria-label={`Hapus ${label.toLowerCase()} ${i + 1}`}
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="flex size-11 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-accent-soft"
          >
            <Trash2 size={18} aria-hidden />
          </button>
        </div>
      ))}
      <Button type="button" variant="ghost" fullWidth={false} className="h-11 self-start px-3" onClick={() => onChange([...items, ""])}>
        <Plus size={18} aria-hidden /> Tambah baris
      </Button>
      {error && <p className="text-caption text-danger-text">{error}</p>}
    </fieldset>
  );
}

export function MenuForm({
  id,
  initial,
  allergens,
}: {
  id: string | null;
  initial: MenuFormState;
  allergens: AllergenRow[];
}) {
  const [v, setV] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ActionState>(null);
  const [pending, startTransition] = useTransition();
  const set = <K extends keyof MenuFormState>(k: K, val: MenuFormState[K]) => setV((s) => ({ ...s, [k]: val }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = toInput(v);
    const r = menuFormSchema.safeParse(input);
    if (!r.success) {
      setErrors(fieldErrors(r.error));
      return;
    }
    setErrors({});
    startTransition(async () => {
      const res = await simpanMenu(id, input);
      if (res && !res.ok) {
        setErrors(res.fieldErrors ?? {});
        setResult(res);
      }
    });
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <Input label="Nama menu" value={v.nama} onChange={(e) => set("nama", e.target.value)} error={errors.nama} />
      <Input
        label="Slug (kosongkan untuk otomatis)"
        value={v.slug}
        placeholder={slugify(v.nama)}
        onChange={(e) => set("slug", e.target.value)}
        error={errors.slug}
      />
      <ChipGroup
        label="Kategori"
        mode="radio"
        options={MEAL_SLOTS.map((s) => ({ value: s, label: SLOT_LABEL[s] }))}
        value={v.kategori ? [v.kategori] : []}
        onChange={(x) => set("kategori", (x[0] ?? "") as MealSlot)}
        error={errors.kategori}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Kalori" suffix="kkal" inputMode="numeric" value={v.kalori} onChange={(e) => set("kalori", e.target.value)} error={errors.kalori} />
        <Input label="Protein" suffix="g" inputMode="decimal" value={v.protein} onChange={(e) => set("protein", e.target.value)} error={errors.protein} />
        <Input label="Karbohidrat" suffix="g" inputMode="decimal" value={v.karbohidrat} onChange={(e) => set("karbohidrat", e.target.value)} error={errors.karbohidrat} />
        <Input label="Lemak" suffix="g" inputMode="decimal" value={v.lemak} onChange={(e) => set("lemak", e.target.value)} error={errors.lemak} />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-label-style text-text-muted">Porsi (takaran rumah tangga)</legend>
        {v.porsi.map((p, i) => {
          const upd = (patch: Partial<MenuFormState["porsi"][number]>) =>
            set(
              "porsi",
              v.porsi.map((x, j) => (j === i ? { ...x, ...patch } : x)),
            );
          return (
            <div key={i} className="grid grid-cols-[1fr_4rem_5.5rem_2.75rem] items-center gap-2">
              <input aria-label={`Nama komponen ${i + 1}`} placeholder="Nasi putih" value={p.nama} onChange={(e) => upd({ nama: e.target.value })} className="h-11 min-w-0 rounded-md border-[1.5px] border-border bg-surface px-3 text-small outline-none focus:border-primary-strong" />
              <input aria-label={`Jumlah ${i + 1}`} inputMode="decimal" value={p.qty} onChange={(e) => upd({ qty: e.target.value })} className="h-11 min-w-0 rounded-md border-[1.5px] border-border bg-surface px-3 text-small outline-none focus:border-primary-strong" />
              <input aria-label={`Satuan ${i + 1}`} placeholder="centong" value={p.satuan} onChange={(e) => upd({ satuan: e.target.value })} className="h-11 min-w-0 rounded-md border-[1.5px] border-border bg-surface px-3 text-small outline-none focus:border-primary-strong" />
              <button type="button" aria-label={`Hapus komponen ${i + 1}`} onClick={() => set("porsi", v.porsi.filter((_, j) => j !== i))} className="flex size-11 items-center justify-center rounded-md text-text-muted hover:bg-accent-soft">
                <Trash2 size={18} aria-hidden />
              </button>
            </div>
          );
        })}
        <Button type="button" variant="ghost" fullWidth={false} className="h-11 self-start px-3" onClick={() => set("porsi", [...v.porsi, { nama: "", qty: "1", satuan: "" }])}>
          <Plus size={18} aria-hidden /> Tambah komponen
        </Button>
        {errors.porsi && <p className="text-caption text-danger-text">{errors.porsi}</p>}
      </fieldset>

      <ListEditor label="Bahan" items={v.bahan} onChange={(x) => set("bahan", x)} error={errors.bahan} />
      <ListEditor label="Langkah" items={v.langkah} onChange={(x) => set("langkah", x)} error={errors.langkah} multiline />

      <ChipGroup
        label="Alergen yang dikandung"
        mode="checkbox"
        options={allergens.map((a) => ({ value: String(a.id), label: a.nama }))}
        value={v.allergen_ids.map(String)}
        onChange={(x) => set("allergen_ids", x.map(Number))}
      />
      <ChipGroup
        label="Cocok untuk"
        mode="checkbox"
        options={DIET_GOALS.map((g) => ({ value: g, label: TUJUAN_LABEL[g] }))}
        value={v.cocok_untuk}
        onChange={(x) => set("cocok_untuk", x)}
        error={errors.cocok_untuk}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Estimasi harga" suffix="Rp" inputMode="numeric" value={v.estimasi_harga} onChange={(e) => set("estimasi_harga", e.target.value)} error={errors.estimasi_harga} />
        <Input label="Waktu masak" suffix="menit" inputMode="numeric" value={v.waktu_masak_menit} onChange={(e) => set("waktu_masak_menit", e.target.value)} error={errors.waktu_masak_menit} />
      </div>
      <Input label="URL foto (opsional)" type="url" value={v.foto_url} onChange={(e) => set("foto_url", e.target.value)} error={errors.foto_url} />
      <Input label="Sumber gizi" value={v.sumber_gizi} onChange={(e) => set("sumber_gizi", e.target.value)} error={errors.sumber_gizi} />

      <ChipGroup
        label="Status"
        mode="radio"
        options={(["draft", "aktif"] as const).map((s) => ({ value: s, label: STATUS_MENU_LABEL[s] }))}
        value={[v.status]}
        onChange={(x) => set("status", (x[0] ?? "draft") as MenuStatus)}
      />
      <label className="flex min-h-11 items-center gap-3 text-body text-text">
        <input
          type="checkbox"
          role="switch"
          checked={v.dicek_ahli_gizi}
          onChange={(e) => set("dicek_ahli_gizi", e.target.checked)}
          className="size-5 accent-primary-strong"
        />
        Sudah dicek ahli gizi
      </label>

      <Button type="submit" loading={pending}>
        Simpan menu
      </Button>
      <Toast message={result?.error} trigger={result} />
    </form>
  );
}
