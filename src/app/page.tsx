import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { PlateIllustration } from "@/components/ui/PlateIllustration";
import { redirectIfLoggedIn } from "@/lib/auth";

export default async function WelcomePage() {
  await redirectIfLoggedIn();
  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-col items-center gap-6 rounded-b-hero bg-primary-soft px-6 pt-10 pb-8">
        <Image src="/brand/logo-horizontal.png" alt="Smart NutriPlan" width={190} height={80} priority />
        <PlateIllustration />
      </section>
      <div className="flex flex-1 flex-col gap-6 px-6 pt-8 pb-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-h1-style text-text">Porsi tepat, hidup sehat</h1>
          <p className="text-body text-text-muted">
            Isi profil sekali, lalu dapatkan meal plan harian dari masakan lokal, lengkap dengan kalori dan takaran
            rumah tangga.
          </p>
        </div>
        <div className="mt-auto flex flex-col gap-3">
          <ButtonLink href="/daftar">Mulai Perjalanan Sehatmu</ButtonLink>
          <ButtonLink href="/masuk" variant="ghost">
            Saya sudah punya akun
          </ButtonLink>
        </div>
        <Disclaimer className="text-center" />
      </div>
    </main>
  );
}
