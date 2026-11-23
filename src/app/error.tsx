"use client";

import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PESAN_GALAT } from "@/lib/brand";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex flex-1 flex-col justify-center gap-6 px-6 py-10">
      <EmptyState
        title={PESAN_GALAT}
        text="Periksa koneksi internetmu, lalu coba lagi."
        action={
          <div className="flex flex-col gap-3">
            <Button onClick={() => reset()}>Coba lagi</Button>
            <ButtonLink href="/" variant="ghost">
              Ke halaman utama
            </ButtonLink>
          </div>
        }
      />
    </main>
  );
}
