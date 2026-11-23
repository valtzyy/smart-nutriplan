import "server-only";
import { headers } from "next/headers";

/** URL situs untuk tautan email: NEXT_PUBLIC_SITE_URL → origin request → VERCEL_URL. */
export async function getSiteUrl(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  // Abaikan nilai localhost yang terbawa ke server Vercel (mis. disalin dari .env lokal).
  const envValid = fromEnv && !(process.env.VERCEL && fromEnv.includes("localhost"));
  if (envValid) return fromEnv.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) {
    const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }
  // Domain produksi publik (bukan URL deployment yang dilindungi login Vercel).
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
