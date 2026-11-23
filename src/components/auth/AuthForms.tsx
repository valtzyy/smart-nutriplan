"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { daftarAction, lupaSandiAction, masukAction, resetSandiAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import { InfoBox } from "@/components/ui/InfoBox";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Toast } from "@/components/ui/Toast";
import type { ActionState } from "@/lib/types";
import { daftarSchema, fieldErrors, lupaSandiSchema, masukSchema, resetSandiSchema } from "@/lib/validation";
import type { z } from "zod";

/** Validasi zod di klien sebelum memanggil server action (server tetap memvalidasi ulang). */
function useValidatedAction(
  schema: z.ZodType,
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>,
  pick: (fd: FormData) => Record<string, unknown>,
) {
  const [clientErrors, setClientErrors] = useState<Record<string, string> | null>(null);
  const [state, formAction, pending] = useActionState(action, null);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const r = schema.safeParse(pick(new FormData(e.currentTarget)));
    if (!r.success) {
      e.preventDefault();
      setClientErrors(fieldErrors(r.error));
    } else {
      setClientErrors(null);
    }
  };
  const errors = clientErrors ?? state?.fieldErrors ?? {};
  return { state, formAction, pending, onSubmit, errors };
}

const get = (fd: FormData, k: string) => String(fd.get(k) ?? "");

export function DaftarForm() {
  const { state, formAction, pending, onSubmit, errors } = useValidatedAction(daftarSchema, daftarAction, (fd) => ({
    nama: get(fd, "nama"),
    email: get(fd, "email"),
    password: get(fd, "password"),
  }));
  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Input label="Nama panggilan" name="nama" autoComplete="nickname" error={errors.nama} required />
      <Input label="Email" name="email" type="email" autoComplete="email" inputMode="email" error={errors.email} required />
      <PasswordInput label="Kata sandi" name="password" autoComplete="new-password" error={errors.password} required />
      <Button type="submit" loading={pending} className="mt-2">
        Daftar
      </Button>
      <p className="text-center text-body text-text-muted">
        Sudah punya akun?{" "}
        <Link href="/masuk" className="font-semibold text-primary-strong">
          Masuk
        </Link>
      </p>
      <Toast message={state?.error} trigger={state} />
    </form>
  );
}

export function MasukForm({ next }: { next?: string }) {
  const { state, formAction, pending, onSubmit, errors } = useValidatedAction(masukSchema, masukAction, (fd) => ({
    email: get(fd, "email"),
    password: get(fd, "password"),
  }));
  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {next && <input type="hidden" name="next" value={next} />}
      <Input label="Email" name="email" type="email" autoComplete="email" inputMode="email" error={errors.email} required />
      <div className="flex flex-col gap-2">
        <PasswordInput
          label="Kata sandi"
          name="password"
          autoComplete="current-password"
          error={errors.password}
          required
        />
        <Link href="/lupa-sandi" className="self-end py-2 text-small font-semibold text-primary-strong">
          Lupa kata sandi?
        </Link>
      </div>
      {state?.error && (
        <p role="alert" className="text-small text-danger-text">
          {state.error}
        </p>
      )}
      <Button type="submit" loading={pending}>
        Masuk
      </Button>
      <p className="text-center text-body text-text-muted">
        Belum punya akun?{" "}
        <Link href="/daftar" className="font-semibold text-primary-strong">
          Daftar
        </Link>
      </p>
    </form>
  );
}

export function LupaSandiForm() {
  const { state, formAction, pending, onSubmit, errors } = useValidatedAction(lupaSandiSchema, lupaSandiAction, (fd) => ({
    email: get(fd, "email"),
  }));
  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Input label="Email" name="email" type="email" autoComplete="email" inputMode="email" error={errors.email} required />
      {state?.ok && <InfoBox variant="tips">Kalau email terdaftar, tautan reset sudah kami kirim.</InfoBox>}
      <Button type="submit" loading={pending}>
        Kirim tautan reset
      </Button>
      <Toast message={state?.error} trigger={state} />
    </form>
  );
}

export function ResetSandiForm() {
  const { state, formAction, pending, onSubmit, errors } = useValidatedAction(resetSandiSchema, resetSandiAction, (fd) => ({
    password: get(fd, "password"),
    confirm: get(fd, "confirm"),
  }));
  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <PasswordInput label="Kata sandi baru" name="password" autoComplete="new-password" error={errors.password} required />
      <PasswordInput label="Ulangi kata sandi baru" name="confirm" autoComplete="new-password" error={errors.confirm} required />
      {state?.error && (
        <p role="alert" className="text-small text-danger-text">
          {state.error}
        </p>
      )}
      <Button type="submit" loading={pending}>
        Simpan sandi baru
      </Button>
    </form>
  );
}
