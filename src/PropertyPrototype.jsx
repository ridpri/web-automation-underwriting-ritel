import React, { useEffect, useMemo, useRef, useState } from "react";
import { createEmptyDocumentCheck, createLocationEvidence, createPhotoEvidence, createTransactionAuthority, summarizeFraudSignals } from "./platform/securityControls.js";
import {
  AlertTriangle,
  Atom,
  ArrowLeft,
  Bell,
  Building2,
  Camera,
  CameraOff,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  FileText,
  Flame,
  Home,
  Mail,
  MapPin,
  Package,
  Plane,
  Phone,
  Plus,
  Search,
  Shield,
  Sparkles,
  Trash2,
  User,
  Wallet,
  Waves,
  X,
  Zap,
  Car,
} from "lucide-react";
import { canProceedToPaymentFromOperating, paymentBlockMessage } from "./operatingLayer.js";
import { getPropertyExtensions, getPropertyVariant } from "./propertyProductConfig.js";
import { CustomerDataJourneyShell } from "./components/CustomerDataJourneyShell.jsx";
import { OfferShareModal } from "./components/OfferShareModal.jsx";

const PROPERTY_TYPES = ["Rumah Tinggal", "Ruko", "Toko", "Kantor", "Kos-kosan"];
const CONSTRUCTION_CLASSES = ["Kelas 1", "Kelas 2", "Kelas 3"];
const OBJECT_TYPES = ["Bangunan", "Inventaris / Isi", "Stok", "Mesin / Peralatan"];
const CUSTOMER_TYPES = ["Nasabah Perorangan", "Badan Usaha"];
const OWNERSHIP_TYPES = ["Milik Sendiri", "Sewa", "Kontrak", "Lainnya"];
const PROTECTION_OPTIONS = ["APAR", "Hydrant", "Sprinkler"];
const CLAIM_HISTORY_OPTIONS = ["Tidak Ada", "Ada 1 Klaim", "Ada Lebih dari 1 Klaim"];
const PAYMENT_OPTIONS = ["Virtual Account", "Kartu Kredit", "Transfer Bank"];
const STOCK_TYPE_OPTIONS = [
  { label: "Sembako", risk: "Tidak mudah terbakar" },
  { label: "Minuman Kemasan", risk: "Tidak mudah terbakar" },
  { label: "Bahan Bangunan", risk: "Tidak mudah terbakar" },
  { label: "Sparepart / Logam", risk: "Tidak mudah terbakar" },
  { label: "Elektronik", risk: "Tidak mudah terbakar" },
  { label: "Obat / Kosmetik", risk: "Tidak mudah terbakar" },
  { label: "Pakaian / Tekstil", risk: "Mudah terbakar" },
  { label: "Kertas / Buku", risk: "Mudah terbakar" },
  { label: "Furniture / Kayu", risk: "Mudah terbakar" },
  { label: "Plastik / Karet", risk: "Mudah terbakar" },
];
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
  { id: "OFR-001", name: "Sony Laksono", product: "Asuransi Properti - Kebakaran", status: "Dibuka, menunggu jawaban" },
  { id: "OFR-002", name: "PT Maju Sentosa", product: "Asuransi Properti - Kebakaran", status: "Sudah jawab, minta revisi" },
  { id: "OFR-003", name: "Siti Rahma", product: "Asuransi Properti - Kebakaran", status: "Sudah setuju, menunggu bayar" },
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

const BASIC_COVERAGE_HIGHLIGHTS = [
  { title: "Kebakaran", icon: Flame },
  { title: "Petir", icon: Zap },
  { title: "Ledakan", icon: Sparkles },
  { title: "Kejatuhan Pesawat", icon: Plane },
  { title: "Asap", icon: Waves },
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
    title: "Asuransi Properti - Kebakaran",
    category: "Harta Benda",
    subtitle: "Perlindungan untuk bangunan dan isi properti terhadap risiko kebakaran, dengan tambahan perlindungan yang bisa dipilih sesuai kebutuhan.",
    image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80",
    active: true,
    variantKey: "property-safe",
  },
  {
    title: "Asuransi Properti All Risk",
    category: "Harta Benda",
    subtitle: "Perlindungan lebih luas untuk bangunan dan isi properti, mencakup kerusakan fisik lebih lengkap dan perluasan yang bisa disesuaikan kebutuhan Anda.",
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
  const coverageLimit = endOfDay(startDate);
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

function createReferralCode(senderName, transactionId) {
  const senderToken = String(senderName || "jasindo")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
  const transactionToken = String(transactionId || "draft").replace(/[^A-Za-z0-9]/g, "").slice(-8).toLowerCase();
  return [senderToken || "jasindo", transactionToken || "draft"].filter(Boolean).join("-");
}

function getShareUrl(view, params = {}) {
  if (typeof window === "undefined") return "about:blank";
  const url = new URL(window.location.href);
  url.searchParams.set("view", view || "offer-indicative");
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  return url.toString();
}

function encodeShareSnapshot(payload) {
  if (!payload) return "";
  try {
    return encodeURIComponent(JSON.stringify(payload));
  } catch {
    return "";
  }
}

function decodeShareSnapshot(value) {
  if (!value) return null;
  try {
    return JSON.parse(decodeURIComponent(value));
  } catch {
    return null;
  }
}

function readShareContextFromUrl() {
  if (typeof window === "undefined") return { view: "", viewer: "", referral: "", sender: "", customer: "", offer: null };
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view") || "";
  const viewer = params.get("viewer") || "";
  const referral = params.get("referral") || "";
  const sender = params.get("sender") || "";
  const customer = params.get("customer") || "";
  const offer = decodeShareSnapshot(params.get("offer") || "");
  return { view, viewer, referral, sender, customer, offer };
}

function openShareWindow(targetUrl) {
  if (typeof window === "undefined") return;
  window.open(targetUrl, "_blank", "noopener,noreferrer");
}

function replaceViewerModeInUrl(viewerMode) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (viewerMode) url.searchParams.set("viewer", viewerMode);
  window.history.replaceState({}, "", url.toString());
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
  return "Jenis Objek";
}

function requiresObjectNote(type) {
  return false;
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
  return formatDateInput(date);
}

function SectionCard({ title, subtitle, children, action, headerAlign = "left", className = "", compactHeader = false }) {
  return (
    <section
      className={cls(
        compactHeader
          ? "rounded-2xl border border-[#D8E1EA] bg-white px-4 py-3.5 md:px-5"
          : "rounded-2xl border border-[#D8E1EA] bg-white p-4 shadow-sm md:p-5",
        className,
      )}
    >
      <div
        className={cls(
          "flex items-start gap-4",
          action ? "justify-between" : headerAlign === "center" ? "justify-center" : "justify-start",
        )}
      >
        <div className={headerAlign === "center" ? "text-center" : ""}>
          <div className={cls(compactHeader ? "text-[15px] font-semibold" : "text-[18px] font-bold", "text-slate-900")}>{title}</div>
          {subtitle ? <div className={cls(compactHeader ? "mt-1 text-[13px] leading-5" : "mt-1 text-sm", "text-slate-500")}>{subtitle}</div> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      <div className={compactHeader ? "mt-3" : "mt-4"}>{children}</div>
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
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function MultiSelectInput({ value = [], onChange, options, noneOption = "Tidak Ada" }) {
  const selectedValues = Array.isArray(value) ? value : [];
  const toggleOption = (option) => {
    const isSelected = selectedValues.includes(option);
    const nextValues = selectedValues.filter((item) => item !== noneOption);
    if (isSelected) {
      onChange(nextValues.filter((item) => item !== option));
      return;
    }
    onChange(nextValues.concat(option));
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={cls(
                "flex min-h-[44px] items-center justify-between rounded-[12px] border px-4 py-2.5 text-sm font-medium transition",
                isSelected ? "border-[#0A4D82] bg-[#EEF6FD] text-[#0A4D82]" : "border-[#D5DDE6] bg-white text-slate-700 hover:border-[#A9C7E3] hover:bg-[#F8FBFE]",
              )}
            >
              <span>{option}</span>
              <span className={cls("ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", isSelected ? "border-[#0A4D82] bg-[#0A4D82]" : "border-slate-300 bg-white")}>
                {isSelected ? <CheckCircle2 className="h-3.5 w-3.5 text-white" /> : null}
              </span>
            </button>
          );
        })}
      </div>
      {selectedValues.length ? (
        <div className="rounded-xl border border-[#D8E1EA] bg-white px-3 py-2 text-sm text-slate-600">
          Dipilih: <span className="font-medium text-slate-900">{selectedValues.join(", ")}</span>
        </div>
      ) : null}
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

function StepNode({ step, title, subtitle, active, done, icon, onClick }) {
  const content = (
    <div className="relative flex flex-1 flex-col items-center text-center">
      <div className={cls("flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white", done ? "border-green-600 text-green-600" : active ? "border-[#0A4D82] text-[#0A4D82]" : "border-slate-300 text-slate-300")}>{done ? <CheckCircle2 className="h-4 w-4" /> : icon}</div>
      <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{step}</div>
      <div className={cls("mt-0.5 text-[14px] font-bold", active || done ? "text-slate-900" : "text-slate-500")}>{title}</div>
      <div className={cls("mt-0.5 text-[12px]", active ? "text-[#E8A436]" : done ? "text-green-600" : "text-slate-400")}>{subtitle}</div>
    </div>
  );
  if (!onClick) return content;
  return <button type="button" onClick={onClick} className="relative flex flex-1 justify-center">{content}</button>;
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
    <aside className="h-fit w-full self-start rounded-2xl bg-[#0A4D82] p-4 text-white shadow-lg lg:w-[320px] lg:sticky lg:top-28">
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

  if (!successText) return null;

  return <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-[12px] leading-[1.45] text-green-800">{successText}</div>;
}

function OfferSummarySection({ title, action, children }) {
  return (
    <div className="rounded-[22px] border border-[#D8E1EA] bg-[linear-gradient(180deg,#FFFFFF_0%,#FBFDFF_100%)] px-4 py-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-shadow duration-200 hover:shadow-[0_16px_34px_rgba(15,23,42,0.07)] md:px-5">
      <div className="flex items-center justify-between gap-3 border-b border-[#EEF3F8] pb-3">
        <div className="text-[15px] font-semibold tracking-tight text-slate-900">{title}</div>
        {action ? action : null}
      </div>
      <div className="mt-3.5">{children}</div>
    </div>
  );
}

function OfferSummaryGrid({ children }) {
  return <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">{children}</div>;
}

function OfferSummaryField({ label, value, description }) {
  return (
    <div>
      <div className="text-[14px] font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-[15px] font-semibold leading-[1.4] text-slate-900">{value}</div>
      {description ? <div className="mt-1 text-[14px] leading-[1.4] text-slate-600">{description}</div> : null}
    </div>
  );
}

function SummaryEditButton({ onClick }) {
  if (!onClick) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center rounded-[10px] border border-[#D5DDE6] bg-white px-3.5 text-sm font-medium text-[#0A4D82] shadow-sm transition hover:border-[#BFD4E8] hover:bg-[#F8FBFE] hover:shadow-[0_8px_18px_rgba(10,77,130,0.08)]"
    >
      Edit
    </button>
  );
}

function SummaryGuaranteeItem({ title, icon: Icon = Shield, compact = false }) {
  return (
    <div className={cls("flex items-start", compact ? "gap-2" : "gap-2.5")}>
      <div className={cls("mt-0.5 flex shrink-0 items-center justify-center border border-[#D6E0EA] bg-[#F8FBFE] text-[#0A4D82]", compact ? "h-6 w-6 rounded-md" : "h-7 w-7 rounded-lg")}>
        <Icon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </div>
      <div className={cls("min-w-0 text-slate-900", compact ? "text-[14px] leading-[1.35]" : "text-[15px] leading-[1.45]")}>{title}</div>
    </div>
  );
}

function OfferSummaryKeyValue({ label, value }) {
  const normalizedLabel = String(label || "").replace(/:\s*$/, "");
  const shouldEmphasizeValue = ["Objek Pertanggungan", "Kelas Konstruksi"].includes(normalizedLabel);
  return (
    <div className={cls("border-t border-slate-100 first:border-t-0 first:pt-0 last:pb-0", shouldEmphasizeValue ? "py-4" : "py-3")}>
      <div className="space-y-1.5 md:grid md:grid-cols-[220px_14px_minmax(0,1fr)] md:gap-y-0 md:gap-x-2 md:space-y-0">
      <div className="text-[13px] font-medium leading-[1.45] text-slate-500">
        {normalizedLabel}
        <span className="md:hidden">:</span>
      </div>
      <div className="hidden text-[13px] font-medium leading-[1.45] text-slate-400 md:block">:</div>
      <div
        className={cls(
          "text-[15px] font-medium leading-[1.6] text-slate-900",
          shouldEmphasizeValue && "leading-[1.75]",
        )}
      >
        {value}
      </div>
      </div>
    </div>
  );
}

function PremiumPriceHero({ label, value, tooltipText }) {
  return (
    <div className="rounded-2xl border border-[#D8E1EA] bg-[linear-gradient(180deg,#FFFFFF_0%,#F4F8FD_100%)] px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] md:px-7 md:py-6">
      <div className="mx-auto flex max-w-[460px] flex-col items-center text-center">
        {label ? <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</div> : null}
        <div className={cls("flex items-center justify-center gap-2", label ? "mt-2" : "")}>
          <div className="text-[24px] font-bold tracking-tight text-[#0A4D82] md:text-[28px]">{value}</div>
          {tooltipText ? <TooltipDot text={tooltipText} /> : null}
        </div>
      </div>
    </div>
  );
}

function PremiumBreakdown({ children }) {
  return (
    <div className="mt-4 border-t border-slate-100 pt-3">
      <div className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Rincian</div>
      <div className="mt-1">{children}</div>
    </div>
  );
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
  return ["tanpa biaya sendiri", "tidak dikenakan risiko sendiri", "tidak ada risiko sendiri"].some((token) =>
    String(value || "").trim().toLowerCase().startsWith(token)
  );
}

function ProposalAccordion({ title, subtitle, open, onToggle, children, action }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#D8E1EA] bg-white">
      <div
        role="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50/80"
      >
        <div>
          <div className="text-[15px] font-semibold text-slate-900">{title}</div>
          {subtitle ? <div className="mt-1 text-sm text-slate-500">{subtitle}</div> : null}
        </div>
        <div className="flex items-center gap-2">
          {action ? <span onClick={(event) => event.stopPropagation()}>{action}</span> : null}
          <ChevronDown className={cls("h-4 w-4 shrink-0 text-slate-500 transition", open && "rotate-180")} />
        </div>
      </div>
      {open ? <div className="border-t border-slate-100 px-5 py-4">{children}</div> : null}
    </div>
  );
}

function TooltipDot({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 120);
        }}
        aria-label="Lihat penjelasan estimasi premi"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#BFD0E0] bg-white text-[10px] font-semibold text-[#5E7BA6]"
      >
        !
      </button>
      {open ? (
        <span className="absolute left-0 top-[calc(100%+8px)] z-20 w-[240px] rounded-xl bg-white px-3 py-2 text-left text-[12px] font-medium leading-5 text-slate-700 shadow-[0_18px_40px_rgba(15,23,42,0.18)] ring-1 ring-slate-200">
          {text}
        </span>
      ) : null}
    </span>
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
    <OfferShareModal
      open={open}
      onClose={onClose}
      recipientName={recipientName}
      shareLabel={shareLabel}
      productIcon={<Home className="h-5 w-5" />}
      onOpenIndicativeOffer={onOpenIndicativeOffer}
      onOpenFinalOffer={onOpenFinalOffer}
      onOpenWhatsApp={() => openShareWindow("https://wa.me/?text=" + shareMessage)}
      onOpenEmail={() => openShareWindow("mailto:?subject=" + encodeURIComponent(shareSubject) + "&body=" + shareMessage)}
      onCopyLink={onCopyLink}
      onShowQrInfo={onShowQrInfo}
      feedback={copyStatus}
    />
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
  const canToggleChecked = typeof onToggleChecked === "function";
  return (
    <div className="rounded-xl border border-[#C9D5E3] bg-[#F8FBFE]">
      <div className="flex items-center gap-3 px-3.5 py-3">
        {alwaysIncluded ? <div className="flex h-5 w-5 items-center justify-center rounded border border-[#0A4D82] bg-[#0A4D82]/10 text-[#0A4D82]"><Icon className="h-3.5 w-3.5" /></div> : <input type="checkbox" checked={checked} onChange={onToggleChecked} disabled={!canToggleChecked} className="h-5 w-5 rounded border-slate-300 text-[#0A4D82] focus:ring-[#0A4D82] disabled:cursor-not-allowed disabled:opacity-50" />}
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
    <div className="rounded-2xl border border-[#D8E1EA] bg-[linear-gradient(180deg,#FFFFFF_0%,#FBFDFF_100%)] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-shadow duration-200 hover:shadow-[0_16px_30px_rgba(15,23,42,0.07)]">
      <div className="flex items-start justify-between gap-3"><div><div className="text-[15px] font-semibold tracking-tight text-slate-900">{title}</div><div className="mt-1 text-sm text-slate-500">{description}</div></div><Camera className="h-5 w-5 text-slate-400" /></div>
      {image ? <div className="mt-3 overflow-hidden rounded-2xl border border-[#D8E1EA] bg-white shadow-[0_10px_22px_rgba(15,23,42,0.08)]"><img src={image} alt={title} className="h-40 w-full object-cover" /></div> : isCameraOn ? <div className="mt-3 overflow-hidden rounded-2xl border border-[#BFD4E8] bg-slate-900 shadow-[0_10px_22px_rgba(15,23,42,0.12)]"><video ref={videoRef} className="h-40 w-full object-cover" muted playsInline /></div> : <button type="button" onClick={showGalleryFallback ? () => fileInputRef.current && fileInputRef.current.click() : startCamera} className="mt-3 flex h-40 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#C9D6E4] bg-[linear-gradient(180deg,#FAFCFF_0%,#F4F8FC_100%)] px-4 text-center transition hover:border-[#AFC7DD] hover:bg-[#F7FAFD]"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[#DCE6F0]"><Camera className="h-5 w-5 text-[#0A4D82]" /></span><span className="mt-3 text-sm font-medium text-slate-700">{showGalleryFallback ? "Unggah foto dari galeri" : "Ambil foto properti"}</span><span className="mt-1 text-xs leading-5 text-slate-500">{showGalleryFallback ? "Ketuk untuk memilih gambar." : "Ketuk area ini untuk membuka kamera."}</span></button>}
      {errorText ? <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">{errorText}</div> : null}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      <div className="mt-3 flex flex-wrap gap-2">
        {isCameraOn ? <><button type="button" onClick={capturePhoto} className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#0A4D82] px-4 text-sm font-medium text-white hover:brightness-105"><Camera className="h-4 w-4" />Ambil Foto</button><button type="button" onClick={stopCamera} className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"><CameraOff className="h-4 w-4" />Tutup Kamera</button></> : null}
        {image ? <button type="button" onClick={() => onCapture("")} className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"><Trash2 className="h-4 w-4" />Hapus Foto</button> : null}
      </div>
    </div>
  );
}

function UnderwritingSections({
  form,
  customerType,
  selectedCustomer,
  objectRows,
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
  const coverageDateFieldRef = useRef(null);
  const insuredName = selectedCustomer ? selectedCustomer.name : form.identity;
  const coverageEndDate = calculateCoverageEnd(uwForm.coverageStartDate);
  const coverageStartDisplay = uwForm.coverageStartDate ? formatDisplayDate(new Date(`${uwForm.coverageStartDate}T00:00:00`)) : "-";
  const coverageEndDisplay = coverageEndDate ? formatDisplayDate(new Date(`${coverageEndDate}T00:00:00`)) : "-";
  const coveragePeriodDisplay = uwForm.coverageStartDate ? `${coverageStartDisplay} - ${coverageEndDisplay}` : "Pilih tanggal mulai pertanggungan";
  const hasStockObject = objectRows.some((row) => row.type === "Stok");
  const selectedStockTypeMeta = STOCK_TYPE_OPTIONS.find((item) => item.label === uwForm.stockType);
  const customerSectionTitle = "Informasi Nasabah Lanjutan";
  const propertySectionTitle = "Informasi Properti Lanjutan";
  const photoSectionTitle = "Foto Properti Lanjutan";
  const customerSectionSubtitle = undefined;
  const propertySectionSubtitle = undefined;
  const photoSectionSubtitle = external
    ? undefined
    : "Wajib diisi oleh petugas internal.";
  const externalSectionClassName = external ? "border-[#CFE0F0] bg-[#F8FBFE] shadow-[0_12px_30px_rgba(15,23,42,0.06)]" : "";

  return (
    <div className="space-y-5">
      <SectionCard title={customerSectionTitle} subtitle={customerSectionSubtitle} className={externalSectionClassName} compactHeader={external}>
        <div className="grid gap-4 md:grid-cols-2">
          <div><FieldLabel label={identityLabel} /><TextInput value={uwForm.idNumber} onChange={(value) => setUwField("idNumber", onlyDigits(value))} placeholder={customerType === "Badan Usaha" ? "Masukkan NPWP" : "Masukkan NIK"} icon={<User className="h-4 w-4" />} /></div>
          {customerType === "Badan Usaha" ? <div><FieldLabel label="Kontak di Lokasi" required /><div className="space-y-2"><TextInput value={uwForm.picName} onChange={(value) => setUwField("picName", value)} placeholder={insuredName || "Nama kontak yang bisa dihubungi di lokasi"} icon={<User className="h-4 w-4" />} /><label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={uwForm.sameAsInsured} onChange={(event) => setUwField("sameAsInsured", event.target.checked)} />Sama dengan pemegang polis</label></div></div> : null}
          <div className="md:col-span-2">
            <FieldLabel label="Alamat Tertanggung" required />
            <div className="space-y-2.5">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={Boolean(uwForm.sameAsPropertyAddress)}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setUwField("sameAsPropertyAddress", checked);
                    if (checked) setUwField("insuredAddress", form.locationSearch || "");
                  }}
                />
                Sama dengan alamat properti
              </label>
              {!uwForm.sameAsPropertyAddress ? (
                <>
                  <TextInput
                    value={uwForm.insuredAddress || ""}
                    onChange={(value) => {
                      if (uwForm.sameAsPropertyAddress) setUwField("sameAsPropertyAddress", false);
                      setUwField("insuredAddress", value);
                    }}
                    placeholder="Ketik alamat tertanggung"
                    icon={<MapPin className="h-4 w-4" />}
                  />
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        const gpsAddress = "Lokasi tertanggung tersimulasi - Jl. Sudirman Kav. 44, Jakarta Selatan";
                        setUwField("sameAsPropertyAddress", false);
                        setUwField("insuredAddress", gpsAddress);
                      }}
                      className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <MapPin className="h-4 w-4" />
                      Ambil Lokasi Sekarang
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const mapAddress = "Pin lokasi tertanggung tersimulasi - Ruko Blok A3, Jl. Boulevard Raya, Kelapa Gading";
                        setUwField("sameAsPropertyAddress", false);
                        setUwField("insuredAddress", mapAddress);
                      }}
                      className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <MapPin className="h-4 w-4" />
                      Pilih di Peta
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title={propertySectionTitle} subtitle={propertySectionSubtitle} className={externalSectionClassName} compactHeader={external}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <FieldLabel label="Perlindungan kebakaran yang tersedia" required />
            <div className="space-y-3">
              <SelectInput
                value={uwForm.fireProtectionChoice}
                onChange={(value) => {
                  setUwField("fireProtectionChoice", value);
                  if (value !== "Ada") setUwField("fireProtection", []);
                }}
                options={["Ada", "Tidak Ada"]}
                placeholder="Pilih apakah tersedia perlindungan kebakaran"
              />
              {uwForm.fireProtectionChoice === "Ada" ? (
                <div className="rounded-xl border border-[#D8E1EA] bg-[#F8FBFE] p-3">
                  <div className="mb-3 text-sm font-medium text-slate-700">Pilih fasilitas yang tersedia</div>
                  <MultiSelectInput value={uwForm.fireProtection} onChange={(value) => setUwField("fireProtection", value)} options={PROTECTION_OPTIONS} />
                </div>
              ) : null}
            </div>
          </div>
          <div>
            <FieldLabel label="Jangka Waktu Pertanggungan" required />
            <input
              ref={coverageDateFieldRef}
              type="date"
              value={uwForm.coverageStartDate}
              onChange={(event) => setUwField("coverageStartDate", event.target.value)}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => {
                if (coverageDateFieldRef.current?.showPicker) {
                  coverageDateFieldRef.current.showPicker();
                } else if (coverageDateFieldRef.current) {
                  coverageDateFieldRef.current.focus();
                  coverageDateFieldRef.current.click();
                }
              }}
              className={cls(
                "flex min-h-[48px] w-full items-center justify-between gap-3 rounded-[12px] border border-[#D5DDE6] bg-white px-4 py-3 text-left text-[14px] transition hover:border-[#A9C7E3] hover:bg-[#F8FBFE]",
                uwForm.coverageStartDate ? "text-slate-900 shadow-[0_8px_18px_rgba(15,23,42,0.04)]" : "text-slate-400",
              )}
            >
              <span className={cls("block", uwForm.coverageStartDate ? "font-medium text-slate-900" : "font-normal text-slate-400")}>
                {coveragePeriodDisplay}
              </span>
              <span className="inline-flex shrink-0 items-center rounded-full bg-[#EEF6FD] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0A4D82]">
                1 Tahun
              </span>
            </button>
            {uwForm.coverageStartDate ? (
              <div className="mt-1.5 text-[12px] leading-5 text-slate-500">
                Berlaku sampai pukul 12.00 siang pada {coverageEndDisplay}.
              </div>
            ) : null}
          </div>
          <div><FieldLabel label="Riwayat klaim 3 tahun terakhir" required /><SelectInput value={uwForm.claimHistory} onChange={(value) => setUwField("claimHistory", value)} options={CLAIM_HISTORY_OPTIONS} placeholder="Bagaimana riwayat klaim properti ini?" /></div>
          {hasStockObject ? (
            <div>
              <FieldLabel label="Jenis Stok" required helpText="Wajib diisi bila ada obyek pertanggungan jenis stok." />
              <SelectInput value={uwForm.stockType || ""} onChange={(value) => setUwField("stockType", value)} options={STOCK_TYPE_OPTIONS.map((item) => item.label)} placeholder="Pilih jenis stok" />
              {!external && selectedStockTypeMeta ? (
                <div className="mt-2 rounded-xl border border-[#D8E1EA] bg-white px-3 py-2 text-sm text-slate-700">
                  Kategori stok ini termasuk <span className="font-semibold text-slate-900">{selectedStockTypeMeta.risk.toLowerCase()}</span>.
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard title={photoSectionTitle} subtitle={photoSectionSubtitle} className={externalSectionClassName} compactHeader={external}>
        <div className="grid gap-4 md:grid-cols-3"><CameraCaptureCard title="Foto Tampak Depan" description="Wajib diisi." image={uploads.frontView} onCapture={(value) => { setUploads((prev) => ({ ...prev, frontView: value })); setEvidence((prev) => ({ ...prev, photos: { ...prev.photos, frontView: value ? createPhotoEvidence({ label: "Foto Tampak Depan", declaredAddress: form.locationSearch }) : null } })); }} /><CameraCaptureCard title="Foto Samping Kanan" description="Wajib diisi." image={uploads.sideRightView} onCapture={(value) => { setUploads((prev) => ({ ...prev, sideRightView: value })); setEvidence((prev) => ({ ...prev, photos: { ...prev.photos, sideRightView: value ? createPhotoEvidence({ label: "Foto Samping Kanan", declaredAddress: form.locationSearch }) : null } })); }} /><CameraCaptureCard title="Foto Samping Kiri" description="Wajib diisi." image={uploads.sideLeftView} onCapture={(value) => { setUploads((prev) => ({ ...prev, sideLeftView: value })); setEvidence((prev) => ({ ...prev, photos: { ...prev.photos, sideLeftView: value ? createPhotoEvidence({ label: "Foto Samping Kiri", declaredAddress: form.locationSearch }) : null } })); }} /></div>
      </SectionCard>
    </div>
  );
}

function ExternalProposalPage({
  mode,
  customerName,
  customerType,
  form,
  uwForm,
  uploads,
  propertyType,
  setPropertyType,
  occupancy,
  setOccupancy,
  objectRows,
  updateObjectRow,
  addObjectRow,
  removeObjectRow,
  totalValue,
  estimatedTotal,
  basePremium,
  extensionPremium,
  stampDuty,
  selectedGuarantees,
  setSelectedGuarantees,
  expandedRows,
  setExpandedRows,
  constructionClass,
  setField,
  setUwField,
  onBack,
  onPrimary,
  onSecondary,
  onReject,
  onEditObject,
  onEditInsured,
  helpRequestSent,
  floorCount,
  setFloorCount,
  canProceed,
  blockingMessage,
  showFloorInput,
  floorFieldRef,
  preparedBy,
  operatingRecord,
  transactionAuthority,
  productConfig,
  extensionOptions,
  viewerMode = "customer",
  referralCode = "",
  senderName = "",
  onViewerModeChange = () => {},
  propertyOptions = PROPERTY_TYPES,
}) {
  const isIndicative = mode === "indicative";
  const isInternalPreview = viewerMode === "internal";
  const activeVariant = productConfig || getPropertyVariant("property-safe");
  const operatingStatusValue = operatingRecord?.status;
  const operatingVersion = operatingRecord?.version;
  const operatingValidUntil = operatingRecord?.validUntil;
  const operatingOwner = operatingRecord?.owner;
  const operatingId = operatingRecord?.id;
  const showEstimatedPremium = !canProceed;
  const coverageLabel = showEstimatedPremium ? "Estimasi Premi 1 Tahun" : "Premi 1 Tahun";
  const primaryLabel = isIndicative ? "Data Lanjutan" : "Pembayaran";
  const primaryActionLabel = isIndicative ? "Lanjut ke Data Lanjutan" : "Lanjut ke Pembayaran";
  const constructionInfo = CONSTRUCTION_GUIDE.find((item) => item.title === constructionClass);
  const [sectionOpen, setSectionOpen] = useState({ property: false, insured: false, guarantee: false });
  const [editingSections, setEditingSections] = useState({ property: false, guarantee: false, insured: false });
  const [objectOpen, setObjectOpen] = useState({ detail: false, main: false, exclusions: false, extension: false });
  const [insuredOpen, setInsuredOpen] = useState({ profile: false, advanced: false, photos: false });
  const isInternalDataFlow = viewerMode === "internal";

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
      uwForm.insuredAddress ||
      uwForm.ownership ||
      uwForm.fireProtectionChoice ||
      (Array.isArray(uwForm.fireProtection) ? uwForm.fireProtection.length > 0 : Boolean(uwForm.fireProtection)) ||
      uwForm.coverageStartDate ||
      uwForm.claimHistory ||
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
  const greetingRecipientName = customerDisplay && customerDisplay !== "-"
    ? String(customerDisplay).trim().split(/\s+/)[0]
    : "Calon Tertanggung";
  const objectSummaryLabel =
    propertyType && occupancy
      ? `${propertyType} yang digunakan untuk ${String(occupancy).toLowerCase()}`
      : propertyType
        ? propertyType
        : occupancy
          ? `Properti untuk ${String(occupancy).toLowerCase()}`
          : "Informasi properti belum dilengkapi";
  const coverageValue = "Rp " + formatRupiah(totalValue);
  const premiumValue = "Rp " + formatRupiah(estimatedTotal);
  const visibleGuarantees = isIndicative ? extensionOptions : selectedExtensions;
  const objectTypeSummary = objectRows.length
    ? Array.from(new Set(objectRows.map((row) => String(row.type || "").trim()).filter(Boolean))).join(", ")
    : "Belum ada objek yang dipilih";
  const selectedExtensionSummaryItems = selectedExtensions.map((item) => item.title).filter(Boolean);
  const guaranteeSummaryVisualItems = selectedExtensionSummaryItems.map((title) => {
    const source = extensionOptions.find((item) => item.title === title);
    return { title, icon: source?.icon || Shield };
  });
  const displayedGuaranteeSummaryVisualItems = guaranteeSummaryVisualItems;
  const constructionSummaryLabel = constructionClass || "Belum dipilih";
  const fireProtectionSummary =
    uwForm.fireProtectionChoice === "Ada"
      ? Array.isArray(uwForm.fireProtection) && uwForm.fireProtection.length
        ? uwForm.fireProtection.join(", ")
        : "Ada"
      : uwForm.fireProtectionChoice || "-";
  const claimHistorySummary = uwForm.claimHistory || "-";
  const hasStockObject = objectRows.some((row) => row.type === "Stok");
  const stockTypeSummary = hasStockObject ? uwForm.stockType || "-" : "";
  const showAdvancedAccordions = !isIndicative && (hasAnyAdvancedData || uploads.frontView || uploads.sideRightView || uploads.sideLeftView);
  const occupancyOptions = OCCUPANCY_MAP[propertyType] || [];
  const constructionOptions = CONSTRUCTION_GUIDE.map((item) => item.title);
  const startEditingSection = (section) => {
    setEditingSections({ property: false, guarantee: false, insured: false, [section]: true });
  };
  const finishEditingSection = (section) => {
    setEditingSections((prev) => ({ ...prev, [section]: false }));
  };
  const headerUserLabel = isInternalPreview ? senderName || "Taqwim (Internal)" : greetingRecipientName;
  const [viewerMenuOpen, setViewerMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F3F5F7] text-slate-900">
      <header className="sticky top-0 z-30 bg-[#0A4D82] shadow-sm">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-3 px-4 py-3 md:gap-4 md:px-6 md:py-4">
          <div className="flex min-w-0 items-center gap-3 text-white md:gap-6">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-sm bg-[#091E42] md:h-8 md:w-8">
                <div className="absolute left-0 top-0 h-full w-full bg-[linear-gradient(135deg,#D71920_0%,#D71920_42%,transparent_42%,transparent_100%)]" />
                <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-white" />
              </div>
              <div className="text-[12px] font-black leading-[0.95] md:text-[18px]">Danantara<div className="-mt-0.5 md:-mt-1">Indonesia</div></div>
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
              onClick={() => {
                window.location.href = "https://esppa.asuransijasindo.co.id/";
              }}
              className="inline-flex items-center gap-2 rounded-[8px] bg-white/10 px-5 py-3 text-sm font-medium text-white hover:bg-white/15"
            >
              <Home className="h-4 w-4" />
              Beranda
            </button>
            <button className="inline-flex items-center gap-2 rounded-[8px] bg-[#F5A623] px-5 py-3 text-sm font-semibold text-white shadow-sm">
              <Shield className="h-4 w-4" />
              Produk
            </button>
          </div>

          <div className="relative flex items-center gap-2 md:gap-3">
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setViewerMenuOpen((current) => !current)}
                className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-white/15"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">View as</span>
                <span className="max-w-[126px] truncate font-semibold">{isInternalPreview ? "Internal" : "Calon Tertanggung"}</span>
                <ChevronDown className={cls("h-4 w-4 text-white/85 transition", viewerMenuOpen && "rotate-180")} />
              </button>
              {viewerMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+10px)] z-40 w-[220px] rounded-[14px] border border-[#D9E1EA] bg-white p-2 shadow-[0_20px_45px_rgba(15,23,42,0.16)]">
                  {[
                    { key: "internal", label: "Internal" },
                    { key: "customer", label: "Calon Tertanggung" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setViewerMenuOpen(false);
                        onViewerModeChange(item.key);
                      }}
                      className={cls(
                        "flex w-full items-center justify-center rounded-[10px] px-3 py-3 text-center text-sm font-semibold hover:bg-[#F7FAFD]",
                        (isInternalPreview ? "internal" : "customer") === item.key ? "bg-[#F7FAFD] text-[#0A4D82]" : "text-slate-700"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button type="button" className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-3.5 text-sm font-semibold text-slate-800 shadow-sm md:px-4">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EA4335] text-[10px] font-bold text-white">ID</span>
              <span className="max-w-[108px] truncate text-[13px] md:max-w-none md:text-sm">{headerUserLabel}</span>
            </button>
            <button type="button" aria-label="Lihat notifikasi" className="hidden h-11 w-11 items-center justify-center rounded-[10px] border border-white/20 bg-white/10 text-white shadow-sm hover:bg-white/15 md:inline-flex">
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="bg-[#0A4D82] pb-8">
        <div className="mx-auto max-w-[1280px] px-4 pt-5 md:px-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-[10px] border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Produk
          </button>

          <div className="mt-5 text-center text-white">
            <div className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90">
              {isInternalPreview ? `Selamat datang kembali, ${headerUserLabel}` : `Halo, ${headerUserLabel}`}
            </div>
            <h1 className="mt-4 text-[32px] font-bold tracking-tight md:text-[40px]">{activeVariant.title}</h1>
            <p className="mx-auto mt-2 max-w-3xl text-[14px] text-white/90 md:text-[17px]">{activeVariant.heroSubtitle}</p>
          </div>

          <div className="mx-auto mt-6 max-w-[860px] rounded-[28px] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-6 rounded-[18px] border border-[#D8E1EA] bg-[#F8FBFE] px-4 py-5 md:flex-row md:items-center md:gap-4 md:px-6">
              <StepNode step="Langkah 1" title="Tinjau Penawaran" subtitle={isIndicative ? "Sedang dibuka" : "Selesai"} active={isIndicative} done={!isIndicative} icon={<FileText className="h-4 w-4" />} onClick={isIndicative ? undefined : onSecondary} />
              <div className="hidden h-px flex-1 self-center bg-slate-300 md:block" />
              <StepNode step="Langkah 2" title="Data Lanjutan" subtitle={isIndicative ? "Menunggu" : "Selesai"} active={!isIndicative} done={false} icon={<FileText className="h-4 w-4" />} />
              {!isInternalDataFlow ? (
                <>
                  <div className="hidden h-px flex-1 self-center bg-slate-300 md:block" />
                  <StepNode step="Langkah 3" title="Pembayaran" subtitle={isIndicative ? "Menunggu" : "Siap dilanjutkan"} active={!isIndicative} done={false} icon={<Wallet className="h-4 w-4" />} />
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[860px] px-4 py-6 md:px-6">
        <div className="space-y-3">
          <SectionCard
            title="Ringkasan Penawaran Anda"
            subtitle="Rangkuman utama penawaran yang sedang Anda tinjau."
            headerAlign="center"
          >
            <div className="rounded-[24px] border border-[#D8E1EA] bg-[linear-gradient(180deg,#FBFDFF_0%,#F5F9FD_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              <div className="space-y-3">
                <OfferSummarySection
                  title="Ringkasan Informasi Nasabah"
                  action={editingSections.insured ? null : <SummaryEditButton onClick={() => startEditingSection("insured")} />}
                >
                  {editingSections.insured ? (
                    <div className="space-y-4">
                      <OfferSummaryKeyValue label="Nama Tertanggung" value={customerDisplay} />
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <FieldLabel label="Alamat Email" required />
                          <TextInput value={form.email} onChange={(value) => setField("email", value)} placeholder="nama@email.com" icon={<Mail className="h-4 w-4" />} type="email" />
                        </div>
                        <div>
                          <FieldLabel label="Nomor Handphone" required />
                          <TextInput value={form.phone} onChange={(value) => setField("phone", value)} placeholder="08xxxxxxxxxx" icon={<Phone className="h-4 w-4" />} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm text-slate-500">Yang bisa diubah di bagian ini hanya alamat email dan nomor handphone.</div>
                        <button
                          type="button"
                          onClick={() => finishEditingSection("insured")}
                          className="inline-flex h-9 items-center rounded-[10px] bg-[#0A4D82] px-4 text-sm font-semibold text-white hover:bg-[#0D5B98]"
                        >
                          Selesai
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <OfferSummaryKeyValue label="Nama Tertanggung" value={customerDisplay} />
                      <OfferSummaryKeyValue label="Alamat Email" value={emailDisplay} />
                      <OfferSummaryKeyValue label="Nomor Handphone" value={phoneDisplay} />
                    </div>
                  )}
                </OfferSummarySection>

                <OfferSummarySection
                  title="Ringkasan Informasi Properti"
                  action={editingSections.property ? null : <SummaryEditButton onClick={() => startEditingSection("property")} />}
                >
                  {editingSections.property ? (
                    <div className="space-y-4">
                      <OfferSummaryKeyValue label="Jenis Bangunan:" value={propertyType || "-"} />
                      <OfferSummaryKeyValue label="Penggunaan bangunan:" value={occupancy || "-"} />
                      <div className="rounded-2xl border border-[#D8E1EA] bg-[#F8FBFE] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-[15px] text-slate-900">Obyek Pertanggungan</div>
                            <div className="mt-1 text-sm text-slate-500">Bagian ini bisa langsung diubah dari ringkasan penawaran.</div>
                          </div>
                          <button type="button" onClick={addObjectRow} className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-3 text-sm font-medium text-[#0A4D82] hover:bg-[#F8FBFE]">
                            <Plus className="h-4 w-4" />
                            Tambah Obyek
                          </button>
                        </div>
                        <div className="mt-3 space-y-3">
                          {objectRows.map((row) => (
                            <div key={row.id} className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
                              <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                  <FieldLabel label="Jenis Obyek" required />
                                  <SelectInput value={row.type} onChange={(value) => updateObjectRow(row.id, { type: value })} options={OBJECT_TYPES} placeholder="Pilih jenis obyek" />
                                </div>
                                <div>
                                  <FieldLabel label="Nilai Pertanggungan" required />
                                  <CurrencyInput value={row.amount} onChange={(value) => updateObjectRow(row.id, { amount: value })} placeholder="Masukkan nilai pertanggungan" />
                                </div>
                              </div>
                              <div>
                                <FieldLabel label="Keterangan" required={requiresObjectNote(row.type)} helpText={requiresObjectNote(row.type) ? "Wajib untuk jenis obyek Stok." : ""} />
                                <TextInput value={row.note || ""} onChange={(value) => updateObjectRow(row.id, { note: value })} placeholder={shortObjectLabel(row.type)} />
                              </div>
                              {objectRows.length > 1 ? (
                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => removeObjectRow(row.id)}
                                    className="inline-flex h-8 items-center gap-2 rounded-[8px] border border-red-200 bg-white px-2.5 text-xs font-medium text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Hapus Obyek
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                      <OfferSummaryKeyValue label="Total Harga Pertanggungan:" value={coverageValue} />
                      <OfferSummaryKeyValue label="Perlindungan Kebakaran:" value={fireProtectionSummary} />
                      <OfferSummaryKeyValue label="Riwayat Klaim 3 Tahun Terakhir:" value={claimHistorySummary} />
                      {hasStockObject ? <OfferSummaryKeyValue label="Jenis Stok:" value={stockTypeSummary} /> : null}
                      <OfferSummaryKeyValue
                        label="Kelas Konstruksi"
                        value={
                          constructionInfo && constructionSummaryLabel !== "Belum dipilih"
                            ? `Kelas ${constructionSummaryLabel.replace(/^Kelas\s*/i, "")} dengan ${constructionInfo.desc}`
                            : constructionSummaryLabel
                        }
                      />
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm text-slate-500">Yang bisa diubah di bagian ini hanya obyek pertanggungan.</div>
                        <button
                          type="button"
                          onClick={() => finishEditingSection("property")}
                          className="inline-flex h-9 items-center rounded-[10px] bg-[#0A4D82] px-4 text-sm font-semibold text-white hover:bg-[#0D5B98]"
                        >
                          Selesai
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <OfferSummaryKeyValue label="Jenis Bangunan:" value={propertyType || "-"} />
                      <OfferSummaryKeyValue label="Penggunaan bangunan:" value={occupancy || "-"} />
                      <OfferSummaryKeyValue
                        label="Objek Pertanggungan:"
                        value={
                          objectRows.length ? (
                            <div className="space-y-0.5">
                              {objectRows.map((row) => (
                                <div key={row.id}>
                                  <span>{row.type || "Objek"}</span>
                                  <span> senilai Rp{formatRupiah(parseNumber(row.amount))}</span>
                                  {row.note ? <span className="font-medium text-slate-600">, {row.note}</span> : null}
                                </div>
                              ))}
                            </div>
                          ) : (
                            objectTypeSummary
                          )
                        }
                      />
                      <OfferSummaryKeyValue label="Total Harga Pertanggungan:" value={coverageValue} />
                      <OfferSummaryKeyValue label="Perlindungan Kebakaran:" value={fireProtectionSummary} />
                      <OfferSummaryKeyValue label="Riwayat Klaim 3 Tahun Terakhir:" value={claimHistorySummary} />
                      {hasStockObject ? <OfferSummaryKeyValue label="Jenis Stok:" value={stockTypeSummary} /> : null}
                      <OfferSummaryKeyValue
                        label="Kelas Konstruksi"
                        value={
                          constructionInfo && constructionSummaryLabel !== "Belum dipilih"
                            ? `Kelas ${constructionSummaryLabel.replace(/^Kelas\s*/i, "")} dengan ${constructionInfo.desc}`
                            : constructionSummaryLabel
                        }
                      />
                  </div>
                  )}
                </OfferSummarySection>

                <OfferSummarySection
                  title="Ringkasan Syarat dan Ketentuan"
                >
                  <div className="space-y-3">
                    <div className="rounded-xl border border-[#D8E1EA] bg-[linear-gradient(180deg,#FFFFFF_0%,#F7FAFD_100%)] px-4 py-3">
                      <div className="text-[15px] font-medium leading-[1.4] text-slate-900">
                        {activeVariant.policyDocumentName || activeVariant.primaryCoverageTitle}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-[14px] font-medium text-slate-600">Risiko yang dijamin</div>
                      <div className="flex flex-wrap gap-2">
                        {BASIC_COVERAGE_HIGHLIGHTS.map((item) => (
                          <div key={item.title} className="rounded-full border border-[#D8E1EA] bg-[#F8FBFE] px-3 py-1.5">
                            <SummaryGuaranteeItem title={item.title} icon={item.icon} compact />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-[14px] font-medium text-slate-600">Perluasan Jaminan</div>
                        <div className="mt-0.5 text-[12px] leading-5 text-slate-500">Pilih perluasan jaminan yang ingin ditambahkan.</div>
                      </div>
                      {extensionOptions.map((item) => (
                        <div
                          key={item.key}
                          className={cls(
                            "group relative overflow-hidden rounded-xl border px-3 py-2.5 transition-all duration-200",
                            selectedGuarantees[item.key]
                              ? "border-[#AFCFEA] bg-[linear-gradient(180deg,#FFFFFF_0%,#F4FAFF_100%)] shadow-[0_12px_26px_rgba(10,77,130,0.10)]"
                              : "border-slate-200 bg-white hover:border-[#C8D9EA] hover:bg-[#FBFDFF] hover:shadow-[0_8px_18px_rgba(15,23,42,0.05)]",
                          )}
                        >
                          {selectedGuarantees[item.key] ? <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-[#0A4D82]" /> : null}
                          <div className={cls("flex items-start gap-2.5", selectedGuarantees[item.key] && "pl-1")}>
                            <button
                              type="button"
                              aria-pressed={Boolean(selectedGuarantees[item.key])}
                              onClick={() => setSelectedGuarantees((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                              className={cls(
                                "mt-0.5 flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-md border transition-all duration-200",
                                selectedGuarantees[item.key]
                                  ? "border-[#0A4D82] bg-[#0A4D82] text-white shadow-[0_6px_12px_rgba(10,77,130,0.22)]"
                                  : "border-[#CAD6E3] bg-white text-transparent group-hover:border-[#9DB8D4]",
                              )}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <div className="min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => setExpandedRows((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                                className="flex w-full items-start justify-between gap-2 text-left"
                              >
                                <SummaryGuaranteeItem title={item.title} icon={item.icon} compact />
                                <ChevronDown className={cls("mt-0.5 h-4 w-4 shrink-0 text-slate-500 transition duration-200", expandedRows[item.key] && "rotate-180")} />
                              </button>
                              {expandedRows[item.key] ? <div className="mt-1.5 pl-[30px] text-[13px] leading-5 text-slate-500">{item.detail}</div> : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {selectedGuarantees.earthquake && isFloorRelevant(propertyType, occupancy) ? (
                      <div className="max-w-sm rounded-xl border border-amber-200 bg-white p-3">
                        <FieldLabel label="Jumlah lantai bangunan yang diasuransikan" required helpText="Diisi hanya bila objek bertingkat dan gempa bumi dipilih." />
                        <TextInput value={floorCount} onChange={(value) => setFloorCount(onlyDigits(value))} placeholder="Masukkan jumlah lantai" icon={<Building2 className="h-4 w-4" />} />
                      </div>
                    ) : null}
                  </div>
                </OfferSummarySection>

                <OfferSummarySection title="Ringkasan Biaya" subtitle={isIndicative && blockingMessage ? blockingMessage : undefined}>
                  <PremiumPriceHero
                    label=""
                    value={`Rp ${formatRupiah(estimatedTotal)}`}
                    tooltipText={showEstimatedPremium ? "Nilai ini masih perkiraan awal. Jumlahnya bisa menyesuaikan setelah Anda melengkapi informasi di halaman Data Lanjutan." : undefined}
                  />
                  <PremiumBreakdown>
                    <OfferSummaryKeyValue label="Premi:" value={"Rp " + formatRupiah(basePremium)} />
                    {extensionPremium > 0 ? <OfferSummaryKeyValue label="Premi Perluasan:" value={"Rp " + formatRupiah(extensionPremium)} /> : null}
                    <OfferSummaryKeyValue label="Biaya Meterai:" value={"Rp " + formatRupiah(stampDuty)} />
                  </PremiumBreakdown>
                </OfferSummarySection>

                <div className="rounded-[24px] border border-[#D8E1EA] bg-white p-5 shadow-sm">
                  <div className="text-[18px] font-bold text-slate-900">Aksi Selanjutnya</div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={onSecondary}
                      className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-[#D5DEEA] bg-white px-5 text-sm font-semibold text-[#0A4D82] shadow-sm hover:bg-[#F8FBFE]"
                    >
                      Minta Bantuan Staff Asuransi
                    </button>
                    <button
                      type="button"
                      disabled={isIndicative ? false : !canProceed || offerMeta.isExpired}
                      onClick={onPrimary}
                      className={cls(
                        "inline-flex h-[48px] items-center justify-center rounded-[12px] px-5 text-sm font-bold uppercase tracking-wide text-white shadow-sm",
                        isIndicative || (!isIndicative && canProceed && !offerMeta.isExpired)
                          ? "bg-[#F5A623] hover:brightness-105"
                          : "cursor-not-allowed bg-slate-400"
                      )}
                    >
                      {primaryActionLabel}
                    </button>
                  </div>
                  <div className="mt-3 flex justify-center">
                    <button
                      type="button"
                      onClick={onReject}
                      className="text-xs font-medium text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
                    >
                      Tidak mau melanjutkan penawaran
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

        </div>
      </div>
    </div>
  );
}

function ExternalPaymentPage({
  productTitle,
  customerName,
  form,
  uwForm,
  propertyType,
  occupancy,
  objectRows,
  selectedGuarantees,
  extensionOptions,
  totalValue,
  estimatedTotal,
  basePremium,
  extensionPremium,
  stampDuty,
  paymentMethod,
  onSelectMethod,
  onBack,
  policyConsentApproved,
  onOpenConsent,
  onConfirmPayment,
  paymentStatus,
  operatingRecord,
  isExpired,
}) {
  const operatingBlockedMessage = paymentBlockMessage(operatingRecord);
  const canProceedPayment = canProceedToPaymentFromOperating(operatingRecord);
  const customerDisplay = customerName || form.identity || "Calon tertanggung";
  const coverageEndDate = calculateCoverageEnd(uwForm.coverageStartDate);
  const coveragePeriod = uwForm.coverageStartDate && coverageEndDate
    ? `${formatDisplayDate(new Date(`${uwForm.coverageStartDate}T00:00:00`))} - ${formatDisplayDate(new Date(`${coverageEndDate}T00:00:00`))}`
    : "-";
  const selectedExtensionTitles = extensionOptions.filter((item) => selectedGuarantees[item.key]).map((item) => item.title);
  const selectedExtensions = extensionOptions.filter((item) => selectedGuarantees[item.key]);
  const guaranteeSummaryVisualItems = selectedExtensions.map((item) => ({ title: item.title, icon: item.icon || Shield }));
  const fireProtectionSummary =
    uwForm.fireProtectionChoice === "Ada"
      ? Array.isArray(uwForm.fireProtection) && uwForm.fireProtection.length
        ? uwForm.fireProtection.join(", ")
        : "Ada"
      : uwForm.fireProtectionChoice || "-";
  const claimHistorySummary = uwForm.claimHistory || "-";
  const hasStockObject = objectRows.some((row) => row.type === "Stok");
  const stockTypeSummary = hasStockObject ? uwForm.stockType || "-" : "";
  const objectSummary = objectRows.length
    ? objectRows
        .map((row) => {
          const pieces = [row.type || "Objek", `Rp ${formatRupiah(parseNumber(row.amount))}`];
          if (row.note) pieces.push(row.note);
          return pieces.join(" - ");
        })
        .join(", ")
    : "-";
  const canConfirmPayment = Boolean(paymentMethod) && policyConsentApproved && canProceedPayment && !isExpired && !paymentStatus;
  const phoneDisplay = form.phone || "-";
  const emailDisplay = form.email || "-";
  const coverageValue = `Rp ${formatRupiah(totalValue)}`;
  const guaranteedRisks = [
    { title: "Kebakaran", icon: Flame },
    { title: "Petir", icon: Zap },
    { title: "Ledakan", icon: Atom },
    { title: "Kejatuhan Pesawat", icon: Plane },
    { title: "Asap", icon: Waves },
  ];

  return (
    <div className="min-h-screen bg-[#F3F5F7] text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="text-[18px] font-black leading-tight text-[#0A4D82]">Danantara<div className="-mt-1">Indonesia</div></div>
            <div className="text-[16px] font-semibold text-slate-700">asuransi jasindo</div>
          </div>
          <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-[10px] border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><ArrowLeft className="h-4 w-4" />Kembali ke Data Lanjutan</button>
        </div>
      </div>

      <div className="bg-[#0A4D82] pb-8">
        <div className="mx-auto max-w-[1280px] px-4 pt-5 md:px-6">
          <div className="mt-5 text-center text-white">
            <div className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90">Halo, {String(customerDisplay).trim().split(/\s+/)[0] || "Calon Tertanggung"}</div>
            <h1 className="mt-4 text-[32px] font-bold tracking-tight md:text-[40px]">{productTitle}</h1>
            <p className="mx-auto mt-2 max-w-3xl text-[14px] text-white/90 md:text-[17px]">Pilih metode pembayaran dan tinjau ringkasan singkat penawaran Anda sebelum melanjutkan.</p>
          </div>

          <div className="mx-auto mt-6 max-w-[860px] rounded-[28px] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-6 rounded-[18px] border border-[#D8E1EA] bg-[#F8FBFE] px-4 py-5 md:flex-row md:items-center md:gap-4 md:px-6">
              <StepNode step="Langkah 1" title="Tinjau Penawaran" subtitle="Selesai" active={false} done={true} icon={<FileText className="h-4 w-4" />} />
              <div className="hidden h-px flex-1 self-center bg-slate-300 md:block" />
              <StepNode step="Langkah 2" title="Data Lanjutan" subtitle="Selesai" active={false} done={true} icon={<FileText className="h-4 w-4" />} />
              <div className="hidden h-px flex-1 self-center bg-slate-300 md:block" />
              <StepNode step="Langkah 3" title="Pembayaran" subtitle={paymentStatus ? "Selesai" : "Sedang dibuka"} active={!paymentStatus} done={Boolean(paymentStatus)} icon={<Wallet className="h-4 w-4" />} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[860px] px-4 py-8 md:px-6">
        <div className="space-y-5">
          <SectionCard
            title="Penawaran Final Anda"
            subtitle="Tinjau kembali ringkasan final penawaran Anda sebelum memilih metode pembayaran."
            headerAlign="center"
          >
            <div className="rounded-[24px] border border-[#D8E1EA] bg-[linear-gradient(180deg,#FBFDFF_0%,#F5F9FD_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              <div className="space-y-3">
                <OfferSummarySection title="Ringkasan Informasi Nasabah">
                  <div className="space-y-2.5">
                    <OfferSummaryKeyValue label="Nama Tertanggung" value={customerDisplay} />
                    <OfferSummaryKeyValue label="Alamat Email" value={emailDisplay} />
                    <OfferSummaryKeyValue label="Nomor Handphone" value={phoneDisplay} />
                  </div>
                </OfferSummarySection>

                <OfferSummarySection title="Ringkasan Informasi Properti">
                  <div className="space-y-2.5">
                    <OfferSummaryKeyValue label="Jenis Bangunan" value={propertyType || "-"} />
                    <OfferSummaryKeyValue label="Penggunaan bangunan" value={occupancy || "-"} />
                    <OfferSummaryKeyValue label="Objek Pertanggungan" value={objectSummary} />
                    <OfferSummaryKeyValue label="Total Harga Pertanggungan" value={coverageValue} />
                    <OfferSummaryKeyValue label="Perlindungan Kebakaran" value={fireProtectionSummary} />
                    <OfferSummaryKeyValue label="Riwayat Klaim 3 Tahun Terakhir" value={claimHistorySummary} />
                    {hasStockObject ? <OfferSummaryKeyValue label="Jenis Stok" value={stockTypeSummary} /> : null}
                    <OfferSummaryKeyValue label="Jangka Waktu Pertanggungan" value={coveragePeriod} />
                  </div>
                </OfferSummarySection>

                <OfferSummarySection title="Ringkasan Syarat dan Ketentuan">
                  <div className="space-y-4">
                    <div className="text-[15px] font-medium text-slate-900">Polis Standar Asuransi Kebakaran Indonesia</div>
                    <div>
                      <div className="mb-2 text-[13px] font-medium text-slate-500">Risiko yang dijamin</div>
                      <div className="flex flex-wrap gap-2">
                        {guaranteedRisks.map((item) => (
                          <div key={item.title} className="inline-flex items-center gap-2 rounded-full border border-[#D8E1EA] bg-white px-3 py-2 text-[13px] text-slate-800">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EEF6FD] text-[#0A4D82]">
                              <item.icon className="h-3 w-3" />
                            </div>
                            <span>{item.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {guaranteeSummaryVisualItems.length ? (
                      <div>
                        <div className="mb-2 text-[13px] font-medium text-slate-500">Perluasan Jaminan</div>
                        <div className="space-y-2">
                          {guaranteeSummaryVisualItems.map((item) => (
                            <div key={item.title} className="rounded-xl border border-[#D8E1EA] bg-white px-3.5 py-3">
                              <SummaryGuaranteeItem title={item.title} icon={item.icon} compact />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </OfferSummarySection>

                <OfferSummarySection title="Ringkasan Biaya">
                  <PremiumPriceHero label="" value={`Rp ${formatRupiah(estimatedTotal)}`} />
                  <PremiumBreakdown>
                    <OfferSummaryKeyValue label="Premi" value={`Rp ${formatRupiah(basePremium)}`} />
                    {extensionPremium > 0 ? <OfferSummaryKeyValue label="Premi Perluasan" value={`Rp ${formatRupiah(extensionPremium)}`} /> : null}
                    <OfferSummaryKeyValue label="Biaya Meterai" value={`Rp ${formatRupiah(stampDuty)}`} />
                  </PremiumBreakdown>
                </OfferSummarySection>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Pilih Metode Pembayaran" subtitle="Pilih metode pembayaran yang ingin Anda gunakan untuk melanjutkan proses polis.">
            <div className="space-y-3">
              {PAYMENT_OPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onSelectMethod(item)}
                  className={cls(
                    "flex w-full items-center justify-between rounded-xl border px-4 py-4 text-left transition",
                    paymentMethod === item ? "border-[#0A4D82] bg-[#F8FBFE] shadow-sm" : "border-slate-200 bg-white hover:border-[#C9D5E3] hover:bg-[#FBFDFF]",
                  )}
                >
                  <span className="font-semibold text-slate-900">{item}</span>
                  {paymentMethod === item ? <CheckCircle2 className="h-5 w-5 text-[#0A4D82]" /> : null}
                </button>
              ))}
            </div>
            {operatingBlockedMessage ? <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{operatingBlockedMessage}</div> : null}
            {isExpired ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Masa berlaku penawaran ini sudah berakhir. Silakan minta versi penawaran terbaru sebelum melanjutkan pembayaran.</div> : null}
            {paymentStatus ? <div className="mt-4 rounded-xl border border-[#CFE0F0] bg-[#F8FBFE] p-4 text-sm text-[#0A4D82]">{paymentStatus}</div> : null}
          </SectionCard>

          <SectionCard title="Lanjutkan Pembayaran" subtitle="Selesaikan persetujuan kebijakan terlebih dahulu, lalu lanjutkan pembayaran.">
            <div className="rounded-2xl border border-[#D8E1EA] bg-[#F8FBFE] px-4 py-3">
              <OfferSummaryKeyValue label="Metode Pembayaran" value={paymentMethod || "Pilih metode pembayaran terlebih dahulu"} />
              <OfferSummaryKeyValue
                label="Persetujuan Kebijakan"
                value={policyConsentApproved ? "Sudah disetujui" : "Belum disetujui"}
              />
            </div>
            <div className="mt-3 rounded-2xl border border-[#D8E1EA] bg-white px-4 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-[14px] font-semibold text-slate-900">Persetujuan Kebijakan</div>
                  <div className="mt-1 text-sm leading-6 text-slate-500">
                    Buka dan baca persetujuan kebijakan sebelum melanjutkan pembayaran.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenConsent}
                  className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D5DEEA] bg-white px-5 text-sm font-semibold text-[#0A4D82] shadow-sm hover:bg-[#F8FBFE]"
                >
                  {policyConsentApproved ? "Lihat Persetujuan Kebijakan" : "Buka Persetujuan Kebijakan"}
                </button>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onBack}
                className="flex h-[48px] w-full items-center justify-center rounded-[12px] border border-[#D5DEEA] bg-white px-5 text-center text-sm font-semibold text-[#0A4D82] shadow-sm hover:bg-[#F8FBFE] sm:flex-1"
              >
                Kembali ke Data Lanjutan
              </button>
              <button
                type="button"
                disabled={!canConfirmPayment}
                onClick={onConfirmPayment}
                className={cls("flex h-[48px] w-full items-center justify-center rounded-[12px] px-5 text-center text-sm font-bold uppercase tracking-wide text-white shadow-sm sm:flex-1", canConfirmPayment ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}
              >
                {paymentStatus ? "Pembayaran Selesai" : "Lanjutkan Pembayaran"}
              </button>
            </div>
          </SectionCard>
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
  const [policyConsentApproved, setPolicyConsentApproved] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [shareFeedback, setShareFeedback] = useState("");
  const [rejectionStatus, setRejectionStatus] = useState("");
  const [qrInfoVisible, setQrInfoVisible] = useState(false);
  const [helpRequestSent, setHelpRequestSent] = useState(false);
  const [externalViewerMode, setExternalViewerMode] = useState("customer");
  const [sharedReferralCode, setSharedReferralCode] = useState("");
  const [sharedSenderName, setSharedSenderName] = useState("");
  const [sharedCustomerName, setSharedCustomerName] = useState("");
  const [sharedOfferSnapshot, setSharedOfferSnapshot] = useState(null);
  const isInternalUnderwritingContext = entryMode === "internal" || externalViewerMode === "internal";
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedGuarantees, setSelectedGuarantees] = useState({ riot: false, flood: false, tsfwd: false, earthquake: false });
  const [expandedRows, setExpandedRows] = useState({ fire: false, riot: false, flood: false, tsfwd: false, earthquake: false, exclusions: false, optionalUw: false });
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
      fire: false,
      riot: false,
      flood: false,
      tsfwd: false,
      earthquake: false,
      exclusions: false,
    }));
  }, [currentProductVariant]);
  const [objectRows, setObjectRows] = useState([{ id: "obj-1", type: "", amount: "", note: "" }]);
  const [uwForm, setUwForm] = useState({
    idNumber: "",
    sameAsInsured: true,
    sameAsPropertyAddress: false,
    picName: "",
    insuredAddress: "",
    ownership: "",
    coverageStartDate: "",
    fireProtectionChoice: "",
    fireProtection: [],
    claimHistory: "",
    stockType: "",
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
    if (uwForm.sameAsPropertyAddress) {
      setUwForm((prev) => ({ ...prev, insuredAddress: form.locationSearch || "" }));
    }
  }, [uwForm.sameAsPropertyAddress, form.locationSearch]);
  useEffect(() => {
    if (!showIndicationModal) setShareFeedback("");
  }, [showIndicationModal]);
  useEffect(() => {
    const { view, viewer, referral, sender, customer, offer } = readShareContextFromUrl();
    if (
      view === "offer-indicative" ||
      view === "external-underwriting" ||
      (!isInternalUnderwritingContext && (view === "offer-final" || view === "payment"))
    ) {
      setExternalView(view);
    }
    if (viewer === "internal" || viewer === "customer") {
      setExternalViewerMode(viewer);
    }
    setSharedReferralCode(referral);
    setSharedSenderName(sender);
    setSharedCustomerName(customer);
    setSharedOfferSnapshot(offer);
  }, []);
  useEffect(() => {
    if (!sharedOfferSnapshot) return;
    setSelectedCustomer(null);
    setForm((prev) => ({
      ...prev,
      identity: sharedOfferSnapshot.identity || prev.identity,
      customerType: sharedOfferSnapshot.customerType || prev.customerType,
      phone: sharedOfferSnapshot.phone || prev.phone,
      email: sharedOfferSnapshot.email || prev.email,
      propertyType: sharedOfferSnapshot.propertyType || prev.propertyType,
      occupancy: sharedOfferSnapshot.occupancy || prev.occupancy,
      constructionClass: sharedOfferSnapshot.constructionClass || prev.constructionClass,
      locationSearch: sharedOfferSnapshot.locationSearch || prev.locationSearch,
    }));
    if (Array.isArray(sharedOfferSnapshot.objectRows) && sharedOfferSnapshot.objectRows.length) {
      setObjectRows(sharedOfferSnapshot.objectRows);
    }
    if (sharedOfferSnapshot.selectedGuarantees) {
      setSelectedGuarantees((prev) => ({ ...prev, ...sharedOfferSnapshot.selectedGuarantees }));
    }
    if (sharedOfferSnapshot.floorCount) {
      setFloorCount(String(sharedOfferSnapshot.floorCount));
    }
  }, [sharedOfferSnapshot]);
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
  const effectiveCustomerName = customerName || sharedCustomerName;
  const referralCode = createReferralCode(sessionName, transactionAuthority.transactionId);
  const shareJourneyKey = currentProductVariant === "property-all-risk" ? "property-all-risk-external" : "property-external";
  const shareSnapshot = encodeShareSnapshot({
    identity: customerName,
    customerType: form.customerType,
    phone: form.phone,
    email: form.email,
    propertyType: form.propertyType,
    occupancy: form.occupancy,
    constructionClass: form.constructionClass,
    locationSearch: form.locationSearch,
    objectRows,
    selectedGuarantees,
    floorCount,
  });
  const shareUrl = getShareUrl("offer-indicative", {
    journey: shareJourneyKey,
    viewer: "customer",
    referral: referralCode,
    sender: sessionName,
    customer: customerName,
    offer: shareSnapshot,
  });
  const previewUrl = getShareUrl("offer-indicative", {
    journey: shareJourneyKey,
    viewer: "customer",
    referral: referralCode,
    sender: sessionName,
    customer: customerName,
    offer: shareSnapshot,
  });
  const effectiveReferralCode = sharedReferralCode || referralCode;
  const effectiveSenderName = sharedSenderName || sessionName;
  const hasValidStepOneIdentity = Boolean(form.identity.trim());
  const hasValidPhoneContact = Boolean(form.phone.trim()) && isValidPhone(form.phone);
  const hasValidEmailContact = Boolean(form.email.trim()) && isValidEmail(form.email);
  const hasValidStepOneContact = hasValidPhoneContact && hasValidEmailContact;
  const hasValidStepOneLocation = Boolean(form.locationSearch.trim());
  const hasValidObjects = totalValue > 0 && objectRows.every((row) => parseNumber(row.amount) > 0);
  const hasStockObject = objectRows.some((row) => row.type === "Stok");
  const hasRequiredObjectNotes = objectRows.every((row) => !requiresObjectNote(row.type) || Boolean(String(row.note || "").trim()));
  const hasRequiredFloorCount = !showFloorInput || Number(floorCount) > 0;
  const canAdvanceInternalStepOne = hasValidStepOneIdentity && hasValidStepOneContact && hasValidStepOneLocation && hasValidObjects && hasRequiredObjectNotes && hasRequiredFloorCount;
  const hasValidUwIdentity = !uwForm.idNumber.trim() || isValidIdNumber(form.customerType, uwForm.idNumber);
  const hasValidPicName = form.customerType !== "Badan Usaha" || Boolean(uwForm.picName.trim());
  const hasValidInsuredAddress = Boolean(String(uwForm.insuredAddress || "").trim());
  const hasValidStockType = !hasStockObject || Boolean(String(uwForm.stockType || "").trim());
  const hasClaimHistoryReviewBlock = Boolean(uwForm.claimHistory) && uwForm.claimHistory !== "Tidak Ada";
  const operatingPaymentBlockMessage = paymentBlockMessage(operatingRecord);
  const hasOperatingPaymentBlock = Boolean(operatingPaymentBlockMessage) && operatingRecord && !canProceedToPaymentFromOperating(operatingRecord);
  const canProceedUnderwritingPayment = !hasOperatingPaymentBlock;
  const hasValidFireProtection = uwForm.fireProtectionChoice === "Tidak Ada" || (uwForm.fireProtectionChoice === "Ada" && Array.isArray(uwForm.fireProtection) && uwForm.fireProtection.length > 0);
  const hasValidUnderwriting = hasValidInsuredAddress && Boolean(uwForm.coverageStartDate) && hasValidFireProtection && Boolean(uwForm.claimHistory) && hasValidStockType;
  const hasCompleteUploads = hasRequiredUploads(uploads);
  const canAdvanceUnderwriting = hasValidUwIdentity && hasValidPicName && hasValidUnderwriting && hasCompleteUploads && !hasClaimHistoryReviewBlock && canProceedUnderwritingPayment;
  const shouldShowPaymentPage = (externalView === "offer-final" || externalView === "payment") && canAdvanceUnderwriting && canProceedToPaymentFromOperating(operatingRecord);
  const stepOnePendingItems = [];
  if (!hasValidStepOneIdentity) stepOnePendingItems.push("Isi nama nasabah atau pilih CIF.");
if (!hasValidStepOneContact) stepOnePendingItems.push("Lengkapi nomor handphone dan alamat email yang valid.");
  if (!hasValidStepOneLocation) stepOnePendingItems.push("Isi lokasi properti atau gunakan tombol lokasi cepat.");
  if (!hasValidObjects) stepOnePendingItems.push("Setiap objek harus punya nilai yang ingin dilindungi.");
  if (!hasRequiredObjectNotes) stepOnePendingItems.push("Lengkapi keterangan objek yang masih wajib.");
  if (!hasRequiredFloorCount) stepOnePendingItems.push("Lengkapi jumlah lantai pada perluasan Risiko Gempa Bumi.");
  const underwritingPendingItems = [];
  if (uwForm.idNumber.trim() && !hasValidUwIdentity) underwritingPendingItems.push(form.customerType === "Badan Usaha" ? "NPWP yang diisi minimal 15 digit." : "NIK yang diisi harus 16 digit.");
  if (!hasValidPicName) underwritingPendingItems.push("Lengkapi kontak di lokasi.");
  if (!hasValidInsuredAddress) underwritingPendingItems.push("Lengkapi alamat tertanggung.");
  if (!hasValidUnderwriting) underwritingPendingItems.push("Masih ada data lanjutan wajib yang perlu diisi.");
  if (!hasValidStockType) underwritingPendingItems.push("Pilih jenis stok agar sistem bisa mengkategorikan stok mudah terbakar atau tidak mudah terbakar.");
  if (!hasCompleteUploads) underwritingPendingItems.push("Unggah tiga foto properti: depan, samping kanan, dan samping kiri.");
  if (hasClaimHistoryReviewBlock) underwritingPendingItems.push("Riwayat klaim terdeteksi. Penawaran perlu dikembalikan ke tim internal untuk ditinjau sebelum bisa lanjut ke pembayaran.");
  if (hasOperatingPaymentBlock && operatingPaymentBlockMessage) {
    underwritingPendingItems.push(
      operatingRecord?.status === "Pending Review Internal"
        ? "Status internal belum disetujui. Penawaran menunggu tindak lanjut tim internal sebelum bisa lanjut ke pembayaran."
        : operatingPaymentBlockMessage,
    );
  }
  useEffect(() => {
    if (isInternalUnderwritingContext) {
      if (externalView !== "" && externalView !== "offer-indicative" && externalView !== "external-underwriting") {
        setExternalView("external-underwriting");
        replaceViewerModeInUrl(externalViewerMode, "external-underwriting");
      }
      return;
    }

    if (
      (externalView === "offer-final" || externalView === "payment") &&
      (!canAdvanceUnderwriting || !canProceedToPaymentFromOperating(operatingRecord))
    ) {
      setExternalView("external-underwriting");
      replaceViewerModeInUrl(externalViewerMode, "external-underwriting");
    }
  }, [externalView, canAdvanceUnderwriting, externalViewerMode, isInternalUnderwritingContext]);
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

  const fillStepOneDemoData = () => {
    const demoCustomer = MOCK_CIF[0];
    const demoAddress = "Jl. Sudirman Kav. 44, Jakarta Selatan";
    setInternalStep(1);
    setExternalView("");
    setSelectedCustomer(demoCustomer);
    setField("identity", `${demoCustomer.name} - ${demoCustomer.cif}`);
    setField("phone", demoCustomer.phone);
    setField("email", demoCustomer.email);
    setField("propertyType", PROPERTY_TYPES.includes("Rumah Tinggal") ? "Rumah Tinggal" : PROPERTY_TYPES[0]);
    setField("occupancy", "Hunian");
    setField("constructionClass", "Kelas 1");
    setField("locationSearch", demoAddress);
    setField("customerType", demoCustomer.type);
    setObjectRows([
      {
        id: "obj-1",
        type: "Bangunan",
        amount: "350000000",
        note: "Rumah tinggal 2 lantai dengan renovasi ringan",
      },
    ]);
    setEvidence((prev) => ({ ...prev, location: createLocationEvidence({ declaredAddress: demoAddress, source: "demo" }) }));
    setSelectedGuarantees({
      riot: false,
      flood: false,
      tsfwd: false,
      earthquake: false,
    });
    setExpandedRows((prev) => ({ ...prev, fire: false, riot: false, flood: false, tsfwd: false, earthquake: false }));
    setFloorCount("");
  };

  const fillStepTwoDemoData = () => {
    const demoCustomer = MOCK_CIF[0];
    const selectedCoverageDate = formatDateInput(new Date());
    const demoAddress = "Jl. Sudirman Kav. 44, Jakarta Selatan";
    const declarationTime = formatDateInput(new Date());
    setUwForm({
      idNumber: "3173010101010001",
      sameAsInsured: true,
      sameAsPropertyAddress: true,
      picName: demoCustomer.name,
      insuredAddress: demoAddress,
      ownership: "Milik Sendiri",
      coverageStartDate: selectedCoverageDate,
      fireProtectionChoice: "Ada",
      fireProtection: ["APAR", "Hydrant"],
      claimHistory: "Tidak Ada",
      stockType: "",
      surroundingRisk: "",
      additionalNotes: "Isi otomatis prototype untuk verifikasi proses.",
    });
    setUploads({
      frontView: "data:demo/photo-front",
      sideRightView: "data:demo/photo-right",
      sideLeftView: "data:demo/photo-left",
    });
    setEvidence({
      location: createLocationEvidence({ declaredAddress: demoAddress, source: "demo" }),
      photos: {
        frontView: createPhotoEvidence({ label: "Foto Tampak Depan", declaredAddress: demoAddress, declarationTime }),
        sideRightView: createPhotoEvidence({ label: "Foto Samping Kanan", declaredAddress: demoAddress, declarationTime }),
        sideLeftView: createPhotoEvidence({ label: "Foto Samping Kiri", declaredAddress: demoAddress, declarationTime }),
      },
    });
  };

  const fillDemoForCurrentStep = () => {
    if (internalStep === 1) {
      fillStepOneDemoData();
      return;
    }
    fillStepTwoDemoData();
  };

  if (externalView === "offer-indicative") {
    return (
      <>
        <RejectModal open={showRejectModal} onClose={() => setShowRejectModal(false)} reason={rejectReason} setReason={setRejectReason} customReason={rejectCustomReason} setCustomReason={setRejectCustomReason} onSubmit={() => { const finalReason = rejectReason === "Alasan lainnya" ? rejectCustomReason.trim() : rejectReason; setRejectionStatus("Alasan penolakan tersimpan: " + finalReason + ". Ini masih simulasi untuk handoff ke tim IT."); setShowRejectModal(false); }} />
        <ExternalProposalPage
          mode="indicative"
          customerName={effectiveCustomerName || uwForm.picName}
          customerType={form.customerType}
          form={form}
          uwForm={uwForm}
          uploads={uploads}
          propertyOptions={availablePropertyTypes}
          propertyType={form.propertyType}
          setPropertyType={(value) => setField("propertyType", value)}
          occupancy={form.occupancy}
          setOccupancy={(value) => setField("occupancy", value)}
          setField={setField}
          setUwField={setUwField}
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
          canProceed={false}
          blockingMessage={!hasRequiredFloorCount ? "Isi jumlah lantai jika Anda memilih perlindungan gempa bumi untuk bangunan bertingkat." : ""}
          showFloorInput={showFloorInput}
          floorFieldRef={floorFieldRef}
          onEditObject={() => {}}
          onEditInsured={() => setExternalView("external-underwriting")}
          onBack={() => {
            if (embedded && (entryMode === "external" || (entryMode === "internal" && externalViewerMode === "customer"))) {
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
          viewerMode={externalViewerMode}
          referralCode={effectiveReferralCode}
          senderName={effectiveSenderName}
          onViewerModeChange={(mode) => {
            setExternalViewerMode(mode);
            replaceViewerModeInUrl(mode);
          }}
        />
      </>
    );
  }

  if (shouldShowPaymentPage) {
    return (
      <>
        <ConsentModal
          agreed={policyConsentApproved}
          open={showConsentModal}
          onClose={() => setShowConsentModal(false)}
          onAgree={() => {
            setShowConsentModal(false);
            setPolicyConsentApproved(true);
          }}
        />
        <ExternalPaymentPage
          productTitle={activeVariant.title}
          customerName={effectiveCustomerName || uwForm.picName}
          form={form}
          uwForm={uwForm}
          propertyType={form.propertyType}
          occupancy={form.occupancy}
          objectRows={objectRows}
          totalValue={totalValue}
          selectedGuarantees={selectedGuarantees}
          extensionOptions={activeGuarantees}
          estimatedTotal={estimatedTotalNumber}
          basePremium={basePremiumNumber}
          extensionPremium={additionalPremiumNumber}
          stampDuty={stampDutyNumber}
          paymentMethod={paymentMethod}
          onSelectMethod={(value) => {
            setPaymentMethod(value);
            setPaymentStatus("");
          }}
          onBack={() => setExternalView("external-underwriting")}
          policyConsentApproved={policyConsentApproved}
          onOpenConsent={() => setShowConsentModal(true)}
          onConfirmPayment={() => setPaymentStatus(`${activeVariant.paymentSuccessMessage} Integrasi pembayaran online akan disambungkan pada tahap berikutnya.`)}
          paymentStatus={paymentStatus}
          operatingRecord={operatingRecord}
          isExpired={operatingRecord?.status === "Expired"}
        />
      </>
    );
  }

  if (externalView === "external-underwriting" || externalView === "offer-final" || externalView === "payment" || !canAdvanceUnderwriting) {
    const externalDataValidity = resolveOfferValidity(true, uwForm.coverageStartDate);
    const externalDataObjectLabel =
      [form.propertyType, form.occupancy].filter(Boolean).join(" - ") ||
      (objectRows.length ? `${objectRows.length} objek dilindungi` : "-");
    const externalDataOfferMeta = {
      reference: transactionAuthority.transactionId,
      version: "Rev 1",
      validUntil: formatDisplayDate(externalDataValidity.expiresAt),
      statusLabel: underwritingPendingItems.length ? "Menunggu data tambahan" : "Siap dilanjutkan",
    };

    return (
      <CustomerDataJourneyShell
        productName={activeVariant.title}
          heroDescription="Data lanjutan berikut diperlukan untuk melanjutkan proses penawaran ke tahap pembayaran."
        customerName={effectiveCustomerName || "Calon tertanggung"}
        objectLabel={externalDataObjectLabel}
        sumInsuredLabel="Nilai yang Dilindungi"
        sumInsuredValue={`Rp ${formatRupiah(totalValue)}`}
        premiumLabel="Estimasi Premi 1 Tahun"
        premiumValue={`Rp ${formatRupiah(estimatedTotalNumber)}`}
        offerReference={externalDataOfferMeta.reference}
        version={externalDataOfferMeta.version}
        validUntil={externalDataOfferMeta.validUntil}
        statusLabel={externalDataOfferMeta.statusLabel}
        guidanceText={
          hasClaimHistoryReviewBlock
            ? "Riwayat klaim yang Anda isi perlu ditinjau kembali oleh tim internal, sehingga penawaran belum bisa dilanjutkan ke pembayaran."
            : hasOperatingPaymentBlock
              ? operatingPaymentBlockMessage || "Penawaran ini masih perlu ditinjau internal sebelum lanjut ke pembayaran."
              : "Informasi yang Anda isi di halaman ini akan dipakai untuk menyiapkan tahap pembayaran."
        }
        showSidebar={false}
        summaryRows={[
          { label: activeVariant.primaryCoveragePremiumLabel, value: `Rp ${formatRupiah(basePremiumNumber)}` },
          ...(additionalPremiumNumber > 0 ? [{ label: "Premi Perluasan", value: `Rp ${formatRupiah(additionalPremiumNumber)}` }] : []),
          { label: "Biaya Meterai", value: `Rp ${formatRupiah(stampDutyNumber)}` },
        ]}
        pendingItems={underwritingPendingItems}
        canContinue={!isInternalUnderwritingContext && canAdvanceUnderwriting}
        continueLabel="Lanjut ke Pembayaran"
        onContinue={isInternalUnderwritingContext ? undefined : () => setExternalView("payment")}
        secondaryLabel={
          isInternalUnderwritingContext
            ? "Kembali ke Tinjau Penawaran"
            : hasClaimHistoryReviewBlock || hasOperatingPaymentBlock
              ? "Minta Staff Asuransi Review Ulang"
              : undefined
        }
        onSecondary={
          isInternalUnderwritingContext
            ? () => setExternalView("offer-indicative")
            : hasClaimHistoryReviewBlock || hasOperatingPaymentBlock
              ? (() => setHelpRequestSent(true))
              : undefined
        }
        onBack={() => setExternalView("offer-indicative")}
        topActionLabel="Simulasi Isi Otomatis"
        onTopAction={fillStepTwoDemoData}
        showPaymentStep={!isInternalUnderwritingContext}
      >
        <UnderwritingSections
          form={form}
          customerType={form.customerType}
          selectedCustomer={selectedCustomer}
          objectRows={objectRows}
          uwForm={uwForm}
          setUwField={setUwField}
          uploads={uploads}
          setUploads={setUploads}
          setEvidence={setEvidence}
          expandedRows={expandedRows}
          setExpandedRows={setExpandedRows}
          external={true}
        />
      </CustomerDataJourneyShell>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F5F7] text-slate-900">
      <SentOffersModal open={showSentOffers} onClose={() => setShowSentOffers(false)} />
        <IndicationModal open={showIndicationModal} onClose={() => { setShowIndicationModal(false); setShareFeedback(""); }} onOpenIndicativeOffer={() => { setExternalViewerMode("customer"); setShowIndicationModal(false); setExternalView("offer-indicative"); openShareWindow(previewUrl); }} onOpenFinalOffer={null} customerName={effectiveCustomerName} shareUrl={shareUrl} onShowQrInfo={() => setQrInfoVisible((prev) => !prev)} onCopyLink={handleCopyLink} copyStatus={shareFeedback} shareLabel={activeVariant.shareLabel} shareSubject={activeVariant.shareSubject} />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0A4D82] shadow-sm">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-white"><div className="text-[15px] font-black leading-tight md:text-[18px]">Danantara<div className="-mt-1 text-[15px] md:text-[18px]">Indonesia</div></div><div className="hidden text-[15px] font-semibold text-white/95 sm:block">asuransi jasindo</div></div>
                <div className="hidden items-center gap-3 md:flex"><button type="button" onClick={() => { window.location.href = "https://esppa.asuransijasindo.co.id/"; }} className="inline-flex items-center gap-2 rounded-[8px] bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"><Home className="h-4 w-4" />Beranda</button><button type="button" onClick={() => { if (embedded && onExit) onExit(); else setScreen("catalog"); }} className="inline-flex items-center gap-2 rounded-[8px] bg-[#F5A623] px-4 py-2 text-sm font-semibold text-white shadow-sm"><Package className="h-4 w-4" />Produk</button></div>
          </div>
          <div className="relative flex items-center gap-4 text-white">
            <button type="button" onClick={fillDemoForCurrentStep} className="hidden rounded-[10px] border border-white/30 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 md:inline-flex md:text-sm">Isi Otomatis Langkah {internalStep} (Demo)</button>
            <button type="button" onClick={() => setShowUserMenu((prev) => !prev)} className="relative inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">ID</span>{sessionName}{helpRequestSent ? <span className="absolute -right-1 -top-1 inline-flex h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" /> : null}</button>
            <button type="button" aria-label="Lihat notifikasi" className="hidden h-11 w-11 items-center justify-center rounded-[10px] border border-white/20 bg-white/10 text-white shadow-sm hover:bg-white/15 md:inline-flex"><Bell className="h-4 w-4" /></button>
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
              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={() => { if (embedded && onExit) onExit(); else setScreen("catalog"); }} className="inline-flex items-center gap-2 rounded-[10px] border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"><ArrowLeft className="h-4 w-4" />Kembali ke Produk</button>
                <button type="button" tabIndex={-1} aria-hidden="true" className="pointer-events-none invisible inline-flex items-center gap-2 rounded-[10px] border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white"><ArrowLeft className="h-4 w-4" />Kembali ke Produk</button>
              </div>
              <div className="mt-6 text-center text-white"><div className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90">Selamat datang kembali, {sessionName}</div><h1 className="mt-4 text-[32px] font-bold tracking-tight md:text-[40px]">{activeVariant.title}</h1><p className="mx-auto mt-2 max-w-3xl text-[14px] text-white/90 md:text-[17px]">{activeVariant.heroSubtitle}</p></div>
              <div className="mx-auto mt-6 max-w-[860px] rounded-2xl bg-white p-3 shadow-2xl shadow-black/15 md:mt-7 md:max-w-[960px] md:p-5">
                <div className="rounded-2xl border border-[#D8E1EA] bg-[#F4F7FA] px-3 py-4 md:px-5 md:py-5">
                  <div className="flex flex-col gap-5 md:flex-row md:gap-5">
                    <StepNode
                      step="Langkah 1"
                      title="Tinjau Penawaran"
                      subtitle={internalStep === 1 ? "Sedang dibuka" : "Selesai"}
                      active={internalStep === 1}
                      done={internalStep > 1}
                      icon={<FileText className="h-4 w-4" />}
                      onClick={() => {
                        if (internalStep !== 1) setInternalStep(1);
                      }}
                    />
                    <div className="hidden h-px flex-1 self-center bg-slate-300 md:block" />
                    <StepNode
                      step="Langkah 2"
                      title="Data Lanjutan"
                      subtitle={internalStep === 2 ? (canAdvanceUnderwriting ? "Siap dikirim" : "Sedang diisi") : "Menunggu"}
                      active={internalStep === 2}
                      done={false}
                      icon={<FileText className="h-4 w-4" />}
                      onClick={() => {
                        if (quoted) setInternalStep(2);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {rejectionStatus ? <div className="mx-auto mt-6 max-w-[860px] rounded-2xl border border-[#CFE0F0] bg-[#F8FBFE] px-4 py-3 text-sm text-[#0A4D82]">{rejectionStatus}</div> : null}
          {qrInfoVisible ? <div className="mx-auto mt-4 max-w-[860px] rounded-2xl border border-[#CFE0F0] bg-white px-4 py-4 text-sm text-slate-700 shadow-sm"><div className="font-semibold text-slate-900">QR Code belum digenerate otomatis.</div><div className="mt-1">Untuk handoff ke IT, tautan yang akan diencode adalah: <span className="break-all text-[#0A4D82]">{shareUrl}</span></div></div> : null}
          {internalStep === 1 ? (
            <div className="mx-auto mt-6 max-w-[860px] px-4 md:px-6">
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
                    <div className="mt-4 rounded-xl border border-[#D5DDE6] bg-[#FAFBFC] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-[15px] font-bold text-slate-900">Rincian Properti</div>
                        <button
                          type="button"
                          onClick={() => setObjectRows((prev) => prev.concat({ id: "obj-" + Date.now(), type: "", amount: "", note: "" }))}
                          className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Plus className="h-4 w-4" />Tambah Objek
                        </button>
                      </div>
                      <div className="mt-3 space-y-2.5">
                        {objectRows.map((row) => (
                          <div key={row.id} className="rounded-xl border border-slate-200 bg-white p-3">
                            <div className="grid gap-2.5 lg:grid-cols-[180px_minmax(0,1fr)_minmax(0,1.2fr)_40px] lg:items-start">
                              <div>
                                <FieldLabel label="Jenis Objek" required />
                                <SelectInput value={row.type} onChange={(value) => updateObjectRow(row.id, { type: value })} options={OBJECT_TYPES} placeholder="Jenis Objek" />
                              </div>
                              <div>
                                <FieldLabel label="Nilai Pertanggungan" required />
                                <CurrencyInput value={row.amount} onChange={(value) => updateObjectRow(row.id, { amount: value })} placeholder="Harga Pertanggungan" />
                              </div>
                              <div>
                                <FieldLabel
                                  label="Keterangan"
                                  required={requiresObjectNote(row.type)}
                                  helpText={requiresObjectNote(row.type) ? "Wajib untuk jenis objek Stok." : ""}
                                />
                                <TextInput value={row.note} onChange={(value) => updateObjectRow(row.id, { note: value })} placeholder={shortObjectLabel(row.type)} />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeObjectRow(row.id)}
                                className="inline-flex h-[44px] items-center justify-center rounded-[10px] border border-slate-300 text-slate-500 hover:bg-slate-50"
                                title="Hapus objek"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 rounded-[10px] bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
                        <div className="flex flex-col gap-1.5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                          <span>Total Nilai yang Dilindungi</span>
                          <span className="break-words text-left text-[18px] font-bold text-[#E8A436] sm:text-right">Rp {formatRupiah(totalValue)}</span>
                        </div>
                      </div>
                    </div>
                </SectionCard>
                  <div className={cls("flex justify-stretch gap-3", quoted ? "justify-stretch sm:justify-end" : "sm:justify-end sm:gap-3")}>
                    {!quoted ? <button type="button" disabled={!canAdvanceInternalStepOne} onClick={() => setQuoted(true)} className={cls("inline-flex h-[50px] flex-1 items-center justify-center gap-2 rounded-[12px] px-5 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition", canAdvanceInternalStepOne ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}>Cek Premi</button> : null}
                    <button
                      type="button"
                      disabled={!canAdvanceInternalStepOne}
                      onClick={() => {
                        setQuoted(true);
                        setShowIndicationModal(true);
                      }}
                      className={cls("inline-flex h-[50px] flex-1 items-center justify-center gap-2 rounded-[12px] px-5 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition", canAdvanceInternalStepOne ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}
                    >
                      Kirim Indikasi
                    </button>
                    {(quoted || canAdvanceInternalStepOne) ? (
                      <button
                        type="button"
                        disabled={!canAdvanceInternalStepOne}
                        onClick={() => { setQuoted(true); setInternalStep(2); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className={cls("inline-flex h-[50px] flex-1 items-center justify-center gap-2 rounded-[12px] px-5 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition", canAdvanceInternalStepOne ? "bg-[#0A4D82] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}
                      >
                        Lanjut ke Data Lanjutan
                      </button>
                    ) : null}
                  </div>
                  {quoted ? (
                    <div ref={resultsRef} className="space-y-5">
                      <SectionCard title="Rincian Jaminan" subtitle="Klik setiap baris untuk melihat penjelasan detailnya.">
                        <div className="space-y-5">
                          <div>
                            <div className="text-[15px] font-semibold tracking-tight text-slate-900">{activeVariant.insuredRisksSectionTitle}</div>
                            <div className="mt-3">
                              <AccordionRiskRow title={activeVariant.primaryCoverageTitle} icon={Flame} premium={shouldShowQuotedPricing ? "Rp " + formatRupiah(basePremiumNumber) : "-"} detail={activeVariant.primaryCoverageDescription} deductible={form.constructionClass === "Kelas 1" ? activeVariant.primaryCoverageDeductibleClassOne : activeVariant.primaryCoverageDeductibleOther} alwaysIncluded={true} expanded={expandedRows.fire} onToggleExpand={() => setExpandedRows((prev) => ({ ...prev, fire: !prev.fire }))} />
                            </div>
                          </div>
                          {activeVariant.importantExclusions.length ? <div><div className="text-[15px] font-semibold tracking-tight text-slate-900">{activeVariant.exclusionsSectionTitle}</div><div className="mt-1 text-sm leading-6 text-slate-500">{activeVariant.exclusionsSectionSubtitle}</div><div className="mt-3 rounded-xl border border-[#C9D5E3] bg-[#F8FBFE]"><button type="button" onClick={() => setExpandedRows((prev) => ({ ...prev, exclusions: !prev.exclusions }))} className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left"><div className="text-[15px] font-semibold text-[#0A4D82]">Ringkasan pengecualian utama</div><ChevronDown className={cls("h-4 w-4 shrink-0 text-slate-500 transition", expandedRows.exclusions && "rotate-180")} /></button>{expandedRows.exclusions ? <div className="border-t border-[#D6E0EA] px-3.5 py-3"><div className="space-y-2">{activeVariant.importantExclusions.map((item) => <div key={item} className="flex items-start gap-2 text-[13px] leading-5 text-slate-700"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /><span>{item}</span></div>)}</div></div> : null}</div></div> : null}
                          <div>
                            <div className="text-[15px] font-semibold tracking-tight text-slate-900">Perluasan Jaminan</div>
                            <div className="mt-3 space-y-2.5">
                              {activeGuarantees.map((item) => {
                                const checked = selectedGuarantees[item.key];
                                const premiumValue = Math.round(totalValue * item.rate);
                                const deductibleValue = item.key === "earthquake" ? "2,5% dari Rp " + formatRupiah(totalValue) : item.deductible;
                                return <AccordionRiskRow key={item.key} title={item.title} icon={item.icon} premium={shouldShowQuotedPricing ? "Rp " + formatRupiah(premiumValue) : "-"} detail={item.detail} deductible={deductibleValue} checked={checked} onToggleChecked={() => setSelectedGuarantees((prev) => ({ ...prev, [item.key]: !prev[item.key] }))} expanded={expandedRows[item.key]} onToggleExpand={() => setExpandedRows((prev) => ({ ...prev, [item.key]: !prev[item.key] }))} extra={item.key === "earthquake" && checked && isFloorRelevant(form.propertyType, form.occupancy) ? <div ref={floorFieldRef} className="max-w-sm rounded-xl border border-amber-200 bg-white p-3"><FieldLabel label="Jumlah lantai bangunan yang diasuransikan" required helpText="Diisi hanya bila objek bertingkat dan gempa bumi dipilih." /><TextInput value={floorCount} onChange={(value) => setFloorCount(onlyDigits(value))} placeholder="Masukkan jumlah lantai" icon={<Building2 className="h-4 w-4" />} /></div> : null} />;
                              })}
                            </div>
                          </div>
                        </div>
                      </SectionCard>

                      <SectionCard title="Ringkasan Penawaran">
                        <div className="divide-y divide-slate-100 rounded-2xl border border-[#D8E1EA] bg-[#F8FBFE] px-4 py-2">
                          <ProposalRow label={selectedCustomer || isDigitsOnly(form.identity.trim()) ? "Kode CIF / Nama" : "Nama Nasabah"} value={form.identity || "-"} strong />
                          <ProposalRow label="Jenis Bangunan" value={form.propertyType || "-"} />
                          <ProposalRow label="Penggunaan bangunan" value={form.occupancy || "-"} />
                          <ProposalRow label="Kelas Konstruksi" value={form.constructionClass || "-"} />
                          <ProposalRow label="Nilai yang Dilindungi" value={`Rp ${formatRupiah(totalValue)}`} strong />
                        </div>
                      </SectionCard>

                      <SectionCard title="Ringkasan Biaya">
                        <PremiumPriceHero label="" value={pricingSummaryValue} />
                        <PremiumBreakdown>
                          <ProposalRow label="Premi" value={pricingSummaryValue} />
                          {extensionPremiumSummaryValue ? <ProposalRow label="Premi Perluasan" value={extensionPremiumSummaryValue} /> : null}
                          <ProposalRow label="Biaya Meterai" value={stampDutySummaryValue} />
                        </PremiumBreakdown>
                        <div className="mt-4">
                          <SummarySidebarAlert items={stepOnePendingItems} successText="Data awal penawaran sudah lengkap dan siap dilanjutkan ke data lanjutan." />
                        </div>
                      </SectionCard>
                    </div>
                  ) : null}
              </div>
            </div>
          ) : (
            <div className="mx-auto mt-6 max-w-[860px] px-4 md:px-6">
              <div className="space-y-5">
                <SectionCard
                  title="Data Lanjutan Penawaran Anda"
                  subtitle="Informasi berikut diperlukan agar indikasi siap dikirim ke calon tertanggung."
                  headerAlign="center"
                >
                  <UnderwritingSections form={form} customerType={form.customerType} selectedCustomer={selectedCustomer} objectRows={objectRows} uwForm={uwForm} setUwField={setUwField} uploads={uploads} setUploads={setUploads} setEvidence={setEvidence} expandedRows={expandedRows} setExpandedRows={setExpandedRows} external={true} />
                </SectionCard>

                <SectionCard title="Ringkasan Biaya">
                  <PremiumPriceHero label="" value={`Rp ${formatRupiah(estimatedTotalNumber)}`} />
                  <PremiumBreakdown>
                    <ProposalRow label="Premi" value={`Rp ${formatRupiah(basePremiumNumber)}`} />
                    {additionalPremiumNumber > 0 ? <ProposalRow label="Premi Perluasan" value={`Rp ${formatRupiah(additionalPremiumNumber)}`} /> : null}
                    <ProposalRow label="Biaya Meterai" value={`Rp ${formatRupiah(stampDutyNumber)}`} />
                  </PremiumBreakdown>
                </SectionCard>

                <SectionCard
                  title="Tindak Lanjuti Penawaran"
                  subtitle={hasClaimHistoryReviewBlock ? "Riwayat klaim yang Anda isi perlu ditinjau kembali oleh tim internal sebelum indikasi dikirim ke calon tertanggung." : "Periksa kelengkapan data lalu kirim indikasi ke calon tertanggung."}
                >
                  <SummarySidebarAlert
                    items={underwritingPendingItems}
                    successText="Data sudah lengkap dan siap dikirim sebagai indikasi."
                  />
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setInternalStep(1)}
                      className="flex h-[48px] w-full items-center justify-center rounded-[12px] border border-[#D5DEEA] bg-white px-5 text-center text-sm font-semibold text-[#0A4D82] shadow-sm hover:bg-[#F8FBFE]"
                    >
                      Kembali ke Tinjau Penawaran
                    </button>
                    <button
                      type="button"
                      disabled={hasClaimHistoryReviewBlock ? false : !canAdvanceUnderwriting}
                      onClick={() => {
                        if (hasClaimHistoryReviewBlock) {
                          setHelpRequestSent(true);
                          return;
                        }
                        setShowIndicationModal(true);
                      }}
                      className={cls(
                        "flex h-[48px] w-full items-center justify-center rounded-[12px] px-5 text-center text-sm font-bold uppercase tracking-wide text-white shadow-sm transition",
                        hasClaimHistoryReviewBlock
                          ? "bg-[#0A4D82] hover:brightness-105"
                          : canAdvanceUnderwriting
                          ? "bg-[#F5A623] hover:brightness-105"
                          : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400",
                      )}
                    >
                      {hasClaimHistoryReviewBlock ? "Minta Staff Asuransi Review Ulang" : "Kirim Indikasi"}
                    </button>
                  </div>
                </SectionCard>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
















