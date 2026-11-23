import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex h-13 items-center justify-center gap-2 rounded-md px-6 text-body font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary-strong text-on-primary hover:bg-primary-strong/90",
  secondary: "border-[1.5px] border-border bg-surface text-primary-strong hover:bg-primary-soft",
  ghost: "bg-transparent text-primary-strong hover:bg-primary-soft",
};

export function buttonClass(variant: ButtonVariant = "primary", fullWidth = true, className?: string) {
  return cn(base, variants[variant], fullWidth && "w-full", className);
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  loading = false,
  fullWidth = true,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass(variant, fullWidth, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  children: ReactNode;
}

export function ButtonLink({ variant = "primary", fullWidth = true, className, ...rest }: ButtonLinkProps) {
  return <Link className={buttonClass(variant, fullWidth, className)} {...rest} />;
}
