import type { ReactNode } from "react";
import { Stepper } from "@/components/ui/Stepper";
import { TopBar } from "@/components/ui/TopBar";

export function OnboardingShell({
  step,
  back,
  title,
  subtitle,
  children,
}: {
  step: 1 | 2 | 3;
  back: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col gap-6 px-6 pt-6 pb-8">
      <TopBar href={back} />
      <Stepper step={step} />
      <div className="flex flex-col gap-2">
        <h1 className="text-h2-style text-text">{title}</h1>
        <p className="text-body text-text-muted">{subtitle}</p>
      </div>
      {children}
    </main>
  );
}
