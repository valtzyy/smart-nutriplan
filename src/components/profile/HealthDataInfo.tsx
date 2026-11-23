"use client";

import { ShieldCheck } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/Button";

export function HealthDataInfo() {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="mx-auto min-h-11 text-small text-primary-strong underline underline-offset-4"
      >
        Tentang data kesehatanmu
      </button>
      <dialog
        ref={ref}
        aria-labelledby="data-kesehatan-judul"
        className="m-auto w-[calc(100%-3rem)] max-w-96 rounded-lg border border-border bg-surface p-6 text-text backdrop:bg-text/40"
      >
        <div className="flex flex-col gap-4">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary-strong">
            <ShieldCheck size={24} aria-hidden />
          </span>
          <h2 id="data-kesehatan-judul" className="text-h3-style">
            Tentang data kesehatanmu
          </h2>
          <p className="text-body text-text-muted">
            Usia, berat badan, tinggi badan, aktivitas, tujuan, dan alergimu hanya dipakai untuk menghitung meal plan.
            Data ini tersimpan aman di akunmu dan tidak dibagikan ke siapa pun.
          </p>
          <Button onClick={() => ref.current?.close()}>Mengerti</Button>
        </div>
      </dialog>
    </>
  );
}
