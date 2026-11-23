import { Check, Minus, Sparkles } from "lucide-react";
import { PremiumMinat } from "@/components/PremiumMinat";
import { Badge } from "@/components/ui/Badge";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { InfoBox } from "@/components/ui/InfoBox";
import { TopBar } from "@/components/ui/TopBar";
import { requireUser } from "@/lib/auth";
import { formatRupiah } from "@/lib/biaya";
import { KONTAK } from "@/lib/brand";
import { logEvent } from "@/lib/events";
import { HARGA_PREMIUM_BULANAN, PERBANDINGAN } from "@/lib/premium";

export const metadata = { title: "Premium — Smart NutriPlan" };

function Tanda({ ada, label }: { ada: boolean; label: string }) {
  return ada ? (
    <Check size={18} aria-label={`${label}: termasuk`} className="mx-auto text-primary-strong" />
  ) : (
    <Minus size={18} aria-label={`${label}: tidak termasuk`} className="mx-auto text-text-muted" />
  );
}

export default async function PremiumPage() {
  const { supabase, user } = await requireUser();
  void logEvent(supabase, user.id, "premium_viewed");

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 pt-6 pb-12">
      <TopBar href="/profil" />
      <section className="flex flex-col gap-3 rounded-lg bg-primary-strong p-5 text-on-primary">
        <Badge className="self-start">
          <Sparkles size={14} aria-hidden /> Segera hadir
        </Badge>
        <h1 className="text-h2-style">Smart NutriPlan Premium</h1>
        <p className="text-body">Didampingi ahli gizi, supaya pola makanmu makin tepat sasaran.</p>
        <p className="flex items-baseline gap-1">
          <span className="font-heading text-h1 font-bold">{formatRupiah(HARGA_PREMIUM_BULANAN)}</span>
          <span className="text-small">/bulan (rencana harga)</span>
        </p>
      </section>

      <InfoBox>
        Premium belum tersedia dan <strong>belum ada pembayaran</strong>. Dengan menekan &quot;Saya tertarik&quot;, kamu
        tidak dikenai biaya apa pun — kami hanya mencatat minatmu untuk menentukan fitur yang dibangun berikutnya.
      </InfoBox>

      <section className="flex flex-col gap-3">
        <h2 className="text-h3-style text-text">Gratis vs Premium</h2>
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-small">
            <thead className="bg-primary-soft text-text">
              <tr>
                <th className="px-3 py-2 font-semibold">Fitur</th>
                <th className="w-16 px-2 py-2 text-center font-semibold">Gratis</th>
                <th className="w-18 px-2 py-2 text-center font-semibold">Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {PERBANDINGAN.map(([fitur, gratis, premium]) => (
                <tr key={fitur}>
                  <td className="px-3 py-2 text-text">{fitur}</td>
                  <td className="px-2 py-2">
                    <Tanda ada={gratis} label="Gratis" />
                  </td>
                  <td className="px-2 py-2">
                    <Tanda ada={premium} label="Premium" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <PremiumMinat chatTersedia={Boolean(KONTAK.whatsappLink)} />
      <Disclaimer />
    </main>
  );
}
