"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { selesaiEditProfil, simpanEditProfil } from "@/app/profil/actions";
import { AllergenFields, TubuhFields, TujuanFields, type TubuhValues } from "@/components/profile/ProfileFields";
import { Button } from "@/components/ui/Button";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import type { AllergenRow } from "@/lib/types";
import { editProfilSchema, fieldErrors, usiaDiLuarRentang } from "@/lib/validation";

interface Props {
  allergens: AllergenRow[];
  initial: TubuhValues & { nama: string; tujuan: string; allergen_ids: number[] };
}

export function EditProfileForm({ allergens, initial }: Props) {
  const [nama, setNama] = useState(initial.nama);
  const [tubuh, setTubuh] = useState<TubuhValues>(initial);
  const [tujuan, setTujuan] = useState(initial.tujuan);
  const [ids, setIds] = useState(initial.allergen_ids);
  const [clientErrors, setClientErrors] = useState<Record<string, string> | null>(null);
  const [state, action, pending] = useActionState(simpanEditProfil, null);
  const [doneState, doneAction, donePending] = useActionState(selesaiEditProfil, null);
  const [pilihan, setPilihan] = useState<"1" | "0" | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const errors = clientErrors ?? state?.fieldErrors ?? {};

  useEffect(() => {
    if (state?.ok) dialogRef.current?.showModal();
  }, [state]);

  return (
    <>
      <form
        action={action}
        noValidate
        onSubmit={(e) => {
          const r = editProfilSchema.safeParse({ nama, ...tubuh, tujuan, allergen_ids: ids });
          if (!r.success) {
            e.preventDefault();
            setClientErrors(fieldErrors(r.error));
          } else setClientErrors(null);
        }}
        className="flex flex-col gap-6"
      >
        <Input
          label="Nama panggilan"
          name="nama"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          error={errors.nama}
          autoComplete="nickname"
        />
        <TubuhFields values={tubuh} onChange={setTubuh} errors={errors} />
        <div className="flex flex-col gap-2">
          <span className="text-label-style text-text-muted">Tujuan</span>
          <TujuanFields value={tujuan} onChange={setTujuan} error={errors.tujuan} />
        </div>
        <AllergenFields allergens={allergens} value={ids} onChange={setIds} />
        <Disclaimer />
        <Button type="submit" loading={pending} disabled={usiaDiLuarRentang(tubuh.usia)}>
          Simpan
        </Button>
        <Toast message={state?.error} trigger={state} />
      </form>

      <dialog
        ref={dialogRef}
        aria-labelledby="dialog-perbarui-judul"
        className="m-auto w-[calc(100%-3rem)] max-w-96 rounded-lg border border-border bg-surface p-6 text-text backdrop:bg-text/40"
        onCancel={(e) => e.preventDefault()}
      >
        <form action={doneAction} className="flex flex-col gap-4">
          <h2 id="dialog-perbarui-judul" className="text-h3-style">
            Profilmu sudah diperbarui. Perbarui meal plan hari ini juga?
          </h2>
          <p className="text-small text-text-muted">Kalau pilih &quot;Nanti saja&quot;, perubahan berlaku mulai besok.</p>
          <Button
            type="submit"
            name="regenerate"
            value="1"
            loading={donePending && pilihan === "1"}
            disabled={donePending}
            onClick={() => setPilihan("1")}
          >
            Ya, perbarui
          </Button>
          <Button
            type="submit"
            name="regenerate"
            value="0"
            variant="ghost"
            loading={donePending && pilihan === "0"}
            disabled={donePending}
            onClick={() => setPilihan("0")}
          >
            Nanti saja
          </Button>
          {doneState?.error && <p className="text-small text-danger-text">{doneState.error}</p>}
        </form>
      </dialog>
    </>
  );
}
