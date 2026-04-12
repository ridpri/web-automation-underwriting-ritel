import React, { useEffect, useMemo, useRef, useState } from "react";
import { createEmptyDocumentCheck, createLocationEvidence, createPhotoEvidence, createTransactionAuthority, summarizeFraudSignals } from "./platform/securityControls.js";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Camera,
  CameraOff,
  CheckCircle2,
  ChevronDown,
  Copy,
  FileText,
  Flame,
  Home,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  QrCode,
  Search,
  Shield,
  Sparkles,
  Trash2,
  User,
  Wallet,
  Waves,
  X,
  Car,
} from "lucide-react";
import { canProceedToPaymentFromOperating, paymentBlockMessage } from "./operatingLayer.js";
import { getPropertyExtensions, getPropertyVariant } from "./propertyProductConfig.js";

const PROPERTY_TYPES = ["Rumah Tinggal", "Ruko", "Toko", "Kantor", "Kos-kosan"];
const CONSTRUCTION_CLASSES = ["Kelas 1", "Kelas 2", "Kelas 3"];
const OBJECT_TYPES = ["Bangunan", "Inventaris / Isi", "Stok", "Mesin / Peralatan"];
const CUSTOMER_TYPES = ["Nasabah Perorangan", "Badan Usaha"];
const OWNERSHIP_TYPES = ["Milik Sendiri", "Sewa", "Kontrak", "Lainnya"];
const PROTECTION_OPTIONS = ["Tidak Ada", "APAR", "Hydrant", "Sprinkler", "APAR + Hydrant", "Lengkap"];
const CLAIM_HISTORY_OPTIONS = ["Tidak Ada", "Ada 1 Klaim", "Ada Lebih dari 1 Klaim"];
const PAYMENT_OPTIONS = ["Virtual Account", "Kartu Kredit", "Transfer Bank"];
const ICON_MAP = { shield: Shield, waves: Waves, sparkles: Sparkles };
const REJECT_REASONS = [
  "Premi belum sesuai anggaran",
  "Data objek belum final",
  "Masih membandingkan dengan penawaran lain",
  "Belum jadi membeli asuransi",
  "Alasan lainnya",
];

const MOCK_CIF = [
  { name: "Sony Laksono", cif: "64YU5", type: "Nasabah Perorangan", phone: "081298765432", email: "sony.laksono@email.com" },
  { name: "Siti Rahma", cif: "84PL2", type: "Nasabah Perorangan", phone: "081355667788", email: "siti.rahma@email.com" },
  { name: "PT Maju Sentosa", cif: "55BX9", type: "Badan Usaha", phone: "02150990088", email: "admin@majusentosa.co.id" },
];

const MOCK_SENT_OFFERS = [
  { id: "OFR-001", name: "Sony Laksono", product: "Property Safe", status: "Dibuka, menunggu jawaban" },
  { id: "OFR-002", name: "PT Maju Sentosa", product: "Property Safe", status: "Sudah jawab, minta revisi" },
  { id: "OFR-003", name: "Siti Rahma", product: "Property Safe", status: "Sudah setuju, menunggu bayar" },
];

const CONSTRUCTION_GUIDE = [
  {
    title: "Kelas 1",
    desc: "Dinding, lantai, struktur penunjang, dan penutup atap seluruhnya dari bahan tidak mudah terbakar.",
  },
  {
    title: "Kelas 2",
    desc: "Seperti Kelas 1, tetapi penutup atap boleh dari sirap kayu keras, dinding berbahan mudah terbakar maksimal 20%, dan lantai atau struktur penunjang boleh dari kayu.",
  },
  {
    title: "Kelas 3",
    desc: "Semua bangunan selain Kelas 1 dan Kelas 2.",
  },
];

const OCCUPANCY_MAP = {
  "Rumah Tinggal": ["Hunian", "Kantor", "Ritel / Toko", "Warung / Kelontong"],
  Ruko: ["Hunian", "Ritel / Toko", "Kantor", "Warung / Kelontong", "Kos-kosan"],
  Toko: ["Ritel / Toko", "Warung / Kelontong", "Minimarket", "Kantor"],
  Kantor: ["Kantor", "Ritel / Toko", "Hunian"],
  "Kos-kosan": ["Hunian", "Kos-kosan", "Kantor"],
};

const PERSONAL_PRODUCTS = [
  {
    title: "Life Guard",
    category: "Kecelakaan Diri",
    subtitle: "Perlindungan aktivitas harian terhadap risiko kecelakaan.",
    image: "https://images.unsplash.com/photo-1516575150278-77136aed6920?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Trip Guard",
    category: "Kecelakaan Diri",
    subtitle: "Perlindungan perjalanan dan mobilitas pribadi.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Edu Protect",
    category: "Kecelakaan Diri",
    subtitle: "Perlindungan aktivitas pendidikan dan pembelajaran.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Travel Safe",
    category: "Perjalanan",
    subtitle: "Perlindungan perjalanan domestik dan internasional.",
    image: "https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=900&q=80",
  },
];

const PROPERTY_PRODUCTS = [
  {
    title: "Property Safe",
    category: "Harta Benda",
    subtitle: "Perlindungan bangunan dan isi properti.",
    image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80",
    active: true,
    variantKey: "property-safe",
  },
  {
    title: "Property All Risk",
    category: "Harta Benda",
    subtitle: "Perlindungan all risk untuk bangunan dan isi properti.",
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
    active: true,
    variantKey: "property-all-risk",
  },
];

const VEHICLE_PRODUCTS = [
  {
    title: "Asuransi Motor TLO",
    category: "Kendaraan Bermotor",
    subtitle: "Simulasi produk akan ditambahkan berikutnya.",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Asuransi Mobil TLO",
    category: "Kendaraan Bermotor",
    subtitle: "Simulasi produk akan ditambahkan berikutnya.",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Asuransi Mobil Komprehensif",
    category: "Kendaraan Bermotor",
    subtitle: "Simulasi produk akan ditambahkan berikutnya.",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80",
  },
];


const CONSENT_SECTIONS = [
  {
    key: "produk",
    title: "Pemahaman Produk",
    summary: "Tertanggung menyatakan telah menerima penjelasan, membaca, dan memahami informasi produk asuransi.",
    detail: "Menyatakan telah menerima penjelasan, membaca, dan memahami informasi produk asuransi PT Asuransi Jasa Indonesia atau Penanggung ini.",
  },
  {
    key: "data",
    title: "Pemrosesan Data Pribadi",
    summary: "Tertanggung memberi izin pemrosesan data pribadi untuk penerbitan polis, pelayanan klaim, dan peningkatan layanan.",
    detail: "Memberikan izin kepada Penanggung untuk melakukan pemrosesan Informasi atau Data yang tercantum dalam SPAU ini dan mengungkapkan Informasi atau Data Pribadi kepada afiliasi Penanggung dan atau pihak ketiga yang ditunjuk oleh Penanggung sehubungan dengan pengajuan polis asuransi ini, pelayanan klaim, peningkatan layanan konsumen, dan atau pelaksanaan ketentuan polis asuransi sesuai kebijakan internal Penanggung maupun peraturan perundang-undangan yang berlaku.",
  },
  {
    key: "material",
    title: "Kebenaran Fakta Material",
    summary: "Seluruh keterangan yang diberikan harus benar dan menjadi dasar penerbitan polis.",
    detail: "Menyatakan bahwa seluruh informasi atau keterangan yang dicantumkan dalam SPAU ini dibuat dengan jujur dan sesuai keadaan sebenarnya menurut pengetahuan Kami atau Saya atau yang seharusnya Kami atau Saya ketahui, SPAU ini menjadi dasar dan bagian yang tidak terpisahkan dari polis asuransi yang akan diterbitkan, dan ketidakbenarannya dapat mengakibatkan ditolaknya klaim yang diajukan.",
  },
];

function cls() {
  return Array.from(arguments).filter(Boolean).join(" ");
}

function onlyDigits(value) {
  let result = "";
  const source = String(value || "");
  for (let i = 0; i < source.length; i += 1) {
    const code = source.charCodeAt(i);
    if (code >= 48 && code <= 57) result += source[i];
  }
  return result;
}

function isDigitsOnly(value) {
  const source = String(value || "").trim();
  if (!source) return false;
  return onlyDigits(source) === source;
}

function formatNumber(value) {
  const digits = onlyDigits(value);
  if (!digits) return "";
  return new Intl.NumberFormat("id-ID").format(Number(digits));
}

function parseNumber(value) {
  return Number(String(value || "").split(".").join("") || "0");
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID").format(value || 0);
}

function addDaysToDate(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDisplayDate(date) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

function formatDisplayDateTime(date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function endOfDay(date) {
  const next = new Date(date);
  next.setHours(23, 59, 0, 0);
  return next;
}

function resolveOfferValidity(isIndicative, coverageStart) {
  const now = new Date();
  if (isIndicative) return { expiresAt: endOfDay(addDaysToDate(now, 14)), expired: false };
  const sevenDaysLimit = endOfDay(addDaysToDate(now, 7));
  if (!coverageStart) return { expiresAt: sevenDaysLimit, expired: false };
  const startDate = new Date(`${coverageStart}T00:00:00`);
  if (Number.isNaN(startDate.getTime())) return { expiresAt: sevenDaysLimit, expired: false };
  const coverageLimit = endOfDay(addDaysToDate(startDate, -1));
  const expiresAt = coverageLimit.getTime() < sevenDaysLimit.getTime() ? coverageLimit : sevenDaysLimit;
  return { expiresAt, expired: expiresAt.getTime() < now.getTime() };
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function isValidPhone(value) {
  const digits = onlyDigits(value);
  return digits.length >= 10 && digits.length <= 15;
}

function isValidIdNumber(customerType, value) {
  const digits = onlyDigits(value);
  if (customerType === "Badan Usaha") return digits.length >= 15;
  return digits.length === 16;
}

function hasRequiredUploads(uploads) {
  return Boolean(uploads.frontView && uploads.sideRightView && uploads.sideLeftView);
}

function getShareUrl(view) {
  if (typeof window === "undefined") return "about:blank";
  const url = new URL(window.location.href);
  url.searchParams.set("view", view || "offer-indicative");
  return url.toString();
}

function openShareWindow(targetUrl) {
  if (typeof window === "undefined") return;
  window.open(targetUrl, "_blank", "noopener,noreferrer");
}

function readImageFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.readAsDataURL(file);
  });
}

function shortObjectLabel(type) {
  if (type === "Bangunan") return "Contoh: rumah tinggal 2 lantai";
  if (type === "Inventaris / Isi") return "Contoh: perabot rumah dan elektronik utama";
  if (type === "Stok") return "Contoh: stok barang dagangan sembako";
  if (type === "Mesin / Peralatan") return "Contoh: mesin kasir dan freezer";
  return "Tambahkan keterangan objek";
}

function requiresObjectNote(type) {
  return type === "Stok";
}

function isFloorRelevant(propertyType, occupancy) {
  if (propertyType === "Rumah Tinggal" || propertyType === "Kos-kosan") return false;
  if (occupancy === "Warung / Kelontong") return false;
  return propertyType === "Ruko" || propertyType === "Toko" || propertyType === "Kantor";
}

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function calculateCoverageEnd(startDate) {
  if (!startDate) return "";
  const date = new Date(startDate + "T00:00:00");
  if (Number.isNaN(date.getTime())) return "";
  date.setFullYear(date.getFullYear() + 1);
  date.setDate(date.getDate() - 1);
  return formatDateInput(date);
}

function SectionCard({ title, subtitle, children, action }) {
  return (
    <section className="rounded-2xl border border-[#D8E1EA] bg-white p-4 shadow-sm md:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[18px] font-bold text-slate-900">{title}</div>
          {subtitle ? <div className="mt-1 text-sm text-slate-500">{subtitle}</div> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function FieldLabel({ label, required, helpText }) {
  return (
    <div className="mb-1.5 flex items-center gap-2">
      <label className="text-[13px] font-semibold text-slate-800">
        {label}
        {required ? <span className="text-[#E66A1E]"> *</span> : null}
      </label>
      {helpText ? <span className="text-[11px] font-medium text-slate-500">{helpText}</span> : null}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, icon, type = "text", readOnly = false, disabled = false }) {
  return (
    <div className="relative">
      {icon ? <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div> : null}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        className={cls(
          "h-[44px] w-full rounded-[10px] border border-[#D5DDE6] bg-white px-3.5 text-[14px] text-slate-800 outline-none transition placeholder:text-slate-500",
          "focus:border-[#0A4D82] focus:ring-4 focus:ring-[#0A4D82]/10",
          (readOnly || disabled) && "cursor-not-allowed bg-slate-50 text-slate-500",
          icon && "pl-10"
        )}
      />
    </div>
  );
}

function TextAreaInput({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-[10px] border border-[#D5DDE6] bg-white px-3.5 py-3 text-[14px] text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-[#0A4D82] focus:ring-4 focus:ring-[#0A4D82]/10"
    />
  );
}

function SelectInput({ value, onChange, options, placeholder = "Pilih opsi yang sesuai" }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cls(
          "h-[44px] w-full appearance-none rounded-[10px] border border-[#D5DDE6] bg-white px-3.5 pr-10 text-[14px] outline-none transition focus:border-[#0A4D82] focus:ring-4 focus:ring-[#0A4D82]/10",
          value ? "text-slate-800" : "text-slate-500"
        )}
      >
        <option value="" disabled hidden>{placeholder}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function CurrencyInput({ value, onChange, placeholder = "" }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">Rp</span>
      <input
        value={value}
        onChange={(event) => onChange(formatNumber(event.target.value))}
        inputMode="numeric"
        placeholder={placeholder}
        className="h-[44px] w-full rounded-[10px] border border-[#D5DDE6] bg-white pl-10 pr-3.5 text-[14px] text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-[#0A4D82] focus:ring-4 focus:ring-[#0A4D82]/10"
      />
    </div>
  );
}

function StepNode({ step, title, subtitle, active, done, icon }) {
  return (
    <div className="relative flex flex-1 flex-col items-center text-center">
      <div className={cls("flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white", done ? "border-green-600 text-green-600" : active ? "border-[#0A4D82] text-[#0A4D82]" : "border-slate-300 text-slate-300")}>{done ? <CheckCircle2 className="h-4 w-4" /> : icon}</div>
      <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{step}</div>
      <div className={cls("mt-0.5 text-[14px] font-bold", active || done ? "text-slate-900" : "text-slate-500")}>{title}</div>
      <div className={cls("mt-0.5 text-[12px]", active ? "text-[#E8A436]" : done ? "text-green-600" : "text-slate-400")}>{subtitle}</div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1 text-[13px] leading-[1.35]">
      <div className="min-w-0 flex-1 pr-2 text-white/68">{label}</div>
      <div className="max-w-[50%] break-words text-right font-semibold leading-[1.35] text-white/92">{value}</div>
    </div>
  );
}

function SummarySidebarShell({ title = "Ringkasan", children }) {
  return (
    <aside className="h-fit rounded-2xl bg-[#0A4D82] p-4 text-white shadow-lg lg:sticky lg:top-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[14px] font-bold">
          <FileText className="h-4 w-4" />
          {title}
        </div>
        <ChevronDown className="h-4 w-4 text-white/80" />
      </div>
      <div className="mt-3 space-y-3">{children}</div>
    </aside>
  );
}

function SummarySidebarAlert({ items, successText }) {
  if (items.length) {
    return (
      <div className="rounded-xl border border-[#F0D8A8] bg-[#FFF7E8] p-3 text-[12px] leading-[1.45] text-[#8A6830]">
        <div className="font-semibold text-[#8A6830]">Yang masih perlu dilengkapi</div>
        <div className="mt-1.5 space-y-1.5">
          {items.map((item) => (
            <div key={item} className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C1892E]" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-[12px] leading-[1.45] text-green-800">{successText}</div>;
}

function ProposalRow({ label, value, strong = false }) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-slate-100 py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className={cls("max-w-full break-words text-left text-sm text-slate-900 sm:max-w-[60%] sm:text-right", strong && "font-semibold")}>{value || "-"}</div>
    </div>
  );
}

function deductibleIsDirectText(value) {
  return String(value || "").trim().toLowerCase().startsWith("tidak dikenakan risiko sendiri");
}

function ProposalAccordion({ title, subtitle, open, onToggle, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#D8E1EA] bg-white">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50/80">
        <div>
          <div className="text-[15px] font-semibold text-slate-900">{title}</div>
          {subtitle ? <div className="mt-1 text-sm text-slate-500">{subtitle}</div> : null}
        </div>
        <ChevronDown className={cls("h-4 w-4 shrink-0 text-slate-500 transition", open && "rotate-180")} />
      </button>
      {open ? <div className="border-t border-slate-100 px-5 py-4">{children}</div> : null}
    </div>
  );
}

function ProposalBadge({ children, tone = "blue" }) {
  const toneClass =
    tone === "amber"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : tone === "green"
        ? "bg-green-50 text-green-700 ring-green-200"
        : "bg-[#F1F7FD] text-[#0A4D82] ring-[#CFE0F0]";
  return <div className={cls("inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1", toneClass)}>{children}</div>;
}

function ProductCard({ item, onClick }) {
  return (
    <button type="button" onClick={onClick} className="group relative h-[260px] overflow-hidden rounded-xl text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg disabled:cursor-not-allowed">
      <img src={item.image} alt={item.title} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute left-3 top-3 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">{item.category}</div>
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <div className="text-[26px] font-bold leading-none">{item.title}</div>
        <div className="mt-1.5 text-sm text-white/85">{item.subtitle}</div>
      </div>
    </button>
  );
}

function VehicleCard({ item }) {
  return <ProductCard item={item} onClick={() => {}} />;
}

function UserMenu({ open, items }) {
  if (!open) return null;
  return (
    <div className="absolute right-0 top-full z-40 mt-2 w-[220px] rounded-[14px] border border-[#D9E1EA] bg-white p-2 shadow-[0_20px_45px_rgba(15,23,42,0.16)]">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          className={cls(
            "flex w-full items-center justify-center rounded-[10px] px-3 py-3 text-center text-sm font-semibold hover:bg-[#F7FAFD]",
            item.primary ? "text-[#0A4D82]" : "text-slate-700",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function SentOffersModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <div className="text-[20px] font-bold text-slate-900">Riwayat Penawaran Terkirim</div>
            <div className="mt-1 text-sm text-slate-500">Simulasi daftar penawaran yang pernah dikirim ke calon tertanggung.</div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3 p-5">
          {MOCK_SENT_OFFERS.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 bg-[#F8FBFE] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[15px] font-semibold text-slate-900">{item.name}</div>
                  <div className="mt-1 text-sm text-slate-500">{item.product}</div>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0A4D82] ring-1 ring-slate-200">{item.id}</div>
              </div>
              <div className="mt-2 text-sm text-slate-700">Status: {item.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IndicationModal({ open, onClose, onOpenIndicativeOffer, onOpenFinalOffer, customerName, shareUrl, onShowQrInfo, onCopyLink, copyStatus, shareLabel, shareSubject }) {
  if (!open) return null;
  const recipientName = customerName || "calon tertanggung";
  const shareMessage = encodeURIComponent("Halo " + recipientName + ", berikut tautan simulasi " + shareLabel + ": " + shareUrl);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[20px] font-bold text-slate-900">Kirim Indikasi</div>
            <div className="mt-1 text-sm text-slate-500">Siapkan penawaran awal yang akan dibuka atau dibagikan ke calon nasabah.</div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-5 grid gap-3">
          <button type="button" onClick={onOpenIndicativeOffer} className="flex h-11 items-center justify-center rounded-[12px] bg-[#0A4D82] text-sm font-semibold text-white hover:brightness-105">Buka Penawaran Awal</button>
          {onOpenFinalOffer ? <button type="button" onClick={onOpenFinalOffer} className="flex h-11 items-center justify-center rounded-[12px] border border-[#0A4D82] bg-[#F8FBFE] text-sm font-semibold text-[#0A4D82] hover:bg-[#EEF5FB]">Buka Penawaran Lanjutan</button> : null}
          <button type="button" onClick={() => openShareWindow("https://wa.me/?text=" + shareMessage)} className="flex h-11 items-center justify-center rounded-[12px] border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50">Kirim via WhatsApp</button>
          <button type="button" onClick={() => openShareWindow("mailto:?subject=" + encodeURIComponent(shareSubject) + "&body=" + shareMessage)} className="flex h-11 items-center justify-center rounded-[12px] border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50">Kirim via Email</button>
          <button type="button" onClick={onCopyLink} className="flex h-11 items-center justify-center gap-2 rounded-[12px] border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"><Copy className="h-4 w-4" />Copy Link</button>
          <button type="button" onClick={onShowQrInfo} className="flex h-11 items-center justify-center gap-2 rounded-[12px] border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"><QrCode className="h-4 w-4" />QR Code</button>
        </div>
        {copyStatus ? <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{copyStatus}</div> : null}
      </div>
    </div>
  );
}

function RejectModal({ open, onClose, reason, setReason, customReason, setCustomReason, onSubmit }) {
  if (!open) return null;
  const canSubmit = Boolean(reason) && (reason !== "Alasan lainnya" || Boolean(customReason.trim()));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[20px] font-bold text-slate-900">Saya Tidak Melanjutkan Penawaran Ini</div>
            <div className="mt-1 text-sm text-slate-500">Tolong beri tahu alasan utamanya agar tim dapat menindaklanjuti dengan tepat.</div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-5 space-y-3">
          {REJECT_REASONS.map((item) => (
            <label key={item} className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
              <input type="radio" name="reject_reason" checked={reason === item} onChange={() => setReason(item)} />
              <span>{item}</span>
            </label>
          ))}
          {reason === "Alasan lainnya" ? <TextAreaInput value={customReason} onChange={setCustomReason} placeholder="Tuliskan alasan Anda" rows={3} /> : null}
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-[10px] border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Batal</button>
          <button type="button" disabled={!canSubmit} onClick={onSubmit} className={cls("rounded-[10px] px-4 py-2 text-sm font-semibold text-white", canSubmit ? "bg-[#0A4D82] hover:brightness-105" : "bg-slate-300")}>Kirim Alasan</button>
        </div>
      </div>
    </div>
  );
}

function ConsentModal({ open, agreed, onClose, onAgree }) {
  const defaultExpanded = { produk: true, data: false, material: false };
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [reachedBottom, setReachedBottom] = useState(false);
  const resetState = () => {
    setExpanded(defaultExpanded);
    setReachedBottom(false);
  };
  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 8) setReachedBottom(true);
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <div className="text-[20px] font-bold text-slate-900">Persetujuan Kebijakan</div>
            <div className="mt-1 text-sm text-slate-500">Buka seluruh bagian dan gulir sampai bawah sebelum menyetujui.</div>
          </div>
          <button type="button" onClick={() => { resetState(); onClose(); }} className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[60vh] space-y-3 overflow-y-auto p-5" onScroll={handleScroll}>
          {CONSENT_SECTIONS.map((item) => (
            <div key={item.key} className="rounded-xl border border-slate-200 bg-[#F8FBFE]">
              <button type="button" onClick={() => setExpanded((prev) => ({ ...prev, [item.key]: !prev[item.key] }))} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
                <div>
                  <div className="text-[15px] font-semibold text-slate-900">{item.title}</div>
                  <div className="mt-1 text-sm text-slate-500">{item.summary}</div>
                </div>
                <ChevronDown className={cls("h-4 w-4 text-slate-500 transition", expanded[item.key] && "rotate-180")} />
              </button>
              {expanded[item.key] ? <div className="border-t border-slate-200 px-4 py-3 text-sm leading-7 text-slate-700">{item.detail}</div> : null}
            </div>
          ))}
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
            Dengan melanjutkan, Anda menyatakan telah membaca persetujuan yang berlaku dan memahami bahwa polis diterbitkan berdasarkan data yang diberikan pada penawaran ini.
          </div>
          <div className="h-3" />
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 p-5">
          <div className="text-sm text-slate-500">
            {reachedBottom ? "Persetujuan siap disetujui." : "Gulir sampai bagian paling bawah untuk mengaktifkan tombol setuju."}
          </div>
          <div className="flex items-center gap-2">
          <button type="button" onClick={() => { resetState(); onClose(); }} className="rounded-[10px] border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Tutup</button>
          <button type="button" disabled={!reachedBottom} onClick={() => { resetState(); onAgree(); }} className={cls("rounded-[10px] px-4 py-2 text-sm font-semibold text-white", reachedBottom ? "bg-[#0A4D82] hover:brightness-105" : "bg-slate-300")}>{agreed ? "Sudah Disetujui" : "Saya Setuju"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccordionRiskRow({ title, icon, premium, detail, deductible, checked, onToggleChecked, expanded, onToggleExpand, alwaysIncluded = false, extra }) {
  const Icon = icon;
  return (
    <div className="rounded-xl border border-[#C9D5E3] bg-[#F8FBFE]">
      <div className="flex items-center gap-3 px-3.5 py-3">
        {alwaysIncluded ? <div className="flex h-5 w-5 items-center justify-center rounded border border-[#0A4D82] bg-[#0A4D82]/10 text-[#0A4D82]"><Icon className="h-3.5 w-3.5" /></div> : <input type="checkbox" checked={checked} onChange={onToggleChecked} className="h-5 w-5 rounded border-slate-300 text-[#0A4D82] focus:ring-[#0A4D82]" />}
        <button type="button" onClick={onToggleExpand} className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[#0A4D82]">{!alwaysIncluded ? <Icon className="h-4 w-4 shrink-0" /> : null}<div className="truncate text-[15px] font-semibold">{title}</div></div>
            <div className="mt-0.5 text-[12px] text-slate-500">Premi: {premium}</div>
          </div>
          <ChevronDown className={cls("h-4 w-4 shrink-0 text-slate-500 transition", expanded && "rotate-180")} />
        </button>
      </div>
      {expanded ? <div className="border-t border-[#D6E0EA] px-3.5 py-3"><div className="text-[13px] leading-6 text-slate-700" style={{ textAlign: "justify" }}>{detail}</div><div className="mt-2 text-[12px] leading-6 text-slate-600" style={{ textAlign: "justify" }}>{deductibleIsDirectText(deductible) ? <span>{deductible}</span> : <><span className="font-semibold text-slate-700">Biaya sendiri saat klaim: </span><span>{deductible}</span></>}</div>{extra ? <div className="mt-3">{extra}</div> : null}</div> : null}
    </div>
  );
}

function CameraCaptureCard({ title, description, image, onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [showGalleryFallback, setShowGalleryFallback] = useState(false);
  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
    };
  }, []);
  const startCamera = async () => {
    try {
      setErrorText("");
      setShowGalleryFallback(false);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorText("Browser ini belum mendukung akses kamera.");
        setShowGalleryFallback(true);
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraOn(true);
    } catch {
      setErrorText("Izin kamera belum diberikan atau perangkat kamera tidak tersedia.");
      setShowGalleryFallback(true);
    }
  };
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraOn(false);
  };
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const context = canvas.getContext("2d");
    if (!context || !canvas.width || !canvas.height) {
      setErrorText("Gagal mengambil foto. Coba ulangi.");
      setShowGalleryFallback(true);
      return;
    }
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    onCapture(canvas.toDataURL("image/png"));
    setErrorText("");
    setShowGalleryFallback(false);
    stopCamera();
  };
  const handleFileChange = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!String(file.type || "").startsWith("image/")) {
      setErrorText("File yang dipilih harus berupa gambar.");
      event.target.value = "";
      return;
    }
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      onCapture(dataUrl);
      setErrorText("");
      setShowGalleryFallback(false);
      stopCamera();
    } catch {
      setErrorText("Upload gambar gagal diproses. Silakan coba file lain.");
    } finally {
      event.target.value = "";
    }
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3"><div><div className="text-[15px] font-semibold text-slate-900">{title}</div><div className="mt-1 text-sm text-slate-500">{description}</div></div><Camera className="h-5 w-5 text-slate-400" /></div>
      {image ? <img src={image} alt={title} className="mt-3 h-40 w-full rounded-xl object-cover" /> : isCameraOn ? <video ref={videoRef} className="mt-3 h-40 w-full rounded-xl bg-slate-900 object-cover" muted playsInline /> : <div className="mt-3 flex h-40 w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 text-center text-sm text-slate-400">{showGalleryFallback ? "Belum ada foto. Kamera tidak bisa dipakai, Anda bisa gunakan upload cadangan." : "Belum ada foto. Aktifkan kamera untuk mengambil foto."}</div>}
      {errorText ? <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">{errorText}</div> : null}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      <div className="mt-3 flex flex-wrap gap-2">
        {!isCameraOn ? <button type="button" onClick={startCamera} className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"><Camera className="h-4 w-4" />Aktifkan Kamera</button> : <><button type="button" onClick={capturePhoto} className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#0A4D82] px-4 text-sm font-medium text-white hover:brightness-105"><Camera className="h-4 w-4" />Ambil Foto</button><button type="button" onClick={stopCamera} className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"><CameraOff className="h-4 w-4" />Tutup Kamera</button></>}
        {showGalleryFallback ? <button type="button" onClick={() => fileInputRef.current && fileInputRef.current.click()} className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"><Camera className="h-4 w-4" />Upload dari Galeri</button> : null}
        {image ? <button type="button" onClick={() => onCapture("")} className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"><Trash2 className="h-4 w-4" />Hapus Foto</button> : null}
      </div>
    </div>
  );
}

function UnderwritingSections({
  form,
  customerType,
  selectedCustomer,
  uwForm,
  setUwField,
  uploads,
  setUploads,
  setEvidence,
  expandedRows,
  setExpandedRows,
  external = false,
}) {
  const identityLabel = customerType === "Badan Usaha" ? "NPWP" : "NIK";
  const insuredName = selectedCustomer ? selectedCustomer.name : form.identity;
  const coverageEndDate = calculateCoverageEnd(uwForm.coverageStartDate);

  return (
    <div className="space-y-5">
      <SectionCard title="Informasi Nasabah Lanjutan">
        <div className="grid gap-4 md:grid-cols-2">
          <div><FieldLabel label={identityLabel} /><TextInput value={uwForm.idNumber} onChange={(value) => setUwField("idNumber", onlyDigits(value))} placeholder={customerType === "Badan Usaha" ? "Masukkan NPWP bila tersedia" : "Masukkan NIK bila tersedia"} icon={<User className="h-4 w-4" />} /></div>
          {customerType === "Badan Usaha" ? <div><FieldLabel label="Kontak di Lokasi" required /><div className="space-y-2"><TextInput value={uwForm.picName} onChange={(value) => setUwField("picName", value)} placeholder={insuredName || "Nama kontak yang bisa dihubungi di lokasi"} icon={<User className="h-4 w-4" />} /><label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={uwForm.sameAsInsured} onChange={(event) => setUwField("sameAsInsured", event.target.checked)} />Sama dengan pemegang polis</label></div></div> : null}
        </div>
      </SectionCard>

      <SectionCard title="Informasi Properti Lanjutan">
        <div className="grid gap-4 md:grid-cols-2">
          <div><FieldLabel label="Status kepemilikan bangunan / isi properti" required /><SelectInput value={uwForm.ownership} onChange={(value) => setUwField("ownership", value)} options={OWNERSHIP_TYPES} placeholder="Properti ini milik sendiri, sewa, atau lainnya?" /></div>
          <div><FieldLabel label="Perlindungan kebakaran yang tersedia" required /><SelectInput value={uwForm.fireProtection} onChange={(value) => setUwField("fireProtection", value)} options={PROTECTION_OPTIONS} placeholder="Perlindungan kebakaran apa yang tersedia di lokasi?" /></div>
        <div><FieldLabel label="Tanggal mulai perlindungan" required /><TextInput type="date" value={uwForm.coverageStartDate} onChange={(value) => setUwField("coverageStartDate", value)} /></div>
        <div><FieldLabel label="Tanggal akhir perlindungan" /><TextInput value={coverageEndDate} onChange={() => {}} placeholder="Otomatis 1 tahun" readOnly={true} /></div>
          <div><FieldLabel label="Riwayat klaim 3 tahun terakhir" required /><SelectInput value={uwForm.claimHistory} onChange={(value) => setUwField("claimHistory", value)} options={CLAIM_HISTORY_OPTIONS} placeholder="Bagaimana riwayat klaim properti ini?" /></div>
        <div className="md:col-span-2"><button type="button" onClick={() => setExpandedRows((prev) => ({ ...prev, optionalUw: !prev.optionalUw }))} className="flex w-full items-center justify-between rounded-xl border border-[#D5DDE6] bg-[#F8FBFE] px-4 py-3 text-left"><div><div className="text-[15px] font-semibold text-slate-900">Informasi Tambahan Properti</div><div className="text-sm text-slate-500">Opsional, tetapi membantu penilaian risiko.</div></div><ChevronDown className={cls("h-4 w-4 text-slate-500 transition", expandedRows.optionalUw && "rotate-180")} /></button>{expandedRows.optionalUw ? <div className="mt-3 grid gap-4 md:grid-cols-2"><div><FieldLabel label="Luas Bangunan (m²)" /><TextInput value={uwForm.optionalBuildingArea} onChange={(value) => setUwField("optionalBuildingArea", onlyDigits(value))} placeholder="Contoh: 250" icon={<Building2 className="h-4 w-4" />} /></div><div><FieldLabel label="Usia Bangunan (tahun)" /><TextInput value={uwForm.optionalBuildingAge} onChange={(value) => setUwField("optionalBuildingAge", onlyDigits(value))} placeholder="Contoh: 8" icon={<Building2 className="h-4 w-4" />} /></div><div className="md:col-span-2"><FieldLabel label="Risiko di Sekitar Lokasi" /><TextAreaInput value={uwForm.surroundingRisk} onChange={(value) => setUwField("surroundingRisk", value)} placeholder="Contoh: berdekatan dengan pasar, bengkel, gudang bahan mudah terbakar, atau area padat penduduk" rows={3} /></div><div className="md:col-span-2"><FieldLabel label="Catatan Tambahan" /><TextAreaInput value={uwForm.additionalNotes} onChange={(value) => setUwField("additionalNotes", value)} placeholder="Tambahkan informasi penting lain yang perlu diketahui tim peninjau" rows={3} /></div></div> : null}</div>
        </div>
      </SectionCard>

      <SectionCard title="Foto Properti" subtitle={external ? "Wajib diisi oleh calon nasabah." : "Wajib diisi oleh petugas internal."}>
        <div className="grid gap-4 md:grid-cols-3"><CameraCaptureCard title="Foto Tampak Depan" description="Wajib diisi." image={uploads.frontView} onCapture={(value) => { setUploads((prev) => ({ ...prev, frontView: value })); setEvidence((prev) => ({ ...prev, photos: { ...prev.photos, frontView: value ? createPhotoEvidence({ label: "Foto Tampak Depan", declaredAddress: form.locationSearch }) : null } })); }} /><CameraCaptureCard title="Foto Samping Kanan" description="Wajib diisi." image={uploads.sideRightView} onCapture={(value) => { setUploads((prev) => ({ ...prev, sideRightView: value })); setEvidence((prev) => ({ ...prev, photos: { ...prev.photos, sideRightView: value ? createPhotoEvidence({ label: "Foto Samping Kanan", declaredAddress: form.locationSearch }) : null } })); }} /><CameraCaptureCard title="Foto Samping Kiri" description="Wajib diisi." image={uploads.sideLeftView} onCapture={(value) => { setUploads((prev) => ({ ...prev, sideLeftView: value })); setEvidence((prev) => ({ ...prev, photos: { ...prev.photos, sideLeftView: value ? createPhotoEvidence({ label: "Foto Samping Kiri", declaredAddress: form.locationSearch }) : null } })); }} /></div>
      </SectionCard>
    </div>
  );
}

function ExternalProposalPage({ mode, customerName, customerType, form, uwForm, uploads, propertyType, occupancy, objectRows, totalValue, estimatedTotal, basePremium, extensionPremium, stampDuty, selectedGuarantees, expandedRows, setExpandedRows, constructionClass, onBack, onPrimary, onSecondary, onReject, onEditObject, onEditInsured, helpRequestSent, floorCount, setFloorCount, canProceed, blockingMessage, showFloorInput, floorFieldRef, preparedBy, operatingRecord, transactionAuthority, productConfig, extensionOptions }) {
  const isIndicative = mode === "indicative";
  const activeVariant = productConfig || getPropertyVariant("property-safe");
  const operatingStatusValue = operatingRecord?.status;
  const operatingVersion = operatingRecord?.version;
  const operatingValidUntil = operatingRecord?.validUntil;
  const operatingOwner = operatingRecord?.owner;
  const operatingId = operatingRecord?.id;
  const coverageLabel = isIndicative ? "Estimasi Premi 1 Tahun" : "Premi 1 Tahun";
  const primaryLabel = isIndicative ? "Isi Data" : "Pembayaran";
  const secondaryLabel = isIndicative ? "Minta Bantuan" : "Kembali";
  const constructionInfo = CONSTRUCTION_GUIDE.find((item) => item.title === constructionClass);
  const [objectOpen, setObjectOpen] = useState({ detail: true, main: true, exclusions: activeVariant.key === "property-all-risk", extension: true });
  const [insuredOpen, setInsuredOpen] = useState({ profile: true, advanced: !isIndicative, photos: false });
  const offerMeta = useMemo(() => {
    const now = new Date();
    const validity = resolveOfferValidity(isIndicative, uwForm.coverageStartDate);
    const currentStatus = !isIndicative && operatingStatusValue ? operatingStatusValue : validity.expired ? "Expired" : "Siap Bayar";
    return {
      reference: transactionAuthority?.transactionId || createTransactionAuthority({ productCode: activeVariant.productCode, primaryValue: customerName || propertyType, versionLabel: isIndicative ? "Rev 1" : (operatingVersion || "Rev 2"), preparedBy: operatingOwner || preparedBy || "Tim Jasindo", transactionId: operatingId, validUntil: operatingValidUntil || formatDisplayDateTime(validity.expiresAt) }).transactionId,
      authority: transactionAuthority || null,
      version: isIndicative ? "Rev 1" : operatingVersion || "Rev 2",
      lastUpdated: formatDisplayDateTime(now),
      validUntil: isIndicative ? formatDisplayDate(validity.expiresAt) : operatingValidUntil || formatDisplayDateTime(validity.expiresAt),
      preparedBy: operatingOwner || preparedBy || "Tim Jasindo",
      statusLabel: isIndicative ? "Menunggu Data Lanjutan" : currentStatus,
      isExpired: validity.expired || currentStatus === "Expired",
    };
  }, [activeVariant.productCode, customerName, isIndicative, operatingId, operatingOwner, operatingStatusValue, operatingValidUntil, operatingVersion, preparedBy, propertyType, transactionAuthority, uwForm.coverageStartDate]);

  const selectedExtensions = extensionOptions.filter((item) => selectedGuarantees[item.key]);
  const phoneDisplay = form.phone || "-";
  const emailDisplay = form.email || "-";
  const hasAnyAdvancedData = Boolean(
    uwForm.idNumber ||
      uwForm.picName ||
      uwForm.ownership ||
      uwForm.fireProtection ||
      uwForm.coverageStartDate ||
      uwForm.claimHistory ||
      uwForm.optionalBuildingArea ||
      uwForm.optionalBuildingAge ||
      uwForm.surroundingRisk ||
      uwForm.additionalNotes
  );
  const hasInsuredSummaryData = Boolean(
    (customerName && customerName !== "-") ||
      String(form.phone || "").trim() ||
      String(form.email || "").trim() ||
      hasAnyAdvancedData ||
      uploads.frontView ||
      uploads.sideRightView ||
      uploads.sideLeftView
  );
  const customerDisplay = customerName || "-";
  const objectSummaryLabel =
    [propertyType, occupancy].filter(Boolean).join(" - ") ||
    (objectRows.length ? `${objectRows.length} objek dilindungi` : "-");
  const coverageValue = "Rp " + formatRupiah(totalValue);
  const premiumValue = "Rp " + formatRupiah(estimatedTotal);

  return (
    <div className="min-h-screen bg-[#F3F5F7] text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="text-[18px] font-black leading-tight text-[#0A4D82]">Danantara<div className="-mt-1">Indonesia</div></div>
            <div className="text-[16px] font-semibold text-slate-700">asuransi jasindo</div>
          </div>
          <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-[10px] border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><ArrowLeft className="h-4 w-4" />Kembali</button>
        </div>
      </div>

      <div className="bg-[linear-gradient(135deg,#0A4D82_0%,#0F5F9C_60%,#1B78B6_100%)] pb-8">
        <div className="mx-auto max-w-[1280px] px-4 pt-8 md:px-6">
          <div className="rounded-[28px] border border-white/15 bg-white/10 p-6 text-white shadow-2xl shadow-[#08355A]/30 backdrop-blur">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <ProposalBadge>{isIndicative ? "Penawaran Awal" : "Penawaran Lanjutan"}</ProposalBadge>
                  <ProposalBadge>Versi {offerMeta.version}</ProposalBadge>
                  {isIndicative ? <ProposalBadge tone="amber">Siap dilengkapi</ProposalBadge> : <ProposalBadge tone={offerMeta.isExpired ? "amber" : "green"}>{offerMeta.isExpired ? "Perlu diperbarui" : "Siap dibayar"}</ProposalBadge>}
                </div>
                <h1 className="mt-4 text-[32px] font-bold tracking-tight md:text-[40px]">{activeVariant.title}</h1>
                <p className="mt-3 max-w-3xl text-[15px] leading-7 text-white/90 md:text-[17px]">
                  {activeVariant.heroSubtitle}
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">Nasabah</div>
                    <div className="mt-2 text-[16px] font-semibold text-white">{customerDisplay}</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">Properti</div>
                    <div className="mt-2 text-[16px] font-semibold text-white">{objectSummaryLabel}</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">Nilai yang Dilindungi</div>
                    <div className="mt-2 text-[16px] font-semibold text-white">{coverageValue}</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">{coverageLabel}</div>
                    <div className="mt-2 text-[16px] font-semibold text-white">{premiumValue}</div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15">
                <div className="text-sm text-white/70">Detail Penawaran</div>
                <div className="mt-1 text-[18px] font-semibold">{isIndicative ? "Penawaran awal siap dilengkapi." : "Penawaran ini siap ditinjau kembali."}</div>
                <div className="mt-4 space-y-3 border-t border-white/15 pt-4">
                  <div className="flex items-start justify-between gap-3 text-sm">
                    <span className="text-white/70">Nomor</span>
                    <span className="text-right font-semibold text-white">{offerMeta.reference}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3 text-sm">
                    <span className="text-white/70">Versi</span>
                    <span className="text-right font-semibold text-white">{offerMeta.version}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3 text-sm">
                    <span className="text-white/70">Berlaku sampai</span>
                    <span className="text-right font-semibold text-white">{offerMeta.validUntil}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3 text-sm">
                    <span className="text-white/70">Disiapkan oleh</span>
                    <span className="text-right font-semibold text-white">{offerMeta.preparedBy}</span>
                  </div>
                  <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/85">
                    {isIndicative
                ? "Lengkapi data nasabah dan properti bila penawaran ini ingin dilanjutkan."
                      : "Pembayaran hanya berlaku untuk penawaran aktif yang tampil pada halaman ini."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6">
        {helpRequestSent ? <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">Permintaan bantuan sudah dikirim. Tim internal akan membantu melanjutkan pengisian data dan menerbitkan versi penawaran terbaru.</div> : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <SectionCard
          title="Informasi Properti"
              subtitle="Ringkasan objek yang dijamin dan jaminan yang dipilih."
              action={!isIndicative ? (
                <button type="button" onClick={onEditObject} className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium text-[#0A4D82] hover:bg-[#F8FBFE]">
          Ubah Properti
                </button>
              ) : null}
            >
              <div className="rounded-2xl border border-[#D8E1EA] bg-[#F8FBFE] p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ProposalRow label="Jenis Bangunan" value={propertyType} strong={true} />
                    <ProposalRow label="Penggunaan bangunan" value={occupancy} strong={true} />
                    <ProposalRow label="Kelas Bangunan" value={constructionClass} strong={true} />
        <ProposalRow label="Nilai yang Dilindungi" value={"Rp " + formatRupiah(totalValue)} strong={true} />
                  </div>
                  {constructionInfo ? <div className="mt-4 rounded-xl border border-[#CFE0F0] bg-white px-4 py-3 text-sm leading-6 text-slate-600"><span className="font-semibold text-slate-900">{constructionInfo.title}.</span> {constructionInfo.desc}</div> : null}
              </div>

              <div className="mt-5 space-y-3">
                <ProposalAccordion
        title="Rincian Properti"
        subtitle="Lihat nilai yang dilindungi dan keterangan setiap objek."
                  open={objectOpen.detail}
                  onToggle={() => setObjectOpen((prev) => ({ ...prev, detail: !prev.detail }))}
                >
                  <div className="space-y-3">
                    {objectRows.map((row, index) => (
                      <div key={row.id} className="rounded-xl border border-slate-200 bg-[#FCFDFE] p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="text-[15px] font-semibold text-slate-900">Objek {index + 1} - {row.type}</div>
                            <div className="mt-1 text-sm text-slate-500">{row.note || "Belum ada keterangan tambahan."}</div>
                          </div>
                          <div className="shrink-0 whitespace-nowrap text-right text-[15px] font-semibold leading-none text-[#0A4D82]">Rp {formatRupiah(parseNumber(row.amount))}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ProposalAccordion>

                <ProposalAccordion
                  title="Jaminan Utama"
                  subtitle="Perlindungan dasar yang selalu termasuk dalam penawaran."
                  open={objectOpen.main}
                  onToggle={() => setObjectOpen((prev) => ({ ...prev, main: !prev.main }))}
                >
                  <AccordionRiskRow title={activeVariant.primaryCoverageTitle} icon={Flame} premium={"Rp " + formatRupiah(basePremium)} detail={activeVariant.primaryCoverageDescription} deductible={constructionInfo && constructionInfo.title === "Kelas 1" ? activeVariant.primaryCoverageDeductibleClassOne : activeVariant.primaryCoverageDeductibleOther} alwaysIncluded={true} expanded={expandedRows.fire} onToggleExpand={() => setExpandedRows((prev) => ({ ...prev, fire: !prev.fire }))} />
                </ProposalAccordion>

                {activeVariant.importantExclusions.length ? (
                  <ProposalAccordion
                    title={activeVariant.exclusionsSectionTitle}
                    subtitle={activeVariant.exclusionsSectionSubtitle}
                    open={objectOpen.exclusions}
                    onToggle={() => setObjectOpen((prev) => ({ ...prev, exclusions: !prev.exclusions }))}
                  >
                    <div className="space-y-2">
                      {activeVariant.importantExclusions.map((item) => (
                        <div key={item} className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                          <AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-amber-500" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </ProposalAccordion>
                ) : null}

                <ProposalAccordion
                  title="Tambahan Perlindungan"
                  subtitle="Pilihan perlindungan tambahan yang bisa melengkapi proteksi properti Anda."
                  open={objectOpen.extension}
                  onToggle={() => setObjectOpen((prev) => ({ ...prev, extension: !prev.extension }))}
                >
                  {showFloorInput ? <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><div className="font-semibold">Risiko Gempa Bumi membutuhkan data tambahan.</div><div className="mt-1">Lengkapi jumlah lantai saat Anda memperbarui penawaran.</div></div> : null}
                  {selectedExtensions.length ? (
                    <div className="space-y-3">
                      {selectedExtensions.map((item) => {
                        const premiumValue = Math.round(totalValue * item.rate);
                        const deductibleValue = item.key === "earthquake" ? "2,5% dari Rp " + formatRupiah(totalValue) : item.deductible;
                        return (
                          <AccordionRiskRow
                            key={item.key}
                            title={item.title}
                            icon={item.icon}
                            premium={"Rp " + formatRupiah(premiumValue)}
                            detail={item.detail}
                            deductible={deductibleValue}
                            checked={true}
                            onToggleChecked={() => {}}
                            expanded={expandedRows[item.key]}
                            onToggleExpand={() => setExpandedRows((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                            extra={item.key === "earthquake" && isFloorRelevant(propertyType, occupancy) ? <div ref={floorFieldRef} className="max-w-sm rounded-xl border border-amber-200 bg-white p-3"><FieldLabel label="Jumlah lantai bangunan yang diasuransikan" required helpText="Wajib untuk simulasi gempa bumi pada objek bertingkat." /><TextInput value={floorCount} onChange={(value) => setFloorCount(onlyDigits(value))} placeholder="Masukkan jumlah lantai" icon={<Building2 className="h-4 w-4" />} /></div> : null}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">Belum ada tambahan perlindungan yang dipilih pada penawaran ini.</div>
                  )}
                </ProposalAccordion>
              </div>
            </SectionCard>

            {hasInsuredSummaryData ? <SectionCard
        title="Informasi Nasabah"
        subtitle="Ringkasan data nasabah pada penawaran ini."
              action={
                <button type="button" onClick={onEditInsured} className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium text-[#0A4D82] hover:bg-[#F8FBFE]">
                  {isIndicative ? "Isi Data" : "Ubah Data"}
                </button>
              }
            >
              <div className="rounded-2xl border border-[#D8E1EA] bg-[#F8FBFE] p-4">
                <div className="grid gap-3 sm:grid-cols-2">
        <ProposalRow label="Nama pemegang polis" value={customerName || "-"} strong={true} />
        <ProposalRow label="Jenis nasabah" value={customerType || "-"} strong={true} />
                  <ProposalRow label="Nomor Handphone" value={phoneDisplay} />
                  <ProposalRow label="Alamat Email" value={emailDisplay} />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <ProposalAccordion
        title="Informasi Nasabah Lanjutan"
        subtitle={isIndicative ? "Bagian ini akan dilengkapi setelah data lanjutan diisi." : "Rincian identitas dan kontak nasabah."}
                  open={insuredOpen.profile}
                  onToggle={() => setInsuredOpen((prev) => ({ ...prev, profile: !prev.profile }))}
                >
                  {isIndicative ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">Data lanjutan nasabah belum diisi pada tahap ini. Anda dapat melengkapinya sebelum penawaran dilanjutkan ke pembayaran.</div>
                  ) : (
                    <div className="space-y-1">
                      <ProposalRow label={customerType === "Badan Usaha" ? "NPWP" : "NIK"} value={uwForm.idNumber || "-"} />
                      {customerType === "Badan Usaha" ? <ProposalRow label="Kontak di Lokasi" value={uwForm.picName || "-"} /> : null}
                    </div>
                  )}
                </ProposalAccordion>

                <ProposalAccordion
        title="Informasi Properti Lanjutan"
        subtitle={isIndicative ? "Bagian ini akan dilengkapi setelah data lanjutan diisi." : "Rincian data properti dan masa perlindungan."}
                  open={insuredOpen.advanced}
                  onToggle={() => setInsuredOpen((prev) => ({ ...prev, advanced: !prev.advanced }))}
                >
                  {hasAnyAdvancedData ? (
                    <div className="space-y-1">
        <ProposalRow label="Status kepemilikan properti" value={uwForm.ownership || "-"} />
                      <ProposalRow label="Proteksi Kebakaran" value={uwForm.fireProtection || "-"} />
        <ProposalRow label="Mulai perlindungan" value={uwForm.coverageStartDate || "-"} />
        <ProposalRow label="Akhir perlindungan" value={calculateCoverageEnd(uwForm.coverageStartDate) || "-"} />
                      <ProposalRow label="Riwayat klaim 3 tahun terakhir" value={uwForm.claimHistory || "-"} />
                      <ProposalRow label="Luas Bangunan (m²)" value={uwForm.optionalBuildingArea || "-"} />
                      <ProposalRow label="Usia Bangunan (tahun)" value={uwForm.optionalBuildingAge || "-"} />
                      <ProposalRow label="Risiko di Sekitar Lokasi" value={uwForm.surroundingRisk || "-"} />
                      <ProposalRow label="Catatan Tambahan" value={uwForm.additionalNotes || "-"} />
                    </div>
                  ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">Belum ada informasi properti lanjutan yang ditambahkan pada versi penawaran ini.</div>
                  )}
                </ProposalAccordion>

                <ProposalAccordion
        title="Foto Properti"
                  subtitle="Status foto yang sudah dilampirkan pada penawaran."
                  open={insuredOpen.photos}
                  onToggle={() => setInsuredOpen((prev) => ({ ...prev, photos: !prev.photos }))}
                >
                  <div className="grid gap-3 md:grid-cols-3">
                    {[
                      { label: "Tampak Depan", value: uploads.frontView },
                      { label: "Samping Kanan", value: uploads.sideRightView },
                      { label: "Samping Kiri", value: uploads.sideLeftView },
                    ].map((item) => (
                      <div key={item.label} className={cls("rounded-xl border p-4", item.value ? "border-green-200 bg-green-50" : "border-slate-200 bg-slate-50")}>
                        <div className="text-sm font-semibold text-slate-900">{item.label}</div>
                        <div className={cls("mt-2 text-sm", item.value ? "text-green-700" : "text-slate-500")}>{item.value ? "Sudah terlampir" : "Belum dilampirkan"}</div>
                      </div>
                    ))}
                  </div>
                </ProposalAccordion>
              </div>
            </SectionCard> : null}
          </div>

          <aside className="h-fit rounded-[28px] bg-[#0A4D82] p-5 text-white shadow-[0_24px_60px_rgba(10,77,130,0.32)] lg:sticky lg:top-24">
            <div className="text-[20px] font-bold">Ringkasan Penawaran</div>
            <div className="mt-4 rounded-2xl bg-white/10 p-4">
              <div className="text-sm font-semibold text-white">Detail Penawaran</div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-start justify-between gap-3"><span className="text-white/70">Nomor</span><span className="text-right font-semibold text-white">{offerMeta.reference}</span></div>
                <div className="flex items-start justify-between gap-3"><span className="text-white/70">Versi</span><span className="text-right font-semibold text-white">{offerMeta.version}</span></div>
                <div className="flex items-start justify-between gap-3"><span className="text-white/70">Berlaku sampai</span><span className="text-right font-semibold text-white">{offerMeta.validUntil}</span></div>
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-white/10 p-4">
              <SummaryRow label={activeVariant.primaryCoveragePremiumLabel} value={"Rp " + formatRupiah(basePremium)} />
              {extensionPremium > 0 ? <SummaryRow label="Premi Tambahan Perlindungan" value={"Rp " + formatRupiah(extensionPremium)} /> : null}
              <SummaryRow label="Biaya Materai" value={"Rp " + formatRupiah(stampDuty)} />
            </div>
            <div className="mt-4 rounded-2xl bg-white/10 p-4">
              <div className="text-sm text-white/75">{coverageLabel}</div>
              <div className="mt-2 text-[32px] font-bold leading-none">Rp {formatRupiah(estimatedTotal)}</div>
            </div>
            {blockingMessage ? <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">{blockingMessage}</div> : null}
            <div className="mt-4 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-white/85">
              {isIndicative
                ? `${activeVariant.summaryCoverageLine} Data pada halaman ini masih dapat diperbarui sebelum penawaran dilanjutkan.`
                : `${activeVariant.summaryCoverageLine} Pembayaran hanya berlaku untuk penawaran aktif yang tampil pada halaman ini.`}
            </div>
            {!isIndicative && offerMeta.isExpired ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Masa berlaku penawaran ini sudah berakhir. Silakan minta versi penawaran terbaru sebelum melanjutkan pembayaran.</div> : null}
            <div className="mt-4 space-y-2.5">
              <button type="button" disabled={!canProceed || (!isIndicative && offerMeta.isExpired)} onClick={onPrimary} className={cls("flex h-[48px] w-full items-center justify-center rounded-[12px] text-sm font-bold uppercase tracking-wide text-white shadow-sm", canProceed && (isIndicative || !offerMeta.isExpired) ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}>{primaryLabel}</button>
              <button type="button" onClick={onSecondary} className="flex h-[48px] w-full items-center justify-center rounded-[12px] bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/15">{secondaryLabel}</button>
            </div>
            <button type="button" onClick={onReject} className="mt-8 w-full text-center text-sm text-white/80 underline underline-offset-4 hover:text-white">Saya tidak ingin melanjutkan penawaran ini</button>
          </aside>
        </div>
      </div>
    </div>
  );
}

function ExternalPaymentPage({ customerName, estimatedTotal, paymentMethod, onSelectMethod, onBack, onProceedPayment, paymentStatus, operatingRecord, isExpired }) {
  const operatingBlockedMessage = paymentBlockMessage(operatingRecord);
  const canProceedPayment = canProceedToPaymentFromOperating(operatingRecord);
  return (
    <div className="min-h-screen bg-[#F3F5F7] text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-4 md:px-6"><div className="flex items-center gap-3"><div className="text-[18px] font-black leading-tight text-[#0A4D82]">Danantara<div className="-mt-1">Indonesia</div></div><div className="text-[16px] font-semibold text-slate-700">asuransi jasindo</div></div><button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-[10px] border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><ArrowLeft className="h-4 w-4" />Kembali</button></div>
      </div>
      <div className="mx-auto max-w-[1100px] px-4 py-8 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <SectionCard title="Pembayaran" subtitle="Halaman ini hanya muncul untuk calon tertanggung, bukan untuk user internal.">
            <div className="space-y-3">{PAYMENT_OPTIONS.map((item) => <button key={item} type="button" onClick={() => onSelectMethod(item)} className={cls("flex w-full items-center justify-between rounded-xl border px-4 py-4 text-left", paymentMethod === item ? "border-[#0A4D82] bg-[#F8FBFE]" : "border-slate-200 bg-white")}><span className="font-semibold text-slate-900">{item}</span>{paymentMethod === item ? <CheckCircle2 className="h-5 w-5 text-[#0A4D82]" /> : null}</button>)}</div>
            {operatingBlockedMessage ? <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{operatingBlockedMessage}</div> : null}
            {isExpired ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Masa berlaku penawaran ini sudah berakhir. Silakan minta versi penawaran terbaru sebelum melanjutkan pembayaran.</div> : null}
            {paymentStatus ? <div className="mt-4 rounded-xl border border-[#CFE0F0] bg-[#F8FBFE] p-4 text-sm text-[#0A4D82]">{paymentStatus}</div> : null}
          </SectionCard>
        <aside className="h-fit rounded-2xl bg-[#0A4D82] p-5 text-white shadow-lg lg:sticky lg:top-24"><div className="text-[18px] font-bold">Ringkasan Pembayaran</div><div className="mt-4 rounded-xl bg-white/10 p-4"><div className="text-sm text-white/75">Nasabah</div><div className="mt-1 font-semibold">{customerName || "Calon nasabah"}</div></div><div className="mt-3 rounded-xl bg-white/10 p-4"><div className="text-sm text-white/75">Total yang Dibayar</div><div className="mt-2 text-[30px] font-bold leading-none">Rp {formatRupiah(estimatedTotal)}</div></div><div className="mt-3 rounded-xl bg-white/10 p-4"><div className="text-sm text-white/75">Metode Pembayaran</div><div className="mt-1 font-semibold">{paymentMethod || "Pilih metode pembayaran"}</div></div><button type="button" disabled={!paymentMethod || !canProceedPayment || isExpired} onClick={onProceedPayment} className={cls("mt-4 flex h-[48px] w-full items-center justify-center rounded-[12px] text-sm font-bold uppercase tracking-wide text-white shadow-sm", paymentMethod && canProceedPayment && !isExpired ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}>Pembayaran</button></aside>
        </div>
      </div>
    </div>
  );
}

function ExternalDeclinedPage({ customerName, reason, onBackHome }) {
  return (
    <div className="min-h-screen bg-[#F3F5F7] text-slate-900">
      <div className="bg-[linear-gradient(135deg,#0A4D82_0%,#0F5F9C_60%,#1B78B6_100%)] pb-10">
        <div className="mx-auto max-w-[960px] px-4 pt-10 md:px-6">
          <div className="rounded-[28px] border border-white/15 bg-white/10 p-6 text-white shadow-2xl shadow-[#08355A]/30 backdrop-blur md:p-8">
            <div className="inline-flex rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white/90">Terima kasih atas respons Anda</div>
            <h1 className="mt-4 text-[30px] font-bold tracking-tight md:text-[38px]">Penawaran tidak dilanjutkan.</h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-white/90 md:text-[17px]">
              {customerName ? `${customerName}, ` : ""}terima kasih sudah meninjau penawaran ini. Tim kami sudah menerima feedback Anda dan akan menggunakannya untuk tindak lanjut yang lebih tepat.
            </p>
            <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4">
              <div className="text-sm text-white/70">Alasan yang tercatat</div>
            <div className="mt-2 text-[16px] font-semibold text-white">{reason || "Calon nasabah memilih tidak melanjutkan penawaran ini."}</div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={onBackHome} className="inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#F5A623] px-5 text-sm font-bold uppercase tracking-wide text-white shadow-sm hover:brightness-105">
                Kembali ke Produk
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PropertyStepOneFrontendCompact({
  embedded = false,
  entryMode = "internal",
  productVariant = "property-safe",
  onExit,
  allowedPropertyTypes = PROPERTY_TYPES,
  sessionName = "Taqwim (Internal)",
  operatingRecord = null,
  onOperatingSignal = () => {},
  onOpenWorkspace = () => {},
  onOpenQueue = () => {},
  onOpenPartnerConfig = () => {},
}) {
  const availablePropertyTypes = useMemo(() => {
    const filtered = allowedPropertyTypes.filter((item) => PROPERTY_TYPES.includes(item));
    return filtered.length ? filtered : PROPERTY_TYPES;
  }, [allowedPropertyTypes]);
  const [currentProductVariant, setCurrentProductVariant] = useState(productVariant);
  const activeVariant = getPropertyVariant(currentProductVariant);
  const activeGuarantees = useMemo(
    () =>
      getPropertyExtensions(currentProductVariant).map((item) => ({
        ...item,
        icon: ICON_MAP[item.iconKey] || Shield,
      })),
    [currentProductVariant],
  );
  const [screen, setScreen] = useState(embedded ? "property" : "catalog");
  const [internalStep, setInternalStep] = useState(1);
  const [externalView, setExternalView] = useState(embedded && entryMode === "external" ? "offer-indicative" : "");
  const [quoted, setQuoted] = useState(false);
  const [showConstructionGuide, setShowConstructionGuide] = useState(false);
  const [showIndicationModal, setShowIndicationModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showSentOffers, setShowSentOffers] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectCustomReason, setRejectCustomReason] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [shareFeedback, setShareFeedback] = useState("");
  const [rejectionStatus, setRejectionStatus] = useState("");
  const [qrInfoVisible, setQrInfoVisible] = useState(false);
  const [helpRequestSent, setHelpRequestSent] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedGuarantees, setSelectedGuarantees] = useState({ riot: false, flood: false, tsfwd: false, earthquake: false });
  const [expandedRows, setExpandedRows] = useState({ fire: true, riot: false, flood: false, tsfwd: false, earthquake: false, exclusions: productVariant === "property-all-risk", optionalUw: false });
  const [floorCount, setFloorCount] = useState("");
  const [form, setForm] = useState({
    identity: "",
    phone: "",
    email: "",
    propertyType: "",
    occupancy: "",
    locationSearch: "",
    constructionClass: "",
    customerType: "Nasabah Perorangan",
  });
  useEffect(() => {
    setCurrentProductVariant(productVariant);
  }, [productVariant]);
  useEffect(() => {
    setSelectedGuarantees({
      riot: false,
      flood: false,
      tsfwd: false,
      earthquake: false,
    });
    setExpandedRows((prev) => ({
      ...prev,
      fire: true,
      riot: false,
      flood: false,
      tsfwd: false,
      earthquake: false,
      exclusions: currentProductVariant === "property-all-risk",
    }));
  }, [currentProductVariant]);
  const today = formatDateInput(new Date());
  const [objectRows, setObjectRows] = useState([{ id: "obj-1", type: "", amount: "", note: "" }]);
  const [uwForm, setUwForm] = useState({
    idNumber: "",
    sameAsInsured: true,
    picName: "",
    ownership: "Milik Sendiri",
    coverageStartDate: today,
    optionalBuildingArea: "",
    optionalBuildingAge: "",
    fireProtection: "Tidak Ada",
    claimHistory: "Tidak Ada",
    surroundingRisk: "",
    additionalNotes: "",
  });
  const [uploads, setUploads] = useState({ frontView: "", sideRightView: "", sideLeftView: "" });
  const [documentChecks] = useState({ ktp: createEmptyDocumentCheck("KTP") });
  const [evidence, setEvidence] = useState({ location: null, photos: { frontView: null, sideRightView: null, sideLeftView: null } });
  const resultsRef = useRef(null);
  const floorFieldRef = useRef(null);
  const previousFloorFieldVisibleRef = useRef(false);

  const customerSuggestions = useMemo(() => {
    const keyword = String(form.identity || "").trim().toLowerCase();
    if (!keyword) return [];
    return MOCK_CIF.filter((item) => item.name.toLowerCase().includes(keyword) || item.cif.toLowerCase().includes(keyword)).slice(0, 5);
  }, [form.identity]);
  const showFloorInput = selectedGuarantees.earthquake && isFloorRelevant(form.propertyType, form.occupancy);
  const fraudAlerts = useMemo(() => summarizeFraudSignals({ documentChecks: [documentChecks.ktp], evidenceChecks: [evidence.location, evidence.photos.frontView, evidence.photos.sideRightView, evidence.photos.sideLeftView] }), [documentChecks, evidence]);
  const operatingVersion = operatingRecord?.version;
  const operatingOwner = operatingRecord?.owner;
  const operatingId = operatingRecord?.id;
  const operatingValidUntil = operatingRecord?.validUntil;
  const transactionAuthority = useMemo(
    () =>
      createTransactionAuthority({
        productCode: activeVariant.productCode,
        primaryValue: selectedCustomer?.name || form.identity || form.propertyType,
        versionLabel: operatingVersion || (internalStep === 1 ? "Rev 1" : "Rev 2"),
        preparedBy: operatingOwner || sessionName || "Tim Jasindo",
        transactionId: operatingId,
        validUntil: operatingValidUntil || "",
      }),
    [activeVariant.productCode, form.identity, form.propertyType, internalStep, operatingId, operatingOwner, operatingValidUntil, operatingVersion, selectedCustomer?.name, sessionName],
  );
  useEffect(() => {
    if (!fraudAlerts.length) return;
    onOperatingSignal({
      status: "Pending Review Internal",
      reason: fraudAlerts[0],
      notes: "Transaksi perlu review internal berdasarkan hasil verifikasi dokumen atau evidence.",
      flags: fraudAlerts,
    });
  }, [fraudAlerts, onOperatingSignal]);
  useEffect(() => {
    onOperatingSignal({ authority: transactionAuthority });
  }, [onOperatingSignal, transactionAuthority]);
  useEffect(() => {
    const allowed = OCCUPANCY_MAP[form.propertyType] || [];
    if (form.occupancy && !allowed.includes(form.occupancy)) setForm((prev) => ({ ...prev, occupancy: "" }));
  }, [form.propertyType, form.occupancy]);
  useEffect(() => {
    if (form.propertyType && !availablePropertyTypes.includes(form.propertyType)) {
      const fallbackPropertyType = availablePropertyTypes.includes("Rumah Tinggal") ? "Rumah Tinggal" : availablePropertyTypes[0];
      setForm((prev) => ({
        ...prev,
        propertyType: fallbackPropertyType,
        occupancy: "",
      }));
    }
  }, [availablePropertyTypes, form.propertyType]);
  useEffect(() => {
    if (quoted && resultsRef.current) resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [quoted]);
  useEffect(() => {
    if (selectedCustomer) {
      setForm((prev) => ({
        ...prev,
        customerType: selectedCustomer.type,
        phone: selectedCustomer.phone || prev.phone,
        email: selectedCustomer.email || prev.email,
      }));
    }
  }, [selectedCustomer]);
  useEffect(() => {
    if (uwForm.sameAsInsured) {
      const insuredName = selectedCustomer ? selectedCustomer.name : form.identity;
      setUwForm((prev) => ({ ...prev, picName: insuredName }));
    }
  }, [uwForm.sameAsInsured, form.identity, selectedCustomer]);
  useEffect(() => {
    if (!showIndicationModal) setShareFeedback("");
  }, [showIndicationModal]);
  useEffect(() => {
    const shouldShowFloorField = selectedGuarantees.earthquake && showFloorInput && (quoted || externalView === "offer-indicative" || externalView === "offer-final");
    if (shouldShowFloorField) {
      setExpandedRows((prev) => (prev.earthquake ? prev : { ...prev, earthquake: true }));
    }
  }, [selectedGuarantees.earthquake, showFloorInput, quoted, externalView]);
  useEffect(() => {
    const shouldShowFloorField = selectedGuarantees.earthquake && showFloorInput && (quoted || externalView === "offer-indicative" || externalView === "offer-final");
    if (shouldShowFloorField && !previousFloorFieldVisibleRef.current) {
      const timer = window.setTimeout(() => {
        if (floorFieldRef.current) floorFieldRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 180);
      previousFloorFieldVisibleRef.current = true;
      return () => window.clearTimeout(timer);
    }
    if (!shouldShowFloorField) previousFloorFieldVisibleRef.current = false;
  }, [selectedGuarantees.earthquake, showFloorInput, quoted, externalView, form.propertyType, form.occupancy]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const setUwField = (key, value) => setUwForm((prev) => ({ ...prev, [key]: value }));
  const updateObjectRow = (id, patch) => setObjectRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  const addObjectRow = () => setObjectRows((prev) => prev.concat({ id: "obj-" + Date.now(), type: "", amount: "", note: "" }));
  const removeObjectRow = (id) => setObjectRows((prev) => (prev.length === 1 ? prev : prev.filter((row) => row.id !== id)));
  const totalValue = useMemo(() => objectRows.reduce((sum, row) => sum + parseNumber(row.amount), 0), [objectRows]);
  const baseRate = form.propertyType === "Rumah Tinggal" ? 0.00185 : 0.00265;
  const hasQuoteBasis = Boolean(form.propertyType) && Boolean(form.occupancy) && Boolean(form.constructionClass) && totalValue > 0;
  const basePremiumNumber = hasQuoteBasis ? Math.max(Math.round(totalValue * baseRate), 150000) : 0;
  const stampDutyNumber = hasQuoteBasis ? 10000 + (selectedGuarantees.earthquake ? 10000 : 0) : 0;
  const guaranteeBreakdown = activeGuarantees.filter((item) => selectedGuarantees[item.key]).map((item) => ({ ...item, premium: Math.round(totalValue * item.rate) }));
  const additionalPremiumNumber = guaranteeBreakdown.reduce((sum, item) => sum + item.premium, 0);
  const estimatedTotalNumber = hasQuoteBasis ? basePremiumNumber + additionalPremiumNumber + stampDutyNumber : 0;
  const customerName = selectedCustomer ? selectedCustomer.name : form.identity;
  const shareUrl = getShareUrl(externalView || (internalStep === 2 ? "offer-final" : "offer-indicative"));
  const hasValidStepOneIdentity = Boolean(form.identity.trim());
  const hasValidPhoneContact = Boolean(form.phone.trim()) && isValidPhone(form.phone);
  const hasValidEmailContact = Boolean(form.email.trim()) && isValidEmail(form.email);
  const hasValidStepOneContact = hasValidPhoneContact && hasValidEmailContact;
  const hasValidStepOneLocation = Boolean(form.locationSearch.trim());
  const hasValidObjects = totalValue > 0 && objectRows.every((row) => parseNumber(row.amount) > 0);
  const hasRequiredObjectNotes = objectRows.every((row) => !requiresObjectNote(row.type) || Boolean(String(row.note || "").trim()));
  const hasRequiredFloorCount = !showFloorInput || Number(floorCount) > 0;
  const canAdvanceInternalStepOne = hasValidStepOneIdentity && hasValidStepOneContact && hasValidStepOneLocation && hasValidObjects && hasRequiredObjectNotes && hasRequiredFloorCount;
  const hasValidUwIdentity = !uwForm.idNumber.trim() || isValidIdNumber(form.customerType, uwForm.idNumber);
  const hasValidPicName = form.customerType !== "Badan Usaha" || Boolean(uwForm.picName.trim());
  const hasValidUnderwriting = Boolean(uwForm.coverageStartDate) && Boolean(uwForm.ownership) && Boolean(uwForm.fireProtection) && Boolean(uwForm.claimHistory);
  const hasCompleteUploads = hasRequiredUploads(uploads);
  const canAdvanceUnderwriting = hasValidUwIdentity && hasValidPicName && hasValidUnderwriting && hasCompleteUploads;
  const stepOnePendingItems = [];
  if (!hasValidStepOneIdentity) stepOnePendingItems.push("Isi nama nasabah atau pilih CIF.");
if (!hasValidStepOneContact) stepOnePendingItems.push("Lengkapi nomor handphone dan alamat email yang valid.");
  if (!hasValidStepOneLocation) stepOnePendingItems.push("Isi lokasi properti atau gunakan tombol lokasi cepat.");
  if (!hasValidObjects) stepOnePendingItems.push("Setiap objek harus punya nilai yang ingin dilindungi.");
  if (!hasRequiredObjectNotes) stepOnePendingItems.push("Objek jenis stok wajib dilengkapi dengan keterangan.");
  if (!hasRequiredFloorCount) stepOnePendingItems.push("Lengkapi jumlah lantai pada perluasan Risiko Gempa Bumi.");
  const underwritingPendingItems = [];
  if (uwForm.idNumber.trim() && !hasValidUwIdentity) underwritingPendingItems.push(form.customerType === "Badan Usaha" ? "NPWP yang diisi minimal 15 digit." : "NIK yang diisi harus 16 digit.");
  if (!hasValidPicName) underwritingPendingItems.push("Lengkapi kontak di lokasi.");
  if (!hasValidUnderwriting) underwritingPendingItems.push("Lengkapi data tambahan yang wajib.");
  if (!hasCompleteUploads) underwritingPendingItems.push("Unggah tiga foto properti: depan, samping kanan, dan samping kiri.");
  const shouldShowQuotedPricing = quoted && hasQuoteBasis;
  const shouldShowSidebarPricing = (quoted || internalStep > 1 || externalView === "offer-indicative" || externalView === "offer-final" || externalView === "payment") && hasQuoteBasis;
  const pricingSummaryValue = shouldShowSidebarPricing ? "Rp " + formatRupiah(basePremiumNumber) : "-";
  const extensionPremiumSummaryValue = shouldShowSidebarPricing && additionalPremiumNumber > 0 ? "Rp " + formatRupiah(additionalPremiumNumber) : null;
  const stampDutySummaryValue = shouldShowSidebarPricing ? "Rp " + formatRupiah(stampDutyNumber) : "-";

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setShareFeedback("Link berhasil disalin.");
    } catch {
      setShareFeedback("Copy otomatis gagal. Silakan gunakan QR info atau salin tautan secara manual.");
    }
  };

  const guaranteeList = useMemo(() => {
    const items = [
      {
        title: activeVariant.primaryCoverageTitle,
        detail: activeVariant.primaryCoverageDescription,
        deductible: form.constructionClass === "Kelas 1" ? activeVariant.primaryCoverageDeductibleClassOne : activeVariant.primaryCoverageDeductibleOther,
      },
    ];
    guaranteeBreakdown.forEach((item) => items.push({ title: item.title, detail: item.detail, deductible: item.key === "earthquake" ? "2,5% dari Rp " + formatRupiah(totalValue) : item.deductible }));
    return items;
  }, [activeVariant, guaranteeBreakdown, form.constructionClass, totalValue]);

  if (externalView === "offer-indicative") {
    return (
      <>
        <RejectModal open={showRejectModal} onClose={() => setShowRejectModal(false)} reason={rejectReason} setReason={setRejectReason} customReason={rejectCustomReason} setCustomReason={setRejectCustomReason} onSubmit={() => { const finalReason = rejectReason === "Alasan lainnya" ? rejectCustomReason.trim() : rejectReason; setRejectionStatus("Alasan penolakan tersimpan: " + finalReason + ". Ini masih simulasi untuk handoff ke tim IT."); setShowRejectModal(false); }} />
        <ExternalProposalPage
          mode="indicative"
          customerName={customerName || uwForm.picName}
          customerType={form.customerType}
          form={form}
          uwForm={uwForm}
          uploads={uploads}
          propertyOptions={availablePropertyTypes}
          propertyType={form.propertyType}
          setPropertyType={(value) => setField("propertyType", value)}
          occupancy={form.occupancy}
          setOccupancy={(value) => setField("occupancy", value)}
          objectRows={objectRows}
          updateObjectRow={updateObjectRow}
          addObjectRow={addObjectRow}
          removeObjectRow={removeObjectRow}
          totalValue={totalValue}
          estimatedTotal={estimatedTotalNumber}
          basePremium={basePremiumNumber}
          extensionPremium={additionalPremiumNumber}
          stampDuty={stampDutyNumber}
          guarantees={guaranteeList}
          selectedGuarantees={selectedGuarantees}
          setSelectedGuarantees={setSelectedGuarantees}
          expandedRows={expandedRows}
          setExpandedRows={setExpandedRows}
          constructionClass={form.constructionClass}
          floorCount={floorCount}
          setFloorCount={setFloorCount}
          canProceed={hasRequiredFloorCount}
          blockingMessage={!hasRequiredFloorCount ? "Isi jumlah lantai jika Anda memilih perlindungan gempa bumi untuk bangunan bertingkat." : ""}
          showFloorInput={showFloorInput}
          floorFieldRef={floorFieldRef}
          onEditObject={() => {}}
          onEditInsured={() => setExternalView("external-underwriting")}
          onBack={() => {
            if (embedded && entryMode === "external") {
              if (onExit) onExit();
              return;
            }
            setExternalView("");
          }}
          onPrimary={() => setExternalView("external-underwriting")}
          onSecondary={() => setHelpRequestSent(true)}
          onReject={() => setShowRejectModal(true)}
          helpRequestSent={helpRequestSent}
          preparedBy={sessionName}
          operatingRecord={operatingRecord}
          transactionAuthority={transactionAuthority}
          productConfig={activeVariant}
          extensionOptions={activeGuarantees}
        />
      </>
    );
  }

  if (externalView === "offer-final") {
    return (
      <>
        <ConsentModal agreed={false} open={showConsentModal} onClose={() => setShowConsentModal(false)} onAgree={() => { setShowConsentModal(false); setExternalView("payment"); }} />
        <RejectModal open={showRejectModal} onClose={() => setShowRejectModal(false)} reason={rejectReason} setReason={setRejectReason} customReason={rejectCustomReason} setCustomReason={setRejectCustomReason} onSubmit={() => { const finalReason = rejectReason === "Alasan lainnya" ? rejectCustomReason.trim() : rejectReason; setRejectionStatus("Alasan penolakan tersimpan: " + finalReason + ". Ini masih simulasi untuk handoff ke tim IT."); setShowRejectModal(false); }} />
        <ExternalProposalPage
          mode="final"
          customerName={customerName || uwForm.picName}
          customerType={form.customerType}
          form={form}
          uwForm={uwForm}
          uploads={uploads}
          propertyOptions={availablePropertyTypes}
          propertyType={form.propertyType}
          setPropertyType={(value) => setField("propertyType", value)}
          occupancy={form.occupancy}
          setOccupancy={(value) => setField("occupancy", value)}
          objectRows={objectRows}
          updateObjectRow={updateObjectRow}
          addObjectRow={addObjectRow}
          removeObjectRow={removeObjectRow}
          totalValue={totalValue}
          estimatedTotal={estimatedTotalNumber}
          basePremium={basePremiumNumber}
          extensionPremium={additionalPremiumNumber}
          stampDuty={stampDutyNumber}
          guarantees={guaranteeList}
          selectedGuarantees={selectedGuarantees}
          setSelectedGuarantees={setSelectedGuarantees}
          expandedRows={expandedRows}
          setExpandedRows={setExpandedRows}
          constructionClass={form.constructionClass}
          floorCount={floorCount}
          setFloorCount={setFloorCount}
          canProceed={hasRequiredFloorCount}
          blockingMessage={!hasRequiredFloorCount ? "Isi jumlah lantai jika Anda memilih perlindungan gempa bumi untuk bangunan bertingkat." : ""}
          showFloorInput={showFloorInput}
          floorFieldRef={floorFieldRef}
          onEditObject={() => setExternalView("offer-indicative")}
          onEditInsured={() => setExternalView("external-underwriting")}
          onBack={() => {
            if (embedded && entryMode === "external") {
              if (onExit) onExit();
              return;
            }
            setExternalView("");
          }}
          onPrimary={() => setShowConsentModal(true)}
          onSecondary={() => setExternalView("offer-indicative")}
          onReject={() => setShowRejectModal(true)}
          helpRequestSent={helpRequestSent}
          preparedBy={sessionName}
          operatingRecord={operatingRecord}
          transactionAuthority={transactionAuthority}
          productConfig={activeVariant}
          extensionOptions={activeGuarantees}
        />
      </>
    );
  }

  if (externalView === "payment") {
    return <ExternalPaymentPage customerName={customerName} estimatedTotal={estimatedTotalNumber} paymentMethod={paymentMethod} onSelectMethod={(value) => { setPaymentMethod(value); setPaymentStatus(""); }} onBack={() => setExternalView("offer-final")} onProceedPayment={() => setPaymentStatus(`${activeVariant.paymentSuccessMessage} Integrasi pembayaran online akan disambungkan pada tahap berikutnya.`)} paymentStatus={paymentStatus} operatingRecord={operatingRecord} isExpired={operatingRecord?.status === "Expired"} />;
  }

  if (externalView === "external-underwriting") {
    return (
      <div className="min-h-screen bg-[#F3F5F7] text-slate-900">
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 md:px-6"><div className="flex items-center gap-3"><div className="text-[18px] font-black leading-tight text-[#0A4D82]">Danantara<div className="-mt-1">Indonesia</div></div><div className="text-[16px] font-semibold text-slate-700">asuransi jasindo</div></div><button type="button" onClick={() => setExternalView("offer-indicative")} className="inline-flex items-center gap-2 rounded-[10px] border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><ArrowLeft className="h-4 w-4" />Kembali</button></div>
        </div>
        <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="space-y-5"><UnderwritingSections form={form} customerType={form.customerType} selectedCustomer={selectedCustomer} uwForm={uwForm} setUwField={setUwField} uploads={uploads} setUploads={setUploads} setEvidence={setEvidence} expandedRows={expandedRows} setExpandedRows={setExpandedRows} external={true} /></div>
            <aside className="h-fit rounded-2xl bg-[#0A4D82] p-5 text-white shadow-lg lg:sticky lg:top-24"><div className="text-[18px] font-bold">Tindakan Lanjutan</div><div className="mt-4 rounded-xl bg-white/10 p-4 text-sm leading-6 text-white/90">Setelah data tambahan lengkap, penawaran aktif akan diperbarui dan siap ditinjau sebelum pembayaran.</div>{underwritingPendingItems.length ? <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><div className="font-semibold">Yang masih perlu dilengkapi</div><div className="mt-2 space-y-2">{underwritingPendingItems.map((item) => <div key={item} className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>{item}</span></div>)}</div></div> : <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">Data tambahan sudah lengkap. Penawaran siap ditinjau.</div>}<button type="button" disabled={!canAdvanceUnderwriting} onClick={() => setExternalView("offer-final")} className={cls("mt-4 flex h-[48px] w-full items-center justify-center rounded-[12px] text-sm font-bold uppercase tracking-wide text-white shadow-sm", canAdvanceUnderwriting ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}>Pembayaran</button></aside>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F5F7] text-slate-900">
      <SentOffersModal open={showSentOffers} onClose={() => setShowSentOffers(false)} />
      <IndicationModal open={showIndicationModal} onClose={() => { setShowIndicationModal(false); setShareFeedback(""); }} onOpenIndicativeOffer={() => { setShowIndicationModal(false); setExternalView("offer-indicative"); }} onOpenFinalOffer={internalStep === 2 ? () => { setShowIndicationModal(false); setExternalView("offer-final"); } : null} customerName={customerName} shareUrl={shareUrl} onShowQrInfo={() => setQrInfoVisible((prev) => !prev)} onCopyLink={handleCopyLink} copyStatus={shareFeedback} shareLabel={activeVariant.shareLabel} shareSubject={activeVariant.shareSubject} />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0A4D82] shadow-sm">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-white"><div className="text-[15px] font-black leading-tight md:text-[18px]">Danantara<div className="-mt-1 text-[15px] md:text-[18px]">Indonesia</div></div><div className="hidden text-[15px] font-semibold text-white/95 sm:block">asuransi jasindo</div></div>
                <div className="hidden items-center gap-3 md:flex"><button type="button" onClick={() => { window.location.href = "https://esppa.asuransijasindo.co.id/"; }} className="inline-flex items-center gap-2 rounded-[8px] bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"><Home className="h-4 w-4" />Beranda</button><button type="button" onClick={() => { if (embedded && onExit) onExit(); else setScreen("catalog"); }} className="inline-flex items-center gap-2 rounded-[8px] bg-[#F5A623] px-4 py-2 text-sm font-semibold text-white shadow-sm"><Package className="h-4 w-4" />Produk</button></div>
          </div>
          <div className="relative flex items-center gap-4 text-white">
            <button type="button" onClick={() => setShowUserMenu((prev) => !prev)} className="relative inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">ID</span>{sessionName}{helpRequestSent ? <span className="absolute -right-1 -top-1 inline-flex h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" /> : null}</button>
            <UserMenu
              open={showUserMenu}
              items={[
                {
                  label: "Ruang Kerja Saya",
                  primary: true,
                  onClick: () => {
                    setShowUserMenu(false);
                    onOpenWorkspace();
                  },
                },
                {
                  label: "Antrean Internal",
                  onClick: () => {
                    setShowUserMenu(false);
                    onOpenQueue();
                  },
                },
                {
                  label: "Konfigurasi Partner",
                  onClick: () => {
                    setShowUserMenu(false);
                    onOpenPartnerConfig();
                  },
                },
              ]}
            />
          </div>
        </div>
      </header>

      {screen === "catalog" ? (
        <div className="mx-auto max-w-[1800px] px-4 py-8 md:px-6">
          <div className="text-center text-[28px] font-bold text-slate-900 md:text-[32px]">Pilihan Produk Asuransi Jasindo</div>
          <div className="mt-6 rounded-2xl bg-[#F1F3F5] p-5 md:p-6"><div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3 text-[#0A4D82]"><Shield className="h-8 w-8" /><div><div className="text-[22px] font-bold">Asuransi Kecelakaan Diri</div><div className="text-[15px] text-slate-600">Perlindungan biaya pengobatan akibat kecelakaan</div></div></div><ChevronDown className="h-6 w-6 text-slate-500" /></div><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{PERSONAL_PRODUCTS.map((item) => <ProductCard key={item.title} item={item} onClick={() => {}} />)}</div></div>
            <div className="mt-6 rounded-2xl bg-[#F1F3F5] p-5 md:p-6"><div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3 text-[#0A4D82]"><Building2 className="h-8 w-8" /><div><div className="text-[22px] font-bold">Asuransi Harta Benda</div><div className="text-[15px] text-slate-600">Perlindungan bangunan dan isi properti dengan simulasi premi dan penawaran digital.</div></div></div><ChevronDown className="h-6 w-6 text-slate-500" /></div><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{PROPERTY_PRODUCTS.map((item) => <ProductCard key={item.title} item={item} onClick={item.active ? () => { setCurrentProductVariant(item.variantKey); setScreen("property"); } : () => {}} />)}</div></div>
          <div className="mt-6 rounded-2xl bg-[#F1F3F5] p-5 md:p-6"><div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3 text-[#0A4D82]"><Car className="h-8 w-8" /><div><div className="text-[22px] font-bold">Asuransi Kendaraan Bermotor</div><div className="text-[15px] text-slate-600">Card kendaraan disiapkan sebagai placeholder.</div></div></div><ChevronDown className="h-6 w-6 text-slate-500" /></div><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{VEHICLE_PRODUCTS.map((item) => <VehicleCard key={item.title} item={item} />)}</div></div>
        </div>
      ) : (
        <div className="pb-12">
          <div className="bg-[#0A4D82] pb-10">
            <div className="mx-auto max-w-[1280px] px-4 pt-6 md:px-6">
              <button type="button" onClick={() => { if (embedded && onExit) onExit(); else setScreen("catalog"); }} className="inline-flex items-center gap-2 rounded-[10px] border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"><ArrowLeft className="h-4 w-4" />Kembali ke Produk</button>
              <div className="mt-6 text-center text-white"><div className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90">Selamat datang kembali, {sessionName}</div><h1 className="mt-4 text-[32px] font-bold tracking-tight md:text-[40px]">{activeVariant.title}</h1><p className="mx-auto mt-2 max-w-3xl text-[14px] text-white/90 md:text-[17px]">{activeVariant.heroSubtitle}</p></div>
              <div className="mx-auto mt-6 max-w-3xl rounded-2xl bg-white p-3 shadow-2xl shadow-black/15 md:mt-7 md:max-w-4xl md:p-5"><div className="rounded-2xl border border-[#D8E1EA] bg-[#F4F7FA] px-3 py-4 md:px-5 md:py-5"><div className="flex flex-col gap-5 md:flex-row md:gap-5"><StepNode step="Langkah 1" title="Simulasi Premi" subtitle={internalStep === 1 ? "Sedang diisi" : "Selesai"} active={internalStep === 1} done={internalStep > 1} icon={<Wallet className="h-4 w-4" />} /><div className="hidden h-px flex-1 self-center bg-slate-300 md:block" /><StepNode step="Langkah 2" title="Isi Data" subtitle={internalStep === 2 ? "Sedang diisi" : "Menunggu"} active={internalStep === 2} done={false} icon={<FileText className="h-4 w-4" />} /></div></div></div>
            </div>
          </div>

          {rejectionStatus ? <div className="mx-auto mt-6 max-w-[1280px] rounded-2xl border border-[#CFE0F0] bg-[#F8FBFE] px-4 py-3 text-sm text-[#0A4D82]">{rejectionStatus}</div> : null}
          {qrInfoVisible ? <div className="mx-auto mt-4 max-w-[1280px] rounded-2xl border border-[#CFE0F0] bg-white px-4 py-4 text-sm text-slate-700 shadow-sm"><div className="font-semibold text-slate-900">QR Code belum digenerate otomatis.</div><div className="mt-1">Untuk handoff ke IT, tautan yang akan diencode adalah: <span className="break-all text-[#0A4D82]">{shareUrl}</span></div></div> : null}
          {internalStep === 1 ? (
            <div className="mx-auto max-w-[1280px] px-4 md:px-6">
              <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-5">
                  <SectionCard title="Informasi Nasabah">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2"><FieldLabel label="Nama / CIF" required helpText="Ketik nama untuk mencari data CIF, atau lanjutkan sebagai nasabah baru." /><div className="relative"><TextInput value={form.identity} onChange={(value) => { setSelectedCustomer(null); setField("identity", value); }} placeholder="Masukkan nama nasabah atau kode CIF" icon={<User className="h-4 w-4" />} />{form.identity && customerSuggestions.length > 0 && !selectedCustomer ? <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg">{customerSuggestions.map((item) => <button key={item.cif} type="button" onClick={() => { setSelectedCustomer(item); setForm((prev) => ({ ...prev, identity: item.name + " - " + item.cif, customerType: item.type, phone: item.phone || prev.phone, email: item.email || prev.email })); }} className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50"><div><div className="font-semibold text-slate-900">{item.name}</div><div className="text-xs text-slate-500">{item.type}</div></div><div className="rounded-full bg-[#F8FBFE] px-3 py-1 text-xs font-semibold text-[#0A4D82]">{item.cif}</div></button>)}</div> : null}</div>{selectedCustomer ? <div className="mt-1 text-xs text-green-600">Data CIF terpilih. Anda akan melanjutkan sebagai nasabah existing.</div> : form.identity ? <div className="mt-1 text-xs text-slate-500">Nama belum cocok dengan CIF simulasi. Sistem akan memperlakukan sebagai nasabah baru.</div> : null}</div>
                      {Boolean(form.identity.trim()) && !selectedCustomer && !isDigitsOnly(form.identity.trim()) ? <div><FieldLabel label="Tipe Nasabah" required /><SelectInput value={form.customerType} onChange={(value) => setField("customerType", value)} options={CUSTOMER_TYPES} placeholder="Nasabah ini perorangan atau badan usaha?" /></div> : null}
                      <div><FieldLabel label="Nomor Handphone" required /><TextInput value={form.phone} onChange={(value) => setField("phone", value)} placeholder="08xxxxxxxxxx" icon={<Phone className="h-4 w-4" />} /></div>
                      <div><FieldLabel label="Alamat Email" required /><TextInput value={form.email} onChange={(value) => setField("email", value)} placeholder="nama@email.com" icon={<Mail className="h-4 w-4" />} type="email" /></div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Informasi Properti">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div><FieldLabel label="Jenis Bangunan" required /><SelectInput value={form.propertyType} onChange={(value) => setField("propertyType", value)} options={availablePropertyTypes} placeholder="Contoh: rumah tinggal, ruko, toko, atau kantor." /></div>
                      <div><FieldLabel label="Penggunaan bangunan" required /><SelectInput value={form.occupancy} onChange={(value) => setField("occupancy", value)} options={OCCUPANCY_MAP[form.propertyType] || []} placeholder="Contoh: hunian, kantor, toko, atau kos-kosan." /></div>
                      <div><FieldLabel label="Kelas Konstruksi" required /><div className="space-y-2"><SelectInput value={form.constructionClass} onChange={(value) => setField("constructionClass", value)} options={CONSTRUCTION_CLASSES} placeholder="Pilih sesuai material utama bangunan." /><button type="button" onClick={() => setShowConstructionGuide((prev) => !prev)} className="text-sm font-medium text-[#0A4D82] hover:underline">{showConstructionGuide ? "Sembunyikan panduan kelas konstruksi" : "Lihat panduan kelas konstruksi"}</button>{showConstructionGuide ? <div className="grid gap-2 rounded-xl border border-[#D5DDE6] bg-[#F8FBFE] p-3">{CONSTRUCTION_GUIDE.map((item) => <div key={item.title} className="rounded-lg bg-white p-3 ring-1 ring-slate-200"><div className="text-[13px] font-semibold text-[#0A4D82]">{item.title}</div><div className="mt-1 text-[12px] leading-5 text-slate-600">{item.desc}</div></div>)}</div> : null}</div></div>
                      <div><FieldLabel label="Alamat / Lokasi Properti" required /><TextInput value={form.locationSearch} onChange={(value) => setField("locationSearch", value)} placeholder="Ketik alamat, nama jalan, atau nama gedung" icon={<Search className="h-4 w-4" />} /><div className="mt-2 flex flex-wrap gap-2.5"><button type="button" onClick={() => { setField("locationSearch", "Lokasi GPS tersimulasi - Jl. Sudirman Kav. 44, Jakarta Selatan"); setEvidence((prev) => ({ ...prev, location: createLocationEvidence({ declaredAddress: "Jl. Sudirman Kav. 44, Jakarta Selatan", source: "gps" }) })); }} className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"><MapPin className="h-4 w-4" />Ambil Lokasi Sekarang</button><button type="button" onClick={() => { setField("locationSearch", "Pin peta tersimulasi - Ruko Blok A3, Jl. Boulevard Raya, Kelapa Gading"); setEvidence((prev) => ({ ...prev, location: createLocationEvidence({ declaredAddress: "Ruko Blok A3, Jl. Boulevard Raya, Kelapa Gading", source: "map" }) })); }} className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"><MapPin className="h-4 w-4" />Pilih di Peta</button></div></div>
                    </div>
                    <div className="mt-4 rounded-xl border border-[#D5DDE6] bg-[#FAFBFC] p-4"><div className="flex items-center justify-between gap-3"><div className="text-[15px] font-bold text-slate-900">Rincian Properti</div><button type="button" onClick={() => setObjectRows((prev) => prev.concat({ id: "obj-" + Date.now(), type: "", amount: "", note: "" }))} className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"><Plus className="h-4 w-4" />Tambah Objek</button></div><div className="mt-3 space-y-2.5">{objectRows.map((row) => <div key={row.id} className="rounded-xl border border-slate-200 bg-white p-3"><div className="grid gap-2.5 lg:grid-cols-[180px_minmax(0,1fr)_minmax(0,1.2fr)_40px] lg:items-center"><SelectInput value={row.type} onChange={(value) => updateObjectRow(row.id, { type: value })} options={OBJECT_TYPES} placeholder="Objek apa yang ingin dilindungi?" /><CurrencyInput value={row.amount} onChange={(value) => updateObjectRow(row.id, { amount: value })} placeholder="Berapa nilai yang ingin dilindungi untuk objek ini?" /><TextInput value={row.note} onChange={(value) => updateObjectRow(row.id, { note: value })} placeholder={shortObjectLabel(row.type)} /><button type="button" onClick={() => removeObjectRow(row.id)} className="inline-flex h-[44px] items-center justify-center rounded-[10px] border border-slate-300 text-slate-500 hover:bg-slate-50" title="Hapus objek"><Trash2 className="h-4 w-4" /></button></div></div>)}</div><div className="mt-3 rounded-[10px] bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200"><div className="flex flex-col gap-1.5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>Total Nilai yang Dilindungi</span><span className="break-words text-left text-[18px] font-bold text-[#E8A436] sm:text-right">Rp {formatRupiah(totalValue)}</span></div></div></div>
                  </SectionCard>
                  <div className="flex justify-stretch sm:justify-end"><button type="button" onClick={() => setQuoted(true)} className="inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#F5A623] px-5 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:brightness-105 sm:w-auto"><Wallet className="h-4 w-4" />Cek Premi</button></div>
                  {quoted ? <div ref={resultsRef} className="space-y-5"><SectionCard title="Rincian Jaminan" subtitle="Klik setiap baris untuk melihat penjelasan detailnya.">{showFloorInput ? <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><div className="font-semibold">Risiko Gempa Bumi membutuhkan data tambahan.</div><div className="mt-1">Isi jumlah lantai pada kartu Risiko Gempa Bumi yang terbuka di bawah ini.</div></div> : null}<div className="space-y-5"><div><div className="text-[18px] font-bold tracking-tight text-slate-900">{activeVariant.insuredRisksSectionTitle}</div><div className="mt-3"><AccordionRiskRow title={activeVariant.primaryCoverageTitle} icon={Flame} premium={shouldShowQuotedPricing ? "Rp " + formatRupiah(basePremiumNumber) : "-"} detail={activeVariant.primaryCoverageDescription} deductible={form.constructionClass === "Kelas 1" ? activeVariant.primaryCoverageDeductibleClassOne : activeVariant.primaryCoverageDeductibleOther} alwaysIncluded={true} expanded={expandedRows.fire} onToggleExpand={() => setExpandedRows((prev) => ({ ...prev, fire: !prev.fire }))} /></div></div>{activeVariant.importantExclusions.length ? <div><div className="text-[18px] font-bold tracking-tight text-slate-900">{activeVariant.exclusionsSectionTitle}</div><div className="mt-1 text-sm leading-6 text-slate-500">{activeVariant.exclusionsSectionSubtitle}</div><div className="mt-3 rounded-xl border border-[#C9D5E3] bg-[#F8FBFE]"><button type="button" onClick={() => setExpandedRows((prev) => ({ ...prev, exclusions: !prev.exclusions }))} className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left"><div className="text-[15px] font-semibold text-[#0A4D82]">Ringkasan pengecualian utama</div><ChevronDown className={cls("h-4 w-4 shrink-0 text-slate-500 transition", expandedRows.exclusions && "rotate-180")} /></button>{expandedRows.exclusions ? <div className="border-t border-[#D6E0EA] px-3.5 py-3"><div className="space-y-2">{activeVariant.importantExclusions.map((item) => <div key={item} className="flex items-start gap-2 text-[13px] leading-5 text-slate-700"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /><span>{item}</span></div>)}</div></div> : null}</div></div> : null}<div><div className="text-[18px] font-bold tracking-tight text-slate-900">Perluasan Jaminan</div><div className="mt-3 space-y-2.5">{activeGuarantees.map((item) => { const checked = selectedGuarantees[item.key]; const premiumValue = Math.round(totalValue * item.rate); const deductibleValue = item.key === "earthquake" ? "2,5% dari Rp " + formatRupiah(totalValue) : item.deductible; return <AccordionRiskRow key={item.key} title={item.title} icon={item.icon} premium={shouldShowQuotedPricing ? "Rp " + formatRupiah(premiumValue) : "-"} detail={item.detail} deductible={deductibleValue} checked={checked} onToggleChecked={() => setSelectedGuarantees((prev) => ({ ...prev, [item.key]: !prev[item.key] }))} expanded={expandedRows[item.key]} onToggleExpand={() => setExpandedRows((prev) => ({ ...prev, [item.key]: !prev[item.key] }))} extra={item.key === "earthquake" && checked && isFloorRelevant(form.propertyType, form.occupancy) ? <div ref={floorFieldRef} className="max-w-sm rounded-xl border border-amber-200 bg-white p-3"><FieldLabel label="Jumlah lantai bangunan yang diasuransikan" required helpText="Diisi hanya bila objek bertingkat dan gempa bumi dipilih." /><TextInput value={floorCount} onChange={(value) => setFloorCount(onlyDigits(value))} placeholder="Masukkan jumlah lantai" icon={<Building2 className="h-4 w-4" />} /></div> : null} />; })}</div></div></div></SectionCard></div> : null}
                </div>
                <SummarySidebarShell title="Ringkasan">
                  <div className="border-t border-white/15 pt-3">
                    <SummaryRow label={selectedCustomer || isDigitsOnly(form.identity.trim()) ? "Kode CIF / Nama" : "Nama Nasabah"} value={form.identity || "-"} />
                    <SummaryRow label="Jenis Bangunan" value={form.propertyType} />
                    <SummaryRow label="Penggunaan bangunan" value={form.occupancy} />
                    <SummaryRow label="Kelas Konstruksi" value={form.constructionClass} />
                  </div>
                  <div className="border-t border-white/15 pt-3">
                    <SummaryRow label={activeVariant.primaryCoveragePremiumLabel} value={pricingSummaryValue} />
                    {extensionPremiumSummaryValue ? <SummaryRow label="Premi Tambahan Perlindungan" value={extensionPremiumSummaryValue} /> : null}
                    <SummaryRow label="Biaya Materai" value={stampDutySummaryValue} />
                  </div>
                  <SummarySidebarAlert items={stepOnePendingItems} successText="Data inti sudah cukup untuk lanjut ke peninjauan lanjutan." />
                  <div className="space-y-2">
                    <button type="button" disabled={!canAdvanceInternalStepOne} onClick={() => { setInternalStep(2); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={cls("flex h-[46px] w-full items-center justify-center rounded-[12px] text-sm font-bold uppercase tracking-wide text-white shadow-sm", canAdvanceInternalStepOne ? "bg-slate-300 text-white hover:brightness-105" : "cursor-not-allowed bg-slate-400")}>Isi Data</button>
                    <button type="button" onClick={() => setShowIndicationModal(true)} className="flex h-[46px] w-full items-center justify-center rounded-[12px] border border-white/20 bg-[#0A4D82] text-sm font-bold uppercase tracking-wide text-white shadow-sm ring-1 ring-white/20 hover:brightness-110">Kirim Indikasi</button>
                  </div>
                </SummarySidebarShell>
              </div>
            </div>
          ) : (
                <div className="mx-auto mt-6 max-w-[1280px] px-4 md:px-6"><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]"><div className="space-y-5"><UnderwritingSections form={form} customerType={form.customerType} selectedCustomer={selectedCustomer} uwForm={uwForm} setUwField={setUwField} uploads={uploads} setUploads={setUploads} setEvidence={setEvidence} expandedRows={expandedRows} setExpandedRows={setExpandedRows} /></div><SummarySidebarShell title="Ringkasan">
              <div className="border-t border-white/15 pt-3">
                <SummaryRow label="Nasabah" value={customerName || "-"} />
                <SummaryRow label="Jenis Bangunan" value={form.propertyType} />
                <SummaryRow label="Penggunaan bangunan" value={form.occupancy} />
                <SummaryRow label="Nilai yang Dilindungi" value={"Rp " + formatRupiah(totalValue)} />
              </div>
              <div className="border-t border-white/15 pt-3">
                <SummaryRow label={form.customerType === "Badan Usaha" ? "NPWP" : "NIK"} value={uwForm.idNumber || "-"} />
                <SummaryRow label="Kontak di Lokasi" value={uwForm.picName || "-"} />
                <SummaryRow label="Mulai perlindungan" value={uwForm.coverageStartDate || "-"} />
                <SummaryRow label="Akhir perlindungan" value={calculateCoverageEnd(uwForm.coverageStartDate) || "-"} />
              </div>
              <SummarySidebarAlert items={underwritingPendingItems} successText="Data tambahan lengkap. Sales bisa lanjut mengirim penawaran lanjutan." />
              <div className="space-y-2">
                <button type="button" disabled={!canAdvanceUnderwriting} onClick={() => setShowIndicationModal(true)} className={cls("flex h-[46px] w-full items-center justify-center rounded-[12px] text-sm font-bold uppercase tracking-wide text-white shadow-sm", canAdvanceUnderwriting ? "bg-slate-300 text-white hover:brightness-105" : "cursor-not-allowed bg-slate-400")}>Kirim Penawaran</button>
                <button type="button" disabled={!canAdvanceUnderwriting} onClick={() => setExternalView("offer-final")} className={cls("flex h-[46px] w-full items-center justify-center rounded-[12px] border border-white/20 text-sm font-bold uppercase tracking-wide text-white shadow-sm ring-1 ring-white/20", canAdvanceUnderwriting ? "bg-[#0A4D82] hover:brightness-110" : "cursor-not-allowed bg-slate-500/70")}>Pembayaran</button>
                <button type="button" onClick={() => setInternalStep(1)} className="flex h-11 w-full items-center justify-center gap-2 rounded-[12px] border border-white/20 bg-[#0A4D82] text-sm font-medium text-white hover:bg-white/15"><ArrowLeft className="h-4 w-4" />Kembali</button>
              </div>
            </SummarySidebarShell></div></div>
          )}
        </div>
      )}
    </div>
  );
}










