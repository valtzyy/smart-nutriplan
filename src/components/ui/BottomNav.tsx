"use client";

import { CalendarDays, Home, User, type LucideIcon } from "lucide-react";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "./cn";

const TABS = [
  { href: "/beranda", label: "Beranda", Icon: Home },
  { href: "/meal-plan", label: "Meal Plan", Icon: CalendarDays },
  { href: "/profil", label: "Profil", Icon: User },
];

/** Isi tab; langsung tampil aktif begitu ditekan (sebelum halaman selesai dimuat). */
function TabContent({ label, Icon, active }: { label: string; Icon: LucideIcon; active: boolean }) {
  const { pending } = useLinkStatus();
  const on = active || pending;
  return (
    <span
      className={cn(
        "flex h-full flex-col items-center justify-center gap-1 transition-colors",
        on ? "text-label-style text-primary-strong" : "text-caption text-text-muted",
      )}
    >
      <span
        className={cn(
          "flex h-8 w-14 items-center justify-center rounded-full transition-colors",
          on && "bg-primary-soft",
        )}
      >
        <Icon size={22} aria-hidden className={cn(pending && "animate-pulse")} />
      </span>
      {label}
    </span>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-app border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex h-18">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className="block h-full active:bg-primary-soft/60"
              >
                <TabContent label={label} Icon={Icon} active={active} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Spacer supaya konten tidak tertutup BottomNav. */
export function BottomNavSpacer() {
  return <div aria-hidden className="h-[calc(5rem+env(safe-area-inset-bottom))]" />;
}
