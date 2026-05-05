# Panduan Kolaborasi

Dokumen ini menjaga kerja tim tetap rapi: production stabil, preview bisa dites, dan setiap orang tahu area tanggung jawabnya.

## Prinsip Utama

- `main` adalah baseline production.
- Jangan push langsung ke `main`.
- Semua pekerjaan masuk lewat branch dan Pull Request.
- Satu branch sebaiknya hanya membawa satu fitur, satu perbaikan, atau satu area kerja.
- Jalankan `npm run verify` sebelum meminta review.

## Alur Kerja Harian

1. Ambil update terbaru:

   ```bash
   git checkout main
   git pull origin main
   ```

2. Buat branch kerja:

   ```bash
   git checkout -b feature/nama-area-nama-fitur
   ```

3. Kerjakan area yang sudah disepakati.

4. Verifikasi lokal:

   ```bash
   npm run verify
   ```

5. Push branch dan buka Pull Request.

6. Lampirkan link Vercel Preview di Pull Request.

7. Merge ke `main` hanya setelah review dan verifikasi selesai.

## Format Nama Branch

- `feature/property-all-risk-multi`
- `feature/kbm-multi-vehicle`
- `fix/property-routing`
- `chore/team-workflow`
- `release/2026-05-05`

## Pembagian Area Kerja

Lihat [docs/team-collaboration.md](docs/team-collaboration.md) untuk peta ownership, area file, dan checklist release.

## Standar Verifikasi

Minimal sebelum review:

```bash
npm run verify
```

Untuk perubahan UI penting, tambahkan juga catatan hasil cek browser atau screenshot preview.

## Aturan Konflik

- Jangan revert perubahan orang lain tanpa koordinasi.
- Kalau menyentuh file lintas area, tulis alasannya di Pull Request.
- Kalau ada konflik, selesaikan dari branch sendiri setelah menarik `main` terbaru.

