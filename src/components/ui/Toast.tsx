"use client";

import { useEffect, useState } from "react";

/**
 * Toast sederhana. Tampil setiap kali `trigger` berubah dan `message` terisi
 * (mis. `trigger` = objek state dari useActionState).
 */
export function Toast({ message, trigger }: { message: string | null | undefined; trigger?: unknown }) {
  const [hiddenFor, setHiddenFor] = useState<unknown>(null);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setHiddenFor(trigger), 4000);
    return () => clearTimeout(t);
  }, [message, trigger]);

  if (!message || hiddenFor === trigger) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-app justify-center px-6">
      <div role="status" aria-live="polite" className="animate-toast-in rounded-md bg-text px-4 py-3 text-small text-on-primary">
        {message}
      </div>
    </div>
  );
}
