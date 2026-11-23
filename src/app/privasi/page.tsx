import Link from "next/link";
import { InfoPage } from "@/components/InfoPage";
import { DISCLAIMER, KETENTUAN_BERLAKU, KONTAK } from "@/lib/brand";

export const metadata = { title: "Ketentuan & Privasi — Smart NutriPlan" };

export default function PrivasiPage() {
  return (
    <InfoPage back="/" title="Ketentuan Penggunaan & Privasi">
      <p className="text-small">Berlaku sejak {KETENTUAN_BERLAKU}.</p>

      <section>
        <h2>1. Tentang layanan</h2>
        <p>
          Smart NutriPlan menyusun meal plan harian dari masakan lokal berdasarkan data yang kamu isi. Layanan ini gratis
          dan masih tahap uji coba (MVP), sehingga fitur dan isi menu dapat berubah.
        </p>
      </section>

      <section>
        <h2>2. Bukan saran medis</h2>
        <p>
          {DISCLAIMER} Nilai gizi menu adalah estimasi tim; menu yang belum diperiksa ahli gizi diberi label khusus.
          Bila kamu hamil, menyusui, berusia di bawah 18 atau di atas 65 tahun, atau punya kondisi medis (mis. GERD,
          diabetes, gangguan ginjal), konsultasikan pola makanmu dengan tenaga kesehatan.
        </p>
      </section>

      <section>
        <h2>3. Data yang kami kumpulkan</h2>
        <ul>
          <li>Akun: nama panggilan, email, dan kata sandi (disimpan terenkripsi oleh penyedia autentikasi).</li>
          <li>Profil kesehatan: usia, jenis kelamin, berat badan, tinggi badan, aktivitas fisik, tujuan, alergi &amp; pantangan, serta anggaran makan (opsional).</li>
          <li>Pemakaian: meal plan yang dibuat dan aktivitas di aplikasi (mis. membuka resep, mengganti menu).</li>
          <li>Masukan yang kamu kirim lewat formulir masukan.</li>
        </ul>
      </section>

      <section>
        <h2>4. Untuk apa data dipakai</h2>
        <ul>
          <li>Menghitung target kalori dan menyusun meal plan yang aman dari alergi &amp; pantanganmu.</li>
          <li>Mengukur dan memperbaiki layanan dalam bentuk statistik gabungan (mis. jumlah pengguna aktif).</li>
        </ul>
        <p>
          Kami <strong>tidak menjual</strong> dan <strong>tidak membagikan</strong> data pribadimu ke pihak lain untuk
          iklan. Data disimpan di layanan basis data (Supabase) dengan akses yang dibatasi per akun; hanya kamu yang bisa
          melihat profil dan meal plan-mu, dan tim admin hanya melihat data untuk keperluan operasional.
        </p>
      </section>

      <section>
        <h2>5. Hak kamu</h2>
        <ul>
          <li>Mengubah profil kapan saja lewat menu Profil → Edit profil.</li>
          <li>Meminta salinan atau penghapusan akun beserta seluruh datanya dengan menghubungi kami.</li>
        </ul>
      </section>

      <section>
        <h2>6. Ketentuan pemakaian</h2>
        <ul>
          <li>Gunakan satu akun untuk dirimu sendiri dan jaga kerahasiaan kata sandimu.</li>
          <li>Jangan menyalahgunakan layanan (mis. mencoba mengakses data pengguna lain).</li>
          <li>Kami dapat memperbarui ketentuan ini; perubahan penting akan diumumkan di aplikasi.</li>
        </ul>
      </section>

      <section>
        <h2>7. Kontak</h2>
        <p>
          Pertanyaan atau permintaan terkait data: {KONTAK.email} · WhatsApp {KONTAK.whatsapp}. Lihat juga{" "}
          <Link href="/tentang" className="font-semibold text-primary-strong active:opacity-60">
            Tentang Kami
          </Link>
          .
        </p>
      </section>
    </InfoPage>
  );
}
