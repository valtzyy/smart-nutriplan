import { Clock, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { InfoBox } from "@/components/ui/InfoBox";
import { TopBar } from "@/components/ui/TopBar";
import { loadAllergens, pilihAlergen } from "@/lib/allergens";
import { requireOnboarded } from "@/lib/auth";
import { logEvent } from "@/lib/events";
import { formatAngka, SLOT_LABEL } from "@/lib/labels";
import { loadAvoidAllergenIds } from "@/lib/mealplan";
import { AMBANG_TINGGI_PROTEIN } from "@/lib/nutrition/constants";
import { formatKomponen } from "@/lib/nutrition/trt";
import type { MealPlanItemRow, MenuRow } from "@/lib/types";

export const metadata = { title: "Detail menu — Smart NutriPlan" };

export default async function MenuDetailPage({ params, searchParams }: PageProps<"/menu/[slug]">) {
  const { supabase, user } = await requireOnboarded();
  const { slug } = await params;
  const { item: itemParam } = await searchParams;

  const { data: menuData } = await supabase
    .from("menus")
    .select("*, menu_allergens(allergen_id)")
    .eq("slug", slug)
    .maybeSingle();
  if (!menuData) notFound();
  const { menu_allergens, ...menu } = menuData as MenuRow & { menu_allergens: { allergen_id: number }[] };
  const menuAllergenIds = new Set(menu_allergens.map((a) => a.allergen_id));

  // Porsi yang sudah diskalakan bila dibuka dari meal plan (RLS: hanya item milik sendiri).
  let item: MealPlanItemRow | null = null;
  if (typeof itemParam === "string" && /^[0-9a-f-]{36}$/i.test(itemParam)) {
    const { data } = await supabase.from("meal_plan_items").select("*").eq("id", itemParam).maybeSingle();
    if (data && (data as MealPlanItemRow).menu_id === menu.id) item = data as MealPlanItemRow;
  }
  const multiplier = item ? Number(item.multiplier) : 1;
  const gizi = item
    ? { kalori: item.kalori, protein: item.protein, karbohidrat: item.karbohidrat, lemak: item.lemak }
    : {
        kalori: Math.round(menu.kalori),
        protein: Math.round(Number(menu.protein)),
        karbohidrat: Math.round(Number(menu.karbohidrat)),
        lemak: Math.round(Number(menu.lemak)),
      };

  const [allergens, avoid] = await Promise.all([loadAllergens(supabase), loadAvoidAllergenIds(supabase, user.id)]);
  const bebas = pilihAlergen(allergens, avoid)
    .filter((a) => !menuAllergenIds.has(a.id))
    .slice(0, 3);

  await logEvent(supabase, user.id, "recipe_viewed", { slug: menu.slug });

  const harga = menu.estimasi_harga != null ? Math.round((menu.estimasi_harga * multiplier) / 100) * 100 : null;

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 pt-6 pb-10">
      <TopBar href="/meal-plan" />
      <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-lg bg-accent-soft text-text">
        {menu.foto_url ? (
          <Image src={menu.foto_url} alt={menu.nama} fill sizes="(max-width: 480px) 100vw, 432px" className="object-cover" unoptimized />
        ) : (
          <UtensilsCrossed size={48} aria-label={`Foto ${menu.nama} belum tersedia`} />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-h2-style text-text">{menu.nama}</h1>
        <p className="flex flex-wrap items-center gap-1 text-small text-text-muted">
          {SLOT_LABEL[menu.kategori]} · {formatAngka(gizi.kalori)} kkal
          {menu.waktu_masak_menit != null && (
            <>
              {" "}
              · <Clock size={14} aria-hidden /> ±{menu.waktu_masak_menit} menit
            </>
          )}
        </p>
        {(bebas.length > 0 || gizi.protein >= AMBANG_TINGGI_PROTEIN) && (
          <div className="flex flex-wrap gap-2 pt-1">
            {bebas.map((a) => (
              <Badge key={a.id}>Bebas {a.nama.toLowerCase()}</Badge>
            ))}
            {gizi.protein >= AMBANG_TINGGI_PROTEIN && <Badge variant="accent">Tinggi protein</Badge>}
          </div>
        )}
      </div>

      <section aria-label="Kandungan gizi" className="grid grid-cols-4 gap-2">
        {[
          { label: "Kalori (kkal)", value: formatAngka(gizi.kalori) },
          { label: "Protein", value: `${gizi.protein} g` },
          { label: "Karbo", value: `${gizi.karbohidrat} g` },
          { label: "Lemak", value: `${gizi.lemak} g` },
        ].map((g) => (
          <div key={g.label} className="flex flex-col items-center rounded-md border border-border bg-surface px-1 py-3">
            <span className="text-h3-style text-text">{g.value}</span>
            <span className="text-center text-caption text-text-muted">{g.label}</span>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-h3-style text-text">Porsi (takaran rumah tangga)</h2>
        <ul className="flex flex-col gap-2">
          {menu.porsi.map((p, i) => (
            <li key={i} className="flex items-center gap-3 rounded-md bg-primary-soft px-4 py-3 text-body text-text">
              <span aria-hidden className="size-2 shrink-0 rounded-full bg-primary-strong" />
              {formatKomponen(p, multiplier)}
            </li>
          ))}
        </ul>
        {multiplier !== 1 && (
          <p className="text-caption text-text-muted">Porsi sudah disesuaikan dengan target kalorimu.</p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-h3-style text-text">Bahan</h2>
        {multiplier !== 1 && <p className="text-caption text-text-muted">Daftar bahan untuk 1 porsi standar.</p>}
        <ul className="flex list-disc flex-col gap-1 pl-5 text-body text-text">
          {menu.bahan.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-h3-style text-text">Cara memasak</h2>
        <ol className="flex flex-col gap-3">
          {menu.langkah.map((l, i) => (
            <li key={i} className="flex gap-3 text-body text-text">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-strong text-small font-semibold text-on-primary">
                {i + 1}
              </span>
              <span className="pt-0.5">{l}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex flex-col gap-3">
        {!menu.dicek_ahli_gizi && <Badge variant="accent">Estimasi gizi — belum dicek ahli gizi</Badge>}
        <InfoBox variant="tips">
          Estimasi gizi berdasarkan {menu.sumber_gizi}.
          {harga != null && <> Perkiraan biaya bahan ±Rp{formatAngka(harga)} untuk 1 porsi.</>}
        </InfoBox>
      </div>
    </main>
  );
}
