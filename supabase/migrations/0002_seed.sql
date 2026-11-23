-- Smart NutriPlan — data awal (dibuat otomatis dari data/seed/menus.json)
-- Nilai gizi = ESTIMASI tim, belum dicek ahli gizi.

insert into public.allergens (kode, nama, jenis, urutan) values
  ('udang', 'Udang', 'alergi', 1),
  ('seafood', 'Seafood', 'alergi', 2),
  ('kacang', 'Kacang', 'alergi', 3),
  ('susu', 'Susu', 'alergi', 4),
  ('telur', 'Telur', 'alergi', 5),
  ('gluten', 'Gluten', 'alergi', 6),
  ('daging_sapi', 'Daging sapi', 'pantangan', 7),
  ('jeroan', 'Jeroan', 'pantangan', 8),
  ('santan', 'Santan', 'pantangan', 9),
  ('pedas', 'Pedas', 'pantangan', 10)
on conflict (kode) do nothing;

insert into public.menus (slug, nama, kategori, kalori, protein, karbohidrat, lemak, porsi, bahan, langkah, cocok_untuk, estimasi_harga, waktu_masak_menit, sumber_gizi, dicek_ahli_gizi, status)
values ('nasi-merah-telur-dadar-sayur', 'Nasi merah + telur dadar sayur', 'sarapan', 375, 15, 45, 14, '[{"nama": "Nasi merah", "qty": 1, "satuan": "centong"}, {"nama": "Telur dadar sayur", "qty": 1, "satuan": "butir telur"}]'::jsonb, array['1 centong nasi merah','1 butir telur','1/2 buah wortel, parut','1 batang daun bawang, iris','1 sdt minyak','garam secukupnya']::text[], array['Kocok telur dengan wortel, daun bawang, dan sedikit garam.','Panaskan minyak di teflon, tuang telur, masak sampai kedua sisi matang.','Sajikan dengan 1 centong nasi merah.']::text[], array['turun','jaga','naik']::public.diet_goal[], 8000, 15, 'Estimasi tim (TKPI)', false, 'aktif')
on conflict (slug) do nothing;
insert into public.menu_allergens (menu_id, allergen_id)
select m.id, a.id from public.menus m join public.allergens a on a.kode in ('telur') where m.slug = 'nasi-merah-telur-dadar-sayur'
on conflict do nothing;

insert into public.menus (slug, nama, kategori, kalori, protein, karbohidrat, lemak, porsi, bahan, langkah, cocok_untuk, estimasi_harga, waktu_masak_menit, sumber_gizi, dicek_ahli_gizi, status)
values ('oatmeal-pisang-susu', 'Oatmeal pisang susu', 'sarapan', 330, 11, 55, 7, '[{"nama": "Oat", "qty": 4, "satuan": "sdm"}, {"nama": "Susu cair", "qty": 1, "satuan": "gelas"}, {"nama": "Pisang", "qty": 1, "satuan": "buah"}]'::jsonb, array['4 sdm oat','1 gelas susu cair rendah lemak','1 buah pisang ambon','sejumput kayu manis bubuk (opsional)']::text[], array['Masak oat dengan susu di api kecil sambil diaduk 3–5 menit.','Tuang ke mangkok, beri irisan pisang dan kayu manis.']::text[], array['turun','jaga','naik']::public.diet_goal[], 9000, 7, 'Estimasi tim (TKPI)', false, 'aktif')
on conflict (slug) do nothing;
insert into public.menu_allergens (menu_id, allergen_id)
select m.id, a.id from public.menus m join public.allergens a on a.kode in ('susu','gluten') where m.slug = 'oatmeal-pisang-susu'
on conflict do nothing;

insert into public.menus (slug, nama, kategori, kalori, protein, karbohidrat, lemak, porsi, bahan, langkah, cocok_untuk, estimasi_harga, waktu_masak_menit, sumber_gizi, dicek_ahli_gizi, status)
values ('bubur-ayam-tanpa-kerupuk', 'Bubur ayam tanpa kerupuk', 'sarapan', 360, 18, 50, 9, '[{"nama": "Bubur nasi", "qty": 1, "satuan": "mangkok"}, {"nama": "Suwiran ayam", "qty": 2, "satuan": "sdm"}]'::jsonb, array['1/2 centong beras','3 gelas air','50 g dada ayam rebus, suwir','1 batang seledri, iris','1 sdt bawang goreng','garam dan merica secukupnya']::text[], array['Masak beras dengan air sambil diaduk sampai menjadi bubur.','Bumbui dengan garam dan merica.','Sajikan dengan suwiran ayam, seledri, dan bawang goreng.']::text[], array['turun','jaga','naik']::public.diet_goal[], 10000, 30, 'Estimasi tim (TKPI)', false, 'aktif')
on conflict (slug) do nothing;

insert into public.menus (slug, nama, kategori, kalori, protein, karbohidrat, lemak, porsi, bahan, langkah, cocok_untuk, estimasi_harga, waktu_masak_menit, sumber_gizi, dicek_ahli_gizi, status)
values ('roti-gandum-selai-kacang-pisang', 'Roti gandum + selai kacang + pisang', 'sarapan', 380, 12, 52, 14, '[{"nama": "Roti gandum", "qty": 2, "satuan": "lembar"}, {"nama": "Selai kacang", "qty": 1, "satuan": "sdm"}, {"nama": "Pisang", "qty": 1, "satuan": "buah"}]'::jsonb, array['2 lembar roti gandum','1 sdm selai kacang','1 buah pisang']::text[], array['Panggang roti sebentar bila suka.','Oles selai kacang, beri irisan pisang di atasnya.']::text[], array['turun','jaga','naik']::public.diet_goal[], 8000, 5, 'Estimasi tim (TKPI)', false, 'aktif')
on conflict (slug) do nothing;
insert into public.menu_allergens (menu_id, allergen_id)
select m.id, a.id from public.menus m join public.allergens a on a.kode in ('gluten','kacang') where m.slug = 'roti-gandum-selai-kacang-pisang'
on conflict do nothing;

insert into public.menus (slug, nama, kategori, kalori, protein, karbohidrat, lemak, porsi, bahan, langkah, cocok_untuk, estimasi_harga, waktu_masak_menit, sumber_gizi, dicek_ahli_gizi, status)
values ('nasi-uduk-tempe-orek-telur', 'Nasi uduk + tempe orek + telur rebus', 'sarapan', 450, 16, 55, 18, '[{"nama": "Nasi uduk", "qty": 1, "satuan": "centong"}, {"nama": "Tempe orek", "qty": 2, "satuan": "sdm"}, {"nama": "Telur rebus", "qty": 1, "satuan": "butir"}]'::jsonb, array['1 centong nasi uduk','1/4 papan tempe, potong dadu','1 sdm kecap manis','1 butir telur','1 siung bawang putih','1 sdt minyak']::text[], array['Rebus telur 10 menit.','Tumis bawang putih, masukkan tempe dan kecap, aduk sampai kering.','Sajikan nasi uduk dengan tempe orek dan telur rebus.']::text[], array['jaga','naik']::public.diet_goal[], 10000, 25, 'Estimasi tim (TKPI)', false, 'aktif')
on conflict (slug) do nothing;
insert into public.menu_allergens (menu_id, allergen_id)
select m.id, a.id from public.menus m join public.allergens a on a.kode in ('santan','telur') where m.slug = 'nasi-uduk-tempe-orek-telur'
on conflict do nothing;

insert into public.menus (slug, nama, kategori, kalori, protein, karbohidrat, lemak, porsi, bahan, langkah, cocok_untuk, estimasi_harga, waktu_masak_menit, sumber_gizi, dicek_ahli_gizi, status)
values ('nasi-ayam-bakar-sayur-bening', 'Nasi + ayam bakar + sayur bening bayam', 'makan_siang', 520, 34, 58, 15, '[{"nama": "Nasi putih", "qty": 1, "satuan": "centong"}, {"nama": "Ayam bakar", "qty": 1, "satuan": "potong paha"}, {"nama": "Sayur bening bayam", "qty": 1, "satuan": "mangkok"}]'::jsonb, array['1 potong paha ayam','2 siung bawang putih','1 sdm kecap manis','1 ikat bayam','1 buah jagung manis','2 siung bawang merah','garam secukupnya']::text[], array['Lumuri ayam dengan bawang putih halus, garam, dan kecap. Diamkan 15 menit.','Bakar ayam di teflon atau arang sampai matang sambil diolesi sisa bumbu.','Didihkan air dengan irisan bawang merah, masukkan jagung lalu bayam, beri garam, masak 2 menit.','Sajikan ayam dan sayur dengan 1 centong nasi.']::text[], array['turun','jaga','naik']::public.diet_goal[], 15000, 25, 'Estimasi tim (TKPI)', false, 'aktif')
on conflict (slug) do nothing;

insert into public.menus (slug, nama, kategori, kalori, protein, karbohidrat, lemak, porsi, bahan, langkah, cocok_untuk, estimasi_harga, waktu_masak_menit, sumber_gizi, dicek_ahli_gizi, status)
values ('nasi-pecel-tempe', 'Nasi pecel sayur + tempe goreng', 'makan_siang', 480, 18, 60, 18, '[{"nama": "Nasi putih", "qty": 1, "satuan": "centong"}, {"nama": "Sayur rebus", "qty": 1, "satuan": "piring kecil"}, {"nama": "Sambal pecel", "qty": 2, "satuan": "sdm"}, {"nama": "Tempe goreng", "qty": 2, "satuan": "potong"}]'::jsonb, array['1 centong nasi','kangkung, kacang panjang, tauge secukupnya','2 sdm sambal pecel siap pakai','2 potong tempe']::text[], array['Rebus sayuran sebentar, tiriskan.','Encerkan sambal pecel dengan sedikit air hangat.','Goreng tempe, sajikan bersama nasi, sayur, dan siraman sambal.']::text[], array['turun','jaga','naik']::public.diet_goal[], 10000, 20, 'Estimasi tim (TKPI)', false, 'aktif')
on conflict (slug) do nothing;
insert into public.menu_allergens (menu_id, allergen_id)
select m.id, a.id from public.menus m join public.allergens a on a.kode in ('kacang','pedas') where m.slug = 'nasi-pecel-tempe'
on conflict do nothing;

insert into public.menus (slug, nama, kategori, kalori, protein, karbohidrat, lemak, porsi, bahan, langkah, cocok_untuk, estimasi_harga, waktu_masak_menit, sumber_gizi, dicek_ahli_gizi, status)
values ('nasi-ikan-kembung-bakar-buncis', 'Nasi + ikan kembung bakar + tumis buncis', 'makan_siang', 500, 30, 55, 16, '[{"nama": "Nasi putih", "qty": 1, "satuan": "centong"}, {"nama": "Ikan kembung bakar", "qty": 1, "satuan": "ekor sedang"}, {"nama": "Tumis buncis", "qty": 1, "satuan": "mangkok"}]'::jsonb, array['1 ekor ikan kembung','1 buah jeruk nipis','1 genggam buncis','2 siung bawang putih','garam secukupnya','1 sdt minyak']::text[], array['Lumuri ikan dengan jeruk nipis dan garam, diamkan 10 menit.','Bakar ikan di teflon sampai matang.','Tumis bawang putih, masukkan buncis, beri garam, masak sampai layu.']::text[], array['turun','jaga','naik']::public.diet_goal[], 14000, 25, 'Estimasi tim (TKPI)', false, 'aktif')
on conflict (slug) do nothing;
insert into public.menu_allergens (menu_id, allergen_id)
select m.id, a.id from public.menus m join public.allergens a on a.kode in ('seafood') where m.slug = 'nasi-ikan-kembung-bakar-buncis'
on conflict do nothing;

insert into public.menus (slug, nama, kategori, kalori, protein, karbohidrat, lemak, porsi, bahan, langkah, cocok_untuk, estimasi_harga, waktu_masak_menit, sumber_gizi, dicek_ahli_gizi, status)
values ('nasi-sayur-asem-tahu-tempe-bacem', 'Nasi + sayur asem + tahu tempe bacem', 'makan_siang', 470, 17, 66, 14, '[{"nama": "Nasi putih", "qty": 1, "satuan": "centong"}, {"nama": "Sayur asem", "qty": 1, "satuan": "mangkok"}, {"nama": "Tahu bacem", "qty": 1, "satuan": "potong"}, {"nama": "Tempe bacem", "qty": 1, "satuan": "potong"}]'::jsonb, array['1 centong nasi','sayur asem (labu siam, kacang panjang, jagung)','1 potong tahu','1 potong tempe','1 sdm gula merah','air asam jawa']::text[], array['Rebus tahu dan tempe dengan bumbu bacem dan gula merah sampai meresap, panggang sebentar.','Masak sayur asem dengan air asam jawa sampai sayur empuk.','Sajikan bersama nasi.']::text[], array['turun','jaga','naik']::public.diet_goal[], 9000, 35, 'Estimasi tim (TKPI)', false, 'aktif')
on conflict (slug) do nothing;

insert into public.menus (slug, nama, kategori, kalori, protein, karbohidrat, lemak, porsi, bahan, langkah, cocok_untuk, estimasi_harga, waktu_masak_menit, sumber_gizi, dicek_ahli_gizi, status)
values ('gado-gado-lontong', 'Gado-gado + lontong', 'makan_siang', 520, 18, 62, 22, '[{"nama": "Lontong", "qty": 1, "satuan": "potong besar"}, {"nama": "Sayur rebus", "qty": 1, "satuan": "piring"}, {"nama": "Bumbu kacang", "qty": 3, "satuan": "sdm"}, {"nama": "Telur rebus", "qty": 1, "satuan": "butir"}]'::jsonb, array['1 potong lontong','kol, tauge, kacang panjang, kentang','1 butir telur','3 sdm bumbu kacang','1 potong tahu']::text[], array['Rebus sayuran dan telur.','Susun lontong, sayur, tahu, dan telur di piring.','Siram dengan bumbu kacang.']::text[], array['jaga','naik']::public.diet_goal[], 12000, 20, 'Estimasi tim (TKPI)', false, 'aktif')
on conflict (slug) do nothing;
insert into public.menu_allergens (menu_id, allergen_id)
select m.id, a.id from public.menus m join public.allergens a on a.kode in ('kacang','telur') where m.slug = 'gado-gado-lontong'
on conflict do nothing;

insert into public.menus (slug, nama, kategori, kalori, protein, karbohidrat, lemak, porsi, bahan, langkah, cocok_untuk, estimasi_harga, waktu_masak_menit, sumber_gizi, dicek_ahli_gizi, status)
values ('pepes-nila-tumis-kangkung', 'Pepes ikan nila + tumis kangkung', 'makan_malam', 440, 30, 45, 14, '[{"nama": "Nasi putih", "qty": 0.5, "satuan": "centong"}, {"nama": "Pepes ikan nila", "qty": 1, "satuan": "ekor kecil"}, {"nama": "Tumis kangkung", "qty": 1, "satuan": "mangkok"}]'::jsonb, array['1 ekor ikan nila kecil','daun pisang','bumbu halus (bawang merah, bawang putih, kunyit, kemiri)','daun kemangi','1 ikat kangkung','1 sdt minyak']::text[], array['Lumuri ikan dengan bumbu halus, bungkus dengan daun pisang bersama kemangi.','Kukus 30 menit lalu panggang sebentar.','Tumis kangkung dengan bawang putih dan garam.','Sajikan dengan ½ centong nasi.']::text[], array['turun','jaga','naik']::public.diet_goal[], 14000, 45, 'Estimasi tim (TKPI)', false, 'aktif')
on conflict (slug) do nothing;

insert into public.menus (slug, nama, kategori, kalori, protein, karbohidrat, lemak, porsi, bahan, langkah, cocok_untuk, estimasi_harga, waktu_masak_menit, sumber_gizi, dicek_ahli_gizi, status)
values ('nasi-sup-ayam-sayur', 'Nasi + sup ayam sayur', 'makan_malam', 430, 26, 50, 12, '[{"nama": "Nasi putih", "qty": 1, "satuan": "centong"}, {"nama": "Sup ayam sayur", "qty": 1, "satuan": "mangkok"}]'::jsonb, array['1 potong dada ayam kecil','wortel, kentang, buncis','1 batang seledri','2 siung bawang putih','garam dan merica secukupnya']::text[], array['Rebus ayam sampai matang, angkat dan potong.','Masukkan wortel dan kentang, masak sampai empuk, lalu buncis.','Bumbui dengan bawang putih, garam, merica; masukkan kembali ayam dan seledri.']::text[], array['turun','jaga','naik']::public.diet_goal[], 12000, 30, 'Estimasi tim (TKPI)', false, 'aktif')
on conflict (slug) do nothing;

insert into public.menus (slug, nama, kategori, kalori, protein, karbohidrat, lemak, porsi, bahan, langkah, cocok_untuk, estimasi_harga, waktu_masak_menit, sumber_gizi, dicek_ahli_gizi, status)
values ('nasi-merah-tumis-udang-brokoli', 'Nasi merah + tumis udang brokoli', 'makan_malam', 420, 27, 48, 12, '[{"nama": "Nasi merah", "qty": 1, "satuan": "centong"}, {"nama": "Tumis udang brokoli", "qty": 1, "satuan": "mangkok"}]'::jsonb, array['1 centong nasi merah','100 g udang kupas','1 kuntum brokoli','2 siung bawang putih','1 sdt saus tiram','1 sdt minyak']::text[], array['Tumis bawang putih sampai harum.','Masukkan udang, masak sampai berubah warna.','Tambahkan brokoli dan saus tiram, masak 3 menit.','Sajikan dengan nasi merah.']::text[], array['turun','jaga','naik']::public.diet_goal[], 16000, 20, 'Estimasi tim (TKPI)', false, 'aktif')
on conflict (slug) do nothing;
insert into public.menu_allergens (menu_id, allergen_id)
select m.id, a.id from public.menus m join public.allergens a on a.kode in ('udang','seafood') where m.slug = 'nasi-merah-tumis-udang-brokoli'
on conflict do nothing;

insert into public.menus (slug, nama, kategori, kalori, protein, karbohidrat, lemak, porsi, bahan, langkah, cocok_untuk, estimasi_harga, waktu_masak_menit, sumber_gizi, dicek_ahli_gizi, status)
values ('nasi-semur-daging-capcay', 'Nasi + semur daging sapi + capcay', 'makan_malam', 520, 30, 52, 20, '[{"nama": "Nasi putih", "qty": 1, "satuan": "centong"}, {"nama": "Semur daging sapi", "qty": 2, "satuan": "potong"}, {"nama": "Capcay", "qty": 1, "satuan": "mangkok"}]'::jsonb, array['75 g daging sapi','2 sdm kecap manis','bawang merah, bawang putih, pala','sawi, wortel, kembang kol','1 sdt minyak']::text[], array['Tumis bumbu, masukkan daging dan kecap, tambah air, masak sampai empuk.','Tumis sayuran capcay sebentar dengan bawang putih.','Sajikan dengan nasi.']::text[], array['jaga','naik']::public.diet_goal[], 18000, 60, 'Estimasi tim (TKPI)', false, 'aktif')
on conflict (slug) do nothing;
insert into public.menu_allergens (menu_id, allergen_id)
select m.id, a.id from public.menus m join public.allergens a on a.kode in ('daging_sapi') where m.slug = 'nasi-semur-daging-capcay'
on conflict do nothing;

insert into public.menus (slug, nama, kategori, kalori, protein, karbohidrat, lemak, porsi, bahan, langkah, cocok_untuk, estimasi_harga, waktu_masak_menit, sumber_gizi, dicek_ahli_gizi, status)
values ('nasi-telur-balado-sayur-sop', 'Nasi + telur balado + sayur sop', 'makan_malam', 450, 16, 55, 18, '[{"nama": "Nasi putih", "qty": 1, "satuan": "centong"}, {"nama": "Telur balado", "qty": 1, "satuan": "butir"}, {"nama": "Sayur sop", "qty": 1, "satuan": "mangkok"}]'::jsonb, array['1 butir telur','cabai merah, bawang merah, tomat','wortel, kol, kentang','1 sdt minyak','garam secukupnya']::text[], array['Rebus telur, kupas.','Tumis bumbu balado, masukkan telur, aduk rata.','Rebus sayuran sop dengan bawang putih dan garam.','Sajikan dengan nasi.']::text[], array['turun','jaga','naik']::public.diet_goal[], 9000, 25, 'Estimasi tim (TKPI)', false, 'aktif')
on conflict (slug) do nothing;
insert into public.menu_allergens (menu_id, allergen_id)
select m.id, a.id from public.menus m join public.allergens a on a.kode in ('telur','pedas') where m.slug = 'nasi-telur-balado-sayur-sop'
on conflict do nothing;

insert into public.menus (slug, nama, kategori, kalori, protein, karbohidrat, lemak, porsi, bahan, langkah, cocok_untuk, estimasi_harga, waktu_masak_menit, sumber_gizi, dicek_ahli_gizi, status)
values ('ubi-rebus', 'Ubi rebus', 'camilan', 140, 2, 33, 0, '[{"nama": "Ubi rebus", "qty": 1, "satuan": "potong sedang"}]'::jsonb, array['1 buah ubi ungu atau kuning ukuran sedang']::text[], array['Cuci ubi, rebus sampai empuk sekitar 20 menit.','Tiriskan dan sajikan hangat.']::text[], array['turun','jaga','naik']::public.diet_goal[], 3000, 20, 'Estimasi tim (TKPI)', false, 'aktif')
on conflict (slug) do nothing;

insert into public.menus (slug, nama, kategori, kalori, protein, karbohidrat, lemak, porsi, bahan, langkah, cocok_untuk, estimasi_harga, waktu_masak_menit, sumber_gizi, dicek_ahli_gizi, status)
values ('pisang-ambon', 'Pisang ambon', 'camilan', 105, 1, 27, 0, '[{"nama": "Pisang ambon", "qty": 1, "satuan": "buah"}]'::jsonb, array['1 buah pisang ambon']::text[], array['Kupas dan nikmati.']::text[], array['turun','jaga','naik']::public.diet_goal[], 2500, 0, 'Estimasi tim (TKPI)', false, 'aktif')
on conflict (slug) do nothing;

insert into public.menus (slug, nama, kategori, kalori, protein, karbohidrat, lemak, porsi, bahan, langkah, cocok_untuk, estimasi_harga, waktu_masak_menit, sumber_gizi, dicek_ahli_gizi, status)
values ('yogurt-buah-potong', 'Yogurt plain + buah potong', 'camilan', 150, 7, 22, 4, '[{"nama": "Yogurt plain", "qty": 1, "satuan": "cup kecil"}, {"nama": "Buah potong", "qty": 0.5, "satuan": "mangkok"}]'::jsonb, array['1 cup kecil yogurt plain','pepaya atau melon potong']::text[], array['Tuang yogurt ke mangkok, beri buah potong di atasnya.']::text[], array['turun','jaga','naik']::public.diet_goal[], 8000, 5, 'Estimasi tim (TKPI)', false, 'aktif')
on conflict (slug) do nothing;
insert into public.menu_allergens (menu_id, allergen_id)
select m.id, a.id from public.menus m join public.allergens a on a.kode in ('susu') where m.slug = 'yogurt-buah-potong'
on conflict do nothing;

insert into public.menus (slug, nama, kategori, kalori, protein, karbohidrat, lemak, porsi, bahan, langkah, cocok_untuk, estimasi_harga, waktu_masak_menit, sumber_gizi, dicek_ahli_gizi, status)
values ('kacang-rebus', 'Kacang tanah rebus', 'camilan', 160, 7, 9, 11, '[{"nama": "Kacang tanah rebus", "qty": 1, "satuan": "genggam"}]'::jsonb, array['1 genggam kacang tanah berkulit','garam secukupnya']::text[], array['Cuci kacang, rebus dengan garam sekitar 30 menit.','Tiriskan dan sajikan.']::text[], array['jaga','naik']::public.diet_goal[], 4000, 30, 'Estimasi tim (TKPI)', false, 'aktif')
on conflict (slug) do nothing;
insert into public.menu_allergens (menu_id, allergen_id)
select m.id, a.id from public.menus m join public.allergens a on a.kode in ('kacang') where m.slug = 'kacang-rebus'
on conflict do nothing;

insert into public.menus (slug, nama, kategori, kalori, protein, karbohidrat, lemak, porsi, bahan, langkah, cocok_untuk, estimasi_harga, waktu_masak_menit, sumber_gizi, dicek_ahli_gizi, status)
values ('jagung-rebus', 'Jagung rebus', 'camilan', 130, 4, 29, 2, '[{"nama": "Jagung rebus", "qty": 1, "satuan": "buah"}]'::jsonb, array['1 buah jagung manis']::text[], array['Rebus jagung sekitar 15–20 menit sampai matang.','Tiriskan dan sajikan.']::text[], array['turun','jaga','naik']::public.diet_goal[], 4000, 20, 'Estimasi tim (TKPI)', false, 'aktif')
on conflict (slug) do nothing;
