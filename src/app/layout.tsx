import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { APP_NAME, APP_TITLE, THEME_COLOR } from "@/lib/brand";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  ),
  title: APP_TITLE,
  description:
    "Meal plan harian dari masakan lokal Indonesia, lengkap dengan kalori dan takaran rumah tangga, sesuai profil dan pantanganmu.",
  applicationName: APP_NAME,
  openGraph: {
    title: APP_TITLE,
    description: "Porsi tepat, hidup sehat. Meal plan harian dari masakan lokal.",
    images: [{ url: "/brand/logo-horizontal.png", width: 997, height: 420, alt: APP_NAME }],
    locale: "id_ID",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id">
      <body className="min-h-dvh bg-bg">
        <div className="mx-auto flex min-h-dvh w-full max-w-app flex-col bg-bg">{children}</div>
      </body>
    </html>
  );
}
