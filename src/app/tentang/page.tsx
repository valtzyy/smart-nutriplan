import { AtSign, Clock, Mail, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { InfoPage } from "@/components/InfoPage";
import { Avatar } from "@/components/ui/Avatar";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { KONTAK, TIM } from "@/lib/brand";

export const metadata = { title: "Tentang Kami — Smart NutriPlan" };

export default function TentangPage() {
  const kontak = [
    { Icon: Mail, label: "Email", value: KONTAK.email, href: `mailto:${KONTAK.email}` },
    {
      Icon: MessageCircle,
      label: "WhatsApp",
      value: KONTAK.whatsapp,
      href: KONTAK.whatsappLink ? `https://wa.me/${KONTAK.whatsappLink}` : undefined,
    },
    { Icon: AtSign, label: "Instagram", value: KONTAK.instagram, href: undefined },
    { Icon: Clock, label: "Jam layanan", value: KONTAK.jamOperasional, href: undefined },
  ];

  return (
    <InfoPage back="/" title="Tentang Kami">
      <Image src="/brand/logo-horizontal.png" alt="Smart NutriPlan" width={190} height={80} />
      <section>
        <h2>Porsi tepat, hidup sehat</h2>
        <p>
          Smart NutriPlan membantu kamu menyusun meal plan harian dari masakan lokal Indonesia — lengkap dengan kalori,
          makro, dan takaran rumah tangga (centong, potong, mangkok) — sesuai profil tubuh, tujuan, alergi, dan
          pantanganmu. Isi profil sekali, menu harianmu tersusun otomatis.
        </p>
      </section>

      <section>
        <h2>Kenapa kami membuatnya</h2>
        <p>
          Dari obrolan dengan teman-teman mahasiswa dan pekerja muda, kami menemukan hal yang sama: bingung menentukan
          menu yang sesuai tujuan, sulit menghitung kalori masakan lokal, dan malas mencatat setiap habis makan. Smart
          NutriPlan dibuat supaya kamu cukup tahu <em>apa</em> yang dimakan dan <em>seberapa banyak</em>.
        </p>
      </section>

      <section>
        <h2>Tim kami</h2>
        <p>Smart NutriPlan dikembangkan oleh tim mahasiswa — Kelompok 7 mata kuliah Bisnis Digital.</p>
        <div role="list" className="grid grid-cols-2 gap-3">
          {TIM.map((t) => (
            <div
              role="listitem"
              key={t.nama}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3"
            >
              <Avatar nama={t.nama} />
              <span className="flex flex-col">
                <span className="text-body font-semibold text-text">{t.nama}</span>
                <span className="text-caption text-text-muted">{t.peran}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Hubungi kami</h2>
        <ul className="!ml-0 flex flex-col divide-y divide-border rounded-lg border border-border bg-surface">
          {kontak.map(({ Icon, label, value, href }) => (
            <li key={label} className="!ml-0 flex list-none items-center gap-3 px-4 py-3">
              <Icon size={20} aria-hidden className="shrink-0 text-primary-strong" />
              <span className="flex flex-col">
                <span className="text-caption text-text-muted">{label}</span>
                {href ? (
                  <a href={href} className="text-body font-semibold text-primary-strong active:opacity-60">
                    {value}
                  </a>
                ) : (
                  <span className="text-body font-semibold text-text">{value}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
        <p>
          Punya saran? Setelah masuk, kamu juga bisa mengisi{" "}
          <Link href="/masukan" className="font-semibold text-primary-strong active:opacity-60">
            formulir masukan
          </Link>
          .
        </p>
      </section>

      <p>
        Baca juga{" "}
        <Link href="/privasi" className="font-semibold text-primary-strong active:opacity-60">
          Ketentuan Penggunaan &amp; Privasi
        </Link>
        .
      </p>
      <Disclaimer />
    </InfoPage>
  );
}
