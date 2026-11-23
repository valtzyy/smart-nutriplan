import { Check, Plus } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { requireAdmin } from "@/lib/auth";
import { formatAngka, SLOT_LABEL, STATUS_MENU_LABEL } from "@/lib/labels";
import { MEAL_SLOTS, type MealSlot } from "@/lib/nutrition/constants";
import type { MenuRow, MenuStatus } from "@/lib/types";

export const metadata = { title: "Kelola menu — Smart NutriPlan" };

function filterHref(kategori?: string, status?: string) {
  const sp = new URLSearchParams();
  if (kategori) sp.set("kategori", kategori);
  if (status) sp.set("status", status);
  const q = sp.toString();
  return q ? `/admin/menu?${q}` : "/admin/menu";
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex min-h-9 items-center rounded-full border px-3 text-label-style",
        active ? "border-primary-strong bg-primary-soft text-primary-strong" : "border-border bg-surface text-text",
      )}
    >
      {children}
    </Link>
  );
}

export default async function AdminMenuPage({ searchParams }: PageProps<"/admin/menu">) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const kategori = MEAL_SLOTS.includes(sp.kategori as MealSlot) ? (sp.kategori as MealSlot) : undefined;
  const status = sp.status === "aktif" || sp.status === "draft" ? (sp.status as MenuStatus) : undefined;

  let q = supabase
    .from("menus")
    .select("id, slug, nama, kategori, kalori, status, dicek_ahli_gizi")
    .order("kategori")
    .order("nama");
  if (kategori) q = q.eq("kategori", kategori);
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  const menus = (data ?? []) as Pick<MenuRow, "id" | "slug" | "nama" | "kategori" | "kalori" | "status" | "dicek_ahli_gizi">[];

  return (
    <main className="flex flex-col gap-5 px-6 py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-h2-style text-text">Menu</h1>
        <ButtonLink href="/admin/menu/baru" fullWidth={false} className="h-11 px-4">
          <Plus size={18} aria-hidden />
          Tambah menu
        </ButtonLink>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2" aria-label="Filter kategori">
          <FilterChip href={filterHref(undefined, status)} active={!kategori}>
            Semua kategori
          </FilterChip>
          {MEAL_SLOTS.map((s) => (
            <FilterChip key={s} href={filterHref(s, status)} active={kategori === s}>
              {SLOT_LABEL[s]}
            </FilterChip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Filter status">
          <FilterChip href={filterHref(kategori, undefined)} active={!status}>
            Semua status
          </FilterChip>
          {(["aktif", "draft"] as const).map((s) => (
            <FilterChip key={s} href={filterHref(kategori, s)} active={status === s}>
              {STATUS_MENU_LABEL[s]}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-left text-small">
          <thead className="bg-primary-soft text-text">
            <tr>
              <th className="px-3 py-2 font-semibold">Nama</th>
              <th className="px-3 py-2 font-semibold">Kategori</th>
              <th className="px-3 py-2 text-right font-semibold">Kkal</th>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2 font-semibold">
                <span className="sr-only">Dicek ahli gizi</span>
                <span aria-hidden>Ahli gizi</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {menus.map((m) => (
              <tr key={m.id}>
                <td className="px-3 py-2">
                  <Link href={`/admin/menu/${m.id}`} className="font-semibold text-primary-strong">
                    {m.nama}
                  </Link>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{SLOT_LABEL[m.kategori]}</td>
                <td className="px-3 py-2 text-right">{formatAngka(m.kalori)}</td>
                <td className="px-3 py-2">
                  <Badge variant={m.status === "aktif" ? "primary" : "accent"}>{STATUS_MENU_LABEL[m.status]}</Badge>
                </td>
                <td className="px-3 py-2">
                  {m.dicek_ahli_gizi ? (
                    <Check size={18} aria-label="Sudah dicek" className="text-primary-strong" />
                  ) : (
                    <span className="text-text-muted">Belum</span>
                  )}
                </td>
              </tr>
            ))}
            {menus.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-text-muted">
                  Belum ada menu untuk filter ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
