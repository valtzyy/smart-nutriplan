import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { KONTAK } from "@/lib/brand";
import { logEvent } from "@/lib/events";
import { pesanChatPremium } from "@/lib/premium";

/** Catat klik "Chat ahli gizi", lalu arahkan ke WhatsApp tim (layanan manual). */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const session = await getSession();
  if (!session) return NextResponse.redirect(`${origin}/masuk?next=/premium`);

  await logEvent(session.supabase, session.user.id, "premium_chat_clicked", {
    tersedia: Boolean(KONTAK.whatsappLink),
  });

  if (!KONTAK.whatsappLink) {
    // Nomor WhatsApp belum diatur (kontak masih dummy) → tampilkan halaman kontak.
    return NextResponse.redirect(`${origin}/tentang`);
  }
  const text = encodeURIComponent(pesanChatPremium(session.profile.nama));
  return NextResponse.redirect(`https://wa.me/${KONTAK.whatsappLink}?text=${text}`);
}
