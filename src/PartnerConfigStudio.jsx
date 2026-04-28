
import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Accessibility,
  Activity,
  BadgeCheck,
  Bell,
  Binary,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Copy,
  Database,
  FileCode2,
  FileSpreadsheet,
  Home,
  Filter,
  Globe2,
  HeartPulse,
  Landmark,
  Layers3,
  Link2,
  Lock,
  NotebookPen,
  MapPin,
  Plus,
  Puzzle,
  RadioTower,
  RefreshCcw,
  Route,
  Search,
  ServerCog,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Stethoscope,
  TriangleAlert,
  Upload,
  UserRound,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { UserPillMenu } from "./components/UserPillMenu.jsx";

const STORAGE_KEY = "partner-integration-studio-v3";

const PRODUCT_FAMILIES = [
  {
    id: "all",
    label: "Semua Family",
    short: "Semua",
    note: "Lihat seluruh partner config",
    icon: Layers3,
  },
  {
    id: "group-pa",
    label: "PA Kumpulan",
    short: "PA",
    note: "Sekolah, komunitas, peserta massal",
    icon: ShieldCheck,
  },
  {
    id: "health-group",
    label: "Perjalanan Kumpulan",
    short: "Trip",
    note: "Perjalanan partner, peserta, dan sertifikat",
    icon: Sparkles,
  },
  {
    id: "property-group",
    label: "Property Kumpulan",
    short: "Property",
    note: "Lokasi, aset, blanket property",
    icon: Building2,
  },
  {
    id: "travel-group",
    label: "Travel Kumpulan",
    short: "Travel",
    note: "Trip massal, peserta dan sertifikat",
    icon: Globe2,
  },
];

const CHANNEL_OPTIONS = [
  {
    id: "partner-portal",
    label: "Partner Portal",
    note: "Partner input sendiri via portal",
    icon: Globe2,
  },
  {
    id: "partner-api",
    label: "Partner API",
    note: "JSON payload langsung ke core",
    icon: ServerCog,
  },
  {
    id: "internal-assisted",
    label: "Internal Assisted",
    note: "Sales / CS / branch bantu input",
    icon: UserRound,
  },
  {
    id: "external-b2c",
    label: "External / B2C",
    note: "Landing page atau mobile funnel",
    icon: RadioTower,
  },
];

const STATUS_FILTERS = ["Semua", "Draft", "Checker", "Approval", "Active"];
const ROLE_OPTIONS = ["Maker", "Checker", "Approval"];
const SOURCE_OPTIONS = ["Partner", "Master Policy", "System"];
const EDITABILITY_OPTIONS = ["Locked", "Partner Can Override", "Internal Only"];
const INTEGRATION_OPTIONS = ["CSV Upload", "Excel Upload", "REST API", "Portal Form"];
const STAR_CHECK_OPTIONS = ["AUTO_CHECK", "FORCE_EXISTING", "FORCE_NEW"];
const EXISTS_OPTIONS = ["ENDORSEMENT", "USE_EXISTING"];
const MISSING_OPTIONS = ["CREATE_NEW", "BLOCK_AND_REVIEW"];

const STEP_LIST = [
  { id: "general", label: "Informasi Umum", short: "Umum", icon: NotebookPen },
  { id: "object", label: "Obyek Pertanggungan", short: "Obyek", icon: ShieldCheck },
  { id: "clause", label: "Wording & Klausula", short: "Klausula", icon: FileSpreadsheet },
  { id: "summary", label: "Ringkasan", short: "Ringkasan", icon: BadgeCheck },
];

const PORTAL_PRODUCT_CARDS = [
  {
    family: "group-pa",
    title: "Life Guard",
    category: "Kecelakaan Diri",
    description: "Atur konfigurasi partner untuk produk kecelakaan diri, termasuk data master, obyek pertanggungan, klausula, dan ringkasan approval.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
    defaultBlueprint: "Life Guard Basic",
    defaultProduct: "Life Guard",
    defaultPartner: "Partner Life Guard",
  },
  {
    family: "health-group",
    title: "Trip Guard",
    category: "Kecelakaan Diri",
    description: "Atur konfigurasi partner untuk perjalanan grup, peserta, klausula, dan ringkasan approval.",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80",
    defaultBlueprint: "Trip Guard Basic",
    defaultProduct: "Trip Guard",
    defaultPartner: "Partner Trip Guard",
  },
  {
    family: "property-group",
    title: "Edu Protect",
    category: "Kecelakaan Diri",
    description: "Atur blanket asset, lokasi, nilai pertanggungan, dan pola endorsement partner.",
    image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80",
    defaultBlueprint: "Edu Protect Basic",
    defaultProduct: "Edu Protect",
    defaultPartner: "Partner Edu Protect",
  },
  {
    family: "travel-group",
    title: "Travel Safe",
    category: "Perjalanan",
    description: "Atur konfigurasi partner untuk perjalanan grup, peserta, klausula, dan ringkasan approval.",
    image: "https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=900&q=80",
    defaultBlueprint: "Travel Safe Basic",
    defaultProduct: "Travel Safe",
    defaultPartner: "Partner Travel Safe",
  },
];

const CLAUSE_LIBRARY = [
  "Klausula 72 Jam",
  "Usia Peserta 5â€“24 Tahun",
  "Periode Tunggu 7 Hari",
  "Data Realisasi Dapat Diunggah Massal",
  "Endorsement Penambahan Peserta",
  "Wilayah Indonesia Saja",
  "No Claim Bonus Tidak Berlaku",
];

const TRIP_TRAVEL_COVERAGE_OPTIONS = ["72801 - P.A PERJALANAN"];
const TRIP_TRAVEL_CLAUSE_OPTIONS = [
  "Klausul Kegiatan Olahraga",
  "Klausul Kesehatan",
  "Klausul Pembayaran Premi",
  "Klausul Pengecualian Kecelakaan Selama Ibadah",
  "Klausul Penumpang Pesawat Terbang Non Reguler",
  "Klausul Usia",
  "Klausul Kehamilan",
  "Klausul Masa Berlaku Pertanggungan",
  "Klausul Pelaporan dan Kelengkapan Dokumen Klaim",
  "Klausul Pengecualian Risiko Mengendarai Sepeda Motor",
  "Klausul Risiko Mengendarai Sepeda Motor dan Sejenisnya",
];

const TRAVEL_SAFE_COVERAGE_OPTIONS = [
  { code: "79401", label: "79401 - DOMESTIK", category: "DOM" },
  { code: "79402", label: "79402 - INTERNATIONAL NON SCHENGEN", category: "INT" },
  { code: "79405", label: "79405 - INTERNATIONAL SCHENGEN", category: "INT" },
];

const TRAVEL_SAFE_WORDING_LABEL = "Wording Standar Travel Jasindo";
const TRAVEL_SAFE_WORDING_NOTE =
  "Travel Safe menggunakan wording standar Travel Jasindo tanpa pilihan jenis cetakan polis, konfigurasi klausula tambahan, atau package klausula terpisah.";

const TRAVEL_SAFE_EXTENSION_LIBRARY = [
  {
    id: "cat_trv",
    title: "Ketidaknyamanan Perjalanan",
    icon: Route,
    items: [
      { id: "trv_1", label: "Perlindungan Bagasi Pribadi" },
      { id: "trv_2", label: "Kehilangan Uang, Dokumen Perjalanan" },
      { id: "trv_3", label: "Kehilangan Barang Elektronik dan Barang Fashion" },
      { id: "trv_4", label: "Penundaan Perjalanan" },
      { id: "trv_5", label: "Biaya Hotel Karena Penundaan" },
      { id: "trv_6", label: "Biaya Perjalanan Pengganti" },
      { id: "trv_7", label: "Penundaan Bagasi" },
      { id: "trv_8", label: "Pembatalan Perjalanan (Tiket/Hotel)" },
      { id: "trv_9", label: "Pengurangan Perjalanan/Kepulangan Lebih Awal" },
      { id: "trv_10", label: "Kehilangan Transportasi Lanjutan" },
      { id: "trv_11", label: "Ketidaksesuaian Fasilitas Hotel" },
      { id: "trv_12", label: "Kehilangan Reservasi Hotel" },
    ],
  },
  {
    id: "cat_oth",
    title: "Manfaat Lain-Lain",
    icon: Puzzle,
    items: [
      { id: "oth_1", label: "Tanggung Jawab Pribadi" },
      { id: "oth_2", label: "Penolakan Visa" },
      { id: "oth_3", label: "Biaya Risiko Sendiri Atas Kendaraan Sewaan" },
      { id: "oth_4", label: "Perpanjangan Polis Secara Otomatis", isCheckOnly: true },
    ],
  },
  {
    id: "cat_fun",
    title: "Perlindungan Kegiatan Hiburan",
    icon: Activity,
    items: [{ id: "fun_1", label: "Meninggal Dunia dan Cacat Tetap Akibat Kecelakaan Kegiatan Ekstrim" }],
  },
  {
    id: "cat_home",
    title: "Perlindungan Rumah",
    icon: Home,
    items: [
      { id: "home_1", label: "Kebakaran Rumah Tinggal" },
      { id: "home_2", label: "Kehilangan Isi Rumah Karena Pencurian" },
    ],
  },
];

const TRAVEL_SAFE_ASSISTANCE_INFO = {
  title: "Bantuan Medis di Seluruh Dunia",
  description:
    "Evakuasi & repatriasi medis darurat, repatriasi jenazah, layanan transportasi bagi anggota keluarga, 24 jam hotline bantuan darurat, pemulangan anak dan pendampingan pengasuh, serta pemantauan medis.",
  idrFee: 40000,
  usdFee: 10,
};

const TRAVEL_SAFE_STARTER_PERLUASAN = {
  trv_1: { checked: true, hpMin: "5.000", hpMax: "10.000", rate: "0,05", premiMin: "3", premiMax: "5" },
  trv_4: { checked: true, hpMin: "500", hpMax: "1.000", rate: "0,02", premiMin: "0", premiMax: "0" },
  trv_8: { checked: true, hpMin: "2.500", hpMax: "5.000", rate: "0,03", premiMin: "1", premiMax: "2" },
  oth_2: { checked: true, hpMin: "1.000", hpMax: "2.000", rate: "0,03", premiMin: "0", premiMax: "1" },
  home_1: { checked: true, hpMin: "10.000", hpMax: "20.000", rate: "0,04", premiMin: "4", premiMax: "8" },
  oth_4: { checked: true, hpMin: "", hpMax: "", rate: "", premiMin: "", premiMax: "" },
};

const FIELD_HELPERS = {
  "Nama / CIF": "Ketik nama untuk mencari data CIF, atau lanjutkan sebagai nasabah baru.",
  "Nomor Handphone": "Isi nomor handphone yang aktif.",
  "Alamat Email": "Gunakan email yang aktif.",
  "Informasi Calon Pemegang Polis": "Lengkapi identitas calon pemegang polis yang akan dicetak di polis.",
  "Jenis Bangunan": "Pilih jenis bangunan yang paling sesuai.",
  "Penggunaan Properti yang Diasuransikan": "Pilih penggunaan utama properti yang diasuransikan.",
  "Kelas Konstruksi": "Pilih sesuai material utama bangunan.",
  "Alamat / Lokasi Objek": "Isi alamat objek secara jelas.",
  "Nilai Pertanggungan": "Isi nilai yang akan dilindungi.",
  "Nama Konfigurasi": "Gunakan nama yang mudah dikenali.",
  "Nama Partner": "Isi nama partner.",
  "Nomor PKS / Kerjasama": "Isi nomor PKS atau nomor kerja sama.",
  "Kode Tertanggung": "Isi kode tertanggung.",
  "Kode Partner": "Isi kode singkat partner.",
  "Email Owner Proses": "Isi email PIC yang memegang proses ini.",
  "Mulai Kerjasama": "Isi tanggal mulai kerja sama.",
  "Akhir Kerjasama": "Isi tanggal akhir kerja sama.",
  "Kode Akuisisi": "Pilih kode akuisisi yang sesuai.",
  "Family Produk": "Pilih kelompok produk.",
  "Catatan Konfigurasi": "Tambahkan catatan singkat bila perlu.",
  "Mode Integrasi": "Pilih jalur data partner.",
  "Sync Target": "Pilih tujuan sinkronisasi data.",
  "Cek Nomor Polis Induk di STAR": "Pilih cara pengecekan nomor polis induk.",
  "Jika Sudah Ada": "Pilih tindakan jika data sudah ada.",
  "Jika Belum Ada": "Pilih tindakan jika data belum ada.",
  "Primary Key Partner": "Isi field unik utama dari partner.",
  "Endpoint / Bucket / Route": "Isi endpoint, bucket, atau route.",
  "Kode Produk": "Isi kode produk induk.",
  "Nama Produk Induk": "Isi nama produk induk.",
  "Nomor Polis Induk / PKS": "Isi nomor polis induk atau PKS.",
  "Nomor Polis Induk / Nomor PKS": "Isi nomor polis induk atau PKS.",
  "Plan": "Pilih plan yang berlaku.",
  "Rate Dasar (‰)": "Isi rate dasar.",
  "Rate Premi (â€°)": "Isi rate premi.",
  "Biaya Admin": "Isi biaya admin.",
  "Biaya Polis": "Isi biaya polis.",
  "Biaya Meterai (Sesuai STAR)": "Isi biaya meterai yang berlaku.",
  "Diskon (%)": "Isi diskon.",
  "Brokerage / Komisi (%)": "Isi komisi atau brokerage.",
  "Owner / Squad": "Pilih penanggung jawab internal.",
  "Ringkasan Manfaat": "Tulis manfaat utama secara singkat.",
  "Batasan Usia Peserta": "Isi usia minimum dan maksimum peserta.",
  "Jenis Pertanggungan": "Pilih jenis pertanggungan.",
  "Kriteria Validasi Santunan": "Tentukan aturan validasi santunan.",
  "Mata Uang": "Pilih mata uang yang digunakan.",
  "NP Meninggal Dunia (A)": "Isi nilai manfaat meninggal dunia.",
  "NP Cacat Tetap (B)": "Isi nilai atau persentase manfaat cacat tetap.",
  "NP Pengobatan (C)": "Isi nilai atau persentase manfaat pengobatan.",
  "Kelas Risiko": "Pilih kelas risiko.",
  "Risk Exposure": "Pilih eksposur risikonya.",
  "Premi": "Isi nilai premi.",
  "Risiko Sendiri (Deductible)": "Isi risiko sendiri.",
  "Format Source": "Pilih format sumber data.",
  "Primary Key": "Pilih field kunci utama.",
  "Endpoint / Route": "Isi endpoint atau route.",
  "Sample Payload (JSON)": "Isi contoh payload JSON.",
  "Source Field": "Isi nama field dari sumber data.",
  "Target Core Field": "Pilih field tujuan.",
  Transform: "Isi aturan ubah format.",
  "Contoh Nilai": "Isi contoh nilai.",
  "Source of Truth": "Pilih sumber data utama.",
  Editability: "Pilih pihak yang boleh mengubah field ini.",
  "Default Value": "Isi nilai default.",
  "Wajib Saat Realisasi": "Tandai jika wajib saat realisasi.",
  "Panduan untuk Partner / Operasional": "Tulis petunjuk pengisian singkat.",
  Wording: "Pilih wording dasar.",
  "Judul Klausula Tambahan": "Isi judul klausula tambahan.",
  "Deskripsi Klausula Tambahan": "Tulis deskripsi singkat klausula tambahan.",
  "Daftar QQ Tambahan": "Isi daftar QQ tambahan.",
  "Daftar PIC": "Pilih PIC yang terkait.",
  "Nama Tertanggung": "Isi nama tertanggung.",
  NPWP: "Isi nomor NPWP.",
  "Alamat Korespondensi": "Isi alamat korespondensi.",
  "Email Korespondensi": "Isi email korespondensi.",
  "Mulai Pertanggungan": "Isi tanggal mulai pertanggungan.",
  "Akhir Pertanggungan": "Isi tanggal akhir pertanggungan.",
  "Analisa Maker (ROM)": "",
  "Analisa Reviewer (Admin UDW)": "",
  "Analisa Persetujuan (HO)": "",
  "Maker Note": "Isi catatan maker.",
  "Checker Note": "Isi catatan reviewer.",
  "Approval Note": "Isi catatan persetujuan.",
};

const FIELD_CATALOG = [
  { key: "partner_policy_ref", label: "Reference Partner", category: "master", help: "ID utama milik partner." },
  { key: "insured_code", label: "Kode Tertanggung", category: "master", help: "Kode tertanggung di core system." },
  { key: "master_policy_no", label: "Nomor Polis Induk / PKS", category: "master", help: "Nomor PKS atau polis induk." },
  { key: "product_code", label: "Kode Produk", category: "master", help: "Kode produk asuransi." },
  { key: "participant_name", label: "Nama Peserta", category: "realisasi", help: "Nama pihak yang direalisasikan." },
  { key: "partner_member_id", label: "ID Peserta / Member", category: "realisasi", help: "NIS, member id, atau identitas peserta." },
  { key: "employee_id", label: "Employee ID", category: "realisasi", help: "ID karyawan bila skema employee." },
  { key: "birth_date", label: "Tanggal Lahir", category: "realisasi", help: "Format core system YYYY-MM-DD." },
  { key: "effective_date", label: "Tanggal Efektif", category: "realisasi", help: "Tanggal mulai cover." },
  { key: "certificate_no", label: "Nomor Sertifikat", category: "realisasi", help: "Bisa dari partner atau generated system." },
  { key: "plan_code", label: "Plan", category: "realisasi", help: "Plan manfaat atau kelas." },
  { key: "sum_insured", label: "Nilai Pertanggungan", category: "realisasi", help: "TSI / SI." },
  { key: "premium_amount", label: "Premi", category: "realisasi", help: "Premi final bila dikirim partner." },
  { key: "location_code", label: "Lokasi / Cabang", category: "realisasi", help: "Cabang, sekolah, atau lokasi properti." },
  { key: "class_room", label: "Kelas / Unit", category: "realisasi", help: "Kelas siswa, unit, atau grup." },
  { key: "beneficiary_name", label: "Penerima Manfaat", category: "realisasi", help: "Opsional sesuai produk." },
];

const FIELD_MAP = FIELD_CATALOG.reduce((acc, item) => {
  acc[item.key] = item;
  return acc;
}, {});

const AUTO_ALIASES = {
  partner_policy_ref: ["partner_policy_ref", "partner_ref", "ref_id", "reference_id", "partner_id", "batch_ref"],
  insured_code: ["insured_code", "tertanggung_code", "kode_tertanggung"],
  master_policy_no: ["master_policy_no", "pks_number", "policy_number", "nomor_pks", "nomor_polis"],
  product_code: ["product_code", "produk_code", "policy_code"],
  participant_name: ["participant_name", "name", "student_name", "employee_name", "insured_name", "nama_peserta", "nama"],
  partner_member_id: ["partner_member_id", "member_id", "student_id", "nis", "customer_id", "participant_id"],
  employee_id: ["employee_id", "employee_no", "nip", "nik_karyawan"],
  birth_date: ["birth_date", "dob", "tanggal_lahir", "date_of_birth"],
  effective_date: ["effective_date", "coverage_start", "start_date", "tgl_mulai", "policy_start_date"],
  certificate_no: ["certificate_no", "cert_no", "certificate_number", "sertifikat_no", "nomor_sertifikat"],
  plan_code: ["plan", "plan_code", "kelas_plan", "benefit_plan"],
  sum_insured: ["sum_insured", "tsi", "coverage_amount", "nilai_pertanggungan"],
  premium_amount: ["premium", "premi", "premium_amount", "gross_premium"],
  location_code: ["location", "branch", "branch_code", "school", "school_code", "location_code"],
  class_room: ["class_room", "class", "kelas", "unit", "group"],
  beneficiary_name: ["beneficiary", "beneficiary_name", "heir_name", "nama_ahli_waris"],
};

const FAMILY_REQUIRED_TARGETS = {
  "group-pa": ["participant_name", "partner_member_id", "birth_date", "effective_date", "certificate_no", "class_room"],
  "health-group": ["participant_name", "birth_date", "effective_date", "certificate_no", "plan_code"],
  "property-group": ["location_code", "effective_date", "certificate_no", "sum_insured", "premium_amount"],
  "travel-group": ["participant_name", "birth_date", "effective_date", "certificate_no", "plan_code"],
};

const LIFE_GUARD_PIC_OPTIONS = ["Alpha", "Bravo", "Charlie"];
const LIFE_GUARD_ACQUISITION_OPTIONS = [
  "100 - PS Perseorangan",
  "110 - PS Perusahaan",
  "200 - Agent",
  "300 - Broker",
  "240 - Perbankan",
  "250 - Pembiayaan",
  "500 - Koas Masuk",
  "600 - Konsorsium",
  "700 - Online Channel",
];
const LIFE_GUARD_COVERAGE_OPTIONS = [
  "70501 - KECELAKAAN DIRI",
  "70510 - KECELAKAAN DIRI + MOLEST",
  "70511 - KECELAKAAN DIRI ANAK SEKOLAH",
  "70512 - KECELAKAAN DIRI CREW KAPAL",
  "70513 - KECELAKAAN DIRI NELAYAN MANDIRI",
  "70514 - KECELAKAAN DIRI NELAYAN NON BPAN",
  "70515 - KECELAKAAN DIRI PENGUNJUNG WISATA",
  "70516 - KECELAKAAN DIRI WISATAWAN DAN TAMU HOTEL",
];
const LIFE_GUARD_CURRENCY_OPTIONS = [
  "101 - RP.",
  "102 - DINAR",
  "104 - S.RUPE",
  "105 - M.RING",
  "108 - NPR",
  "109 - T.BATH",
  "111 - HK.$.",
  "113 - K.WON",
  "116 - SIN.$",
  "117 - IND.RP",
  "118 - PAK.RP",
  "120 - PESO",
  "124 - BDT",
  "128 - OMR",
  "129 - REYEAL",
  "130 - KINA",
  "131 - RIYAL",
  "132 - BRUN.$",
  "135 - B.KYAT",
  "137 - KPW",
  "139 - BTN",
  "140 - CNY",
  "141 - JOD",
  "142 - QAR",
  "143 - SYP",
  "144 - BHD",
  "145 - AED",
  "146 - VND",
  "147 - OER",
  "201 - US.$.",
  "205 - CA.$.",
  "210 - XXX",
  "309 - D.M.",
  "311 - A.SJ",
  "312 - B.FR.",
  "313 - S.KR",
  "314 - N.KR",
  "315 - SW.FR.",
  "316 - FR.FC",
  "317 - NGD",
  "318 - D.KR",
  "319 - LIT",
  "321 - E.POUN",
  "322 - PSETAS",
  "323 - HRK",
  "327 - P.ESCD",
  "334 - EURO",
  "406 - LYD",
  "410 - MAD",
  "411 - TND",
  "503 - AUS.$.",
  "504 - N.Z.",
  "505 - FJD",
];
const LIFE_GUARD_ADDITIONAL_CLAUSE_LIBRARY = [
  { title: "Klausul Kehamilan", lob: "Kecelakaan Diri" },
  { title: "Klausul Kesehatan", lob: "Kecelakaan Diri" },
  { title: "Klausul Masa Berlaku Pertanggungan", lob: "Kecelakaan Diri" },
  { title: "Klausul Pembayaran Premi", lob: "Kecelakaan Diri" },
  { title: "Klausul Pelaporan dan Kelengkapan Dokumen Klaim", lob: "Kecelakaan Diri" },
  { title: "Klausul Pengecualian Kecelakaan Selama Ibadah", lob: "Kecelakaan Diri" },
  { title: "Klausul Pengecualian Risiko Mengendarai Sepeda Motor", lob: "Kendaraan Bermotor" },
  { title: "Klausul Penumpang Pesawat Terbang Non Reguler", lob: "Penerbangan" },
  { title: "Klausul Risiko Mengendarai Sepeda Motor dan Sejenisnya", lob: "Kendaraan Bermotor" },
  { title: "Klausul Usia", lob: "Kecelakaan Diri" },
];

const WORDING_OPTION_META = {
  PSAKDI: "Wording utama berbahasa Indonesia untuk perlindungan kecelakaan diri.",
  "PSAKDI Bilingual": "Wording utama dua bahasa untuk partner yang membutuhkan dokumen bilingual.",
};

const WORDING_OPTIONS = ["PSAKDI", "PSAKDI Bilingual"];
const PRINT_DOCUMENT_OPTIONS = ["Ikhtisar", "Sertifikat"];

function renderWordingLabel(value) {
  if (value === "PSAKDI") return "Polis Standar Asuransi Kecelakaan Diri Indonesia";
  if (value === "PSAKDI Bilingual") return "Polis Standar Asuransi Kecelakaan Diri Indonesia (Bilingual)";
  return value;
}

const CLAUSE_DESCRIPTIONS = {
  "Klausula 72 Jam": "Mengatur ketentuan pelaporan atau pemberitahuan dalam batas waktu yang disepakati.",
  "Klausula Kehamilan": "Mengatur batasan atau ketentuan perlindungan yang berkaitan dengan kehamilan.",
  "Klausula Kesehatan": "Mengatur ketentuan kesehatan awal atau kondisi yang harus diperhatikan sebelum perlindungan aktif.",
  "Klausul Kegiatan Olahraga": "Menambahkan ketentuan untuk aktivitas olahraga sesuai kesepakatan partner.",
  "Klausula Kegiatan Olahraga": "Menambahkan ketentuan untuk aktivitas olahraga sesuai kesepakatan partner.",
  "Klausula Pembayaran Premi": "Menjelaskan ketentuan pembayaran premi dan kapan perlindungan mulai berlaku.",
  "Klausul Pembayaran Premi": "Menjelaskan ketentuan pembayaran premi dan kapan perlindungan mulai berlaku.",
  "Klausula Pengecualian Kecelakaan Selama Ibadah": "Menjelaskan batasan risiko tertentu selama kegiatan ibadah bila dibutuhkan oleh partner.",
  "Klausul Pengecualian Kecelakaan Selama Ibadah": "Menjelaskan batasan risiko tertentu selama kegiatan ibadah bila dibutuhkan oleh partner.",
  "Klausula Penumpang Pesawat Terbang Non Reguler": "Mengatur perlindungan untuk perjalanan udara non-reguler sesuai kebutuhan produk.",
  "Klausul Penumpang Pesawat Terbang Non Reguler": "Mengatur perlindungan untuk perjalanan udara non-reguler sesuai kebutuhan produk.",
  "Klausula Usia": "Mengatur batas usia masuk dan ketentuan usia peserta yang dapat ditanggung.",
  "Klausul Usia": "Mengatur batas usia masuk dan ketentuan usia peserta yang dapat ditanggung.",
  "Klausula Masa Berlaku Pertanggungan": "Menjelaskan masa berlaku perlindungan sesuai periode yang disepakati.",
  "Klausul Masa Berlaku Pertanggungan": "Menjelaskan masa berlaku perlindungan sesuai periode yang disepakati.",
  "Klausula Pelaporan dan Kelengkapan Dokumen Klaim": "Mengatur tata cara pelaporan klaim dan dokumen yang perlu disiapkan.",
  "Klausul Pelaporan dan Kelengkapan Dokumen Klaim": "Mengatur tata cara pelaporan klaim dan dokumen yang perlu disiapkan.",
  "Klausula Pengecualian Risiko Mengendarai Sepeda Motor": "Menjelaskan pembatasan risiko saat peserta mengendarai sepeda motor.",
  "Klausul Pengecualian Risiko Mengendarai Sepeda Motor": "Menjelaskan pembatasan risiko saat peserta mengendarai sepeda motor.",
  "Klausula Risiko Mengendarai Sepeda Motor dan Sejenisnya": "Mengatur perluasan atau penyesuaian perlindungan untuk risiko sepeda motor dan sejenisnya.",
  "Klausul Risiko Mengendarai Sepeda Motor dan Sejenisnya": "Mengatur perluasan atau penyesuaian perlindungan untuk risiko sepeda motor dan sejenisnya.",
  "Wilayah Indonesia Saja": "Membatasi perlindungan agar hanya berlaku untuk perjalanan atau aktivitas di wilayah Indonesia.",
  "Data Realisasi Dapat Diunggah Massal": "Mengatur bahwa data realisasi peserta dapat diunggah sekaligus sesuai format partner.",
};

function getClauseDescription(label, fallback = "Klausula ini akan ikut sebagai pengaturan default pada konfigurasi partner.") {
  return CLAUSE_DESCRIPTIONS[label] || fallback;
}
const LIFE_GUARD_COVERAGE_ITEMS = [
  {
    id: "main-accident",
    section: "main",
    title: "Meninggal Dunia",
    icon: ShieldCheck,
    clauseLabel: "Meninggal Dunia karena Kecelakaan",
    description: "Menjamin santunan bila Tertanggung meninggal dunia sebagai akibat langsung dari kecelakaan yang dijamin polis.",
    note: "Santunan juga dapat diberikan bila Tertanggung hilang akibat kecelakaan dan tidak ditemukan sekurang-kurangnya 60 hari. Hak santunan mengikuti Jaminan A yang tercantum pada ikhtisar.",
    included: true,
  },
  {
    id: "main-disability",
    section: "main",
    title: "Cacat Tetap Total atau Sebagian",
    icon: Accessibility,
    clauseLabel: "Cacat Tetap Total / Sebagian",
    description: "Menjamin santunan bila Tertanggung mengalami cacat tetap sebagai akibat langsung dari kecelakaan yang dijamin polis.",
    note: "Jaminan ini mencakup cacat tetap keseluruhan dan cacat tetap sebagian. Besarnya santunan mengikuti Jaminan B dan penetapan dokter sesuai kondisi cacat tetap.",
    included: true,
  },
  {
    id: "main-medical",
    section: "main",
    title: "Biaya Perawatan atau Pengobatan",
    icon: Stethoscope,
    clauseLabel: "Biaya Pengobatan Akibat Kecelakaan",
    description: "Menjamin penggantian biaya perawatan atau pengobatan untuk pemulihan sakit atau cedera yang timbul langsung dari kecelakaan yang dijamin polis.",
    note: "Penggantian mengikuti biaya yang benar-benar dikeluarkan dan tidak melebihi Jaminan C pada ikhtisar. Kuitansi pengobatan alternatif tidak termasuk.",
    included: true,
  },
];

function nowLabel() {
  return new Date().toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

function cls() {
  return Array.from(arguments).filter(Boolean).join(" ");
}

function safeReadStorage() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function safeReadUrlState() {
  if (typeof window === "undefined") return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const stepParam = params.get("pc_step");
    return {
      familyFilter: params.get("pc_family_filter") || null,
      scopeFilter: params.get("pc_scope") || null,
      statusFilter: params.get("pc_status") || null,
      search: params.get("pc_search") || null,
      selectedId: params.get("pc_id") || null,
      stepIndex: stepParam !== null && Number.isFinite(Number(stepParam)) ? Number(stepParam) : null,
      portalView: params.get("pc_view") || null,
      selectedFamily: params.get("pc_family") || null,
      catalogSearch: params.get("pc_catalog") || null,
    };
  } catch {
    return {};
  }
}

function writeUrlState(state) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const entries = {
    pc_family_filter: state.familyFilter && state.familyFilter !== "all" ? state.familyFilter : null,
    pc_scope: state.scopeFilter && state.scopeFilter !== "all" ? state.scopeFilter : null,
    pc_status: state.statusFilter && state.statusFilter !== "Semua" ? state.statusFilter : null,
    pc_search: state.search || null,
    pc_id: state.selectedId || null,
    pc_step: state.portalView === "studio" && state.selectedId ? String(state.stepIndex ?? 0) : null,
    pc_view: state.portalView && state.portalView !== "catalog" ? state.portalView : null,
    pc_family: state.selectedFamily || null,
    pc_catalog: state.catalogSearch || null,
  };
  Object.entries(entries).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  });
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function onlyDigits(value) {
  return String(value || "").replace(/\D+/g, "");
}

function parseNumber(value) {
  return Number(String(value || "").split(".").join("") || "0");
}

function formatNumber(value) {
  const digits = onlyDigits(value);
  return digits ? new Intl.NumberFormat("id-ID").format(Number(digits)) : "";
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID").format(Number(value || 0));
}

function parseFlexibleNumber(value) {
  return Number(String(value || "0").split(".").join("").replace(",", ".")) || 0;
}

function formatRateInput(value) {
  const cleaned = String(value || "").replace(/[^0-9,]/g, "");
  const parts = cleaned.split(",");
  if (parts.length <= 1) return cleaned;
  return `${parts[0]},${parts.slice(1).join("")}`;
}

function getStatusTone(status) {
  if (status === "Draft") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "Checker") return "border-sky-200 bg-sky-50 text-sky-700";
  if (status === "Approval") return "border-violet-200 bg-violet-50 text-violet-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function copyText(value, onDone) {
  if (typeof navigator === "undefined") return;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(String(value || "")).then(() => onDone?.()).catch(() => {});
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = String(value || "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
  onDone?.();
}

function titleCase(value) {
  return String(value || "")
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function applyTransforms(rawValue, transformString) {
  let value = rawValue;
  const tokens = String(transformString || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  tokens.forEach((token) => {
    const lower = token.toLowerCase();
    if (lower === "trim") value = String(value ?? "").trim();
    else if (lower === "upper") value = String(value ?? "").toUpperCase();
    else if (lower === "lower") value = String(value ?? "").toLowerCase();
    else if (lower === "title") value = titleCase(String(value ?? ""));
    else if (lower === "digits") value = onlyDigits(value);
    else if (lower === "number") value = formatNumber(value);
    else if (lower === "dd/mm/yyyy->yyyy-mm-dd") {
      const text = String(value || "").trim();
      const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (match) value = `${match[3]}-${match[2]}-${match[1]}`;
    } else if (lower.startsWith("prefix:")) {
      value = `${token.slice(7)}${value ?? ""}`;
    } else if (lower.startsWith("suffix:")) {
      value = `${value ?? ""}${token.slice(7)}`;
    }
  });

  return value;
}

function getRequiredTargets(config) {
  return FAMILY_REQUIRED_TARGETS[config.family] || ["participant_name", "birth_date", "effective_date", "certificate_no"];
}

function getUniqueMappedTargets(config) {
  const found = new Set();
  (config.data.mapping.rows || []).forEach((row) => {
    if (row.target) found.add(row.target);
  });
  return Array.from(found);
}

function getOperationalTargets(config) {
  const required = getRequiredTargets(config);
  const mapped = getUniqueMappedTargets(config).filter(
    (key) => FIELD_MAP[key]?.category === "realisasi" || key === "partner_policy_ref"
  );
  return Array.from(new Set(["partner_policy_ref", ...required, ...mapped]));
}

function makeDefaultFieldRule(key, required = false) {
  return {
    active: true,
    required,
    source: "Partner",
    editable: required ? "Locked" : "Partner Can Override",
    defaultValue: "",
  };
}

function getOperationalFieldRules(config) {
  const targets = getOperationalTargets(config);
  const current = config.data.realisasi.fields || {};
  const result = {};
  targets.forEach((key) => {
    const isRequired = key === "partner_policy_ref" || getRequiredTargets(config).includes(key);
    result[key] = current[key] || makeDefaultFieldRule(key, isRequired);
  });
  return result;
}

function getPartnerFacingFields(config) {
  const rules = getOperationalFieldRules(config);
  return Object.entries(rules)
    .filter(([, rule]) => rule.active && rule.source === "Partner" && rule.editable !== "Internal Only")
    .map(([key, rule]) => ({ key, rule, meta: FIELD_MAP[key] || { label: key, key } }));
}

function getLifeGuardCurrencyLabel(value) {
  return LIFE_GUARD_CURRENCY_OPTIONS.find((item) => item === value) || LIFE_GUARD_CURRENCY_OPTIONS[0];
}

function getLifeGuardCurrencyCode(value) {
  const label = getLifeGuardCurrencyLabel(value);
  const parts = label.split(" - ");
  return parts[1] || label;
}

function getLifeGuardComputed(master) {
  const criteria = master.npCriteria || "antara";
  const currencyCode = getLifeGuardCurrencyCode(master.currencyCode);
  const npAMin = parseNumber(master.npAMin || "0");
  const npAMax = parseNumber(master.npAMax || "0");
  const npBPercent = Number(master.npBPercent || 0);
  const npCPercent = Number(master.npCPercent || 0);
  const rateValue = Number(String(master.baseRate || "0").replace(",", "."));
  const premiumMin = Math.round(npAMin * (rateValue / 1000));
  const premiumMax = Math.round(npAMax * (rateValue / 1000));

  const formatBenefit = (min, max) => {
    if (criteria === "setara") return `${currencyCode} ${formatRupiah(min)}`;
    if (criteria === "lebih_besar") return `> ${currencyCode} ${formatRupiah(min)}`;
    if (criteria === "kurang_dari") return `< ${currencyCode} ${formatRupiah(min)}`;
    return `${currencyCode} ${formatRupiah(min)} - ${formatRupiah(max)}`;
  };

  return {
    criteria,
    currencyCode,
    premiumMin,
    premiumMax,
    npAText: formatBenefit(npAMin, npAMax),
    npBText: formatBenefit(npAMin * (npBPercent / 100), npAMax * (npBPercent / 100)),
    npCText: formatBenefit(npAMin * (npCPercent / 100), npAMax * (npCPercent / 100)),
  };
}

function getTravelSafeCoverageLabel(code) {
  return TRAVEL_SAFE_COVERAGE_OPTIONS.find((item) => item.code === code)?.label || code;
}

function getTravelSafeCoverageText(master) {
  const coverageCodes = Array.isArray(master?.coverageCodes) ? master.coverageCodes : [];
  if (coverageCodes.length > 0) {
    return coverageCodes.map((code) => getTravelSafeCoverageLabel(code)).join(", ");
  }
  return master?.coverageType || "-";
}

function isTravelSafeInternational(master) {
  return (master?.coverageCodes || []).some((code) => TRAVEL_SAFE_COVERAGE_OPTIONS.find((item) => item.code === code)?.category === "INT");
}

function getTravelSafeLockedCurrency(master) {
  return isTravelSafeInternational(master) ? "201 - US.$." : "101 - RP.";
}

function getTravelSafeAssistanceFee(master) {
  return isTravelSafeInternational(master) ? TRAVEL_SAFE_ASSISTANCE_INFO.usdFee : TRAVEL_SAFE_ASSISTANCE_INFO.idrFee;
}

function getTravelSafeAssistanceFeeText(master) {
  return `${isTravelSafeInternational(master) ? "USD" : "IDR"} ${formatRupiah(getTravelSafeAssistanceFee(master))}`;
}

function getTravelSafeComputed(master) {
  const criteria = master?.npCriteria || "antara";
  const lockedCurrency = getTravelSafeLockedCurrency(master);
  const currencyCode = getLifeGuardCurrencyCode(lockedCurrency);
  const coverageText = getTravelSafeCoverageText(master);
  const accidentMin = parseNumber(master?.npAccidentLimitMin || "0");
  const accidentMax = parseNumber(master?.npAccidentLimitMax || "0");
  const accidentRate = parseFlexibleNumber(master?.npAccidentRate || "0");
  const medicalPercent = parseFlexibleNumber(master?.npMedicalPercentage || "0");
  const medicalRate = parseFlexibleNumber(master?.npMedicalRate || "0");
  const medicalMin = Math.round(accidentMin * (medicalPercent / 100));
  const medicalMax = Math.round(accidentMax * (medicalPercent / 100));
  const accidentPremiumMin = Math.round(accidentMin * (accidentRate / 100));
  const accidentPremiumMax = Math.round(accidentMax * (accidentRate / 100));
  const medicalPremiumMin = Math.round(medicalMin * (medicalRate / 100));
  const medicalPremiumMax = Math.round(medicalMax * (medicalRate / 100));

  const formatBenefit = (min, max) => {
    if (criteria === "setara") return `${currencyCode} ${formatRupiah(min)}`;
    if (criteria === "lebih_besar") return `> ${currencyCode} ${formatRupiah(min)}`;
    if (criteria === "kurang_dari") return `< ${currencyCode} ${formatRupiah(min)}`;
    return `${currencyCode} ${formatRupiah(min)} - ${formatRupiah(max)}`;
  };

  const activeBenefitRows = TRAVEL_SAFE_EXTENSION_LIBRARY.flatMap((category) =>
    category.items
      .filter((item) => master?.perluasanSelections?.[item.id]?.checked)
      .map((item) => {
        const selection = master?.perluasanSelections?.[item.id] || {};
        const hpMin = parseNumber(selection.hpMin || "0");
        const hpMax = parseNumber(selection.hpMax || "0");
        const rate = parseFlexibleNumber(selection.rate || "0");
        const premiumMin = item.isCheckOnly ? 0 : Math.round(hpMin * (rate / 100));
        const premiumMax = item.isCheckOnly ? 0 : Math.round(hpMax * (rate / 100));
        return {
          id: item.id,
          category: category.title,
          label: item.label,
          isCheckOnly: Boolean(item.isCheckOnly),
          limitText: item.isCheckOnly ? "-" : formatBenefit(hpMin, hpMax),
          rateText: item.isCheckOnly ? "-" : `${selection.rate || "0"}%`,
          premiumText: item.isCheckOnly ? "-" : formatBenefit(premiumMin, premiumMax),
          premiumMin,
          premiumMax,
        };
      })
  );

  const extensionPremiumMin = activeBenefitRows.reduce((sum, item) => sum + item.premiumMin, 0);
  const extensionPremiumMax = activeBenefitRows.reduce((sum, item) => sum + item.premiumMax, 0);
  const assistanceFee = master?.assistanceEnabled ? getTravelSafeAssistanceFee(master) : 0;
  const totalPremiumMin = accidentPremiumMin + medicalPremiumMin + extensionPremiumMin + assistanceFee;
  const totalPremiumMax = accidentPremiumMax + medicalPremiumMax + extensionPremiumMax + assistanceFee;

  return {
    criteria,
    lockedCurrency,
    currencyCode,
    coverageText,
    coverageCount: Array.isArray(master?.coverageCodes) ? master.coverageCodes.length : 0,
    assistanceEnabled: Boolean(master?.assistanceEnabled),
    assistanceFee,
    assistanceFeeText: master?.assistanceEnabled ? getTravelSafeAssistanceFeeText(master) : "Tidak aktif",
    accidentText: formatBenefit(accidentMin, accidentMax),
    medicalText: formatBenefit(medicalMin, medicalMax),
    accidentRateText: master?.npAccidentRate ? `${master.npAccidentRate}%` : "-",
    medicalRateText: master?.npMedicalRate ? `${master.npMedicalRate}%` : "-",
    accidentPremiumText: formatBenefit(accidentPremiumMin, accidentPremiumMax),
    medicalPremiumText: formatBenefit(medicalPremiumMin, medicalPremiumMax),
    accidentPremiumMin,
    accidentPremiumMax,
    medicalPremiumMin,
    medicalPremiumMax,
    totalPremiumMin,
    totalPremiumMax,
    totalPremiumText: formatBenefit(totalPremiumMin, totalPremiumMax),
    medicalMin,
    medicalMax,
    activeBenefitRows,
    activeBenefitCount: activeBenefitRows.length,
  };
}

function buildCsvHeader(config) {
  return getPartnerFacingFields(config)
    .sort((a, b) => Number(b.rule.required) - Number(a.rule.required))
    .map((item) => item.key)
    .join(",");
}

function buildJsonTemplate(config) {
  const payload = {};
  getPartnerFacingFields(config)
    .sort((a, b) => Number(b.rule.required) - Number(a.rule.required))
    .forEach(({ key }) => {
      payload[key] = "";
    });
  return JSON.stringify(payload, null, 2);
}

function parseSamplePayload(config) {
  try {
    const raw = JSON.parse(config.data.mapping.samplePayload || "{}");
    if (Array.isArray(raw)) return raw[0] || {};
    if (raw && typeof raw === "object") return raw;
    return {};
  } catch {
    return null;
  }
}

function buildNormalizedPreview(config) {
  const sample = parseSamplePayload(config);
  const normalized = {
    partner_policy_ref: config.data.blueprint.primaryKey && sample && sample[config.data.blueprint.primaryKey]
      ? sample[config.data.blueprint.primaryKey]
      : "",
    insured_code: config.data.blueprint.insuredCode || "",
    master_policy_no: config.data.master.masterPolicyNo || "",
    product_code: config.data.master.productCode || "",
  };

  (config.data.mapping.rows || []).forEach((row) => {
    if (!row.target) return;
    const sourceValue =
      sample && row.sourceField in sample
        ? sample[row.sourceField]
        : row.sampleValue;
    normalized[row.target] = applyTransforms(sourceValue, row.transform);
  });

  return normalized;
}

function getMissingRequiredTargets(config) {
  const mapped = new Set(getUniqueMappedTargets(config));
  return getRequiredTargets(config).filter((key) => !mapped.has(key));
}

function getPendingItems(config) {
  const items = [];
  const blueprint = config.data.blueprint;
  const master = config.data.master;
  const mapping = config.data.mapping;
  const review = config.data.review;
  const rules = getOperationalFieldRules(config);
  const partnerFacing = getPartnerFacingFields(config);
  const missingTargets = getMissingRequiredTargets(config);
  const sample = parseSamplePayload(config);

  if (config.family === "group-pa") {
    if (!config.title) items.push("Nama konfigurasi belum diisi.");
    if (!blueprint.insuredCode) items.push("Kode tertanggung belum diisi.");
    if (!blueprint.correspondenceEmail && !blueprint.ownerEmail) items.push("Email korespondensi belum diisi.");
    if (!master.masterPolicyNo) items.push("Nomor polis induk / nomor PKS belum diisi.");
    if (!master.coverageType) items.push("Jenis pertanggungan belum dipilih.");
    if (!master.npAMin || !master.baseRate) items.push("Nilai pertanggungan atau rate premi belum lengkap.");
    if (!master.clausePackage?.length) items.push("Minimal satu klausula harus aktif.");
    if (!master.wordingType) items.push("Tipe wording belum dipilih.");
    if (!review.checklist.documentBound) items.push("Dokumen PKS / wording belum ditandai terikat.");
    if (!review.checklist.syncReady) items.push("Konfigurasi belum ditandai siap diproses.");
    return items;
  }

  if (config.family === "travel-group") {
    if (!config.title) items.push("Nama konfigurasi belum diisi.");
    if (!blueprint.insuredCode) items.push("Kode tertanggung belum diisi.");
    if (!blueprint.acquisitionCode) items.push("Kode akuisisi belum dipilih.");
    if (!blueprint.correspondenceEmail && !blueprint.ownerEmail) items.push("Email korespondensi belum diisi.");
    if (!master.masterPolicyNo) items.push("Nomor polis induk / PKS belum diisi.");
    if (!(master.coverageCodes || []).length) items.push("Jenis pertanggungan travel belum dipilih.");
    if (!master.npAccidentLimitMin || !master.npAccidentRate) items.push("Limit manfaat utama atau rate premi dasar belum lengkap.");
    if (!master.wordingType) items.push("Tipe wording belum dipilih.");
    if (!review.checklist.documentBound) items.push("Dokumen PKS / wording belum ditandai terikat.");
    if (!review.checklist.syncReady) items.push("Konfigurasi belum ditandai siap diproses.");
    return items;
  }

  if (config.family === "health-group") {
    if (!config.title) items.push("Nama konfigurasi belum diisi.");
    if (!blueprint.insuredCode) items.push("Kode tertanggung belum diisi.");
    if (!blueprint.acquisitionCode) items.push("Kode akuisisi belum dipilih.");
    if (!blueprint.correspondenceEmail && !blueprint.ownerEmail) items.push("Email korespondensi belum diisi.");
    if (!master.masterPolicyNo) items.push("Nomor polis induk / PKS belum diisi.");
    if (!master.coverageType) items.push("Jenis pertanggungan belum dipilih.");
    if (!master.clausePackage?.length) items.push("Minimal satu klausul harus aktif.");
    if (!master.wordingType) items.push("Tipe wording belum dipilih.");
    if (!review.checklist.documentBound) items.push("Dokumen PKS / wording belum ditandai terikat.");
    if (!review.checklist.syncReady) items.push("Konfigurasi belum ditandai siap diproses.");
    return items;
  }

  if (!config.title) items.push("Nama konfigurasi belum diisi.");
  if (!config.partnerName) items.push("Nama partner belum lengkap.");
  if (!blueprint.agreementNo) items.push("Nomor PKS / kerjasama belum diisi.");
  if (!blueprint.insuredCode) items.push("Kode tertanggung belum diisi.");
  if (!blueprint.ownerEmail) items.push("Email owner proses belum diisi.");
  if (!master.productCode || !master.productName) items.push("Kode produk atau nama produk induk belum lengkap.");
  if (!master.masterPolicyNo) items.push("Nomor polis induk / PKS untuk master policy belum diisi.");
  if (!master.plan || !master.sumInsured || !master.baseRate) items.push("Plan, nilai pertanggungan, atau rate dasar belum lengkap.");
  if (!master.clausePackage?.length) items.push("Minimal satu clause package harus aktif.");
  if (!review.checklist.documentBound) items.push("Dokumen PKS / wording belum ditandai terikat.");
  if (!review.checklist.syncReady) items.push("Konfigurasi belum ditandai siap diproses.");
  return items;
}

function getReadiness(config) {
  const checks = [];
  const blueprint = config.data.blueprint;
  const master = config.data.master;
  const mapping = config.data.mapping;
  const review = config.data.review;
  const rules = getOperationalFieldRules(config);

  if (config.family === "group-pa") {
    checks.push(Boolean(config.title));
    checks.push(Boolean(config.partnerName));
    checks.push(Boolean(blueprint.insuredCode));
    checks.push(Boolean(blueprint.correspondenceEmail || blueprint.ownerEmail));
    checks.push(Boolean(master.masterPolicyNo));
    checks.push(Boolean(master.coverageType));
    checks.push(Boolean(master.npAMin));
    checks.push(Boolean(master.baseRate));
    checks.push(Boolean(master.clausePackage?.length));
    checks.push(Boolean(master.wordingType));
    checks.push(Boolean(review.checklist.documentBound));
    checks.push(Boolean(review.checklist.syncReady));
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }

  if (config.family === "travel-group") {
    checks.push(Boolean(config.title));
    checks.push(Boolean(config.partnerName));
    checks.push(Boolean(blueprint.insuredCode));
    checks.push(Boolean(blueprint.acquisitionCode));
    checks.push(Boolean(blueprint.correspondenceEmail || blueprint.ownerEmail));
    checks.push(Boolean(master.masterPolicyNo));
    checks.push(Boolean((master.coverageCodes || []).length));
    checks.push(Boolean(master.npAccidentLimitMin));
    checks.push(Boolean(master.npAccidentRate));
    checks.push(Boolean(master.wordingType));
    checks.push(Boolean(review.checklist.documentBound));
    checks.push(Boolean(review.checklist.syncReady));
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }

  if (config.family === "health-group") {
    checks.push(Boolean(config.title));
    checks.push(Boolean(config.partnerName));
    checks.push(Boolean(blueprint.insuredCode));
    checks.push(Boolean(blueprint.acquisitionCode));
    checks.push(Boolean(blueprint.correspondenceEmail || blueprint.ownerEmail));
    checks.push(Boolean(master.masterPolicyNo));
    checks.push(Boolean(master.coverageType));
    checks.push(Boolean(master.clausePackage?.length));
    checks.push(Boolean(master.wordingType));
    checks.push(Boolean(review.checklist.documentBound));
    checks.push(Boolean(review.checklist.syncReady));
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }

  checks.push(Boolean(config.title));
  checks.push(Boolean(config.partnerName));
  checks.push(Boolean(blueprint.agreementNo));
  checks.push(Boolean(blueprint.insuredCode));
  checks.push(Boolean(blueprint.ownerEmail));
  checks.push(Boolean(master.productCode));
  checks.push(Boolean(master.productName));
  checks.push(Boolean(master.masterPolicyNo));
  checks.push(Boolean(master.plan));
  checks.push(Boolean(master.sumInsured));
  checks.push(Boolean(master.baseRate));
  checks.push(Boolean(master.clausePackage?.length));
  checks.push(Boolean(review.checklist.documentBound));
  checks.push(Boolean(review.checklist.syncReady));
  checks.push(Boolean(review.checklist.mappingReviewed));
  checks.push(Boolean(review.checklist.documentBound));
  checks.push(Boolean(review.checklist.partnerUat));
  checks.push(Boolean(review.checklist.syncReady));

  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

function getMappingCoverage(config) {
  return getUniqueMappedTargets(config).length;
}

function getFamilyMeta(id) {
  return PRODUCT_FAMILIES.find((item) => item.id === id) || PRODUCT_FAMILIES[1];
}

function getPortalCardMeta(family) {
  return PORTAL_PRODUCT_CARDS.find((item) => item.family === family) || PORTAL_PRODUCT_CARDS[0];
}

function fixDisplayText(value) {
  return String(value || "")
    .replace(/Ã¢â‚¬Â¢/g, "-")
    .replace(/Ã¢â‚¬â€œ/g, "-")
    .replace(/Ã¢â‚¬Â°/g, "â€°");
}

function getRoleLabel(role) {
  if (role === "Maker") return "ROM (Maker)";
  if (role === "Checker") return "Admin UDW (Checker)";
  if (role === "Approval") return "HO UDW (Approval)";
  return "Pilih Peran";
}

function getAccountMeta(role) {
  if (role === "Maker") {
    return { name: "Bobby (ROM)", initials: "BO" };
  }
  if (role === "Checker") {
    return { name: "Resdy (UDW)", initials: "RE" };
  }
  if (role === "Approval") {
    return { name: "Ridho (HO)", initials: "RI" };
  }
  return { name: "Akun Internal", initials: "AI" };
}

function getLifeGuardStatusMeta(status) {
  if (status === "Checker") {
    return { label: "CHECKER (UDW)", badge: "bg-blue-50 text-blue-700 border-blue-200", step: 2 };
  }
  if (status === "Approval") {
    return { label: "APPROVAL (HO)", badge: "bg-indigo-50 text-indigo-700 border-indigo-200", step: 3 };
  }
  if (status === "Active") {
    return { label: "AKTIF (POLIS TERBIT)", badge: "bg-green-50 text-green-700 border-green-200", step: 3 };
  }
  return { label: "DRAFT", badge: "bg-yellow-50 text-yellow-700 border-yellow-200", step: 1 };
}

function getLifeGuardRoleMeta(role) {
  if (role === "Checker") {
    return { label: "ADMIN UDW (CHECKER)", shortLabel: "Admin UDW (Checker)", avatar: "UW", actor: "UDW", tone: "bg-orange-500" };
  }
  if (role === "Approval") {
    return { label: "HO UDW (APPROVAL)", shortLabel: "HO UDW (Approval)", avatar: "HO", actor: "HO", tone: "bg-emerald-600" };
  }
  return { label: "ROM (MAKER)", shortLabel: "ROM (Maker)", avatar: "RM", actor: "ROM", tone: "bg-[#004d7a]" };
}

function getLifeGuardReviewField(role) {
  if (role === "Checker") return "checkerNote";
  if (role === "Approval") return "approvalNote";
  return "makerNote";
}

function getLifeGuardNoteLabel(role) {
  if (role === "Checker") return "Analisa Reviewer (Admin UDW)";
  if (role === "Approval") return "Analisa Persetujuan (HO)";
  return "Analisa Maker (ROM)";
}

function getLifeGuardReferenceCode(config) {
  const productCode = config?.data?.master?.productCode || "705";
  const partnerCode = (config?.data?.blueprint?.partnerCode || "MOMO").toUpperCase();
  const year = (config?.data?.blueprint?.startDate || "").slice(0, 4) || "2026";
  return `C-${productCode}-${partnerCode}-${year}-001`;
}

function getLifeGuardTotalDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "-";
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "Range Salah";
  return `${diff} Hari`;
}

function getLifeGuardSelectedClauseList(master) {
  const libraryTitles = new Set(LIFE_GUARD_ADDITIONAL_CLAUSE_LIBRARY.map((item) => item.title));
  const customTitles = (master?.customClauses || []).map((item) => item.title);
  return Array.from(
    new Set(
      (master?.clausePackage || []).filter((item) => libraryTitles.has(item) || customTitles.includes(item))
    )
  ).sort((a, b) => a.localeCompare(b));
}

function createMappingRow(sourceField = "", target = "", sampleValue = "", transform = "trim") {
  return {
    id: uid("map"),
    sourceField,
    target,
    sampleValue,
    transform,
    required: false,
  };
}

function generateFieldRulesForFamily(family) {
  const fields = {
    partner_policy_ref: makeDefaultFieldRule("partner_policy_ref", true),
  };
  (FAMILY_REQUIRED_TARGETS[family] || []).forEach((key) => {
    fields[key] = makeDefaultFieldRule(key, true);
  });
  return fields;
}

function blankSampleByFamily(family) {
  if (family === "group-pa") {
    return JSON.stringify(
      {
        partner_policy_ref: "MOMO-BATCH-001",
        student_name: "Budi Santoso",
        student_id: "SMP1001",
        dob: "2012-02-11",
        start_date: "2026-07-01",
        cert_no: "CERT-0001",
        class_room: "8A",
      },
      null,
      2
    );
  }
  if (family === "health-group") {
    return JSON.stringify(
      {
        partner_policy_ref: "TRIP-001",
        participant_name: "Dewi Maharani",
        birth_date: "1995-10-01",
        effective_date: "2026-08-01",
        cert_no: "TRG-0001",
        plan: "DOMESTIC",
      },
      null,
      2
    );
  }
  if (family === "property-group") {
    return JSON.stringify(
      {
        partner_policy_ref: "GNS-LOC-01",
        location_code: "GNS-JKT-01",
        location_name: "Showroom Kelapa Gading",
        effective_date: "2026-02-01",
        certificate_number: "DEA-001",
        tsi: "1500000000",
        premium: "125000",
      },
      null,
      2
    );
  }
  return JSON.stringify(
    {
      partner_policy_ref: "TRIP-001",
      participant_name: "Dewi Maharani",
      birth_date: "1995-10-01",
      effective_date: "2026-08-01",
      cert_no: "TRV-0001",
      plan: "DOMESTIC",
    },
    null,
    2
  );
}

const LIFE_GUARD_STARTER_BLUEPRINT = {
  agreementNo: "P-MOMO-2026-001",
  insuredCode: "009281",
  partnerCode: "MOMO",
  acquisitionCode: "110 - PS Perusahaan",
  phoneNumber: "081234567891",
  ownerEmail: "admin@momotrip.co.id",
  correspondenceEmail: "admin@momotrip.co.id",
  insuredName: "PT MOMOTRIP AXIA INDONESIA",
  npwp: "01.234.567.8-901.000",
  address: "Gedung Cyber 2, Lt. 15, Jl. HR Rasuna Said Blok X-5, Jakarta Selatan",
  picList: "",
  qqTambahan: "",
  startDate: "2026-01-01",
  endDate: "2027-01-01",
  channels: ["partner-portal", "internal-assisted"],
  integrationMode: "CSV Upload",
  syncTarget: "STAR Core Registry",
  starCheckMode: "AUTO_CHECK",
  ifExists: "ENDORSEMENT",
  ifMissing: "CREATE_NEW",
  endpoint: "/partner/momotrip/life-guard/upload",
  primaryKey: "partner_policy_ref",
};

const LIFE_GUARD_STARTER_MASTER = {
  productFamily: "PA Kumpulan",
  productCode: "705",
  productName: "705 Kecelakaan Diri",
  masterPolicyNo: "P-MOMO-2026-001",
  plan: "General",
  sumInsured: "",
  baseRate: "1,50",
  adminFee: "5.000",
  clausePackage: [
    "Meninggal Dunia karena Kecelakaan",
    "Cacat Tetap Total / Sebagian",
    "Biaya Pengobatan Akibat Kecelakaan",
    "Klausul Usia",
  ],
  benefitSummary: "Meninggal dunia, cacat tetap, dan biaya pengobatan akibat kecelakaan.",
  coverageType: "70501 - KECELAKAAN DIRI",
  npCriteria: "antara",
  currencyCode: "101 - RP.",
  npAMin: "100.000.000",
  npAMax: "250.000.000",
  npBPercent: "100",
  npCPercent: "10",
  ageMin: "19",
  ageMax: "63",
  riskClass: "Kelas III",
  riskExposure: "Tersebar",
  deductible: "",
  wordingType: "PSAKDI",
  printDocumentType: "Ikhtisar",
  additionalClauseTitle: "",
  additionalClauseDescription: "",
  customClauses: [],
  discountPercent: "0",
  commissionPercent: "15",
  stampDuty: "Sesuai STAR",
};

const LIFE_GUARD_STARTER_SAMPLE_PAYLOAD = {
  partner_policy_ref: "P-MOMO-2026-001",
  participant_name: "Budi Santoso",
  member_id: "LG0001",
  birth_date: "1990-02-11",
  effective_date: "2026-01-01",
  certificate_no: "LG-CERT-0001",
  unit_name: "GENERAL",
};

const TRAVEL_SAFE_STARTER_BLUEPRINT = {
  ...LIFE_GUARD_STARTER_BLUEPRINT,
  integrationMode: "Portal Form",
  endpoint: "/partner/momotrip/travel-safe/upload",
};

const TRAVEL_SAFE_STARTER_MASTER = {
  productFamily: "Travel Kumpulan",
  productCode: "794",
  productName: "Travel Safe",
  masterPolicyNo: "P-MOMO-2026-001",
  plan: "International",
  sumInsured: "",
  baseRate: "0,15",
  adminFee: "5.000",
  clausePackage: [],
  benefitSummary: "Perlindungan perjalanan grup dengan manfaat dasar, medis, dan perluasan travel inconvenience.",
  coverageType: "79402 - INTERNATIONAL NON SCHENGEN",
  coverageCodes: ["79402"],
  npCriteria: "antara",
  currencyCode: "201 - US.$.",
  npAccidentLimitMin: "100.000",
  npAccidentLimitMax: "200.000",
  npAccidentRate: "0,15",
  npMedicalPercentage: "50",
  npMedicalLimitMin: "50.000",
  npMedicalLimitMax: "100.000",
  npMedicalRate: "0,10",
  npMedicalPremiMin: "50",
  npMedicalPremiMax: "100",
  deductible: "10% dari nilai klaim yang disetujui, minimum USD 25 per kejadian.",
  assistanceEnabled: true,
  wordingType: TRAVEL_SAFE_WORDING_LABEL,
  printDocumentType: "",
  additionalClauseTitle: "",
  additionalClauseDescription: "",
  customClauses: [],
  discountPercent: "0",
  commissionPercent: "15",
  stampDuty: "Sesuai STAR",
  perluasanSelections: JSON.parse(JSON.stringify(TRAVEL_SAFE_STARTER_PERLUASAN)),
};

const TRAVEL_SAFE_STARTER_SAMPLE_PAYLOAD = {
  partner_policy_ref: "P-MOMO-2026-001",
  participant_name: "Dewi Maharani",
  birth_date: "1995-10-01",
  effective_date: "2026-08-01",
  cert_no: "TRV-0001",
  plan: "INTL-SCHENGEN",
};

function buildLifeGuardStarterMappingRows() {
  return [
    createMappingRow("partner_policy_ref", "partner_policy_ref", "P-MOMO-2026-001", "trim|upper"),
    createMappingRow("participant_name", "participant_name", "Budi Santoso", "trim|title"),
    createMappingRow("member_id", "partner_member_id", "LG0001", "trim|upper"),
    createMappingRow("birth_date", "birth_date", "1990-02-11", "trim"),
    createMappingRow("effective_date", "effective_date", "2026-01-01", "trim"),
    createMappingRow("certificate_no", "certificate_no", "LG-CERT-0001", "trim|upper"),
    createMappingRow("unit_name", "class_room", "GENERAL", "trim|upper"),
  ];
}

function buildLifeGuardStarterFieldRules() {
  const fields = generateFieldRulesForFamily("group-pa");
  return {
    ...fields,
    participant_name: { active: true, required: true, source: "Partner", editable: "Locked", defaultValue: "" },
    partner_member_id: { active: true, required: true, source: "Partner", editable: "Locked", defaultValue: "" },
    birth_date: { active: true, required: true, source: "Partner", editable: "Locked", defaultValue: "" },
    effective_date: { active: true, required: true, source: "Partner", editable: "Locked", defaultValue: "" },
    certificate_no: { active: true, required: true, source: "Partner", editable: "Locked", defaultValue: "" },
    class_room: { active: true, required: true, source: "Partner", editable: "Partner Can Override", defaultValue: "" },
    plan_code: { active: true, required: false, source: "Master Policy", editable: "Internal Only", defaultValue: "GENERAL" },
    sum_insured: { active: true, required: false, source: "Master Policy", editable: "Internal Only", defaultValue: "" },
  };
}

function buildTravelSafeStarterMappingRows() {
  return [
    createMappingRow("partner_policy_ref", "partner_policy_ref", "P-MOMO-2026-001", "trim|upper"),
    createMappingRow("participant_name", "participant_name", "Dewi Maharani", "trim|title"),
    createMappingRow("birth_date", "birth_date", "1995-10-01", "trim"),
    createMappingRow("effective_date", "effective_date", "2026-08-01", "trim"),
    createMappingRow("cert_no", "certificate_no", "TRV-0001", "trim|upper"),
    createMappingRow("plan", "plan_code", "INTL-SCHENGEN", "trim|upper"),
  ];
}

function buildTravelSafeStarterFieldRules() {
  const fields = generateFieldRulesForFamily("travel-group");
  return {
    ...fields,
    participant_name: { active: true, required: true, source: "Partner", editable: "Locked", defaultValue: "" },
    birth_date: { active: true, required: true, source: "Partner", editable: "Locked", defaultValue: "" },
    effective_date: { active: true, required: true, source: "Partner", editable: "Locked", defaultValue: "" },
    certificate_no: { active: true, required: true, source: "Partner", editable: "Locked", defaultValue: "" },
    plan_code: { active: true, required: true, source: "Partner", editable: "Locked", defaultValue: "INTL-SCHENGEN" },
  };
}

function applyLifeGuardStarterConfig(config) {
  if (!config || config.family !== "group-pa") return config;
  config.partnerName = "PT MOMOTRIP AXIA INDONESIA";
  config.productName = "705 Kecelakaan Diri";
  config.data.blueprint = {
    ...config.data.blueprint,
    ...LIFE_GUARD_STARTER_BLUEPRINT,
  };
  config.data.master = {
    ...config.data.master,
    ...LIFE_GUARD_STARTER_MASTER,
  };
  config.data.mapping = {
    ...config.data.mapping,
    sourceKind: "CSV",
    samplePayload: JSON.stringify(LIFE_GUARD_STARTER_SAMPLE_PAYLOAD, null, 2),
    rows: buildLifeGuardStarterMappingRows(),
  };
  config.data.realisasi = {
    ...config.data.realisasi,
    notes: "Partner cukup kirim 6 field dasar. Manfaat, rate, dan biaya polis mengikuti master policy Life Guard 705.",
    fields: buildLifeGuardStarterFieldRules(),
  };
  return config;
}

function applyTravelSafeStarterConfig(config) {
  if (!config || config.family !== "travel-group") return config;
  config.partnerName = "PT MOMOTRIP AXIA INDONESIA";
  config.productName = "Travel Safe";
  config.data.blueprint = {
    ...config.data.blueprint,
    ...TRAVEL_SAFE_STARTER_BLUEPRINT,
  };
  config.data.master = {
    ...config.data.master,
    ...TRAVEL_SAFE_STARTER_MASTER,
    perluasanSelections: JSON.parse(JSON.stringify(TRAVEL_SAFE_STARTER_PERLUASAN)),
  };
  config.data.mapping = {
    ...config.data.mapping,
    sourceKind: "JSON",
    samplePayload: JSON.stringify(TRAVEL_SAFE_STARTER_SAMPLE_PAYLOAD, null, 2),
    rows: buildTravelSafeStarterMappingRows(),
  };
  config.data.realisasi = {
    ...config.data.realisasi,
    notes: "Partner mengirim data peserta, tanggal efektif, nomor sertifikat, dan plan perjalanan untuk penerbitan Travel Safe.",
    fields: buildTravelSafeStarterFieldRules(),
  };
  return config;
}

function applyProductStarterConfig(config) {
  applyLifeGuardStarterConfig(config);
  applyTravelSafeStarterConfig(config);
  return config;
}

function createBlankConfig(family = "group-pa") {
  return {
    id: uid("cfg"),
    family,
    title: "Konfigurasi Baru",
    partnerName: "Partner Baru",
    productName: "Produk Baru",
    version: "v0.1",
    status: "Draft",
    owner: "Process Owner",
    updatedAt: nowLabel(),
    data: {
      blueprint: {
        agreementNo: "",
        insuredCode: "",
        partnerCode: "",
        acquisitionCode: "110 - PS Perusahaan",
        phoneNumber: "",
        ownerEmail: "",
        correspondenceEmail: "",
        insuredName: "",
        npwp: "",
        address: "",
        picList: "",
        qqTambahan: "",
        startDate: "",
        endDate: "",
        channels: ["partner-portal"],
        integrationMode: "CSV Upload",
        syncTarget: "STAR Core Registry",
        starCheckMode: "AUTO_CHECK",
        ifExists: "ENDORSEMENT",
        ifMissing: "CREATE_NEW",
        endpoint: "",
        primaryKey: "partner_policy_ref",
        notes: "",
      },
      master: {
        productFamily: getFamilyMeta(family).label,
        productCode: "",
        productName: "",
        masterPolicyNo: "",
        plan: "",
        sumInsured: "",
        baseRate: "",
        adminFee: "",
        clausePackage: [],
        benefitSummary: "",
        coverageType: "",
        npCriteria: "antara",
        currencyCode: "101 - RP.",
        npAMin: "",
        npAMax: "",
        npBPercent: "100",
        npCPercent: "10",
        ageMin: "",
        ageMax: "",
        riskClass: "Kelas III",
        riskExposure: "Tersebar",
        deductible: "",
        wordingType: "PSAKDI",
        printDocumentType: "Ikhtisar",
        additionalClauseTitle: "",
        additionalClauseDescription: "",
        customClauses: [],
        discountPercent: "0",
        commissionPercent: "15",
        stampDuty: "Sesuai STAR",
      },
      mapping: {
        sourceKind: "JSON",
        samplePayload: blankSampleByFamily(family),
        rows: [],
      },
      realisasi: {
        notes: "",
        fields: generateFieldRulesForFamily(family),
      },
      review: {
        makerNote: "",
        checkerNote: "",
        approvalNote: "",
        checklist: {
          mappingReviewed: false,
          documentBound: false,
          partnerUat: false,
          syncReady: false,
        },
      },
    },
    audit: [{ at: nowLabel(), actor: "SYSTEM", action: "Draft konfigurasi baru dibuat." }],
  };
}

function cloneConfig(config) {
  const copy = JSON.parse(JSON.stringify(config));
  return {
    ...copy,
    id: uid("cfg"),
    title: `${config.title} Copy`,
    version: "v0.1",
    status: "Draft",
    updatedAt: nowLabel(),
    audit: [{ at: nowLabel(), actor: "SYSTEM", action: "Konfigurasi diduplikasi dari konfigurasi lain." }],
  };
}

const LIFE_GUARD_SEED_CONFIG = {
  id: "cfg-momo-705",
  family: "group-pa",
  title: "Momotrip - Life Guard 705",
  partnerName: "PT MOMOTRIP AXIA INDONESIA",
  productName: "705 Kecelakaan Diri",
  version: "v1.4",
  status: "Draft",
  owner: "ROM Jakarta 1",
  updatedAt: "11 Apr 2026, 09.20",
  data: {
    blueprint: {
      notes: "Konfigurasi general partner 705 mengikuti referensi Life Guard dari partner portal.",
    },
    master: {},
    mapping: {},
    realisasi: {},
    review: {
      makerNote: "Isian Life Guard sudah disesuaikan dengan referensi partner untuk review checker.",
      checkerNote: "",
      approvalNote: "",
      checklist: {
        mappingReviewed: true,
        documentBound: true,
        partnerUat: false,
        syncReady: false,
      },
    },
  },
  audit: [
    { at: "11 Apr 2026, 09.20", actor: "ROM", action: "Draft konfigurasi dibuat." },
    { at: "11 Apr 2026, 09.36", actor: "ROM", action: "Isian Life Guard diselaraskan dengan referensi partner 705 general." },
  ],
};

applyLifeGuardStarterConfig(LIFE_GUARD_SEED_CONFIG);

const SEED_CONFIGS = [
  LIFE_GUARD_SEED_CONFIG,
  {
    id: "cfg-spn-health",
    family: "health-group",
    title: "Momotrip - Trip Guard",
    partnerName: "PT Momotrip Axia Indonesia",
    productName: "Trip Guard",
    version: "v2.1",
    status: "Checker",
    owner: "ROM Trip Guard",
    updatedAt: "10 Apr 2026, 16.10",
    data: {
      blueprint: {
        agreementNo: "PKS-TRIP-2026-014",
        insuredCode: "009281",
        partnerCode: "MOMO",
        acquisitionCode: "110 - PS Perusahaan",
        phoneNumber: "081234567891",
        ownerEmail: "admin@momotrip.co.id",
        correspondenceEmail: "admin@momotrip.co.id",
        insuredName: "PT MOMOTRIP AXIA INDONESIA",
        npwp: "01.234.567.8-901.000",
        address: "Gedung Cyber 2, Lt. 15, Jl. HR Rasuna Said Blok X-5, Jakarta Selatan",
        qqTambahan: "",
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        channels: ["partner-portal"],
        integrationMode: "Portal Form",
        syncTarget: "STAR Core Registry",
        starCheckMode: "AUTO_CHECK",
        ifExists: "ENDORSEMENT",
        ifMissing: "CREATE_NEW",
        endpoint: "/partner/momotrip/trip-guard",
        primaryKey: "partner_policy_ref",
        notes: "Konfigurasi perjalanan partner dikelola langsung dari portal internal tanpa API partner.",
      },
      master: {
        productFamily: "Perjalanan Kumpulan",
        productCode: "72801",
        productName: "Trip Guard",
        masterPolicyNo: "PKS-PA-2026-001",
        plan: "Domestic",
        sumInsured: "",
        baseRate: "",
        adminFee: "5000",
        clausePackage: ["Klausul Kegiatan Olahraga", "Klausul Usia"],
        benefitSummary: "Perlindungan perjalanan grup untuk peserta partner.",
        coverageType: "72801 - P.A PERJALANAN",
        deductible: "",
        wordingType: "PSAKDI",
        printDocumentType: "Ikhtisar",
        discountPercent: "0",
        commissionPercent: "15",
        stampDuty: "Sesuai STAR",
      },
      mapping: {
        sourceKind: "JSON",
        samplePayload: JSON.stringify(
          {
            partner_policy_ref: "TRIP-001",
            participant_name: "Dewi Maharani",
            birth_date: "1995-10-01",
            effective_date: "2026-08-01",
            cert_no: "TRG-0001",
            plan: "DOMESTIC",
          },
          null,
          2
        ),
        rows: [
          createMappingRow("partner_policy_ref", "partner_policy_ref", "TRIP-001", "trim|upper"),
          createMappingRow("participant_name", "participant_name", "Dewi Maharani", "trim|title"),
          createMappingRow("birth_date", "birth_date", "1995-10-01", "trim"),
          createMappingRow("effective_date", "effective_date", "2026-08-01", "trim"),
          createMappingRow("cert_no", "certificate_no", "TRG-0001", "trim|upper"),
          createMappingRow("plan", "plan_code", "DOMESTIC", "trim|upper"),
        ],
      },
      realisasi: {
        notes: "Partner cukup kirim data peserta perjalanan. Nomor sertifikat wajib dibawa dari partner.",
        fields: {
          participant_name: { active: true, required: true, source: "Partner", editable: "Locked", defaultValue: "" },
          birth_date: { active: true, required: true, source: "Partner", editable: "Locked", defaultValue: "" },
          effective_date: { active: true, required: true, source: "Partner", editable: "Locked", defaultValue: "" },
          plan_code: { active: true, required: true, source: "Partner", editable: "Locked", defaultValue: "" },
          certificate_no: { active: true, required: true, source: "Partner", editable: "Locked", defaultValue: "" },
        },
      },
      review: {
        makerNote: "Konfigurasi perjalanan partner sudah siap untuk review checker.",
        checkerNote: "Mohon cek wording dan klausula sebelum approval.",
        approvalNote: "",
        checklist: {
          mappingReviewed: true,
          documentBound: true,
          partnerUat: false,
          syncReady: false,
        },
      },
    },
    audit: [
      { at: "09 Apr 2026, 13.20", actor: "ROM", action: "Konfigurasi dibuat dari template Trip Guard." },
      { at: "10 Apr 2026, 15.58", actor: "ROM", action: "Dikirim ke checker." },
    ],
  },
  {
    id: "cfg-momo-travel",
    family: "travel-group",
    title: "Momotrip - Travel Safe",
    partnerName: "PT MOMOTRIP AXIA INDONESIA",
    productName: "Travel Safe",
    version: "v1.2",
    status: "Draft",
    owner: "ROM Travel Safe",
    updatedAt: "12 Apr 2026, 10.18",
    data: {
      blueprint: {
        notes: "Konfigurasi Travel Safe mengikuti referensi simulator travel dengan general info yang disamakan ke Life Guard 705.",
      },
      master: {},
      mapping: {},
      realisasi: {},
      review: {
        makerNote: "Travel Safe sudah diselaraskan dengan pola tampilan portal partner dan siap untuk cek checker.",
        checkerNote: "",
        approvalNote: "",
        checklist: {
          mappingReviewed: true,
          documentBound: true,
          partnerUat: false,
          syncReady: false,
        },
      },
    },
    audit: [
      { at: "12 Apr 2026, 09.42", actor: "ROM", action: "Draft konfigurasi Travel Safe dibuat." },
      { at: "12 Apr 2026, 10.18", actor: "ROM", action: "General info dan summary Travel Safe diselaraskan dengan pola Life Guard." },
    ],
  },
  {
    id: "cfg-gns-property",
    family: "property-group",
    title: "Garasi Niaga â€¢ Dealer Blanket",
    partnerName: "PT Garasi Niaga Sentosa",
    productName: "Dealer Asset Blanket",
    version: "v1.0",
    status: "Approval",
    owner: "ROM Property",
    updatedAt: "09 Apr 2026, 11.40",
    data: {
      blueprint: {
        agreementNo: "PKS-GNS-2026-002",
        insuredCode: "007451",
        partnerCode: "GNS",
        acquisitionCode: "300 - Broker",
        phoneNumber: "081234567892",
        ownerEmail: "property.ops@jasindo.co.id",
        startDate: "2026-02-01",
        endDate: "2027-01-31",
        channels: ["partner-portal"],
        integrationMode: "Excel Upload",
        syncTarget: "STAR Core Registry",
        starCheckMode: "FORCE_EXISTING",
        ifExists: "ENDORSEMENT",
        ifMissing: "BLOCK_AND_REVIEW",
        endpoint: "/partner/gns/property/upload",
        primaryKey: "partner_policy_ref",
        notes: "Partner upload lokasi per endorsement. Business owner mengontrol mapping lokasi, TSI, dan premi.",
      },
      master: {
        productFamily: "Property Kumpulan",
        productCode: "920",
        productName: "Dealer Asset Blanket",
        masterPolicyNo: "PKS-GNS-2026-002",
        plan: "Blanket",
        sumInsured: "15000000000",
        baseRate: "0.081",
        adminFee: "50000",
        clausePackage: ["Wilayah Indonesia Saja", "Data Realisasi Dapat Diunggah Massal"],
        benefitSummary: "Bangunan, inventaris, serta endorsement per lokasi dengan kontrol nilai pertanggungan.",
      },
      mapping: {
        sourceKind: "Excel",
        samplePayload: JSON.stringify(
          {
            partner_policy_ref: "GNS-LOC-01",
            location_code: "GNS-JKT-01",
            location_name: "Showroom Kelapa Gading",
            effective_date: "2026-02-01",
            certificate_number: "DEA-001",
            tsi: "1500000000",
            premium: "125000",
          },
          null,
          2
        ),
        rows: [
          createMappingRow("partner_policy_ref", "partner_policy_ref", "GNS-LOC-01", "trim|upper"),
          createMappingRow("location_code", "location_code", "GNS-JKT-01", "trim|upper"),
          createMappingRow("effective_date", "effective_date", "2026-02-01", "trim"),
          createMappingRow("certificate_number", "certificate_no", "DEA-001", "trim|upper"),
          createMappingRow("tsi", "sum_insured", "1500000000", "digits"),
          createMappingRow("premium", "premium_amount", "125000", "digits"),
        ],
      },
      realisasi: {
        notes: "Partner hanya mengirim lokasi, tanggal efektif, nomor sertifikat, nilai pertanggungan, dan premi.",
        fields: {
          location_code: { active: true, required: true, source: "Partner", editable: "Locked", defaultValue: "" },
          effective_date: { active: true, required: true, source: "Partner", editable: "Locked", defaultValue: "" },
          certificate_no: { active: true, required: true, source: "Partner", editable: "Locked", defaultValue: "" },
          sum_insured: { active: true, required: true, source: "Partner", editable: "Locked", defaultValue: "" },
          premium_amount: { active: true, required: true, source: "Partner", editable: "Locked", defaultValue: "" },
        },
      },
      review: {
        makerNote: "Siap final review. Kontrak mapping sudah stabil.",
        checkerNote: "Sudah sesuai. Menunggu approval.",
        approvalNote: "",
        checklist: {
          mappingReviewed: true,
          documentBound: true,
          partnerUat: true,
          syncReady: true,
        },
      },
    },
    audit: [
        { at: "08 Apr 2026, 08.10", actor: "ROM", action: "Draft konfigurasi dibuat." },
      { at: "08 Apr 2026, 15.25", actor: "UDW", action: "Checker approve dan diteruskan ke approval." },
    ],
  },
];

applyTravelSafeStarterConfig(SEED_CONFIGS.find((item) => item.id === "cfg-momo-travel"));

function PartnerConfigStudio({
  initialRole = "Maker",
  role: controlledRole = null,
  onRoleChange = null,
  onExit = null,
  onOpenWorkspace = null,
  onOpenQueue = null,
  onOpenPartnerConfig = null,
  sessionName = "Taqwim (Internal)",
  sessionRoleLabel = "Internal",
}) {
  const cached = safeReadStorage();
  const urlState = safeReadUrlState();

  const [configs, setConfigs] = useState(cached?.configs || SEED_CONFIGS);
  const [familyFilter, setFamilyFilter] = useState(urlState.familyFilter || cached?.familyFilter || "all");
  const [scopeFilter, setScopeFilter] = useState(urlState.scopeFilter || cached?.scopeFilter || "all");
  const [statusFilter, setStatusFilter] = useState(urlState.statusFilter || cached?.statusFilter || "Semua");
  const [search, setSearch] = useState(urlState.search || cached?.search || "");
  const [selectedId, setSelectedId] = useState(urlState.selectedId || cached?.selectedId || null);
  const [stepIndex, setStepIndex] = useState(urlState.stepIndex ?? cached?.stepIndex ?? 0);
  const [roleState, setRoleState] = useState(cached?.role || initialRole);
  const [portalView, setPortalView] = useState(
    urlState.portalView || (cached?.portalView === "studio" && (urlState.selectedId || cached?.selectedId) ? "studio" : "catalog")
  );
  const [selectedFamily, setSelectedFamily] = useState(urlState.selectedFamily || cached?.selectedFamily || "");
  const [catalogSearch, setCatalogSearch] = useState(urlState.catalogSearch || cached?.catalogSearch || "");
  const [toast, setToast] = useState("");
  const [headerAccountMenuOpen, setHeaderAccountMenuOpen] = useState(false);
  const [lifeGuardExpanded, setLifeGuardExpanded] = useState("main-accident");
  const [travelSafeExpandedCategory, setTravelSafeExpandedCategory] = useState("cat_trv");
  const [partnerClauseExpanded, setPartnerClauseExpanded] = useState("wording:PSAKDI");
  const [lifeGuardClauseSearch, setLifeGuardClauseSearch] = useState("");
  const [lifeGuardSidebarCollapsed, setLifeGuardSidebarCollapsed] = useState(false);
  const [lifeGuardPendingAction, setLifeGuardPendingAction] = useState("");
  const role = controlledRole || roleState;

  const selectedConfig = useMemo(
    () => configs.find((item) => item.id === selectedId) || null,
    [configs, selectedId]
  );
  const accountMeta = useMemo(() => getAccountMeta(role), [role]);
  const accountMenuItems = useMemo(() => {
    const openPartnerCatalog = () => {
      setHeaderAccountMenuOpen(false);
      setSelectedId(null);
      setPortalView("catalog");
    };

    if (sessionRoleLabel === "Internal") {
      return [
        {
          label: "Ruang Kerja Saya",
          primary: true,
          onClick: () => {
            setHeaderAccountMenuOpen(false);
            if (typeof onOpenWorkspace === "function") onOpenWorkspace();
          },
        },
        {
          label: "Konfigurasi Partner",
          onClick: () => {
            if (typeof onOpenPartnerConfig === "function") {
              setHeaderAccountMenuOpen(false);
              onOpenPartnerConfig();
              return;
            }
            openPartnerCatalog();
          },
        },
      ];
    }

    return [
      {
        label: "Konfigurasi Partner",
        primary: true,
        onClick: openPartnerCatalog,
      },
    ];
  }, [onOpenPartnerConfig, onOpenQueue, onOpenWorkspace, sessionRoleLabel]);
  const selectedCardMeta = useMemo(
    () => (selectedConfig ? getPortalCardMeta(selectedConfig.family) : null),
    [selectedConfig]
  );
  const studioHeroTitle = useMemo(
    () => (selectedConfig ? getPortalCardMeta(selectedConfig.family)?.title || selectedConfig.productName || selectedConfig.title : ""),
    [selectedConfig]
  );
  const lifeGuardAdditionalClauseOptions = useMemo(() => {
    if (selectedConfig?.family !== "group-pa") return [];
    const customClauses = (selectedConfig.data.master.customClauses || []).map((item) => ({
      title: item.title,
      lob: item.lob || "Klausula Tambahan",
      custom: true,
    }));
    const query = lifeGuardClauseSearch.trim().toLowerCase();
    return [...LIFE_GUARD_ADDITIONAL_CLAUSE_LIBRARY, ...customClauses].filter((item) => {
      const haystack = `${item.title} ${item.lob}`.toLowerCase();
      return !query || haystack.includes(query);
    });
  }, [lifeGuardClauseSearch, selectedConfig]);

  const portalCards = useMemo(() => {
    const query = catalogSearch.trim().toLowerCase();
    return PORTAL_PRODUCT_CARDS.filter((item) => {
      const haystack = `${item.title} ${item.category} ${item.description}`.toLowerCase();
      return !query || haystack.includes(query);
    }).map((item) => ({
      ...item,
      configs: configs.filter((config) => config.family === item.family),
    }));
  }, [catalogSearch, configs]);

  function updateRole(nextRole) {
    if (typeof onRoleChange === "function") onRoleChange(nextRole);
    if (controlledRole == null) setRoleState(nextRole);
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        configs,
        familyFilter,
        scopeFilter,
        statusFilter,
        search,
        selectedId,
        stepIndex,
        role,
        portalView,
        selectedFamily,
        catalogSearch,
      })
    );
  }, [configs, familyFilter, scopeFilter, statusFilter, search, selectedId, stepIndex, role, portalView, selectedFamily, catalogSearch]);

  useEffect(() => {
    writeUrlState({
      familyFilter,
      scopeFilter,
      statusFilter,
      search,
      selectedId,
      stepIndex,
      portalView,
      selectedFamily,
      catalogSearch,
    });
  }, [familyFilter, scopeFilter, statusFilter, search, selectedId, stepIndex, portalView, selectedFamily, catalogSearch]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!selectedConfig || selectedConfig.family !== "travel-group") return;
    const master = selectedConfig.data.master || {};
    const needsNormalize =
      master.wordingType !== TRAVEL_SAFE_WORDING_LABEL ||
      Boolean(master.printDocumentType) ||
      Boolean((master.clausePackage || []).length);

    if (!needsNormalize) return;

    updateSelected((draft) => {
      draft.data.master = {
        ...draft.data.master,
        wordingType: TRAVEL_SAFE_WORDING_LABEL,
        printDocumentType: "",
        clausePackage: [],
      };
      return draft;
    });
  }, [selectedConfig]);

  const filteredConfigs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return configs.filter((item) => {
      const familyOk = familyFilter === "all" || item.family === familyFilter;
      const scopeOk = scopeFilter === "all" || item.data.blueprint.channels.includes(scopeFilter);
      const statusOk = statusFilter === "Semua" || item.status === statusFilter;
      const searchOk =
        !query ||
        `${item.title} ${item.partnerName} ${item.productName} ${item.data.blueprint.agreementNo} ${item.data.master.masterPolicyNo}`
          .toLowerCase()
          .includes(query);

      return familyOk && scopeOk && statusOk && searchOk;
    });
  }, [configs, familyFilter, scopeFilter, statusFilter, search]);

  const dashboard = useMemo(() => {
    const activeCount = configs.filter((item) => item.status === "Active").length;
    const readyCount = configs.filter((item) => getPendingItems(item).length === 0).length;
    const mappedFields = configs.reduce((sum, item) => sum + getMappingCoverage(item), 0);
    const partnerFacing = configs.reduce((sum, item) => sum + getPartnerFacingFields(item).length, 0);
    return { activeCount, readyCount, mappedFields, partnerFacing };
  }, [configs]);

  const stepState = useMemo(() => {
    if (!selectedConfig) return [];
    if (selectedConfig.family === "group-pa") {
      return [
        {
          done:
            Boolean(selectedConfig.title) &&
            Boolean(selectedConfig.partnerName) &&
            Boolean(selectedConfig.data.blueprint.insuredCode) &&
            Boolean(selectedConfig.data.blueprint.correspondenceEmail || selectedConfig.data.blueprint.ownerEmail) &&
            Boolean(selectedConfig.data.master.masterPolicyNo),
        },
        {
          done:
            Boolean(selectedConfig.data.master.coverageType) &&
            Boolean(selectedConfig.data.master.npAMin) &&
            Boolean(selectedConfig.data.master.baseRate),
        },
        {
          done:
            Boolean(selectedConfig.data.master.wordingType) &&
            selectedConfig.data.master.clausePackage.length > 0,
        },
        {
          done: getPendingItems(selectedConfig).length === 0,
        },
      ];
    }
    if (selectedConfig.family === "travel-group") {
      return [
        {
          done:
            Boolean(selectedConfig.title) &&
            Boolean(selectedConfig.partnerName) &&
            Boolean(selectedConfig.data.blueprint.insuredCode) &&
            Boolean(selectedConfig.data.blueprint.acquisitionCode) &&
            Boolean(selectedConfig.data.blueprint.correspondenceEmail || selectedConfig.data.blueprint.ownerEmail) &&
            Boolean(selectedConfig.data.master.masterPolicyNo),
        },
        {
          done:
            Boolean((selectedConfig.data.master.coverageCodes || []).length) &&
            Boolean(selectedConfig.data.master.npAccidentLimitMin) &&
            Boolean(selectedConfig.data.master.npAccidentRate),
        },
        {
          done: Boolean(selectedConfig.data.master.wordingType),
        },
        {
          done: getPendingItems(selectedConfig).length === 0,
        },
      ];
    }

    if (selectedConfig.family === "health-group") {
      return [
        {
          done:
            Boolean(selectedConfig.title) &&
            Boolean(selectedConfig.partnerName) &&
            Boolean(selectedConfig.data.blueprint.insuredCode) &&
            Boolean(selectedConfig.data.blueprint.acquisitionCode) &&
            Boolean(selectedConfig.data.blueprint.correspondenceEmail || selectedConfig.data.blueprint.ownerEmail) &&
            Boolean(selectedConfig.data.master.masterPolicyNo),
        },
        {
          done: Boolean(selectedConfig.data.master.coverageType),
        },
        {
          done:
            Boolean(selectedConfig.data.master.wordingType) &&
            selectedConfig.data.master.clausePackage.length > 0,
        },
        {
          done: getPendingItems(selectedConfig).length === 0,
        },
      ];
    }
    const missingTargets = getMissingRequiredTargets(selectedConfig);
    const rules = getOperationalFieldRules(selectedConfig);
    return [
      {
        done:
          Boolean(selectedConfig.title) &&
          Boolean(selectedConfig.partnerName) &&
          Boolean(selectedConfig.data.blueprint.agreementNo) &&
          Boolean(selectedConfig.data.blueprint.insuredCode) &&
          Boolean(selectedConfig.data.blueprint.ownerEmail) &&
          selectedConfig.data.blueprint.channels.length > 0 &&
          Boolean(selectedConfig.data.blueprint.primaryKey),
      },
      {
        done:
          Boolean(selectedConfig.data.master.productCode) &&
          Boolean(selectedConfig.data.master.productName) &&
          Boolean(selectedConfig.data.master.masterPolicyNo) &&
          Boolean(selectedConfig.data.master.plan) &&
          Boolean(selectedConfig.data.master.sumInsured) &&
          Boolean(selectedConfig.data.master.baseRate),
      },
      {
        done: selectedConfig.data.master.clausePackage.length > 0,
      },
      {
        done:
          selectedConfig.data.mapping.rows.length >= 4 &&
          missingTargets.length === 0 &&
          parseSamplePayload(selectedConfig) !== null &&
          getPartnerFacingFields(selectedConfig).length >= 3 &&
          Object.values(rules).filter((rule) => rule.active && rule.required).length >= 3 &&
          getPendingItems(selectedConfig).length === 0,
      },
    ];
  }, [selectedConfig]);

  const maxUnlockedStep = useMemo(() => {
    if (!selectedConfig || !stepState.length) return 0;
    let unlocked = 0;
    while (unlocked < stepState.length - 1 && stepState[unlocked]?.done) unlocked += 1;
    return Math.max(stepIndex, Math.min(unlocked, STEP_LIST.length - 1));
  }, [selectedConfig, stepIndex, stepState]);

  function updateSelected(mutator) {
    setConfigs((prev) =>
      prev.map((item) => {
        if (item.id !== selectedId) return item;
        const next = mutator(JSON.parse(JSON.stringify(item)));
        next.updatedAt = nowLabel();
        return next;
      })
    );
  }

  function patchRoot(changes) {
    updateSelected((draft) => ({ ...draft, ...changes }));
  }

  function patchSection(section, changes) {
    updateSelected((draft) => {
      draft.data[section] = {
        ...draft.data[section],
        ...changes,
      };
      return draft;
    });
  }

  function appendAudit(action, actor = role.toUpperCase(), note = "") {
    updateSelected((draft) => {
      draft.audit = [{ at: nowLabel(), actor, action, note }, ...(draft.audit || [])];
      return draft;
    });
  }

  function toggleChannel(id) {
    if (!selectedConfig) return;
    const channels = selectedConfig.data.blueprint.channels || [];
    const next = channels.includes(id)
      ? channels.filter((value) => value !== id)
      : [...channels, id];
    patchSection("blueprint", { channels: next });
  }

  function toggleClause(label) {
    if (!selectedConfig) return;
    const clauses = selectedConfig.data.master.clausePackage || [];
    const conflictA = "Klausul Pengecualian Risiko Mengendarai Sepeda Motor";
    const conflictB = "Klausul Risiko Mengendarai Sepeda Motor dan Sejenisnya";
    let next = clauses.includes(label)
      ? clauses.filter((item) => item !== label)
      : [...clauses, label];
    if (label === conflictA && next.includes(conflictA)) next = next.filter((item) => item !== conflictB);
    if (label === conflictB && next.includes(conflictB)) next = next.filter((item) => item !== conflictA);
    patchSection("master", { clausePackage: next });
  }

  function patchTravelSafeMaster(changes) {
    if (!selectedConfig || selectedConfig.family !== "travel-group") return;
    const nextMaster = {
      ...selectedConfig.data.master,
      ...changes,
    };
    const accidentMin = parseNumber(nextMaster.npAccidentLimitMin || "0");
    const accidentMax = parseNumber(nextMaster.npAccidentLimitMax || "0");
    const medicalPercent = parseFlexibleNumber(nextMaster.npMedicalPercentage || "0");
    const medicalRate = parseFlexibleNumber(nextMaster.npMedicalRate || "0");
    const accidentRate = parseFlexibleNumber(nextMaster.npAccidentRate || "0");
    const medicalMin = Math.round(accidentMin * (medicalPercent / 100));
    const medicalMax = Math.round(accidentMax * (medicalPercent / 100));

    nextMaster.npMedicalLimitMin = formatNumber(String(medicalMin));
    nextMaster.npMedicalLimitMax = formatNumber(String(medicalMax));
    nextMaster.npAccidentPremiMin = formatNumber(String(Math.round(accidentMin * (accidentRate / 100))));
    nextMaster.npAccidentPremiMax = formatNumber(String(Math.round(accidentMax * (accidentRate / 100))));
    nextMaster.npMedicalPremiMin = formatNumber(String(Math.round(medicalMin * (medicalRate / 100))));
    nextMaster.npMedicalPremiMax = formatNumber(String(Math.round(medicalMax * (medicalRate / 100))));
    nextMaster.coverageType = getTravelSafeCoverageText(nextMaster);
    nextMaster.currencyCode = getTravelSafeLockedCurrency(nextMaster);

    patchSection("master", nextMaster);
  }

  function toggleTravelSafeCoverage(code) {
    if (!selectedConfig || selectedConfig.family !== "travel-group") return;
    const nextCodes = [code];
    patchTravelSafeMaster({
      coverageCodes: nextCodes,
      coverageType: getTravelSafeCoverageLabel(code),
    });
  }

  function updateTravelSafeBenefit(itemId, changes) {
    if (!selectedConfig || selectedConfig.family !== "travel-group") return;
    const currentSelections = { ...(selectedConfig.data.master.perluasanSelections || {}) };
    const itemMeta = TRAVEL_SAFE_EXTENSION_LIBRARY.flatMap((category) => category.items).find((item) => item.id === itemId);
    const currentSelection = currentSelections[itemId] || { checked: false, hpMin: "", hpMax: "", rate: "", premiMin: "", premiMax: "" };
    const nextSelection = {
      ...currentSelection,
      ...changes,
    };

    if (Object.prototype.hasOwnProperty.call(changes, "hpMin")) nextSelection.hpMin = formatNumber(changes.hpMin);
    if (Object.prototype.hasOwnProperty.call(changes, "hpMax")) nextSelection.hpMax = formatNumber(changes.hpMax);
    if (Object.prototype.hasOwnProperty.call(changes, "rate")) nextSelection.rate = formatRateInput(changes.rate);

    if (!nextSelection.checked) {
      nextSelection.premiMin = "";
      nextSelection.premiMax = "";
    } else if (!itemMeta?.isCheckOnly) {
      const hpMin = parseNumber(nextSelection.hpMin || "0");
      const hpMax = parseNumber(nextSelection.hpMax || "0");
      const rate = parseFlexibleNumber(nextSelection.rate || "0");
      nextSelection.premiMin = formatNumber(String(Math.round(hpMin * (rate / 100))));
      nextSelection.premiMax = formatNumber(String(Math.round(hpMax * (rate / 100))));
    }

    currentSelections[itemId] = nextSelection;
    patchTravelSafeMaster({ perluasanSelections: currentSelections });
  }

  function addLifeGuardCustomClause() {
    if (!selectedConfig || selectedConfig.family !== "group-pa") return;
    const title = (selectedConfig.data.master.additionalClauseTitle || "").trim();
    const description = (selectedConfig.data.master.additionalClauseDescription || "").trim();
    if (!title) {
      setToast("Judul klausula masih kosong");
      return;
    }
    const existing = selectedConfig.data.master.customClauses || [];
    if (existing.some((item) => item.title.toLowerCase() === title.toLowerCase()) || LIFE_GUARD_ADDITIONAL_CLAUSE_LIBRARY.some((item) => item.title.toLowerCase() === title.toLowerCase())) {
      setToast("Klausula sudah ada");
      return;
    }
    patchSection("master", {
      customClauses: [
        ...existing,
        {
          id: uid("clause"),
          title,
          description,
          lob: "Klausula Tambahan",
        },
      ],
      additionalClauseTitle: "",
      additionalClauseDescription: "",
      clausePackage: [...(selectedConfig.data.master.clausePackage || []), title],
    });
    setLifeGuardClauseSearch(title);
    setToast("Klausula tambahan ditambahkan");
  }

  function selectAllVisibleLifeGuardClauses() {
    if (!selectedConfig || selectedConfig.family !== "group-pa") return;
    const current = selectedConfig.data.master.clausePackage || [];
    const visibleTitles = lifeGuardAdditionalClauseOptions.map((item) => item.title);
    patchSection("master", {
      clausePackage: Array.from(new Set([...current, ...visibleTitles])),
    });
  }

  function resetVisibleLifeGuardClauses() {
    if (!selectedConfig || selectedConfig.family !== "group-pa") return;
    const visibleTitles = new Set(lifeGuardAdditionalClauseOptions.map((item) => item.title));
    patchSection("master", {
      clausePackage: (selectedConfig.data.master.clausePackage || []).filter((item) => !visibleTitles.has(item)),
    });
  }

  function triggerPolicyPrintTest() {
    if (!selectedConfig) return;
    appendAudit("Uji cetak polis dijalankan dari langkah wording dan klausula.", role.toUpperCase());
    setToast("Test print polis diproses");
  }

  function updateMappingRow(rowId, changes) {
    if (!selectedConfig) return;
    const nextRows = selectedConfig.data.mapping.rows.map((row) =>
      row.id === rowId ? { ...row, ...changes } : row
    );
    patchSection("mapping", { rows: nextRows });
  }

  function addMappingRow() {
    if (!selectedConfig) return;
    patchSection("mapping", { rows: [...selectedConfig.data.mapping.rows, createMappingRow()] });
  }

  function removeMappingRow(rowId) {
    if (!selectedConfig) return;
    patchSection("mapping", {
      rows: selectedConfig.data.mapping.rows.filter((row) => row.id !== rowId),
    });
  }

  function autoGenerateRows() {
    if (!selectedConfig) return;
    const parsed = parseSamplePayload(selectedConfig);
    if (!parsed) {
      setToast("Sample JSON belum valid");
      return;
    }
    const existingSourceFields = new Set(selectedConfig.data.mapping.rows.map((row) => row.sourceField));
    const newRows = Object.keys(parsed)
      .filter((key) => !existingSourceFields.has(key))
      .map((key) => createMappingRow(key, "", String(parsed[key] ?? ""), "trim"));
    patchSection("mapping", {
      rows: [...selectedConfig.data.mapping.rows, ...newRows],
    });
    appendAudit("Baris mapping digenerate dari sample payload.", "SYSTEM");
    setToast("Baris mapping ditambahkan");
  }

  function autoMapCommonFields() {
    if (!selectedConfig) return;
    const nextRows = selectedConfig.data.mapping.rows.map((row) => {
      if (row.target) return row;
      const source = String(row.sourceField || "").trim().toLowerCase();
      const found = Object.entries(AUTO_ALIASES).find(([, aliases]) => aliases.includes(source));
      return found ? { ...row, target: found[0] } : row;
    });
    patchSection("mapping", { rows: nextRows });
    appendAudit("Auto-map common fields dijalankan.", "SYSTEM");
    setToast("Auto-map selesai");
  }

  function patchFieldRule(key, changes) {
    if (!selectedConfig) return;
    const current = getOperationalFieldRules(selectedConfig);
    patchSection("realisasi", {
      fields: {
        ...selectedConfig.data.realisasi.fields,
        [key]: { ...current[key], ...changes },
      },
    });
  }

  function applyMinimalPartnerFields() {
    if (!selectedConfig) return;
    const requiredTargets = getRequiredTargets(selectedConfig);
    const current = getOperationalFieldRules(selectedConfig);
    const nextFields = { ...selectedConfig.data.realisasi.fields };

    Object.keys(current).forEach((key) => {
      const required = key === "partner_policy_ref" || requiredTargets.includes(key);
      nextFields[key] = {
        ...current[key],
        active: required,
        required,
        source: required ? "Partner" : current[key].source,
        editable: required ? "Locked" : "Internal Only",
      };
    });

    patchSection("realisasi", {
      fields: nextFields,
      notes: "Template dirampingkan otomatis. Partner hanya kirim field minimum yang benar-benar wajib.",
    });
    appendAudit("Template realisasi dirampingkan otomatis.", "SYSTEM");
    setToast("Template minimal diterapkan");
  }

  function createConfig() {
    const family =
      selectedFamily ||
      (familyFilter === "all" ? "group-pa" : familyFilter);
    const item = createBlankConfig(family);
    const meta = getPortalCardMeta(family);
    item.title = meta.defaultBlueprint;
    item.partnerName = meta.defaultPartner;
    item.productName = meta.defaultProduct;
    item.data.master.productName = meta.defaultProduct;
    item.data.master.productFamily = meta.title;
    item.data.blueprint.notes = meta.description;
    applyProductStarterConfig(item);
    setConfigs((prev) => [item, ...prev]);
    setSelectedFamily(family);
    setSelectedId(item.id);
    setStepIndex(0);
    setPortalView("studio");
    setToast("Konfigurasi baru dibuat");
  }

  function duplicateConfig(id) {
    const source = configs.find((item) => item.id === id);
    if (!source) return;
    const copy = cloneConfig(source);
    setConfigs((prev) => [copy, ...prev]);
    setSelectedId(copy.id);
    setStepIndex(0);
    setToast("Konfigurasi diduplikasi");
  }

  function openConfig(id) {
    const config = configs.find((item) => item.id === id);
    if (config) setSelectedFamily(config.family);
    setSelectedId(id);
    setStepIndex(0);
    setPortalView("studio");
  }

  function openProductStudio(family) {
    const preferredStatus =
      role === "Maker" ? "Draft" : role === "Checker" ? "Checker" : "Approval";
    const target =
      configs.find((item) => item.family === family && item.status === preferredStatus) ||
      configs.find((item) => item.family === family);

    if (target) {
      setSelectedFamily(family);
      setSelectedId(target.id);
      setStepIndex(0);
      setPortalView("studio");
      return;
    }

    const item = createBlankConfig(family);
    const meta = getPortalCardMeta(family);
    item.title = meta.defaultBlueprint;
    item.partnerName = meta.defaultPartner;
    item.productName = meta.defaultProduct;
    item.data.master.productName = meta.defaultProduct;
    item.data.master.productFamily = meta.title;
    item.data.blueprint.notes = meta.description;
    applyProductStarterConfig(item);
    setConfigs((prev) => [item, ...prev]);
    setSelectedFamily(family);
    setSelectedId(item.id);
    setStepIndex(0);
    setPortalView("studio");
  }

  function backToCatalog() {
    setSelectedId(null);
    setPortalView("catalog");
  }

  function exitToShell() {
    if (typeof onExit === "function") onExit();
  }

  function moveNext() {
    if (!selectedConfig) return;
    if (stepIndex < STEP_LIST.length - 1) {
      setStepIndex((prev) => prev + 1);
      return;
    }

    if (role === "Maker") {
      updateSelected((draft) => {
        draft.status = "Checker";
        draft.version = bumpVersion(draft.version, "minor");
        return draft;
      });
      appendAudit("Dikirim ke checker.", "ROM");
      setToast("Masuk antrian Checker");
      return;
    }

    if (role === "Checker") {
      updateSelected((draft) => {
        draft.status = "Approval";
        draft.version = bumpVersion(draft.version, "patch");
        return draft;
      });
      appendAudit("Dikirim ke approval.", "UDW");
      setToast("Masuk antrian Approval");
      return;
    }

    updateSelected((draft) => {
      draft.status = "Active";
      draft.version = bumpVersion(draft.version, "major");
      return draft;
    });
    appendAudit("Konfigurasi diaktifkan dan siap sync ke STAR/core.", "HO");
    setToast("Configuration Active");
  }

  function moveBack() {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
      return;
    }
    setSelectedId(null);
    setSelectedFamily("");
    setPortalView("catalog");
  }

  function sendBackOneStage() {
    if (!selectedConfig) return;
    if (role === "Checker") {
      updateSelected((draft) => {
        draft.status = "Draft";
        return draft;
      });
      appendAudit("Dikembalikan ke maker untuk revisi.", "UDW");
      setToast("Dikembalikan ke Maker");
      return;
    }
    if (role === "Approval") {
      updateSelected((draft) => {
        draft.status = "Checker";
        return draft;
      });
      appendAudit("Dikembalikan ke checker untuk revisi.", "HO");
      setToast("Dikembalikan ke Checker");
    }
  }

  function setLifeGuardReviewNote(value) {
    if (!selectedConfig || !["group-pa", "travel-group"].includes(selectedConfig.family)) return;
    patchSection("review", { [getLifeGuardReviewField(role)]: value });
  }

  function removeLifeGuardCustomClause(clauseId) {
    if (!selectedConfig || selectedConfig.family !== "group-pa") return;
    const customClauses = selectedConfig.data.master.customClauses || [];
    const clause = customClauses.find((item) => item.id === clauseId);
    patchSection("master", {
      customClauses: customClauses.filter((item) => item.id !== clauseId),
      clausePackage: (selectedConfig.data.master.clausePackage || []).filter((item) => item !== clause?.title),
    });
    setToast("Klausula tambahan dihapus");
  }

  function resetLifeGuardWorkflow() {
    if (!selectedConfig || !["group-pa", "travel-group"].includes(selectedConfig.family)) return;
    updateSelected((draft) => {
      draft.status = "Draft";
      draft.data.review = {
        ...draft.data.review,
        makerNote: "",
        checkerNote: "",
        approvalNote: "",
      };
      return draft;
    });
    updateRole("Maker");
    setStepIndex(0);
    setLifeGuardPendingAction("");
    appendAudit("Simulator direset ke awal.", "SYSTEM");
    setToast("Simulator direset");
  }

  function editLifeGuardFromSuccess() {
    if (!selectedConfig || !["group-pa", "travel-group"].includes(selectedConfig.family)) return;
    updateSelected((draft) => {
      draft.status = "Checker";
      return draft;
    });
    updateRole("Checker");
    setStepIndex(0);
    appendAudit("Pengeditan ulang konfigurasi aktif.", "UDW", "Beralih ke mode edit untuk peninjauan ulang konfigurasi aktif.");
    setToast("Beralih ke mode edit");
  }

  function applyLifeGuardAction(action) {
    if (!selectedConfig || !["group-pa", "travel-group"].includes(selectedConfig.family)) return;
    if (action === "RESET") {
      resetLifeGuardWorkflow();
      return;
    }

    const reviewField = getLifeGuardReviewField(role);
    const note = String(selectedConfig.data.review?.[reviewField] || "").trim();
    if (!note) {
      setToast("Gagal: kolom analisa wajib diisi");
      return;
    }

    const actorMeta = getLifeGuardRoleMeta(role);
    const actionMap = {
      TO_UDW: { status: "Checker", actor: actorMeta.actor, text: "Kirim ke Checker" },
      REJECT: { status: "Draft", actor: actorMeta.actor, text: "Tolak" },
      RETURN_MAKER: { status: "Draft", actor: actorMeta.actor, text: "Kembali ke Maker" },
      TO_HO: { status: "Approval", actor: actorMeta.actor, text: "Forward ke Approval" },
      RETURN_UDW: { status: "Checker", actor: actorMeta.actor, text: "Kembali ke Admin UDW" },
      ISSUE: { status: "Active", actor: actorMeta.actor, text: "Setuju & Terbitkan Polis" },
    };
    const target = actionMap[action];
    if (!target) return;

    updateSelected((draft) => {
      draft.status = target.status;
      return draft;
    });
    appendAudit(target.text, target.actor, note);
    setLifeGuardPendingAction("");
    setToast(target.text);
  }

  function openLifeGuardAction(action) {
    setLifeGuardPendingAction(action);
  }

  function closeLifeGuardAction() {
    setLifeGuardPendingAction("");
  }

  function renderStep() {
    if (!selectedConfig) return null;

    const blueprint = selectedConfig.data.blueprint;
    const master = selectedConfig.data.master;
    const mapping = selectedConfig.data.mapping;
    const review = selectedConfig.data.review;
    const fieldRules = getOperationalFieldRules(selectedConfig);
    const normalizedPreview = buildNormalizedPreview(selectedConfig);
    const reviewPendingItems = getPendingItems(selectedConfig);
    const isLifeGuard = selectedConfig.family === "group-pa";
    const isTripTravelGuard = ["health-group", "travel-group"].includes(selectedConfig.family);
    const lifeGuardComputed = isLifeGuard ? getLifeGuardComputed(master) : null;
    const insuredLookupValue = blueprint.insuredCode || blueprint.insuredName || "";
    const hasInsuredLookup = Boolean(insuredLookupValue.trim());

    if (isLifeGuard) {
      if (STEP_LIST[stepIndex].id === "general") {
        return (
          <div className="space-y-4">
            <SectionCard title="Informasi Nasabah">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <FormField label="Nama / CIF" required helper="Ketik nama untuk mencari data CIF, atau lanjutkan sebagai nasabah baru.">
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <TextInput
                        value={insuredLookupValue}
                        onChange={(value) => patchSection("blueprint", {
                          insuredCode: value,
                          insuredName: onlyDigits(value) ? blueprint.insuredName : value.toUpperCase(),
                        })}
                        placeholder="Masukkan nama nasabah atau kode CIF"
                        className="pl-11"
                      />
                    </div>
                  </FormField>
                </div>
                {hasInsuredLookup ? (
                  <>
                    <FormField label="Nomor Handphone" required>
                      <TextInput
                        value={blueprint.phoneNumber || ""}
                        onChange={(value) => patchSection("blueprint", { phoneNumber: value })}
                        placeholder="08xxxxxxxxxx"
                      />
                    </FormField>
                    <FormField label="Alamat Email" required>
                      <TextInput
                        type="email"
                        value={blueprint.correspondenceEmail || blueprint.ownerEmail || ""}
                        onChange={(value) => patchSection("blueprint", { correspondenceEmail: value, ownerEmail: value })}
                        placeholder="nama@email.com"
                      />
                    </FormField>
                    <FormField label="NPWP">
                      <TextInput
                        value={blueprint.npwp || ""}
                        onChange={(value) => patchSection("blueprint", { npwp: value })}
                        placeholder="Masukkan NPWP"
                      />
                    </FormField>
                    <div className="md:col-span-2">
                      <FormField label="Alamat">
                        <TextAreaInput
                          rows={3}
                          value={blueprint.address || ""}
                          onChange={(value) => patchSection("blueprint", { address: value })}
                          placeholder="Masukkan alamat nasabah"
                        />
                        <div className="mt-2 flex flex-wrap gap-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              patchSection("blueprint", {
                                address: "Lokasi GPS tersimulasi - Gedung Cyber 2, Lt. 15, Jl. HR Rasuna Said Blok X-5, Jakarta Selatan",
                              })
                            }
                            className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <MapPin className="h-4 w-4" />
                            Ambil Lokasi Sekarang
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              patchSection("blueprint", {
                                address: "Pin peta tersimulasi - Graha Jasindo, Jl. MT Haryono Kav. 61, Jakarta Selatan",
                              })
                            }
                            className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <MapPin className="h-4 w-4" />
                            Pilih di Peta
                          </button>
                        </div>
                      </FormField>
                    </div>
                  </>
                ) : null}
              </div>
            </SectionCard>

            <SectionCard title="Polis Induk">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Nomor Polis Induk / PKS" required>
                  <TextInput
                    value={master.masterPolicyNo}
                    onChange={(value) => {
                      patchSection("master", { masterPolicyNo: value });
                      patchSection("blueprint", { agreementNo: value });
                    }}
                    placeholder="Masukkan nomor polis induk atau PKS"
                  />
                </FormField>
                <div className="md:col-span-2">
                  <FormField label="Daftar QQ Tambahan">
                    <TextAreaInput
                      rows={2}
                      value={blueprint.qqTambahan || ""}
                      onChange={(value) => patchSection("blueprint", { qqTambahan: value })}
                      placeholder="Isi jika ada tambahan QQ yang perlu tercetak di polis."
                    />
                  </FormField>
                </div>
                <FormField label="Mulai Berlaku PKS / Polis Induk" required>
                  <TextInput
                    type="date"
                    value={blueprint.startDate}
                    onChange={(value) => patchSection("blueprint", { startDate: value })}
                  />
                </FormField>
                <div className="md:col-span-2">
                  <div className="rounded-[18px] border border-dashed border-[#BFDBFE] bg-slate-50 px-5 py-6 text-center text-sm text-slate-500">
                    <div className="flex items-center justify-center gap-2 text-[#0A4D82]">
                      <Upload className="h-4 w-4" />
                      <span>Unggah Dokumen PKS atau Polis Induk</span>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        );
      }

      if (STEP_LIST[stepIndex].id === "object") {
        return (
          <div className="space-y-4">
            <SectionCard title="Obyek Pertanggungan" subtitle="Isi berurutan mulai dari jenis pertanggungan, santunan, lalu premi.">
              <div className="space-y-4">
                <div>
                  <div className="mb-4 text-[14px] font-medium text-slate-950">Rincian Jaminan</div>
                  <div className="space-y-2">
                    {LIFE_GUARD_COVERAGE_ITEMS.filter((item) => item.section === "main").map((item) => (
                      <LifeGuardCoverageCard
                        key={item.id}
                        item={item}
                        selected={master.clausePackage.includes(item.clauseLabel)}
                        expanded={lifeGuardExpanded === item.id}
                        onSelect={() => toggleClause(item.clauseLabel)}
                        onToggle={() => setLifeGuardExpanded((prev) => (prev === item.id ? "" : item.id))}
                      />
                    ))}
                  </div>
                </div>
                <div className="rounded-[18px] border border-[#D9E1EA] bg-[#F7FAFE] p-4">
                  <div className="mb-4 text-[14px] font-semibold text-slate-950">Produk & profil risiko</div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <FormField label="Jenis Pertanggungan" required helper="">
                        <SelectInput
                          value={master.coverageType || LIFE_GUARD_COVERAGE_OPTIONS[0]}
                          onChange={(value) => patchSection("master", { coverageType: value, productCode: value.split(" - ")[0], productName: value })}
                          options={LIFE_GUARD_COVERAGE_OPTIONS}
                        />
                      </FormField>
                    </div>
                    <FormField label="Mata Uang" required helper="">
                      <SelectInput
                        value={master.currencyCode || LIFE_GUARD_CURRENCY_OPTIONS[0]}
                        onChange={(value) => patchSection("master", { currencyCode: value })}
                        options={LIFE_GUARD_CURRENCY_OPTIONS}
                      />
                    </FormField>
                    <FormField label="Kelas Risiko" required helper="">
                      <SelectInput value={master.riskClass || "Kelas III"} onChange={(value) => patchSection("master", { riskClass: value })} options={["Kelas I", "Kelas II", "Kelas III", "Kelas IV", "Single Rate"]} />
                    </FormField>
                    <FormField label="Eksposur Risiko" required helper="">
                      <SelectInput value={master.riskExposure || "Tersebar"} onChange={(value) => patchSection("master", { riskExposure: value })} options={["Tersebar", "Terlokalisir"]} />
                    </FormField>
                    <FormField label="Batasan Usia Peserta" required helper="">
                      <div className="grid grid-cols-[1fr_24px_1fr] items-center gap-2">
                        <TextInput value={master.ageMin || ""} onChange={(value) => patchSection("master", { ageMin: onlyDigits(value) })} placeholder="Usia minimum" />
                        <div className="text-center text-sm text-slate-400">-</div>
                        <TextInput value={master.ageMax || ""} onChange={(value) => patchSection("master", { ageMax: onlyDigits(value) })} placeholder="Usia maksimum" />
                      </div>
                    </FormField>
                  </div>
                </div>

                <div className="rounded-[18px] border border-[#D9E1EA] bg-[#F7FAFE] p-4">
                  <div className="mb-4 text-[14px] font-semibold text-slate-950">Santunan & validasi</div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="Kriteria Validasi Santunan" required helper="">
                      <SelectInput
                        value={master.npCriteria || "antara"}
                        onChange={(value) => patchSection("master", { npCriteria: value })}
                        options={["setara", "antara", "lebih_besar", "kurang_dari"]}
                        renderLabel={(value) =>
                          value === "setara" ? "Setara dengan" : value === "antara" ? "Antara (Min & Maks)" : value === "lebih_besar" ? "Lebih besar dari" : "Kurang dari"
                        }
                      />
                    </FormField>
                    <FormField label="NP Meninggal Dunia (A)" required helper="">
                      <div className="grid grid-cols-[1fr_24px_1fr] items-center gap-2">
                        <CurrencyInput value={master.npAMin || ""} onChange={(value) => patchSection("master", { npAMin: value })} />
                        <div className="text-center text-sm text-slate-400">-</div>
                        <CurrencyInput value={master.npAMax || ""} onChange={(value) => patchSection("master", { npAMax: value })} />
                      </div>
                    </FormField>
                    <FormField label="NP Cacat Tetap (B)" helper="">
                      <div className="flex items-center gap-3">
                        <TextInput value={master.npBPercent || "100"} onChange={(value) => patchSection("master", { npBPercent: onlyDigits(value) })} className="max-w-[120px] text-center" />
                        <div className="rounded-xl border border-[#D9E1EA] bg-white px-3 py-3 text-sm text-[#0A4D82]">{lifeGuardComputed.npBText}</div>
                      </div>
                    </FormField>
                    <FormField label="NP Pengobatan (C)" helper="">
                      <div className="flex items-center gap-3">
                        <TextInput value={master.npCPercent || "10"} onChange={(value) => patchSection("master", { npCPercent: onlyDigits(value) })} className="max-w-[120px] text-center" />
                        <div className="rounded-xl border border-[#D9E1EA] bg-white px-3 py-3 text-sm text-[#0A4D82]">{lifeGuardComputed.npCText}</div>
                      </div>
                    </FormField>
                  </div>
                </div>

                <div className="rounded-[18px] border border-[#D9E1EA] bg-[#F7FAFE] p-4">
                  <div className="mb-4 text-[14px] font-semibold text-slate-950">Premi & ketentuan</div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="Rate Premi (‰)" helper="">
                      <TextInput value={master.baseRate || ""} onChange={(value) => patchSection("master", { baseRate: value })} className="max-w-[180px]" />
                    </FormField>
                    <FormField label="Estimasi Premi" required helper="">
                      <div className="grid grid-cols-[1fr_24px_1fr] items-center gap-2">
                        <CurrencyInput value={formatNumber(lifeGuardComputed.premiumMin)} onChange={() => {}} disabled />
                        <div className="text-center text-sm text-slate-400">-</div>
                        <CurrencyInput value={formatNumber(lifeGuardComputed.premiumMax)} onChange={() => {}} disabled />
                      </div>
                    </FormField>
                    <div className="md:col-span-2">
                  <FormField label="Risiko Sendiri saat Klaim" helper="">
                    <TextAreaInput rows={2} value={master.deductible || ""} onChange={(value) => patchSection("master", { deductible: value })} placeholder="Isi jika ada risiko sendiri saat klaim." />
                      </FormField>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        );
      }

      if (STEP_LIST[stepIndex].id === "clause") {
        return (
          <div className="mx-auto max-w-4xl space-y-3">
            <SectionCard title="Wording">
              <div>
                <div className="mb-4 text-[14px] font-medium text-slate-950">Wording</div>
                <SelectInput
                  value={master.wordingType || "PSAKDI"}
                  onChange={(value) => patchSection("master", { wordingType: value })}
                  options={WORDING_OPTIONS}
                  renderLabel={renderWordingLabel}
                />
                <div className="mt-2 text-[12px] leading-5 text-slate-500">
                  {WORDING_OPTION_META[master.wordingType || "PSAKDI"]}
                </div>
              </div>
            </SectionCard>
            <SectionCard title="Klausula">
              <div className="overflow-hidden rounded-[18px] border border-[#D9E1EA] bg-white">
                <div className="flex items-start justify-between gap-4 border-b border-[#D9E1EA] px-4 py-3.5">
                  <div>
                    <div className="text-[16px] font-semibold text-slate-950">Klausula</div>
                    <div className="mt-1 text-[12px] text-slate-500">Pilih klausula yang berlaku untuk konfigurasi partner ini.</div>
                  </div>
                  <div className="rounded-full bg-[#EEF5FB] px-3 py-1.5 text-[11px] text-[#0A4D82]">
                    {lifeGuardAdditionalClauseOptions.filter((item) => master.clausePackage.includes(item.title)).length} terpilih
                  </div>
                </div>
                <div className="p-3.5">
                  <div className="grid gap-2.5 md:grid-cols-[minmax(0,1fr)_auto_auto]">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={lifeGuardClauseSearch}
                        onChange={(event) => setLifeGuardClauseSearch(event.target.value)}
                        placeholder="Cari klausula..."
                        className="h-11 w-full rounded-[14px] border border-[#D9E1EA] bg-white pl-11 pr-4 text-[13px] text-slate-900 outline-none transition focus:border-[#0A4D82]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={selectAllVisibleLifeGuardClauses}
                      className="h-11 rounded-[14px] border border-[#D9E1EA] bg-white px-4 text-[13px] text-slate-900 transition hover:border-[#BFD3EA] hover:bg-[#F7FAFE]"
                    >
                      Pilih Semua Terlihat
                    </button>
                    <button
                      type="button"
                      onClick={resetVisibleLifeGuardClauses}
                      className="h-11 rounded-[14px] border border-[#D9E1EA] bg-white px-4 text-[13px] text-slate-900 transition hover:border-[#BFD3EA] hover:bg-[#F7FAFE]"
                    >
                      Reset Pilihan
                    </button>
                  </div>
                </div>
                <div className="max-h-[360px] space-y-2 overflow-y-auto border-t border-[#D9E1EA] px-3.5 py-3">
                  {lifeGuardAdditionalClauseOptions.map((clause) => (
                    <PartnerClauseAccordionRow
                      key={clause.title}
                      title={clause.title}
                      detail={getClauseDescription(clause.title, "Klausula ini dapat diaktifkan sesuai kebutuhan produk partner dan akan ikut dalam package default.")}
                      selected={master.clausePackage.includes(clause.title)}
                      expanded={partnerClauseExpanded === `life-guard:${clause.title}`}
                      onSelect={() => toggleClause(clause.title)}
                      onToggle={() => setPartnerClauseExpanded((prev) => (prev === `life-guard:${clause.title}` ? "" : `life-guard:${clause.title}`))}
                      icon={FileCode2}
                    />
                  ))}
                  {lifeGuardAdditionalClauseOptions.length === 0 ? (
                    <div className="rounded-[16px] border border-dashed border-[#D9E1EA] bg-[#FAFCFE] px-4 py-8 text-center text-[13px] text-slate-500">
                      Tidak ada klausula yang cocok dengan pencarian ini.
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="mt-6">
                <PartnerClauseNoteCard title="Klausula Tambahan">
                  <div className="grid gap-3">
                    <FormField label="Judul Klausula Tambahan">
                      <TextInput value={master.additionalClauseTitle || ""} onChange={(value) => patchSection("master", { additionalClauseTitle: value })} />
                    </FormField>
                    <FormField label="Deskripsi Klausula Tambahan">
                      <TextAreaInput rows={5} value={master.additionalClauseDescription || ""} onChange={(value) => patchSection("master", { additionalClauseDescription: value })} />
                    </FormField>
                    <button
                      type="button"
                      onClick={addLifeGuardCustomClause}
                      className="inline-flex h-11 items-center justify-center rounded-[14px] border border-[#0A4D82] bg-[#0A4D82] px-4 text-sm text-white transition hover:bg-[#083D66]"
                    >
                      Tambah Klausula
                    </button>
                  </div>
                </PartnerClauseNoteCard>
              </div>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={triggerPolicyPrintTest}
                  className="inline-flex h-10 items-center justify-center rounded-[14px] border border-[#0A4D82] bg-white px-4 text-[13px] font-medium text-[#0A4D82] transition hover:bg-[#F7FAFE]"
                >
                  Test Print Polis
                </button>
              </div>
            </SectionCard>
          </div>
        );
      }

      if (STEP_LIST[stepIndex].id === "summary") {
        return (
          <div className="space-y-4">
            <SectionCard title="Ringkasan">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="Biaya Polis" required>
                      <CurrencyInput value={master.adminFee || ""} onChange={(value) => patchSection("master", { adminFee: value })} />
                    </FormField>
                    <FormField label="Biaya Meterai (Sesuai STAR)">
                      <TextInput value={master.stampDuty || "Sesuai STAR"} onChange={(value) => patchSection("master", { stampDuty: value })} disabled />
                    </FormField>
                    <FormField label="Diskon (%)">
                      <TextInput value={master.discountPercent || "0"} onChange={(value) => patchSection("master", { discountPercent: onlyDigits(value) })} />
                    </FormField>
                    <FormField label="Brokerage / Komisi (%)">
                      <TextInput value={master.commissionPercent || "15"} onChange={(value) => patchSection("master", { commissionPercent: onlyDigits(value) })} />
                    </FormField>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <SmallDataCard label="Limit Meninggal (A)" value={lifeGuardComputed.npAText} />
                    <SmallDataCard label="Jangka Waktu" value={`${blueprint.startDate || "-"} s/d ${blueprint.endDate || "-"}`} />
                    <SmallDataCard label="Rate Premi (‰)" value={master.baseRate || "-"} />
                  </div>
                </div>
                <ReviewSummaryCard
                  infoRows={[
                    { label: "Penerima Manfaat", value: `${blueprint.insuredName || "-"}${blueprint.qqTambahan ? ` ${blueprint.qqTambahan}` : ""}` },
                    { label: "Nomor Polis Induk / PKS", value: master.masterPolicyNo || "-" },
                    { label: "Jenis Produk", value: master.coverageType || "-" },
                    { label: "Kelas Risiko", value: master.riskClass || "-" },
                  ]}
                  premiumRows={[
                    { label: "Biaya Polis", value: master.adminFee ? `Rp ${formatRupiah(master.adminFee)}` : "-" },
                    { label: "Biaya Meterai", value: master.stampDuty || "Sesuai STAR" },
                    { label: "Brokerage / Komisi", value: `${master.commissionPercent || "15"}%` },
                  ]}
                  totalLabel="Estimasi Premi"
                  totalValue={`${lifeGuardComputed.currencyCode} ${formatRupiah(lifeGuardComputed.premiumMin)} - ${formatRupiah(lifeGuardComputed.premiumMax)}`}
                  pendingItems={reviewPendingItems}
                />
              </div>
            </SectionCard>

            <SectionCard title="Tinjauan Konfigurasi">
              <div className="grid gap-4 md:grid-cols-2">
                <SmallDataCard label="Penerima Manfaat" value={`${blueprint.insuredName || "-"}${blueprint.qqTambahan ? ` ${blueprint.qqTambahan}` : ""}`} />
                <SmallDataCard label="Nomor Polis Induk / PKS" value={master.masterPolicyNo || "-"} />
                <SmallDataCard label="Jangka Waktu Pertanggungan" value={`${blueprint.startDate || "-"} s/d ${blueprint.endDate || "-"}`} />
                <SmallDataCard label="Jenis Produk / Pertanggungan" value={master.coverageType || "-"} />
                <SmallDataCard label="NP Meninggal Dunia (A)" value={lifeGuardComputed.npAText} />
                <SmallDataCard label="NP Cacat Tetap (B)" value={lifeGuardComputed.npBText} />
                <SmallDataCard label="NP Pengobatan (C)" value={lifeGuardComputed.npCText} />
                <SmallDataCard label="Batasan Usia" value={`${master.ageMin || "-"} - ${master.ageMax || "-"} Thn`} />
                <SmallDataCard label="Kelas Risiko" value={master.riskClass || "-"} />
                <SmallDataCard label="Risk Exposure" value={master.riskExposure || "-"} />
                <SmallDataCard label="Rate Premi (‰)" value={master.baseRate || "-"} />
                <SmallDataCard label="Premi" value={`${lifeGuardComputed.currencyCode} ${formatRupiah(lifeGuardComputed.premiumMin)} - ${formatRupiah(lifeGuardComputed.premiumMax)}`} />
              </div>
            </SectionCard>

            <SectionCard title="Analisa Internal">
              <div className="grid gap-4 md:grid-cols-3">
                <FormField label="Analisa Maker (ROM)">
                  <TextAreaInput value={review.makerNote} onChange={(value) => patchSection("review", { makerNote: value })} placeholder="Isi catatan maker." />
                </FormField>
                <FormField label="Analisa Reviewer (Admin UDW)">
                  <TextAreaInput value={review.checkerNote} onChange={(value) => patchSection("review", { checkerNote: value })} placeholder="Isi catatan reviewer." />
                </FormField>
                <FormField label="Analisa Persetujuan (HO)">
                  <TextAreaInput value={review.approvalNote} onChange={(value) => patchSection("review", { approvalNote: value })} placeholder="Isi catatan persetujuan." />
                </FormField>
              </div>
              <div className="mt-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-medium text-slate-900">Yang Masih Perlu Dilengkapi</div>
                  {reviewPendingItems.length > 0 ? (
                    <div className="mt-3 space-y-3">
                      {reviewPendingItems.map((item) => (
                        <div key={item} className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                          <div className="text-sm text-amber-900">{fixDisplayText(item)}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </SectionCard>
          </div>
        );
      }
    }

    if (isTripTravelGuard) {
      if (STEP_LIST[stepIndex].id === "general") {
        return (
          <div className="space-y-4">
            <SectionCard title="Informasi Umum">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2 rounded-[18px] border border-[#BFDBFE] bg-[#F4F9FE] p-4">
                  <FormField label="Kode Tertanggung" required>
                    <TextInput
                      value={blueprint.insuredCode || ""}
                      onChange={(value) => patchSection("blueprint", { insuredCode: onlyDigits(value) })}
                      className="border-[#BFDBFE] text-[#0A4D82]"
                    />
                  </FormField>
                </div>
                <FormField label="Kode Akuisisi" required>
                  <SelectInput
                    value={blueprint.acquisitionCode || LIFE_GUARD_ACQUISITION_OPTIONS[1]}
                    onChange={(value) => patchSection("blueprint", { acquisitionCode: value })}
                    options={LIFE_GUARD_ACQUISITION_OPTIONS}
                  />
                </FormField>
                <div />
                <FormField label="Nama Tertanggung">
                  <TextInput
                    value={blueprint.insuredName || ""}
                    onChange={(value) => patchSection("blueprint", { insuredName: value })}
                    className="uppercase"
                    disabled
                  />
                </FormField>
                <FormField label="NPWP">
                  <TextInput
                    value={blueprint.npwp || ""}
                    onChange={(value) => patchSection("blueprint", { npwp: value })}
                    disabled
                  />
                </FormField>
                <div className="md:col-span-2">
                  <FormField label="Alamat Korespondensi">
                    <TextAreaInput
                      rows={3}
                      value={blueprint.address || ""}
                      onChange={(value) => patchSection("blueprint", { address: value })}
                      disabled
                    />
                    <div className="mt-2 flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          patchSection("blueprint", {
                            address: "Lokasi GPS tersimulasi - Gedung Cyber 2, Lt. 15, Jl. HR Rasuna Said Blok X-5, Jakarta Selatan",
                          })
                        }
                        className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <MapPin className="h-4 w-4" />
                        Ambil Lokasi Sekarang
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          patchSection("blueprint", {
                            address: "Pin peta tersimulasi - Graha Jasindo, Jl. MT Haryono Kav. 61, Jakarta Selatan",
                          })
                        }
                        className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <MapPin className="h-4 w-4" />
                        Pilih di Peta
                      </button>
                    </div>
                  </FormField>
                </div>
                <FormField label="Email Korespondensi" required>
                  <TextInput
                    type="email"
                    value={blueprint.correspondenceEmail || blueprint.ownerEmail || ""}
                    onChange={(value) => patchSection("blueprint", { correspondenceEmail: value, ownerEmail: value })}
                  />
                </FormField>
                <FormField label="Nomor Polis Induk / PKS" required>
                  <TextInput
                    value={master.masterPolicyNo || ""}
                    onChange={(value) => {
                      patchSection("master", { masterPolicyNo: value });
                      patchSection("blueprint", { agreementNo: value });
                    }}
                  />
                </FormField>
                <div className="md:col-span-2">
                  <FormField label="Daftar QQ Tambahan">
                    <TextAreaInput
                      rows={2}
                      value={blueprint.qqTambahan || ""}
                      onChange={(value) => patchSection("blueprint", { qqTambahan: value })}
                    />
                  </FormField>
                </div>
              </div>
            </SectionCard>
          </div>
        );
      }

      if (STEP_LIST[stepIndex].id === "object") {
        return (
          <div className="space-y-4">
            <SectionCard title="Obyek Pertanggungan">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <FormField label="Jenis Pertanggungan" required>
                    <SelectInput
                      value={master.coverageType || TRIP_TRAVEL_COVERAGE_OPTIONS[0]}
                      onChange={(value) =>
                        patchSection("master", {
                          coverageType: value,
                          productCode: value.split(" - ")[0],
                          productName: selectedConfig.productName,
                        })
                      }
                      options={TRIP_TRAVEL_COVERAGE_OPTIONS}
                    />
                  </FormField>
                </div>
                <div className="md:col-span-2">
                  <FormField label="Risiko Sendiri (Deductible)">
                    <TextAreaInput
                      rows={4}
                      value={master.deductible || ""}
                      onChange={(value) => patchSection("master", { deductible: value })}
                    />
                  </FormField>
                </div>
              </div>
            </SectionCard>
          </div>
        );
      }

      if (STEP_LIST[stepIndex].id === "clause") {
        return (
          <div className="space-y-4">
            <SectionCard title="Wording & Klausul" subtitle="Klik setiap baris untuk melihat penjelasan detailnya.">
              <div>
                <div className="mb-4 text-[14px] font-medium text-slate-950">Wording</div>
                <SelectInput
                  value={master.wordingType || "PSAKDI"}
                  onChange={(value) => patchSection("master", { wordingType: value })}
                  options={WORDING_OPTIONS}
                  renderLabel={renderWordingLabel}
                />
                <div className="mt-2 text-[12px] leading-5 text-slate-500">
                  {WORDING_OPTION_META[master.wordingType || "PSAKDI"]}
                </div>
                <div className="mt-4">
                  <FormField label="Jenis cetakan polis">
                    <SelectInput
                      value={master.printDocumentType || "Ikhtisar"}
                      onChange={(value) => patchSection("master", { printDocumentType: value })}
                      options={PRINT_DOCUMENT_OPTIONS}
                    />
                  </FormField>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-4 text-[14px] font-medium text-slate-950">Klausul yang Berlaku</div>
                <div className="space-y-3">
                  {TRIP_TRAVEL_CLAUSE_OPTIONS.map((clause) => (
                    <PartnerClauseAccordionRow
                      key={clause}
                      title={clause}
                      subtitle="Aktif bila dipilih untuk package partner"
                      detail={getClauseDescription(clause)}
                      selected={(master.clausePackage || []).includes(clause)}
                      expanded={partnerClauseExpanded === `trip-clause:${clause}`}
                      onSelect={() => toggleClause(clause)}
                      onToggle={() => setPartnerClauseExpanded((prev) => (prev === `trip-clause:${clause}` ? "" : `trip-clause:${clause}`))}
                      icon={FileCode2}
                    />
                  ))}
                </div>
              </div>
            </SectionCard>
          </div>
        );
      }

      if (STEP_LIST[stepIndex].id === "summary") {
        return (
          <div className="space-y-4">
            <SectionCard title="Ringkasan">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="Biaya Polis" required>
                      <CurrencyInput value={master.adminFee || ""} onChange={(value) => patchSection("master", { adminFee: value })} />
                    </FormField>
                    <FormField label="Biaya Meterai (Sesuai STAR)">
                      <TextInput value={master.stampDuty || "Sesuai STAR"} onChange={(value) => patchSection("master", { stampDuty: value })} disabled />
                    </FormField>
                    <FormField label="Diskon (%)">
                      <TextInput value={master.discountPercent || "0"} onChange={(value) => patchSection("master", { discountPercent: onlyDigits(value) })} />
                    </FormField>
                    <FormField label="Brokerage / Komisi (%)">
                      <TextInput value={master.commissionPercent || "15"} onChange={(value) => patchSection("master", { commissionPercent: onlyDigits(value) })} />
                    </FormField>
                  </div>
                </div>
                <ReviewSummaryCard
                  infoRows={[
                    { label: "Nama Tertanggung", value: blueprint.insuredName || "-" },
                    { label: "Nomor Polis Induk / PKS", value: master.masterPolicyNo || "-" },
                    { label: "Jenis Produk", value: master.coverageType || "-" },
                    { label: "Wording", value: master.wordingType || "-" },
                  ]}
                  premiumRows={[
                    { label: "Biaya Polis", value: master.adminFee ? `Rp ${formatRupiah(master.adminFee)}` : "-" },
                    { label: "Biaya Meterai", value: master.stampDuty || "Sesuai STAR" },
                    { label: "Brokerage / Komisi", value: `${master.commissionPercent || "15"}%` },
                  ]}
                  totalLabel="Ringkasan Pertanggungan"
                  totalValue={master.coverageType || "-"}
                  pendingItems={reviewPendingItems}
                />
              </div>
            </SectionCard>

            <SectionCard title="Tinjauan Konfigurasi">
              <div className="grid gap-4 md:grid-cols-2">
                <SmallDataCard label="Nama Tertanggung" value={blueprint.insuredName || "-"} />
                <SmallDataCard label="Nomor Polis Induk / PKS" value={master.masterPolicyNo || "-"} />
                <SmallDataCard label="Jenis Produk / Pertanggungan" value={master.coverageType || "-"} />
                <SmallDataCard label="Kode Akuisisi" value={blueprint.acquisitionCode || "-"} />
                <SmallDataCard label="Wording" value={master.wordingType || "-"} />
                <SmallDataCard label="Risiko Sendiri" value={master.deductible || "-"} />
              </div>
            </SectionCard>

            <SectionCard title="Analisa Internal">
              <div className="grid gap-4 md:grid-cols-3">
                <FormField label="Analisa Maker (ROM)">
                  <TextAreaInput value={review.makerNote} onChange={(value) => patchSection("review", { makerNote: value })} placeholder="Isi catatan maker." />
                </FormField>
                <FormField label="Analisa Reviewer (Admin UDW)">
                  <TextAreaInput value={review.checkerNote} onChange={(value) => patchSection("review", { checkerNote: value })} placeholder="Isi catatan reviewer." />
                </FormField>
                <FormField label="Analisa Persetujuan (HO)">
                  <TextAreaInput value={review.approvalNote} onChange={(value) => patchSection("review", { approvalNote: value })} placeholder="Isi catatan persetujuan." />
                </FormField>
              </div>
            </SectionCard>
          </div>
        );
      }
    }

    if (STEP_LIST[stepIndex].id === "general") {
      return (
        <div className="space-y-4">
          <SectionCard
            title="Informasi Umum"
            subtitle="Informasi Umum menjadi pintu masuk utama sebelum masuk ke pengaturan obyek, wording, klausul, dan ringkasan."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Nama Konfigurasi" required>
                <TextInput
                  value={selectedConfig.title}
                  onChange={(value) => patchRoot({ title: value })}
                  placeholder="Contoh: Momotrip - Anak Sekolah"
                />
              </FormField>
              <FormField label="Nama Partner" required>
                <TextInput
                  value={selectedConfig.partnerName}
                  onChange={(value) => patchRoot({ partnerName: value })}
                  placeholder="Nama partner"
                />
              </FormField>
              <FormField label="Nomor PKS / Kerjasama" required>
                <TextInput
                  value={blueprint.agreementNo}
                  onChange={(value) => patchSection("blueprint", { agreementNo: value })}
                  placeholder="Contoh: PKS-MOMO-2026-001"
                />
              </FormField>
              <FormField label="Kode Tertanggung" required>
                <TextInput
                  value={blueprint.insuredCode}
                  onChange={(value) => patchSection("blueprint", { insuredCode: onlyDigits(value) })}
                  placeholder="Contoh: 009281"
                />
              </FormField>
              <FormField label="Kode Partner">
                <TextInput
                  value={blueprint.partnerCode}
                  onChange={(value) => patchSection("blueprint", { partnerCode: value.toUpperCase() })}
                  placeholder="Contoh: MOMO"
                />
              </FormField>
              <FormField label="Email Owner Proses" required>
                <TextInput
                  type="email"
                  value={blueprint.ownerEmail}
                  onChange={(value) => patchSection("blueprint", { ownerEmail: value })}
                  placeholder="nama@jasindo.co.id"
                />
              </FormField>
              <FormField label="Mulai Kerjasama">
                <TextInput
                  type="date"
                  value={blueprint.startDate}
                  onChange={(value) => patchSection("blueprint", { startDate: value })}
                />
              </FormField>
              <FormField label="Akhir Kerjasama">
                <TextInput
                  type="date"
                  value={blueprint.endDate}
                  onChange={(value) => patchSection("blueprint", { endDate: value })}
                />
              </FormField>
              <FormField label="Kode Akuisisi">
                <SelectInput
                  value={blueprint.acquisitionCode}
                  onChange={(value) => patchSection("blueprint", { acquisitionCode: value })}
                  options={[
                    "110 - PS Perusahaan",
                    "200 - Agent",
                    "300 - Broker",
                    "240 - Perbankan",
                    "250 - Pembiayaan",
                  ]}
                />
              </FormField>
              <FormField label="Family Produk">
                <SelectInput
                  value={selectedConfig.family}
                  onChange={(value) => {
                    patchRoot({
                      family: value,
                    });
                    patchSection("master", { productFamily: getFamilyMeta(value).label });
                  }}
                  options={PRODUCT_FAMILIES.filter((item) => item.id !== "all").map((item) => item.id)}
                  renderLabel={(value) => getFamilyMeta(value).label}
                />
              </FormField>
            </div>

            <div className="mt-4">
              <FormField label="Catatan Konfigurasi">
                <TextAreaInput
                  value={blueprint.notes}
                  onChange={(value) => patchSection("blueprint", { notes: value })}
                  placeholder="Catat konteks kerjasama, SLA operasional, atau hal yang ingin diingat oleh bisnis owner."
                />
              </FormField>
            </div>
          </SectionCard>

        </div>
      );
    }

    if (STEP_LIST[stepIndex].id === "object") {
      return (
        <div className="space-y-4">
          <SectionCard
            title="Obyek Pertanggungan"
            subtitle="Step ini menyamakan gaya pengisian coverage, limit, rate, dan parameter underwriting inti."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Kode Produk" required>
                <TextInput
                  value={master.productCode}
                  onChange={(value) => patchSection("master", { productCode: value.toUpperCase() })}
                  placeholder="Contoh: 705"
                />
              </FormField>
              <FormField label="Nama Produk Induk" required>
                <TextInput
                  value={master.productName}
                  onChange={(value) => {
                    patchSection("master", { productName: value });
                    patchRoot({ productName: value });
                  }}
                  placeholder="Contoh: 705 Anak Sekolah"
                />
              </FormField>
              <FormField label="Nomor Polis Induk / PKS" required>
                <TextInput
                  value={master.masterPolicyNo}
                  onChange={(value) => patchSection("master", { masterPolicyNo: value })}
                  placeholder="Contoh: P-MOMO-2026-001"
                />
              </FormField>
              <FormField label="Plan" required>
                <TextInput
                  value={master.plan}
                  onChange={(value) => patchSection("master", { plan: value })}
                  placeholder="Contoh: Silver"
                />
              </FormField>
              <FormField label="Nilai Pertanggungan" required>
                <CurrencyInput
                  value={master.sumInsured}
                  onChange={(value) => patchSection("master", { sumInsured: value })}
                />
              </FormField>
              <FormField label="Rate Dasar (â€°)" required>
                <TextInput
                  value={master.baseRate}
                  onChange={(value) => patchSection("master", { baseRate: value })}
                  placeholder="Contoh: 0.124"
                />
              </FormField>
              <FormField label="Biaya Admin">
                <CurrencyInput
                  value={master.adminFee}
                  onChange={(value) => patchSection("master", { adminFee: value })}
                />
              </FormField>
              <FormField label="Owner / Squad">
                <TextInput
                  value={selectedConfig.owner}
                  onChange={(value) => patchRoot({ owner: value })}
                  placeholder="Contoh: ROM Jakarta 1"
                />
              </FormField>
              <div className="md:col-span-2">
                <FormField label="Ringkasan Manfaat" required>
                  <TextAreaInput
                    value={master.benefitSummary}
                    onChange={(value) => patchSection("master", { benefitSummary: value })}
                    placeholder="Jelaskan manfaat inti yang akan selalu mengikuti realisasi dari master policy ini."
                  />
                </FormField>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Parameter Underwriting"
            subtitle="Tambahan parameter underwriting ditempatkan satu step dengan obyek pertanggungan agar alurnya terasa seperti simulator asli."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Batasan Usia Peserta">
                <div className="grid grid-cols-[1fr_24px_1fr] items-center gap-2">
                  <TextInput
                    value={master.ageMin || ""}
                    onChange={(value) => patchSection("master", { ageMin: onlyDigits(value) })}
                    placeholder="Min"
                  />
                  <div className="text-center text-sm font-bold text-slate-400">-</div>
                  <TextInput
                    value={master.ageMax || ""}
                    onChange={(value) => patchSection("master", { ageMax: onlyDigits(value) })}
                    placeholder="Max"
                  />
                </div>
              </FormField>
              <FormField label="Kelas Risiko">
                <SelectInput
                  value={master.riskClass || "Kelas III"}
                  onChange={(value) => patchSection("master", { riskClass: value })}
                  options={["Kelas I", "Kelas II", "Kelas III", "Kelas IV", "Single Rate"]}
                />
              </FormField>
              <FormField label="Risk Exposure">
                <SelectInput
                  value={master.riskExposure || "Tersebar"}
                  onChange={(value) => patchSection("master", { riskExposure: value })}
                  options={["Tersebar", "Terlokalisir"]}
                />
              </FormField>
              <FormField label="Risiko Sendiri (Deductible)">
                <TextInput
                  value={master.deductible || ""}
                  onChange={(value) => patchSection("master", { deductible: value })}
                  placeholder="Kosongkan bila tidak ada"
                />
              </FormField>
            </div>
          </SectionCard>
        </div>
      );
    }

    if (STEP_LIST[stepIndex].id === "clause") {
      return (
        <div className="space-y-4">
          <SectionCard
            title="Wording & Klausul"
            subtitle="Klik setiap baris untuk melihat penjelasan detailnya."
          >
            <div>
              <div className="mb-4 text-[14px] font-medium text-slate-950">Wording</div>
              <SelectInput
                value={master.wordingType || "PSAKDI"}
                onChange={(value) => patchSection("master", { wordingType: value })}
                options={WORDING_OPTIONS}
                renderLabel={renderWordingLabel}
              />
              <div className="mt-2 text-[12px] leading-5 text-slate-500">
                {WORDING_OPTION_META[master.wordingType || "PSAKDI"]}
              </div>
              <div className="mt-4">
                <FormField label="Jenis cetakan polis">
                  <SelectInput
                    value={master.printDocumentType || "Ikhtisar"}
                    onChange={(value) => patchSection("master", { printDocumentType: value })}
                    options={PRINT_DOCUMENT_OPTIONS}
                  />
                </FormField>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-4 text-[14px] font-medium text-slate-950">Klausula</div>
              <div className="space-y-2">
              {CLAUSE_LIBRARY.map((clause) => {
                const active = master.clausePackage.includes(clause);
                return (
                  <PartnerClauseAccordionRow
                    key={clause}
                    title={fixDisplayText(clause)}
                    detail={getClauseDescription(clause)}
                    selected={active}
                    expanded={partnerClauseExpanded === `generic-clause:${clause}`}
                    onSelect={() => toggleClause(clause)}
                    onToggle={() => setPartnerClauseExpanded((prev) => (prev === `generic-clause:${clause}` ? "" : `generic-clause:${clause}`))}
                    icon={FileCode2}
                  />
                );
              })}
              </div>
            </div>

            <div className="mt-6">
              <PartnerClauseNoteCard title="Klausula Tambahan">
                <TextAreaInput
                  rows={6}
                  value={master.additionalClauses || ""}
                  onChange={(value) => patchSection("master", { additionalClauses: value })}
                  placeholder="Masukkan klausul tambahan, subjectivity, atau catatan wording khusus."
                />
              </PartnerClauseNoteCard>
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={triggerPolicyPrintTest}
                className="inline-flex h-11 items-center justify-center rounded-[14px] border border-[#0A4D82] bg-white px-4 text-sm font-medium text-[#0A4D82] transition hover:bg-[#F7FAFE]"
              >
                Test Print Polis
              </button>
            </div>
          </SectionCard>
        </div>
      );
    }

    if (STEP_LIST[stepIndex].id === "summary") {
      return (
        <div className="space-y-4">
          <SectionCard
            title="Source Contract"
            subtitle="Masukkan sample payload dari partner. Dari sini bisnis owner bisa generate mapping tanpa nunggu TI."
            action={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={autoGenerateRows}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700"
                >
                  <Upload className="h-4 w-4" />
                  Generate Rows
                </button>
                <button
                  type="button"
                  onClick={autoMapCommonFields}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0A4D82] px-4 py-2 text-xs font-bold text-white"
                >
                  <Zap className="h-4 w-4" />
                  Auto-map
                </button>
              </div>
            }
          >
            <div className="grid gap-4 md:grid-cols-3">
              <FormField label="Format Source">
                <SelectInput
                  value={mapping.sourceKind}
                  onChange={(value) => patchSection("mapping", { sourceKind: value })}
                  options={["CSV", "Excel", "JSON"]}
                />
              </FormField>
              <FormField label="Primary Key">
                <TextInput
                  value={blueprint.primaryKey}
                  onChange={(value) => patchSection("blueprint", { primaryKey: value })}
                  placeholder="partner_policy_ref"
                />
              </FormField>
              <FormField label="Endpoint / Route">
                <TextInput
                  value={blueprint.endpoint}
                  onChange={(value) => patchSection("blueprint", { endpoint: value })}
                  placeholder="/api/v1/partner/example"
                />
              </FormField>
            </div>

            <div className="mt-4">
              <FormField label="Sample Payload (JSON)">
                <TextAreaInput
                  rows={12}
                  value={mapping.samplePayload}
                  onChange={(value) => patchSection("mapping", { samplePayload: value })}
                  placeholder='{"partner_policy_ref":"ABC-001","name":"Budi"}'
                />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard
            title="Mapping Table"
            subtitle="Map field partner ke field core database. Transform dipakai untuk normalisasi ringan sebelum sync."
          >
            <div className="space-y-3">
              {(mapping.rows || []).map((row) => (
                <div key={row.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="grid gap-3 lg:grid-cols-[1.15fr_1.2fr_1.1fr_1fr_44px] lg:items-end">
                    <FormField label="Source Field">
                      <TextInput
                        value={row.sourceField}
                        onChange={(value) => updateMappingRow(row.id, { sourceField: value })}
                        placeholder="Contoh: student_name"
                      />
                    </FormField>
                    <FormField label="Target Core Field">
                      <SelectInput
                        value={row.target}
                        onChange={(value) => updateMappingRow(row.id, { target: value })}
                        options={["", ...FIELD_CATALOG.map((item) => item.key)]}
                        renderLabel={(value) => (value ? `${FIELD_MAP[value]?.label || value} (${value})` : "Pilih target")}
                      />
                    </FormField>
                    <FormField label="Transform">
                      <TextInput
                        value={row.transform}
                        onChange={(value) => updateMappingRow(row.id, { transform: value })}
                        placeholder="trim|upper"
                      />
                    </FormField>
                    <FormField label="Contoh Nilai">
                      <TextInput
                        value={row.sampleValue}
                        onChange={(value) => updateMappingRow(row.id, { sampleValue: value })}
                        placeholder="Contoh nilai"
                      />
                    </FormField>
                    <button
                      type="button"
                      onClick={() => removeMappingRow(row.id)}
                      className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                      title="Hapus row"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {row.target ? (
                    <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                      {FIELD_MAP[row.target]?.label || row.target} â€¢ {FIELD_MAP[row.target]?.help || "Field inti di core system"}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addMappingRow}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700"
            >
              <Plus className="h-4 w-4" />
              Tambah Mapping Row
            </button>
          </SectionCard>

          <SectionCard
            title="Normalized Preview"
            subtitle="Inilah payload yang akan disiapkan untuk core system setelah mapping dan transform diterapkan."
            action={
              <button
                type="button"
                onClick={() => copyText(JSON.stringify(normalizedPreview, null, 2), () => setToast("Preview JSON disalin"))}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700"
              >
                <Copy className="h-4 w-4" />
                Copy JSON
              </button>
            }
          >
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <pre className="overflow-auto text-xs leading-6 text-slate-700">{JSON.stringify(normalizedPreview, null, 2)}</pre>
            </div>
          </SectionCard>

          <SectionCard
            title="Output Partner"
            subtitle="Field kontrak partner dan output template tetap ada, hanya dipindahkan ke langkah ringkasan agar alur inti tetap empat langkah."
            action={
              <button
                type="button"
                onClick={applyMinimalPartnerFields}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0A4D82] px-4 py-2 text-xs font-bold text-white"
              >
                <Sparkles className="h-4 w-4" />
                Auto Minimal
              </button>
            }
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                  <FileCode2 className="h-4 w-4 text-[#0A4D82]" />
                  JSON Template
                </div>
                <pre className="overflow-auto text-xs leading-6 text-slate-700">{buildJsonTemplate(selectedConfig)}</pre>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                  <FileSpreadsheet className="h-4 w-4 text-[#0A4D82]" />
                  CSV Header
                </div>
                <pre className="whitespace-pre-wrap break-words text-xs leading-6 text-slate-700">{buildCsvHeader(selectedConfig) || "Belum ada field partner-facing yang aktif."}</pre>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {Object.entries(fieldRules).map(([key, rule]) => {
                const meta = FIELD_MAP[key] || { label: key, help: key };
                return (
                  <div key={key} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-bold text-slate-900">{meta.label}</div>
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{key}</span>
                        </div>
                        <div className="mt-1 text-xs leading-5 text-slate-500">{meta.help}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => patchFieldRule(key, { active: !rule.active })}
                        className={cls("inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold", rule.active ? "bg-[#0A4D82] text-white" : "bg-slate-100 text-slate-600")}
                      >
                        {rule.active ? "Aktif" : "Nonaktif"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard
            title="Analisa & Tata Kelola"
            subtitle="Checklist dan catatan review disatukan di ringkasan agar maker, checker, dan approval melihat sumber kebenaran yang sama."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <ChecklistCard
                title="Mapping Reviewed"
                detail="Field mapping, transform, dan mandatory target sudah dicek."
                checked={review.checklist.mappingReviewed}
                onChange={(value) =>
                  patchSection("review", {
                    checklist: { ...review.checklist, mappingReviewed: value },
                  })
                }
              />
              <ChecklistCard
                title="Document Bound"
              detail="PKS, wording, dan package klausula sudah terikat ke konfigurasi."
                checked={review.checklist.documentBound}
                onChange={(value) =>
                  patchSection("review", {
                    checklist: { ...review.checklist, documentBound: value },
                  })
                }
              />
              <ChecklistCard
                title="Partner UAT"
                detail="Payload partner dan template file sudah diuji sebelum approval."
                checked={review.checklist.partnerUat}
                onChange={(value) =>
                  patchSection("review", {
                    checklist: { ...review.checklist, partnerUat: value },
                  })
                }
              />
              <ChecklistCard
                title="Sync Ready"
              detail="Konfigurasi siap dihubungkan ke core / STAR sesuai strategi sinkronisasi."
                checked={review.checklist.syncReady}
                onChange={(value) =>
                  patchSection("review", {
                    checklist: { ...review.checklist, syncReady: value },
                  })
                }
              />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <FormField label="Analisa Maker (ROM)">
                <TextAreaInput
                  value={review.makerNote}
                  onChange={(value) => patchSection("review", { makerNote: value })}
                  placeholder="Isi catatan maker."
                />
              </FormField>
              <FormField label="Analisa Reviewer (Admin UDW)">
                <TextAreaInput
                  value={review.checkerNote}
                  onChange={(value) => patchSection("review", { checkerNote: value })}
                  placeholder="Isi catatan reviewer."
                />
              </FormField>
              <FormField label="Analisa Persetujuan (HO)">
                <TextAreaInput
                  value={review.approvalNote}
                  onChange={(value) => patchSection("review", { approvalNote: value })}
                  placeholder="Isi catatan persetujuan."
                />
              </FormField>
            </div>

              <div className="mt-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-bold text-slate-900">Yang Masih Perlu Dilengkapi</div>
                  {pendingItems.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {pendingItems.map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <div className="text-sm font-medium text-amber-900">{fixDisplayText(item)}</div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </SectionCard>
        </div>
      );
    }

    if (STEP_LIST[stepIndex].id === "realisasi") {
      const rules = getOperationalFieldRules(selectedConfig);
      const jsonTemplate = buildJsonTemplate(selectedConfig);
      const csvHeader = buildCsvHeader(selectedConfig);

      return (
        <div className="space-y-4">
          <SectionCard
            title="Realisasi Contract"
            subtitle="Field mana yang benar-benar harus dikirim partner? Sisanya bisa dikunci di master policy atau diisi sistem."
            action={
              <button
                type="button"
                onClick={applyMinimalPartnerFields}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0A4D82] px-4 py-2 text-xs font-bold text-white"
              >
                <Sparkles className="h-4 w-4" />
                Auto Minimal
              </button>
            }
          >
            <div className="grid gap-3">
              {Object.entries(rules).map(([key, rule]) => {
                const meta = FIELD_MAP[key] || { label: key, help: key };
                const mapped = getUniqueMappedTargets(selectedConfig).includes(key);
                return (
                  <div key={key} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-bold text-slate-900">{meta.label}</div>
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                            {key}
                          </span>
                          <span
                            className={cls(
                              "rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
                              mapped ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                            )}
                          >
                            {mapped ? "Mapped" : "Belum Mapped"}
                          </span>
                        </div>
                        <div className="mt-1 text-xs leading-5 text-slate-500">{meta.help}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => patchFieldRule(key, { active: !rule.active })}
                        className={cls(
                          "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold",
                          rule.active ? "bg-[#0A4D82] text-white" : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {rule.active ? "Aktif" : "Nonaktif"}
                      </button>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-4">
                      <FormField label="Source of Truth">
                        <SelectInput
                          value={rule.source}
                          onChange={(value) => patchFieldRule(key, { source: value })}
                          options={SOURCE_OPTIONS}
                        />
                      </FormField>
                      <FormField label="Editability">
                        <SelectInput
                          value={rule.editable}
                          onChange={(value) => patchFieldRule(key, { editable: value })}
                          options={EDITABILITY_OPTIONS}
                        />
                      </FormField>
                      <FormField label="Default Value">
                        <TextInput
                          value={rule.defaultValue}
                          onChange={(value) => patchFieldRule(key, { defaultValue: value })}
                          placeholder="Kosongkan bila tidak ada"
                        />
                      </FormField>
                      <FormField label="Wajib Saat Realisasi">
                        <button
                          type="button"
                          onClick={() => patchFieldRule(key, { required: !rule.required, active: true })}
                          className={cls(
                            "h-11 w-full rounded-xl border text-sm font-bold",
                            rule.required
                              ? "border-[#F5A623] bg-[#FFF7E9] text-[#B86B12]"
                              : "border-slate-200 bg-white text-slate-600"
                          )}
                        >
                          {rule.required ? "Required" : "Opsional"}
                        </button>
                      </FormField>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4">
              <FormField label="Panduan untuk Partner / Operasional">
                <TextAreaInput
                  value={selectedConfig.data.realisasi.notes}
                  onChange={(value) => patchSection("realisasi", { notes: value })}
                  placeholder="Jelaskan apa yang harus dikirim partner, apa yang generated system, dan aturan validasinya."
                />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard
            title="Partner-facing Output"
            subtitle="Inilah output yang bisa dibagikan ke partner: header CSV atau kontrak JSON minimal."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <FileCode2 className="h-4 w-4 text-[#0A4D82]" />
                    JSON Template
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(jsonTemplate, () => setToast("JSON template disalin"))}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </button>
                </div>
                <pre className="overflow-auto text-xs leading-6 text-slate-700">{jsonTemplate}</pre>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <FileSpreadsheet className="h-4 w-4 text-[#0A4D82]" />
                    CSV Header
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(csvHeader, () => setToast("CSV header disalin"))}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </button>
                </div>
                <pre className="whitespace-pre-wrap break-words text-xs leading-6 text-slate-700">
                  {csvHeader || "Belum ada field partner-facing yang aktif."}
                </pre>
              </div>
            </div>
          </SectionCard>
        </div>
      );
    }

    const pendingItems = getPendingItems(selectedConfig);

    return (
      <div className="space-y-4">
        <SectionCard
          title="Governance Checklist"
          subtitle="Review screen dibuat sebagai control tower, bukan sekadar rekap form."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <ChecklistCard
              title="Mapping Reviewed"
              detail="Field mapping, transform, dan mandatory target sudah dicek."
              checked={review.checklist.mappingReviewed}
              onChange={(value) =>
                patchSection("review", {
                  checklist: { ...review.checklist, mappingReviewed: value },
                })
              }
            />
            <ChecklistCard
              title="Document Bound"
              detail="PKS, clause package, dan wording sudah terikat ke blueprint."
              checked={review.checklist.documentBound}
              onChange={(value) =>
                patchSection("review", {
                  checklist: { ...review.checklist, documentBound: value },
                })
              }
            />
            <ChecklistCard
              title="Partner UAT"
              detail="UAT partner untuk payload / file sudah dijalankan."
              checked={review.checklist.partnerUat}
              onChange={(value) =>
                patchSection("review", {
                  checklist: { ...review.checklist, partnerUat: value },
                })
              }
            />
            <ChecklistCard
              title="Sync Ready"
              detail="Blueprint siap dikirim ke core / STAR sesuai strategi sinkronisasi."
              checked={review.checklist.syncReady}
              onChange={(value) =>
                patchSection("review", {
                  checklist: { ...review.checklist, syncReady: value },
                })
              }
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Yang Masih Perlu Dilengkapi"
          subtitle="Daftar ini sengaja diprioritaskan supaya checker dan approval tidak harus membuka semua step."
          action={
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              {reviewPendingItems.length} item
            </div>
          }
        >
          {reviewPendingItems.length > 0 ? (
            <div className="space-y-3">
              {reviewPendingItems.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div className="text-sm font-medium text-amber-900">{item}</div>
                </div>
              ))}
            </div>
          ) : null}
        </SectionCard>

        <SectionCard
          title="Rencana Sinkronisasi"
          subtitle="Ringkasan keputusan otomatis terhadap core database / STAR."
        >
          <div className="grid gap-3 md:grid-cols-3">
            <MiniReviewCard
              title="Cek Existing PKS"
              value={blueprint.starCheckMode}
              note="AUTO_CHECK, force existing, atau force new."
            />
            <MiniReviewCard
              title="Jika Sudah Ada"
              value={blueprint.ifExists}
              note="Biasanya endorsement atau pakai nomor existing."
            />
            <MiniReviewCard
              title="Jika Belum Ada"
              value={blueprint.ifMissing}
              note="Buat nomor baru atau block & review."
            />
          </div>
        </SectionCard>

        <SectionCard title="Komentar Review" subtitle="Catatan per role untuk menjaga governance tetap rapi.">
          <div className="grid gap-4 md:grid-cols-3">
            <FormField label="Maker Note">
              <TextAreaInput
                value={review.makerNote}
                onChange={(value) => patchSection("review", { makerNote: value })}
                placeholder="Catatan maker"
              />
            </FormField>
            <FormField label="Checker Note">
              <TextAreaInput
                value={review.checkerNote}
                onChange={(value) => patchSection("review", { checkerNote: value })}
                placeholder="Catatan checker"
              />
            </FormField>
            <FormField label="Approval Note">
              <TextAreaInput
                value={review.approvalNote}
                onChange={(value) => patchSection("review", { approvalNote: value })}
                placeholder="Catatan approval"
              />
            </FormField>
          </div>
        </SectionCard>

        <SectionCard title="Audit Trail" subtitle="Riwayat perubahan konfigurasi.">
          <div className="space-y-3">
            {(selectedConfig.audit || []).map((item, index) => (
              <div key={`${item.at}-${index}`} className="flex gap-3">
                <div className="flex w-8 shrink-0 justify-center">
                  <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[#0A4D82]" />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="text-sm font-bold text-slate-900">{item.action}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {item.actor} â€¢ {item.at}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    );
  }

  function renderLifeGuardStudio() {
    if (!selectedConfig || selectedConfig.family !== "group-pa") return null;

    const blueprint = selectedConfig.data.blueprint;
    const master = selectedConfig.data.master;
    const review = selectedConfig.data.review;
    const statusMeta = getLifeGuardStatusMeta(selectedConfig.status);
    const roleMeta = getLifeGuardRoleMeta(role);
    const lifeGuardComputed = getLifeGuardComputed(master);
    const currencyCode = lifeGuardComputed.currencyCode;
    const totalDaysLabel = getLifeGuardTotalDays(blueprint.startDate, blueprint.endDate);
    const ageInvalid = Number(master.ageMin || 0) > Number(master.ageMax || 0);
    const canEdit = (role === "Maker" && selectedConfig.status === "Draft") || (role === "Checker" && selectedConfig.status === "Checker");
    const noteField = getLifeGuardReviewField(role);
    const noteValue = review?.[noteField] || "";
    const selectedClauses = getLifeGuardSelectedClauseList(master);
    const referenceCode = getLifeGuardReferenceCode(selectedConfig);
    const showSuccess = selectedConfig.status === "Active";
    const showReviewSummary = !showSuccess && role === "Approval";
    const showEntry = !showSuccess && role !== "Approval";
    const lifeGuardPendingItems = getPendingItems(selectedConfig);
    const lifeGuardReadiness = getReadiness(selectedConfig);
    const lifeGuardBeneficiary = `${String(blueprint.insuredName || selectedConfig.partnerName || "-").toUpperCase()}${
      blueprint.qqTambahan ? ` ${String(blueprint.qqTambahan).toUpperCase()}` : ""
    }`;
    const lifeGuardPeriodLabel = `${blueprint.startDate || "-"} s/d ${blueprint.endDate || "-"}`;
    const lifeGuardPremiumText =
      lifeGuardComputed.criteria === "antara"
        ? `${currencyCode} ${formatRupiah(lifeGuardComputed.premiumMin)} - ${formatRupiah(lifeGuardComputed.premiumMax)}`
        : `${currencyCode} ${formatRupiah(lifeGuardComputed.premiumMin)}`;
    const lifeGuardSummaryRows = [
      { label: "Nomor Polis Induk / PKS", value: master.masterPolicyNo || blueprint.agreementNo || "-" },
      { label: "Jenis Produk", value: master.coverageType || "-" },
      { label: "Kelas Risiko", value: master.riskClass || "-" },
    ];
    const lifeGuardFeeRows = [
      { label: "Biaya Polis", value: `${currencyCode} ${master.adminFee || "0"}` },
      { label: "Biaya Meterai", value: master.stampDuty || "Sesuai STAR" },
      { label: "Brokerage / Komisi", value: `${master.commissionPercent || "0"}%` },
    ];
    const lifeGuardDetailItems = [
      { label: "Penerima Manfaat", value: lifeGuardBeneficiary },
      { label: "Nomor Polis Induk / PKS", value: master.masterPolicyNo || blueprint.agreementNo || "-" },
      { label: "Jangka Waktu Pertanggungan", value: lifeGuardPeriodLabel },
      { label: "Jenis Produk / Pertanggungan", value: master.coverageType || "-" },
      { label: "NP Meninggal Dunia (A)", value: lifeGuardComputed.npAText },
      { label: "NP Cacat Tetap (B)", value: lifeGuardComputed.npBText },
      { label: "NP Pengobatan (C)", value: lifeGuardComputed.npCText },
      { label: "Batasan Usia", value: `${master.ageMin || "-"} - ${master.ageMax || "-"} Thn` },
      { label: "Kelas Risiko", value: master.riskClass || "-" },
      { label: "Risk Exposure", value: master.riskExposure || "-" },
      { label: "Rate Premi (‰)", value: master.baseRate || "-" },
      { label: "Premi", value: lifeGuardPremiumText },
    ];
    const lifeGuardChecklistItems = [
      {
        key: "mappingReviewed",
        title: "Mapping Reviewed",
        detail: "Field mapping, transform, dan mandatory target sudah dicek.",
        checked: Boolean(review.checklist.mappingReviewed),
      },
      {
        key: "documentBound",
        title: "Document Bound",
        detail: "PKS, wording, dan package klausula sudah terikat ke konfigurasi.",
        checked: Boolean(review.checklist.documentBound),
      },
      {
        key: "partnerUat",
        title: "Partner UAT",
        detail: "Payload partner dan template file sudah diuji sebelum approval.",
        checked: Boolean(review.checklist.partnerUat),
      },
      {
        key: "syncReady",
        title: "Sync Ready",
        detail: "Konfigurasi siap dihubungkan ke core / STAR sesuai strategi sinkronisasi.",
        checked: Boolean(review.checklist.syncReady),
      },
    ];
    const formInputClass =
      "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[13px] font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
    const formInputDisabledClass = "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-500";
    const classicLabelClass = "text-[11px] font-bold uppercase text-[#004d7a]";
    const toggleLifeGuardChecklist = (key, value) =>
      patchSection("review", {
        checklist: { ...review.checklist, [key]: value },
      });
    const modalMeta = {
      TO_UDW: {
        title: "Kirim ke Admin UDW untuk tahap Checker?",
        icon: <ChevronRight className="h-7 w-7 text-blue-600" />,
      },
      REJECT: {
        title: "Tolak konfigurasi ini?",
        icon: <X className="h-7 w-7 text-red-600" />,
      },
      RETURN_MAKER: {
        title: "Kembalikan dokumen ke Maker?",
        icon: <ArrowLeft className="h-7 w-7 text-orange-500" />,
      },
      TO_HO: {
        title: "Teruskan dokumen ke Approver HO?",
        icon: <ChevronRight className="h-7 w-7 text-indigo-600" />,
      },
      RETURN_UDW: {
        title: "Kembalikan ke Admin UDW?",
        icon: <ArrowLeft className="h-7 w-7 text-blue-600" />,
      },
      ISSUE: {
        title: "Setujui & terbitkan polis secara resmi?",
        icon: <CheckCircle2 className="h-7 w-7 text-emerald-600" />,
      },
      RESET: {
        title: "Reset simulator ke awal? Semua progres akan hilang.",
        icon: <RefreshCcw className="h-7 w-7 text-slate-600" />,
      },
    }[lifeGuardPendingAction];

    const renderActionButtons = () => {
      if (selectedConfig.status === "Draft") {
        if (role === "Maker") {
          return (
            <button
              type="button"
              onClick={() => openLifeGuardAction("TO_UDW")}
              className="rounded-xl bg-[#004d7a] px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-[#003554]"
            >
              Kirim ke Checker
            </button>
          );
        }
        return <div className="text-[10px] font-bold uppercase italic text-slate-400">Draft stage - menunggu maker...</div>;
      }

      if (selectedConfig.status === "Checker") {
        if (role === "Checker") {
          return (
            <>
              <button type="button" onClick={() => openLifeGuardAction("REJECT")} className="rounded-xl bg-red-600 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-red-700">
                Tolak
              </button>
              <button type="button" onClick={() => openLifeGuardAction("RETURN_MAKER")} className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 transition hover:bg-slate-50">
                Kembali ke Maker
              </button>
              <button type="button" onClick={() => openLifeGuardAction("TO_HO")} className="rounded-xl bg-[#004d7a] px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-[#003a5c]">
                Forward ke Approval
              </button>
            </>
          );
        }
        return <div className="text-[10px] font-bold uppercase italic tracking-tight text-blue-600">Checker stage - ganti peran ke admin UDW...</div>;
      }

      if (selectedConfig.status === "Approval") {
        if (role === "Approval") {
          return (
            <>
              <button type="button" onClick={() => openLifeGuardAction("REJECT")} className="rounded-xl bg-red-600 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-red-700">
                Tolak
              </button>
              <button type="button" onClick={() => openLifeGuardAction("RETURN_UDW")} className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 transition hover:bg-slate-50">
                Kembali ke Admin UDW
              </button>
              <button type="button" onClick={() => openLifeGuardAction("RETURN_MAKER")} className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 transition hover:bg-slate-50">
                Kembali ke Maker
              </button>
              <button type="button" onClick={() => openLifeGuardAction("ISSUE")} className="rounded-xl bg-emerald-600 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-emerald-700">
                Setuju
              </button>
            </>
          );
        }
        return <div className="text-[10px] font-bold uppercase italic tracking-tight text-indigo-600">Approval stage - ganti peran ke HO UDW...</div>;
      }

      return null;
    };

    return (
      <div className="min-h-screen bg-[#f4f7fa] text-slate-800">
        <AppProductHeader
          sessionName={sessionName}
          sessionRoleLabel={sessionRoleLabel}
          accountInitials={accountMeta.initials}
          onHome={exitToShell}
          accountMenuOpen={headerAccountMenuOpen}
          onToggleAccountMenu={() => setHeaderAccountMenuOpen((current) => !current)}
          accountMenuItems={accountMenuItems}
        />

        <main className="relative">
          {toast ? (
            <div className="pointer-events-none fixed right-4 top-20 z-[70]">
              <div className="rounded-xl border border-white/10 bg-slate-900 px-5 py-3 text-[10px] font-black text-white shadow-2xl">
                {toast.toUpperCase()}
              </div>
            </div>
          ) : null}

          {!showSuccess ? (
            <header className="relative overflow-hidden bg-[#0A4D82] pb-7 md:pb-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.20),transparent_28%),radial-gradient(circle_at_80%_25%,rgba(255,255,255,0.14),transparent_24%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.12),transparent_24%)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0A4D82]/60 to-[#0A4D82]/75" />
              <div className="relative mx-auto max-w-[1800px] px-4 pt-4 md:px-6 md:pt-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={backToCatalog}
                      className="inline-flex items-center gap-2 rounded-[8px] border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 focus-visible:ring-4 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A4D82]"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Kembali ke Daftar Konfigurasi
                    </button>
                  </div>
                </div>

                <div className="mt-4 text-center text-white md:mt-5">
                  <div className="inline-flex rounded-full bg-white/10 px-3.5 py-1 text-[12px] font-medium text-white/90 md:px-4 md:py-1.5 md:text-sm">
                    Selamat datang kembali, {accountMeta.name}
                  </div>
                  <h1 className="mt-3 text-[28px] font-bold tracking-tight md:mt-4 md:text-[40px]">
                    {fixDisplayText(studioHeroTitle)}
                  </h1>
                  <p className="mx-auto mt-1.5 max-w-3xl text-[13px] leading-6 text-white/90 md:mt-2 md:text-[17px] md:leading-7">
                    {fixDisplayText(selectedCardMeta?.description || "Pengaturan partner disesuaikan per produk dan dikelola langsung dari portal internal.")}
                  </p>
                </div>

                <StudioJourneySteps
                  stepIndex={stepIndex}
                  stepState={stepState}
                  maxUnlockedStep={maxUnlockedStep}
                  onSelect={(nextStep) => setStepIndex(nextStep)}
                />

                <div className="mt-4 flex justify-center">
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/95 p-1.5 shadow-lg shadow-black/10 backdrop-blur">
                      <div className="flex items-center px-2">
                        <span className="mr-2 whitespace-nowrap text-[9px] font-black uppercase text-slate-400">Ganti Peran:</span>
                        <select
                          value={role}
                          onChange={(event) => updateRole(event.target.value)}
                          className="rounded-lg bg-transparent px-3 py-1 text-[11px] font-black text-[#004d7a] outline-none ring-0"
                        >
                          <option value="Maker">ROM (MAKER)</option>
                          <option value="Checker">ADMIN UDW (CHECKER)</option>
                          <option value="Approval">HO UDW (APPROVAL)</option>
                        </select>
                      </div>
                      <div className="mx-1 h-6 w-px bg-slate-200" />
                      <button
                        type="button"
                        onClick={() => openLifeGuardAction("RESET")}
                        className="rounded-lg border border-red-100 bg-white px-3 py-1 text-[10px] font-black uppercase text-red-500 transition hover:bg-red-50"
                      >
                        <span className="inline-flex items-center gap-1">
                          <RefreshCcw className="h-3.5 w-3.5" />
                          Reset
                        </span>
                      </button>
                    </div>
                    <div className={cls("flex h-10 w-10 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-lg shadow-black/10", roleMeta.tone)}>
                      {roleMeta.avatar}
                    </div>
                  </div>
                </div>
              </div>
            </header>
          ) : null}

          <div className="mx-auto max-w-6xl px-4 py-5 md:px-6">
            <div className="pb-40">
                {showSuccess ? (
                  <div className="animate-fade-in py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-green-200 bg-green-100 text-green-500 shadow-sm">
                        <CheckCircle2 className="h-10 w-10" />
                      </div>
                      <h2 className="mb-2 text-2xl font-bold uppercase tracking-tight text-slate-800">Configuration Active</h2>
                      <p className="mb-8 text-sm text-slate-500">
                        Production ready for <span className="font-bold text-slate-700">{blueprint.insuredName || selectedConfig.partnerName}</span>.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-4">
                        <button type="button" onClick={resetLifeGuardWorkflow} className="rounded-xl bg-[#004d7a] px-8 py-3 text-xs font-black uppercase text-white shadow-lg transition hover:bg-[#003554]">
                          Start New Config
                        </button>
                        <button type="button" onClick={editLifeGuardFromSuccess} className="rounded-xl border-2 border-[#004d7a] bg-white px-8 py-3 text-xs font-black uppercase text-[#004d7a] shadow-md transition hover:bg-slate-50">
                          Edit Existing Config
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {showEntry ? (
                  <div>
                    <div className="sticky top-0 z-20 mb-6 flex overflow-x-auto rounded-t-2xl border-b border-slate-200 bg-white shadow-sm">
                      {STEP_LIST.map((step, index) => (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => setStepIndex(index)}
                          className={cls(
                            "whitespace-nowrap border-b-[3px] px-7 py-3.5 text-[11px] font-extrabold uppercase tracking-[0.05em] transition",
                            stepIndex === index
                              ? "border-[#004d7a] bg-[rgba(0,77,122,0.03)] text-[#004d7a]"
                              : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                          )}
                        >
                          {index + 1}. {step.label}
                        </button>
                      ))}
                    </div>

                    {stepIndex === 0 ? (
                      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="p-8">
                          <div className="grid grid-cols-1 gap-x-8 gap-y-6 text-slate-700 md:grid-cols-2">
                            <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-4 md:col-span-2">
                              <label className="mb-2 flex items-center text-[10px] font-extrabold uppercase tracking-[0.05em] text-blue-700">
                                Kode Tertanggung <span className="ml-1 text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={blueprint.insuredCode || ""}
                                onChange={(event) => patchSection("blueprint", { insuredCode: onlyDigits(event.target.value) })}
                                disabled={!canEdit}
                                className={cls(formInputClass, "border-blue-200 text-base font-black text-blue-800 shadow-sm", !canEdit && formInputDisabledClass)}
                              />
                            </div>

                            <div>
                              <label className="mb-2 flex text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-400">Nama Tertanggung</label>
                              <input type="text" value={String(blueprint.insuredName || "").toUpperCase()} disabled className={cls(formInputClass, formInputDisabledClass, "font-bold uppercase text-slate-900")} />
                            </div>
                            <div>
                              <label className="mb-2 flex text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-400">NPWP</label>
                              <input type="text" value={blueprint.npwp || ""} disabled className={cls(formInputClass, formInputDisabledClass, "font-medium")} />
                            </div>
                            <div className="md:col-span-2">
                              <label className="mb-2 flex text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-400">Alamat Korespondensi</label>
                              <textarea value={blueprint.address || ""} rows={2} disabled className={cls("min-h-[78px]", formInputClass, formInputDisabledClass, "resize-none font-medium")} />
                            </div>
                            <div>
                              <label className="mb-2 flex items-center text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-600">
                                Email Korespondensi <span className="ml-1 text-red-500">*</span>
                              </label>
                              <input
                                type="email"
                                value={blueprint.correspondenceEmail || blueprint.ownerEmail || ""}
                                onChange={(event) => patchSection("blueprint", { correspondenceEmail: event.target.value, ownerEmail: event.target.value })}
                                disabled={!canEdit}
                                className={cls(formInputClass, "font-medium lowercase", !canEdit && formInputDisabledClass)}
                              />
                            </div>

                            <div className="grid grid-cols-1 gap-8 border-t border-slate-50 pt-6 md:col-span-2 md:grid-cols-2">
                              <div>
                                <label className="mb-2 flex items-center text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-600">
                                  Kode Akuisisi <span className="ml-1 text-red-500">*</span>
                                </label>
                                <select
                                  value={blueprint.acquisitionCode || LIFE_GUARD_ACQUISITION_OPTIONS[1]}
                                  onChange={(event) => patchSection("blueprint", { acquisitionCode: event.target.value })}
                                  disabled={!canEdit}
                                  className={cls(formInputClass, "font-bold shadow-sm", !canEdit && formInputDisabledClass)}
                                >
                                  {LIFE_GUARD_ACQUISITION_OPTIONS.map((item) => (
                                    <option key={item} value={item}>
                                      {item}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="mb-2 flex items-center text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-600">
                                  Nomor Polis Induk / Nomor PKS <span className="ml-1 text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={master.masterPolicyNo || blueprint.agreementNo || ""}
                                  onChange={(event) => {
                                    patchSection("master", { masterPolicyNo: event.target.value });
                                    patchSection("blueprint", { agreementNo: event.target.value });
                                  }}
                                  disabled={!canEdit}
                                  className={cls(formInputClass, "font-bold uppercase", !canEdit && formInputDisabledClass)}
                                />
                              </div>
                            </div>

                            <div className="border-t border-slate-50 pt-6 md:col-span-2">
                              <label className="mb-2 flex text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-600">Daftar QQ Tambahan</label>
                              <textarea
                                rows={2}
                                value={blueprint.qqTambahan || ""}
                                onChange={(event) => patchSection("blueprint", { qqTambahan: event.target.value })}
                                disabled={!canEdit}
                                placeholder="Masukkan QQ jika ada..."
                                className={cls("min-h-[78px] resize-none font-medium", formInputClass, !canEdit && formInputDisabledClass)}
                              />
                            </div>

                            <div className="border-t border-slate-50 pt-6 md:col-span-2">
                              <label className="mb-2 flex items-center text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-600">
                                Jangka Waktu Pertanggungan <span className="ml-1 text-red-500">*</span>
                              </label>
                              <div className="flex flex-wrap items-center gap-4">
                                <input type="date" value={blueprint.startDate || ""} onChange={(event) => patchSection("blueprint", { startDate: event.target.value })} disabled={!canEdit} className={cls(formInputClass, "w-48 font-bold shadow-sm", !canEdit && formInputDisabledClass)} />
                                <span className="text-[10px] font-bold uppercase text-slate-400">s/d</span>
                                <input type="date" value={blueprint.endDate || ""} onChange={(event) => patchSection("blueprint", { endDate: event.target.value })} disabled={!canEdit} className={cls(formInputClass, "w-48 font-bold shadow-sm", !canEdit && formInputDisabledClass)} />
                                <span className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] font-black uppercase tracking-tight text-blue-700 shadow-sm">{totalDaysLabel}</span>
                              </div>
                            </div>

                            <div className="space-y-4 border-t border-slate-50 pt-6 md:col-span-2">
                              <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <Upload className="h-4 w-4 text-blue-600" />
                                Unggah Dokumen PKS & Lampiran <span className="text-red-500">*</span>
                              </h4>
                              <div className="cursor-pointer rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/10 p-8 text-center font-bold text-blue-400 transition hover:border-blue-400">
                                <Upload className="mx-auto mb-3 h-8 w-8" />
                                <p className="text-xs tracking-tight">Klik atau seret file ke sini</p>
                                <input type="file" className="hidden" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {stepIndex === 1 ? (
                      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="p-8 text-slate-700">
                          <div className="mx-auto max-w-4xl space-y-6">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                              <div className="md:w-1/3">
                                <div className={classicLabelClass}>Jenis Pertanggungan <span className="text-red-500">*</span></div>
                              </div>
                              <div className="md:w-2/3">
                                <select
                                  value={master.coverageType || LIFE_GUARD_COVERAGE_OPTIONS[0]}
                                  onChange={(event) => patchSection("master", { coverageType: event.target.value, productCode: event.target.value.split(" - ")[0], productName: event.target.value })}
                                  disabled={!canEdit}
                                  className={cls(formInputClass, "w-full md:w-3/4 shadow-sm", !canEdit && formInputDisabledClass)}
                                >
                                  <option value="">-- Pilih --</option>
                                  {LIFE_GUARD_COVERAGE_OPTIONS.map((item) => (
                                    <option key={item} value={item}>
                                      {item}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 md:flex-row md:items-start">
                              <div className="md:w-1/3">
                                <div className={classicLabelClass}>Batasan Usia Peserta <span className="text-red-500">*</span></div>
                              </div>
                              <div className="md:w-2/3">
                                <div className="flex items-center gap-3">
                                  <input type="number" value={master.ageMin || ""} onChange={(event) => patchSection("master", { ageMin: onlyDigits(event.target.value) })} disabled={!canEdit} className={cls(formInputClass, "w-24 text-center font-bold shadow-sm", !canEdit && formInputDisabledClass)} />
                                  <span className="font-bold text-slate-400">-</span>
                                  <input type="number" value={master.ageMax || ""} onChange={(event) => patchSection("master", { ageMax: onlyDigits(event.target.value) })} disabled={!canEdit} className={cls(formInputClass, "w-24 text-center font-bold shadow-sm", !canEdit && formInputDisabledClass)} />
                                </div>
                                {ageInvalid ? <div className="mt-1 text-xs font-bold text-red-500">Minimal usia tidak boleh melebihi maksimal</div> : null}
                              </div>
                            </div>

                            <div className="border-t border-slate-50 pt-6">
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                                <div className="lg:w-1/3">
                                  <div className={classicLabelClass}>Kriteria Validasi Santunan <span className="text-red-500">*</span></div>
                                </div>
                                <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-center">
                                  <select value={master.npCriteria || "antara"} onChange={(event) => patchSection("master", { npCriteria: event.target.value })} disabled={!canEdit} className={cls(formInputClass, "w-60 font-bold text-blue-800", !canEdit && formInputDisabledClass)}>
                                    <option value="setara">Setara dengan</option>
                                    <option value="antara">Antara (Min & Maks)</option>
                                    <option value="lebih_besar">Lebih besar dari</option>
                                    <option value="kurang_dari">Kurang dari</option>
                                  </select>
                                  <div className="flex items-center gap-2">
                                    <span className="whitespace-nowrap text-[10px] font-black uppercase text-[#004d7a]">
                                      Mata Uang <span className="text-red-500">*</span>
                                    </span>
                                    <select value={master.currencyCode || LIFE_GUARD_CURRENCY_OPTIONS[0]} onChange={(event) => patchSection("master", { currencyCode: event.target.value })} disabled={!canEdit} className={cls(formInputClass, "w-40 bg-yellow-50 font-bold text-slate-900 shadow-inner", !canEdit && formInputDisabledClass)}>
                                      {LIFE_GUARD_CURRENCY_OPTIONS.map((item) => (
                                        <option key={item} value={item}>
                                          {item}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex flex-col gap-3 md:flex-row md:items-start">
                                <div className="pt-2 md:w-1/3">
                                  <div className={classicLabelClass}>NP Meninggal Dunia (A) <span className="text-red-500">*</span></div>
                                </div>
                                <div className="flex items-center gap-3 md:w-2/3">
                                  <input type="text" value={master.npAMin || ""} onChange={(event) => patchSection("master", { npAMin: formatNumber(event.target.value) })} disabled={!canEdit} className={cls(formInputClass, "w-44 text-right font-black text-[#004d7a] shadow-sm", !canEdit && formInputDisabledClass)} />
                                  {master.npCriteria === "antara" ? <span className="font-bold text-slate-400">-</span> : null}
                                  {master.npCriteria === "antara" ? (
                                    <input type="text" value={master.npAMax || ""} onChange={(event) => patchSection("master", { npAMax: formatNumber(event.target.value) })} disabled={!canEdit} className={cls(formInputClass, "w-44 text-right font-black text-[#004d7a] shadow-sm", !canEdit && formInputDisabledClass)} />
                                  ) : null}
                                </div>
                              </div>

                              <div className="flex flex-col gap-3 md:flex-row md:items-start">
                                <div className="pt-2 md:w-1/3">
                                  <div className={classicLabelClass}>NP Cacat Tetap (B)</div>
                                </div>
                                <div className="flex items-center gap-4 md:w-2/3">
                                  <div className="relative w-24">
                                    <input type="number" value={master.npBPercent || "100"} onChange={(event) => patchSection("master", { npBPercent: onlyDigits(event.target.value) })} disabled={!canEdit} className={cls(formInputClass, "pr-8 text-center font-bold", !canEdit && formInputDisabledClass)} />
                                    <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
                                  </div>
                                  <div className="min-w-[200px] rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] font-black text-blue-700 shadow-sm">
                                    {lifeGuardComputed.npBText}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col gap-3 md:flex-row md:items-start">
                                <div className="pt-2 md:w-1/3">
                                  <div className={classicLabelClass}>NP Pengobatan (C)</div>
                                </div>
                                <div className="flex items-center gap-4 md:w-2/3">
                                  <div className="relative w-24">
                                    <input type="number" value={master.npCPercent || "10"} onChange={(event) => patchSection("master", { npCPercent: onlyDigits(event.target.value) })} disabled={!canEdit} className={cls(formInputClass, "pr-8 text-center font-bold", !canEdit && formInputDisabledClass)} />
                                    <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
                                  </div>
                                  <div className="min-w-[200px] rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] font-black text-blue-700 shadow-sm">
                                    {lifeGuardComputed.npCText}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="grid gap-8 border-t border-slate-50 pt-6 md:grid-cols-2">
                              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                                <div className="md:w-1/2">
                                  <div className={classicLabelClass}>Kelas Risiko <span className="text-red-500">*</span></div>
                                </div>
                                <div className="md:w-1/2">
                                  <select value={master.riskClass || "Kelas III"} onChange={(event) => patchSection("master", { riskClass: event.target.value })} disabled={!canEdit} className={cls(formInputClass, "font-bold shadow-sm", !canEdit && formInputDisabledClass)}>
                                    <option value="">-- Pilih --</option>
                                    <option value="Kelas I">Kelas I</option>
                                    <option value="Kelas II">Kelas II</option>
                                    <option value="Kelas III">Kelas III</option>
                                    <option value="Kelas IV">Kelas IV</option>
                                    <option value="Single Rate">Single Rate</option>
                                  </select>
                                </div>
                              </div>

                              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                                <div className="md:w-1/2">
                                  <div className={classicLabelClass}>Risk Exposure <span className="text-red-500">*</span></div>
                                </div>
                                <div className="md:w-1/2">
                                  <select value={master.riskExposure || "Tersebar"} onChange={(event) => patchSection("master", { riskExposure: event.target.value })} disabled={!canEdit} className={cls(formInputClass, "font-bold shadow-sm", !canEdit && formInputDisabledClass)}>
                                    <option value="Tersebar">Tersebar</option>
                                    <option value="Terlokalisir">Terlokalisir</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-3 border-t border-slate-50 pt-6 md:flex-row md:items-center">
                              <div className="md:w-1/3">
                                <div className={classicLabelClass}>Rate Premi (‰)</div>
                              </div>
                              <div className="flex items-center gap-2 md:w-2/3">
                                <input
                                  type="text"
                                  value={master.baseRate || ""}
                                  onChange={(event) => patchSection("master", { baseRate: event.target.value.replace(/[^0-9,]/g, "").replace(/(,.*?),(.*)/g, "$1$2") })}
                                  disabled={!canEdit}
                                  className={cls(formInputClass, "w-24 text-center font-black text-blue-600 shadow-sm", !canEdit && formInputDisabledClass)}
                                />
                                <span className="text-xs font-black text-slate-500">‰</span>
                              </div>
                            </div>

                            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                              <div className="md:w-1/3">
                                <div className={classicLabelClass}>Premi <span className="text-red-500">*</span></div>
                              </div>
                              <div className="flex items-center gap-3 md:w-2/3">
                                <input type="text" value={formatRupiah(lifeGuardComputed.premiumMin)} readOnly className={cls(formInputClass, "w-44 text-right font-bold text-[#004d7a] shadow-sm", "bg-slate-50")} />
                                {master.npCriteria === "antara" ? <span className="font-bold text-slate-400">-</span> : null}
                                {master.npCriteria === "antara" ? <input type="text" value={formatRupiah(lifeGuardComputed.premiumMax)} readOnly className={cls(formInputClass, "w-44 text-right font-bold text-[#004d7a] shadow-sm", "bg-slate-50")} /> : null}
                              </div>
                            </div>

                            <div className="flex flex-col gap-3 border-t border-slate-50 pt-6 md:flex-row md:items-center">
                              <div className="md:w-1/3">
                                <div className={classicLabelClass}>Risiko Sendiri (Deductible)</div>
                              </div>
                              <div className="md:w-2/3">
                                <textarea rows={2} value={master.deductible || ""} onChange={(event) => patchSection("master", { deductible: event.target.value })} disabled={!canEdit} className={cls("min-h-[78px] resize-none font-medium", formInputClass, !canEdit && formInputDisabledClass)} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {stepIndex === 2 ? (
                      <div className="mb-6 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
                        <div className="space-y-10 bg-white p-8 text-[11px] text-slate-600">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-700">
                              <FileCode2 className="h-5 w-5" />
                              Wording
                            </div>
                            <div className="flex flex-wrap gap-10 pl-4 text-slate-700">
                              {WORDING_OPTIONS.map((item) => (
                                <label key={item} className="flex cursor-pointer items-center gap-3">
                                  <input type="radio" name="wording_type" checked={master.wordingType === item} onChange={() => patchSection("master", { wordingType: item })} disabled={!canEdit} className="h-4 w-4 text-blue-600 shadow-sm" />
                                  <span className="font-bold uppercase tracking-tight text-slate-700">{item}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-700">
                              <ClipboardList className="h-5 w-5" />
                              Klausul
                            </div>
                            <div className="grid grid-cols-1 gap-x-12 gap-y-4 pl-4 text-slate-700 md:grid-cols-2">
                              {LIFE_GUARD_ADDITIONAL_CLAUSE_LIBRARY.map((item) => (
                                <label key={item.title} className="flex cursor-pointer items-center gap-3">
                                  <input type="checkbox" checked={(master.clausePackage || []).includes(item.title)} onChange={() => toggleClause(item.title)} disabled={!canEdit} className="h-4 w-4 rounded text-blue-600 shadow-sm" />
                                  <span className="font-semibold">{item.title}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4 border-t border-slate-100 pt-8 text-slate-700">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-700">
                              <NotebookPen className="h-5 w-5" />
                              Klausul Tambahan / Subjectivity
                            </div>
                            <div className="grid grid-cols-1 gap-8 rounded-2xl border border-blue-100 bg-[#f8faff] p-6 shadow-sm md:grid-cols-2">
                              <div className="space-y-4 text-slate-800">
                                <input
                                  type="text"
                                  value={master.additionalClauseTitle || ""}
                                  onChange={(event) => patchSection("master", { additionalClauseTitle: event.target.value })}
                                  disabled={!canEdit}
                                  placeholder="Judul Klausula..."
                                  className={cls(formInputClass, "text-[11px] font-black", !canEdit && formInputDisabledClass)}
                                />
                                <textarea
                                  rows={4}
                                  value={master.additionalClauseDescription || ""}
                                  onChange={(event) => patchSection("master", { additionalClauseDescription: event.target.value })}
                                  disabled={!canEdit}
                                  placeholder="Deskripsi Klausula..."
                                  className={cls("min-h-[112px] resize-none border-slate-200 text-xs font-medium", formInputClass, !canEdit && formInputDisabledClass)}
                                />
                                <button
                                  type="button"
                                  onClick={addLifeGuardCustomClause}
                                  disabled={!canEdit}
                                  className={cls("flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[10px] font-black uppercase text-white shadow-lg transition", canEdit ? "bg-blue-600 hover:bg-blue-700" : "cursor-not-allowed bg-slate-400")}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                  Tambahkan Klausula
                                </button>
                              </div>
                              <div className="flex flex-col justify-start">
                                <div className="max-h-[220px] space-y-3 overflow-y-auto py-2 pr-2">
                                  {(master.customClauses || []).length === 0 ? (
                                    <div className="py-16 text-center text-[10px] font-black uppercase tracking-widest text-slate-300 opacity-50">Belum ada tambahan</div>
                                  ) : (
                                    (master.customClauses || []).map((item) => (
                                      <div key={item.id} className="group relative mb-2 rounded-xl border border-slate-200 bg-white p-3 text-left text-slate-800 shadow-sm transition-all hover:border-blue-200">
                                        <div className="flex items-start gap-3">
                                          <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                                          <div className="flex-1 pr-6">
                                            <span className="block text-[10px] font-black text-blue-800">{item.title}</span>
                                            <p className="mt-1 text-[9px] font-medium italic leading-relaxed text-slate-500">{item.description}</p>
                                          </div>
                                          {canEdit ? (
                                            <button type="button" onClick={() => removeLifeGuardCustomClause(item.id)} className="absolute right-3 top-3 p-1 text-slate-300 opacity-0 transition-colors group-hover:opacity-100 hover:text-red-500">
                                              <X className="h-3.5 w-3.5" />
                                            </button>
                                          ) : null}
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {stepIndex === 3 ? (
                      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="p-8">
                          <div className="mb-10 grid grid-cols-1 gap-8 text-slate-700 md:grid-cols-2">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                              <div className="md:w-1/2">
                                <div className={classicLabelClass}>Biaya Polis <span className="text-red-500">*</span></div>
                              </div>
                              <div className="md:w-1/2">
                                <input type="text" value={master.adminFee || ""} onChange={(event) => patchSection("master", { adminFee: formatNumber(event.target.value) })} disabled={!canEdit} className={cls(formInputClass, "font-bold shadow-sm", !canEdit && formInputDisabledClass)} />
                              </div>
                            </div>
                            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                              <div className="md:w-1/2">
                                <div className={classicLabelClass}>Biaya Materai (Sesuai Star)</div>
                              </div>
                              <div className="md:w-1/2">
                                <input type="text" value={master.stampDuty || "Sesuai STAR"} disabled className={cls(formInputClass, formInputDisabledClass, "text-center font-bold shadow-sm")} />
                              </div>
                            </div>
                            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                              <div className="md:w-1/2">
                                <div className={classicLabelClass}>Diskon (%)</div>
                              </div>
                              <div className="md:w-1/2">
                                <input type="number" value={master.discountPercent || "0"} onChange={(event) => patchSection("master", { discountPercent: onlyDigits(event.target.value) })} disabled={!canEdit} className={cls(formInputClass, "font-bold shadow-sm", !canEdit && formInputDisabledClass)} />
                              </div>
                            </div>
                            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                              <div className="md:w-1/2">
                                <div className={classicLabelClass}>Brokerage / Komisi (%)</div>
                              </div>
                              <div className="md:w-1/2">
                                <input type="number" value={master.commissionPercent || "15"} onChange={(event) => patchSection("master", { commissionPercent: onlyDigits(event.target.value) })} disabled={!canEdit} className={cls(formInputClass, "font-bold shadow-sm", !canEdit && formInputDisabledClass)} />
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-8">
                            <h4 className="mb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Pratinjau Data Pertanggungan</h4>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-400">Limit Meninggal (A)</p>
                                <p className="text-[11px] font-black text-blue-800">{lifeGuardComputed.npAText}</p>
                              </div>
                              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-400">Jangka Waktu</p>
                                <p className="text-[11px] font-black text-slate-700">{`${blueprint.startDate || "-"} s/d ${blueprint.endDate || "-"}`}</p>
                              </div>
                              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-400">Rate Premi (‰)</p>
                                <p className="text-[11px] font-black text-slate-700">{master.baseRate ? `${master.baseRate} ‰` : "-"}</p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                            <div className="space-y-6">
                              <LifeGuardConfigurationSnapshotCard items={lifeGuardDetailItems} />
                              <LifeGuardConfigurationReviewCard
                                readiness={lifeGuardReadiness}
                                statusLabel={statusMeta.label}
                                roleLabel={roleMeta.shortLabel}
                                referenceCode={referenceCode}
                                periodLabel={lifeGuardPeriodLabel}
                                checklistItems={lifeGuardChecklistItems}
                                activeNoteLabel={getLifeGuardNoteLabel(role)}
                                activeNoteValue={noteValue}
                                onToggleChecklist={toggleLifeGuardChecklist}
                                canToggleChecklist={!showSuccess}
                              />
                            </div>

                            <div className="xl:sticky xl:top-28 xl:self-start">
                              <LifeGuardSidebarSummaryCard
                                beneficiary={lifeGuardBeneficiary}
                                infoRows={lifeGuardSummaryRows}
                                premiumRows={lifeGuardFeeRows}
                                premiumValue={lifeGuardPremiumText}
                                pendingItems={lifeGuardPendingItems}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {showReviewSummary ? (
                  <div className="mb-6 animate-fade-in text-slate-800">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-xl">
                      <div className="flex items-center justify-between border-b border-slate-100 bg-[#1e293b] px-8 py-6">
                        <div className="flex items-center gap-3 text-white">
                          <FileSpreadsheet className="h-5 w-5 text-blue-400" />
                          <span>Tinjauan Konfigurasi T&C</span>
                        </div>
                        <span className="rounded border border-blue-500/30 bg-blue-500/20 px-3 py-1 text-[10px] uppercase tracking-widest text-blue-400 shadow-sm">Review Mode</span>
                      </div>
                      <div className="space-y-10 bg-white p-10 text-[11px] text-slate-800">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                          <div className="md:col-span-2">
                            <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-400">Penerima Manfaat (Tertanggung & QQ)</p>
                            <p className="truncate text-base font-black uppercase leading-tight text-blue-800">
                              {`${String(blueprint.insuredName || "-").toUpperCase()}${blueprint.qqTambahan ? ` ${String(blueprint.qqTambahan).toUpperCase()}` : ""}`}
                            </p>
                          </div>
                          <div>
                            <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-400">Nomor Polis Induk / Nomor PKS</p>
                            <p className="text-[13px] font-bold text-slate-800">{master.masterPolicyNo || "-"}</p>
                          </div>
                          <div>
                            <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-400">Jangka Waktu Pertanggungan</p>
                            <p className="text-[13px] font-bold text-slate-800">{`${blueprint.startDate || "-"} s/d ${blueprint.endDate || "-"}`}</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-400">Jenis Produk / Pertanggungan</p>
                            <p className="text-[13px] font-bold text-slate-800">{master.coverageType || "-"}</p>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 shadow-inner">
                          <h4 className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase text-[#004d7a]">
                            <span className="h-4 w-1.5 rounded-full bg-blue-600" />
                            Limit & Manfaat Santunan
                          </h4>
                          <div className="grid grid-cols-1 gap-8 text-center uppercase tracking-tight md:grid-cols-3">
                            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                              <p className="text-[10px] font-black uppercase text-blue-700">NP Meninggal Dunia (A)</p>
                              <p className="text-[12px] font-black text-blue-800">{lifeGuardComputed.npAText}</p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                              <p className="text-[10px] font-black uppercase text-slate-700">NP Cacat Tetap (B)</p>
                              <p className="text-[12px] font-black text-slate-800">{lifeGuardComputed.npBText}</p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                              <p className="text-[10px] font-black uppercase text-slate-700">NP Pengobatan (C)</p>
                              <p className="text-[12px] font-black text-slate-800">{lifeGuardComputed.npCText}</p>
                            </div>
                          </div>
                          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-200/50 pt-6 text-center uppercase tracking-tight md:grid-cols-4">
                            <div>
                              <p className="text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-400">Kelas Risiko</p>
                              <p className="text-[13px] font-bold text-slate-800">{master.riskClass || "-"}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-400">Risk Exposure</p>
                              <p className="text-[13px] font-bold text-slate-800">{master.riskExposure || "-"}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-400">Batasan Usia</p>
                              <p className="text-[13px] font-bold text-slate-800">{`${master.ageMin || "-"} - ${master.ageMax || "-"} Thn`}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-extrabold uppercase tracking-[0.05em] text-red-500">Risiko Sendiri</p>
                              <p className="text-[13px] font-bold text-red-600">{master.deductible || "-"}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6 text-slate-700">
                          <h4 className="mb-3 border-b pb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Warranty & Daftar Klausula Lengkap</h4>
                          <div>
                            <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-400">Tipe Wording</p>
                            <p className="text-[13px] font-bold text-slate-800">{master.wordingType || "-"}</p>
                          </div>
                          <div className="grid grid-cols-1 gap-3 pl-0 md:grid-cols-2">
                            {selectedClauses.length === 0 ? (
                              <p className="col-span-2 py-4 text-center text-[10px] italic text-slate-400">Tidak ada klausula dipilih.</p>
                            ) : (
                              selectedClauses.map((item) => (
                                <div key={item} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2 text-[10px] font-bold text-slate-700 shadow-sm">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                  {item}
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                          <h4 className="border-b pb-2 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Rincian Finansial & Struktur Biaya</h4>
                          <div className="grid grid-cols-1 gap-8 text-center uppercase tracking-tight md:grid-cols-2">
                            <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-4">
                              <p className="text-[10px] font-extrabold uppercase text-yellow-700">Rate Premi (‰)</p>
                              <p className="text-xl font-black text-yellow-800">{master.baseRate ? `${master.baseRate} ‰` : "-"}</p>
                            </div>
                            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                              <p className="text-[10px] font-extrabold uppercase text-blue-700">Premi</p>
                              <p className="text-xl font-black text-blue-800">
                                {master.npCriteria === "antara"
                                  ? `${currencyCode} ${formatRupiah(lifeGuardComputed.premiumMin)} - ${formatRupiah(lifeGuardComputed.premiumMax)}`
                                  : `${currencyCode} ${formatRupiah(lifeGuardComputed.premiumMin)}`}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-6 pt-4 text-center md:grid-cols-4">
                            <div>
                              <p className="text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-400">Biaya Polis</p>
                              <p className="text-[13px] font-bold text-slate-800">{`${currencyCode} ${master.adminFee || "0"}`}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-400">Biaya Materai Sesuai STAR</p>
                              <p className="text-[13px] font-bold text-slate-800">{master.stampDuty || "Sesuai STAR"}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-400">Diskon</p>
                              <p className="text-[13px] font-bold text-orange-600">{`${master.discountPercent || "0"}%`}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-400">Brokerage/Komisi</p>
                              <p className="text-[13px] font-bold text-green-600">{`${master.commissionPercent || "0"}%`}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {!showSuccess ? (
                  <>
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4 text-[10px] font-black uppercase tracking-widest">
                        <h3>Log Aktivitas Alur Kerja</h3>
                        <ClipboardList className="h-5 w-5 text-slate-400" />
                      </div>
                      <div className="max-h-[300px] space-y-4 overflow-y-auto bg-slate-50/30 p-6 text-xs">
                        {(selectedConfig.audit || []).map((item, index) => {
                          const itemRole = String(item.actor || "");
                          const itemTone = itemRole.includes("HO") ? "bg-emerald-600" : itemRole.includes("UDW") ? "bg-orange-500" : "bg-blue-600";
                          const itemAvatar = itemRole.includes("HO") ? "HO" : itemRole.includes("UDW") ? "UW" : itemRole.includes("SYSTEM") ? "SY" : "RM";
                          return (
                            <div key={`${item.at}-${index}`} className="group relative flex gap-4 pb-4 text-xs text-slate-700">
                              <div className="absolute bottom-0 left-[11px] top-6 w-px bg-slate-200 last:hidden" />
                              <div className={cls("z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[8px] font-bold uppercase text-white shadow-sm", itemTone)}>
                                {itemAvatar}
                              </div>
                              <div className="flex-1 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                                <div className="mb-1 flex items-center justify-between gap-3">
                                  <span className="text-[10px] font-black uppercase tracking-tight text-slate-800">{item.action}</span>
                                  <span className="text-[9px] font-bold text-slate-400">{item.at}</span>
                                </div>
                                <p className="text-[11px] italic leading-relaxed text-slate-500">"{item.note || "Aktivitas workflow tercatat pada simulator."}"</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-8 animate-fade-in rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-md">
                      <div className="mb-4 flex items-center gap-2 text-[#004d7a]">
                        <NotebookPen className="h-5 w-5" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">{getLifeGuardNoteLabel(role)}</h4>
                      </div>
                      <div className="relative">
                        <textarea
                          rows={4}
                          maxLength={500}
                          value={noteValue}
                          onChange={(event) => setLifeGuardReviewNote(event.target.value)}
                          placeholder="Wajib diisi sebagai pertimbangan alur kerja..."
                          className={cls("min-h-[120px] resize-none border-slate-200 text-[13px] font-medium text-slate-800 shadow-sm", formInputClass)}
                        />
                        <div className="absolute bottom-3 right-4 text-[8px] font-black uppercase tracking-widest text-slate-300">
                          {noteValue.length} / 500 Chars
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            {!showSuccess ? (
              <footer className="shrink-0 border-t border-slate-200 bg-white px-6 py-4 shadow-md md:px-10">
                <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-8 text-xs font-bold text-slate-500">
                    <div>
                      <span className="mb-0.5 block text-[9px] font-black uppercase tracking-widest">Status Konfigurasi</span>
                      <span className={cls("rounded-lg border px-3 py-1 text-[10px] font-black uppercase shadow-sm", statusMeta.badge)}>
                        {statusMeta.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">{renderActionButtons()}</div>
                </div>
              </footer>
            ) : null}
          </main>

        {lifeGuardPendingAction && modalMeta ? (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-[420px] overflow-hidden rounded-2xl bg-white text-center text-slate-800 shadow-2xl ring-1 ring-white/10">
              <div className="flex items-center justify-between border-b bg-slate-50 px-8 py-5 text-[10px] font-black uppercase tracking-widest">
                <span>Konfirmasi Sesi</span>
                <button type="button" onClick={closeLifeGuardAction} className="text-gray-400 transition hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-8 text-center font-medium text-slate-800">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                  {modalMeta.icon}
                </div>
                <p className="mb-2 text-sm leading-relaxed text-gray-600">{modalMeta.title}</p>
              </div>
              <div className="flex justify-end gap-3 border-t bg-gray-50 px-8 py-5">
                <button type="button" onClick={closeLifeGuardAction} className="rounded-xl border border-gray-300 px-6 py-2.5 text-[10px] font-black uppercase text-slate-700 transition">
                  Batal
                </button>
                <button type="button" onClick={() => applyLifeGuardAction(lifeGuardPendingAction)} className="rounded-xl bg-[#004d7a] px-8 py-2.5 text-[10px] font-black uppercase text-white shadow-lg transition hover:bg-[#003a5c]">
                  Ya, Proses
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  function renderTravelSafeStudio() {
    if (!selectedConfig || selectedConfig.family !== "travel-group") return null;

    const blueprint = selectedConfig.data.blueprint;
    const master = selectedConfig.data.master;
    const review = selectedConfig.data.review;
    const statusMeta = getLifeGuardStatusMeta(selectedConfig.status);
    const roleMeta = getLifeGuardRoleMeta(role);
    const travelComputed = getTravelSafeComputed(master);
    const totalDaysLabel = getLifeGuardTotalDays(blueprint.startDate, blueprint.endDate);
    const canEdit = (role === "Maker" && selectedConfig.status === "Draft") || (role === "Checker" && selectedConfig.status === "Checker");
    const noteField = getLifeGuardReviewField(role);
    const noteValue = review?.[noteField] || "";
    const referenceCode = getLifeGuardReferenceCode(selectedConfig);
    const showSuccess = selectedConfig.status === "Active";
    const showReviewSummary = !showSuccess && role === "Approval";
    const showEntry = !showSuccess && role !== "Approval";
    const pendingItems = getPendingItems(selectedConfig);
    const readiness = getReadiness(selectedConfig);
    const beneficiary = `${String(blueprint.insuredName || selectedConfig.partnerName || "-").toUpperCase()}${
      blueprint.qqTambahan ? ` ${String(blueprint.qqTambahan).toUpperCase()}` : ""
    }`;
    const periodLabel = `${blueprint.startDate || "-"} s/d ${blueprint.endDate || "-"}`;
    const summaryRows = [
      { label: "Nomor Polis Induk / PKS", value: master.masterPolicyNo || blueprint.agreementNo || "-" },
      { label: "Jenis Produk", value: travelComputed.coverageText },
      { label: "Perluasan Aktif", value: `${travelComputed.activeBenefitCount} manfaat` },
      { label: "Tambahan Perlindungan", value: travelComputed.assistanceFeeText },
      { label: "Wording", value: master.wordingType || "-" },
    ];
    const feeRows = [
      { label: "Biaya Polis", value: `${travelComputed.currencyCode} ${master.adminFee || "0"}` },
      { label: "Bantuan Medis Dunia", value: travelComputed.assistanceFeeText },
      { label: "Biaya Meterai", value: master.stampDuty || "Sesuai STAR" },
      { label: "Brokerage / Komisi", value: `${master.commissionPercent || "0"}%` },
    ];
    const detailItems = [
      { label: "Penerima Manfaat", value: beneficiary },
      { label: "Nomor Polis Induk / PKS", value: master.masterPolicyNo || blueprint.agreementNo || "-" },
      { label: "Jangka Waktu Pertanggungan", value: periodLabel },
      { label: "Jenis Produk / Pertanggungan", value: travelComputed.coverageText },
      { label: "Mata Uang", value: travelComputed.lockedCurrency || "-" },
      { label: "Kriteria Validasi", value: master.npCriteria || "-" },
      { label: "NP Kecelakaan Diri", value: travelComputed.accidentText },
      { label: "NP Perlindungan Medis", value: travelComputed.medicalText },
      { label: "Rate Manfaat Utama", value: `${master.npAccidentRate || "-"}% / ${master.npMedicalRate || "-"}%` },
      { label: "Perluasan Aktif", value: `${travelComputed.activeBenefitCount} manfaat` },
      { label: "Tambahan Perlindungan", value: travelComputed.assistanceFeeText },
      { label: "Wording", value: master.wordingType || "-" },
      { label: "Risiko Sendiri", value: master.deductible || "-" },
    ];
    const checklistItems = [
      {
        key: "mappingReviewed",
        title: "Mapping Reviewed",
        detail: "Mapping peserta, plan perjalanan, dan sertifikat sudah dicek.",
        checked: Boolean(review.checklist.mappingReviewed),
      },
      {
        key: "documentBound",
        title: "Document Bound",
        detail: "PKS, wording, dan manfaat Travel Safe sudah diikat ke konfigurasi.",
        checked: Boolean(review.checklist.documentBound),
      },
      {
        key: "partnerUat",
        title: "Partner UAT",
        detail: "Template peserta dan manfaat tambahan sudah diuji sebelum approval.",
        checked: Boolean(review.checklist.partnerUat),
      },
      {
        key: "syncReady",
        title: "Sync Ready",
        detail: "Konfigurasi siap diteruskan ke proses penerbitan dan core system.",
        checked: Boolean(review.checklist.syncReady),
      },
    ];
    const formInputClass =
      "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[13px] font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
    const formInputDisabledClass = "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-500";
    const classicLabelClass = "text-[11px] font-bold uppercase text-[#004d7a]";
    const toggleChecklist = (key, value) =>
      patchSection("review", {
        checklist: { ...review.checklist, [key]: value },
      });
    const modalMeta = {
      TO_UDW: {
        title: "Kirim ke Admin UDW untuk tahap Checker?",
        icon: <ChevronRight className="h-7 w-7 text-blue-600" />,
      },
      REJECT: {
        title: "Tolak konfigurasi ini?",
        icon: <X className="h-7 w-7 text-red-600" />,
      },
      RETURN_MAKER: {
        title: "Kembalikan dokumen ke Maker?",
        icon: <ArrowLeft className="h-7 w-7 text-orange-500" />,
      },
      TO_HO: {
        title: "Teruskan dokumen ke Approver HO?",
        icon: <ChevronRight className="h-7 w-7 text-indigo-600" />,
      },
      RETURN_UDW: {
        title: "Kembalikan ke Admin UDW?",
        icon: <ArrowLeft className="h-7 w-7 text-blue-600" />,
      },
      ISSUE: {
        title: "Setujui & terbitkan polis secara resmi?",
        icon: <CheckCircle2 className="h-7 w-7 text-emerald-600" />,
      },
      RESET: {
        title: "Reset simulator ke awal? Semua progres akan hilang.",
        icon: <RefreshCcw className="h-7 w-7 text-slate-600" />,
      },
    }[lifeGuardPendingAction];

    const renderActionButtons = () => {
      if (selectedConfig.status === "Draft") {
        if (role === "Maker") {
          return (
            <button
              type="button"
              onClick={() => openLifeGuardAction("TO_UDW")}
              className="rounded-xl bg-[#004d7a] px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-[#003554]"
            >
              Kirim ke Checker
            </button>
          );
        }
        return <div className="text-[10px] font-bold uppercase italic text-slate-400">Draft stage - menunggu maker...</div>;
      }

      if (selectedConfig.status === "Checker") {
        if (role === "Checker") {
          return (
            <>
              <button type="button" onClick={() => openLifeGuardAction("REJECT")} className="rounded-xl bg-red-600 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-red-700">
                Tolak
              </button>
              <button type="button" onClick={() => openLifeGuardAction("RETURN_MAKER")} className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 transition hover:bg-slate-50">
                Kembali ke Maker
              </button>
              <button type="button" onClick={() => openLifeGuardAction("TO_HO")} className="rounded-xl bg-[#004d7a] px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-[#003a5c]">
                Forward ke Approval
              </button>
            </>
          );
        }
        return <div className="text-[10px] font-bold uppercase italic tracking-tight text-blue-600">Checker stage - ganti peran ke admin UDW...</div>;
      }

      if (selectedConfig.status === "Approval") {
        if (role === "Approval") {
          return (
            <>
              <button type="button" onClick={() => openLifeGuardAction("REJECT")} className="rounded-xl bg-red-600 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-red-700">
                Tolak
              </button>
              <button type="button" onClick={() => openLifeGuardAction("RETURN_UDW")} className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 transition hover:bg-slate-50">
                Kembali ke Admin UDW
              </button>
              <button type="button" onClick={() => openLifeGuardAction("RETURN_MAKER")} className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 transition hover:bg-slate-50">
                Kembali ke Maker
              </button>
              <button type="button" onClick={() => openLifeGuardAction("ISSUE")} className="rounded-xl bg-emerald-600 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-emerald-700">
                Setuju
              </button>
            </>
          );
        }
        return <div className="text-[10px] font-bold uppercase italic tracking-tight text-indigo-600">Approval stage - ganti peran ke HO UDW...</div>;
      }

      return null;
    };

    return (
      <div className="min-h-screen bg-[#f4f7fa] text-slate-800">
        <AppProductHeader
          sessionName={sessionName}
          sessionRoleLabel={sessionRoleLabel}
          accountInitials={accountMeta.initials}
          onHome={exitToShell}
          accountMenuOpen={headerAccountMenuOpen}
          onToggleAccountMenu={() => setHeaderAccountMenuOpen((current) => !current)}
          accountMenuItems={accountMenuItems}
        />

        <main className="relative">
          {toast ? (
            <div className="pointer-events-none fixed right-4 top-20 z-[70]">
              <div className="rounded-xl border border-white/10 bg-slate-900 px-5 py-3 text-[10px] font-black text-white shadow-2xl">
                {toast.toUpperCase()}
              </div>
            </div>
          ) : null}

          {!showSuccess ? (
            <header className="relative overflow-hidden bg-[#0A4D82] pb-7 md:pb-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.20),transparent_28%),radial-gradient(circle_at_80%_25%,rgba(255,255,255,0.14),transparent_24%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.12),transparent_24%)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0A4D82]/60 to-[#0A4D82]/75" />
              <div className="relative mx-auto max-w-[1800px] px-4 pt-4 md:px-6 md:pt-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={backToCatalog}
                      className="inline-flex items-center gap-2 rounded-[8px] border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 focus-visible:ring-4 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A4D82]"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Kembali ke Daftar Konfigurasi
                    </button>
                  </div>
                </div>

                <div className="mt-4 text-center text-white md:mt-5">
                  <div className="inline-flex rounded-full bg-white/10 px-3.5 py-1 text-[12px] font-medium text-white/90 md:px-4 md:py-1.5 md:text-sm">
                    Selamat datang kembali, {accountMeta.name}
                  </div>
                  <h1 className="mt-3 text-[28px] font-bold tracking-tight md:mt-4 md:text-[40px]">
                    {fixDisplayText(studioHeroTitle)}
                  </h1>
                  <p className="mx-auto mt-1.5 max-w-3xl text-[13px] leading-6 text-white/90 md:mt-2 md:text-[17px] md:leading-7">
                    {fixDisplayText(selectedCardMeta?.description || "Pengaturan partner disesuaikan per produk dan dikelola langsung dari portal internal.")}
                  </p>
                </div>

                <StudioJourneySteps
                  stepIndex={stepIndex}
                  stepState={stepState}
                  maxUnlockedStep={maxUnlockedStep}
                  onSelect={(nextStep) => setStepIndex(nextStep)}
                />

                <div className="mt-4 flex justify-center">
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/95 p-1.5 shadow-lg shadow-black/10 backdrop-blur">
                      <div className="flex items-center px-2">
                        <span className="mr-2 whitespace-nowrap text-[9px] font-black uppercase text-slate-400">Ganti Peran:</span>
                        <select
                          value={role}
                          onChange={(event) => updateRole(event.target.value)}
                          className="rounded-lg bg-transparent px-3 py-1 text-[11px] font-black text-[#004d7a] outline-none ring-0"
                        >
                          <option value="Maker">ROM (MAKER)</option>
                          <option value="Checker">ADMIN UDW (CHECKER)</option>
                          <option value="Approval">HO UDW (APPROVAL)</option>
                        </select>
                      </div>
                      <div className="mx-1 h-6 w-px bg-slate-200" />
                      <button
                        type="button"
                        onClick={() => openLifeGuardAction("RESET")}
                        className="rounded-lg border border-red-100 bg-white px-3 py-1 text-[10px] font-black uppercase text-red-500 transition hover:bg-red-50"
                      >
                        <span className="inline-flex items-center gap-1">
                          <RefreshCcw className="h-3.5 w-3.5" />
                          Reset
                        </span>
                      </button>
                    </div>
                    <div className={cls("flex h-10 w-10 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-lg shadow-black/10", roleMeta.tone)}>
                      {roleMeta.avatar}
                    </div>
                  </div>
                </div>
              </div>
            </header>
          ) : null}

          <div className="mx-auto max-w-6xl px-4 py-5 md:px-6">
            <div className="pb-40">
              {showSuccess ? (
                <div className="animate-fade-in py-20 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-green-200 bg-green-100 text-green-500 shadow-sm">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h2 className="mb-2 text-2xl font-bold uppercase tracking-tight text-slate-800">Configuration Active</h2>
                    <p className="mb-8 text-sm text-slate-500">
                      Production ready for <span className="font-bold text-slate-700">{blueprint.insuredName || selectedConfig.partnerName}</span>.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                      <button type="button" onClick={resetLifeGuardWorkflow} className="rounded-xl bg-[#004d7a] px-8 py-3 text-xs font-black uppercase text-white shadow-lg transition hover:bg-[#003554]">
                        Start New Config
                      </button>
                      <button type="button" onClick={editLifeGuardFromSuccess} className="rounded-xl border-2 border-[#004d7a] bg-white px-8 py-3 text-xs font-black uppercase text-[#004d7a] shadow-md transition hover:bg-slate-50">
                        Edit Existing Config
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {showEntry ? (
                <div>
                  <div className="sticky top-0 z-20 mb-6 flex overflow-x-auto rounded-t-2xl border-b border-slate-200 bg-white shadow-sm">
                    {STEP_LIST.map((step, index) => (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => setStepIndex(index)}
                        className={cls(
                          "whitespace-nowrap border-b-[3px] px-7 py-3.5 text-[11px] font-extrabold uppercase tracking-[0.05em] transition",
                          stepIndex === index
                            ? "border-[#004d7a] bg-[rgba(0,77,122,0.03)] text-[#004d7a]"
                            : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        )}
                      >
                        {index + 1}. {step.label}
                      </button>
                    ))}
                  </div>

                  {stepIndex === 0 ? (
                    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="p-8">
                        <div className="grid grid-cols-1 gap-x-8 gap-y-6 text-slate-700 md:grid-cols-2">
                          <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-4 md:col-span-2">
                            <label className="mb-2 flex items-center text-[10px] font-extrabold uppercase tracking-[0.05em] text-blue-700">
                              Kode Tertanggung <span className="ml-1 text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={blueprint.insuredCode || ""}
                              onChange={(event) => patchSection("blueprint", { insuredCode: onlyDigits(event.target.value) })}
                              disabled={!canEdit}
                              className={cls(formInputClass, "border-blue-200 text-base font-black text-blue-800 shadow-sm", !canEdit && formInputDisabledClass)}
                            />
                          </div>

                          <div>
                            <label className="mb-2 flex text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-400">Nama Tertanggung</label>
                            <input type="text" value={String(blueprint.insuredName || "").toUpperCase()} disabled className={cls(formInputClass, formInputDisabledClass, "font-bold uppercase text-slate-900")} />
                          </div>
                          <div>
                            <label className="mb-2 flex text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-400">NPWP</label>
                            <input type="text" value={blueprint.npwp || ""} disabled className={cls(formInputClass, formInputDisabledClass, "font-medium")} />
                          </div>
                          <div className="md:col-span-2">
                            <label className="mb-2 flex text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-400">Alamat Korespondensi</label>
                            <textarea value={blueprint.address || ""} rows={2} disabled className={cls("min-h-[78px]", formInputClass, formInputDisabledClass, "resize-none font-medium")} />
                          </div>
                          <div>
                            <label className="mb-2 flex items-center text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-600">
                              Email Korespondensi <span className="ml-1 text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              value={blueprint.correspondenceEmail || blueprint.ownerEmail || ""}
                              onChange={(event) => patchSection("blueprint", { correspondenceEmail: event.target.value, ownerEmail: event.target.value })}
                              disabled={!canEdit}
                              className={cls(formInputClass, "font-medium lowercase", !canEdit && formInputDisabledClass)}
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-8 border-t border-slate-50 pt-6 md:col-span-2 md:grid-cols-2">
                            <div>
                              <label className="mb-2 flex items-center text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-600">
                                Kode Akuisisi <span className="ml-1 text-red-500">*</span>
                              </label>
                              <select
                                value={blueprint.acquisitionCode || LIFE_GUARD_ACQUISITION_OPTIONS[1]}
                                onChange={(event) => patchSection("blueprint", { acquisitionCode: event.target.value })}
                                disabled={!canEdit}
                                className={cls(formInputClass, "font-bold shadow-sm", !canEdit && formInputDisabledClass)}
                              >
                                {LIFE_GUARD_ACQUISITION_OPTIONS.map((item) => (
                                  <option key={item} value={item}>
                                    {item}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="mb-2 flex items-center text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-600">
                                Nomor Polis Induk / Nomor PKS <span className="ml-1 text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={master.masterPolicyNo || blueprint.agreementNo || ""}
                                onChange={(event) => {
                                  patchSection("blueprint", { agreementNo: event.target.value });
                                  patchTravelSafeMaster({ masterPolicyNo: event.target.value });
                                }}
                                disabled={!canEdit}
                                className={cls(formInputClass, "font-bold uppercase", !canEdit && formInputDisabledClass)}
                              />
                            </div>
                          </div>

                          <div className="border-t border-slate-50 pt-6 md:col-span-2">
                            <label className="mb-2 flex text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-600">Daftar QQ Tambahan</label>
                            <textarea
                              rows={2}
                              value={blueprint.qqTambahan || ""}
                              onChange={(event) => patchSection("blueprint", { qqTambahan: event.target.value })}
                              disabled={!canEdit}
                              placeholder="Masukkan QQ jika ada..."
                              className={cls("min-h-[78px] resize-none font-medium", formInputClass, !canEdit && formInputDisabledClass)}
                            />
                          </div>

                          <div className="border-t border-slate-50 pt-6 md:col-span-2">
                            <label className="mb-2 flex items-center text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-600">
                              Jangka Waktu Pertanggungan <span className="ml-1 text-red-500">*</span>
                            </label>
                            <div className="flex flex-wrap items-center gap-4">
                              <input type="date" value={blueprint.startDate || ""} onChange={(event) => patchSection("blueprint", { startDate: event.target.value })} disabled={!canEdit} className={cls(formInputClass, "w-48 font-bold shadow-sm", !canEdit && formInputDisabledClass)} />
                              <span className="text-[10px] font-bold uppercase text-slate-400">s/d</span>
                              <input type="date" value={blueprint.endDate || ""} onChange={(event) => patchSection("blueprint", { endDate: event.target.value })} disabled={!canEdit} className={cls(formInputClass, "w-48 font-bold shadow-sm", !canEdit && formInputDisabledClass)} />
                              <span className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] font-black uppercase tracking-tight text-blue-700 shadow-sm">{totalDaysLabel}</span>
                            </div>
                          </div>

                          <div className="space-y-4 border-t border-slate-50 pt-6 md:col-span-2">
                            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                              <Upload className="h-4 w-4 text-blue-600" />
                              Unggah Dokumen PKS & Lampiran <span className="text-red-500">*</span>
                            </h4>
                            <div className="cursor-pointer rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/10 p-8 text-center font-bold text-blue-400 transition hover:border-blue-400">
                              <Upload className="mx-auto mb-3 h-8 w-8" />
                              <p className="text-xs tracking-tight">Klik atau seret file ke sini</p>
                              <input type="file" className="hidden" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {stepIndex === 1 ? (
                    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="p-8 text-slate-700">
                        <div className="space-y-8">
                          <div>
                            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#004d7a]">
                              Jenis Pertanggungan <span className="text-red-500">*</span>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-3">
                              {TRAVEL_SAFE_COVERAGE_OPTIONS.map((item) => {
                                const selected = (master.coverageCodes || []).includes(item.code);
                                return (
                                  <button
                                    key={item.code}
                                    type="button"
                                    onClick={() => (canEdit ? toggleTravelSafeCoverage(item.code) : null)}
                                    className={cls(
                                      "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
                                      selected ? "border-[#0A4D82] bg-[#0A4D82] text-white shadow-lg" : "border-slate-200 bg-[#F8FBFE] text-slate-600"
                                    )}
                                  >
                                    <span className={cls("flex h-5 w-5 items-center justify-center rounded-full border-2", selected ? "border-white bg-white text-[#0A4D82]" : "border-slate-300 bg-white text-transparent")}>
                                      {selected ? <div className="h-2.5 w-2.5 rounded-full bg-[#0A4D82]" /> : null}
                                    </span>
                                    <span className="text-[12px] font-bold uppercase tracking-tight">{item.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                            <div className="mt-3 text-[12px] leading-5 text-slate-500">
                              Pilih satu jenis pertanggungan. Mata uang akan otomatis terkunci ke IDR untuk domestik dan USD untuk international.
                            </div>
                          </div>

                          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                            <div className="rounded-[24px] border border-[#D7E3EF] bg-[#F7FAFD] p-6">
                              <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Kriteria Validasi Santunan</div>
                                  <div className="mt-2">
                                    <select value={master.npCriteria || "antara"} onChange={(event) => patchTravelSafeMaster({ npCriteria: event.target.value })} disabled={!canEdit} className={cls(formInputClass, "w-full font-bold text-blue-800", !canEdit && formInputDisabledClass)}>
                                      <option value="setara">Setara dengan</option>
                                      <option value="antara">Antara (Min & Maks)</option>
                                      <option value="lebih_besar">Lebih besar dari</option>
                                      <option value="kurang_dari">Kurang dari</option>
                                    </select>
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Mata Uang</div>
                                  <div className="mt-2">
                                    <input type="text" value={travelComputed.lockedCurrency} disabled className={cls(formInputClass, formInputDisabledClass, "w-full min-w-[220px] bg-yellow-50 font-bold text-slate-900 shadow-inner")} />
                                  </div>
                                  <div className="mt-2 text-[11px] leading-5 text-slate-500">Otomatis mengikuti jenis pertanggungan yang dipilih.</div>
                                </div>
                              </div>
                            </div>
                            <div className="grid gap-4">
                              <MiniStat icon={Globe2} label="Coverage Dipilih" value={`${travelComputed.coverageCount} opsi`} />
                              <MiniStat icon={Route} label="Perluasan Aktif" value={`${travelComputed.activeBenefitCount} manfaat`} />
                            </div>
                          </div>

                          <div className="rounded-[24px] border border-[#D7E3EF] bg-white p-6 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#004d7a]">
                                  NP Kecelakaan Diri <span className="text-red-500">*</span>
                                </div>
                                <div className="mt-1 text-[13px] text-slate-500">Manfaat utama untuk peserta perjalanan Travel Safe.</div>
                              </div>
                              <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-blue-700">
                                {travelComputed.lockedCurrency}
                              </span>
                            </div>
                            <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <input type="text" value={master.npAccidentLimitMin || ""} onChange={(event) => patchTravelSafeMaster({ npAccidentLimitMin: formatNumber(event.target.value) })} disabled={!canEdit} className={cls(formInputClass, "w-full text-right font-black text-[#004d7a]", !canEdit && formInputDisabledClass)} />
                                  {master.npCriteria === "antara" ? <span className="font-bold text-slate-400">-</span> : null}
                                  {master.npCriteria === "antara" ? <input type="text" value={master.npAccidentLimitMax || ""} onChange={(event) => patchTravelSafeMaster({ npAccidentLimitMax: formatNumber(event.target.value) })} disabled={!canEdit} className={cls(formInputClass, "w-full text-right font-black text-[#004d7a]", !canEdit && formInputDisabledClass)} /> : null}
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <div className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Rate (%)</div>
                                    <input type="text" value={master.npAccidentRate || ""} onChange={(event) => patchTravelSafeMaster({ npAccidentRate: formatRateInput(event.target.value) })} disabled={!canEdit} className={cls(formInputClass, "text-center font-black text-blue-700", !canEdit && formInputDisabledClass)} />
                                  </div>
                                  <div className="rounded-[20px] border border-blue-100 bg-blue-50 px-4 py-3">
                                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">Premi Dasar</div>
                                    <div className="mt-2 text-[15px] font-bold text-blue-900">{travelComputed.accidentPremiumText}</div>
                                  </div>
                                </div>
                              </div>
                              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                                <SmallDataCard label="NP Kecelakaan" value={travelComputed.accidentText} />
                                <SmallDataCard label="Rate" value={travelComputed.accidentRateText} />
                              </div>
                            </div>
                          </div>

                          <div className="rounded-[24px] border border-[#D7E3EF] bg-white p-6 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#004d7a]">
                                  NP Perlindungan Medis <span className="text-red-500">*</span>
                                </div>
                                <div className="mt-1 text-[13px] text-slate-500">Turunan otomatis dari manfaat kecelakaan sesuai persentase yang ditetapkan.</div>
                              </div>
                              <div className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-blue-700">
                                {master.npMedicalPercentage || "0"}% dari manfaat utama
                              </div>
                            </div>
                            <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                              <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)] md:items-end">
                                  <div>
                                    <div className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">% dari NP Kecelakaan</div>
                                    <input type="text" value={master.npMedicalPercentage || ""} onChange={(event) => patchTravelSafeMaster({ npMedicalPercentage: formatRateInput(event.target.value) })} disabled={!canEdit} className={cls(formInputClass, "text-center font-black text-blue-700", !canEdit && formInputDisabledClass)} />
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <input type="text" value={master.npMedicalLimitMin || ""} readOnly className={cls(formInputClass, formInputDisabledClass, "text-right font-bold")} />
                                    {master.npCriteria === "antara" ? <span className="font-bold text-slate-400">-</span> : null}
                                    {master.npCriteria === "antara" ? <input type="text" value={master.npMedicalLimitMax || ""} readOnly className={cls(formInputClass, formInputDisabledClass, "text-right font-bold")} /> : null}
                                  </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <div className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Rate (%)</div>
                                    <input type="text" value={master.npMedicalRate || ""} onChange={(event) => patchTravelSafeMaster({ npMedicalRate: formatRateInput(event.target.value) })} disabled={!canEdit} className={cls(formInputClass, "text-center font-black text-blue-700", !canEdit && formInputDisabledClass)} />
                                  </div>
                                  <div className="rounded-[20px] border border-blue-100 bg-blue-50 px-4 py-3">
                                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">Premi Medis</div>
                                    <div className="mt-2 text-[15px] font-bold text-blue-900">{travelComputed.medicalPremiumText}</div>
                                  </div>
                                </div>
                              </div>
                              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                                <SmallDataCard label="NP Medis" value={travelComputed.medicalText} />
                                <SmallDataCard label="Rate" value={travelComputed.medicalRateText} />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="rounded-[24px] border border-[#C5D5E7] bg-[#E9EFF6] px-6 py-5 shadow-sm">
                              <div className="text-[18px] font-semibold tracking-tight text-slate-900">Tambahan Perlindungan (Opsional)</div>
                              <div className="mt-1 text-[13px] leading-6 text-slate-600">Tingkatkan perlindungan Anda dengan layanan ekstra.</div>
                              <button
                                type="button"
                                onClick={() => (canEdit ? patchTravelSafeMaster({ assistanceEnabled: !master.assistanceEnabled }) : null)}
                                className="mt-5 flex w-full items-start justify-between gap-4 rounded-[20px] border border-[#B7C9DD] bg-[#DDE7F1] px-5 py-5 text-left transition hover:bg-[#D6E3EF]"
                              >
                                <div className="flex items-start gap-4">
                                  <span className={cls("mt-1 flex h-6 w-6 items-center justify-center rounded-md border", master.assistanceEnabled ? "border-[#0A4D82] bg-[#0A4D82] text-white" : "border-slate-300 bg-white text-transparent")}>
                                    {master.assistanceEnabled ? <Check className="h-4 w-4" /> : null}
                                  </span>
                                  <div>
                                    <div className="text-[17px] font-semibold text-[#0A4D82]">{TRAVEL_SAFE_ASSISTANCE_INFO.title}</div>
                                    <div className="mt-3 max-w-4xl text-[13px] leading-7 text-[#0A4D82]">
                                      {TRAVEL_SAFE_ASSISTANCE_INFO.description}
                                    </div>
                                  </div>
                                </div>
                                <div className="shrink-0 pt-1 text-[18px] font-semibold text-[#F59E0B]">{getTravelSafeAssistanceFeeText(master)}</div>
                              </button>
                            </div>

                            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#004d7a]">Perluasan Manfaat Tambahan</div>
                            {TRAVEL_SAFE_EXTENSION_LIBRARY.map((category) => {
                              const Icon = category.icon || Route;
                              const expanded = travelSafeExpandedCategory === category.id;
                              return (
                                <div key={category.id} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                                  <button
                                    type="button"
                                    onClick={() => setTravelSafeExpandedCategory((current) => (current === category.id ? "" : category.id))}
                                    className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-slate-50"
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0A4D82] text-white">
                                        <Icon className="h-5 w-5" />
                                      </div>
                                      <div>
                                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Kategori</div>
                                        <div className="mt-1 text-[15px] font-semibold text-slate-900">{category.title}</div>
                                      </div>
                                    </div>
                                    <ChevronDown className={cls("h-5 w-5 text-slate-400 transition", expanded && "rotate-180")} />
                                  </button>
                                  {expanded ? (
                                    <div className="space-y-4 border-t border-slate-100 bg-[#F8FBFE] px-5 py-5">
                                      {category.items.map((item) => {
                                        const selection = master.perluasanSelections?.[item.id] || { checked: false, hpMin: "", hpMax: "", rate: "", premiMin: "", premiMax: "" };
                                        return (
                                          <div key={item.id} className="rounded-[22px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
                                            <div className="flex items-center gap-3">
                                              <button
                                                type="button"
                                                onClick={() => (canEdit ? updateTravelSafeBenefit(item.id, { checked: !selection.checked }) : null)}
                                                className={cls(
                                                  "flex h-5 w-5 items-center justify-center rounded border",
                                                  selection.checked ? "border-[#0A4D82] bg-[#EAF3FF] text-[#0A4D82]" : "border-slate-300 bg-white text-transparent"
                                                )}
                                              >
                                                {selection.checked ? <Check className="h-3.5 w-3.5" /> : null}
                                              </button>
                                              <div className="text-[13px] font-semibold text-slate-800">{item.label}</div>
                                              {item.isCheckOnly ? <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Check Only</span> : null}
                                            </div>
                                            {selection.checked && !item.isCheckOnly ? (
                                              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                                                <div>
                                                  <div className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">HP (Limit / LoL)</div>
                                                  <div className="flex items-center gap-2">
                                                    <input type="text" value={selection.hpMin || ""} onChange={(event) => updateTravelSafeBenefit(item.id, { hpMin: event.target.value })} disabled={!canEdit} className={cls(formInputClass, "text-right font-bold", !canEdit && formInputDisabledClass)} />
                                                    {master.npCriteria === "antara" ? <span className="font-bold text-slate-400">-</span> : null}
                                                    {master.npCriteria === "antara" ? <input type="text" value={selection.hpMax || ""} onChange={(event) => updateTravelSafeBenefit(item.id, { hpMax: event.target.value })} disabled={!canEdit} className={cls(formInputClass, "text-right font-bold", !canEdit && formInputDisabledClass)} /> : null}
                                                  </div>
                                                </div>
                                                <div>
                                                  <div className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Rate (%)</div>
                                                  <input type="text" value={selection.rate || ""} onChange={(event) => updateTravelSafeBenefit(item.id, { rate: event.target.value })} disabled={!canEdit} className={cls(formInputClass, "text-center font-bold text-blue-700", !canEdit && formInputDisabledClass)} />
                                                </div>
                                                <div>
                                                  <div className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Premi</div>
                                                  <div className="rounded-[18px] border border-blue-100 bg-blue-50 px-4 py-3 text-[14px] font-bold text-blue-900">
                                                    {selection.premiMin || "0"}
                                                    {master.npCriteria === "antara" && selection.premiMax ? ` - ${selection.premiMax}` : ""}
                                                  </div>
                                                </div>
                                              </div>
                                            ) : null}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>

                          <div className="rounded-[24px] border border-[#D7E3EF] bg-[#F7FAFD] p-6">
                            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#004d7a]">
                              <TriangleAlert className="h-4 w-4" />
                              Risiko Sendiri (Deductible)
                            </div>
                            <textarea
                              rows={3}
                              value={master.deductible || ""}
                              onChange={(event) => patchTravelSafeMaster({ deductible: event.target.value })}
                              disabled={!canEdit}
                              className={cls("mt-4 min-h-[96px] resize-none font-medium", formInputClass, !canEdit && formInputDisabledClass)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {stepIndex === 2 ? (
                    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="p-8 text-slate-700">
                        <div className="space-y-8">
                          <div>
                            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#004d7a]">Wording Polis</div>
                            <div className="mt-4 rounded-[24px] border border-[#D7E3EF] bg-[#F7FAFD] p-6 shadow-sm">
                              <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#0A4D82] text-white">
                                  <FileSpreadsheet className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[18px] font-semibold tracking-tight text-slate-900">{TRAVEL_SAFE_WORDING_LABEL}</div>
                                  <div className="mt-2 text-[13px] leading-6 text-slate-600">{TRAVEL_SAFE_WORDING_NOTE}</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <PartnerClauseNoteCard title="Ringkasan Wording Travel Safe">
                            <div className="grid gap-3 md:grid-cols-2">
                              <SmallDataCard label="Wording Aktif" value={master.wordingType || TRAVEL_SAFE_WORDING_LABEL} />
                              <SmallDataCard label="Coverage" value={travelComputed.coverageText} />
                              <SmallDataCard label="Perluasan Aktif" value={`${travelComputed.activeBenefitCount} manfaat`} />
                              <SmallDataCard label="Tambahan Perlindungan" value={travelComputed.assistanceFeeText} />
                            </div>
                            <div className="mt-4 rounded-[18px] border border-slate-200 bg-white px-4 py-4 text-[13px] leading-6 text-slate-600">
                              Travel Safe tidak menggunakan pilihan ikhtisar / sertifikat maupun konfigurasi klausula tambahan. Semua penerbitan mengikuti wording standar Travel Jasindo.
                            </div>
                          </PartnerClauseNoteCard>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {stepIndex === 3 ? (
                    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="p-8">
                        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                          <div className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                              <FormField label="Biaya Polis" required>
                                <TextInput value={master.adminFee || ""} onChange={(value) => patchTravelSafeMaster({ adminFee: formatNumber(value) })} disabled={!canEdit} />
                              </FormField>
                              <FormField label="Biaya Meterai (Sesuai STAR)">
                                <TextInput value={master.stampDuty || "Sesuai STAR"} onChange={(value) => patchTravelSafeMaster({ stampDuty: value })} disabled />
                              </FormField>
                              <FormField label="Diskon (%)">
                                <TextInput value={master.discountPercent || "0"} onChange={(value) => patchTravelSafeMaster({ discountPercent: onlyDigits(value) })} disabled={!canEdit} />
                              </FormField>
                              <FormField label="Brokerage / Komisi (%)">
                                <TextInput value={master.commissionPercent || "15"} onChange={(value) => patchTravelSafeMaster({ commissionPercent: onlyDigits(value) })} disabled={!canEdit} />
                              </FormField>
                            </div>

                            <LifeGuardConfigurationSnapshotCard items={detailItems} />
                            <TravelSafeBenefitSummaryCard rows={travelComputed.activeBenefitRows} />
                            <LifeGuardConfigurationReviewCard
                              readiness={readiness}
                              statusLabel={statusMeta.label}
                              roleLabel={roleMeta.shortLabel}
                              referenceCode={referenceCode}
                              periodLabel={periodLabel}
                              checklistItems={checklistItems}
                              activeNoteLabel={getLifeGuardNoteLabel(role)}
                              activeNoteValue={noteValue}
                              onToggleChecklist={toggleChecklist}
                              canToggleChecklist={!showSuccess}
                            />
                          </div>

                          <div className="xl:sticky xl:top-28 xl:self-start">
                            <LifeGuardSidebarSummaryCard
                              beneficiary={beneficiary}
                              infoRows={summaryRows}
                              premiumRows={feeRows}
                              premiumValue={travelComputed.totalPremiumText}
                              pendingItems={pendingItems}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {showReviewSummary ? (
                <div className="mb-6 animate-fade-in text-slate-800">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-[#1e293b] px-8 py-6">
                      <div className="flex items-center gap-3 text-white">
                        <FileSpreadsheet className="h-5 w-5 text-blue-400" />
                        <span>Tinjauan Konfigurasi Travel Safe</span>
                      </div>
                      <span className="rounded border border-blue-500/30 bg-blue-500/20 px-3 py-1 text-[10px] uppercase tracking-widest text-blue-400 shadow-sm">Review Mode</span>
                    </div>
                    <div className="space-y-10 bg-white p-10 text-[11px] text-slate-800">
                      <LifeGuardConfigurationSnapshotCard items={detailItems} />
                      <TravelSafeBenefitSummaryCard rows={travelComputed.activeBenefitRows} emptyText="Belum ada perluasan aktif pada konfigurasi Travel Safe ini." />

                        <div className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                          <h4 className="border-b pb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Wording dan Struktur Biaya</h4>
                          <div className="grid gap-6 md:grid-cols-2">
                            <SmallDataCard label="Wording" value={master.wordingType || "-"} />
                            <SmallDataCard label="Mode Dokumen" value="Mengikuti wording standar Travel Jasindo" />
                            <SmallDataCard label="Premi Manfaat Dasar" value={travelComputed.accidentPremiumText} />
                            <SmallDataCard label="Premi Manfaat Medis" value={travelComputed.medicalPremiumText} />
                            <SmallDataCard label="Tambahan Perlindungan" value={travelComputed.assistanceFeeText} />
                            <SmallDataCard label="Mata Uang Terkunci" value={travelComputed.lockedCurrency} />
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 text-[13px] leading-6 text-slate-600">
                            Travel Safe tidak memakai package klausula tambahan. Dokumen polis mengikuti <span className="font-semibold text-slate-900">{TRAVEL_SAFE_WORDING_LABEL}</span>.
                          </div>
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-4 text-center">
                            <p className="text-[10px] font-extrabold uppercase tracking-[0.05em] text-yellow-700">Rate Kecelakaan</p>
                            <p className="mt-2 text-lg font-black text-yellow-800">{travelComputed.accidentRateText}</p>
                          </div>
                          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-center">
                            <p className="text-[10px] font-extrabold uppercase tracking-[0.05em] text-blue-700">Rate Medis</p>
                            <p className="mt-2 text-lg font-black text-blue-800">{travelComputed.medicalRateText}</p>
                          </div>
                          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-center">
                            <p className="text-[10px] font-extrabold uppercase tracking-[0.05em] text-indigo-700">Biaya Polis</p>
                            <p className="mt-2 text-lg font-black text-indigo-800">{`${travelComputed.currencyCode} ${master.adminFee || "0"}`}</p>
                          </div>
                          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-center">
                            <p className="text-[10px] font-extrabold uppercase tracking-[0.05em] text-emerald-700">Estimasi Premi</p>
                            <p className="mt-2 text-lg font-black text-emerald-800">{travelComputed.totalPremiumText}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6 pt-4 text-center md:grid-cols-4">
                          <div>
                            <p className="text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-400">Biaya Materai</p>
                            <p className="text-[13px] font-bold text-slate-800">{master.stampDuty || "Sesuai STAR"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-400">Tambahan Perlindungan</p>
                            <p className="text-[13px] font-bold text-blue-700">{travelComputed.assistanceFeeText}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-400">Diskon</p>
                            <p className="text-[13px] font-bold text-orange-600">{`${master.discountPercent || "0"}%`}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-400">Brokerage / Komisi</p>
                            <p className="text-[13px] font-bold text-green-600">{`${master.commissionPercent || "0"}%`}</p>
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                          <p className="text-[10px] font-extrabold uppercase tracking-[0.05em] text-red-500">Risiko Sendiri</p>
                          <p className="mt-2 text-[13px] font-bold text-red-600">{master.deductible || "-"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {!showSuccess ? (
                <>
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4 text-[10px] font-black uppercase tracking-widest">
                      <h3>Log Aktivitas Alur Kerja</h3>
                      <ClipboardList className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="max-h-[300px] space-y-4 overflow-y-auto bg-slate-50/30 p-6 text-xs">
                      {(selectedConfig.audit || []).map((item, index) => {
                        const itemRole = String(item.actor || "");
                        const itemTone = itemRole.includes("HO") ? "bg-emerald-600" : itemRole.includes("UDW") ? "bg-orange-500" : "bg-blue-600";
                        const itemAvatar = itemRole.includes("HO") ? "HO" : itemRole.includes("UDW") ? "UW" : itemRole.includes("SYSTEM") ? "SY" : "RM";
                        return (
                          <div key={`${item.at}-${index}`} className="group relative flex gap-4 pb-4 text-xs text-slate-700">
                            <div className="absolute bottom-0 left-[11px] top-6 w-px bg-slate-200 last:hidden" />
                            <div className={cls("z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[8px] font-bold uppercase text-white shadow-sm", itemTone)}>
                              {itemAvatar}
                            </div>
                            <div className="flex-1 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                              <div className="mb-1 flex items-center justify-between gap-3">
                                <span className="text-[10px] font-black uppercase tracking-tight text-slate-800">{item.action}</span>
                                <span className="text-[9px] font-bold text-slate-400">{item.at}</span>
                              </div>
                              <p className="text-[11px] italic leading-relaxed text-slate-500">"{item.note || "Aktivitas workflow tercatat pada simulator."}"</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-8 animate-fade-in rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-md">
                    <div className="mb-4 flex items-center gap-2 text-[#004d7a]">
                      <NotebookPen className="h-5 w-5" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest">{getLifeGuardNoteLabel(role)}</h4>
                    </div>
                    <div className="relative">
                      <textarea
                        rows={4}
                        maxLength={500}
                        value={noteValue}
                        onChange={(event) => setLifeGuardReviewNote(event.target.value)}
                        placeholder="Wajib diisi sebagai pertimbangan alur kerja..."
                        className={cls("min-h-[120px] resize-none border-slate-200 text-[13px] font-medium text-slate-800 shadow-sm", formInputClass)}
                      />
                      <div className="absolute bottom-3 right-4 text-[8px] font-black uppercase tracking-widest text-slate-300">
                        {noteValue.length} / 500 Chars
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {!showSuccess ? (
            <footer className="shrink-0 border-t border-slate-200 bg-white px-6 py-4 shadow-md md:px-10">
              <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-8 text-xs font-bold text-slate-500">
                  <div>
                    <span className="mb-0.5 block text-[9px] font-black uppercase tracking-widest">Status Konfigurasi</span>
                    <span className={cls("rounded-lg border px-3 py-1 text-[10px] font-black uppercase shadow-sm", statusMeta.badge)}>
                      {statusMeta.label}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">{renderActionButtons()}</div>
              </div>
            </footer>
          ) : null}
        </main>

        {lifeGuardPendingAction && modalMeta ? (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-[420px] overflow-hidden rounded-2xl bg-white text-center text-slate-800 shadow-2xl ring-1 ring-white/10">
              <div className="flex items-center justify-between border-b bg-slate-50 px-8 py-5 text-[10px] font-black uppercase tracking-widest">
                <span>Konfirmasi Sesi</span>
                <button type="button" onClick={closeLifeGuardAction} className="text-gray-400 transition hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-8 text-center font-medium text-slate-800">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                  {modalMeta.icon}
                </div>
                <p className="mb-2 text-sm leading-relaxed text-gray-600">{modalMeta.title}</p>
              </div>
              <div className="flex justify-end gap-3 border-t bg-gray-50 px-8 py-5">
                <button type="button" onClick={closeLifeGuardAction} className="rounded-xl border border-gray-300 px-6 py-2.5 text-[10px] font-black uppercase text-slate-700 transition">
                  Batal
                </button>
                <button type="button" onClick={() => applyLifeGuardAction(lifeGuardPendingAction)} className="rounded-xl bg-[#004d7a] px-8 py-2.5 text-[10px] font-black uppercase text-white shadow-lg transition hover:bg-[#003a5c]">
                  Ya, Proses
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  const primaryLabel =
    stepIndex < STEP_LIST.length - 1
      ? "Lanjut"
      : role === "Maker"
      ? "Kirim ke Checker"
      : role === "Checker"
      ? "Kirim ke Approval"
      : "Aktifkan";
  const summaryPrimaryDisabled = selectedConfig ? getPendingItems(selectedConfig).length > 0 : true;

  if (!role || portalView === "login") {
    return (
      <div className="min-h-screen bg-[#F3F5F7] text-slate-900">
        <header className="bg-[#0A4D82] shadow-sm">
          <div className="bg-[linear-gradient(135deg,#0A4D82_0%,#0F5F9C_62%,#1B78B6_100%)]">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 md:px-6">
              <div className="flex items-center gap-3 text-white">
                <div className="rounded-[10px] bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#0A4D82]">JP</div>
                <div>
                  <div className="text-[18px] font-black tracking-tight">Jasindo Partner Portal</div>
                  <div className="text-xs text-white/70">Login role dulu, baru masuk ke kartu produk seperti web automation</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#EEF5FB] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#0A4D82]">
                <Lock className="h-3.5 w-3.5" />
                View as
              </div>
              <div className="mt-4 text-[30px] font-black tracking-tight text-slate-950 md:text-[40px]">
                Mulai dari login role, baru lanjut ke empat produk
              </div>
              <div className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                Flow barunya mengikuti web automation underwriting: maker, checker, atau approver login dulu,
                lalu memilih produk sebelum membuka studio konfigurasi.
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                {ROLE_OPTIONS.map((item) => (
                  <RoleGateCard
                    key={item}
                    role={item}
                    onSelect={(nextRole) => {
                      updateRole(nextRole);
                      setPortalView("catalog");
                      setSelectedId(null);
                      setSelectedFamily("");
                      setStepIndex(0);
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#D9E1EA] bg-white p-6 shadow-sm md:p-8">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Struktur Baru</div>
              <div className="mt-2 text-[24px] font-bold tracking-tight text-slate-950">Empat produk, empat step, tiga checkpoint peran</div>
              <div className="mt-6 space-y-4">
                {PORTAL_PRODUCT_CARDS.map((item) => (
                  <div key={item.family} className="flex items-start gap-4 rounded-[18px] border border-[#D9E1EA] bg-[#F8FBFE] p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#0A4D82] text-white">
                      {React.createElement(getFamilyMeta(item.family).icon, { className: "h-5 w-5" })}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{item.title}</div>
                      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#0A4D82]">{item.category}</div>
                      <div className="mt-2 text-sm leading-6 text-slate-600">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-[18px] border border-[#D9E1EA] bg-[#F8FBFE] p-4">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0A4D82]">Urutan Step</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {STEP_LIST.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3 rounded-[14px] border border-white bg-white px-3 py-3 shadow-sm">
                      <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#0A4D82] text-xs font-black text-white">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Step {index + 1}</div>
                        <div className="text-sm font-bold text-slate-900">{step.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (portalView === "catalog") {
    return (
      <div className="min-h-screen bg-[#F3F5F7] text-slate-900">
        <AppProductHeader
          sessionName={sessionName}
          sessionRoleLabel={sessionRoleLabel}
          accountInitials={accountMeta.initials}
          onHome={exitToShell}
          accountMenuOpen={headerAccountMenuOpen}
          onToggleAccountMenu={() => setHeaderAccountMenuOpen((current) => !current)}
          accountMenuItems={accountMenuItems}
        />

        <div className="mx-auto max-w-[1800px] px-4 py-4 md:px-6 md:py-6">
          <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:mt-6 md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-[28px] font-bold text-slate-900 md:text-[32px]">Pilihan Produk Asuransi Jasindo</div>
                <div className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  Masuk ke pengaturan konfigurasi partner sesuai peran aktif dan pilih produk yang ingin diatur.
                </div>
              </div>

              <div className="w-full max-w-[420px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={catalogSearch}
                    onChange={(event) => setCatalogSearch(event.target.value)}
                    placeholder="Cari produk"
                    className="h-12 w-full rounded-[10px] border border-[#D5DDE6] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#0A4D82] focus:ring-4 focus:ring-[#0A4D82]/10"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-4">
              {portalCards.map((item) => (
                <ProductLandingCard
                  key={item.family}
                  card={item}
                  count={item.configs.length}
                  featured={item.configs[0]}
                  onOpen={openProductStudio}
                />
              ))}
            </div>
          </div>
        </div>

        {toast ? (
          <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg">
            {toast}
          </div>
        ) : null}
      </div>
    );
  }

  if (selectedConfig?.family === "group-pa") {
    return renderLifeGuardStudio();
  }

  if (selectedConfig?.family === "travel-group") {
    return renderTravelSafeStudio();
  }

  return (
    <div className="min-h-screen bg-[#F3F5F7] text-slate-900">
      <div>
        {!selectedConfig ? (
          <div className="pb-10">
            <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0A4D82] shadow-sm">
              <div className="bg-[linear-gradient(135deg,#0A4D82_0%,#0F5F9C_62%,#1B78B6_100%)]">
                <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-7">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-white/88">
                      <Layers3 className="h-3.5 w-3.5" />
                      Konfigurasi Produk Partner
                    </div>
                    <h1 className="mt-3 text-[28px] font-black tracking-tight text-white md:text-[40px]">
                      Kelola konfigurasi produk partner dengan pola kerja web automation
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-white/78 md:text-base">
                      Mulai dari produk yang dipilih, lalu lanjutkan pengisian Informasi Umum, Obyek Pertanggungan,
                      Wording & Klausul, dan Ringkasan dalam pola yang konsisten dengan web automation underwriting ritel.
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 rounded-[10px] border border-white/20 bg-white/10 px-3 py-2 text-white">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">View as</span>
                      <select
                        value={role}
                        onChange={(event) => updateRole(event.target.value)}
                        className="h-8 rounded-[8px] bg-transparent pr-6 text-sm font-medium text-white outline-none"
                      >
                      {ROLE_OPTIONS.map((item) => (
                        <option key={item} value={item} className="text-slate-900">
                          {getRoleLabel(item)}
                        </option>
                      ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={createConfig}
                      className="inline-flex h-12 items-center gap-2 rounded-[10px] bg-[#F5A623] px-5 text-sm font-bold text-white shadow-sm hover:brightness-105"
                    >
                      <Plus className="h-4 w-4" />
                      Konfigurasi Baru
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <QuickFact icon={Database} label="Field mapped" value={`${dashboard.mappedFields} target`} />
                  <QuickFact icon={CheckCircle2} label="Siap diproses" value={`${dashboard.readyCount} konfigurasi`} />
                  <QuickFact icon={Workflow} label="Active configs" value={`${dashboard.activeCount} active`} />
                  <QuickFact icon={FileSpreadsheet} label="Partner-facing fields" value={`${dashboard.partnerFacing} field`} />
                </div>

                <div className="mt-6 rounded-[22px] border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto_auto]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Cari partner, konfigurasi, nomor PKS, atau produk"
                      className="h-12 w-full rounded-[10px] border border-[#D5DDE6] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#0A4D82] focus:ring-4 focus:ring-[#0A4D82]/10"
                    />
                  </div>

                  <div className="flex gap-2 overflow-x-auto">
                    {CHANNEL_OPTIONS.map((item) => {
                      const Icon = item.icon;
                      const active = scopeFilter === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setScopeFilter(active ? "all" : item.id)}
                          className={cls(
                            "inline-flex h-12 items-center gap-2 rounded-[10px] border px-4 text-sm font-medium whitespace-nowrap transition",
                            active
                              ? "border-[#0A4D82] bg-[#0A4D82] text-white"
                              : "border-[#D9E1EA] bg-[#F7FAFD] text-slate-700 hover:bg-white"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="h-12 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium outline-none focus:border-[#0A4D82] focus:ring-4 focus:ring-[#0A4D82]/10 focus-visible:ring-4 focus-visible:ring-[#0A4D82]/12 focus-visible:ring-offset-2"
                  >
                    {STATUS_FILTERS.map((item) => (
                      <option key={item} value={item}>
                        Status: {item}
                      </option>
                    ))}
                  </select>
                </div>
                </div>

                <div className="mt-5 rounded-[22px] border border-white/15 bg-white/10 p-3 backdrop-blur-md">
                  <div className="flex min-w-max gap-2 overflow-x-auto pb-1">
                    {PRODUCT_FAMILIES.map((item) => {
                      const Icon = item.icon;
                      const active = familyFilter === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFamilyFilter(item.id)}
                          className={cls(
                            "rounded-[14px] border px-4 py-3 text-left transition",
                            active
                              ? "border-[#0A4D82] bg-[#0A4D82] text-white"
                              : "border-[#D9E1EA] bg-white text-slate-700 hover:bg-[#F8FBFE]"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cls("flex h-10 w-10 items-center justify-center rounded-[12px]", active ? "bg-white/15" : "bg-[#F5F6F7] text-[#0A4D82]")}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">{item.label}</div>
                              <div className={cls("mt-0.5 text-xs", active ? "text-white/75" : "text-slate-500")}>
                                {item.note}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-5 md:px-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredConfigs.map((config) => (
                  <ConfigCard
                    key={config.id}
                    config={config}
                    onOpen={() => openConfig(config.id)}
                    onDuplicate={() => duplicateConfig(config.id)}
                  />
                ))}
              </div>

              {filteredConfigs.length === 0 ? (
                <EmptyState onCreate={createConfig} />
              ) : null}
            </main>
          </div>
        ) : (
          <div className="pb-52 lg:pb-8">
            <AppProductHeader
              sessionName={sessionName}
              sessionRoleLabel={sessionRoleLabel}
              accountInitials={accountMeta.initials}
              onHome={exitToShell}
              accountMenuOpen={headerAccountMenuOpen}
              onToggleAccountMenu={() => setHeaderAccountMenuOpen((current) => !current)}
              accountMenuItems={accountMenuItems}
            />

            <header className="relative overflow-hidden bg-[#0A4D82] pb-7 md:pb-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.20),transparent_28%),radial-gradient(circle_at_80%_25%,rgba(255,255,255,0.14),transparent_24%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.12),transparent_24%)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0A4D82]/60 to-[#0A4D82]/75" />
              <div className="relative mx-auto max-w-[1800px] px-4 pt-4 md:px-6 md:pt-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={backToCatalog}
                      className="inline-flex items-center gap-2 rounded-[8px] border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 focus-visible:ring-4 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A4D82]"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Kembali ke Daftar Konfigurasi
                    </button>
                  </div>

                </div>

                <div className="mt-4 text-center text-white md:mt-5">
                  <div className="inline-flex rounded-full bg-white/10 px-3.5 py-1 text-[12px] font-medium text-white/90 md:px-4 md:py-1.5 md:text-sm">
                    Selamat datang kembali, {accountMeta.name}
                  </div>
                  <h1 className="mt-3 text-[28px] font-bold tracking-tight md:mt-4 md:text-[40px]">
                    {fixDisplayText(studioHeroTitle)}
                  </h1>
                  <p className="mx-auto mt-1.5 max-w-3xl text-[13px] leading-6 text-white/90 md:mt-2 md:text-[17px] md:leading-7">
                    {fixDisplayText(selectedCardMeta?.description || "Pengaturan partner disesuaikan per produk dan dikelola langsung dari portal internal.")}
                  </p>
                </div>

                <div className="mx-auto mt-5 max-w-4xl rounded-2xl bg-white p-3 shadow-2xl shadow-black/15 md:mt-6 md:p-5">
                  <div className="rounded-2xl border border-[#D8E1EA] bg-[#F4F7FA] px-3 py-3 md:px-5 md:py-5">
                    <div className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 md:mx-0 md:flex-row md:gap-5 md:overflow-visible md:px-0 md:pb-0">
                      {STEP_LIST.map((step, index) => {
                        const Icon = step.icon;
                        const active = stepIndex === index;
                        const done = stepIndex > index || Boolean(stepState[index]?.done && !active);
                        const subtitle = active ? "Dalam proses" : done ? "Selesai" : "Bisa dibuka";
                        const canOpen = true;
                        return (
                          <React.Fragment key={step.id}>
                            {index > 0 ? <div className="pointer-events-none hidden h-px flex-1 self-center bg-slate-300 md:block" /> : null}
                            <button
                              type="button"
                              onClick={() => {
                                if (canOpen) setStepIndex(index);
                              }}
                              className="relative z-10 block w-[140px] shrink-0 snap-start rounded-xl px-1 py-1 md:w-auto md:flex-1 md:shrink md:snap-none cursor-pointer"
                            >
                              <StudioStepNode
                                title={step.label}
                                subtitle={subtitle}
                                active={active}
                                icon={<Icon className="h-4 w-4" />}
                              />
                            </button>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </header>

            <main className="mx-auto max-w-4xl px-4 py-5 md:px-6">
              <div className="min-w-0">
                <div>{renderStep()}</div>
              </div>
            </main>

            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
              <div className="mx-auto max-w-4xl">
                <div className="w-full">
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={moveNext}
                      className="flex h-[48px] w-full items-center justify-center rounded-[8px] bg-[#F5A623] text-sm font-bold uppercase tracking-wide text-white shadow-sm hover:brightness-105"
                    >
                      {primaryLabel}
                    </button>

                    <button
                      type="button"
                      onClick={moveBack}
                      className="flex h-11 w-full items-center justify-center rounded-[8px] border border-[#D5DDE6] bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Kembali
                    </button>

                    {stepIndex === STEP_LIST.length - 1 && (role === "Checker" || role === "Approval") ? (
                      <button
                        type="button"
                        onClick={sendBackOneStage}
                        className="flex h-11 w-full items-center justify-center rounded-[8px] border border-[#D5DDE6] bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Kembalikan
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {toast ? (
          <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg">
            {toast}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function bumpVersion(version, level = "patch") {
  const match = String(version || "v0.1").match(/^v(\d+)\.(\d+)$/i);
  const major = match ? Number(match[1]) : 0;
  const minor = match ? Number(match[2]) : 1;
  if (level === "major") return `v${major + 1}.0`;
  if (level === "minor") return `v${major}.${minor + 1}`;
  return `v${major}.${minor + 1}`;
}

function ConfigCard({ config, onOpen, onDuplicate }) {
  const family = getFamilyMeta(config.family);
  const readiness = getReadiness(config);
  const missing = getPendingItems(config).length;

  return (
    <article className="overflow-hidden rounded-[18px] border border-[#D9E1EA] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
      <div className="border-b border-slate-200 bg-gradient-to-br from-[#0A4D82] via-[#0B5B97] to-[#083656] p-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/65">
              {family.label}
            </div>
            <div className="mt-1 text-[21px] font-semibold tracking-tight">{fixDisplayText(config.title)}</div>
          </div>
          <StatusBadge status={config.status} light />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {config.data.blueprint.channels.map((channel) => {
            const meta = CHANNEL_OPTIONS.find((item) => item.id === channel);
            return (
              <span
                key={channel}
                className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white/90"
              >
                {meta?.label || channel}
              </span>
            );
          })}
        </div>
      </div>

      <div className="p-4">
        <div className="text-sm font-medium text-slate-900">{fixDisplayText(config.partnerName)}</div>
        <div className="mt-1 text-sm leading-6 text-slate-500">{fixDisplayText(config.productName)}</div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <SmallDataCard label="Integrasi" value={config.data.blueprint.integrationMode} />
          <SmallDataCard label="Sync target" value={config.data.blueprint.syncTarget} />
          <SmallDataCard label="Mapped target" value={`${getMappingCoverage(config)} target`} />
          <SmallDataCard label="Partner fields" value={`${getPartnerFacingFields(config).length} field`} />
        </div>

        <div className="mt-4 rounded-[14px] border border-[#D9E1EA] bg-[#F7FAFD] p-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">Readiness</span>
            <span className="font-medium text-slate-900">{readiness}%</span>
          </div>
          <div className="h-2 rounded-full bg-[#D9E1EA]">
            <div
              className="h-2 rounded-full bg-[#0A4D82]"
              style={{ width: `${Math.max(8, readiness)}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{missing} pending item</span>
            <span>{config.updatedAt}</span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#0A4D82] px-4 text-sm font-medium text-white shadow-sm hover:brightness-110"
          >
            Buka Pengaturan
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[#D9E1EA] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

function SummaryPanel({ config, primaryLabel = "ISI DATA", secondaryLabel = "KEMBALI", onPrimary, onSecondary, primaryDisabled = false }) {
  if (!config) return null;
  const pending = getPendingItems(config);
  const isLifeGuard = config.family === "group-pa";
  const isTripTravelGuard = ["health-group", "travel-group"].includes(config.family);
  const infoRows = isLifeGuard
    ? [
        { label: "Nama Tertanggung", value: config.partnerName || "-" },
        { label: "Jenis Pertanggungan", value: config.data.master.coverageType || "-" },
        { label: "Nomor Polis Induk / PKS", value: config.data.master.masterPolicyNo || "-" },
        { label: "Kelas Risiko", value: config.data.master.riskClass || "-" },
      ]
    : isTripTravelGuard
      ? [
          { label: "Nama Tertanggung", value: config.data.blueprint.insuredName || config.partnerName || "-" },
          { label: "Jenis Pertanggungan", value: config.data.master.coverageType || "-" },
          { label: "Nomor Polis Induk / PKS", value: config.data.master.masterPolicyNo || "-" },
          { label: "Kode Akuisisi", value: config.data.blueprint.acquisitionCode || "-" },
        ]
    : [
        { label: "Nama Tertanggung", value: config.partnerName || "-" },
        { label: "Mode Integrasi", value: config.data.blueprint.integrationMode || "-" },
        { label: "Sync Target", value: config.data.blueprint.syncTarget || "-" },
        { label: "Kode Produk", value: config.data.master.productCode || "-" },
      ];
  return (
    <div className="overflow-hidden rounded-[20px] bg-[#0A4D82] p-3.5 shadow-[0_14px_32px_rgba(15,23,42,0.18)]">
      <button type="button" className="flex w-full items-center justify-between gap-3 rounded-[10px] bg-[#0A4D82] px-1.5 py-1 text-left">
        <div className="flex items-center gap-3 text-white">
          <FileSpreadsheet className="h-5 w-5" />
          <div className="text-[15px] font-semibold">Ringkasan</div>
        </div>
        <ChevronDown className="h-4 w-4 text-white/90" />
      </button>

      <div className="mt-2.5 border-t border-white/15 pt-2.5">
        {infoRows.map((item) => (
          <div key={item.label} className="mt-1.5 flex items-start justify-between gap-3 text-[12px] leading-5 text-white">
            <div className="min-w-0 flex-1">{item.label}</div>
            <div className="shrink-0 text-right font-medium">{fixDisplayText(item.value)}</div>
          </div>
        ))}
      </div>

      <div className="mt-3.5 rounded-[14px] bg-[#FFF4E1] px-4 py-3.5 text-[#A35E00]">
        <div className="text-[14px] font-medium">Yang masih perlu dilengkapi</div>
        {pending.length ? (
          <div className="mt-2.5 space-y-2.5">
            {pending.slice(0, 4).map((item) => (
              <div key={item} className="flex items-start gap-2 text-[12px] leading-5">
                <TriangleAlert className="mt-1 h-4 w-4 shrink-0" />
                <div>{item}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-3.5 space-y-2.5">
        <button
          type="button"
          onClick={onPrimary}
          disabled={primaryDisabled}
          className={cls(
            "flex h-[46px] w-full items-center justify-center rounded-[12px] text-[13px] font-semibold uppercase tracking-wide text-white shadow-sm",
            primaryDisabled ? "cursor-not-allowed bg-[#93A8C0]" : "bg-[#F5A623] hover:brightness-105"
          )}
        >
          {primaryLabel}
        </button>
        <button
          type="button"
          onClick={onSecondary}
          className="flex h-[46px] w-full items-center justify-center rounded-[12px] border border-white/25 bg-transparent px-4 text-[13px] font-medium uppercase tracking-wide text-white hover:bg-white/10"
        >
          {secondaryLabel}
        </button>
      </div>
    </div>
  );
}

function SummarySheet({ open, onClose, config, primaryLabel, secondaryLabel, onPrimary, onSecondary, primaryDisabled }) {
  if (!open || !config) return null;
  const cardMeta = getPortalCardMeta(config.family);
  return (
    <div className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden">
      <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-auto rounded-t-[28px] bg-white p-4 shadow-2xl">
        <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-slate-200" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Ringkasan</div>
            <div className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              {fixDisplayText(cardMeta?.title || config.productName || config.title)}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700"
          >
            Tutup
          </button>
        </div>
        <SummaryPanel
          config={config}
          primaryLabel={primaryLabel}
          secondaryLabel={secondaryLabel}
          onPrimary={onPrimary}
          onSecondary={onSecondary}
          primaryDisabled={primaryDisabled}
        />
      </div>
    </div>
  );
}

function ReviewSummaryCard({ infoRows = [], premiumRows = [], totalLabel = "Estimasi Premi", totalValue = "-", pendingItems = [] }) {
  return (
    <div className="overflow-hidden rounded-[20px] bg-[#0A4D82] p-3.5 text-white shadow-[0_14px_32px_rgba(15,23,42,0.18)]">
      <div className="flex items-center gap-3 px-1.5 py-1">
        <FileSpreadsheet className="h-5 w-5" />
        <div className="text-[15px] font-semibold">Ringkasan</div>
      </div>
      <div className="mt-2.5 border-t border-white/15 pt-2.5">
        {infoRows.map((item) => (
          <div key={item.label} className="mt-1.5 flex items-start justify-between gap-3 text-[12px] leading-5 text-white">
            <div className="min-w-0 flex-1">{item.label}</div>
            <div className="shrink-0 text-right font-medium">{fixDisplayText(item.value)}</div>
          </div>
        ))}
      </div>
      {premiumRows.length ? (
        <div className="mt-3.5 border-t border-white/15 pt-2.5">
          {premiumRows.map((item) => (
            <div key={item.label} className="mt-1.5 flex items-start justify-between gap-3 text-[12px] leading-5 text-white">
              <div className="min-w-0 flex-1">{item.label}</div>
              <div className="shrink-0 text-right font-medium">{fixDisplayText(item.value)}</div>
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-3.5 rounded-[14px] bg-white/10 px-4 py-3.5">
        <div className="text-[12px] text-white/75">{totalLabel}</div>
        <div className="mt-2 text-right text-[28px] font-bold leading-none">{fixDisplayText(totalValue)}</div>
      </div>
      {pendingItems.length ? (
        <div className="mt-3.5 rounded-[14px] bg-[#FFF4E1] px-4 py-3.5 text-[#A35E00]">
          <div className="text-[14px] font-medium">Yang masih perlu dilengkapi</div>
          <div className="mt-2.5 space-y-2.5">
            {pendingItems.slice(0, 4).map((item) => (
              <div key={item} className="flex items-start gap-2 text-[12px] leading-5">
                <TriangleAlert className="mt-1 h-4 w-4 shrink-0" />
                <div>{fixDisplayText(item)}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LifeGuardSidebarSummaryCard({ beneficiary = "-", infoRows = [], premiumRows = [], premiumValue = "-", pendingItems = [] }) {
  const hasPending = pendingItems.length > 0;

  return (
    <div className="overflow-hidden rounded-[30px] bg-[#0A4D82] px-5 py-6 text-white shadow-[0_22px_48px_rgba(10,77,130,0.28)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
          <FileSpreadsheet className="h-5 w-5" />
        </div>
        <div className="text-[18px] font-semibold tracking-tight">Ringkasan</div>
      </div>

      <div className="mt-5 space-y-3.5 border-t border-white/15 pt-5">
        <div className="flex items-start justify-between gap-4 text-[15px] leading-6">
          <div className="text-white/85">Penerima Manfaat</div>
          <div className="max-w-[210px] text-right font-semibold uppercase">{fixDisplayText(beneficiary)}</div>
        </div>
        {infoRows.map((item) => (
          <div key={item.label} className="flex items-start justify-between gap-4 text-[15px] leading-6">
            <div className="text-white/85">{item.label}</div>
            <div className="max-w-[210px] text-right font-semibold">{fixDisplayText(item.value)}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-3 border-t border-white/15 pt-5">
        {premiumRows.map((item) => (
          <div key={item.label} className="flex items-start justify-between gap-4 text-[15px] leading-6">
            <div className="text-white/85">{item.label}</div>
            <div className="max-w-[210px] text-right font-semibold">{fixDisplayText(item.value)}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[24px] bg-white/10 px-6 py-5">
        <div className="text-[13px] text-white/75">Estimasi Premi</div>
        <div className="mt-3 text-right text-[26px] font-bold leading-[1.05] sm:text-[32px]">{fixDisplayText(premiumValue)}</div>
      </div>

      <div className={cls("mt-5 rounded-[24px] px-5 py-5", hasPending ? "bg-[#FFF4E1] text-[#A35E00]" : "bg-emerald-50 text-emerald-700")}>
        <div className="text-[15px] font-medium">{hasPending ? "Yang masih perlu dilengkapi" : "Konfigurasi sudah siap"}</div>
        <div className="mt-3 space-y-2.5">
          {hasPending ? (
            pendingItems.slice(0, 4).map((item) => (
              <div key={item} className="flex items-start gap-2 text-[13px] leading-5">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <div>{fixDisplayText(item)}</div>
              </div>
            ))
          ) : (
            <div className="flex items-start gap-2 text-[13px] leading-5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <div>Semua komponen utama sudah lengkap dan bisa diteruskan ke tahap berikutnya.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LifeGuardConfigurationSnapshotCard({ items = [] }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[#D7E3EF] bg-white shadow-[0_18px_38px_rgba(15,23,42,0.08)]">
      <div className="px-6 py-6">
        <h3 className="text-[18px] font-semibold tracking-tight text-slate-900">Tinjauan Konfigurasi</h3>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((item) => (
            <div key={item.label} className="rounded-[24px] border border-[#C9D7E8] bg-[#F6F9FD] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#90A4C2]">{item.label}</p>
              <p className="mt-3 text-[17px] font-semibold leading-7 text-slate-950">{fixDisplayText(item.value)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LifeGuardConfigurationReviewCard({
  readiness = 0,
  statusLabel = "-",
  roleLabel = "-",
  referenceCode = "-",
  periodLabel = "-",
  checklistItems = [],
  activeNoteLabel = "Analisa Aktif",
  activeNoteValue = "",
  onToggleChecklist,
  canToggleChecklist = false,
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[#D7E3EF] bg-white shadow-[0_18px_38px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-100 px-5 py-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EAF4FF] text-[#0A4D82]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[18px] font-semibold tracking-tight text-slate-900">Tinjauan Proses</div>
            <p className="mt-1 text-[13px] leading-5 text-slate-500">Progress readiness, checklist review, dan catatan aktif untuk alur maker, checker, dan approval.</p>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-5 py-5">
        <div className="rounded-[20px] bg-slate-50 px-4 py-4">
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
            <span>Readiness</span>
            <span className="text-slate-700">{readiness}%</span>
          </div>
          <div className="mt-3 h-2.5 rounded-full bg-slate-200">
            <div className="h-2.5 rounded-full bg-[#0A4D82] transition-all duration-300" style={{ width: `${Math.max(8, readiness)}%` }} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-[12px] leading-5 text-slate-600">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Status</div>
              <div className="mt-1 font-semibold text-slate-900">{fixDisplayText(statusLabel)}</div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Peran Aktif</div>
              <div className="mt-1 font-semibold text-slate-900">{fixDisplayText(roleLabel)}</div>
            </div>
            <div className="col-span-2">
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Referensi</div>
              <div className="mt-1 font-semibold text-slate-900">{fixDisplayText(referenceCode)}</div>
            </div>
            <div className="col-span-2">
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Periode</div>
              <div className="mt-1 font-semibold text-slate-900">{fixDisplayText(periodLabel)}</div>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Checklist Review</div>
          <div className="space-y-2.5">
            {checklistItems.map((item) => {
              const body = (
                <>
                  <div
                    className={cls(
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                      item.checked ? "border-[#0A4D82] bg-[#0A4D82] text-white" : "border-slate-300 bg-white text-transparent"
                    )}
                  >
                    {item.checked ? <Check className="h-3.5 w-3.5" /> : null}
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold text-slate-900">{item.title}</div>
                    <div className="mt-1 text-[12px] leading-5 text-slate-500">{item.detail}</div>
                    <div className={cls("mt-1.5 text-[10px] font-black uppercase tracking-[0.14em]", item.checked ? "text-emerald-600" : "text-amber-600")}>
                      {item.checked ? "Sudah dicek" : "Masih pending"}
                    </div>
                  </div>
                </>
              );

              return canToggleChecklist ? (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onToggleChecklist?.(item.key, !item.checked)}
                  className={cls(
                    "flex w-full items-start gap-3 rounded-[20px] border px-4 py-3 text-left transition",
                    item.checked ? "border-[#BFD8EE] bg-[#F4F9FE]" : "border-slate-200 bg-white hover:border-[#BFD8EE]"
                  )}
                >
                  {body}
                </button>
              ) : (
                <div key={item.key} className={cls("flex items-start gap-3 rounded-[20px] border px-4 py-3", item.checked ? "border-[#BFD8EE] bg-[#F4F9FE]" : "border-slate-200 bg-white")}>
                  {body}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#0A4D82]">
            <NotebookPen className="h-4 w-4" />
            {activeNoteLabel}
          </div>
          <p className="mt-3 text-[13px] leading-6 text-slate-600">
            {activeNoteValue ? fixDisplayText(activeNoteValue) : "Catatan untuk peran aktif belum diisi."}
          </p>
        </div>
      </div>
    </div>
  );
}

function TravelSafeBenefitSummaryCard({ rows = [], emptyText = "Belum ada perluasan aktif untuk ditampilkan." }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[#D7E3EF] bg-white shadow-[0_18px_38px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-100 px-6 py-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EAF4FF] text-[#0A4D82]">
            <Route className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[18px] font-semibold tracking-tight text-slate-900">Tinjauan Manfaat Tambahan</div>
            <p className="mt-1 text-[13px] leading-5 text-slate-500">Ringkasan perluasan aktif berikut limit, rate, dan estimasi premi per manfaat Travel Safe.</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-5">
        {rows.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-[13px] text-slate-500">
            {emptyText}
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((item) => (
              <div key={item.id} className="rounded-[22px] border border-slate-200 bg-[#F7FAFD] px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#90A4C2]">{item.category}</div>
                    <div className="mt-2 text-[15px] font-semibold text-slate-900">{fixDisplayText(item.label)}</div>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#0A4D82] shadow-sm">
                    {item.isCheckOnly ? "Check Only" : "Perluasan Aktif"}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <SmallDataCard label="Limit / HP" value={item.limitText} />
                  <SmallDataCard label="Rate" value={item.rateText} />
                  <SmallDataCard label="Premi" value={item.premiumText} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AppProductHeader({
  sessionName,
  sessionRoleLabel,
  accountInitials,
  onHome,
  accountMenuOpen,
  onToggleAccountMenu,
  accountMenuItems,
}) {
  return (
    <header className="sticky top-0 z-30 bg-[#0A4D82] shadow-sm">
      <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-3 px-4 py-3 md:gap-4 md:px-6 md:py-4">
        <div className="flex min-w-0 items-center gap-3 text-white md:gap-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-sm bg-[#091E42] md:h-8 md:w-8">
              <div className="absolute left-0 top-0 h-full w-full bg-[linear-gradient(135deg,#D71920_0%,#D71920_42%,transparent_42%,transparent_100%)]" />
              <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-white" />
            </div>
            <div className="text-[12px] font-black leading-[0.95] md:text-[18px]">
              Danantara
              <div className="-mt-0.5 md:-mt-1">Indonesia</div>
            </div>
          </div>
          <div className="hidden h-10 w-px bg-white/20 md:block" />
          <div className="hidden items-center gap-2.5 text-white md:flex">
            <div className="text-[14px] font-semibold leading-none md:text-[15px]">asuransi</div>
            <div className="h-1.5 w-1.5 rounded-full bg-white/70" />
            <div className="text-[14px] font-semibold leading-none md:text-[15px]">jasindo</div>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={onHome}
            className="inline-flex items-center gap-2 rounded-[8px] bg-[#F5A623] px-5 py-3 text-sm font-semibold text-white shadow-sm"
          >
            <Home className="h-4 w-4" />
            Beranda
          </button>
          <button className="inline-flex items-center gap-2 rounded-[8px] bg-white/6 px-5 py-3 text-sm font-medium text-white hover:bg-white/10">
            <ShieldCheck className="h-4 w-4" />
            Produk
          </button>
        </div>

        <div className="relative flex items-center gap-2 md:gap-3">
          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white shadow-sm"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">View as</span>
            <span className="max-w-[132px] truncate">{sessionRoleLabel}</span>
            <ChevronDown className="h-4 w-4 text-white/85" />
          </button>
          <button
            type="button"
            aria-expanded={accountMenuOpen}
            aria-haspopup="menu"
            aria-controls="partner-account-menu"
            onClick={onToggleAccountMenu}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-3.5 text-sm font-semibold text-slate-800 shadow-sm md:px-4"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EA4335] text-[10px] font-bold text-white">
              {accountInitials}
            </span>
            <span className="max-w-[108px] truncate text-[13px] md:max-w-none md:text-sm">{sessionName}</span>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>
          <button type="button" aria-label="Lihat notifikasi" className="hidden h-11 w-11 items-center justify-center rounded-[10px] border border-white/20 bg-white/10 text-white shadow-sm hover:bg-white/15 md:inline-flex">
            <Bell className="h-4 w-4" />
          </button>
          <div id="partner-account-menu">
            <UserPillMenu open={accountMenuOpen} items={accountMenuItems} />
          </div>
        </div>
      </div>
    </header>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="mt-4 rounded-[22px] border border-dashed border-[#C9D5E3] bg-white p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#F1F7FD]">
        <Search className="h-5 w-5 text-[#0A4D82]" />
      </div>
      <div className="mt-4 text-lg font-semibold text-slate-900">Belum ada konfigurasi yang cocok</div>
      <div className="mt-2 text-sm text-slate-500">
        Coba ubah filter atau buat konfigurasi baru untuk partner berikutnya.
      </div>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#0A4D82] px-5 text-sm font-medium text-white"
      >
        <Plus className="h-4 w-4" />
        Buat Konfigurasi
      </button>
    </div>
  );
}

function ChecklistCard({ title, detail, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cls(
        "flex items-start gap-3 rounded-2xl border p-4 text-left transition",
        checked ? "border-[#0A4D82] bg-[#F4F9FE]" : "border-slate-200 bg-white"
      )}
    >
      <div
        className={cls(
          "mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2",
          checked ? "border-[#0A4D82] bg-[#0A4D82] text-white" : "border-slate-300 bg-white"
        )}
      >
        {checked ? <Check className="h-3.5 w-3.5" /> : null}
      </div>
      <div>
        <div className="text-sm font-medium text-slate-900">{title}</div>
        <div className="mt-1 text-xs leading-5 text-slate-500">{detail}</div>
      </div>
    </button>
  );
}

function LifeGuardCoverageCard({ item, selected, expanded, onSelect, onToggle }) {
  const Icon = item.icon || HeartPulse;
  return (
    <div className="overflow-hidden rounded-[14px] border border-[#BFD3EA] bg-[#F7FAFE]">
      <div className="flex w-full items-start justify-between gap-3 px-3.5 py-3 text-left">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onSelect}
            className={cls("mt-1 flex h-5 w-5 items-center justify-center rounded border", selected ? "border-[#0A4D82] bg-[#EAF3FF] text-[#0A4D82]" : "border-slate-400 bg-white text-transparent")}
          >
            {selected ? <Check className="h-3.5 w-3.5" /> : null}
          </button>
          <button type="button" onClick={onToggle} className="text-left">
            <div className="flex items-center gap-2 text-[#0A4D82]">
              <Icon className="h-[15px] w-[15px] shrink-0" />
              <div className="text-[14px] font-medium">{item.title}</div>
            </div>
          </button>
        </div>
        <button type="button" onClick={onToggle}>
          <ChevronDown className={cls("mt-1 h-4 w-4 shrink-0 text-slate-500 transition", expanded && "rotate-180")} />
        </button>
      </div>
      {expanded ? (
        <div className="border-t border-[#D4E0EF] bg-white px-3.5 py-3 text-[12px] leading-5 text-slate-700">
          <div>{item.description}</div>
          <div className="mt-2 text-slate-800">{item.note}</div>
        </div>
      ) : null}
    </div>
  );
}

function PartnerClauseAccordionRow({
  title,
  subtitle,
  detail,
  selected,
  onSelect,
  expanded,
  onToggle,
  icon: Icon = FileCode2,
}) {
  return (
    <div className="rounded-[14px] border border-[#C9D5E3] bg-[#F8FBFE]">
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <button
          type="button"
          onClick={onSelect}
          className={cls(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
            selected ? "border-[#0A4D82] bg-[#EAF3FF] text-[#0A4D82]" : "border-slate-300 bg-white text-transparent"
          )}
        >
          {selected ? <Check className="h-3.5 w-3.5" /> : null}
        </button>
        <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[#0A4D82]">
              <Icon className="h-[14px] w-[14px] shrink-0" />
              <div className="truncate text-[14px] font-medium leading-5">{title}</div>
            </div>
            {subtitle ? <div className="mt-0.5 text-[11px] leading-4 text-slate-500">{subtitle}</div> : null}
          </div>
          <ChevronDown className={cls("h-4 w-4 shrink-0 text-slate-500 transition", expanded && "rotate-180")} />
        </button>
      </div>
      {expanded ? (
        <div className="border-t border-[#D6E0EA] px-3 py-2.5">
          <div className="text-[12px] leading-5 text-slate-700">{detail}</div>
        </div>
      ) : null}
    </div>
  );
}

function PartnerClauseNoteCard({ title, children }) {
  return (
    <div className="rounded-xl border border-[#C9D5E3] bg-[#F8FBFE] p-4">
      <div className="mb-3 text-[14px] font-semibold text-[#0A4D82]">{title}</div>
      {children}
    </div>
  );
}

function QuickFact({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[18px] border border-white/15 bg-white/10 p-4 text-white backdrop-blur-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-white/12 text-white">
        {React.createElement(Icon, { className: "h-5 w-5" })}
      </div>
      <div className="mt-3 text-[11px] font-black uppercase tracking-[0.18em] text-white/60">{label}</div>
      <div className="mt-1 text-base font-bold text-white">{value}</div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[14px] border border-[#D9E1EA] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#F1F7FD] text-[#0A4D82]">
          {React.createElement(Icon, { className: "h-4 w-4" })}
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{label}</div>
          <div className="truncate text-sm font-medium text-slate-900">{fixDisplayText(value)}</div>
        </div>
      </div>
    </div>
  );
}

function MiniReviewCard({ title, value, note }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{title}</div>
      <div className="mt-2 text-base font-medium text-slate-900">{value}</div>
      <div className="mt-1 text-xs leading-5 text-slate-500">{note}</div>
    </div>
  );
}

function SmallDataCard({ label, value }) {
  return (
    <div className="rounded-[14px] border border-[#D9E1EA] bg-[#F7FAFD] p-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-1 text-[13px] font-medium text-slate-900">{fixDisplayText(value)}</div>
    </div>
  );
}

function StatusBadge({ status, light = false }) {
  return (
    <span
      className={cls(
        "inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]",
        light ? "border-white/20 bg-white/15 text-white" : getStatusTone(status)
      )}
    >
      {status}
    </span>
  );
}

function SectionCard({ title, subtitle, action, children }) {
  return (
    <section className="rounded-[20px] border border-[#D9E1EA] bg-white p-4 shadow-sm md:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[16px] font-semibold tracking-tight text-slate-950">{title}</div>
          {subtitle ? <div className="mt-1 max-w-3xl text-[13px] leading-5 text-slate-500">{subtitle}</div> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function FormField({ label, required, helper, children }) {
  const helperText = helper ?? FIELD_HELPERS[label];
  return (
    <label className="block">
      <div className="mb-2">
        <div className="flex flex-wrap items-center gap-1.5 text-[12px] font-medium text-slate-700">
          {label}
          {required ? <span className="text-[#E66A1E]"> *</span> : null}
          {helperText ? (
            <span
              title={helperText}
              className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#BFD0E0] text-[10px] font-semibold text-[#5E7BA6]"
            >
              !
            </span>
          ) : null}
        </div>
      </div>
      {children}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", disabled = false, className = "" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={cls(
        "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[13px] outline-none transition placeholder:text-slate-400 focus:border-[#0A4D82] focus:ring-4 focus:ring-[#0A4D82]/10 focus-visible:ring-4 focus-visible:ring-[#0A4D82]/12 focus-visible:ring-offset-2",
        disabled && "cursor-not-allowed bg-slate-50 text-slate-500",
        className
      )}
    />
  );
}

function TextAreaInput({ value, onChange, placeholder, rows = 4, disabled = false, className = "" }) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={cls(
        "min-h-[112px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[13px] outline-none transition placeholder:text-slate-400 focus:border-[#0A4D82] focus:ring-4 focus:ring-[#0A4D82]/10 focus-visible:ring-4 focus-visible:ring-[#0A4D82]/12 focus-visible:ring-offset-2",
        disabled && "cursor-not-allowed bg-slate-50 text-slate-500",
        className
      )}
    />
  );
}

function SelectInput({ value, onChange, options, renderLabel, disabled = false, className = "" }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={cls(
          "h-11 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-[13px] outline-none transition focus:border-[#0A4D82] focus:ring-4 focus:ring-[#0A4D82]/10 focus-visible:ring-4 focus-visible:ring-[#0A4D82]/12 focus-visible:ring-offset-2",
          disabled && "cursor-not-allowed bg-slate-50 text-slate-500",
          className
        )}
      >
        {options.map((item) => (
          <option key={item} value={item}>
            {renderLabel ? renderLabel(item) : item || "Pilih"}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function CurrencyInput({ value, onChange, disabled = false, className = "" }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-slate-500">
        Rp
      </span>
      <input
        value={value}
        onChange={(event) => onChange(formatNumber(event.target.value))}
        inputMode="numeric"
        disabled={disabled}
        className={cls(
          "h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-[13px] outline-none transition focus:border-[#0A4D82] focus:ring-4 focus:ring-[#0A4D82]/10 focus-visible:ring-4 focus-visible:ring-[#0A4D82]/12 focus-visible:ring-offset-2",
          disabled && "cursor-not-allowed bg-slate-50 text-slate-500",
          className
        )}
      />
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="mt-2 flex items-start justify-between gap-3 text-[13px]">
      <div className="min-w-0 flex-1 text-white/70">{label}</div>
      <div className="shrink-0 text-right font-semibold text-white">{fixDisplayText(value)}</div>
    </div>
  );
}

function RoleGateCard({ role, onSelect }) {
  const meta =
    role === "Maker"
      ? {
          label: "ROM (Maker)",
          note: "Menyusun draft konfigurasi partner dan mengirim ke checker.",
          icon: NotebookPen,
          tone: "bg-[#0A4D82]",
        }
      : role === "Checker"
        ? {
            label: "Admin UDW (Checker)",
            note: "Memeriksa kelengkapan, mapping, dan sanity check sebelum approval.",
            icon: Search,
            tone: "bg-[#F5A623]",
          }
        : {
            label: "HO UDW (Approval)",
            note: "Mereview final dan mengaktifkan konfigurasi yang siap jalan.",
            icon: BadgeCheck,
            tone: "bg-emerald-600",
          };
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(role)}
      className="group rounded-[22px] border border-[#D9E1EA] bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)]"
    >
      <div className={cls("flex h-12 w-12 items-center justify-center rounded-[14px] text-white shadow-sm", meta.tone)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-[18px] font-semibold tracking-tight text-slate-950">{meta.label}</div>
      <div className="mt-2 text-sm leading-6 text-slate-500">{meta.note}</div>
      <div className="mt-5 inline-flex items-center gap-2 rounded-[10px] bg-[#F7FAFD] px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#0A4D82] group-hover:bg-[#EEF5FB]">
        Masuk
        <ChevronRight className="h-4 w-4" />
      </div>
    </button>
  );
}

function ProductLandingCard({ card, count, featured, onOpen }) {
  const Icon = getFamilyMeta(card.family).icon;
  void count;

  return (
    <button
      type="button"
      onClick={() => onOpen(card.family)}
      className="group relative h-[212px] overflow-hidden rounded-[10px] text-left transition sm:h-[228px] md:h-[252px] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.16)]"
    >
      <img src={card.image} alt={card.title} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.24)_0%,rgba(15,23,42,0.18)_36%,rgba(15,23,42,0.74)_100%)]" />
      <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-[8px] bg-[rgba(116,124,138,0.82)] px-3 py-2 text-[11px] font-bold text-white backdrop-blur-sm">
        <Icon className="h-3.5 w-3.5" />
        <span>{card.category}</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex h-full flex-col justify-end p-4 text-white">
        <div className="translate-y-0 transition duration-300 ease-out group-hover:-translate-y-1">
          <div className="max-w-[92%] text-[18px] font-bold leading-tight md:max-w-[88%] md:text-[20px]">{card.title}</div>
          <div className="mt-2 max-w-[92%] text-sm leading-6 text-white/95 md:max-w-[80%]">
            {featured ? fixDisplayText(featured.productName || featured.title) : card.defaultProduct}
          </div>
          <div className="mt-3 md:mt-4">
          <span className="inline-flex min-w-[132px] items-center justify-center rounded-[14px] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-[#102A43]">
            Buka
          </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function WorkflowRoleStrip({ status }) {
  const step = status === "Checker" ? 2 : status === "Approval" || status === "Active" ? 3 : 1;
  const items = [
    { label: "Maker", note: "Draft" },
    { label: "Checker", note: "UDW" },
    { label: "Approval", note: "HO" },
  ];

  return (
    <div className="rounded-[18px] border border-white/15 bg-white/10 p-4 text-white backdrop-blur-sm">
      <div className="relative">
        <div className="absolute left-0 top-[11px] h-1 w-full rounded-full bg-white/15" />
        <div className="absolute left-0 top-[11px] h-1 rounded-full bg-[#F5A623]" style={{ width: `${((step - 1) / 2) * 100}%` }} />
        <div className="relative flex justify-between">
          {items.map((item, index) => {
            const done = index + 1 <= step;
            return (
              <div key={item.label} className="w-1/3 text-center">
                <div className={cls("mx-auto flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-black ring-4 ring-[#0A4D82]", done ? "border-[#F5A623] bg-[#F5A623] text-white" : "border-white/25 bg-[#0A4D82] text-white/70")}>
                  {index + 1}
                </div>
                <div className="mt-3 text-[9px] font-black uppercase tracking-[0.16em] text-white/72">{item.label}</div>
                <div className="text-[10px] font-semibold text-white">{item.note}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StudioStepNode({ title, subtitle, active, icon }) {
  return (
    <div
      className={cls(
        "relative flex min-w-0 flex-col items-center text-center transition",
        active
          ? "rounded-[20px] border border-[#D8E1EA] bg-white px-4 py-4 shadow-sm md:min-h-[128px] md:justify-center"
          : "px-1 py-2 md:min-h-[128px] md:justify-center"
      )}
    >
      <div
        className={cls(
          "flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white md:h-11 md:w-11",
          active ? "border-[#0A4D82] text-[#0A4D82] shadow-md shadow-[#0A4D82]/10" : "border-slate-300 text-slate-300"
        )}
      >
        {icon}
      </div>
      <div className={cls("mt-3 text-[14px] font-bold leading-5 md:text-[16px]", active ? "text-[#041E42]" : "text-[#5F7A99]")}>{title}</div>
      <div
        className={cls(
          "mt-2 rounded-full px-3 py-1 text-[11px] font-medium leading-4",
          active ? "bg-[#EAF3FF] text-[#0A4D82]" : "border border-[#D8E1EA] bg-white text-[#8EA3BC]"
        )}
      >
        {subtitle}
      </div>
    </div>
  );
}

function StudioJourneySteps({ stepIndex = 0, stepState = [], maxUnlockedStep = 0, onSelect, embedded = false }) {
  const content = (
    <div className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 md:mx-0 md:flex-row md:gap-5 md:overflow-visible md:px-0 md:pb-0">
      {STEP_LIST.map((step, index) => {
        const Icon = step.icon;
        const active = stepIndex === index;
        const done = stepIndex > index || Boolean(stepState[index]?.done && !active);
        const canOpen = index <= maxUnlockedStep;
        const subtitle = active ? "Dalam proses" : done ? "Selesai" : canOpen ? "Bisa dibuka" : "Menunggu";

        return (
          <React.Fragment key={step.id}>
            {index > 0 ? <div className="pointer-events-none hidden h-px flex-1 self-center bg-slate-300 md:block" /> : null}
            <button
              type="button"
              onClick={() => {
                if (canOpen) onSelect?.(index);
              }}
              className={cls(
                "relative z-10 block w-[140px] shrink-0 snap-start rounded-xl px-1 py-1 md:w-auto md:flex-1 md:shrink md:snap-none",
                canOpen ? "cursor-pointer" : "cursor-not-allowed opacity-70"
              )}
            >
              <StudioStepNode
                title={step.label}
                subtitle={subtitle}
                active={active}
                icon={<Icon className="h-4 w-4" />}
              />
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="mx-auto mt-5 max-w-[1120px] rounded-[30px] bg-white p-5 shadow-2xl shadow-black/15 md:mt-6 md:p-6">
      <div className="rounded-[24px] border border-[#D8E1EA] bg-[#F4F7FA] px-6 py-7 md:px-7 md:py-7">{content}</div>
    </div>
  );
}

function StudioConfigRail({ configs, selectedId, onOpen, onCreate }) {
  return (
    <div className="rounded-[20px] border border-[#D9E1EA] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Pilihan Konfigurasi</div>
          <div className="mt-1 text-lg font-bold text-slate-900">Buka pengaturan satu per satu sesuai produk</div>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#0A4D82] px-4 text-sm font-bold text-white shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Konfigurasi Baru
        </button>
      </div>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
        {configs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpen(item.id)}
            className={cls(
              "min-w-[260px] rounded-[14px] border p-4 text-left transition",
              item.id === selectedId ? "border-[#0A4D82] bg-[#F8FBFE]" : "border-[#D9E1EA] bg-white hover:bg-slate-50"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-slate-900">{fixDisplayText(item.title)}</div>
                <div className="mt-1 truncate text-xs text-slate-500">{fixDisplayText(item.partnerName)}</div>
              </div>
              <StatusBadge status={item.status} />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <SmallDataCard label="Produk" value={fixDisplayText(item.productName || "-")} />
              <SmallDataCard label="Version" value={item.version} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default PartnerConfigStudio;

