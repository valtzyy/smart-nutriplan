"use client";

import { ChipGroup } from "@/components/ui/Chip";
import { InfoBox } from "@/components/ui/InfoBox";
import { Input } from "@/components/ui/Input";
import { OptionCard } from "@/components/ui/OptionCard";
import {
  AKTIVITAS_DESKRIPSI,
  AKTIVITAS_LABEL,
  GENDER_LABEL,
  TUJUAN_DESKRIPSI,
  TUJUAN_LABEL,
} from "@/lib/labels";
import { ACTIVITY_LEVELS, DIET_GOALS, GENDERS, type DietGoal } from "@/lib/nutrition/constants";
import type { AllergenRow } from "@/lib/types";
import { PESAN, usiaDiLuarRentang } from "@/lib/validation";

export interface TubuhValues {
  usia: string;
  jenis_kelamin: string;
  berat_badan: string;
  tinggi_badan: string;
  aktivitas_fisik: string;
}

export function TubuhFields({
  values,
  onChange,
  errors,
}: {
  values: TubuhValues;
  onChange: (v: TubuhValues) => void;
  errors: Record<string, string>;
}) {
  const set = (k: keyof TubuhValues, v: string) => onChange({ ...values, [k]: v });
  const usiaInfo = usiaDiLuarRentang(values.usia);
  return (
    <div className="flex flex-col gap-5">
      <Input
        label="Usia"
        name="usia"
        inputMode="numeric"
        suffix="tahun"
        value={values.usia}
        onChange={(e) => set("usia", e.target.value)}
        error={usiaInfo ? undefined : errors.usia}
      />
      {usiaInfo && <InfoBox>{PESAN.usiaInfo}</InfoBox>}
      <input type="hidden" name="jenis_kelamin" value={values.jenis_kelamin} />
      <ChipGroup
        label="Jenis kelamin"
        mode="radio"
        options={GENDERS.map((g) => ({ value: g, label: GENDER_LABEL[g] }))}
        value={values.jenis_kelamin ? [values.jenis_kelamin] : []}
        onChange={(v) => set("jenis_kelamin", v[0] ?? "")}
        error={errors.jenis_kelamin}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Berat badan"
          name="berat_badan"
          inputMode="decimal"
          suffix="kg"
          value={values.berat_badan}
          onChange={(e) => set("berat_badan", e.target.value)}
          error={errors.berat_badan}
        />
        <Input
          label="Tinggi badan"
          name="tinggi_badan"
          inputMode="decimal"
          suffix="cm"
          value={values.tinggi_badan}
          onChange={(e) => set("tinggi_badan", e.target.value)}
          error={errors.tinggi_badan}
        />
      </div>
      <input type="hidden" name="aktivitas_fisik" value={values.aktivitas_fisik} />
      <div className="flex flex-col gap-2">
        <ChipGroup
          label="Aktivitas fisik"
          mode="radio"
          options={ACTIVITY_LEVELS.map((a) => ({ value: a, label: AKTIVITAS_LABEL[a] }))}
          value={values.aktivitas_fisik ? [values.aktivitas_fisik] : []}
          onChange={(v) => set("aktivitas_fisik", v[0] ?? "")}
          error={errors.aktivitas_fisik}
        />
        {values.aktivitas_fisik && (
          <p className="text-small text-text-muted">
            {AKTIVITAS_LABEL[values.aktivitas_fisik as keyof typeof AKTIVITAS_LABEL]}:{" "}
            {AKTIVITAS_DESKRIPSI[values.aktivitas_fisik as keyof typeof AKTIVITAS_DESKRIPSI]}
          </p>
        )}
      </div>
    </div>
  );
}

export function TujuanFields({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: DietGoal) => void;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="tujuan" value={value} />
      <div role="radiogroup" aria-label="Tujuan" className="flex flex-col gap-3">
        {DIET_GOALS.map((g) => (
          <OptionCard
            key={g}
            title={TUJUAN_LABEL[g]}
            description={TUJUAN_DESKRIPSI[g]}
            selected={value === g}
            onSelect={() => onChange(g)}
          />
        ))}
      </div>
      {error && <p className="text-caption text-danger-text">{error}</p>}
    </div>
  );
}

export function AllergenFields({
  allergens,
  value,
  onChange,
}: {
  allergens: AllergenRow[];
  value: number[];
  onChange: (v: number[]) => void;
}) {
  const asStr = value.map(String);
  const grup = (jenis: AllergenRow["jenis"]) =>
    allergens
      .filter((a) => a.jenis === jenis)
      .sort((a, b) => a.urutan - b.urutan)
      .map((a) => ({ value: String(a.id), label: a.nama }));
  return (
    <div className="flex flex-col gap-5">
      {value.map((id) => (
        <input key={id} type="hidden" name="allergen_ids" value={id} />
      ))}
      <ChipGroup
        label="Alergi makanan"
        mode="checkbox"
        options={grup("alergi")}
        value={asStr}
        onChange={(v) => onChange(v.map(Number))}
      />
      <ChipGroup
        label="Pantangan atau tidak suka"
        mode="checkbox"
        options={grup("pantangan")}
        value={asStr}
        onChange={(v) => onChange(v.map(Number))}
      />
    </div>
  );
}
