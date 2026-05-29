import React, { useMemo, useState } from "react";
import { ArrowLeft, Bike, BriefcaseBusiness, Building2, CalendarDays, Car, CheckCircle2, ChevronDown, Download, FileText, GraduationCap, Landmark, Mail, MapPin, Plane, Phone, RotateCcw, Search, ShieldCheck, Tag, User, Wallet } from "lucide-react";

import { PRODUCT_POLICY_CODES } from "../menuData.js";
import { cls } from "../menuUtils.js";

const TODAY = new Date("2026-05-28T00:00:00");

const POLICY_ROWS = [
  { participant: "Budi Santoso", product: "Life Guard", branch: "Head Office", premium: "Rp 1.250.000", paymentStatus: "Lunas", issuedAt: "01/05/2026", coverageEnd: "30/04/2027", invoice: "INV-2026-000123", sequence: "00008" },
  { participant: "Siti Nurhaliza", product: "Edu Protect", branch: "Bandung", premium: "Rp 950.000", paymentStatus: "Lunas", issuedAt: "01/05/2026", coverageEnd: "30/04/2027", invoice: "INV-2026-000122", sequence: "00007" },
  { participant: "Ilham Pratama", product: "Trip Guard", branch: "Surabaya", premium: "Rp 675.000", paymentStatus: "Menunggu Pembayaran", issuedAt: "-", coverageEnd: "-", invoice: "INV-2026-000121", sequence: "00006" },
  { participant: "Rina Amelia", product: "Travel Safe", branch: "Yogyakarta", premium: "Rp 1.145.000", paymentStatus: "Lunas", issuedAt: "30/04/2026", coverageEnd: "29/04/2027", invoice: "INV-2026-000120", sequence: "00005" },
  { participant: "PT Maju Bersama", product: "Asuransi Kebakaran", branch: "Medan", premium: "Rp 3.250.000", paymentStatus: "Lunas", issuedAt: "28/04/2026", coverageEnd: "27/04/2027", invoice: "INV-2026-000119", sequence: "00004" },
  { participant: "CV Sejahtera Abadi", product: "Asuransi Property All Risk", branch: "Semarang", premium: "Rp 4.750.000", paymentStatus: "Lunas", issuedAt: "27/04/2025", coverageEnd: "26/04/2026", invoice: "INV-2026-000117", sequence: "00002" },
  { participant: "PT Nusantara Sentosa", product: "Asuransi Gempa Bumi", branch: "Padang", premium: "Rp 575.000", paymentStatus: "Lunas", issuedAt: "25/05/2026", coverageEnd: "31/05/2027", invoice: "INV-2026-000203", sequence: "00013" },
  { participant: "Andi Wijaya", product: "Asuransi Mobil TLO", branch: "Denpasar", premium: "Rp 2.450.000", paymentStatus: "Menunggu Pembayaran", issuedAt: "-", coverageEnd: "-", invoice: "INV-2026-000116", sequence: "00001" },
  { participant: "Fajar Nugroho", product: "Asuransi Sepeda Motor TLO", branch: "Palembang", premium: "Rp 385.000", paymentStatus: "Lunas", issuedAt: "02/05/2026", coverageEnd: "01/05/2027", invoice: "INV-2026-000125", sequence: "00010" },
  { participant: "Mega Putri", product: "Life Guard", branch: "Digital Channel", premium: "Rp 1.550.000", paymentStatus: "Lunas", issuedAt: "02/05/2026", coverageEnd: "01/05/2027", invoice: "INV-2026-000126", sequence: "00011" },
  { participant: "Dewi Lestari", product: "Travel Safe", branch: "Makassar", premium: "Rp 820.000", paymentStatus: "Pembayaran Kedaluwarsa", issuedAt: "-", coverageEnd: "-", invoice: "INV-2026-000118", sequence: "00003" },
].map((row) => {
  const code = PRODUCT_POLICY_CODES[row.product] || "000";
  return { ...row, productCode: code, policyNumber: `204.${code}.100.26.${row.sequence}/555/000`, policyStatus: getPolicyStatus(row) };
});

const JASINDO_BRANCHES = [
  "Head Office",
  "Digital Channel",
  "Ambon",
  "Balikpapan",
  "Bandar Lampung",
  "Bandung",
  "Banjarmasin",
  "Batam",
  "Bogor",
  "Denpasar",
  "Jambi",
  "Jakarta 2",
  "Jayapura",
  "Kendari",
  "Kupang",
  "Makassar",
  "Manado",
  "Mataram",
  "Medan",
  "Padang",
  "Palembang",
  "Palu",
  "Pekanbaru",
  "Pontianak",
  "Samarinda",
  "Sampit",
  "Semarang",
  "Serang",
  "Solo",
  "Sorong",
  "Surabaya",
  "Yogyakarta",
];

const DEFAULT_FILTERS = {
  policyNumber: "",
  invoice: "",
  issuedPeriod: "",
  product: "Semua Produk",
  participant: "",
  paymentStatus: "Semua Status",
  policyStatus: "Semua Status",
  branch: "Semua Cabang",
};

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

function FieldShell({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-bold text-[#0C2454]">{label}</span>
      {children}
    </label>
  );
}

function TextFilter({ value, onChange, placeholder, icon: Icon }) {
  return (
    <div className="flex h-10 items-center gap-2 rounded-lg border border-[#D7E0ED] bg-white px-3 shadow-[0_1px_2px_rgba(12,36,84,0.04)]">
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-full min-w-0 flex-1 border-0 bg-transparent text-[12px] font-medium text-[#0C2454] outline-none placeholder:text-[#6F7FA3]" />
      {Icon ? <Icon className="h-4 w-4 shrink-0 text-[#526488]" /> : null}
    </div>
  );
}

function SelectFilter({ value, onChange, options }) {
  return (
    <div className="relative">
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full appearance-none rounded-lg border border-[#D7E0ED] bg-white px-3 pr-9 text-[12px] font-semibold text-[#0C2454] outline-none shadow-[0_1px_2px_rgba(12,36,84,0.04)]">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0C4FB3]" />
    </div>
  );
}

function DateFilter({ value, onChange }) {
  return (
    <div className="relative">
      <input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-lg border border-[#D7E0ED] bg-white px-3 pr-10 text-[12px] font-semibold text-[#0C2454] outline-none shadow-[0_1px_2px_rgba(12,36,84,0.04)]" />
      <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#526488]" />
    </div>
  );
}

function StatusPill({ children, type }) {
  const tones = {
    paid: "border-emerald-100 bg-emerald-50 text-emerald-700",
    waiting: "border-amber-200 bg-amber-50 text-amber-700",
    expired: "border-rose-100 bg-rose-50 text-rose-700",
    issued: "border-emerald-100 bg-emerald-50 text-emerald-700",
    inactive: "border-slate-200 bg-slate-50 text-slate-600",
    canceled: "border-slate-200 bg-slate-100 text-slate-600",
  };
  return <span className={cls("inline-flex h-6 items-center rounded-md border px-3 text-[11px] font-bold", tones[type])}>{children}</span>;
}

function paymentTone(value) {
  if (value === "Lunas") return "paid";
  if (value === "Pembayaran Kedaluwarsa") return "expired";
  return "waiting";
}

function policyTone(value) {
  if (value === "Aktif") return "issued";
  if (value === "Belum Terbit") return "waiting";
  if (value === "Non Aktif") return "inactive";
  return "canceled";
}

function toDisplayDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function parseDisplayDate(value) {
  if (!value || value === "-") return null;
  const [day, month, year] = value.split("/");
  return new Date(`${year}-${month}-${day}T00:00:00`);
}

function getPolicyStatus(row) {
  if (row.paymentStatus === "Menunggu Pembayaran") return "Belum Terbit";
  if (row.paymentStatus === "Pembayaran Kedaluwarsa") return "Batal";
  const coverageEnd = parseDisplayDate(row.coverageEnd);
  return coverageEnd && coverageEnd >= TODAY ? "Aktif" : "Non Aktif";
}

const DETAIL_DATA = {
  "Life Guard": {
    ownerTitle: "Data Pembelian",
    ownerName: "Heru Winarno",
    email: "heru.winarno@asuransijasindo.co.id",
    phone: "0812-3456-7890",
    paidAt: "22 Mei 2026, 22:04",
    premium: "Rp 245.000",
    benefitsTitle: "Manfaat Pertanggungan",
    benefits: [["Meninggal Dunia", "Rp 50.000.000"], ["Cacat Tetap Total", "Rp 50.000.000"], ["Biaya Pengobatan", "Rp 5.000.000"]],
    participantColumns: ["No", "Nama Peserta", "No Identitas", "Tanggal Lahir", "Periode Pertanggungan", "Premi"],
    participants: [["1", "Heru Winarno", "3174XXXXXXXX0001", "12-08-1990", "01-06-2026 s/d 31-05-2027", "Rp 245.000"]],
  },
  "Edu Protect": {
    ownerTitle: "Data Pembelian",
    ownerName: "SDN 01 Menteng",
    email: "admin.sdn01@sekolah.id",
    phone: "0812-7788-9900",
    paidAt: "23 Mei 2026, 09:15",
    premium: "Rp 120.000",
    objectTitle: "Data Sekolah",
    object: [
      { label: "Nama Sekolah", value: "SDN 01 Menteng", icon: Landmark },
      { label: "Jenjang", value: "Sekolah Dasar", icon: GraduationCap },
      { label: "Alamat Sekolah", value: "Jl. HOS Cokroaminoto No. 12, Jakarta Pusat", icon: MapPin },
      { label: "Periode Polis", value: "01-07-2026 s/d 30-06-2027", icon: CalendarDays },
    ],
    benefitsTitle: "Manfaat Pertanggungan",
    benefits: [["Meninggal Dunia", "Rp 25.000.000"], ["Cacat Tetap", "Rp 25.000.000"], ["Biaya Pengobatan", "Rp 2.500.000"]],
    participantColumns: ["No", "Nama Siswa", "No Induk", "Tanggal Lahir", "Kelas", "Nama Orang Tua", "Premi"],
    participants: [["1", "Nabila Putri", "240178", "12-03-2015", "5A", "Andi Pratama", "Rp 60.000"], ["2", "Rizky Maulana", "240179", "21-09-2014", "6B", "Siti Rahma", "Rp 60.000"]],
  },
  "Trip Guard": {
    ownerTitle: "Data Pembelian",
    ownerName: "Budi Santoso",
    email: "budi.santoso@email.com",
    phone: "0813-7788-6611",
    paidAt: "24 Mei 2026, 13:40",
    premium: "Rp 156.000",
    objectTitle: "Rincian Perjalanan",
    object: [
      { label: "Jenis Perjalanan", value: "Domestik" },
      { label: "Tujuan", value: "Bali" },
      { label: "Tanggal Berangkat", value: "10-06-2026" },
      { label: "Tanggal Kembali", value: "15-06-2026" },
      { label: "Tujuan Perjalanan", value: "Liburan" },
      { label: "Plan", value: "Gold" },
    ],
    benefitsTitle: "Manfaat Perjalanan",
    benefits: [["Kecelakaan Diri", "Rp 100.000.000"], ["Biaya Medis Darurat", "Rp 10.000.000"], ["Kehilangan Bagasi", "Rp 5.000.000"], ["Keterlambatan Penerbangan", "Rp 1.000.000"]],
    participantColumns: ["No", "Nama Peserta", "No Identitas", "Tanggal Lahir", "Jenis Perjalanan", "Tanggal Perjalanan", "Asal", "Tujuan", "Premi"],
    participants: [["1", "Budi Santoso", "3174XXXXXXXX0002", "08-11-1991", "Domestik", "10-06-2026 s/d 15-06-2026", "Jakarta", "Bali", "Rp 156.000"]],
  },
  "Travel Safe": {
    ownerTitle: "Data Pembelian",
    ownerName: "Rina Amelia",
    email: "rina.amelia@email.com",
    phone: "0812-1122-3344",
    paidAt: "24 Mei 2026, 15:25",
    premium: "Rp 386.000",
    objectTitle: "Rincian Perjalanan",
    object: [
      { label: "Wilayah Pertanggungan", value: "Internasional", icon: Plane },
      { label: "Negara Tujuan", value: "Jepang" },
      { label: "Kota Tujuan", value: "Tokyo & Osaka", icon: MapPin },
      { label: "Tanggal Berangkat", value: "12-07-2026" },
      { label: "Tanggal Kembali", value: "20-07-2026" },
      { label: "Tujuan Perjalanan", value: "Wisata", icon: BriefcaseBusiness },
      { label: "Plan", value: "Platinum" },
    ],
    benefitsTitle: "Manfaat Pertanggungan",
    benefits: [["Kecelakaan Diri", "Rp 250.000.000"], ["Biaya Medis", "Rp 150.000.000"], ["Evakuasi Darurat", "Rp 500.000.000"], ["Kehilangan Bagasi", "Rp 10.000.000"], ["Pembatalan Perjalanan", "Rp 7.500.000"]],
    participantColumns: ["No", "Nama Peserta", "No Paspor", "Tanggal Lahir", "Asal", "Tujuan", "Periode Perjalanan", "Plan", "Premi"],
    participants: [["1", "Rina Amelia", "A1234567", "05-02-1988", "Jakarta", "Jepang", "12-07-2026 s/d 20-07-2026", "Platinum", "Rp 386.000"]],
  },
  "Asuransi Kebakaran": {
    ownerTitle: "Data Tertanggung",
    ownerName: "PT Maju Jaya Abadi",
    email: "finance@majujaya.co.id",
    phone: "021-88990011",
    paidAt: "25 Mei 2026, 10:12",
    premium: "Rp 1.850.000",
    objectTitle: "Objek Pertanggungan",
    object: [
      { label: "Lokasi Risiko", value: "Jl. Industri No. 45, Bekasi", icon: MapPin },
      { label: "Okupasi", value: "Ruko", icon: Building2 },
      { label: "Konstruksi", value: "Kelas 1" },
      { label: "Luas Bangunan", value: "250 m²" },
      { label: "Periode Polis", value: "01-06-2026 s/d 31-05-2027", icon: CalendarDays },
    ],
    splitTables: [
      { title: "Nilai Pertanggungan", columns: ["Komponen", "Nilai Pertanggungan"], rows: [["Bangunan", "Rp 2.000.000.000"], ["Isi Bangunan", "Rp 500.000.000"], ["Persediaan", "Rp 300.000.000"], ["Total", "Rp 2.800.000.000"]] },
      { title: "Jaminan & Klausula", columns: ["No", "Jaminan/Klausula", "Keterangan"], rows: [["1", "PSAKI", "Polis Standar Asuransi Kebakaran Indonesia"], ["2", "LMA 5393", "Infectious Disease Endorsement"], ["3", "Klausul Pembayaran Premi", "Wajib"], ["4", "TSFWD 4.3A", "Diperluas banjir, badai, dan kerusakan air."]] },
    ],
  },
  "Asuransi Property All Risk": {
    ownerTitle: "Data Tertanggung",
    ownerName: "PT Sinar Pertiwi",
    email: "insurance@sinarpertiwi.co.id",
    phone: "021-66778899",
    paidAt: "25 Mei 2026, 14:10",
    premium: "Rp 4.250.000",
    objectTitle: "Objek Pertanggungan",
    object: [
      { label: "Lokasi Risiko", value: "Jl. Gatot Subroto No. 99, Bandung", icon: MapPin },
      { label: "Okupasi", value: "Gudang", icon: Building2 },
      { label: "Konstruksi", value: "Kelas 2" },
      { label: "Luas Bangunan", value: "1.200 m²" },
      { label: "Periode Polis", value: "01-06-2026 s/d 31-05-2027", icon: CalendarDays },
    ],
    splitTables: [
      { title: "Nilai Pertanggungan", columns: ["Uraian", "Nilai Pertanggungan"], rows: [["Bangunan", "Rp 5.000.000.000"], ["Mesin & Peralatan", "Rp 1.200.000.000"], ["Persediaan", "Rp 800.000.000"], ["Total", "Rp 7.000.000.000"]] },
      { title: "Jaminan & Perluasan", columns: ["No", "Jaminan/Perluasan", "Keterangan"], rows: [["1", "Property All Risk", "Jaminan all risks sesuai wording"], ["2", "RSMDCC 4.1B/2007", "Kerusuhan, pemogokan, perbuatan jahat, huru-hara"], ["3", "TSFWD 4.3A", "Banjir, badai, topan, kerusakan air"], ["4", "Gempa Bumi", "Diperluas"], ["5", "Deductible", "Sesuai syarat polis"]] },
    ],
  },
  "Asuransi Gempa Bumi": {
    ownerTitle: "Data Tertanggung",
    ownerName: "PT Nusantara Sentosa",
    email: "admin@nusantarasentosa.co.id",
    phone: "021-77881234",
    paidAt: "25 Mei 2026, 11:28",
    premium: "Rp 575.000",
    objectTitle: "Objek Pertanggungan",
    object: [
      { label: "Lokasi Risiko", value: "Jl. Ahmad Yani No. 88, Padang" },
      { label: "Okupasi", value: "Perkantoran" },
      { label: "Konstruksi", value: "Kelas 1" },
      { label: "Zona Gempa", value: "Zona 5" },
      { label: "Periode Polis", value: "01-06-2026 s/d 31-05-2027" },
    ],
    benefitsTitle: "Ringkasan Risiko Gempa",
    benefits: [["Nilai Pertanggungan", "Rp 1.500.000.000"], ["Deductible", "2,5% dari nilai kerugian"], ["Jenis Polis", "PSAGBI"], ["Perluasan", "Gempa bumi, letusan gunung api, tsunami"]],
    participantColumns: ["No", "Jenis Harta Benda", "Nilai Pertanggungan", "Keterangan"],
    participants: [["1", "Bangunan", "Rp 1.000.000.000", "Gedung kantor 2 lantai"], ["2", "Isi Bangunan", "Rp 500.000.000", "Peralatan kantor dan inventaris"]],
  },
  "Asuransi Mobil TLO": {
    ownerTitle: "Data Pemegang Polis",
    ownerName: "Dewi Lestari",
    email: "dewi.lestari@email.com",
    phone: "0812-9988-7766",
    paidAt: "26 Mei 2026, 09:50",
    premium: "Rp 2.950.000",
    objectTitle: "Data Kendaraan",
    object: [
      { label: "No Polisi", value: "B 1234 KDI" },
      { label: "Merk / Model", value: "Toyota Avanza 1.5 G", icon: Car },
      { label: "Tahun Kendaraan", value: "2023" },
      { label: "Nomor Rangka", value: "MHFKM1234PKO00601" },
      { label: "Nomor Mesin", value: "1NRF123456" },
      { label: "Wilayah", value: "DKI Jakarta" },
      { label: "Penggunaan", value: "Pribadi" },
    ],
    benefitsTitle: "Ringkasan Pertanggungan",
    benefits: [["Nilai Pertanggungan", "Rp 185.000.000"], ["Jenis Pertanggungan", "Total Loss Only"], ["Periode Polis", "01-06-2026 s/d 31-05-2027"], ["Kategori Tarif", "Wilayah 2"], ["Deductible", "5% dari TSI"]],
    participantColumns: ["No", "Perluasan", "Nilai", "Keterangan"],
    participants: [["1", "TPL", "Rp 10.000.000", "Tanggung jawab pihak ketiga"], ["2", "Banjir", "Ya", "Perluasan aktif"], ["3", "Gempa Bumi", "Ya", "Perluasan aktif"], ["4", "Kecelakaan Diri Pengemudi", "Rp 10.000.000", "Aktif"], ["5", "Kecelakaan Diri Penumpang", "Rp 20.000.000", "Aktif"]],
  },
  "Asuransi Sepeda Motor TLO": {
    ownerTitle: "Data Pemegang Polis",
    ownerName: "Ahmad Fadli",
    email: "ahmad.fadli@email.com",
    phone: "0813-2233-4455",
    paidAt: "26 Mei 2026, 10:18",
    premium: "Rp 425.000",
    objectTitle: "Data Kendaraan",
    object: [
      { label: "No Polisi", value: "B 4321 ZXR" },
      { label: "Merk / Model", value: "Honda Vario 160", icon: Bike },
      { label: "Tahun Kendaraan", value: "2024" },
      { label: "Nomor Rangka", value: "MH1K60AXPK00605" },
      { label: "Nomor Mesin", value: "K60A-1234567" },
      { label: "Wilayah", value: "DKI Jakarta" },
      { label: "Penggunaan", value: "Pribadi" },
    ],
    benefitsTitle: "Ringkasan Pertanggungan",
    benefits: [["Nilai Pertanggungan", "Rp 28.000.000"], ["Jenis Pertanggungan", "Total Loss Only"], ["Periode Polis", "01-06-2026 s/d 31-05-2027"], ["Kategori Tarif", "Wilayah 2"], ["Deductible", "10% dari TSI"]],
    participantColumns: ["No", "Perluasan", "Nilai", "Keterangan"],
    participants: [["1", "Banjir", "Ya", "Perluasan aktif"], ["2", "Gempa Bumi", "Ya", "Perluasan aktif"], ["3", "Huru-Hara / Kerusuhan", "Ya", "Perluasan aktif"], ["4", "Kecelakaan Diri Pengendara", "Rp 5.000.000", "Aktif"]],
  },
};

function DetailCard({ title, children, className }) {
  return <section className={cls("rounded-lg border border-[#DCE5F2] bg-white p-5 shadow-[0_8px_22px_rgba(12,36,84,0.05)]", className)}>{title ? <h2 className="mb-4 text-[18px] font-bold text-[#061B49]">{title}</h2> : null}{children}</section>;
}

function DetailInfo({ icon: Icon, label, value, badge }) {
  return (
    <div className="flex min-w-0 items-center gap-4">
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[#EEF5FF] text-[#005FD7]">
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-[#65759B]">{label}</div>
        <div className="mt-1 truncate text-[15px] font-bold text-[#061B49]">{badge ? <StatusPill type="issued">{value}</StatusPill> : value}</div>
      </div>
    </div>
  );
}

function ObjectInfo({ item }) {
  const Icon = item.icon || FileText;
  return (
    <div className="flex min-w-0 items-center gap-3 border-[#DCE5F2] md:border-r md:pr-5 last:border-r-0">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#EEF5FF] text-[#005FD7]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[12px] text-[#65759B]">{item.label}</div>
        <div className="mt-1 truncate text-[13px] font-bold text-[#061B49]">{item.value}</div>
      </div>
    </div>
  );
}

function SimpleTable({ title, columns, rows }) {
  return (
    <DetailCard title={title}>
      <div className="overflow-auto">
        <table className="w-full min-w-[620px] text-left text-[13px]">
          <thead className="border-b border-[#DCE5F2] text-[#65759B]">
            <tr>{columns.map((column) => <th key={column} className="px-3 py-2 font-semibold">{column}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-[#E6EDF7]">
            {rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={`${index}-${cellIndex}`} className="px-3 py-2 font-semibold text-[#0C2454]">{cell}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
    </DetailCard>
  );
}

function DetailView({ row, onBack }) {
  const detail = DETAIL_DATA[row.product] || DETAIL_DATA["Life Guard"];
  return (
    <div className="space-y-5 bg-[#F7FAFE] px-1 pb-4 text-[#0C2454] md:-mx-[22px] md:-my-5 md:px-8 md:py-6">
      <div className="flex items-center gap-2 border-b border-[#DCE5F2] pb-4 text-[13px] font-semibold text-[#0C2454]">
        <span>Transaksi</span><span className="text-[#A7B3C8]">›</span><span>Polis {row.product}</span><span className="text-[#A7B3C8]">›</span><span className="text-[#0057C8]">Detail</span>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-tight text-[#061B49]">Detail Polis {row.product}</h1>
          <p className="mt-1 text-[14px] leading-6 text-[#65759B]">Informasi lengkap transaksi dan data {row.product.includes("Asuransi") ? "objek pertanggungan" : "peserta"} polis {row.product}.</p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onBack} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#D7E0ED] bg-white px-6 text-[14px] font-bold text-[#0C2454] hover:bg-[#F3F8FF]"><ArrowLeft className="h-4 w-4" />Kembali</button>
          <button type="button" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#005FD7] px-6 text-[14px] font-bold text-white shadow-[0_8px_18px_rgba(0,95,215,0.24)] hover:bg-[#0052BA]"><Download className="h-4 w-4" />Download Polis</button>
        </div>
      </div>
      <DetailCard>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="grid gap-6 border-[#DCE5F2] lg:border-r lg:pr-8"><DetailInfo icon={ShieldCheck} label="Nomor Polis" value={row.policyNumber} /><DetailInfo icon={CalendarDays} label="Tanggal Dibayarkan" value={detail.paidAt} /></div>
          <div className="grid gap-6 border-[#DCE5F2] lg:border-r lg:pr-8"><DetailInfo icon={FileText} label="Invoice" value={row.invoice} /><DetailInfo icon={Wallet} label="Total Premi Dibayarkan" value={detail.premium || row.premium} /></div>
          <div className="grid gap-6"><DetailInfo icon={Tag} label="Tipe Polis" value={row.product} badge /><DetailInfo icon={CheckCircle2} label="Status Pembayaran" value={row.paymentStatus} badge /></div>
        </div>
      </DetailCard>
      <DetailCard title={detail.ownerTitle}>
        <div className="grid gap-5 md:grid-cols-3">
          <DetailInfo icon={User} label="Nama Tertanggung" value={detail.ownerName} />
          <DetailInfo icon={Mail} label="Email" value={detail.email} />
          <DetailInfo icon={Phone} label="No Handphone" value={detail.phone} />
        </div>
      </DetailCard>
      {detail.object ? <DetailCard title={detail.objectTitle}><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{detail.object.map((item) => <ObjectInfo key={`${item.label}-${item.value}`} item={item} />)}</div></DetailCard> : null}
      {detail.benefits ? <SimpleTable title={detail.benefitsTitle} columns={["Manfaat", "Nilai Pertanggungan"]} rows={detail.benefits} /> : null}
      {detail.splitTables ? <div className="grid gap-5 xl:grid-cols-2">{detail.splitTables.map((table) => <SimpleTable key={table.title} {...table} />)}</div> : null}
      {detail.participants ? <SimpleTable title={row.product.includes("Mobil") || row.product.includes("Motor") ? "Perluasan Jaminan" : row.product.includes("Gempa") ? "Rincian Objek" : "Data Peserta"} columns={detail.participantColumns} rows={detail.participants} /> : null}
    </div>
  );
}

export default function TransactionsMenu() {
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const productOptions = ["Semua Produk", ...Array.from(new Set(POLICY_ROWS.map((row) => row.product)))];
  const paymentOptions = ["Semua Status", ...Array.from(new Set(POLICY_ROWS.map((row) => row.paymentStatus)))];
  const policyOptions = ["Semua Status", ...Array.from(new Set(POLICY_ROWS.map((row) => row.policyStatus)))];
  const branchOptions = ["Semua Cabang", ...JASINDO_BRANCHES];

  const filteredRows = useMemo(() => {
    const policyNumber = appliedFilters.policyNumber.trim().toLowerCase();
    const invoice = appliedFilters.invoice.trim().toLowerCase();
    const participant = appliedFilters.participant.trim().toLowerCase();
    const issuedAt = toDisplayDate(appliedFilters.issuedPeriod);
    return POLICY_ROWS.filter((row) => {
      const policyMatch = !policyNumber || row.policyNumber.toLowerCase().includes(policyNumber);
      const invoiceMatch = !invoice || row.invoice.toLowerCase().includes(invoice);
      const participantMatch = !participant || row.participant.toLowerCase().includes(participant);
      const issuedMatch = !issuedAt || row.issuedAt === issuedAt;
      const productMatch = appliedFilters.product === "Semua Produk" || row.product === appliedFilters.product;
      const paymentMatch = appliedFilters.paymentStatus === "Semua Status" || row.paymentStatus === appliedFilters.paymentStatus;
      const statusMatch = appliedFilters.policyStatus === "Semua Status" || row.policyStatus === appliedFilters.policyStatus;
      const branchMatch = appliedFilters.branch === "Semua Cabang" || row.branch === appliedFilters.branch;
      return policyMatch && invoiceMatch && participantMatch && issuedMatch && productMatch && paymentMatch && statusMatch && branchMatch;
    });
  }, [appliedFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const visibleRows = filteredRows.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  function updateFilter(key, value) {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  }

  function applyFilters() {
    setAppliedFilters(draftFilters);
    setPage(1);
  }

  function resetFilters() {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setPage(1);
  }

  if (selectedPolicy) return <DetailView row={selectedPolicy} onBack={() => setSelectedPolicy(null)} />;

  return (
    <div className="space-y-5 bg-[#F7FAFE] px-1 pb-4 text-[#0C2454] md:-mx-[22px] md:-my-5 md:px-8 md:py-6">
      <div className="flex items-center gap-2 text-[13px] font-semibold text-[#6F7FA3]">
        <span>Transaksi</span>
        <span className="text-[#A7B3C8]">›</span>
        <span className="text-[#0057C8]">Polis</span>
      </div>

      <div>
        <h1 className="text-[26px] font-bold leading-tight text-[#061B49]">Transaksi Polis</h1>
        <p className="mt-1 text-[14px] leading-6 text-[#65759B]">Daftar polis yang telah diterbitkan dan riwayat transaksinya.</p>
      </div>

      <section className="rounded-lg border border-[#DCE5F2] bg-white p-5 shadow-[0_10px_28px_rgba(12,36,84,0.06)]">
        <div className="grid gap-5 lg:grid-cols-4">
          <FieldShell label="No Polis">
            <TextFilter value={draftFilters.policyNumber} onChange={(value) => updateFilter("policyNumber", value)} placeholder="Contoh: 204.705.100.26.00008/555/000" />
          </FieldShell>
          <FieldShell label="No Invoice">
            <TextFilter value={draftFilters.invoice} onChange={(value) => updateFilter("invoice", value)} placeholder="Contoh: INV-2026-000123" />
          </FieldShell>
          <FieldShell label="Periode Terbit">
            <DateFilter value={draftFilters.issuedPeriod} onChange={(value) => updateFilter("issuedPeriod", value)} />
          </FieldShell>
          <FieldShell label="Produk">
            <SelectFilter value={draftFilters.product} onChange={(value) => updateFilter("product", value)} options={productOptions} />
          </FieldShell>
          <FieldShell label="Nama Peserta">
            <TextFilter value={draftFilters.participant} onChange={(value) => updateFilter("participant", value)} placeholder="Cari nama peserta" icon={Search} />
          </FieldShell>
          <FieldShell label="Status Pembayaran">
            <SelectFilter value={draftFilters.paymentStatus} onChange={(value) => updateFilter("paymentStatus", value)} options={paymentOptions} />
          </FieldShell>
          <FieldShell label="Status Polis">
            <SelectFilter value={draftFilters.policyStatus} onChange={(value) => updateFilter("policyStatus", value)} options={policyOptions} />
          </FieldShell>
          <FieldShell label="Cabang">
            <SelectFilter value={draftFilters.branch} onChange={(value) => updateFilter("branch", value)} options={branchOptions} />
          </FieldShell>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={resetFilters} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#0B69D8] bg-white px-5 text-[13px] font-bold text-[#0B69D8] hover:bg-[#F3F8FF]">
            <RotateCcw className="h-4 w-4" />
            Reset Filter
          </button>
          <button type="button" onClick={applyFilters} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#005FD7] px-6 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(0,95,215,0.24)] hover:bg-[#0052BA]">
            <Search className="h-4 w-4" />
            Terapkan Filter
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-[#DCE5F2] bg-white shadow-[0_10px_28px_rgba(12,36,84,0.06)]">
        <div className="overflow-auto">
          <table className="w-full min-w-[1180px] text-left text-[12px]">
            <thead className="border-b border-[#DCE5F2] bg-[#F8FBFF] text-[11px] font-bold text-[#0C2454]">
              <tr>
                <th className="px-5 py-3">No. Polis</th>
                <th className="px-5 py-3">No. Invoice</th>
                <th className="px-5 py-3">Nama Peserta</th>
                <th className="px-5 py-3">Produk</th>
                <th className="px-5 py-3">Cabang</th>
                <th className="px-5 py-3">Total Premi</th>
                <th className="px-5 py-3">Status Pembayaran</th>
                <th className="px-5 py-3">Status Polis</th>
                <th className="px-5 py-3">Tgl Terbit</th>
                <th className="px-5 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6EDF7]">
              {visibleRows.map((row) => (
                <tr key={row.invoice} className="hover:bg-[#F8FBFF]">
                  <td className="whitespace-nowrap px-5 py-3 font-semibold text-[#0C2454]">{row.policyNumber}</td>
                  <td className="whitespace-nowrap px-5 py-3 font-semibold text-[#0C2454]">{row.invoice}</td>
                  <td className="whitespace-nowrap px-5 py-3 font-semibold text-[#0C2454]">{row.participant}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-[#0C2454]">{row.product}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-[#0C2454]">{row.branch}</td>
                  <td className="whitespace-nowrap px-5 py-3 font-semibold text-[#0C2454]">{row.premium}</td>
                  <td className="whitespace-nowrap px-5 py-3"><StatusPill type={paymentTone(row.paymentStatus)}>{row.paymentStatus}</StatusPill></td>
                  <td className="whitespace-nowrap px-5 py-3"><StatusPill type={policyTone(row.policyStatus)}>{row.policyStatus}</StatusPill></td>
                  <td className="whitespace-nowrap px-5 py-3 text-[#0C2454]">{row.issuedAt}</td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <button type="button" onClick={() => setSelectedPolicy(row)} className="inline-flex h-8 items-center justify-center rounded-md border border-[#0B69D8] bg-white px-4 text-[12px] font-bold text-[#0B69D8] hover:bg-[#F3F8FF]">Detail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleRows.length ? null : <div className="px-5 py-10 text-center text-[13px] font-semibold text-[#65759B]">Tidak ada polis yang sesuai filter.</div>}
        </div>

        <div className="flex flex-col gap-3 border-t border-[#E6EDF7] px-5 py-3 text-[12px] text-[#65759B] lg:flex-row lg:items-center lg:justify-between">
          <div>Menampilkan {visibleRows.length ? (page - 1) * rowsPerPage + 1 : 0} - {Math.min(page * rowsPerPage, filteredRows.length)} dari {filteredRows.length || 0} data</div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-[#0C2454]">Rows per page</span>
            <SelectFilter value={String(rowsPerPage)} onChange={(value) => { setRowsPerPage(Number(value)); setPage(1); }} options={ROWS_PER_PAGE_OPTIONS.map(String)} />
            <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} className="grid h-8 w-8 place-items-center rounded-md border border-[#DCE5F2] bg-white text-[#65759B]" aria-label="Halaman sebelumnya">‹</button>
            {[1, 2, 3, 4, 5].map((item) => (
              <button key={item} type="button" onClick={() => setPage(Math.min(item, totalPages))} className={cls("grid h-8 w-8 place-items-center rounded-md text-[12px] font-bold", page === item ? "bg-[#005FD7] text-white" : "bg-white text-[#0C2454] hover:bg-[#F3F8FF]")}>{item}</button>
            ))}
            <span className="px-1 text-[#65759B]">...</span>
            <span className="font-bold text-[#0C2454]">125</span>
            <button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="grid h-8 w-8 place-items-center rounded-md border border-[#DCE5F2] bg-white text-[#65759B]" aria-label="Halaman berikutnya">›</button>
          </div>
        </div>
      </section>
    </div>
  );
}
