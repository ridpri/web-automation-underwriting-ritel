# Team Collaboration Workflow

Panduan ini menjelaskan cara beberapa orang bekerja di web yang sama tanpa mengganggu production.

## Environment

| Environment | Sumber | Fungsi |
| --- | --- | --- |
| Production | `main` | Versi yang dipakai user |
| Preview | Branch / Pull Request | Tempat test fitur sebelum merge |
| Local | Laptop masing-masing | Tempat development |

## Ownership Area

| Area | File utama | Tanggung jawab |
| --- | --- | --- |
| Properti | `src/PropertyPrototype.jsx`, `src/property/*`, `src/propertyProductConfig.js` | Kebakaran, Property All Risk, multi properti, perhitungan properti |
| KBM | `src/MotorLatestExact.tsx`, `src/vehicle/*`, `src/motorDomain.js`, `src/carDomain.js`, `src/vehicleCatalog.js` | Motor, mobil TLO, mobil comprehensive, multi kendaraan |
| Routing dan shell | `src/App.jsx`, `src/app/*` | URL internal/external/guest/offer, katalog, landing workspace |
| Review dan admin | `src/ReviewWorkbench.jsx`, `src/PartnerConfigStudio.jsx`, `src/platform/*` | Workbench, konfigurasi partner, kontrol review |
| Dokumen dan prosedur | `docs/*` | Panduan internal, prosedur, lampiran, checklist |

## Workflow Pull Request

1. Branch dibuat dari `main`.
2. Anggota tim mengerjakan satu area yang jelas, biasanya dibantu Codex.
3. Jalankan `npm run verify`, atau minta Codex menjalankannya.
4. Push branch.
5. Buka Pull Request.
6. Isi template Pull Request lengkap.
7. Test Vercel Preview.
8. Reviewer area memberi persetujuan.
9. Merge ke `main`.
10. Production deploy dari `main`.

Jika seluruh tim memakai Codex, gunakan [../START_DI_SINI_CODEX.md](../START_DI_SINI_CODEX.md) sebagai panduan utama dan [codex-prompt-bank.md](codex-prompt-bank.md) sebagai daftar prompt siap pakai.

## Checklist Sebelum Merge

- Scope perubahan jelas dan tidak melebar.
- `npm run verify` berhasil.
- Link Vercel Preview dicantumkan.
- Alur internal dan external yang terdampak sudah dicek.
- Perubahan teks, premi, dokumen, atau routing sudah dijelaskan.
- Tidak ada artifact lokal yang ikut masuk commit.

## Feature Flag

Gunakan feature flag ketika fitur besar perlu di-merge bertahap.

Contoh nama flag:

- `ENABLE_MULTI_PROPERTY`
- `ENABLE_MULTI_VEHICLE`
- `ENABLE_NEW_REVIEW_WORKBENCH`
- `ENABLE_PARTNER_CONFIG`

Aturan:

- Default flag untuk production harus aman.
- PR yang menambah fitur besar sebaiknya bisa dimatikan tanpa revert kode.
- Dokumentasikan flag baru di Pull Request.

## Cara Membagi Pekerjaan

Contoh pembagian sprint:

| Orang | Branch | Area |
| --- | --- | --- |
| Developer A | `feature/property-all-risk-multi` | Property All Risk dan multi properti |
| Developer B | `feature/kbm-multi-vehicle` | KBM multi kendaraan |
| Developer C | `feature/routing-preview-links` | Routing dan preview URL |
| Developer D | `fix/review-checklist` | Review workbench dan checklist final |

## Cara Mengurangi Konflik

- Jangan dua orang mengedit file besar yang sama di waktu bersamaan tanpa pembagian blok kerja.
- Untuk `src/App.jsx`, sepakati dulu rute yang akan disentuh.
- Untuk `src/MotorLatestExact.tsx` dan `src/PropertyPrototype.jsx`, pecah pekerjaan ke komponen/domain helper baru bila perubahan sudah besar.
- Pull `main` secara rutin sebelum mulai kerja harian.

## Release Production

1. Pastikan semua PR yang masuk `main` sudah punya preview yang dites.
2. Jalankan verifikasi di branch `main` terbaru.
3. Cek halaman penting:
   - `/internal/property`
   - `/internal/property-all-risk`
   - `/internal/motor`
   - `/internal/car-tlo`
   - `/internal/car-comprehensive`
   - `/external/property`
   - `/external/motor`
4. Catat perubahan utama di release notes.
5. Deploy production dari `main`.
