import { Wallet } from "lucide-react";
import Link from "next/link";
import { cn } from "@/components/ui/cn";
import { formatRupiah } from "@/lib/biaya";
import type { TodayView } from "@/lib/plan-view";

/** Perkiraan biaya bahan hari ini vs anggaran harian (KK 7.3 anggaran_makan). */
export function BiayaCard({ biaya }: { biaya: TodayView["biaya"] }) {
  const diAtas = biaya.status === "di_atas_anggaran";
  return (
    <section
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4",
        diAtas ? "border-accent/40 bg-accent-soft" : "border-border bg-surface",
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-strong">
        <Wallet size={20} aria-hidden />
      </span>
      <div className="flex flex-1 flex-col gap-1">
        <span className="text-small text-text-muted">Perkiraan biaya bahan hari ini</span>
        <span className="text-h3-style text-text">
          ±{formatRupiah(biaya.total)}
          {!biaya.lengkap && <span className="text-caption font-normal text-text-muted"> (sebagian menu belum ada harga)</span>}
        </span>
        {biaya.status === "tanpa_anggaran" && (
          <Link href="/profil/edit" className="text-small font-semibold text-primary-strong active:opacity-60">
            Atur anggaran makan harianmu
          </Link>
        )}
        {biaya.status === "dalam_anggaran" && biaya.anggaran != null && (
          <span className="text-small text-text">
            Masih dalam anggaranmu ({formatRupiah(biaya.anggaran)}/hari). Mantap!
          </span>
        )}
        {diAtas && biaya.anggaran != null && (
          <span className="text-small text-text">
            Sekitar {formatRupiah(biaya.selisih)} di atas anggaranmu ({formatRupiah(biaya.anggaran)}/hari). Coba{" "}
            <Link href="/meal-plan" className="font-semibold text-primary-strong underline underline-offset-2">
              ganti beberapa menu
            </Link>
            .
          </span>
        )}
      </div>
    </section>
  );
}
