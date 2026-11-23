"use client";

import { MessageCircle, PartyPopper } from "lucide-react";
import { useActionState, useState } from "react";
import { nyatakanMinat } from "@/app/premium/actions";
import { buttonClass } from "@/components/ui/Button";
import { ChipGroup } from "@/components/ui/Chip";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Toast } from "@/components/ui/Toast";
import { FITUR_PREMIUM, type KodeFiturPremium } from "@/lib/premium";

/** Formulir "Saya tertarik" + tombol chat ahli gizi (manual via WhatsApp). */
export function PremiumMinat({ chatTersedia }: { chatTersedia: boolean }) {
  const [fitur, setFitur] = useState<KodeFiturPremium[]>([]);
  const [state, action] = useActionState(nyatakanMinat, null);

  const tombolChat = (
    // <a> biasa (bukan Link): route handler mencatat klik lalu mengalihkan ke WhatsApp
    // (atau halaman kontak bila nomor belum diatur).
    <a href="/premium/chat" className={buttonClass("secondary")}>
      <MessageCircle size={18} aria-hidden />
      {chatTersedia ? "Chat ahli gizi via WhatsApp" : "Hubungi tim"}
    </a>
  );

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-surface p-6 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary-soft text-primary-strong">
          <PartyPopper size={30} aria-hidden />
        </span>
        <h2 className="text-h3-style text-text">Terima kasih, minatmu sudah kami catat!</h2>
        <p className="text-body text-text-muted">
          Kami kabari saat Premium tersedia. Sambil menunggu, kamu tetap bisa memakai semua fitur gratis.
        </p>
        <div className="w-full">{tombolChat}</div>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      {fitur.map((f) => (
        <input key={f} type="hidden" name="fitur" value={f} />
      ))}
      <ChipGroup
        label="Fitur premium mana yang paling kamu butuhkan? (opsional, boleh lebih dari satu)"
        mode="checkbox"
        options={FITUR_PREMIUM.map((f) => ({ value: f.kode, label: f.label }))}
        value={fitur}
        onChange={setFitur}
      />
      <SubmitButton>Saya tertarik</SubmitButton>
      {tombolChat}
      <Toast message={state?.error} trigger={state} />
    </form>
  );
}
