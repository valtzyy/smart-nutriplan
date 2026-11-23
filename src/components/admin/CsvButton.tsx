"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CsvButton({ csv, filename }: { csv: string; filename: string }) {
  return (
    <Button
      variant="secondary"
      fullWidth={false}
      className="h-11"
      onClick={() => {
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }}
    >
      <Download size={18} aria-hidden />
      Unduh CSV
    </Button>
  );
}
