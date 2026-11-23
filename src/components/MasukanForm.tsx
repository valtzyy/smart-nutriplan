"use client";

import { HeartHandshake } from "lucide-react";
import { useActionState, useId, useState } from "react";
import { kirimMasukan } from "@/app/masukan/actions";
import { ButtonLink } from "@/components/ui/Button";
import { ChipGroup } from "@/components/ui/Chip";
import { cn } from "@/components/ui/cn";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Toast } from "@/components/ui/Toast";
import { BERSEDIA_BAYAR, type BersediaBayar } from "@/lib/types";
import { fieldErrors, masukanSchema } from "@/lib/validation";

const LABEL_BAYAR: Record<BersediaBayar, string> = {
  "0": "Belum mau bayar",
  "<10k": "< Rp10.000/bln",
  "10-20k": "Rp10–20 ribu/bln",
  "20-50k": "Rp20–50 ribu/bln",
  ">50k": "> Rp50.000/bln",
};

function TextArea({ name, label, placeholder, error }: { name: string; label: string; placeholder?: string; error?: string }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-label-style text-text-muted">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={3}
        maxLength={1000}
        placeholder={placeholder}
        className="rounded-md border-[1.5px] border-border bg-surface px-4 py-3 text-body text-text outline-none placeholder:text-text-muted/70 focus:border-primary-strong focus:ring-2 focus:ring-primary-strong/30"
      />
      {error && <p className="text-caption text-danger-text">{error}</p>}
    </div>
  );
}

export function MasukanForm() {
  const [nps, setNps] = useState<number | null>(null);
  const [bayar, setBayar] = useState<BersediaBayar | "">("");
  const [clientErrors, setClientErrors] = useState<Record<string, string> | null>(null);
  const [state, action] = useActionState(kirimMasukan, null);
  const errors = clientErrors ?? state?.fieldErrors ?? {};
  const npsLabelId = useId();

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-surface p-6 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary-soft text-primary-strong">
          <HeartHandshake size={30} aria-hidden />
        </span>
        <h2 className="text-h3-style text-text">Terima kasih atas masukanmu!</h2>
        <p className="text-body text-text-muted">Masukanmu langsung kami baca untuk memperbaiki Smart NutriPlan.</p>
        <ButtonLink href="/beranda">Kembali ke Beranda</ButtonLink>
      </div>
    );
  }

  return (
    <form
      action={action}
      noValidate
      onSubmit={(e) => {
        const fd = new FormData(e.currentTarget);
        const r = masukanSchema.safeParse(Object.fromEntries(fd));
        if (!r.success) {
          e.preventDefault();
          setClientErrors(fieldErrors(r.error));
        } else setClientErrors(null);
      }}
      className="flex flex-col gap-6"
    >
      <fieldset className="flex flex-col gap-3">
        <legend id={npsLabelId} className="mb-3 text-body font-semibold text-text">
          Seberapa besar kemungkinan kamu merekomendasikan Smart NutriPlan ke teman?
        </legend>
        <input type="hidden" name="nps" value={nps ?? ""} />
        <div role="radiogroup" aria-labelledby={npsLabelId} className="grid grid-cols-6 gap-2">
          {Array.from({ length: 11 }, (_, n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={nps === n}
              aria-label={`Skor ${n}`}
              onClick={() => setNps(n)}
              className={cn(
                "flex h-11 items-center justify-center rounded-md border text-body font-semibold transition duration-100 select-none active:scale-95",
                nps === n
                  ? "border-primary-strong bg-primary-strong text-on-primary"
                  : "border-border bg-surface text-text hover:border-primary",
              )}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-caption text-text-muted">
          <span>0 = tidak mungkin</span>
          <span>10 = pasti</span>
        </div>
        {errors.nps && <p className="text-caption text-danger-text">{errors.nps}</p>}
      </fieldset>

      <TextArea
        name="alasan_rekomendasi"
        label="Apa alasan utama skormu?"
        placeholder="Mis. takarannya gampang dipahami"
        error={errors.alasan_rekomendasi}
      />
      <TextArea name="disukai" label="Apa yang paling kamu sukai?" error={errors.disukai} />
      <TextArea name="membingungkan" label="Apa yang paling membingungkan?" error={errors.membingungkan} />
      <TextArea
        name="berhenti"
        label="Ada yang membuatmu berhenti atau malas memakai aplikasi?"
        error={errors.berhenti}
      />

      <input type="hidden" name="bersedia_bayar" value={bayar} />
      <ChipGroup
        label="Kalau ada versi berbayar, berapa yang bersedia kamu bayar? (opsional)"
        mode="radio"
        options={BERSEDIA_BAYAR.map((b) => ({ value: b, label: LABEL_BAYAR[b] }))}
        value={bayar ? [bayar] : []}
        onChange={(v) => setBayar((v[0] as BersediaBayar) ?? "")}
      />

      <SubmitButton>Kirim masukan</SubmitButton>
      <Toast message={state?.error} trigger={state} />
    </form>
  );
}
