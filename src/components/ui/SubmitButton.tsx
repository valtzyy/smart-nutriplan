"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "./Button";

/** Tombol submit yang otomatis menampilkan spinner selama form (server action) diproses. */
export function SubmitButton(props: Omit<ComponentProps<typeof Button>, "type" | "loading">) {
  const { pending } = useFormStatus();
  return <Button type="submit" loading={pending} {...props} />;
}
