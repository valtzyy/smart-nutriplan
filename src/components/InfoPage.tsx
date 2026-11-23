import type { ReactNode } from "react";
import { TopBar } from "@/components/ui/TopBar";

/** Kerangka halaman informasi statis (Tentang Kami, Ketentuan & Privasi). */
export function InfoPage({ back, title, children }: { back: string; title: string; children: ReactNode }) {
  return (
    <main className="flex flex-1 flex-col gap-6 px-6 pt-6 pb-12">
      <TopBar href={back} />
      <h1 className="text-h1-style text-text">{title}</h1>
      <div className="flex flex-col gap-6 text-body text-text [&_h2]:text-h3-style [&_h2]:text-text [&_li]:ml-5 [&_li]:list-disc [&_p]:text-text-muted [&_section]:flex [&_section]:flex-col [&_section]:gap-2 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1 [&_ul]:text-text-muted">
        {children}
      </div>
    </main>
  );
}
