"use client";

import { useActionState, useState } from "react";
import { simpanPreferensi, simpanProfilTubuh, simpanTujuan } from "@/app/onboarding/actions";
import { AllergenFields, TubuhFields, TujuanFields, type TubuhValues } from "@/components/profile/ProfileFields";
import { Button } from "@/components/ui/Button";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { InfoBox } from "@/components/ui/InfoBox";
import { Toast } from "@/components/ui/Toast";
import type { AllergenRow } from "@/lib/types";
import { fieldErrors, profilTubuhSchema, tujuanSchema, usiaDiLuarRentang } from "@/lib/validation";

export function ProfilTubuhForm({ initial }: { initial: TubuhValues }) {
  const [values, setValues] = useState(initial);
  const [clientErrors, setClientErrors] = useState<Record<string, string> | null>(null);
  const [state, action, pending] = useActionState(simpanProfilTubuh, null);
  const errors = clientErrors ?? state?.fieldErrors ?? {};
  const usiaBlok = usiaDiLuarRentang(values.usia);

  return (
    <form
      action={action}
      noValidate
      onSubmit={(e) => {
        const r = profilTubuhSchema.safeParse(values);
        if (!r.success) {
          e.preventDefault();
          setClientErrors(fieldErrors(r.error));
        } else setClientErrors(null);
      }}
      className="flex flex-1 flex-col gap-6"
    >
      <TubuhFields values={values} onChange={setValues} errors={errors} />
      <Button type="submit" loading={pending} disabled={usiaBlok} className="mt-auto">
        Lanjut
      </Button>
      <Toast message={state?.error} trigger={state} />
    </form>
  );
}

export function TujuanForm({ initial }: { initial: string }) {
  const [tujuan, setTujuan] = useState(initial);
  const [clientError, setClientError] = useState<string | null>(null);
  const [state, action, pending] = useActionState(simpanTujuan, null);
  return (
    <form
      action={action}
      noValidate
      onSubmit={(e) => {
        const r = tujuanSchema.safeParse({ tujuan });
        if (!r.success) {
          e.preventDefault();
          setClientError(fieldErrors(r.error).tujuan);
        } else setClientError(null);
      }}
      className="flex flex-1 flex-col gap-6"
    >
      <TujuanFields value={tujuan} onChange={setTujuan} error={clientError ?? state?.fieldErrors?.tujuan} />
      <InfoBox>Demi keamanan, target kalori tidak akan di bawah 1.200 kkal (wanita) atau 1.500 kkal (pria).</InfoBox>
      <Disclaimer />
      <Button type="submit" loading={pending} className="mt-auto">
        Lanjut
      </Button>
      <Toast message={state?.error} trigger={state} />
    </form>
  );
}

export function PreferensiForm({ allergens, initial }: { allergens: AllergenRow[]; initial: number[] }) {
  const [ids, setIds] = useState(initial);
  const [state, action, pending] = useActionState(simpanPreferensi, null);
  return (
    <form action={action} className="flex flex-1 flex-col gap-6">
      <AllergenFields allergens={allergens} value={ids} onChange={setIds} />
      <InfoBox>
        Punya kondisi medis seperti GERD atau diabetes? Konsultasikan dulu ke ahli gizi. Filter kondisi kesehatan hadir
        di versi berikutnya.
      </InfoBox>
      <Disclaimer />
      <Button type="submit" loading={pending} className="mt-auto">
        Buat Rencana Makanku
      </Button>
      <Toast message={state?.error} trigger={state} />
    </form>
  );
}
