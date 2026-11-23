import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col justify-center gap-6 px-6 py-10">
      <EmptyState
        title="Halaman tidak ditemukan"
        text="Alamat yang kamu buka tidak ada. Yuk, kembali ke halaman utama."
        action={<ButtonLink href="/">Ke halaman utama</ButtonLink>}
      />
    </main>
  );
}
