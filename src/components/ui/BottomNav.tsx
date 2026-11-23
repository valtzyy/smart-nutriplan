"use client";

import { CalendarDays, Home, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "./cn";

const TABS = [
  { href: "/beranda", label: "Beranda", Icon: Home },
  { href: "/meal-plan", label: "Meal Plan", Icon: CalendarDays },
  { href: "/profil", label: "Profil", Icon: User },
];

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
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1",
                  active ? "text-label-style text-primary-strong" : "text-caption text-text-muted",
                )}
              >
                <Icon size={24} aria-hidden />
                {label}
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
