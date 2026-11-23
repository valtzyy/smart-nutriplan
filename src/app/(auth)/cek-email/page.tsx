import { MailCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata = { title: "Cek email — Smart NutriPlan" };

export default function CekEmailPage() {
  return (
    <AuthShell back="/daftar" title="Cek emailmu, ya">
      <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-surface p-6 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary-soft text-primary-strong">
          <MailCheck size={30} aria-hidden />
        </span>
        <p className="text-body text-text">
          Kami sudah mengirim tautan konfirmasi ke emailmu. Buka tautan itu untuk mengaktifkan akun, lalu lanjut isi
          profil.
        </p>
        <p className="text-small text-text-muted">Tidak ketemu? Cek folder spam atau promosi.</p>
      </div>
      <ButtonLink href="/masuk" variant="secondary">
        Ke halaman masuk
      </ButtonLink>
    </AuthShell>
  );
}
