import type { ReactNode } from "react";
import { TopBar } from "@/components/ui/TopBar";

export function AuthShell({
  back,
  title,
  subtitle,
  children,
}: {
  back: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col gap-6 px-6 pt-6 pb-10">
      <TopBar href={back} />
      <div className="flex flex-col gap-2">
        <h1 className="text-h1-style text-text">{title}</h1>
        {subtitle && <p className="text-body text-text-muted">{subtitle}</p>}
      </div>
      {children}
    </main>
  );
}
