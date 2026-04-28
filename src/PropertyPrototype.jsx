import React, { useEffect, useMemo, useRef, useState } from "react";
import { createEmptyDocumentCheck, createLocationEvidence, createPhotoEvidence, createTransactionAuthority, summarizeFraudSignals } from "./platform/securityControls.js";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Building2,
  Camera,
  CameraOff,
  Check,
  CheckCircle2,
  ChevronDown,
  FileText,
  Flame,
  Home,
  Mail,
  MapPin,
  Package,
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
  Car,
} from "lucide-react";
import { canProceedToPaymentFromOperating, paymentBlockMessage } from "./operatingLayer.js";
import { getPropertyExtensions, getPropertyVariant } from "./propertyProductConfig.js";
import { CustomerDataJourneyShell } from "./components/CustomerDataJourneyShell.jsx";
import { OfferShareModal } from "./components/OfferShareModal.jsx";
import { PremiumBreakdown, PremiumPriceHero } from "./components/PremiumSummaryBlocks.jsx";

const PROPERTY_TYPES = ["Rumah Tinggal", "Ruko", "Toko", "Kantor", "Kos-kosan"];
const OBJECT_TYPES = ["Bangunan", "Inventaris / Isi", "Stok", "Mesin / Peralatan"];
const CUSTOMER_TYPES = ["Nasabah Perorangan", "Badan Usaha"];
const WALL_MATERIAL_OPTIONS = [
  "Seluruhnya dari beton, bata, hebel, atau bahan tidak mudah terbakar",
  "Ada bagian bahan mudah terbakar, maksimal sekitar 20% dari luas dinding",
  "Bagian bahan mudah terbakar melebihi 20% dari luas dinding",
];
const STRUCTURE_MATERIAL_OPTIONS = [
  "Beton, baja, atau bahan tidak mudah terbakar",
  "Kayu",
  "Material lain di luar ketentuan kelas 1 dan 2",
];
const ROOF_MATERIAL_OPTIONS = [
  "Beton, metal, genteng, atau bahan tidak mudah terbakar",
  "Sirap kayu keras",
  "Bahan mudah terbakar lainnya",
];
const FLAMMABLE_MATERIAL_OPTIONS = ["Tidak ada", "Ada"];
const FIRE_PROTECTION_CHOICES = ["Tidak Ada", "Ada"];
const FIRE_PROTECTION_ITEMS = ["APAR", "Hydrant", "Sprinkler"];
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
  { id: "OFR-001", name: "Sony Laksono", product: "Asuransi Kebakaran", status: "Dibuka, menunggu jawaban" },
  { id: "OFR-002", name: "PT Maju Sentosa", product: "Asuransi Kebakaran", status: "Sudah jawab, minta revisi" },
  { id: "OFR-003", name: "Siti Rahma", product: "Asuransi Kebakaran", status: "Sudah setuju, menunggu bayar" },
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
const CONSTRUCTION_CLASSES = CONSTRUCTION_GUIDE.map((item) => item.title);

const OCCUPANCY_MAP = {
  "Rumah Tinggal": ["Hunian", "Kantor", "Ritel / Toko", "Warung / Kelontong"],
  Ruko: ["Hunian", "Ritel / Toko", "Kantor", "Warung / Kelontong", "Kos-kosan"],
  Toko: ["Ritel / Toko", "Warung / Kelontong", "Minimarket", "Tenda makanan", "Kantor"],
  Kantor: ["Kantor", "Ritel / Toko", "Hunian"],
  "Kos-kosan": ["Hunian", "Kos-kosan", "Kantor"],
};
const OCCUPANCY_CODE_MAP = {
  "Rumah Tinggal|Hunian": "2971",
  "Rumah Tinggal|Kantor": "2932",
  "Rumah Tinggal|Ritel / Toko": "2941",
  "Rumah Tinggal|Warung / Kelontong": "2941",
  "Ruko|Hunian": "2971",
  "Ruko|Ritel / Toko": "2941",
  "Ruko|Kantor": "2932",
  "Ruko|Warung / Kelontong": "2941",
  "Ruko|Kos-kosan": "2971",
  "Toko|Ritel / Toko": "2941",
  "Toko|Warung / Kelontong": "2941",
  "Toko|Minimarket": "2941",
  "Toko|Tenda makanan": "2941",
  "Toko|Kantor": "2932",
  "Kantor|Kantor": "2932",
  "Kantor|Ritel / Toko": "2941",
  "Kantor|Hunian": "2971",
  "Kos-kosan|Hunian": "2971",
  "Kos-kosan|Kos-kosan": "2971",
  "Kos-kosan|Kantor": "2932",
};
const PROPERTY_TYPE_BY_OCCUPANCY = {
  Hunian: "Rumah Tinggal",
  "Ritel / Toko": "Toko",
  "Warung / Kelontong": "Toko",
  Minimarket: "Toko",
  "Tenda makanan": "Toko",
  Kantor: "Kantor",
  "Kos-kosan": "Kos-kosan",
};
const OCCUPANCY_OPTIONS = Array.from(new Set(Object.values(OCCUPANCY_MAP).flat()));

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

const PROPERTY_SAFE_VARIANT = getPropertyVariant("property-safe");
const PROPERTY_ALL_RISK_VARIANT = getPropertyVariant("property-all-risk");

const PROPERTY_PRODUCTS = [
  {
    title: PROPERTY_SAFE_VARIANT.title,
    category: "Harta Benda",
    subtitle: PROPERTY_SAFE_VARIANT.catalogSubtitle,
    image: PROPERTY_SAFE_VARIANT.catalogImage,
    active: true,
    variantKey: "property-safe",
  },
  {
    title: PROPERTY_ALL_RISK_VARIANT.title,
    category: "Harta Benda",
    subtitle: PROPERTY_ALL_RISK_VARIANT.catalogSubtitle,
    image: PROPERTY_ALL_RISK_VARIANT.catalogImage,
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

function isFloorRelevant(propertyType, occupancy) {
  if (propertyType === "Rumah Tinggal" || propertyType === "Kos-kosan") return false;
  if (occupancy === "Warung / Kelontong") return false;
  return propertyType === "Ruko" || propertyType === "Toko" || propertyType === "Kantor";
}

function deriveConstructionClass(form) {
  const wall = form.wallMaterial || form.wall || "";
  const structure = form.structureMaterial || form.structure || "";
  const roof = form.roofMaterial || form.roof || "";
  const flammable = form.flammableMaterial || form.flammable || "";
  if (!wall || !structure || !roof || !flammable) return "";
  if (
    wall === "Bagian bahan mudah terbakar melebihi 20% dari luas dinding" ||
    structure === "Material lain di luar ketentuan kelas 1 dan 2" ||
    roof === "Bahan mudah terbakar lainnya" ||
    flammable === "Ada"
  ) {
    return "Kelas 3";
  }
  if (
    wall === "Ada bagian bahan mudah terbakar, maksimal sekitar 20% dari luas dinding" ||
    structure === "Kayu" ||
    roof === "Sirap kayu keras"
  ) {
    return "Kelas 2";
  }
  return "Kelas 1";
}

function getOccupancyCode(propertyType, occupancy) {
  return OCCUPANCY_CODE_MAP[[propertyType, occupancy].filter(Boolean).join("|")] || "";
}

function getOccupancyOptionsForPropertyTypes(propertyTypes) {
  const options = [];
  propertyTypes.forEach((propertyType) => {
    (OCCUPANCY_MAP[propertyType] || []).forEach((occupancy) => {
      if (!options.includes(occupancy)) options.push(occupancy);
    });
  });
  return options.length ? options : OCCUPANCY_OPTIONS;
}

function derivePropertyTypeFromOccupancy(occupancy, propertyTypes = PROPERTY_TYPES) {
  if (!occupancy) return "";
  const allowed = propertyTypes.filter((item) => PROPERTY_TYPES.includes(item));
  const candidates = allowed.length ? allowed : PROPERTY_TYPES;
  const preferred = PROPERTY_TYPE_BY_OCCUPANCY[occupancy];
  if (preferred && candidates.includes(preferred) && (OCCUPANCY_MAP[preferred] || []).includes(occupancy)) return preferred;
  return candidates.find((propertyType) => (OCCUPANCY_MAP[propertyType] || []).includes(occupancy)) || "";
}

function selectedFireProtectionItems(uwForm) {
  if (Array.isArray(uwForm.fireProtectionItems)) return uwForm.fireProtectionItems.filter((item) => FIRE_PROTECTION_ITEMS.includes(item));
  if (uwForm.fireProtection === "Lengkap") return FIRE_PROTECTION_ITEMS;
  if (uwForm.fireProtection === "APAR + Hydrant") return ["APAR", "Hydrant"];
  if (FIRE_PROTECTION_ITEMS.includes(uwForm.fireProtection)) return [uwForm.fireProtection];
  return [];
}

function hasValidFireProtection(uwForm) {
  const choice = uwForm.fireProtectionChoice || (uwForm.fireProtection && uwForm.fireProtection !== "Tidak Ada" ? "Ada" : uwForm.fireProtection);
  if (choice === "Tidak Ada") return true;
  if (choice === "Ada") return selectedFireProtectionItems(uwForm).length > 0;
  return false;
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

function SectionCard({ title, subtitle, children, action, headerAlign = "left" }) {
  return (
    <section className="rounded-2xl border border-[#D8E1EA] bg-white p-4 shadow-sm md:p-5">
      <div
        className={cls(
          "flex items-start gap-4",
          action ? "justify-between" : headerAlign === "center" ? "justify-center" : "justify-start"
        )}
      >
        <div className={headerAlign === "center" ? "text-center" : ""}>
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

function ProposalRow({ label, value, strong = false }) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-slate-100 py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className={cls("max-w-full break-words text-left text-sm text-slate-900 sm:max-w-[60%] sm:text-right", strong && "font-semibold")}>{value || "-"}</div>
    </div>
  );
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

function SummaryGuaranteeItem({ title, icon, compact = false }) {
  const IconComponent = icon || Shield;
  return (
    <div className={cls("flex items-start", compact ? "gap-2" : "gap-2.5")}>
      <div className={cls("mt-0.5 flex shrink-0 items-center justify-center border border-[#D6E0EA] bg-[#F8FBFE] text-[#0A4D82]", compact ? "h-6 w-6 rounded-md" : "h-7 w-7 rounded-lg")}>
        {React.createElement(IconComponent, { className: compact ? "h-3.5 w-3.5" : "h-4 w-4" })}
      </div>
      <div className={cls("min-w-0 text-slate-900", compact ? "text-[14px] leading-[1.35]" : "text-[15px] leading-[1.45]")}>{title}</div>
    </div>
  );
}

function PropertyGuaranteeDetailCard({ title, icon, premium, detail, deductible, coverageAmount }) {
  const [expanded, setExpanded] = useState(false);
  const IconComponent = icon || Shield;
  return (
    <div className="rounded-xl border border-[#C9D5E3] bg-[#F8FBFE]">
      <button type="button" onClick={() => setExpanded((prev) => !prev)} className="flex w-full items-start justify-between gap-3 px-3.5 py-3 text-left">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[#0A4D82]">
            {React.createElement(IconComponent, { className: "h-4 w-4 shrink-0" })}
            <div className="text-[14px] font-medium leading-[1.35] text-slate-900">{title}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="whitespace-nowrap text-[12px] font-medium text-slate-600">{premium}</div>
          <ChevronDown className={cls("h-4 w-4 shrink-0 text-slate-500 transition", expanded && "rotate-180")} />
        </div>
      </button>
      {expanded ? (
        <div className="border-t border-[#D6E0EA] px-3.5 py-3">
          {coverageAmount ? (
            <div className="mb-2 text-[12px] leading-5 text-slate-600">
              <span className="font-medium text-slate-700">Nilai pertanggungan: </span>
              <span>{coverageAmount}</span>
            </div>
          ) : null}
          <div className="whitespace-pre-line text-[12.5px] leading-5 text-slate-700">{detail}</div>
          {deductible ? (
            <div className="mt-2 text-[12px] leading-5 text-slate-600">
              {deductibleIsDirectText(deductible) ? (
                <span>{String(deductible || "")}</span>
              ) : (
                <>
                  <span className="font-medium text-slate-700">Risiko sendiri saat klaim: </span>
                  <span>{String(deductible || "")}</span>
                </>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function OfferSummaryKeyValue({ label, value, emphasize = false }) {
  const normalizedLabel = String(label || "").replace(/:\s*$/, "");
  const isEmptyString = typeof value === "string" && (!value.trim() || value.trim() === "-" || value.trim().toLowerCase() === "belum dipilih");
  if (value === null || value === undefined || isEmptyString) return null;
  return (
    <div className={cls("border-t border-slate-100 first:border-t-0 first:pt-0 last:pb-0", emphasize ? "py-2.5" : "py-2")}>
      <div className="space-y-1 md:grid md:grid-cols-[170px_10px_minmax(0,1fr)] md:gap-x-1.5 md:space-y-0">
        <div className="text-[12px] font-normal leading-[1.4] text-slate-500">
          {normalizedLabel}
          <span className="md:hidden">:</span>
        </div>
        <div className="hidden text-[12px] font-normal leading-[1.4] tracking-[0.08em] text-slate-400 md:block">:</div>
        <div className={cls("text-[14px] font-normal leading-[1.45] text-slate-900", emphasize && "leading-[1.75]")}>{value}</div>
      </div>
    </div>
  );
}

function deductibleIsDirectText(value) {
  return ["tanpa biaya sendiri", "tidak dikenakan risiko sendiri", "tidak ada risiko sendiri"].some((token) =>
    String(value || "").trim().toLowerCase().startsWith(token)
  );
}

function PreviewPropertyGuaranteeOption({ title, icon, premium, checked, expanded, onToggleChecked, onToggleExpand, detail, deductible, coverageAmount }) {
  const IconComponent = icon || Shield;
  return (
    <div
      className={cls(
        "group relative overflow-hidden rounded-xl border px-3 py-2.5 transition-all duration-200",
        checked
          ? "border-[#AFCFEA] bg-[linear-gradient(180deg,#FFFFFF_0%,#F4FAFF_100%)] shadow-[0_12px_26px_rgba(10,77,130,0.10)]"
          : "border-slate-200 bg-white hover:border-[#C8D9EA] hover:bg-[#FBFDFF] hover:shadow-[0_8px_18px_rgba(15,23,42,0.05)]"
      )}
    >
      {checked ? <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-[#0A4D82]" /> : null}
      <div className={cls("flex items-start gap-2.5", checked && "pl-1")}>
        <button
          type="button"
          aria-pressed={checked}
          onClick={onToggleChecked}
          className={cls(
            "mt-0.5 flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-md border transition-all duration-200",
            checked
              ? "border-[#0A4D82] bg-[#0A4D82] text-white shadow-[0_6px_12px_rgba(10,77,130,0.22)]"
              : "border-[#CAD6E3] bg-white text-transparent hover:border-[#9DB8D4]"
          )}
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <button type="button" onClick={onToggleChecked} className="min-w-0 flex-1 text-left">
              <SummaryGuaranteeItem title={title} icon={IconComponent} compact />
            </button>
            <button type="button" onClick={onToggleExpand} className="flex shrink-0 items-center gap-2 text-left">
              <span className={cls("whitespace-nowrap text-[12px] font-medium", checked ? "text-slate-600" : "text-slate-500")}>
                {premium}
              </span>
              <ChevronDown className={cls("mt-0.5 h-4 w-4 shrink-0 text-slate-500 transition duration-200", expanded && "rotate-180")} />
            </button>
          </div>
          {expanded && coverageAmount ? (
            <div className="mt-1.5 pl-[30px] text-[12px] leading-5 text-slate-600">
              <span className="font-medium text-slate-700">Nilai pertanggungan: </span>
              <span>{coverageAmount}</span>
            </div>
          ) : null}
          {expanded ? <div className={cls("text-[12.5px] leading-5 text-slate-600", coverageAmount ? "mt-1 pl-[30px]" : "mt-1.5 pl-[30px]")}>{detail}</div> : null}
          {expanded && deductible ? (
            <div className="mt-2 pl-[30px] text-[12px] leading-5 text-slate-600">
              {deductibleIsDirectText(deductible) ? (
                <span>{String(deductible || "")}</span>
              ) : (
                <>
                  <span className="font-medium text-slate-700">Risiko sendiri saat klaim: </span>
                  <span>{String(deductible || "")}</span>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
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
  objectRows = [],
  uwForm,
  setUwField,
  uploads,
  setUploads,
  setEvidence,
  external = false,
}) {
  const identityLabel = customerType === "Badan Usaha" ? "NPWP" : "NIK";
  const insuredName = selectedCustomer ? selectedCustomer.name : form.identity;
  const coverageEndDate = calculateCoverageEnd(uwForm.coverageStartDate);
  const customerSectionTitle = "Informasi Calon Pemegang Polis";
  const propertySectionTitle = "Informasi Properti";
  const photoSectionTitle = external ? "Lampiran Foto Properti" : "Foto Properti";
  const photoSectionSubtitle = external
    ? "Tambahkan foto properti agar penawaran dapat dilanjutkan ke versi final."
    : "Wajib diisi oleh petugas internal.";
  const fireProtectionChoice = uwForm.fireProtectionChoice || (uwForm.fireProtection && uwForm.fireProtection !== "Tidak Ada" ? "Ada" : "Tidak Ada");
  const fireProtectionItems = selectedFireProtectionItems(uwForm);
  const hasStockObject = objectRows.some((row) => row.type === "Stok");
  const selectedStockTypeMeta = STOCK_TYPE_OPTIONS.find((item) => item.label === uwForm.stockType);
  const setFireProtectionChoice = (value) => {
    setUwField("fireProtectionChoice", value);
    if (value === "Tidak Ada") {
      setUwField("fireProtectionItems", []);
      setUwField("fireProtection", "Tidak Ada");
    } else {
      setUwField("fireProtection", fireProtectionItems.length ? fireProtectionItems.join(" + ") : "");
    }
  };
  const toggleFireProtectionItem = (item) => {
    const nextItems = fireProtectionItems.includes(item)
      ? fireProtectionItems.filter((value) => value !== item)
      : fireProtectionItems.concat(item);
    setUwField("fireProtectionChoice", "Ada");
    setUwField("fireProtectionItems", nextItems);
    setUwField("fireProtection", nextItems.join(" + "));
  };

  return (
    <div className="space-y-5">
      <SectionCard title={customerSectionTitle}>
        <div className="grid gap-4 md:grid-cols-2">
          <div><FieldLabel label={identityLabel} /><TextInput value={uwForm.idNumber} onChange={(value) => setUwField("idNumber", onlyDigits(value))} placeholder={customerType === "Badan Usaha" ? "Masukkan NPWP" : "Masukkan NIK"} icon={<User className="h-4 w-4" />} /></div>
          {customerType === "Badan Usaha" ? <div><FieldLabel label="Kontak di Lokasi" required /><div className="space-y-2"><TextInput value={uwForm.picName} onChange={(value) => setUwField("picName", value)} placeholder={insuredName || "Nama kontak yang bisa dihubungi di lokasi"} icon={<User className="h-4 w-4" />} /><label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={uwForm.sameAsInsured} onChange={(event) => setUwField("sameAsInsured", event.target.checked)} />Sama dengan pemegang polis</label></div></div> : null}
        </div>
      </SectionCard>

      <SectionCard title={propertySectionTitle}>
        <div className="grid gap-4 md:grid-cols-2">
          <div><FieldLabel label="Riwayat klaim 3 tahun terakhir" required /><SelectInput value={uwForm.claimHistory} onChange={(value) => setUwField("claimHistory", value)} options={CLAIM_HISTORY_OPTIONS} placeholder="Bagaimana riwayat klaim properti ini?" /></div>
        <div><FieldLabel label="Jangka Waktu Pertanggungan (Mulai)" required /><TextInput type="date" value={uwForm.coverageStartDate} onChange={(value) => setUwField("coverageStartDate", value)} /></div>
        <div><FieldLabel label="Jangka Waktu Pertanggungan (Akhir)" /><TextInput value={coverageEndDate} onChange={() => {}} placeholder="Otomatis 1 tahun" readOnly={true} /></div>
          {hasStockObject ? (
            <div>
              <FieldLabel label="Jenis Stok" required />
              <SelectInput value={uwForm.stockType || ""} onChange={(value) => setUwField("stockType", value)} options={STOCK_TYPE_OPTIONS.map((item) => item.label)} placeholder="Pilih jenis stok" />
              {!external && selectedStockTypeMeta ? (
                <div className="mt-1 text-xs leading-5 text-slate-500">
                  Kategori stok: <span className="font-medium text-slate-700">{selectedStockTypeMeta.risk.toLowerCase()}</span>.
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="md:col-span-2">
            <FieldLabel label="Perlindungan kebakaran yang tersedia" required />
            <div className="grid gap-3 sm:grid-cols-2">
              {FIRE_PROTECTION_CHOICES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFireProtectionChoice(item)}
                  className={cls(
                    "flex min-h-[46px] items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition",
                    fireProtectionChoice === item ? "border-[#0A4D82] bg-[#F8FBFE] text-[#0A4D82]" : "border-[#D5DDE6] bg-white text-slate-700 hover:bg-slate-50",
                  )}
                >
                  <span>{item}</span>
                  <span className={cls("flex h-5 w-5 items-center justify-center rounded border", fireProtectionChoice === item ? "border-[#0A4D82] bg-[#0A4D82] text-white" : "border-slate-300 bg-white text-transparent")}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                </button>
              ))}
            </div>
            {fireProtectionChoice === "Ada" ? (
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                {FIRE_PROTECTION_ITEMS.map((item) => {
                  const checked = fireProtectionItems.includes(item);
                  return (
                    <label
                      key={item}
                      className={cls(
                        "flex min-h-[46px] cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-sm font-semibold",
                        checked ? "border-[#0A4D82] bg-[#F8FBFE] text-[#0A4D82]" : "border-[#D5DDE6] bg-white text-slate-700",
                      )}
                    >
                      <input type="checkbox" checked={checked} onChange={() => toggleFireProtectionItem(item)} className="h-5 w-5 rounded border-slate-300 text-[#0A4D82] focus:ring-[#0A4D82]" />
                      <span>{item}</span>
                    </label>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </SectionCard>

      <SectionCard title={photoSectionTitle} subtitle={photoSectionSubtitle}>
        <div className="grid gap-4 md:grid-cols-3"><CameraCaptureCard title="Foto Tampak Depan" description="Wajib diisi." image={uploads.frontView} onCapture={(value) => { setUploads((prev) => ({ ...prev, frontView: value })); setEvidence((prev) => ({ ...prev, photos: { ...prev.photos, frontView: value ? createPhotoEvidence({ label: "Foto Tampak Depan", declaredAddress: form.locationSearch }) : null } })); }} /><CameraCaptureCard title="Foto Samping Kanan" description="Wajib diisi." image={uploads.sideRightView} onCapture={(value) => { setUploads((prev) => ({ ...prev, sideRightView: value })); setEvidence((prev) => ({ ...prev, photos: { ...prev.photos, sideRightView: value ? createPhotoEvidence({ label: "Foto Samping Kanan", declaredAddress: form.locationSearch }) : null } })); }} /><CameraCaptureCard title="Foto Samping Kiri" description="Wajib diisi." image={uploads.sideLeftView} onCapture={(value) => { setUploads((prev) => ({ ...prev, sideLeftView: value })); setEvidence((prev) => ({ ...prev, photos: { ...prev.photos, sideLeftView: value ? createPhotoEvidence({ label: "Foto Samping Kiri", declaredAddress: form.locationSearch }) : null } })); }} /></div>
      </SectionCard>
    </div>
  );
}

function ExternalProposalPage({ mode, customerName, form, setFormField = () => {}, uwForm, propertyType, occupancy, setOccupancy = () => {}, occupancyOptions = OCCUPANCY_OPTIONS, objectRows, updateObjectRow = () => {}, addObjectRow = () => {}, removeObjectRow = () => {}, totalValue, estimatedTotal, basePremium, extensionPremium, stampDuty, selectedGuarantees, setSelectedGuarantees, expandedRows, setExpandedRows, constructionClass, onBack, onPrimary, onSecondary, canProceed, preparedBy, operatingRecord, transactionAuthority, productConfig, extensionOptions, viewerMode = "customer", senderName = "", onViewerModeChange = () => {} }) {
  const isIndicative = mode === "indicative";
  const isInternalPreview = viewerMode === "internal";
  const activeVariant = productConfig || getPropertyVariant("property-safe");
  const PrimaryCoverageIcon = activeVariant.key === "property-all-risk" ? Shield : Flame;
  const operatingStatusValue = operatingRecord?.status;
  const operatingVersion = operatingRecord?.version;
  const operatingValidUntil = operatingRecord?.validUntil;
  const operatingOwner = operatingRecord?.owner;
  const operatingId = operatingRecord?.id;
  const primaryLabel = isIndicative ? "Isi Data Lanjutan" : "Pembayaran";
  const constructionInfo = CONSTRUCTION_GUIDE.find((item) => item.title === constructionClass);
  const [summaryEditing, setSummaryEditing] = useState({ insured: false, property: false });
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
  const customerDisplay = customerName || "-";
  const greetingRecipientName = customerDisplay && customerDisplay !== "-"
    ? String(customerDisplay).trim().split(/\s+/)[0]
    : "Calon Tertanggung";
  const coverageValue = "Rp " + formatRupiah(totalValue);
  const objectTypeSummary = objectRows.length
    ? Array.from(new Set(objectRows.map((row) => String(row.type || "").trim()).filter(Boolean))).join(", ")
    : "Belum ada objek yang dipilih";
  const mainCoverageDeductible = constructionClass === "Kelas 1" ? activeVariant.primaryCoverageDeductibleClassOne : activeVariant.primaryCoverageDeductibleOther;
  const selectedExtensionDetailItems = selectedExtensions.map((item) => ({
    ...item,
    premium: "Rp " + formatRupiah(Math.round(totalValue * item.rate)),
    deductible: item.key === "earthquake" ? "2,5% dari Rp " + formatRupiah(totalValue) : item.deductible,
  }));
  const constructionSummaryLabel = constructionClass || "Belum dipilih";
  const hasStockObject = objectRows.some((row) => row.type === "Stok");
  const selectedStockTypeMeta = STOCK_TYPE_OPTIONS.find((item) => item.label === uwForm.stockType);
  const stockTypeSummary = selectedStockTypeMeta ? `${selectedStockTypeMeta.label} (${selectedStockTypeMeta.risk})` : uwForm.stockType || "-";
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

          <div className="mx-auto mt-6 max-w-[960px] rounded-[28px] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-6 rounded-[18px] border border-[#D8E1EA] bg-[#F8FBFE] px-4 py-5 md:flex-row md:items-center md:gap-4 md:px-6">
              <StepNode step="Langkah 1" title="Tinjau Penawaran" subtitle={isIndicative ? "Sedang dibuka" : "Selesai"} active={isIndicative} done={!isIndicative} icon={<FileText className="h-4 w-4" />} onClick={isIndicative ? undefined : onSecondary} />
              <div className="hidden h-px flex-1 self-center bg-slate-300 md:block" />
              <StepNode step="Langkah 2" title="Data Lanjutan" subtitle={isIndicative ? "Menunggu" : "Selesai"} active={false} done={!isIndicative} icon={<FileText className="h-4 w-4" />} />
              {!isInternalPreview ? <div className="hidden h-px flex-1 self-center bg-slate-300 md:block" /> : null}
              {!isInternalPreview ? <StepNode step="Langkah 3" title="Pembayaran" subtitle={isIndicative ? "Menunggu" : "Siap dilanjutkan"} active={!isIndicative} done={false} icon={<Wallet className="h-4 w-4" />} /> : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[860px] px-4 py-6 md:px-6">
        <div className="space-y-3">
          <SectionCard
            title="Ringkasan Penawaran Anda"
            subtitle={`Ringkasan ini disusun dari data SPAU (Surat Permohonan Asuransi Umum) elektronik yang Anda isi dan lengkapi, serta mengacu pada ${activeVariant.policyDocumentName || activeVariant.primaryCoverageTitle}.`}
            headerAlign="center"
          >
            <div className="rounded-[24px] border border-[#D8E1EA] bg-[linear-gradient(180deg,#FBFDFF_0%,#F5F9FD_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              <div className="space-y-3">
                <OfferSummarySection
                  title="Ringkasan Informasi Calon Pemegang Polis"
                  action={!isInternalPreview && !summaryEditing.insured ? <SummaryEditButton onClick={() => setSummaryEditing({ insured: true, property: false })} /> : null}
                >
                  {summaryEditing.insured ? (
                    <div className="space-y-4">
                      <OfferSummaryKeyValue label="Nama Calon Pemegang Polis" value={customerDisplay} />
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <FieldLabel label="Alamat Email" required />
                          <TextInput value={form.email} onChange={(value) => setFormField("email", value)} placeholder="nama@email.com" icon={<Mail className="h-4 w-4" />} type="email" />
                        </div>
                        <div>
                          <FieldLabel label="Nomor Handphone" required />
                          <TextInput value={form.phone} onChange={(value) => setFormField("phone", value)} placeholder="08xxxxxxxxxx" icon={<Phone className="h-4 w-4" />} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm text-slate-500">Yang bisa diubah di bagian ini hanya alamat email dan nomor handphone.</div>
                        <button
                          type="button"
                          onClick={() => setSummaryEditing((prev) => ({ ...prev, insured: false }))}
                          className="inline-flex h-9 items-center rounded-[10px] bg-[#0A4D82] px-4 text-sm font-semibold text-white hover:bg-[#0D5B98]"
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <OfferSummaryKeyValue label="Nama Calon Pemegang Polis" value={customerDisplay} />
                      <OfferSummaryKeyValue label="Alamat Email" value={emailDisplay} />
                      <OfferSummaryKeyValue label="Nomor Handphone" value={phoneDisplay} />
                    </div>
                  )}
                </OfferSummarySection>

                <OfferSummarySection
                  title="Ringkasan Informasi Properti"
                  action={!isInternalPreview && !summaryEditing.property ? <SummaryEditButton onClick={() => setSummaryEditing({ insured: false, property: true })} /> : null}
                >
                  {summaryEditing.property ? (
                    <div className="space-y-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <FieldLabel label="Penggunaan Properti yang Diasuransikan" required />
                          <SelectInput value={occupancy} onChange={setOccupancy} options={occupancyOptions} placeholder="Pilih penggunaan properti" />
                        </div>
                        <div>
                          <FieldLabel label="Dinding Utama" required />
                          <SelectInput value={form.wallMaterial} onChange={(value) => setFormField("wallMaterial", value)} options={WALL_MATERIAL_OPTIONS} placeholder="Pilih material dinding" />
                        </div>
                        <div>
                          <FieldLabel label="Struktur / Lantai Utama" required />
                          <SelectInput value={form.structureMaterial} onChange={(value) => setFormField("structureMaterial", value)} options={STRUCTURE_MATERIAL_OPTIONS} placeholder="Pilih material struktur" />
                        </div>
                        <div>
                          <FieldLabel label="Atap Bangunan" required />
                          <SelectInput value={form.roofMaterial} onChange={(value) => setFormField("roofMaterial", value)} options={ROOF_MATERIAL_OPTIONS} placeholder="Pilih material atap" />
                        </div>
                        <div>
                          <FieldLabel label="Bagian mudah terbakar lainnya?" required />
                          <SelectInput value={form.flammableMaterial} onChange={(value) => setFormField("flammableMaterial", value)} options={FLAMMABLE_MATERIAL_OPTIONS} placeholder="Pilih kondisi material" />
                        </div>
                      </div>
                      {constructionInfo ? <div className="rounded-xl border border-[#D5DDE6] bg-[#F8FBFE] px-3 py-2.5 text-sm leading-6 text-slate-600"><span className="font-semibold text-[#0A4D82]">{constructionInfo.title}.</span> {constructionInfo.desc}</div> : null}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-[14px] font-semibold text-slate-900">Objek yang Dijamin</div>
                          <button type="button" onClick={addObjectRow} className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            <Plus className="h-4 w-4" />
                            Tambah Objek
                          </button>
                        </div>
                        {objectRows.map((row) => (
                          <div key={row.id} className="rounded-xl border border-slate-200 bg-white p-3">
                            <div className="grid gap-2.5 lg:grid-cols-[170px_minmax(0,1fr)_minmax(0,1.2fr)_40px] lg:items-center">
                              <SelectInput value={row.type} onChange={(value) => updateObjectRow(row.id, { type: value })} options={OBJECT_TYPES} placeholder="Jenis Objek" />
                              <CurrencyInput value={row.amount} onChange={(value) => updateObjectRow(row.id, { amount: value })} placeholder="Harga Pertanggungan" />
                              <TextInput value={row.note} onChange={(value) => updateObjectRow(row.id, { note: value })} placeholder={shortObjectLabel(row.type)} />
                              <button type="button" onClick={() => removeObjectRow(row.id)} className="inline-flex h-[44px] items-center justify-center rounded-[10px] border border-slate-300 text-slate-500 hover:bg-slate-50" title="Hapus objek">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm text-slate-500">Harga pertanggungan dan premi akan mengikuti perubahan data properti di bagian ini.</div>
                        <button
                          type="button"
                          onClick={() => setSummaryEditing((prev) => ({ ...prev, property: false }))}
                          className="inline-flex h-9 items-center rounded-[10px] bg-[#0A4D82] px-4 text-sm font-semibold text-white hover:bg-[#0D5B98]"
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <OfferSummaryKeyValue label="Penggunaan Properti yang Diasuransikan" value={occupancy} />
                      <OfferSummaryKeyValue
                        label="Objek yang Dijamin"
                        emphasize
                        value={
                          objectRows.length ? (
                            <div className="space-y-0.5">
                              {objectRows.map((row) => (
                                <div key={row.id}>
                                  <span className="font-semibold">{row.type || "Objek"}</span>
                                  <span>: Rp {formatRupiah(parseNumber(row.amount))}</span>
                                  {row.note ? <span className="text-slate-600">, {row.note}</span> : null}
                                </div>
                              ))}
                            </div>
                          ) : (
                            objectTypeSummary
                          )
                        }
                      />
                      {!isIndicative && hasStockObject ? <OfferSummaryKeyValue label="Jenis Stok" value={stockTypeSummary} /> : null}
                      <OfferSummaryKeyValue
                        label="Kelas Konstruksi"
                        value={constructionInfo ? `${constructionSummaryLabel}: ${constructionInfo.desc}` : constructionSummaryLabel}
                        emphasize
                      />
                      <OfferSummaryKeyValue label="Harga Pertanggungan" value={coverageValue} />
                      <OfferSummaryKeyValue label="Cakupan Polis" value={activeVariant.policyDocumentName || activeVariant.primaryCoverageTitle} />
                    </div>
                  )}
                </OfferSummarySection>

                <OfferSummarySection title="Ringkasan Syarat dan Ketentuan">
                  <div className="space-y-4">
                    <div className="rounded-xl border border-[#D8E1EA] bg-[linear-gradient(180deg,#FFFFFF_0%,#F7FAFD_100%)] px-4 py-3">
                      <div className="text-[15px] font-medium leading-[1.4] text-slate-900">{activeVariant.policyDocumentName || activeVariant.primaryCoverageTitle}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-[14px] font-medium text-slate-600">Risiko yang dijamin</div>
                      <PropertyGuaranteeDetailCard
                        title={activeVariant.primaryCoverageTitle}
                        icon={PrimaryCoverageIcon}
                        premium={"Rp " + formatRupiah(basePremium)}
                        detail={activeVariant.primaryCoverageDescription}
                        deductible={mainCoverageDeductible}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-[14px] font-medium text-slate-600">Perluasan Jaminan</div>
                        {!isIndicative && !isInternalPreview ? (
                          <button
                            type="button"
                            onClick={onSecondary}
                            className="text-[12px] font-medium text-[#0A4D82] underline underline-offset-2 hover:text-[#0D5B98]"
                          >
                            {selectedExtensionDetailItems.length ? "Ubah Perluasan Jaminan" : "Tambahkan Perluasan Jaminan"}
                          </button>
                        ) : null}
                      </div>
                      {isIndicative ? (
                        <div className="space-y-2">
                          {extensionOptions.map((item) => {
                            const checked = !!selectedGuarantees[item.key];
                            const deductibleValue = item.key === "earthquake" ? "2,5% dari Rp " + formatRupiah(totalValue) : item.deductible;
                            const toggleChecked = isInternalPreview ? undefined : () => setSelectedGuarantees((prev) => ({ ...prev, [item.key]: !prev[item.key] }));
                            return (
                              <PreviewPropertyGuaranteeOption
                                key={item.key}
                                title={item.title}
                                icon={item.icon}
                                premium={"Rp " + formatRupiah(Math.round(totalValue * item.rate))}
                                checked={checked}
                                expanded={!!expandedRows[item.key]}
                                onToggleChecked={toggleChecked || (() => {})}
                                onToggleExpand={() => setExpandedRows((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                                detail={item.detail}
                                deductible={deductibleValue}
                              />
                            );
                          })}
                        </div>
                      ) : selectedExtensionDetailItems.length ? (
                        <div className="space-y-2">
                          {selectedExtensionDetailItems.map((item) => (
                            <PropertyGuaranteeDetailCard
                              key={item.key}
                              title={item.title}
                              icon={item.icon || Shield}
                              premium={item.premium}
                              detail={item.detail}
                              deductible={item.deductible}
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </OfferSummarySection>

                <OfferSummarySection title="Ringkasan Pembayaran">
                  <PremiumPriceHero
                    label="Total Pembayaran"
                    value={"Rp " + formatRupiah(estimatedTotal)}
                    tooltipText={isIndicative ? "Total pembayaran ini masih perkiraan awal. Setelah Data Lanjutan dilengkapi, nilainya dapat dihitung ulang sesuai informasi akhir." : undefined}
                  />
                  <PremiumBreakdown>
                    <ProposalRow label="Premi" value={"Rp " + formatRupiah(basePremium)} />
                    {extensionPremium ? <ProposalRow label="Premi Perluasan" value={"Rp " + formatRupiah(extensionPremium)} /> : null}
                    <ProposalRow label="Biaya Meterai" value={"Rp " + formatRupiah(stampDuty)} />
                  </PremiumBreakdown>
                </OfferSummarySection>

                {!isInternalPreview ? (
                  <div className="rounded-[24px] border border-[#D8E1EA] bg-white p-4 shadow-sm">
                    <div className={cls("grid gap-2", isIndicative ? "sm:grid-cols-1" : "sm:grid-cols-2")}>
                      {!isIndicative ? (
                        <button
                          type="button"
                          onClick={onSecondary}
                          className="flex h-[48px] w-full items-center justify-center rounded-[12px] border border-[#D5DDE6] bg-white px-4 text-sm font-semibold text-[#0A4D82] hover:bg-[#F8FBFE]"
                        >
                          Kembali
                        </button>
                      ) : null}
                      <button
                        type="button"
                        disabled={!canProceed || (!isIndicative && offerMeta.isExpired)}
                        onClick={onPrimary}
                        className={cls(
                          "flex h-[48px] w-full items-center justify-center rounded-[12px] px-5 text-sm font-semibold text-white shadow-sm",
                          isIndicative ? "sm:col-span-full" : "sm:col-start-2",
                          canProceed && (isIndicative || !offerMeta.isExpired)
                            ? "bg-[#F5A623] hover:brightness-105"
                            : "cursor-not-allowed bg-slate-400"
                        )}
                      >
                        {primaryLabel}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function ExternalPaymentPage({ customerName, estimatedTotal, paymentMethod, onSelectMethod, onBack, onProceedPayment, paymentStatus, operatingRecord, isExpired, onSimulate }) {
  const operatingBlockedMessage = paymentBlockMessage(operatingRecord);
  const canProceedPayment = canProceedToPaymentFromOperating(operatingRecord);
  return (
    <div className="min-h-screen bg-[#F3F5F7] text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-3"><div className="text-[18px] font-black leading-tight text-[#0A4D82]">Danantara<div className="-mt-1">Indonesia</div></div><div className="text-[16px] font-semibold text-slate-700">asuransi jasindo</div></div>
          <div className="flex items-center gap-3">
            {onSimulate ? <button type="button" onClick={onSimulate} className="hidden h-10 items-center justify-center rounded-[10px] border border-[#0A4D82]/25 bg-[#F8FBFE] px-4 text-sm font-semibold text-[#0A4D82] shadow-sm transition hover:bg-[#EAF3FB] md:inline-flex">Simulasi</button> : null}
            <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-[10px] border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><ArrowLeft className="h-4 w-4" />Kembali</button>
          </div>
        </div>
      </div>
      <div className="bg-[#0A4D82] pb-8">
        <div className="mx-auto max-w-[960px] px-4 pt-6 md:px-6">
          <div className="mx-auto rounded-[28px] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-6 rounded-[18px] border border-[#D8E1EA] bg-[#F8FBFE] px-4 py-5 md:flex-row md:items-center md:gap-4 md:px-6">
              <StepNode step="Langkah 1" title="Tinjau Penawaran" subtitle="Selesai" active={false} done={true} icon={<FileText className="h-4 w-4" />} />
              <div className="hidden h-px flex-1 self-center bg-slate-300 md:block" />
              <StepNode step="Langkah 2" title="Data Lanjutan" subtitle="Selesai" active={false} done={true} icon={<FileText className="h-4 w-4" />} />
              <div className="hidden h-px flex-1 self-center bg-slate-300 md:block" />
              <StepNode step="Langkah 3" title="Pembayaran" subtitle="Sedang dibuka" active={true} done={false} icon={<Wallet className="h-4 w-4" />} />
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1100px] px-4 py-8 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <SectionCard title="Pembayaran" subtitle="Halaman ini hanya muncul untuk calon tertanggung, bukan untuk user internal.">
            <div className="space-y-3">{PAYMENT_OPTIONS.map((item) => <button key={item} type="button" onClick={() => onSelectMethod(item)} className={cls("flex w-full items-center justify-between rounded-xl border px-4 py-4 text-left", paymentMethod === item ? "border-[#0A4D82] bg-[#F8FBFE]" : "border-slate-200 bg-white")}><span className="font-semibold text-slate-900">{item}</span>{paymentMethod === item ? <CheckCircle2 className="h-5 w-5 text-[#0A4D82]" /> : null}</button>)}</div>
            {operatingBlockedMessage ? <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{operatingBlockedMessage}</div> : null}
            {isExpired ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Masa berlaku penawaran ini sudah berakhir. Silakan minta versi penawaran terbaru sebelum melanjutkan pembayaran.</div> : null}
            {paymentStatus ? <div className="mt-4 rounded-xl border border-[#CFE0F0] bg-[#F8FBFE] p-4 text-sm text-[#0A4D82]">{paymentStatus}</div> : null}
          </SectionCard>
    <aside className="h-fit self-start rounded-2xl bg-[#0A4D82] p-5 text-white shadow-lg lg:sticky lg:top-24"><div className="text-[18px] font-bold">Ringkasan Pembayaran</div><div className="mt-4 rounded-xl bg-white/10 p-4"><div className="text-sm text-white/75">Nasabah</div><div className="mt-1 font-semibold">{customerName || "Calon nasabah"}</div></div><div className="mt-3 rounded-xl bg-white/10 p-4"><div className="text-sm text-white/75">Total yang Dibayar</div><div className="mt-2 text-[30px] font-bold leading-none">Rp {formatRupiah(estimatedTotal)}</div></div><div className="mt-3 rounded-xl bg-white/10 p-4"><div className="text-sm text-white/75">Metode Pembayaran</div><div className="mt-1 font-semibold">{paymentMethod || "Pilih metode pembayaran"}</div></div><button type="button" disabled={!paymentMethod || !canProceedPayment || isExpired} onClick={onProceedPayment} className={cls("mt-4 flex h-[48px] w-full items-center justify-center rounded-[12px] text-sm font-bold uppercase tracking-wide text-white shadow-sm", paymentMethod && canProceedPayment && !isExpired ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}>Pembayaran</button></aside>
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
  const availableOccupancyOptions = useMemo(
    () => getOccupancyOptionsForPropertyTypes(availablePropertyTypes),
    [availablePropertyTypes],
  );
  const [currentProductVariant, setCurrentProductVariant] = useState(productVariant);
  const activeVariant = getPropertyVariant(currentProductVariant);
  const PrimaryCoverageIcon = activeVariant.key === "property-all-risk" ? Shield : Flame;
  const isInternalMode = entryMode === "internal";
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
  const [externalView, setExternalView] = useState("");
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
  const [externalViewerMode, setExternalViewerMode] = useState("customer");
  const [sharedReferralCode, setSharedReferralCode] = useState("");
  const [sharedSenderName, setSharedSenderName] = useState("");
  const [sharedCustomerName, setSharedCustomerName] = useState("");
  const [sharedOfferSnapshot, setSharedOfferSnapshot] = useState(null);
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
    wallMaterial: "",
    structureMaterial: "",
    roofMaterial: "",
    flammableMaterial: "",
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
  const today = formatDateInput(new Date());
  const [objectRows, setObjectRows] = useState([{ id: "obj-1", type: "", amount: "", note: "" }]);
  const [uwForm, setUwForm] = useState({
    idNumber: "",
    sameAsInsured: true,
    picName: "",
    coverageStartDate: today,
    fireProtection: "Tidak Ada",
    fireProtectionChoice: "Tidak Ada",
    fireProtectionItems: [],
    claimHistory: "Tidak Ada",
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
  const effectivePropertyType = (form.occupancy && derivePropertyTypeFromOccupancy(form.occupancy, availablePropertyTypes)) || form.propertyType;

  const customerSuggestions = useMemo(() => {
    const keyword = String(form.identity || "").trim().toLowerCase();
    if (!keyword) return [];
    return MOCK_CIF.filter((item) => item.name.toLowerCase().includes(keyword) || item.cif.toLowerCase().includes(keyword)).slice(0, 5);
  }, [form.identity]);
  const showFloorInput = selectedGuarantees.earthquake && isFloorRelevant(effectivePropertyType, form.occupancy);
  const fraudAlerts = useMemo(() => summarizeFraudSignals({ documentChecks: [documentChecks.ktp], evidenceChecks: [evidence.location, evidence.photos.frontView, evidence.photos.sideRightView, evidence.photos.sideLeftView] }), [documentChecks, evidence]);
  const operatingVersion = operatingRecord?.version;
  const operatingOwner = operatingRecord?.owner;
  const operatingId = operatingRecord?.id;
  const operatingValidUntil = operatingRecord?.validUntil;
  const transactionAuthority = useMemo(
    () =>
      createTransactionAuthority({
        productCode: activeVariant.productCode,
        primaryValue: selectedCustomer?.name || form.identity || form.occupancy || effectivePropertyType,
        versionLabel: operatingVersion || (internalStep === 1 ? "Rev 1" : "Rev 2"),
        preparedBy: operatingOwner || sessionName || "Tim Jasindo",
        transactionId: operatingId,
        validUntil: operatingValidUntil || "",
      }),
    [activeVariant.productCode, effectivePropertyType, form.identity, form.occupancy, internalStep, operatingId, operatingOwner, operatingValidUntil, operatingVersion, selectedCustomer?.name, sessionName],
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
    if (form.occupancy && !availableOccupancyOptions.includes(form.occupancy)) {
      setForm((prev) => ({ ...prev, occupancy: "", propertyType: "" }));
      return;
    }
    if (form.occupancy) {
      const derivedPropertyType = derivePropertyTypeFromOccupancy(form.occupancy, availablePropertyTypes);
      if (derivedPropertyType && form.propertyType !== derivedPropertyType) {
        setForm((prev) => ({ ...prev, propertyType: derivedPropertyType }));
      }
    }
  }, [availableOccupancyOptions, availablePropertyTypes, form.occupancy, form.propertyType]);
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
    const { view, viewer, referral, sender, customer, offer } = readShareContextFromUrl();
    const isSharedOfferView = view === "offer-indicative" || view === "offer-final" || view === "external-underwriting" || view === "payment";
    if (isSharedOfferView && offer) {
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
      wallMaterial: sharedOfferSnapshot.wallMaterial || prev.wallMaterial,
      structureMaterial: sharedOfferSnapshot.structureMaterial || prev.structureMaterial,
      roofMaterial: sharedOfferSnapshot.roofMaterial || prev.roofMaterial,
      flammableMaterial: sharedOfferSnapshot.flammableMaterial || prev.flammableMaterial,
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
  }, [selectedGuarantees.earthquake, showFloorInput, quoted, externalView, form.occupancy]);

  const setField = (key, value) =>
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "occupancy") {
        next.propertyType = derivePropertyTypeFromOccupancy(value, availablePropertyTypes);
      }
      if (["wallMaterial", "structureMaterial", "roofMaterial", "flammableMaterial"].includes(key)) {
        next.constructionClass = deriveConstructionClass(next);
      }
      return next;
    });
  const setUwField = (key, value) => setUwForm((prev) => ({ ...prev, [key]: value }));
  const updateObjectRow = (id, patch) => setObjectRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  const addObjectRow = () => setObjectRows((prev) => prev.concat({ id: "obj-" + Date.now(), type: "", amount: "", note: "" }));
  const removeObjectRow = (id) => setObjectRows((prev) => (prev.length === 1 ? prev : prev.filter((row) => row.id !== id)));
  const totalValue = useMemo(() => objectRows.reduce((sum, row) => sum + parseNumber(row.amount), 0), [objectRows]);
  const baseRate = effectivePropertyType === "Rumah Tinggal" ? 0.00185 : 0.00265;
  const hasQuoteBasis = Boolean(form.occupancy) && Boolean(form.constructionClass) && totalValue > 0;
  const basePremiumNumber = hasQuoteBasis ? Math.max(Math.round(totalValue * baseRate), 150000) : 0;
  const stampDutyNumber = hasQuoteBasis ? 10000 + (selectedGuarantees.earthquake ? 10000 : 0) : 0;
  const guaranteeBreakdown = activeGuarantees.filter((item) => selectedGuarantees[item.key]).map((item) => ({ ...item, premium: Math.round(totalValue * item.rate) }));
  const additionalPremiumNumber = guaranteeBreakdown.reduce((sum, item) => sum + item.premium, 0);
  const estimatedTotalNumber = hasQuoteBasis ? basePremiumNumber + additionalPremiumNumber + stampDutyNumber : 0;
  const customerName = selectedCustomer ? selectedCustomer.name : form.identity;
  const effectiveCustomerName = customerName || sharedCustomerName;
  const occupancyCode = getOccupancyCode(effectivePropertyType, form.occupancy);
  const constructionInfo = CONSTRUCTION_GUIDE.find((item) => item.title === form.constructionClass);
  const currentExternalTarget = internalStep === 2 ? "offer-final" : "offer-indicative";
  const referralCode = createReferralCode(sessionName, transactionAuthority.transactionId);
  const shareSnapshot = encodeShareSnapshot({
    identity: customerName,
    customerType: form.customerType,
    phone: form.phone,
    email: form.email,
    propertyType: effectivePropertyType,
    occupancy: form.occupancy,
    constructionClass: form.constructionClass,
    wallMaterial: form.wallMaterial,
    structureMaterial: form.structureMaterial,
    roofMaterial: form.roofMaterial,
    flammableMaterial: form.flammableMaterial,
    locationSearch: form.locationSearch,
    objectRows,
    selectedGuarantees,
    floorCount,
  });
  const externalJourneyKey = activeVariant.key === "property-all-risk" ? "property-all-risk-external" : "property-external";
  const shareUrl = getShareUrl(currentExternalTarget, {
    journey: externalJourneyKey,
    role: "guest",
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
  const hasValidStepOneOccupancy = Boolean(form.occupancy);
  const hasValidStepOneLocation = Boolean(form.locationSearch.trim());
  const hasValidConstruction = Boolean(form.constructionClass);
  const hasValidObjects = totalValue > 0 && objectRows.every((row) => parseNumber(row.amount) > 0);
  const hasStockObject = objectRows.some((row) => row.type === "Stok");
  const hasRequiredFloorCount = !showFloorInput || Number(floorCount) > 0;
  const canAdvanceInternalStepOne = hasValidStepOneIdentity && hasValidStepOneContact && hasValidStepOneOccupancy && hasValidStepOneLocation && hasValidConstruction && hasValidObjects && hasRequiredFloorCount;
  const hasValidUwIdentity = !uwForm.idNumber.trim() || isValidIdNumber(form.customerType, uwForm.idNumber);
  const hasValidPicName = form.customerType !== "Badan Usaha" || Boolean(uwForm.picName.trim());
  const hasValidStockType = !hasStockObject || Boolean(String(uwForm.stockType || "").trim());
  const hasValidUnderwriting = Boolean(uwForm.coverageStartDate) && hasValidFireProtection(uwForm) && Boolean(uwForm.claimHistory) && hasValidStockType;
  const hasCompleteUploads = hasRequiredUploads(uploads);
  const canAdvanceUnderwriting = hasValidUwIdentity && hasValidPicName && hasValidUnderwriting && hasCompleteUploads;
  const stepOnePendingItems = [];
  if (!hasValidStepOneIdentity) stepOnePendingItems.push("Isi nama calon pemegang polis atau pilih CIF.");
  if (!hasValidStepOneContact) stepOnePendingItems.push("Lengkapi nomor handphone dan alamat email yang valid.");
  if (!hasValidStepOneOccupancy) stepOnePendingItems.push("Pilih penggunaan properti yang diasuransikan.");
  if (!hasValidStepOneLocation) stepOnePendingItems.push("Isi lokasi properti atau gunakan tombol lokasi cepat.");
  if (!hasValidConstruction) stepOnePendingItems.push("Pilih kelas konstruksi.");
  if (!hasValidObjects) stepOnePendingItems.push("Setiap objek harus punya nilai yang ingin dilindungi.");
  if (!hasRequiredFloorCount) stepOnePendingItems.push("Lengkapi jumlah lantai pada perluasan Risiko Gempa Bumi.");
  const underwritingPendingItems = [];
  if (uwForm.idNumber.trim() && !hasValidUwIdentity) underwritingPendingItems.push(form.customerType === "Badan Usaha" ? "NPWP yang diisi minimal 15 digit." : "NIK yang diisi harus 16 digit.");
  if (!hasValidPicName) underwritingPendingItems.push("Lengkapi kontak di lokasi.");
  if (!hasValidUnderwriting) underwritingPendingItems.push("Lengkapi data tambahan yang wajib.");
  if (!hasValidStockType) underwritingPendingItems.push("Pilih jenis stok agar sistem bisa mengkategorikan stok mudah terbakar atau tidak mudah terbakar.");
  if (!hasCompleteUploads) underwritingPendingItems.push("Unggah tiga foto properti: depan, samping kanan, dan samping kiri.");
  const shouldShowQuotedPricing = quoted && hasQuoteBasis;
  const shouldShowSidebarPricing = (quoted || internalStep > 1 || externalView === "offer-indicative" || externalView === "offer-final" || externalView === "payment") && hasQuoteBasis;
  const showStepOneSummarySidebar = false;
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
    setField("occupancy", "Hunian");
    setField("wallMaterial", WALL_MATERIAL_OPTIONS[0]);
    setField("structureMaterial", STRUCTURE_MATERIAL_OPTIONS[0]);
    setField("roofMaterial", ROOF_MATERIAL_OPTIONS[0]);
    setField("flammableMaterial", FLAMMABLE_MATERIAL_OPTIONS[0]);
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
      picName: demoCustomer.name,
      coverageStartDate: selectedCoverageDate,
      fireProtection: "APAR + Hydrant",
      fireProtectionChoice: "Ada",
      fireProtectionItems: ["APAR", "Hydrant"],
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
          setFormField={setField}
          uwForm={uwForm}
          uploads={uploads}
          propertyType={effectivePropertyType}
          occupancy={form.occupancy}
          setOccupancy={(value) => setField("occupancy", value)}
          occupancyOptions={availableOccupancyOptions}
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

  if (externalView === "offer-final") {
    return (
      <>
        <ConsentModal agreed={false} open={showConsentModal} onClose={() => setShowConsentModal(false)} onAgree={() => { setShowConsentModal(false); setExternalView("payment"); }} />
        <RejectModal open={showRejectModal} onClose={() => setShowRejectModal(false)} reason={rejectReason} setReason={setRejectReason} customReason={rejectCustomReason} setCustomReason={setRejectCustomReason} onSubmit={() => { const finalReason = rejectReason === "Alasan lainnya" ? rejectCustomReason.trim() : rejectReason; setRejectionStatus("Alasan penolakan tersimpan: " + finalReason + ". Ini masih simulasi untuk handoff ke tim IT."); setShowRejectModal(false); }} />
        <ExternalProposalPage
          mode="final"
          customerName={effectiveCustomerName || uwForm.picName}
          customerType={form.customerType}
          form={form}
          setFormField={setField}
          uwForm={uwForm}
          uploads={uploads}
          propertyType={effectivePropertyType}
          occupancy={form.occupancy}
          setOccupancy={(value) => setField("occupancy", value)}
          occupancyOptions={availableOccupancyOptions}
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

  if (externalView === "payment") {
    return <ExternalPaymentPage customerName={effectiveCustomerName} estimatedTotal={estimatedTotalNumber} paymentMethod={paymentMethod} onSelectMethod={(value) => { setPaymentMethod(value); setPaymentStatus(""); }} onBack={() => setExternalView(sharedOfferSnapshot ? "offer-final" : "external-underwriting")} onProceedPayment={() => setPaymentStatus(`${activeVariant.paymentSuccessMessage} Integrasi pembayaran online akan disambungkan pada tahap berikutnya.`)} paymentStatus={paymentStatus} operatingRecord={operatingRecord} isExpired={operatingRecord?.status === "Expired"} onSimulate={() => { setPaymentMethod(PAYMENT_OPTIONS[0]); setPaymentStatus(""); }} stepOneTitle={sharedOfferSnapshot ? "Tinjau Penawaran" : "Simulasi Premi"} />;
  }

  if (externalView === "external-underwriting") {
    const externalDataValidity = resolveOfferValidity(true, uwForm.coverageStartDate);
    const externalDataObjectLabel =
      form.occupancy ||
      (objectRows.length ? `${objectRows.length} objek dilindungi` : "-");
    const externalDataOfferMeta = {
      reference: transactionAuthority.transactionId,
      version: "Rev 1",
      validUntil: formatDisplayDate(externalDataValidity.expiresAt),
      statusLabel: underwritingPendingItems.length ? "Menunggu data tambahan" : "Siap ditinjau",
    };

    return (
      <CustomerDataJourneyShell
        productName={activeVariant.title}
        heroDescription="Lengkapi data singkat berikut agar penawaran ini siap diperbarui menjadi penawaran final yang rapi dan siap dibayar."
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
        guidanceText="Informasi yang Anda isi di halaman ini akan dipakai untuk menyiapkan penawaran final dan tahap pembayaran."
        summaryRows={[
          { label: activeVariant.primaryCoveragePremiumLabel, value: `Rp ${formatRupiah(basePremiumNumber)}` },
          ...(additionalPremiumNumber > 0 ? [{ label: "Premi Perluasan", value: `Rp ${formatRupiah(additionalPremiumNumber)}` }] : []),
          { label: "Biaya Meterai", value: `Rp ${formatRupiah(stampDutyNumber)}` },
        ]}
        pendingItems={underwritingPendingItems}
        canContinue={canAdvanceUnderwriting}
        continueLabel="Lanjut ke Pembayaran"
        onContinue={() => setExternalView("payment")}
        onBack={() => setExternalView("offer-indicative")}
        showSidebar={false}
        stepOneTitle={sharedOfferSnapshot ? "Tinjau Penawaran" : "Simulasi Premi"}
        bottomBackLabel={sharedOfferSnapshot ? "Kembali ke Tinjau Penawaran" : "Kembali ke Simulasi Premi"}
        topActionLabel="Simulasi"
        onTopAction={fillStepTwoDemoData}
      >
        <UnderwritingSections
          form={form}
          customerType={form.customerType}
          selectedCustomer={selectedCustomer}
          uwForm={uwForm}
          setUwField={setUwField}
          uploads={uploads}
          setUploads={setUploads}
          setEvidence={setEvidence}
          objectRows={objectRows}
          external={true}
        />
      </CustomerDataJourneyShell>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F5F7] text-slate-900">
      <SentOffersModal open={showSentOffers} onClose={() => setShowSentOffers(false)} />
      <IndicationModal open={showIndicationModal} onClose={() => { setShowIndicationModal(false); setShareFeedback(""); }} onOpenIndicativeOffer={() => { setExternalViewerMode("customer"); setShowIndicationModal(false); setExternalView("offer-indicative"); openShareWindow(shareUrl); }} onOpenFinalOffer={internalStep === 2 ? () => { setExternalViewerMode("customer"); setShowIndicationModal(false); setExternalView("offer-final"); openShareWindow(shareUrl); } : null} customerName={effectiveCustomerName} shareUrl={shareUrl} onShowQrInfo={() => setQrInfoVisible((prev) => !prev)} onCopyLink={handleCopyLink} copyStatus={shareFeedback} shareLabel={activeVariant.shareLabel} shareSubject={activeVariant.shareSubject} />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0A4D82] shadow-sm">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-white"><div className="text-[15px] font-black leading-tight md:text-[18px]">Danantara<div className="-mt-1 text-[15px] md:text-[18px]">Indonesia</div></div><div className="hidden text-[15px] font-semibold text-white/95 sm:block">asuransi jasindo</div></div>
                <div className="hidden items-center gap-3 md:flex"><button type="button" onClick={() => { window.location.href = "https://esppa.asuransijasindo.co.id/"; }} className="inline-flex items-center gap-2 rounded-[8px] bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"><Home className="h-4 w-4" />Beranda</button><button type="button" onClick={() => { if (embedded && onExit) onExit(); else setScreen("catalog"); }} className="inline-flex items-center gap-2 rounded-[8px] bg-[#F5A623] px-4 py-2 text-sm font-semibold text-white shadow-sm"><Package className="h-4 w-4" />Produk</button></div>
          </div>
          <div className="relative flex items-center gap-4 text-white">
            <button type="button" onClick={fillDemoForCurrentStep} className="hidden rounded-[10px] border border-white/30 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 md:inline-flex md:text-sm">Simulasi</button>
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
              <div className="mx-auto mt-6 max-w-3xl rounded-2xl bg-white p-3 shadow-2xl shadow-black/15 md:mt-7 md:max-w-4xl md:p-5">
                <div className="rounded-2xl border border-[#D8E1EA] bg-[#F4F7FA] px-3 py-4 md:px-5 md:py-5">
                  <div className="flex flex-col gap-5 md:flex-row md:gap-5">
                    <StepNode step="Langkah 1" title="Simulasi Premi" subtitle={internalStep === 1 ? "Sedang diisi" : "Selesai"} active={internalStep === 1} done={internalStep > 1} icon={<Wallet className="h-4 w-4" />} onClick={() => { if (internalStep !== 1) setInternalStep(1); }} />
                    <div className="hidden h-px flex-1 self-center bg-slate-300 md:block" />
                    <StepNode step="Langkah 2" title="Data Lanjutan" subtitle={internalStep === 2 ? "Sedang diisi" : "Menunggu"} active={internalStep === 2} done={!isInternalMode && internalStep > 2} icon={<FileText className="h-4 w-4" />} onClick={() => { if (quoted) setInternalStep(2); }} />
                    {!isInternalMode ? <div className="hidden h-px flex-1 self-center bg-slate-300 md:block" /> : null}
                    {!isInternalMode ? (
                      <StepNode step="Langkah 3" title="Pembayaran" subtitle="Menunggu" active={false} done={false} icon={<Wallet className="h-4 w-4" />} />
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {rejectionStatus ? <div className="mx-auto mt-6 max-w-[1280px] rounded-2xl border border-[#CFE0F0] bg-[#F8FBFE] px-4 py-3 text-sm text-[#0A4D82]">{rejectionStatus}</div> : null}
          {qrInfoVisible ? <div className="mx-auto mt-4 max-w-[1280px] rounded-2xl border border-[#CFE0F0] bg-white px-4 py-4 text-sm text-slate-700 shadow-sm"><div className="font-semibold text-slate-900">QR Code belum digenerate otomatis.</div><div className="mt-1">Untuk handoff ke IT, tautan yang akan diencode adalah: <span className="break-all text-[#0A4D82]">{shareUrl}</span></div></div> : null}
          {internalStep === 1 ? (
            <div className={cls("mx-auto px-4 md:px-6", showStepOneSummarySidebar ? "max-w-[1280px]" : "max-w-4xl")}>
              <div className={cls("mt-6 grid items-start gap-5", showStepOneSummarySidebar ? "lg:grid-cols-[minmax(0,1fr)_320px]" : "lg:grid-cols-1")}>
                <div className="space-y-5">
                  <SectionCard title="Informasi Calon Pemegang Polis">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2"><FieldLabel label="Nama Calon Pemegang Polis" required /><div className="relative"><TextInput value={form.identity} onChange={(value) => { setSelectedCustomer(null); setField("identity", value); }} placeholder="Masukkan nama calon pemegang polis atau kode CIF" icon={<User className="h-4 w-4" />} />{form.identity && customerSuggestions.length > 0 && !selectedCustomer ? <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg">{customerSuggestions.map((item) => <button key={item.cif} type="button" onClick={() => { setSelectedCustomer(item); setForm((prev) => ({ ...prev, identity: item.name + " - " + item.cif, customerType: item.type, phone: item.phone || prev.phone, email: item.email || prev.email })); }} className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50"><div><div className="font-semibold text-slate-900">{item.name}</div><div className="text-xs text-slate-500">{item.type}</div></div><div className="rounded-full bg-[#F8FBFE] px-3 py-1 text-xs font-semibold text-[#0A4D82]">{item.cif}</div></button>)}</div> : null}</div>{selectedCustomer ? <div className="mt-1 text-xs text-green-600">Data CIF terpilih. Anda akan melanjutkan sebagai nasabah existing.</div> : form.identity ? <div className="mt-1 text-xs text-slate-500">Nama belum cocok dengan CIF simulasi. Sistem akan memperlakukan sebagai nasabah baru.</div> : null}</div>
                      {Boolean(form.identity.trim()) && !selectedCustomer && !isDigitsOnly(form.identity.trim()) ? <div><FieldLabel label="Tipe Nasabah" required /><SelectInput value={form.customerType} onChange={(value) => setField("customerType", value)} options={CUSTOMER_TYPES} placeholder="Nasabah ini perorangan atau badan usaha?" /></div> : null}
                      <div><FieldLabel label="Nomor Handphone" required /><TextInput value={form.phone} onChange={(value) => setField("phone", value)} placeholder="08xxxxxxxxxx" icon={<Phone className="h-4 w-4" />} /></div>
                      <div><FieldLabel label="Alamat Email" required /><TextInput value={form.email} onChange={(value) => setField("email", value)} placeholder="nama@email.com" icon={<Mail className="h-4 w-4" />} type="email" /></div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Informasi Properti">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2 md:max-w-[760px]">
                        <div className={cls("grid gap-3", occupancyCode ? "md:grid-cols-[minmax(0,1fr)_180px]" : "md:grid-cols-1")}>
                          <div className="min-w-0">
                            <FieldLabel label="Penggunaan Properti yang Diasuransikan" required />
                            <SelectInput value={form.occupancy} onChange={(value) => setField("occupancy", value)} options={availableOccupancyOptions} placeholder="Pilih penggunaan properti yang diasuransikan" />
                          </div>
                          {occupancyCode ? (
                            <div className="self-end rounded-xl border border-[#D5DDE6] bg-[#F8FBFE] px-3 py-2.5">
                              <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">Kode Okupasi</div>
                              <div className="mt-1 text-sm font-semibold text-[#0A4D82]">{occupancyCode}</div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <div className="space-y-2.5 md:max-w-[760px]">
                          <FieldLabel label="Kelas Konstruksi" required />
                          <div className="space-y-2 md:flex md:items-center md:gap-3 md:space-y-0">
                            <div className="md:min-w-0 md:max-w-[420px] md:flex-1">
                              <SelectInput value={form.constructionClass} onChange={(value) => setField("constructionClass", value)} options={CONSTRUCTION_CLASSES} placeholder="Pilih kelas konstruksi bangunan." />
                            </div>
                            <button type="button" onClick={() => setShowConstructionGuide((prev) => !prev)} className="inline-flex h-auto shrink-0 items-center self-start rounded-none border-0 bg-transparent px-0 py-2 text-sm font-medium text-[#0A4D82] underline-offset-2 hover:underline">
                              {showConstructionGuide ? "Sembunyikan panduan lengkap" : "Lihat panduan lengkap"}
                            </button>
                          </div>
                          {constructionInfo ? <div className="rounded-[12px] border border-[#D5DDE6] bg-[#F8FBFE] px-3 py-2.5 text-[12px] leading-5 text-slate-600"><span className="font-semibold text-slate-900">{constructionInfo.title}.</span> {constructionInfo.desc}</div> : null}
                          {showConstructionGuide ? <div className="overflow-hidden rounded-[14px] border border-[#D5DDE6] bg-[#F8FBFE]">{CONSTRUCTION_GUIDE.map((item, index) => <div key={item.title} className={cls("grid gap-1.5 px-3 py-2.5 md:grid-cols-[76px_minmax(0,1fr)] md:items-start md:gap-x-3", index !== 0 && "border-t border-[#E2E8F0]")}><div className="text-[12px] font-semibold text-[#0A4D82] md:text-[13px]">{item.title}</div><div className="text-[11px] leading-[1.45] text-slate-600 md:text-[12px]">{item.desc}</div></div>)}</div> : null}
                        </div>
                      </div>
                      <div className="md:col-span-2"><FieldLabel label="Alamat / Lokasi Objek" required /><TextInput value={form.locationSearch} onChange={(value) => setField("locationSearch", value)} placeholder="Ketik alamat, nama jalan, atau nama gedung" icon={<Search className="h-4 w-4" />} /><div className="mt-2 flex flex-wrap gap-2.5"><button type="button" onClick={() => { setField("locationSearch", "Lokasi GPS tersimulasi - Jl. Sudirman Kav. 44, Jakarta Selatan"); setEvidence((prev) => ({ ...prev, location: createLocationEvidence({ declaredAddress: "Jl. Sudirman Kav. 44, Jakarta Selatan", source: "gps" }) })); }} className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"><MapPin className="h-4 w-4" />Ambil Lokasi Sekarang</button><button type="button" onClick={() => { setField("locationSearch", "Pin peta tersimulasi - Ruko Blok A3, Jl. Boulevard Raya, Kelapa Gading"); setEvidence((prev) => ({ ...prev, location: createLocationEvidence({ declaredAddress: "Ruko Blok A3, Jl. Boulevard Raya, Kelapa Gading", source: "map" }) })); }} className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"><MapPin className="h-4 w-4" />Pilih di Peta</button></div></div>
                    </div>
                    <div className="mt-4 rounded-xl border border-[#D5DDE6] bg-[#FAFBFC] p-4"><div className="flex items-center justify-between gap-3"><div className="text-[15px] font-bold text-slate-900">Rincian Properti</div><button type="button" onClick={() => setObjectRows((prev) => prev.concat({ id: "obj-" + Date.now(), type: "", amount: "", note: "" }))} className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"><Plus className="h-4 w-4" />Tambah Objek</button></div><div className="mt-3 space-y-2.5">{objectRows.map((row) => <div key={row.id} className="rounded-xl border border-slate-200 bg-white p-3"><div className="grid gap-2.5 lg:grid-cols-[180px_minmax(0,1fr)_minmax(0,1.2fr)_40px] lg:items-center"><SelectInput value={row.type} onChange={(value) => updateObjectRow(row.id, { type: value })} options={OBJECT_TYPES} placeholder="Jenis Objek" /><CurrencyInput value={row.amount} onChange={(value) => updateObjectRow(row.id, { amount: value })} placeholder="Harga Pertanggungan" /><TextInput value={row.note} onChange={(value) => updateObjectRow(row.id, { note: value })} placeholder={shortObjectLabel(row.type)} /><button type="button" onClick={() => removeObjectRow(row.id)} className="inline-flex h-[44px] items-center justify-center rounded-[10px] border border-slate-300 text-slate-500 hover:bg-slate-50" title="Hapus objek"><Trash2 className="h-4 w-4" /></button></div></div>)}</div><div className="mt-3 rounded-[10px] bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200"><div className="flex flex-col gap-1.5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>Total Nilai Pertanggungan</span><span className="break-words text-left text-[18px] font-bold text-[#E8A436] sm:text-right">Rp {formatRupiah(totalValue)}</span></div></div></div>
                  </SectionCard>

                  {!quoted ? (
                    <div className="flex justify-stretch gap-3 sm:justify-end sm:gap-3">
                      <button type="button" disabled={!canAdvanceInternalStepOne} onClick={() => setQuoted(true)} className={cls("inline-flex h-[50px] flex-1 items-center justify-center gap-2 rounded-[12px] px-5 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition", canAdvanceInternalStepOne ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}>Cek Premi</button>
                    </div>
                  ) : null}

                  {quoted ? (
                    <div ref={resultsRef} className="space-y-5">
                      <SectionCard title="Rincian Jaminan" subtitle="Klik setiap baris untuk melihat penjelasan detailnya.">
                        <div className="space-y-5">
                          <div>
                            <div className="text-[15px] font-semibold tracking-tight text-slate-900">{activeVariant.insuredRisksSectionTitle}</div>
                            <div className="mt-3">
                              <AccordionRiskRow title={activeVariant.primaryCoverageTitle} icon={PrimaryCoverageIcon} premium={shouldShowQuotedPricing ? "Rp " + formatRupiah(basePremiumNumber) : "-"} detail={activeVariant.primaryCoverageDescription} deductible={form.constructionClass === "Kelas 1" ? activeVariant.primaryCoverageDeductibleClassOne : activeVariant.primaryCoverageDeductibleOther} alwaysIncluded={true} expanded={expandedRows.fire} onToggleExpand={() => setExpandedRows((prev) => ({ ...prev, fire: !prev.fire }))} />
                            </div>
                          </div>
                          {activeVariant.importantExclusions.length ? (
                            <div>
                              <div className="text-[15px] font-semibold tracking-tight text-slate-900">{activeVariant.exclusionsSectionTitle}</div>
                              <div className="mt-1 text-sm leading-6 text-slate-500">{activeVariant.exclusionsSectionSubtitle}</div>
                              <div className="mt-3 rounded-xl border border-[#C9D5E3] bg-[#F8FBFE]">
                                <button type="button" onClick={() => setExpandedRows((prev) => ({ ...prev, exclusions: !prev.exclusions }))} className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left">
                                  <div className="text-[15px] font-semibold text-[#0A4D82]">Ringkasan pengecualian utama</div>
                                  <ChevronDown className={cls("h-4 w-4 shrink-0 text-slate-500 transition", expandedRows.exclusions && "rotate-180")} />
                                </button>
                                {expandedRows.exclusions ? (
                                  <div className="border-t border-[#D6E0EA] px-3.5 py-3">
                                    <div className="space-y-2">{activeVariant.importantExclusions.map((item) => <div key={item} className="flex items-start gap-2 text-[13px] leading-5 text-slate-700"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /><span>{item}</span></div>)}</div>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          ) : null}
                          <div>
                            <div className="text-[15px] font-semibold tracking-tight text-slate-900">Perluasan Jaminan</div>
                            <div className="mt-3 space-y-2.5">{activeGuarantees.map((item) => { const checked = selectedGuarantees[item.key]; const premiumValue = Math.round(totalValue * item.rate); const deductibleValue = item.key === "earthquake" ? "2,5% dari Rp " + formatRupiah(totalValue) : item.deductible; return <AccordionRiskRow key={item.key} title={item.title} icon={item.icon} premium={shouldShowQuotedPricing ? "Rp " + formatRupiah(premiumValue) : "-"} detail={item.detail} deductible={deductibleValue} checked={checked} onToggleChecked={() => setSelectedGuarantees((prev) => ({ ...prev, [item.key]: !prev[item.key] }))} expanded={expandedRows[item.key]} onToggleExpand={() => setExpandedRows((prev) => ({ ...prev, [item.key]: !prev[item.key] }))} extra={item.key === "earthquake" && checked && isFloorRelevant(effectivePropertyType, form.occupancy) ? <div ref={floorFieldRef} className="max-w-sm rounded-xl border border-amber-200 bg-white p-3"><FieldLabel label="Jumlah lantai bangunan yang diasuransikan" required helpText="Diisi hanya bila objek bertingkat dan gempa bumi dipilih." /><TextInput value={floorCount} onChange={(value) => setFloorCount(onlyDigits(value))} placeholder="Masukkan jumlah lantai" icon={<Building2 className="h-4 w-4" />} /></div> : null} />; })}</div>
                          </div>
                        </div>
                      </SectionCard>
                      <SectionCard title="Ringkasan Pembayaran">
                        <div className="rounded-2xl border border-[#D8E1EA] bg-[linear-gradient(180deg,#FFFFFF_0%,#F4F8FD_100%)] px-4 py-3 shadow-[0_8px_18px_rgba(15,23,42,0.04)] md:px-6 md:py-4">
                          <div className="mx-auto flex max-w-[460px] flex-col items-center text-center">
                            <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">Total Pembayaran</div>
                            <div className="mt-2 text-[20px] font-bold tracking-tight text-[#0A4D82] md:text-[22px]">Rp {formatRupiah(estimatedTotalNumber)}</div>
                          </div>
                        </div>
                        <div className="mt-3 border-t border-slate-100 pt-2.5">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Rincian</div>
                          <div className="mt-2 divide-y divide-slate-100">
                            <div className="flex items-start justify-between gap-4 py-3 text-sm">
                              <div className="text-slate-500">Premi</div>
                              <div className="text-right font-semibold text-slate-900">Rp {formatRupiah(basePremiumNumber + additionalPremiumNumber)}</div>
                            </div>
                            <div className="flex items-start justify-between gap-4 py-3 text-sm">
                              <div className="text-slate-500">Biaya Meterai</div>
                              <div className="text-right font-semibold text-slate-900">Rp {formatRupiah(stampDutyNumber)}</div>
                            </div>
                          </div>
                        </div>
                      </SectionCard>
                    </div>
                  ) : null}

                  {quoted ? (
                    <div className="flex justify-stretch gap-3 sm:justify-end">
                      {isInternalMode ? (
                        <button
                          type="button"
                          disabled={!canAdvanceInternalStepOne}
                          onClick={() => {
                            setShowIndicationModal(true);
                          }}
                          className={cls("inline-flex h-[50px] flex-1 items-center justify-center gap-2 rounded-[12px] px-5 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition", canAdvanceInternalStepOne ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}
                        >
                          Kirim Penawaran Awal
                        </button>
                      ) : null}
                      <button
                        type="button"
                        disabled={!canAdvanceInternalStepOne}
                        onClick={() => { setInternalStep(2); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className={cls("inline-flex h-[50px] flex-1 items-center justify-center gap-2 rounded-[12px] px-5 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition", canAdvanceInternalStepOne ? "bg-[#0A4D82] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}
                      >
                        Isi Data Lanjutan
                      </button>
                    </div>
                  ) : null}
                </div>
                {showStepOneSummarySidebar ? <SummarySidebarShell title="Ringkasan">
                  <div className="border-t border-white/15 pt-3">
                    <SummaryRow label={selectedCustomer || isDigitsOnly(form.identity.trim()) ? "Kode CIF / Nama" : "Nama Calon Pemegang Polis"} value={form.identity || "-"} />
                    <SummaryRow label="Penggunaan Properti yang Diasuransikan" value={form.occupancy} />
                    <SummaryRow label="Kelas Konstruksi" value={form.constructionClass} />
                  </div>
                  <div className="border-t border-white/15 pt-3">
                    <SummaryRow label={activeVariant.primaryCoveragePremiumLabel} value={pricingSummaryValue} />
                    {extensionPremiumSummaryValue ? <SummaryRow label="Premi Perluasan" value={extensionPremiumSummaryValue} /> : null}
                    <SummaryRow label="Biaya Meterai" value={stampDutySummaryValue} />
                  </div>
                  <div className="mt-4 space-y-2.5">
                    {isInternalMode ? (
                      <button
                        type="button"
                        disabled={!canAdvanceInternalStepOne}
                        onClick={() => {
                          setQuoted(true);
                          setShowIndicationModal(true);
                        }}
                        className={cls("flex h-[46px] w-full items-center justify-center rounded-[12px] text-sm font-bold uppercase tracking-wide text-white shadow-sm", canAdvanceInternalStepOne ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}
                      >
                        Kirim Penawaran Awal
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={!canAdvanceInternalStepOne}
                      onClick={() => {
                        setQuoted(true);
                        setInternalStep(2);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={cls("flex h-[46px] w-full items-center justify-center rounded-[12px] text-sm font-bold uppercase tracking-wide text-white shadow-sm", canAdvanceInternalStepOne ? "bg-[#0A4D82] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}
                    >
                      Isi Data Lanjutan
                    </button>
                  </div>
                  <SummarySidebarAlert items={stepOnePendingItems} />
                </SummarySidebarShell> : null}
              </div>
            </div>
          ) : (
            <div className="mx-auto mt-6 max-w-4xl px-4 md:px-6">
              <div className="space-y-5">
                <UnderwritingSections form={form} customerType={form.customerType} selectedCustomer={selectedCustomer} objectRows={objectRows} uwForm={uwForm} setUwField={setUwField} uploads={uploads} setUploads={setUploads} setEvidence={setEvidence} />
                <div className="rounded-2xl border border-[#D8E1EA] bg-white p-4 shadow-sm md:p-5">
                  <div className="grid gap-3 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setInternalStep(1)}
                      className="flex h-[48px] w-full items-center justify-center rounded-[12px] border border-[#D5DEEA] bg-white px-5 text-center text-sm font-semibold text-[#0A4D82] shadow-sm hover:bg-[#F8FBFE]"
                    >
                      Kembali ke Simulasi Premi
                    </button>
                    <button
                      type="button"
                      disabled={!canAdvanceUnderwriting}
                      onClick={() => {
                        if (isInternalMode) setShowIndicationModal(true);
                        else setExternalView("payment");
                      }}
                      className={cls(
                        "flex h-[48px] w-full items-center justify-center rounded-[12px] px-5 text-center text-sm font-semibold text-white shadow-sm transition",
                        canAdvanceUnderwriting ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400",
                      )}
                    >
                      {isInternalMode ? "Kirim Penawaran Final" : "Lanjut ke Pembayaran"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
















