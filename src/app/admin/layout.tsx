import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-border bg-surface px-6 py-3">
        <Image src="/brand/logo-icon.png" alt="" width={32} height={32} />
        <span className="text-h3-style text-text">Admin</span>
        <nav className="ml-auto flex flex-wrap justify-end gap-1 text-small font-semibold">
          <Link href="/admin" className="rounded-sm px-3 py-2 text-primary-strong hover:bg-primary-soft">
            Metrik
          </Link>
          <Link href="/admin/menu" className="rounded-sm px-3 py-2 text-primary-strong hover:bg-primary-soft">
            Menu
          </Link>
          <Link href="/admin/masukan" className="rounded-sm px-3 py-2 text-primary-strong hover:bg-primary-soft">
            Masukan
          </Link>
          <Link href="/beranda" className="rounded-sm px-3 py-2 text-text-muted hover:bg-primary-soft">
            Aplikasi
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
