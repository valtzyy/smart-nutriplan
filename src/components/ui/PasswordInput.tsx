"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { Input } from "./Input";

type Props = Omit<ComponentProps<typeof Input>, "type" | "trailing">;

export function PasswordInput(props: Props) {
  const [show, setShow] = useState(false);
  return (
    <Input
      {...props}
      type={show ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="-mr-2 flex size-11 items-center justify-center text-text-muted"
          aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      }
    />
  );
}
