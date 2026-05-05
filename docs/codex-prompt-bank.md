# Codex Prompt Bank Untuk Tim Underwriting

Gunakan prompt ini dengan mengganti bagian dalam tanda `<...>`.

## 1. Mulai Pekerjaan Baru

```text
Saya akan mengerjakan <nama pekerjaan> di area <Properti / KBM / Routing / Review Admin / Dokumen>.

Tolong:
1. pastikan repo bersih,
2. pindah ke main,
3. ambil update terbaru dari origin/main,
4. buat branch baru bernama feature/<area>-<ringkasan>,
5. setelah branch dibuat, berhenti dan tunggu instruksi perubahan dari saya.
```

## 2. Kerjakan Perubahan

```text
Tolong kerjakan perubahan berikut.

Area: <area>
Tujuan bisnis: <tujuan underwriting>
Perilaku saat ini: <yang sekarang terjadi>
Perilaku yang diinginkan: <yang harus terjadi>
Halaman untuk dicek: <contoh /internal/motor>
Batasan: jangan ubah <area yang tidak boleh berubah>

Setelah implementasi:
- jalankan npm run verify
- jika UI berubah, cek browser lokal bila memungkinkan
- jelaskan ringkas file yang berubah
- jangan commit sebelum saya minta
```

## 3. Cek Sebelum Pull Request

```text
Tolong cek kesiapan branch ini untuk Pull Request.

Yang perlu dilakukan:
1. git status,
2. review diff penting,
3. npm run verify,
4. jelaskan risiko production,
5. buat ringkasan PR yang bisa saya tempel ke GitHub.

Jangan merge ke main.
```

## 4. Commit Dan Push

```text
Tolong commit dan push branch ini.

Pesan commit:
<pesan commit singkat>

Sebelum commit, pastikan npm run verify sudah berhasil.
Setelah push, berikan link untuk membuat Pull Request.
Jangan merge ke main.
```

## 5. Review Pull Request

```text
Tolong review branch ini sebagai reviewer underwriting.

Fokus:
- apakah alur user masuk akal,
- apakah wording produk tepat,
- apakah perhitungan premi berubah,
- apakah risiko production jelas,
- apakah test cukup.

Jangan edit file dulu. Berikan temuan dengan prioritas tinggi ke rendah.
```

## 6. Ambil Update Setelah PR Orang Lain Merge

```text
Tolong update branch kerja saya dengan main terbaru.

Lakukan dengan aman:
1. cek apakah ada perubahan lokal yang belum commit,
2. ambil update origin/main,
3. gabungkan ke branch saya,
4. kalau ada konflik, berhenti dan jelaskan dengan bahasa sederhana.
```

## 7. Minta Penjelasan Non-Teknis

```text
Jelaskan status pekerjaan ini untuk underwriter, bukan developer.

Tolong jawab:
1. apa yang sudah berubah,
2. apa yang perlu saya test,
3. apa risiko yang masih ada,
4. apakah sudah aman masuk PR.
```

## 8. Buat Catatan Serah Terima

```text
Tolong buat catatan serah terima untuk pekerjaan ini.

Format:
- Branch:
- Area:
- Tujuan:
- File utama yang berubah:
- Cara test:
- Risiko:
- Hal yang belum dikerjakan:
```

