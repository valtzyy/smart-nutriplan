"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

/** Tautan rujukan pribadi (KERTAS KERJA minggu 10: mekanisme rujukan sederhana). */
export function AjakTeman({ url, kode }: { url: string; kode: string }) {
  const [disalin, setDisalin] = useState(false);

  const salin = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setDisalin(true);
      setTimeout(() => setDisalin(false), 2500);
    } catch {
      // Clipboard tidak tersedia (mis. http): biarkan pengguna menyalin manual dari teks.
    }
  };

  const bagikan = async () => {
    const data = {
      title: "Smart NutriPlan",
      text: "Aku pakai Smart NutriPlan buat atur porsi makan dari masakan lokal. Coba juga, gratis:",
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        // Dibatalkan pengguna → tidak perlu apa-apa.
        return;
      }
    }
    await salin();
  };

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-h3-style text-text">Ajak teman</h2>
        <p className="text-small text-text-muted">
          Bagikan tautan ini. Teman yang daftar lewat tautanmu tercatat sebagai rujukanmu (kode {kode}).
        </p>
      </div>
      <p className="truncate rounded-md bg-primary-soft px-3 py-2 text-small text-primary-strong" title={url}>
        {url}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" className="h-11 px-3" onClick={salin}>
          {disalin ? <Check size={18} aria-hidden /> : <Copy size={18} aria-hidden />}
          {disalin ? "Tersalin" : "Salin"}
        </Button>
        <Button className="h-11 px-3" onClick={bagikan}>
          <Share2 size={18} aria-hidden />
          Bagikan
        </Button>
      </div>
      <span role="status" aria-live="polite" className="sr-only">
        {disalin ? "Tautan tersalin" : ""}
      </span>
    </section>
  );
}
