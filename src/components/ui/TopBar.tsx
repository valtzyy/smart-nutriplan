import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function TopBar({ href, title }: { href: string; title?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Link
        href={href}
        aria-label="Kembali"
        className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text transition active:scale-95 active:bg-primary-soft"
      >
        <ArrowLeft size={20} aria-hidden />
      </Link>
      {title && <h1 className="text-h3-style text-text">{title}</h1>}
    </div>
  );
}
