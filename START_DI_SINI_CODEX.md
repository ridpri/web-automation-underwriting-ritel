# Mulai Di Sini Untuk Tim Pengguna Codex

Panduan ini dibuat untuk tim underwriter yang ingin bekerja bersama di web production tanpa perlu menghafal Git, Node, atau command teknis. Prinsipnya sederhana: setiap orang memberi instruksi yang jelas ke Codex, lalu Codex yang menjalankan langkah teknisnya.

## Aturan Aman

- Jangan kerja langsung di `main`.
- Jangan minta Codex deploy production kecuali sudah disetujui bersama.
- Satu orang mengerjakan satu area dalam satu branch.
- Setiap perubahan harus punya Pull Request dan Vercel Preview.
- Sebelum PR, minta Codex menjalankan `npm run verify`.

## Sebelum Mulai Kerja

Pastikan baseline baru sudah masuk ke `main`. Kalau belum, selesaikan Pull Request baseline lebih dulu.

Setelah itu, setiap anggota tim membuka folder repo ini di Codex di laptop masing-masing.

## Prompt Pertama Di Laptop Masing-Masing

Salin prompt ini ke Codex:

```text
Saya akan mulai kerja di repo ini sebagai underwriter, bukan developer.

Tolong:
1. cek branch saya sekarang,
2. pindah ke main,
3. ambil update terbaru dari origin/main,
4. buat branch baru untuk pekerjaan saya,
5. jangan ubah file dulu sebelum saya jelaskan tugasnya.

Nama branch: feature/<area>-<ringkasan-pekerjaan>
Area saya: <Properti / KBM / Routing / Review Admin / Dokumen>
```

Contoh:

```text
Nama branch: feature/kbm-perbaikan-ringkasan-premi
Area saya: KBM
```

## Cara Memberi Tugas Ke Codex

Gunakan format ini agar Codex tidak melebar:

```text
Tolong kerjakan perubahan ini di area <area>.

Tujuan bisnis:
<jelaskan dengan bahasa underwriting>

Yang boleh disentuh:
<sebutkan area/file jika tahu>

Yang tidak boleh berubah:
<misalnya tarif, wording polis, flow lain>

Cara saya akan mengecek:
<contoh halaman, skenario, atau hasil yang diharapkan>

Sebelum selesai:
- jalankan npm run verify
- jelaskan file yang berubah
- jangan merge ke main
```

## Pembagian Area

| Area | Contoh tugas | Bilang ke Codex |
| --- | --- | --- |
| Properti | Kebakaran, PAR, multi properti, perluasan jaminan | `Area saya Properti` |
| KBM | Motor, mobil TLO, comprehensive, multi kendaraan | `Area saya KBM` |
| Routing | URL internal/external, katalog produk, offer link | `Area saya Routing` |
| Review Admin | Workbench, approval, konfigurasi partner | `Area saya Review Admin` |
| Dokumen | Panduan, prosedur, lampiran, release notes | `Area saya Dokumen` |

## Setelah Codex Selesai

Minta Codex:

```text
Tolong commit dan push branch ini. Jangan merge ke main.
Berikan link Pull Request kalau tersedia.
```

Lalu buka PR di GitHub, tunggu Vercel Preview, dan tes halaman yang berubah.

## Kalau Bingung Atau Ada Konflik

Jangan coba-coba menyelesaikan manual. Kirim prompt ini:

```text
Saya bukan developer. Tolong jelaskan masalah ini dengan bahasa sederhana:
1. apa yang terjadi,
2. apakah aman dilanjutkan,
3. pilihan yang saya punya,
4. rekomendasi kamu.

Jangan revert perubahan siapa pun sebelum saya setujui.
```

## Review PR Dengan Codex

Reviewer bisa membuka branch PR lalu memberi prompt:

```text
Tolong review perubahan di branch ini sebagai reviewer underwriting.
Fokus pada risiko production, alur user, perhitungan premi, wording, dan tes yang kurang.
Jangan edit file dulu. Berikan daftar temuan prioritas.
```

## Kebiasaan Harian

- Awal hari: minta Codex sync dari `main`.
- Sebelum kerja: pastikan branch sesuai tugas.
- Sebelum PR: minta Codex menjalankan `npm run verify`.
- Setelah PR dibuat: test Vercel Preview.
- Setelah merge: anggota lain sync lagi dari `main`.

