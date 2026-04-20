import React, { useEffect, useMemo, useRef, useState } from "react";
import { createEmptyDocumentCheck, createLocationEvidence, createPhotoEvidence, createTransactionAuthority, evaluateDocumentRead, summarizeFraudSignals } from "./platform/securityControls.js";
import { jsPDF } from "jspdf";
import { PremiumBreakdown, PremiumPriceHero, ProposalRow, TooltipDot } from "./components/PremiumSummaryBlocks.jsx";
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

const PROPERTY_TYPES = ["Rumah Tinggal", "Toko", "Ruko", "Kantor", "Apartment", "Apotek"];
const CONSTRUCTION_CLASSES = ["Kelas 1", "Kelas 2", "Kelas 3"];
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
const OBJECT_TYPES = ["Bangunan", "Inventaris", "Stok", "Mesin"];
const CUSTOMER_TYPES = ["Nasabah Perorangan", "Badan Usaha"];
const OWNERSHIP_TYPES = ["Milik Sendiri", "Sewa", "Kontrak", "Lainnya"];
const PROTECTION_OPTIONS = ["APAR", "Hydrant", "Sprinkler"];
const CLAIM_HISTORY_OPTIONS = ["Tidak Ada", "Ada 1 Klaim", "Ada Lebih dari 1 Klaim"];
const PAYMENT_METHOD_GROUPS = [
  {
    label: "Bank Transfer",
    methods: [
      { label: "BRI", feeAmount: 4440 },
      { label: "Mandiri", feeAmount: 4440 },
      { label: "BNI", feeAmount: 4440 },
      { label: "BCA", feeAmount: 4440 },
      { label: "BSI", feeAmount: 4440 },
      { label: "CIMB Niaga", feeAmount: 4440 },
      { label: "Permata", feeAmount: 4440 },
    ],
  },
  {
    label: "E Wallet",
    methods: [
      { label: "OVO", feeAmount: 458 },
      { label: "LinkAja", feeAmount: 458 },
      { label: "AstraPay", feeAmount: 458 },
    ],
  },
  {
    label: "Kartu Kredit",
    methods: [{ label: "Credit Card", feeAmount: 3343 }],
  },
  {
    label: "Scan QRIS",
    methods: [{ label: "QRIS", feeAmount: 191 }],
  },
];
const PAYMENT_METHOD_FEE_LOOKUP = PAYMENT_METHOD_GROUPS.reduce((accumulator, group) => {
  group.methods.forEach((method) => {
    accumulator[method.label] = method.feeAmount;
  });
  return accumulator;
}, {});
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

const BASIC_COVERAGE_HIGHLIGHTS = [
  { title: "Kebakaran", icon: Flame },
  { title: "Petir", icon: Zap },
  { title: "Ledakan", icon: Sparkles },
  { title: "Kejatuhan Pesawat", icon: Plane },
  { title: "Asap", icon: Waves },
];

const OCCUPANCY_MAP = {
  "Rumah Tinggal": ["Rumah Tinggal"],
  Toko: ["Toko"],
  Ruko: ["Ruko"],
  Kantor: ["Kantor"],
  Apartment: ["Apartment"],
  Apotek: ["Apotek"],
};
const OCCUPANCY_OPTIONS = ["Rumah Tinggal", "Toko", "Ruko", "Kantor", "Apartment", "Apotek"];
const OCCUPANCY_PROPERTY_TYPE_PREFERENCES = {
  "Rumah Tinggal": ["Rumah Tinggal"],
  Toko: ["Toko"],
  Ruko: ["Ruko"],
  Kantor: ["Kantor"],
  Apartment: ["Apartment", "Rumah Tinggal"],
  Apotek: ["Apotek", "Toko", "Ruko"],
};
const OCCUPANCY_CODE_MAP = {
  "Rumah Tinggal": "2976",
  Toko: "2934",
  Ruko: "2934",
  Kantor: "2971",
  Apartment: "2971",
  Apotek: "2930",
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
    title: "Asuransi Kebakaran",
    category: "Harta Benda",
    subtitle: "Perlindungan untuk bangunan dan isi properti terhadap risiko kebakaran, dengan tambahan perlindungan yang bisa dipilih sesuai kebutuhan.",
    image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80",
    active: true,
    variantKey: "property-safe",
  },
  {
    title: "Asuransi Property All Risk",
    category: "Harta Benda",
    subtitle: "Perlindungan untuk bangunan dan isi properti terhadap kerusakan fisik mendadak, dengan tambahan perlindungan yang bisa dipilih sesuai kebutuhan.",
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
    active: true,
    variantKey: "property-all-risk",
  },
];

const VEHICLE_PRODUCTS = [
  {
    title: "Asuransi Sepeda Motor - Total Loss",
    category: "Kendaraan Bermotor",
    subtitle: "Perlindungan untuk sepeda motor terhadap kehilangan akibat pencurian atau kerusakan berat yang termasuk total loss sesuai ketentuan polis.",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Asuransi Mobil - Total Loss",
    category: "Kendaraan Bermotor",
    subtitle: "Perlindungan mobil terhadap kerugian total akibat risiko yang dijamin polis, termasuk pencurian dan kebakaran.",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Comprehensive Kendaraan - Mobil",
    category: "Kendaraan Bermotor",
    subtitle: "Perlindungan mobil terhadap kerusakan atau kehilangan akibat tabrakan, perbuatan jahat, pencurian, dan kebakaran.",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80",
  },
];


const CONSENT_SECTIONS = [
  {
    key: "produk",
    title: "Pemahaman Produk",
    summary: "Calon pemegang polis menyatakan telah menerima penjelasan, membaca, dan memahami informasi produk asuransi.",
    detailLines: [
      'Menyatakan telah menerima penjelasan, membaca, dan memahami informasi produk asuransi PT Asuransi Jasa Indonesia (“Penanggung”) ini;',
    ],
  },
  {
    key: "data",
    title: "Pemrosesan Data Pribadi",
    summary: "Calon pemegang polis memberi izin pemrosesan data pribadi untuk penerbitan polis, pelayanan klaim, dan peningkatan layanan.",
    detailLines: [
      "Memberikan izin kepada Penanggung untuk melakukan pemrosesan Informasi/Data (mengumpulkan, memverifikasi, mengolah, menyimpan, memperbarui, mempergunakan, termasuk memusnahkan) yang tercantum dalam SPAU ini dan mengungkapkan Informasi/Data Pribadi (termasuk namun tidak terbatas pada nama, alamat surat menyurat, alamat email, nomor telepon, kontak, dan informasi/keterangan lainnya) kepada afiliasi Penanggung dan/atau pihak ketiga yang ditunjuk oleh Penanggung serta setuju dihubungi melalui sarana komunikasi pribadi sehubungan dengan pengajuan polis asuransi ini, pelayanan klaim, peningkatan layanan konsumen dan/ atau pelaksanaan ketentuan polis asuransi sesuai dengan kebijakan internal Penanggung maupun peraturan perundang-undangan yang berlaku.",
      "Adapun rincian mengenai tujuan pemrosesan Data Pribadi maupun pihak lain yang dapat memperoleh dan/atau melakukan pemrosesan Informasi/Data Pribadi Kami/Saya untuk menunjang keperluan ini tercantum dalam Kebijakan Privasi Penanggung yang dapat diakses pada",
    ],
    detailLinkLabel: "Kebijakan Privasi",
    detailLinkHref: "https://bit.ly/JSDPrivasi",
  },
  {
    key: "material",
    title: "Kebenaran Fakta Material",
    summary: "Seluruh keterangan yang diberikan harus benar dan menjadi dasar penerbitan polis.",
    detailLines: [
      "Menyatakan bahwa:",
      "(a) seluruh informasi/keterangan yang dicantumkan dalam SPAU ini dibuat dengan sejujurnya dan sesuai dengan keadaan sebenarnya menurut pengetahuan Kami/Saya atau yang seharusnya Kami/Saya ketahui;",
      "(b) menyadari bahwa SPAU ini akan digunakan sebagai dasar dan merupakan bagian yang tidak terpisahkan dari polis asuransi yang akan diterbitkan, oleh karenanya ketidakbenarannya merupakan pelanggaran atau tidak terpenuhinya kewajiban penyampaian fakta material. Pelanggaran tersebut mengakibatkan ditolaknya setiap klaim yang diajukan;",
      "(c) mengerti bahwa pertanggungan yang diminta ini baru berlaku setelah mendapat persetujuan tertulis dari Penanggung.",
    ],
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
  ["view", "viewer", "share", "referral", "sender", "customer", "offer"].forEach((key) => {
    url.searchParams.delete(key);
  });

  if (view) url.searchParams.set("view", view);
  else url.searchParams.delete("view");

  Object.entries(params).forEach(([key, value]) => {
    if (key === "shareData") {
      const encodedShare = encodeShareToken(value);
      if (encodedShare) url.searchParams.set("share", encodedShare);
      else url.searchParams.delete("share");
      return;
    }

    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  });

  ["referral", "sender", "customer", "offer"].forEach((key) => {
    url.searchParams.delete(key);
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

function encodeShareToken(payload) {
  if (!payload) return "";
  try {
    const json = JSON.stringify(payload);
    const bytes = new TextEncoder().encode(json);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  } catch {
    return "";
  }
}

function decodeShareToken(value) {
  if (!value) return null;
  try {
    const normalized = String(value).replace(/-/g, "+").replace(/_/g, "/");
    const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
    const binary = atob(normalized + padding);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

function readShareContextFromUrl() {
  if (typeof window === "undefined") return { view: "", viewer: "", referral: "", sender: "", customer: "", offer: null, shareToken: "" };
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view") || "";
  const viewer = params.get("viewer") || "";
  const encodedShare = params.get("share") || "";
  const decodedShare = decodeShareToken(encodedShare);
  const legacyReferral = params.get("referral") || "";
  const legacySender = params.get("sender") || "";
  const legacyCustomer = params.get("customer") || "";
  const legacyOffer = decodeShareSnapshot(params.get("offer") || "");
  const referral = decodedShare?.referral || legacyReferral;
  const sender = decodedShare?.sender || legacySender;
  const customer = decodedShare?.customer || legacyCustomer;
  const offer = decodedShare?.offer || legacyOffer;
  return { view, viewer, referral, sender, customer, offer, shareToken: encodedShare };
}

function hasShareContext(context) {
  if (!context) return false;
  return Boolean(context.referral || context.sender || context.customer || context.offer);
}

function clearShareContextFromUrl() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  ["view", "viewer", "share", "referral", "sender", "customer", "offer"].forEach((key) => {
    url.searchParams.delete(key);
  });
  window.history.replaceState({}, "", url.toString());
}

function replaceShareContextInUrl({ view = "", viewer = "", shareData = null } = {}) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (view) url.searchParams.set("view", view);
  else url.searchParams.delete("view");

  if (viewer) url.searchParams.set("viewer", viewer);
  else url.searchParams.delete("viewer");

  const encodedShare = encodeShareToken(shareData);
  if (encodedShare) url.searchParams.set("share", encodedShare);
  else url.searchParams.delete("share");

  ["referral", "sender", "customer", "offer"].forEach((key) => {
    url.searchParams.delete(key);
  });

  window.history.replaceState({}, "", url.toString());
}

function openShareWindow(targetUrl) {
  if (typeof window === "undefined") return;
  window.open(targetUrl, "_blank", "noopener,noreferrer");
}

function sanitizePdfFileName(value) {
  return String(value || "")
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeObjectTypeLabel(value) {
  if (String(value || "").trim() === "Inventaris / Isi") return "Inventaris";
  if (String(value || "").trim() === "Inventari") return "Inventaris";
  if (String(value || "").trim() === "Mesin / Peralatan") return "Mesin";
  return String(value || "").trim();
}

function downloadPropertyOfferPdf({
  fileName,
  productTitle,
  customerName,
  phone,
  email,
  occupancy,
  occupancyCode,
  location,
  constructionClass,
  objectRows,
  policyName,
  extensionItems,
  basePremium,
  extensionPremium,
  stampDuty,
  totalPremium,
  offerReference,
  downloadedAt,
  shareUrl,
  showOccupancyCode = true,
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;
  const marginBottom = 14;
  const contentWidth = pageWidth - marginX * 2;
  const gap = 6;
  const colors = {
    page: [246, 248, 251],
    card: [255, 255, 255],
    cardAlt: [248, 251, 254],
    border: [216, 225, 234],
    divider: [229, 235, 241],
    navy: [10, 77, 130],
    navySoft: [238, 246, 253],
    text: [15, 23, 42],
    muted: [100, 116, 139],
    amber: [245, 166, 35],
    amberSoft: [255, 247, 232],
    amberText: [138, 104, 48],
  };
  const summaryCustomerRows = [
    ["Nama Calon Pemegang Polis", customerName || "-"],
    ["Nomor Handphone", phone || "-"],
    ["Alamat Email", email || "-"],
  ];
  const summaryPropertyRows = [
    ["Penggunaan Properti", occupancy || "-"],
    ...(showOccupancyCode && occupancyCode ? [["Kode Okupasi", occupancyCode]] : []),
    ["Lokasi Properti", location || "-"],
    ["Kelas Konstruksi", constructionClass || "-"],
    ["Nomor Referensi", offerReference || "-"],
    ["Diunduh Pada", downloadedAt || "-"],
  ];
  const insuredRisks = BASIC_COVERAGE_HIGHLIGHTS.map((item) => item.title);
  const selectedExtensionRows = extensionItems?.length
    ? extensionItems.map((item) => ({
        title: item.title,
        detail: item.detail || "",
        premium: item.premium || 0,
      }))
    : [];

  let y = 14;

  const lineHeightMm = (fontSize, multiplier = 1.35) => fontSize * 0.3528 * multiplier;

  const resetPage = () => {
    doc.setFillColor(...colors.page);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    y = 14;
  };

  const addPage = () => {
    doc.addPage();
    resetPage();
  };

  const ensureSpace = (neededHeight = 12) => {
    if (y + neededHeight <= pageHeight - marginBottom) return;
    addPage();
  };

  const setText = (fontSize, fontStyle = "normal", color = colors.text) => {
    doc.setFont("helvetica", fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
  };

  const splitLines = (text, width, fontSize = 10, fontStyle = "normal") => {
    setText(fontSize, fontStyle);
    return doc.splitTextToSize(String(text || "-"), width);
  };

  const drawLines = (lines, x, yPos, options = {}) => {
    const {
      fontSize = 10,
      fontStyle = "normal",
      color = colors.text,
      lineMultiplier = 1.35,
      align = "left",
    } = options;
    setText(fontSize, fontStyle, color);
    doc.text(lines, x, yPos, { align });
    return Math.max(lines.length, 1) * lineHeightMm(fontSize, lineMultiplier);
  };

  const drawCard = (x, yPos, width, height, options = {}) => {
    const {
      fill = colors.card,
      border = colors.border,
      radius = 5,
      lineWidth = 0.4,
    } = options;
    doc.setLineWidth(lineWidth);
    doc.setDrawColor(...border);
    doc.setFillColor(...fill);
    doc.roundedRect(x, yPos, width, height, radius, radius, "FD");
  };

  const measureInfoCard = (rows, width) => {
    const innerWidth = width - 12;
    const prepared = rows.map(([label, value]) => {
      const labelLines = splitLines(label, innerWidth, 7.5, "bold");
      const valueLines = splitLines(value, innerWidth, 10, "bold");
      const rowHeight =
        drawOnlyHeight(labelLines, 7.5, 1.2) +
        drawOnlyHeight(valueLines, 10, 1.35) +
        5;
      return { labelLines, valueLines, rowHeight };
    });
    return {
      prepared,
      height: 14 + prepared.reduce((sum, row) => sum + row.rowHeight, 0) + Math.max(prepared.length - 1, 0) * 2 + 4,
    };
  };

  function drawOnlyHeight(lines, fontSize, lineMultiplier = 1.35) {
    return Math.max(lines.length, 1) * lineHeightMm(fontSize, lineMultiplier);
  }

  const drawInfoCard = (x, yPos, width, height, title, measured) => {
    drawCard(x, yPos, width, height);
    let cursorY = yPos + 9;
    drawLines([title], x + 6, cursorY, { fontSize: 8.5, fontStyle: "bold", color: colors.navy, lineMultiplier: 1.1 });
    cursorY += 6;
    measured.prepared.forEach((row, index) => {
      if (index > 0) {
        doc.setDrawColor(...colors.divider);
        doc.line(x + 6, cursorY - 2, x + width - 6, cursorY - 2);
      }
      cursorY += 1.5;
      cursorY += drawLines(row.labelLines, x + 6, cursorY, { fontSize: 7.5, fontStyle: "bold", color: colors.muted, lineMultiplier: 1.2 });
      cursorY += 1;
      cursorY += drawLines(row.valueLines, x + 6, cursorY, { fontSize: 10, fontStyle: "bold", color: colors.text, lineMultiplier: 1.35 });
      cursorY += 2;
    });
  };

  const layoutChips = (items, fontSize = 8.5) => {
    setText(fontSize, "normal", colors.navy);
    const chips = [];
    let currentX = 0;
    let currentY = 0;
    let rowHeight = 0;
    items.forEach((item) => {
      const chipWidth = doc.getTextWidth(item) + 9;
      const chipHeight = 7;
      if (currentX + chipWidth > contentWidth && currentX > 0) {
        currentX = 0;
        currentY += rowHeight + 3;
        rowHeight = 0;
      }
      chips.push({ label: item, x: currentX, y: currentY, width: chipWidth, height: chipHeight });
      currentX += chipWidth + 3;
      rowHeight = Math.max(rowHeight, chipHeight);
    });
    return { chips, height: chips.length ? currentY + rowHeight : 0 };
  };

  const chipLayout = layoutChips(insuredRisks);

  resetPage();

  const headerHeight = 38;
  ensureSpace(headerHeight + 4);
  drawCard(marginX, y, contentWidth, headerHeight, { fill: colors.navy, border: colors.navy, radius: 6 });
  drawCard(marginX + contentWidth - 62, y + 5, 52, 28, { fill: [255, 255, 255], border: [255, 255, 255], radius: 4, lineWidth: 0 });
  drawLines(["Danantara Indonesia"], marginX + 6, y + 7, { fontSize: 8.5, fontStyle: "bold", color: [255, 255, 255], lineMultiplier: 1.05 });
  drawLines(["Asuransi Jasindo"], marginX + 6, y + 12, { fontSize: 8.5, fontStyle: "normal", color: [228, 238, 247], lineMultiplier: 1.05 });
  drawLines(["Indikasi Penawaran"], marginX + 6, y + 20, { fontSize: 7.5, fontStyle: "bold", color: [191, 219, 254], lineMultiplier: 1.05 });
  drawLines(splitLines(productTitle || "Penawaran", contentWidth - 88, 17, "bold"), marginX + 6, y + 27, { fontSize: 17, fontStyle: "bold", color: [255, 255, 255], lineMultiplier: 1.05 });
  drawLines(["Referensi"], marginX + contentWidth - 56, y + 11, { fontSize: 7, fontStyle: "bold", color: colors.muted, lineMultiplier: 1.05 });
  drawLines(splitLines(offerReference || "-", 44, 8.8, "bold"), marginX + contentWidth - 56, y + 16, { fontSize: 8.8, fontStyle: "bold", color: colors.text, lineMultiplier: 1.15 });
  drawLines(["Diunduh"], marginX + contentWidth - 56, y + 24, { fontSize: 7, fontStyle: "bold", color: colors.muted, lineMultiplier: 1.05 });
  drawLines(splitLines(downloadedAt || "-", 44, 7.8, "normal"), marginX + contentWidth - 56, y + 29, { fontSize: 7.8, fontStyle: "normal", color: colors.text, lineMultiplier: 1.1 });
  y += headerHeight + 8;

  setText(12, "bold", colors.text);
  doc.text("Ringkasan Penawaran", marginX, y);
  y += 4;

  const columnWidth = (contentWidth - gap) / 2;
  const customerCard = measureInfoCard(summaryCustomerRows, columnWidth);
  const propertyCard = measureInfoCard(summaryPropertyRows, columnWidth);
  const summaryHeight = Math.max(customerCard.height, propertyCard.height);
  ensureSpace(summaryHeight + 10);
  drawInfoCard(marginX, y, columnWidth, summaryHeight, "Informasi Calon Pemegang Polis", customerCard);
  drawInfoCard(marginX + columnWidth + gap, y, columnWidth, summaryHeight, "Informasi Properti", propertyCard);
  y += summaryHeight + 8;

  setText(12, "bold", colors.text);
  doc.text("Objek Pertanggungan", marginX, y);
  y += 4;
  if (objectRows.length) {
    objectRows.forEach((row, index) => {
      const titleText = `${index + 1}. ${normalizeObjectTypeLabel(row.type) || "Objek"}`;
      const amountText = `Rp ${formatRupiah(parseNumber(row.amount))}`;
      setText(8, "bold", colors.amberText);
      const amountWidth = doc.getTextWidth(amountText) + 10;
      const titleLines = splitLines(titleText, contentWidth - amountWidth - 20, 10.5, "bold");
      const noteLines = splitLines(row.note || "Tanpa keterangan tambahan.", contentWidth - 12, 9.2, "normal");
      const objectHeight = 12 + drawOnlyHeight(titleLines, 10.5, 1.15) + 4 + drawOnlyHeight(noteLines, 9.2, 1.3) + 6;
      ensureSpace(objectHeight + 4);
      drawCard(marginX, y, contentWidth, objectHeight, { fill: colors.card, border: colors.border, radius: 5 });
      drawCard(marginX + contentWidth - amountWidth - 6, y + 6, amountWidth, 8, { fill: colors.amberSoft, border: colors.amberSoft, radius: 4, lineWidth: 0 });
      drawLines(titleLines, marginX + 6, y + 10, { fontSize: 10.5, fontStyle: "bold", color: colors.text, lineMultiplier: 1.15 });
      drawLines([amountText], marginX + contentWidth - amountWidth - 1, y + 11.5, { fontSize: 8, fontStyle: "bold", color: colors.amberText, lineMultiplier: 1.05 });
      drawLines(noteLines, marginX + 6, y + 17, { fontSize: 9.2, fontStyle: "normal", color: colors.muted, lineMultiplier: 1.3 });
      y += objectHeight + 4;
    });
  } else {
    ensureSpace(16);
    drawCard(marginX, y, contentWidth, 16, { fill: colors.cardAlt, border: colors.border, radius: 5 });
    drawLines(["Belum ada objek pertanggungan."], marginX + 6, y + 10, { fontSize: 9.5, color: colors.muted });
    y += 20;
  }

  setText(12, "bold", colors.text);
  doc.text("Ringkasan Syarat dan Ketentuan", marginX, y);
  y += 4;
  const policyLines = splitLines(policyName || "-", contentWidth - 12, 10.5, "bold");
  const policyHeight = 10 + drawOnlyHeight(policyLines, 10.5, 1.2);
  ensureSpace(policyHeight + chipLayout.height + 24);
  drawCard(marginX, y, contentWidth, policyHeight, { fill: colors.cardAlt, border: colors.border, radius: 5 });
  drawLines(policyLines, marginX + 6, y + 10, { fontSize: 10.5, fontStyle: "bold", color: colors.text, lineMultiplier: 1.2 });
  y += policyHeight + 5;
  drawLines(["Risiko yang dijamin"], marginX, y, { fontSize: 8.5, fontStyle: "bold", color: colors.muted, lineMultiplier: 1.05 });
  y += 3;
  chipLayout.chips.forEach((chip) => {
    drawCard(marginX + chip.x, y + chip.y, chip.width, chip.height, { fill: colors.navySoft, border: [205, 222, 238], radius: 4, lineWidth: 0.3 });
    drawLines([chip.label], marginX + chip.x + 4.5, y + chip.y + 4.7, { fontSize: 8.5, fontStyle: "normal", color: colors.navy, lineMultiplier: 1.05 });
  });
  y += chipLayout.height + 6;
  drawLines(["Perluasan Jaminan"], marginX, y, { fontSize: 8.5, fontStyle: "bold", color: colors.muted, lineMultiplier: 1.05 });
  y += 4;
  if (selectedExtensionRows.length) {
    selectedExtensionRows.forEach((item) => {
      const premiumText = `Rp ${formatRupiah(item.premium)}`;
      setText(8, "bold", colors.navy);
      const premiumWidth = doc.getTextWidth(premiumText) + 10;
      const titleLines = splitLines(item.title, contentWidth - premiumWidth - 20, 10, "bold");
      const detailLines = splitLines(item.detail || "-", contentWidth - 12, 8.8, "normal");
      const extHeight = 12 + drawOnlyHeight(titleLines, 10, 1.2) + 3 + drawOnlyHeight(detailLines, 8.8, 1.3) + 6;
      ensureSpace(extHeight + 4);
      drawCard(marginX, y, contentWidth, extHeight, { fill: colors.card, border: colors.border, radius: 5 });
      drawCard(marginX + contentWidth - premiumWidth - 6, y + 6, premiumWidth, 8, { fill: colors.navySoft, border: colors.navySoft, radius: 4, lineWidth: 0 });
      drawLines(titleLines, marginX + 6, y + 10, { fontSize: 10, fontStyle: "bold", color: colors.text, lineMultiplier: 1.2 });
      drawLines([premiumText], marginX + contentWidth - premiumWidth - 2, y + 11.3, { fontSize: 8, fontStyle: "bold", color: colors.navy, lineMultiplier: 1.05 });
      drawLines(detailLines, marginX + 6, y + 17, { fontSize: 8.8, fontStyle: "normal", color: colors.muted, lineMultiplier: 1.3 });
      y += extHeight + 4;
    });
  } else {
    ensureSpace(16);
    drawCard(marginX, y, contentWidth, 16, { fill: colors.cardAlt, border: colors.border, radius: 5 });
    drawLines(["Belum ada perluasan jaminan dipilih."], marginX + 6, y + 10, { fontSize: 9.2, fontStyle: "normal", color: colors.muted, lineMultiplier: 1.2 });
    y += 20;
  }

  setText(12, "bold", colors.text);
  doc.text("Ringkasan Premi", marginX, y);
  y += 4;
  ensureSpace(44);
  drawCard(marginX, y, contentWidth, 26, { fill: colors.navy, border: colors.navy, radius: 6 });
  drawLines(["Premi Penawaran"], marginX + 8, y + 8, { fontSize: 8.5, fontStyle: "bold", color: [191, 219, 254], lineMultiplier: 1.05 });
  drawLines([`Rp ${formatRupiah(totalPremium)}`], marginX + 8, y + 18, { fontSize: 20, fontStyle: "bold", color: [255, 255, 255], lineMultiplier: 1.05 });
  y += 30;
  const premiumRows = [
    ["Premi", `Rp ${formatRupiah(basePremium)}`],
    ...(extensionPremium > 0 ? [["Premi Perluasan", `Rp ${formatRupiah(extensionPremium)}`]] : []),
    ["Biaya Meterai", `Rp ${formatRupiah(stampDuty)}`],
  ];
  const breakdownHeight = 10 + premiumRows.length * 10;
  ensureSpace(breakdownHeight + 4);
  drawCard(marginX, y, contentWidth, breakdownHeight, { fill: colors.card, border: colors.border, radius: 5 });
  let breakdownY = y + 9;
  premiumRows.forEach((row, index) => {
    if (index > 0) {
      doc.setDrawColor(...colors.divider);
      doc.line(marginX + 6, breakdownY - 4, marginX + contentWidth - 6, breakdownY - 4);
    }
    drawLines([row[0]], marginX + 6, breakdownY, { fontSize: 9.5, fontStyle: "normal", color: colors.muted, lineMultiplier: 1.05 });
    drawLines([row[1]], marginX + contentWidth - 6, breakdownY, { fontSize: 9.5, fontStyle: "bold", color: colors.text, lineMultiplier: 1.05, align: "right" });
    breakdownY += 10;
  });
  y += breakdownHeight + 6;

  ensureSpace(18);
  drawLines([`Tautan penawaran: ${shareUrl || "-"}`], marginX, y, { fontSize: 8.5, fontStyle: "normal", color: colors.muted, lineMultiplier: 1.2 });

  const safeName = sanitizePdfFileName(fileName || `Penawaran-${productTitle || "Property"}-${customerName || "Nasabah"}`) || "Penawaran";
  doc.save(`${safeName}.pdf`);
  return true;
}

function replaceViewerStateInUrl(viewerMode = "", view = "") {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (viewerMode) {
    url.searchParams.set("viewer", viewerMode);
  } else {
    url.searchParams.delete("viewer");
  }

  if (view) {
    url.searchParams.set("view", view);
  } else {
    url.searchParams.delete("view");
  }

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
  if (type === "Inventaris" || type === "Inventari" || type === "Inventaris / Isi") return "Contoh: perabot rumah dan elektronik utama";
  if (type === "Stok") return "Contoh: stok barang dagangan sembako";
  if (type === "Mesin" || type === "Mesin / Peralatan") return "Contoh: mesin kasir dan freezer";
  return "Jenis Objek";
}

function requiresObjectNote(type) {
  return false;
}

function isFloorRelevant(propertyType, occupancy) {
  if (propertyType === "Rumah Tinggal") return false;
  return ["Ruko", "Toko", "Kantor", "Apartment", "Apotek"].includes(propertyType) || occupancy === "Apartment";
}

function deriveConstructionClassFromMaterial({ wallMaterial, structureMaterial, roofMaterial, flammableMaterial }) {
  if (!wallMaterial || !structureMaterial || !roofMaterial || !flammableMaterial) return "";

  const isClassThreeWall = wallMaterial === "Bagian bahan mudah terbakar melebihi 20% dari luas dinding";
  const isClassThreeStructure = structureMaterial === "Material lain di luar ketentuan kelas 1 dan 2";
  const isClassThreeRoof = roofMaterial === "Bahan mudah terbakar lainnya";
  const hasOtherFlammablePart = flammableMaterial === "Ada";

  if (isClassThreeWall || isClassThreeStructure || isClassThreeRoof || hasOtherFlammablePart) {
    return "Kelas 3";
  }

  const hasClassTwoWall = wallMaterial === "Ada bagian bahan mudah terbakar, maksimal sekitar 20% dari luas dinding";
  const hasClassTwoStructure = structureMaterial === "Kayu";
  const hasClassTwoRoof = roofMaterial === "Sirap kayu keras";

  if (hasClassTwoWall || hasClassTwoStructure || hasClassTwoRoof) {
    return "Kelas 2";
  }
  return "Kelas 1";
}

function inferPropertyTypeFromOccupancy(occupancy, allowedPropertyTypes = PROPERTY_TYPES) {
  const selectedOccupancy = String(occupancy || "").trim();
  if (!selectedOccupancy) return "";

  const preferredTypes =
    OCCUPANCY_PROPERTY_TYPE_PREFERENCES[selectedOccupancy] ||
    PROPERTY_TYPES.filter((item) => (OCCUPANCY_MAP[item] || []).includes(selectedOccupancy));

  return preferredTypes.find((item) => allowedPropertyTypes.includes(item)) || allowedPropertyTypes[0] || "";
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

function SectionCard({ title, subtitle, children, action, headerAlign = "left", className = "", compactHeader = false, heroHeader = false }) {
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
        <div className={cls(headerAlign === "center" ? "text-center" : "", heroHeader ? "w-full" : "")}>
          <div
            className={cls(
              heroHeader
                ? "text-[26px] font-bold tracking-tight md:text-[30px]"
                : compactHeader
                  ? "text-[15px] font-semibold"
                  : "text-[18px] font-bold",
              "text-slate-900",
            )}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              className={cls(
                heroHeader
                  ? "mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-[15px]"
                  : compactHeader
                    ? "mt-1 text-[13px] leading-5"
                    : "mt-1 text-sm",
                !heroHeader && "text-slate-500",
              )}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      <div className={compactHeader ? "mt-3" : "mt-4"}>{children}</div>
    </section>
  );
}

function HelpDot({ text }) {
  return (
    <div className="group relative inline-flex">
      <button type="button" className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-500">
        i
      </button>
      <div className="pointer-events-none absolute left-0 top-6 z-40 hidden w-72 whitespace-pre-line rounded-xl bg-slate-900 px-3 py-2 text-xs leading-5 text-white shadow-xl group-hover:block">
        {text}
      </div>
    </div>
  );
}

function FieldLabel({ label, required, helpText }) {
  return (
    <div className="mb-1.5 flex items-center gap-2">
      <label className="text-[13px] font-semibold text-slate-800">
        {label}
        {required ? <span className="text-[#E66A1E]"> *</span> : null}
      </label>
      {helpText ? <HelpDot text={helpText} /> : null}
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
  const normalizedValue = String(value || "").trim();
  const shouldEmphasizeValue = ["Objek Pertanggungan", "Kelas Konstruksi"].includes(normalizedLabel);
  if (!normalizedValue || normalizedValue === "-" || normalizedValue.toLowerCase() === "belum dipilih") return null;
  return (
    <div className={cls("border-t border-slate-100 first:border-t-0 first:pt-0 last:pb-0", shouldEmphasizeValue ? "py-2.5" : "py-2")}>
      <div className="space-y-1 md:grid md:grid-cols-[170px_10px_minmax(0,1fr)] md:gap-y-0 md:gap-x-1.5 md:space-y-0">
        <div className="text-[12px] font-normal leading-[1.4] text-slate-500">
          {normalizedLabel}
          <span className="md:hidden">:</span>
        </div>
        <div className="hidden text-[12px] font-normal leading-[1.4] tracking-[0.08em] text-slate-400 md:block">:</div>
        <div
          className={cls(
            "text-[14px] font-normal leading-[1.45] text-slate-900",
            shouldEmphasizeValue && "leading-[1.75]",
          )}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function deductibleIsDirectText(value) {
  return ["tanpa biaya sendiri", "tanpa risiko sendiri", "tidak dikenakan risiko sendiri", "tidak ada risiko sendiri"].some((token) =>
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
            <div className="mt-1 text-sm text-slate-500">Simulasi daftar penawaran yang pernah dikirim ke calon pemegang polis.</div>
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

function IndicationModal({ open, onClose, onOpenIndicativeOffer, onOpenFinalOffer, onPrintPdf, customerName, shareUrl, onShowQrInfo, onCopyLink, copyStatus, shareLabel, shareSubject }) {
  if (!open) return null;
  const recipientName = customerName || "calon pemegang polis";
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
        onPrintPdf={onPrintPdf}
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
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-2xl rounded-[28px] bg-white shadow-[0_32px_80px_rgba(15,23,42,0.24)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <div className="text-[20px] font-bold text-slate-900">Syarat dan Ketentuan Persetujuan</div>
            <div className="mt-1 text-sm leading-6 text-slate-500">Dengan melanjutkan proses ini, Anda menyatakan telah membaca dan memahami poin persetujuan atas SPAU elektronik ini.</div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[60vh] space-y-4 overflow-y-auto px-6 py-5">
          <div className="rounded-2xl border border-[#D8E1EA] bg-[linear-gradient(180deg,#FBFDFF_0%,#F5F9FD_100%)] p-4">
            <ol className="space-y-4">
              {CONSENT_SECTIONS.map((item, index) => (
                <li key={item.key} className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#C9D8E8] bg-white text-[13px] font-semibold text-[#0A4D82]">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-slate-900">{item.title}</div>
                    <div className="mt-1 space-y-2 text-[13px] leading-[1.75] text-slate-600" style={{ textAlign: "justify" }}>
                      {(item.detailLines || []).map((line, lineIndex) => (
                        <div key={item.key + "-line-" + lineIndex}>
                          <span>{line}</span>
                          {lineIndex === (item.detailLines || []).length - 1 && item.detailLinkHref ? (
                            <>
                              {" "}
                              <a
                                href={item.detailLinkHref}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-[#0A4D82] underline underline-offset-2 hover:text-[#0D5B98]"
                              >
                                {item.detailLinkLabel || item.detailLinkHref}
                              </a>
                            </>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm leading-6 text-slate-500">
          Silakan setujui jika isi persetujuan ini sudah sesuai.
        </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="rounded-[10px] border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Tutup</button>
            <button type="button" onClick={onAgree} className="rounded-[10px] bg-[#0A4D82] px-4 py-2 text-sm font-semibold text-white hover:brightness-105">
              {agreed ? "Sudah Disetujui" : "Saya Setuju"}
            </button>
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
            <div className="flex items-center gap-2 text-[#0A4D82]">{!alwaysIncluded ? <Icon className="h-4 w-4 shrink-0" /> : null}<div className="truncate text-[14px] font-medium leading-[1.35]">{title}</div></div>
            <div className="mt-0.5 text-[12px] font-normal text-slate-500">Premi: {premium}</div>
          </div>
          <ChevronDown className={cls("h-4 w-4 shrink-0 text-slate-500 transition", expanded && "rotate-180")} />
        </button>
      </div>
            {expanded ? <div className="border-t border-[#D6E0EA] px-3.5 py-3"><div className="text-[12.5px] leading-6 text-slate-700" style={{ textAlign: "justify" }}>{detail}</div><div className="mt-2 text-[12px] leading-6 text-slate-600" style={{ textAlign: "justify" }}>{deductibleIsDirectText(deductible) ? <span>{String(deductible || "").replace(/biaya sendiri/gi, "risiko sendiri")}</span> : <><span className="font-medium text-slate-700">Risiko sendiri saat klaim: </span><span>{String(deductible || "").replace(/biaya sendiri/gi, "risiko sendiri")}</span></>}</div>{extra ? <div className="mt-3">{extra}</div> : null}</div> : null}
    </div>
  );
}

function GuaranteeSummaryDetailCard({ title, icon, premium, detail, deductible }) {
  const Icon = icon || Shield;
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-xl border border-[#C9D5E3] bg-[#F8FBFE]">
      <button type="button" onClick={() => setExpanded((prev) => !prev)} className="flex w-full items-start justify-between gap-3 px-3.5 py-3 text-left">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[#0A4D82]">
            <Icon className="h-4 w-4 shrink-0" />
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
          <div className="text-[12.5px] leading-6 text-slate-700" style={{ textAlign: "justify" }}>
            {detail}
          </div>
          {deductible ? (
            <div className="mt-2 text-[12px] leading-6 text-slate-600" style={{ textAlign: "justify" }}>
              {deductibleIsDirectText(deductible) ? (
                <span>{String(deductible || "").replace(/biaya sendiri/gi, "risiko sendiri")}</span>
              ) : (
                <>
                  <span className="font-medium text-slate-700">Risiko sendiri saat klaim: </span>
                  <span>{String(deductible || "").replace(/biaya sendiri/gi, "risiko sendiri")}</span>
                </>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
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
  ktpCheck,
  onCaptureKtp,
  uploads,
  setUploads,
  setEvidence,
  expandedRows,
  setExpandedRows,
  external = false,
  useAccountProfileCustomerData = false,
  profileCustomerOverrideEnabled = false,
  profileCustomerEditMode = false,
  accountIdentityNumber = "",
  accountInsuredAddress = "",
  onEnableProfileCustomerEdit,
  onCancelProfileCustomerEdit,
  onSaveProfileCustomerEdit,
}) {
  const isCompanyCustomer = customerType === "Badan Usaha";
  const identityLabel = customerType === "Badan Usaha" ? "NPWP" : "NIK";
  const coverageDateFieldRef = useRef(null);
  const insuredName = selectedCustomer ? selectedCustomer.name : form.identity;
  const coverageEndDate = calculateCoverageEnd(uwForm.coverageStartDate);
  const coverageStartDisplay = uwForm.coverageStartDate ? formatDisplayDate(new Date(`${uwForm.coverageStartDate}T00:00:00`)) : "-";
  const coverageEndDisplay = coverageEndDate ? formatDisplayDate(new Date(`${coverageEndDate}T00:00:00`)) : "-";
  const coveragePeriodDisplay = uwForm.coverageStartDate ? `${coverageStartDisplay} - ${coverageEndDisplay}` : "Pilih tanggal mulai pertanggungan";
  const hasStockObject = objectRows.some((row) => row.type === "Stok");
  const selectedStockTypeMeta = STOCK_TYPE_OPTIONS.find((item) => item.label === uwForm.stockType);
  const customerDataMode = !isCompanyCustomer ? uwForm.customerDataMode || "scan" : "manual";
  const shouldShowCustomerSummary =
    external
    && (
      useAccountProfileCustomerData
      || (profileCustomerOverrideEnabled && !profileCustomerEditMode)
    );
  const canShowCustomerFields =
    useAccountProfileCustomerData
    || profileCustomerOverrideEnabled
    || isCompanyCustomer
    || customerDataMode === "manual"
    || Boolean(uwForm.ktpRead);
  const ktpConfidenceLabel = ktpCheck?.confidence ? `${Math.round(ktpCheck.confidence * 100)}%` : "-";
  const customerSectionTitle = "Informasi Calon Pemegang Polis";
  const propertySectionTitle = "Informasi Properti Lanjutan";
  const photoSectionTitle = "Foto Properti";
  const customerSectionSubtitle = undefined;
  const propertySectionSubtitle = undefined;
  const profileIdentityNumber = String(accountIdentityNumber || "").trim();
  const profileInsuredAddress = String(accountInsuredAddress || "").trim();
  const photoSectionSubtitle = external
    ? undefined
    : "Wajib diisi oleh petugas internal.";
  const externalSectionClassName = external ? "border-[#CFE0F0] bg-[#F8FBFE] shadow-[0_12px_30px_rgba(15,23,42,0.06)]" : "";
  const customerSectionAction =
    shouldShowCustomerSummary
      ? (
        <button
          type="button"
          onClick={onEnableProfileCustomerEdit}
          className="inline-flex h-9 items-center rounded-[10px] border border-[#D5DEEA] bg-white px-4 text-sm font-semibold text-[#0A4D82] hover:bg-[#F8FBFE]"
        >
          Edit
        </button>
      )
      : external && profileCustomerEditMode
        ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancelProfileCustomerEdit}
              className="inline-flex h-9 items-center rounded-[10px] border border-[#D5DEEA] bg-white px-4 text-sm font-semibold text-[#0A4D82] hover:bg-[#F8FBFE]"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onSaveProfileCustomerEdit}
              className="inline-flex h-9 items-center rounded-[10px] bg-[#0A4D82] px-4 text-sm font-semibold text-white hover:bg-[#0D5B98]"
            >
              Simpan
            </button>
          </div>
        )
        : null;

  return (
    <div className="space-y-5">
      <SectionCard title={customerSectionTitle} subtitle={customerSectionSubtitle} className={externalSectionClassName} compactHeader={external} action={customerSectionAction}>
        <div className="space-y-5">
          {!isCompanyCustomer && !useAccountProfileCustomerData && !profileCustomerOverrideEnabled ? (
            <div className="grid gap-2.5 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setUwField("customerDataMode", "scan")}
                className={cls(
                  "rounded-[14px] border px-4 py-2.5 text-left transition",
                  customerDataMode === "scan" ? "border-[#0A4D82] bg-[#F8FBFE]" : "border-slate-200 bg-white",
                )}
              >
                <div className="text-[14px] font-semibold text-[#0A4D82]">Gunakan Foto KTP</div>
              </button>
              <button
                type="button"
                onClick={() => setUwField("customerDataMode", "manual")}
                className={cls(
                  "rounded-[14px] border px-4 py-2.5 text-left transition",
                  customerDataMode === "manual" ? "border-[#0A4D82] bg-[#F8FBFE]" : "border-slate-200 bg-white",
                )}
              >
                <div className="text-[14px] font-semibold text-[#0A4D82]">Isi Manual</div>
              </button>
            </div>
          ) : null}

          {!isCompanyCustomer && !useAccountProfileCustomerData && !profileCustomerOverrideEnabled && customerDataMode === "scan" ? (
            <div className="rounded-[16px] border border-[#D8E1EA] bg-[#F8FBFE] px-4 py-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className={cls("text-[13px] font-medium", uwForm.ktpRead ? "text-emerald-700" : "text-slate-600")}>
                  {uwForm.ktpRead ? `Foto KTP terbaca (${ktpConfidenceLabel})` : "Isi otomatis dengan KTP"}
                </div>
                <button
                  type="button"
                  onClick={onCaptureKtp}
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[10px] bg-[#0A4D82] px-4 text-sm font-bold text-white hover:brightness-105"
                >
                  <Camera className="h-4 w-4" />
                  Foto KTP
                </button>
              </div>
            </div>
          ) : null}

          {canShowCustomerFields ? (
            shouldShowCustomerSummary ? (
              <div className="rounded-[16px] border border-[#D8E1EA] bg-white px-4 py-4">
                <div className="space-y-1">
                  <OfferSummaryKeyValue
                    label={identityLabel}
                    value={(profileCustomerOverrideEnabled ? String(uwForm.idNumber || "").trim() : profileIdentityNumber) || "-"}
                  />
                  <OfferSummaryKeyValue
                    label="Alamat Calon Pemegang Polis"
                    value={(profileCustomerOverrideEnabled ? String(uwForm.insuredAddress || "").trim() : profileInsuredAddress) || "-"}
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel label={identityLabel} />
                  <TextInput
                    value={uwForm.idNumber}
                    onChange={(value) => setUwField("idNumber", onlyDigits(value))}
                    placeholder={customerType === "Badan Usaha" ? "Masukkan NPWP" : "Masukkan NIK"}
                    icon={<User className="h-4 w-4" />}
                  />
                </div>
                {customerType === "Badan Usaha" ? (
                  <div>
                    <FieldLabel label="Kontak di Lokasi" required />
                    <div className="space-y-2">
                      <TextInput value={uwForm.picName} onChange={(value) => setUwField("picName", value)} placeholder={insuredName || "Nama kontak yang bisa dihubungi di lokasi"} icon={<User className="h-4 w-4" />} />
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input type="checkbox" checked={uwForm.sameAsInsured} onChange={(event) => setUwField("sameAsInsured", event.target.checked)} />
                        Sama dengan calon pemegang polis
                      </label>
                    </div>
                  </div>
                ) : null}
                <div className="md:col-span-2">
                  <FieldLabel label="Alamat Calon Pemegang Polis" required />
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
                          placeholder="Ketik alamat calon pemegang polis"
                          icon={<MapPin className="h-4 w-4" />}
                        />
                        <div className="flex flex-wrap gap-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              const gpsAddress = "Lokasi calon pemegang polis tersimulasi - Jl. Sudirman Kav. 44, Jakarta Selatan";
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
                              const mapAddress = "Pin lokasi calon pemegang polis tersimulasi - Ruko Blok A3, Jl. Boulevard Raya, Kelapa Gading";
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
            )
          ) : null}
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

      <SectionCard title="Informasi Pertanggungan" className={externalSectionClassName} compactHeader={external}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <FieldLabel label="Tanggal Mulai Perlindungan" required helpText="Perlindungan asuransi berlaku 1 tahun sejak tanggal ini." />
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
          <div className="md:col-span-2">
            <FieldLabel
              label="Pernah diajukan klaim asuransi dalam 3 tahun terakhir?"
              required
              helpText="Klaim asuransi adalah permintaan ganti rugi ke perusahaan asuransi atas kerusakan, kehilangan, atau kejadian lain yang dijamin polis."
            />
            <SelectInput
              value={uwForm.claimHistory}
              onChange={(value) => setUwField("claimHistory", value)}
              options={CLAIM_HISTORY_OPTIONS}
              placeholder="Pilih jawaban yang sesuai"
            />
          </div>
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
  internalPreviewMode = false,
}) {
  const isIndicative = mode === "indicative";
  const isInternalPreview = internalPreviewMode || viewerMode === "internal";
  const activeVariant = productConfig || getPropertyVariant("property-safe");
  const operatingStatusValue = operatingRecord?.status;
  const operatingVersion = operatingRecord?.version;
  const operatingValidUntil = operatingRecord?.validUntil;
  const operatingOwner = operatingRecord?.owner;
  const operatingId = operatingRecord?.id;
  const showEstimatedPremium = !canProceed;
  const coverageLabel = showEstimatedPremium ? "Estimasi Premi 1 Tahun" : "Premi 1 Tahun";
  const primaryLabel = isIndicative ? "Data Lanjutan" : "Pembayaran";
  const primaryActionLabel = isIndicative ? "Isi Data Lanjutan" : "Lanjut ke Pembayaran";
  const constructionInfo = CONSTRUCTION_GUIDE.find((item) => item.title === constructionClass);
  const [sectionOpen, setSectionOpen] = useState({ property: false, insured: false, guarantee: false });
  const [editingSections, setEditingSections] = useState({ property: false, guarantee: false, insured: false });
  const [objectOpen, setObjectOpen] = useState({ detail: false, main: false, exclusions: false, extension: false });
  const [insuredOpen, setInsuredOpen] = useState({ profile: false, advanced: false, photos: false });
  const isInternalDataFlow = viewerMode === "internal";
  const isReadOnlyPreview = isInternalPreview;
  const stepOneTitle = isInternalDataFlow ? "Data Awal" : "Tinjau Penawaran";

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

  useEffect(() => {
    if (!isReadOnlyPreview) return;
    setEditingSections({ property: false, guarantee: false, insured: false });
  }, [isReadOnlyPreview]);
  const greetingRecipientName = customerDisplay && customerDisplay !== "-"
    ? String(customerDisplay).trim()
    : "Calon Pemegang Polis";
  const objectSummaryLabel = occupancy ? `Properti digunakan untuk ${String(occupancy).toLowerCase()}` : "Informasi properti belum dilengkapi";
  const coverageValue = "Rp " + formatRupiah(totalValue);
  const premiumValue = "Rp " + formatRupiah(estimatedTotal);
  const visibleGuarantees = isIndicative ? extensionOptions : selectedExtensions;
  const objectTypeSummary = objectRows.length
    ? Array.from(new Set(objectRows.map((row) => normalizeObjectTypeLabel(row.type)).filter(Boolean))).join(", ")
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
                <span className="max-w-[126px] truncate font-semibold">{isInternalPreview ? "Internal" : "Calon Pemegang Polis"}</span>
                <ChevronDown className={cls("h-4 w-4 text-white/85 transition", viewerMenuOpen && "rotate-180")} />
              </button>
              {viewerMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+10px)] z-40 w-[220px] rounded-[14px] border border-[#D9E1EA] bg-white p-2 shadow-[0_20px_45px_rgba(15,23,42,0.16)]">
                  {[
                    { key: "internal", label: "Internal" },
                    { key: "customer", label: "Calon Pemegang Polis" },
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
                <StepNode step="Langkah 1" title={stepOneTitle} subtitle={isIndicative ? "Sedang dibuka" : "Selesai"} active={isIndicative} done={!isIndicative} icon={<FileText className="h-4 w-4" />} onClick={isIndicative ? undefined : onSecondary} />
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
                  title="Ringkasan Informasi Calon Pemegang Polis"
                  action={isReadOnlyPreview || editingSections.insured ? null : <SummaryEditButton onClick={() => startEditingSection("insured")} />}
                >
                  {editingSections.insured ? (
                    <div className="space-y-4">
                      <OfferSummaryKeyValue label="Nama Calon Pemegang Polis" value={customerDisplay} />
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
                  action={isReadOnlyPreview || editingSections.property ? null : <SummaryEditButton onClick={() => startEditingSection("property")} />}
                >
                  {editingSections.property ? (
                    <div className="space-y-4">
                      <OfferSummaryKeyValue label="Penggunaan Properti:" value={occupancy || "-"} />
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
                                  <FieldLabel label="Harga Pertanggungan" required />
                                  <CurrencyInput value={row.amount} onChange={(value) => updateObjectRow(row.id, { amount: value })} placeholder="Masukkan harga pertanggungan" />
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
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => finishEditingSection("property")}
                          className="inline-flex h-9 items-center rounded-[10px] bg-[#0A4D82] px-4 text-sm font-semibold text-white hover:bg-[#0D5B98]"
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <OfferSummaryKeyValue label="Penggunaan Properti:" value={occupancy || "-"} />
                      <OfferSummaryKeyValue
                        label="Objek Pertanggungan:"
                        value={
                          objectRows.length ? (
                            <div className="space-y-0.5">
                              {objectRows.map((row) => (
                                <div key={row.id}>
                          <span>{normalizeObjectTypeLabel(row.type) || "Objek"}</span>
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
                      <GuaranteeSummaryDetailCard
                        title={activeVariant.primaryCoverageTitle}
                        icon={Flame}
                        premium={basePremium > 0 ? `Rp ${formatRupiah(basePremium)}` : "-"}
                        detail={activeVariant.primaryCoverageDescription}
                        deductible={constructionClass === "Kelas 1" ? activeVariant.primaryCoverageDeductibleClassOne : activeVariant.primaryCoverageDeductibleOther}
                      />
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-[14px] font-medium text-slate-600">Perluasan Jaminan</div>
                        {!isReadOnlyPreview ? <div className="mt-0.5 text-[12px] leading-5 text-slate-500">Pilih perluasan jaminan yang ingin ditambahkan.</div> : null}
                      </div>
                      {extensionOptions.map((item) => {
                        const extensionItemPremium = totalValue > 0 ? `Rp ${formatRupiah(Math.round(totalValue * item.rate))}` : "-";
                        const deductibleValue = item.key === "earthquake" ? `2,5% dari Rp ${formatRupiah(totalValue)}` : item.deductible;
                        const toggleGuarantee = () => {
                          if (isReadOnlyPreview) return;
                          setSelectedGuarantees((prev) => ({ ...prev, [item.key]: !prev[item.key] }));
                        };
                        return (
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
                              {isReadOnlyPreview ? (
                                <div
                                  aria-hidden="true"
                                  className={cls(
                                    "mt-0.5 flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-md border transition-all duration-200",
                                    selectedGuarantees[item.key]
                                      ? "border-[#0A4D82] bg-[#0A4D82] text-white shadow-[0_6px_12px_rgba(10,77,130,0.22)]"
                                      : "border-[#CAD6E3] bg-white text-transparent",
                                  )}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  aria-pressed={Boolean(selectedGuarantees[item.key])}
                                  onClick={toggleGuarantee}
                                  className={cls(
                                    "mt-0.5 flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-md border transition-all duration-200",
                                    selectedGuarantees[item.key]
                                      ? "border-[#0A4D82] bg-[#0A4D82] text-white shadow-[0_6px_12px_rgba(10,77,130,0.22)]"
                                      : "border-[#CAD6E3] bg-white text-transparent hover:border-[#9DB8D4]",
                                  )}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  {isReadOnlyPreview ? (
                                    <div className="min-w-0 flex-1">
                                      <SummaryGuaranteeItem title={item.title} icon={item.icon} compact />
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={toggleGuarantee}
                                      className="min-w-0 flex-1 text-left"
                                    >
                                      <SummaryGuaranteeItem title={item.title} icon={item.icon} compact />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setExpandedRows((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                                    className="flex shrink-0 items-center gap-2 text-left"
                                  >
                                    <span className={cls("whitespace-nowrap text-[12px] font-medium", selectedGuarantees[item.key] ? "text-[#0A4D82]" : "text-slate-500")}>
                                      {extensionItemPremium}
                                    </span>
                                    <ChevronDown className={cls("mt-0.5 h-4 w-4 shrink-0 text-slate-500 transition duration-200", expandedRows[item.key] && "rotate-180")} />
                                  </button>
                                </div>
                                {expandedRows[item.key] ? <div className="mt-1.5 pl-[30px] text-[13px] leading-5 text-slate-500">{item.detail}</div> : null}
                                {expandedRows[item.key] && deductibleValue ? (
                                  <div className="mt-2 pl-[30px] text-[12px] leading-5 text-slate-600" style={{ textAlign: "justify" }}>
                                    {deductibleIsDirectText(deductibleValue) ? (
                                      <span>{String(deductibleValue || "").replace(/biaya sendiri/gi, "risiko sendiri")}</span>
                                    ) : (
                                      <>
                                        <span className="font-semibold text-slate-700">Risiko sendiri saat klaim: </span>
                                        <span>{String(deductibleValue || "").replace(/biaya sendiri/gi, "risiko sendiri")}</span>
                                      </>
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {selectedGuarantees.earthquake && isFloorRelevant(propertyType, occupancy) ? (
                      <div className="max-w-sm rounded-xl border border-amber-200 bg-white p-3">
                        {isReadOnlyPreview ? (
                          <div className="space-y-1">
                            <div className="text-sm text-slate-500">Jumlah lantai bangunan yang diasuransikan</div>
                            <div className="text-[15px] text-slate-900">{floorCount || "-"}</div>
                          </div>
                        ) : (
                          <>
                            <FieldLabel label="Jumlah lantai bangunan yang diasuransikan" required helpText="Diisi hanya bila objek bertingkat dan gempa bumi dipilih." />
                            <TextInput value={floorCount} onChange={(value) => setFloorCount(onlyDigits(value))} placeholder="Masukkan jumlah lantai" icon={<Building2 className="h-4 w-4" />} />
                          </>
                        )}
                      </div>
                    ) : null}
                  </div>
                </OfferSummarySection>

                <OfferSummarySection title="Ringkasan Pembayaran" subtitle={isIndicative && blockingMessage ? blockingMessage : undefined}>
                  <PremiumPriceHero
                    label="Total Pembayaran"
                    value={`Rp ${formatRupiah(estimatedTotal)}`}
                    tooltipText={
                      showEstimatedPremium
                        ? "Total pembayaran ini masih perkiraan awal. Setelah Anda melengkapi Data Lanjutan, nilainya akan dihitung ulang dan bisa berubah sesuai informasi yang Anda isi."
                        : undefined
                    }
                  />
                  <PremiumBreakdown>
                    <ProposalRow label="Premi" value={"Rp " + formatRupiah(basePremium)} />
                    {extensionPremium > 0 ? <ProposalRow label="Premi Perluasan" value={"Rp " + formatRupiah(extensionPremium)} /> : null}
                    <ProposalRow label="Biaya Meterai" value={"Rp " + formatRupiah(stampDuty)} />
                  </PremiumBreakdown>
                </OfferSummarySection>

                {!isReadOnlyPreview ? (
                  <div className="rounded-[24px] border border-[#D8E1EA] bg-white p-5 shadow-sm">
                    {helpRequestSent ? (
                      <div>
                        <SummarySidebarAlert
                          items={[]}
                          successText="Permintaan bantuan isi data lanjutan sudah dikirim. Tim kami akan menindaklanjuti penawaran ini."
                        />
                      </div>
                    ) : null}
                    <div className={cls(helpRequestSent ? "mt-4" : "")}>
                      <button
                        type="button"
                        disabled={isIndicative ? false : !canProceed || offerMeta.isExpired}
                        onClick={onPrimary}
                        className={cls(
                          "flex h-[48px] w-full items-center justify-center rounded-[12px] px-5 text-sm font-semibold text-white shadow-sm",
                          isIndicative || (!isIndicative && canProceed && !offerMeta.isExpired)
                            ? "bg-[#F5A623] hover:brightness-105"
                            : "cursor-not-allowed bg-slate-400"
                        )}
                      >
                        {primaryActionLabel}
                      </button>
                    </div>
                    <div className="mt-3 flex flex-col items-center gap-2">
                      {!helpRequestSent ? (
                        <button
                          type="button"
                          onClick={onSecondary}
                          className="text-sm font-medium text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
                        >
                          Minta Bantuan Isi Data Lanjutan
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={onReject}
                        className="text-xs font-medium text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
                      >
                        Tidak mau melanjutkan penawaran
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
  onEditExtensions,
  policyConsentApproved,
  onOpenConsent,
  onConfirmPayment,
  paymentStatus,
  operatingRecord,
  isExpired,
  productConfig,
  stepOneTitle = "Tinjau Penawaran",
  guestMode = false,
}) {
  const [openPaymentGroup, setOpenPaymentGroup] = useState("");
  const activeVariant = productConfig || getPropertyVariant("property-safe");
  const operatingBlockedMessage = paymentBlockMessage(operatingRecord);
  const canProceedPayment = canProceedToPaymentFromOperating(operatingRecord);
  const derivedConstructionClass = deriveConstructionClassFromMaterial({
    wallMaterial: form.wallMaterial,
    structureMaterial: form.structureMaterial,
    roofMaterial: form.roofMaterial,
    flammableMaterial: form.flammableMaterial,
  });
  const effectiveConstructionClass = form.constructionClass || derivedConstructionClass;
  const customerDisplay = customerName || form.identity || "Calon Pemegang Polis";
  const coverageEndDate = calculateCoverageEnd(uwForm.coverageStartDate);
  const coveragePeriod = uwForm.coverageStartDate && coverageEndDate
    ? `${formatDisplayDate(new Date(`${uwForm.coverageStartDate}T00:00:00`))} - ${formatDisplayDate(new Date(`${coverageEndDate}T00:00:00`))}`
    : "-";
  const selectedExtensionTitles = extensionOptions.filter((item) => selectedGuarantees[item.key]).map((item) => item.title);
  const selectedExtensions = extensionOptions.filter((item) => selectedGuarantees[item.key]);
  const guaranteeSummaryVisualItems = selectedExtensions.map((item) => ({
    title: item.title,
    icon: item.icon || Shield,
    premium: totalValue > 0 ? `Rp ${formatRupiah(Math.round(totalValue * item.rate))}` : "-",
    detail: item.detail,
    deductible: item.key === "earthquake" ? `2,5% dari Rp ${formatRupiah(totalValue)}` : item.deductible,
  }));
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
                    const pieces = [normalizeObjectTypeLabel(row.type) || "Objek", `Rp ${formatRupiah(parseNumber(row.amount))}`];
          if (row.note) pieces.push(row.note);
          return pieces.join(" - ");
        })
        .join(", ")
    : "-";
  const canConfirmPayment = Boolean(paymentMethod) && policyConsentApproved && canProceedPayment && !isExpired && !paymentStatus;
  const phoneDisplay = form.phone || "-";
  const emailDisplay = form.email || "-";
  const coverageValue = `Rp ${formatRupiah(totalValue)}`;
  const transactionFee = paymentMethod ? PAYMENT_METHOD_FEE_LOOKUP[paymentMethod] || 0 : 0;
  const totalPayment = estimatedTotal + transactionFee;
  const paymentPendingItems = [];
  if (!paymentMethod) paymentPendingItems.push("Pilih salah satu metode pembayaran terlebih dahulu.");
  if (!policyConsentApproved) paymentPendingItems.push("Buka dan setujui Syarat dan Ketentuan Persetujuan atas SPAU elektronik ini.");
  const transactionFeeLabel = (
    <span className="inline-flex items-center gap-1.5">
      <span>Biaya Transaksi</span>
      <TooltipDot
        ariaLabel="Lihat penjelasan biaya transaksi"
        text="Biaya transaksi adalah biaya yang diperlukan untuk menunjang transaksi elektronik ini. Biaya transaksi tergantung pada metode pembayaran yang dipilih."
      />
    </span>
  );

  return (
    <div className="min-h-screen bg-[#F3F5F7] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0A4D82] shadow-sm">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-white">
              <div className="text-[15px] font-black leading-tight md:text-[18px]">Danantara<div className="-mt-1 text-[15px] md:text-[18px]">Indonesia</div></div>
              <div className="hidden text-[15px] font-semibold text-white/95 sm:block">asuransi jasindo</div>
            </div>
            <div className="hidden items-center gap-3 md:flex">
              <button type="button" onClick={() => { window.location.href = "https://esppa.asuransijasindo.co.id/"; }} className="inline-flex items-center gap-2 rounded-[8px] bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"><Home className="h-4 w-4" />Beranda</button>
              <button type="button" className="inline-flex items-center gap-2 rounded-[8px] bg-[#F5A623] px-4 py-2 text-sm font-semibold text-white shadow-sm"><Package className="h-4 w-4" />Produk</button>
            </div>
          </div>
          <div className="flex items-center gap-4 text-white">
            {guestMode ? (
              <button
                type="button"
                onClick={() => {
                  window.location.href = "https://esppa.asuransijasindo.co.id/";
                }}
                className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#0A4D82] px-4 text-sm font-semibold text-white shadow-sm ring-1 ring-white/20 hover:bg-[#0C5D9E]"
              >
                <Home className="h-4 w-4" aria-hidden="true" />
                Masuk
              </button>
            ) : (
              <>
                <button type="button" className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">ID</span>{String(customerDisplay).trim() || "Calon Pemegang Polis"}</button>
                <button type="button" aria-label="Lihat notifikasi" className="hidden h-11 w-11 items-center justify-center rounded-[10px] border border-white/20 bg-white/10 text-white shadow-sm hover:bg-white/15 md:inline-flex"><Bell className="h-4 w-4" /></button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="bg-[#0A4D82] pb-8">
        <div className="mx-auto max-w-[1280px] px-4 pt-6 md:px-6">
            <div className="flex items-center justify-start">
              <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-[10px] border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"><ArrowLeft className="h-4 w-4" />Kembali ke Data Lanjutan</button>
            </div>
            <div className="mt-5 text-center text-white">
              {!guestMode ? <div className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90">Halo, {String(customerDisplay).trim() || "Calon Pemegang Polis"}</div> : null}
            <h1 className="mt-4 text-[32px] font-bold tracking-tight md:text-[40px]">{productTitle}</h1>
            <p className="mx-auto mt-2 max-w-3xl text-[14px] text-white/90 md:text-[17px]">Pilih metode pembayaran dan tinjau ringkasan singkat penawaran Anda sebelum melanjutkan.</p>
          </div>

          <div className="mx-auto mt-6 max-w-[860px] rounded-[28px] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-6 rounded-[18px] border border-[#D8E1EA] bg-[#F8FBFE] px-4 py-5 md:flex-row md:items-center md:gap-4 md:px-6">
                <StepNode step="Langkah 1" title={stepOneTitle} subtitle="Selesai" active={false} done={true} icon={<FileText className="h-4 w-4" />} />
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
            title="Ringkasan Sebelum Pembayaran"
            subtitle="Tinjau kembali ringkasan Anda sebelum melanjutkan ke pembayaran. Ringkasan ini disusun dari data yang Anda isi dan lengkapi dalam SPAU elektronik, serta mengacu pada Polis Standar Asuransi Kebakaran Indonesia."
            headerAlign="center"
            heroHeader={true}
          >
            <div className="rounded-[24px] border border-[#D8E1EA] bg-[linear-gradient(180deg,#FBFDFF_0%,#F5F9FD_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              <div className="space-y-3">
                <OfferSummarySection title="Ringkasan Informasi Calon Pemegang Polis">
                  <div className="space-y-2.5">
                    <OfferSummaryKeyValue label="Nama Calon Pemegang Polis" value={customerDisplay} />
                    <OfferSummaryKeyValue label="Alamat Email" value={emailDisplay} />
                    <OfferSummaryKeyValue label="Nomor Handphone" value={phoneDisplay} />
                  </div>
                </OfferSummarySection>

                <OfferSummarySection title="Ringkasan Informasi Properti">
                  <div className="space-y-2.5">
                    <OfferSummaryKeyValue label="Penggunaan Properti" value={occupancy || "-"} />
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
                    <div className="text-[15px] font-normal text-slate-900">Polis Standar Asuransi Kebakaran Indonesia</div>
                    <div className="space-y-2">
                      <div className="text-[13px] font-medium text-slate-500">Risiko yang dijamin</div>
                      <GuaranteeSummaryDetailCard
                        title={activeVariant.primaryCoverageTitle}
                        icon={Flame}
                        premium={`Rp ${formatRupiah(basePremium)}`}
                        detail={activeVariant.primaryCoverageDescription}
                        deductible={effectiveConstructionClass === "Kelas 1" ? activeVariant.primaryCoverageDeductibleClassOne : activeVariant.primaryCoverageDeductibleOther}
                      />
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="text-[13px] font-medium text-slate-500">Perluasan Jaminan</div>
                        <button
                          type="button"
                          onClick={onEditExtensions}
                          className="text-[12px] font-medium text-[#0A4D82] underline underline-offset-2 hover:text-[#0D5B98]"
                        >
                          {guaranteeSummaryVisualItems.length ? "Ubah Perluasan Jaminan" : "Tambahkan Perluasan Jaminan"}
                        </button>
                      </div>
                      {guaranteeSummaryVisualItems.length ? (
                        <div className="space-y-2">
                          {guaranteeSummaryVisualItems.map((item) => (
                            <GuaranteeSummaryDetailCard
                              key={item.title}
                              title={item.title}
                              icon={item.icon}
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
                  <PremiumPriceHero label="Total Pembayaran" value={`Rp ${formatRupiah(totalPayment)}`} />
                  <PremiumBreakdown>
                    <ProposalRow label="Premi" value={`Rp ${formatRupiah(basePremium)}`} />
                    {extensionPremium > 0 ? <ProposalRow label="Premi Perluasan" value={`Rp ${formatRupiah(extensionPremium)}`} /> : null}
                    <ProposalRow label={transactionFeeLabel} value={`Rp ${formatRupiah(transactionFee)}`} />
                    <ProposalRow label="Biaya Meterai" value={`Rp ${formatRupiah(stampDuty)}`} />
                    <ProposalRow label="Total Pembayaran" value={`Rp ${formatRupiah(totalPayment)}`} strong />
                  </PremiumBreakdown>
                </OfferSummarySection>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Pilih Metode Pembayaran">
            <div className="space-y-7">
              {PAYMENT_METHOD_GROUPS.map((group) => (
                <div key={group.label} className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setOpenPaymentGroup((current) => (current === group.label ? "" : group.label))}
                    className="flex w-full items-center justify-between border-b border-[#D8E1EA] pb-3 text-left"
                  >
                    <div className="text-[15px] font-semibold text-slate-600">{group.label}</div>
                    <ChevronDown className={cls("h-4 w-4 text-slate-500 transition-transform", openPaymentGroup === group.label ? "rotate-180" : "")} />
                  </button>
                  {openPaymentGroup === group.label ? (
                    <div className="grid gap-3 md:grid-cols-3">
                      {group.methods.map((method) => {
                        const selected = paymentMethod === method.label;
                        return (
                          <button
                            key={method.label}
                            type="button"
                            onClick={() => onSelectMethod(method.label)}
                            className={cls(
                              "min-h-[52px] rounded-[6px] border px-4 py-3 text-left transition",
                              selected
                                ? "border-[#0A4D82] bg-[#F8FBFE] shadow-sm"
                                : "border-[#7E9AB6] bg-white hover:border-[#0A4D82] hover:bg-[#FBFDFF]",
                            )}
                          >
                            <div className="text-[15px] font-semibold leading-5 text-[#5A748B]">{method.label}</div>
                            <div className="mt-0.5 text-[12px] leading-4 text-[#7B97AC]">+IDR {formatRupiah(method.feeAmount)}</div>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            {operatingBlockedMessage ? <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{operatingBlockedMessage}</div> : null}
            {isExpired ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Masa berlaku penawaran ini sudah berakhir. Silakan minta versi penawaran terbaru sebelum melanjutkan pembayaran.</div> : null}
            {paymentStatus ? <div className="mt-4 rounded-xl border border-[#CFE0F0] bg-[#F8FBFE] p-4 text-sm text-[#0A4D82]">{paymentStatus}</div> : null}
          </SectionCard>

          <SectionCard title="Lanjutkan Pembayaran" subtitle="Selesaikan persetujuan atas SPAU elektronik ini terlebih dahulu, lalu lanjutkan pembayaran.">
            <div className="rounded-2xl border border-[#D8E1EA] bg-white px-4 py-4">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={onOpenConsent}
                  className={cls(
                    "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border transition",
                    policyConsentApproved
                      ? "border-[#0A4D82] bg-[#0A4D82] text-white"
                      : "border-[#B7C7D8] bg-white text-transparent hover:border-[#0A4D82]",
                  )}
                  aria-label={policyConsentApproved ? "Persetujuan kebijakan sudah disetujui" : "Buka syarat dan ketentuan persetujuan"}
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <div className="min-w-0 text-sm leading-6 text-slate-700">
                  <span>Saya telah membaca dan menyetujui </span>
                  <button
                    type="button"
                    onClick={onOpenConsent}
                    className="inline p-0 font-medium text-[#0A4D82] underline underline-offset-2 hover:text-[#0D5B98]"
                  >
                    Syarat dan Ketentuan Persetujuan
                  </button>
                  <span> atas SPAU elektronik ini.</span>
                </div>
              </div>
            </div>
            {!paymentStatus ? <div className="mt-4"><SummarySidebarAlert items={paymentPendingItems} /></div> : null}
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
  sessionProfile = null,
  operatingRecord = null,
  onOperatingSignal = () => {},
  onOpenWorkspace = () => {},
  onOpenQueue = () => {},
  onOpenPartnerConfig = () => {},
  onOpenPolicies = () => {},
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
  const [externalView, setExternalView] = useState(() => {
    if (entryMode !== "external") return "";
    const context = readShareContextFromUrl();
    if (!hasShareContext(context)) return "";
    return context.view === "offer-indicative" || context.view === "external-underwriting" || context.view === "offer-final" || context.view === "payment"
      ? context.view
      : "offer-indicative";
  });
  const [quoted, setQuoted] = useState(false);
  const [showConstructionGuide, setShowConstructionGuide] = useState(false);
  const [showIndicationModal, setShowIndicationModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showSentOffers, setShowSentOffers] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [externalStepOneEditMode, setExternalStepOneEditMode] = useState(false);
  const [externalProfileCustomerOverride, setExternalProfileCustomerOverride] = useState(false);
  const [externalProfileCustomerEditMode, setExternalProfileCustomerEditMode] = useState(false);
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
  const [externalViewerMode, setExternalViewerMode] = useState(entryMode === "internal" ? "internal" : "customer");
  const [sharedReferralCode, setSharedReferralCode] = useState("");
  const [sharedSenderName, setSharedSenderName] = useState("");
  const [sharedCustomerName, setSharedCustomerName] = useState("");
  const [sharedOfferSnapshot, setSharedOfferSnapshot] = useState(null);
  const isInternalUnderwritingContext = entryMode === "internal" || externalViewerMode === "internal";
  const hasParsedExternalShareRef = useRef(false);
  const externalStepOneSnapshotRef = useRef(null);
  const externalProfileCustomerSnapshotRef = useRef(null);
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
  const [objectRows, setObjectRows] = useState([{ id: "obj-1", type: "", amount: "", note: "" }]);
  const [uwForm, setUwForm] = useState({
    idNumber: "",
    customerDataMode: "scan",
    ktpRead: false,
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
  const [documentChecks, setDocumentChecks] = useState({ ktp: createEmptyDocumentCheck("KTP") });
  const [evidence, setEvidence] = useState({ location: null, photos: { frontView: null, sideRightView: null, sideLeftView: null } });
  const resultsRef = useRef(null);
  const floorFieldRef = useRef(null);
  const previousFloorFieldVisibleRef = useRef(false);

  const allowCustomerLookup = entryMode === "internal";
  const customerSuggestions = useMemo(() => {
    if (!allowCustomerLookup) return [];
    const keyword = String(form.identity || "").trim().toLowerCase();
    if (!keyword) return [];
    return MOCK_CIF.filter((item) => item.name.toLowerCase().includes(keyword) || item.cif.toLowerCase().includes(keyword)).slice(0, 5);
  }, [allowCustomerLookup, form.identity]);
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
    const inferredPropertyType = inferPropertyTypeFromOccupancy(form.occupancy, availablePropertyTypes);
    if (form.occupancy && inferredPropertyType && form.propertyType !== inferredPropertyType) {
      setForm((prev) => ({ ...prev, propertyType: inferredPropertyType }));
      return;
    }
    if (!form.occupancy && form.propertyType && !availablePropertyTypes.includes(form.propertyType)) {
      setForm((prev) => ({ ...prev, propertyType: "" }));
    }
  }, [availablePropertyTypes, form.occupancy, form.propertyType]);
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
    if (entryMode === "external" && hasParsedExternalShareRef.current) return;

    if (entryMode === "internal") {
      setExternalView("");
      setExternalViewerMode("internal");
      replaceViewerStateInUrl("internal", "");
      hasParsedExternalShareRef.current = true;
      return;
    }

    const { view, viewer, referral, sender, customer, offer, shareToken } = readShareContextFromUrl();
    const hasExplicitView = ["offer-indicative", "external-underwriting", "offer-final", "payment"].includes(view);
    const hasExplicitViewer = viewer === "internal" || viewer === "customer";
    const hasExplicitShareContext = hasShareContext({ referral, sender, customer, offer });

    if (!hasExplicitShareContext) {
      setExternalView("");
      setExternalViewerMode("customer");
      setSharedReferralCode("");
      setSharedSenderName("");
      setSharedCustomerName("");
      setSharedOfferSnapshot(null);
      clearShareContextFromUrl();
      hasParsedExternalShareRef.current = true;
      return;
    }

    if (hasExplicitView) {
      setExternalView(view);
    }
    if (hasExplicitViewer) {
      setExternalViewerMode(viewer);
    }
    setSharedReferralCode(referral);
    setSharedSenderName(sender);
    setSharedCustomerName(customer);
    setSharedOfferSnapshot(offer);

    if (!shareToken) {
      replaceShareContextInUrl({
        view: hasExplicitView ? view : "offer-indicative",
        viewer: hasExplicitViewer ? viewer : externalViewerMode,
        shareData: { referral, sender, customer, offer },
      });
    } else if (!hasExplicitView || !hasExplicitViewer) {
      replaceViewerStateInUrl(hasExplicitViewer ? viewer : externalViewerMode, hasExplicitView ? view : "offer-indicative");
    }

    hasParsedExternalShareRef.current = true;
  }, [entryMode, externalViewerMode]);

  useEffect(() => {
    if (entryMode !== "external") return;
    if (!hasParsedExternalShareRef.current) return;
    if (!hasShareContext({ referral: sharedReferralCode, sender: sharedSenderName, customer: sharedCustomerName, offer: sharedOfferSnapshot })) {
      clearShareContextFromUrl();
      return;
    }
    replaceViewerStateInUrl(externalViewerMode, externalView || "offer-indicative");
  }, [entryMode, externalView, externalViewerMode, sharedCustomerName, sharedOfferSnapshot, sharedReferralCode, sharedSenderName]);
  useEffect(() => {
    if (!sharedOfferSnapshot) return;
    setSelectedCustomer(null);
    setForm((prev) => ({
      ...prev,
      identity: sharedOfferSnapshot.identity || prev.identity,
      customerType: sharedOfferSnapshot.customerType || prev.customerType,
      phone: sharedOfferSnapshot.phone || prev.phone,
      email: sharedOfferSnapshot.email || prev.email,
      propertyType: sharedOfferSnapshot.occupancy
        ? inferPropertyTypeFromOccupancy(sharedOfferSnapshot.occupancy, availablePropertyTypes)
        : sharedOfferSnapshot.propertyType || prev.propertyType,
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
  }, [availablePropertyTypes, sharedOfferSnapshot]);
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
  const setField = (key, value) =>
    setForm((prev) => {
      if (key === "occupancy") {
        return {
          ...prev,
          occupancy: value,
          propertyType: inferPropertyTypeFromOccupancy(value, availablePropertyTypes),
        };
      }
      return { ...prev, [key]: value };
    });
  const authenticatedExternalProfile =
    entryMode === "external" && sessionProfile?.authenticated ? sessionProfile : null;
  const isAuthenticatedExternalJourney = Boolean(authenticatedExternalProfile);
  const isGuestExternalJourney = entryMode === "external" && !isAuthenticatedExternalJourney;
  const accountIdentity = String(authenticatedExternalProfile?.name || "").trim();
  const accountCustomerType = String(authenticatedExternalProfile?.customerType || "").trim();
  const accountPhone = String(authenticatedExternalProfile?.phone || "").trim();
  const accountEmail = String(authenticatedExternalProfile?.email || "").trim();
  const accountIdentityNumber = String(authenticatedExternalProfile?.identityNumber || "").trim();
  const accountInsuredAddress = String(authenticatedExternalProfile?.insuredAddress || "").trim();
  const useAccountProfileCustomerData =
    isAuthenticatedExternalJourney
    && form.customerType !== "Badan Usaha"
    && !externalProfileCustomerOverride
    && Boolean(accountIdentityNumber || accountInsuredAddress);
  const setUwField = (key, value) => setUwForm((prev) => ({ ...prev, [key]: value }));
  const fallbackDemoCustomer = MOCK_CIF[0];
  const resolvedDemoCustomer = {
    ...fallbackDemoCustomer,
    name:
      String(form.identity || "").split(" - ")[0].trim()
      || accountIdentity
      || selectedCustomer?.name
      || fallbackDemoCustomer.name,
    type: String(form.customerType || "").trim() || accountCustomerType || selectedCustomer?.type || fallbackDemoCustomer.type,
    phone: String(form.phone || "").trim() || accountPhone || selectedCustomer?.phone || fallbackDemoCustomer.phone,
    email: String(form.email || "").trim() || accountEmail || selectedCustomer?.email || fallbackDemoCustomer.email,
  };
  const handleCaptureKtp = () => {
    const extractedFullName = resolvedDemoCustomer.name;
    const extractedIdentityNumber = uwForm.idNumber || accountIdentityNumber || "3173010101010001";
    const extractedAddress = accountInsuredAddress || uwForm.insuredAddress || "Jl. Pahlawan No. 18, Palmerah, Jakarta Barat";
    const extractedData = {
      fullName: extractedFullName,
      identityNumber: extractedIdentityNumber,
      address: extractedAddress,
    };

    setUwForm((prev) => ({
      ...prev,
      customerDataMode: "scan",
      ktpRead: true,
      idNumber: prev.idNumber || extractedIdentityNumber,
      sameAsPropertyAddress: false,
      insuredAddress: extractedAddress,
    }));
    setDocumentChecks((prev) => ({
      ...prev,
      ktp: evaluateDocumentRead({
        docType: "KTP",
        extractedData,
        expectedData: {
          fullName: selectedCustomer?.name || String(form.identity || "").split(" - ")[0].trim(),
          identityNumber: uwForm.idNumber,
          address: uwForm.sameAsPropertyAddress ? form.locationSearch : uwForm.insuredAddress,
        },
      }),
    }));
  };
  const updateObjectRow = (id, patch) => setObjectRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  const addObjectRow = () => setObjectRows((prev) => prev.concat({ id: "obj-" + Date.now(), type: "", amount: "", note: "" }));
  const removeObjectRow = (id) => setObjectRows((prev) => (prev.length === 1 ? prev : prev.filter((row) => row.id !== id)));
  const totalValue = useMemo(() => objectRows.reduce((sum, row) => sum + parseNumber(row.amount), 0), [objectRows]);
  const occupancyCode = OCCUPANCY_CODE_MAP[form.occupancy] || "";
  const canShowOccupancyCode = entryMode === "internal";
  const derivedConstructionClass = deriveConstructionClassFromMaterial({
    wallMaterial: form.wallMaterial,
    structureMaterial: form.structureMaterial,
    roofMaterial: form.roofMaterial,
    flammableMaterial: form.flammableMaterial,
  });
  const baseRate = ["Rumah Tinggal", "Apartment"].includes(form.propertyType) ? 0.00185 : 0.00265;
  const currentUrlShareContext = entryMode === "external" ? readShareContextFromUrl() : null;
  const hasSharedOfferJourney =
    entryMode === "external"
    && (
      hasShareContext({ referral: sharedReferralCode, sender: sharedSenderName, customer: sharedCustomerName, offer: sharedOfferSnapshot })
      || hasShareContext(currentUrlShareContext)
    );
  const isExternalSelfServeJourney = entryMode === "external" && !hasSharedOfferJourney;
  const effectiveConstructionClass = isExternalSelfServeJourney ? derivedConstructionClass : form.constructionClass;
  const selectedConstructionGuide = CONSTRUCTION_GUIDE.find((item) => item.title === effectiveConstructionClass);
  const hasQuoteBasis = Boolean(form.propertyType) && Boolean(form.occupancy) && Boolean(effectiveConstructionClass) && totalValue > 0;
  const basePremiumNumber = hasQuoteBasis ? Math.max(Math.round(totalValue * baseRate), 150000) : 0;
  const stampDutyNumber = hasQuoteBasis ? 10000 + (selectedGuarantees.earthquake ? 10000 : 0) : 0;
  const guaranteeBreakdown = activeGuarantees.filter((item) => selectedGuarantees[item.key]).map((item) => ({ ...item, premium: Math.round(totalValue * item.rate) }));
  const additionalPremiumNumber = guaranteeBreakdown.reduce((sum, item) => sum + item.premium, 0);
  const estimatedTotalNumber = hasQuoteBasis ? basePremiumNumber + additionalPremiumNumber + stampDutyNumber : 0;
  const customerName = selectedCustomer ? selectedCustomer.name : (form.identity || accountIdentity);
  const effectiveCustomerName = customerName || sharedCustomerName;
  const referralCode = createReferralCode(sessionName, transactionAuthority.transactionId);
  const shareJourneyKey = currentProductVariant === "property-all-risk" ? "property-all-risk-external" : "property-external";
  const internalStepOneTitle = "Data Awal";
  const shareSnapshot = {
    identity: customerName,
    customerType: form.customerType || accountCustomerType,
    phone: form.phone || accountPhone,
    email: form.email || accountEmail,
    propertyType: form.propertyType,
    occupancy: form.occupancy,
    constructionClass: effectiveConstructionClass,
    wallMaterial: form.wallMaterial,
    structureMaterial: form.structureMaterial,
    roofMaterial: form.roofMaterial,
    flammableMaterial: form.flammableMaterial,
    locationSearch: form.locationSearch,
    objectRows,
    selectedGuarantees,
    floorCount,
  };
  const shareContextPayload = {
    referral: referralCode,
    sender: sessionName,
    customer: customerName,
    offer: shareSnapshot,
  };
  const isFinalShareFlow = entryMode === "internal" && internalStep > 1 && canAdvanceUnderwriting;
  const indicativeShareUrl = getShareUrl("", {
    journey: shareJourneyKey,
    view: "offer-indicative",
    shareData: shareContextPayload,
  });
  const finalShareUrl = getShareUrl("", {
    journey: shareJourneyKey,
    view: "payment",
    shareData: shareContextPayload,
  });
  const shareUrl = isFinalShareFlow ? finalShareUrl : indicativeShareUrl;
  const previewUrl = indicativeShareUrl;
  const handlePrintIndicativePdf = () => {
    const downloaded = downloadPropertyOfferPdf({
      fileName: `Penawaran-${activeVariant.title}-${effectiveCustomerName || "Calon Pemegang Polis"}`,
      productTitle: activeVariant.title,
      customerName: effectiveCustomerName || "Calon Pemegang Polis",
      phone: form.phone || accountPhone,
      email: form.email || accountEmail,
      occupancy: form.occupancy,
      occupancyCode: canShowOccupancyCode ? occupancyCode : "",
      location: form.locationSearch,
      constructionClass: effectiveConstructionClass,
      objectRows,
      policyName: activeVariant.policyDocumentName || activeVariant.primaryCoverageTitle,
      extensionItems: guaranteeBreakdown.map((item) => ({
        title: item.title,
        detail: item.detail,
        premium: item.premium,
      })),
      basePremium: basePremiumNumber,
      extensionPremium: additionalPremiumNumber,
      stampDuty: stampDutyNumber,
      totalPremium: estimatedTotalNumber,
      offerReference: transactionAuthority.transactionId,
      downloadedAt: formatDisplayDateTime(new Date()),
      shareUrl,
      showOccupancyCode: canShowOccupancyCode,
    });
    setShareFeedback(
      downloaded
        ? "File PDF penawaran sedang diunduh."
        : "File PDF belum berhasil diunduh. Coba lagi sebentar.",
    );
  };
  const effectiveReferralCode = sharedReferralCode || referralCode;
  const effectiveSenderName = sharedSenderName || sessionName;
  const propertyUserMenuItems = entryMode === "internal"
    ? [
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
      ]
    : [
        {
          label: "Polis Saya",
          primary: true,
          onClick: () => {
            setShowUserMenu(false);
            onOpenPolicies();
          },
        },
      ];
  const effectiveStepOneIdentity = String(form.identity || "").trim() || accountIdentity;
  const effectiveStepOnePhone = String(form.phone || "").trim() || accountPhone;
  const effectiveStepOneEmail = String(form.email || "").trim() || accountEmail;
  const canShowExternalStepOneCustomerSummary =
    entryMode === "external"
    && (isAuthenticatedExternalJourney || hasSharedOfferJourney)
    && Boolean(effectiveStepOneIdentity && effectiveStepOnePhone && effectiveStepOneEmail);
  const canEditExternalStepOneCustomerSummary = isAuthenticatedExternalJourney && canShowExternalStepOneCustomerSummary;
  const showStepOneCustomerInfo = externalStepOneEditMode || !canShowExternalStepOneCustomerSummary;
  const startExternalStepOneEdit = () => {
    externalStepOneSnapshotRef.current = {
      identity: form.identity,
      customerType: form.customerType,
      phone: form.phone,
      email: form.email,
      selectedCustomer,
    };
    setSelectedCustomer(null);
    setForm((prev) => ({
      ...prev,
      identity: prev.identity || accountIdentity,
      customerType: prev.customerType || accountCustomerType,
      phone: prev.phone || accountPhone,
      email: prev.email || accountEmail,
    }));
    setExternalStepOneEditMode(true);
  };
  const cancelExternalStepOneEdit = () => {
    const snapshot = externalStepOneSnapshotRef.current;
    if (snapshot) {
      setSelectedCustomer(snapshot.selectedCustomer || null);
      setForm((prev) => ({
        ...prev,
        identity: snapshot.identity,
        customerType: snapshot.customerType,
        phone: snapshot.phone,
        email: snapshot.email,
      }));
    }
    setExternalStepOneEditMode(false);
  };
  const saveExternalStepOneEdit = () => {
    setExternalStepOneEditMode(false);
  };
  const enableExternalProfileCustomerEdit = () => {
    externalProfileCustomerSnapshotRef.current = {
      idNumber: uwForm.idNumber,
      insuredAddress: uwForm.insuredAddress,
      sameAsPropertyAddress: uwForm.sameAsPropertyAddress,
    };
    setUwForm((prev) => ({
      ...prev,
      idNumber: prev.idNumber || accountIdentityNumber || "",
      insuredAddress: prev.insuredAddress || accountInsuredAddress || "",
      sameAsPropertyAddress: false,
    }));
    setExternalProfileCustomerOverride(true);
    setExternalProfileCustomerEditMode(true);
  };
  const cancelExternalProfileCustomerEdit = () => {
    const snapshot = externalProfileCustomerSnapshotRef.current;
    if (snapshot) {
      setUwForm((prev) => ({
        ...prev,
        idNumber: snapshot.idNumber,
        insuredAddress: snapshot.insuredAddress,
        sameAsPropertyAddress: snapshot.sameAsPropertyAddress,
      }));
    }
    setExternalProfileCustomerOverride(false);
    setExternalProfileCustomerEditMode(false);
  };
  const saveExternalProfileCustomerEdit = () => {
    setExternalProfileCustomerOverride(true);
    setExternalProfileCustomerEditMode(false);
  };
  const stepOneTitle = isExternalSelfServeJourney ? "Simulasi Premi" : "Tinjau Penawaran";
  const hasValidStepOneIdentity = isAuthenticatedExternalJourney ? Boolean(effectiveStepOneIdentity) : Boolean(form.identity.trim());
  const hasValidPhoneContact = Boolean(effectiveStepOnePhone) && isValidPhone(effectiveStepOnePhone);
  const hasValidEmailContact = Boolean(effectiveStepOneEmail) && isValidEmail(effectiveStepOneEmail);
  const hasValidStepOneContact = isAuthenticatedExternalJourney ? true : hasValidPhoneContact && hasValidEmailContact;
  const hasValidStepOneLocation = Boolean(form.locationSearch.trim());
  const hasValidObjects = totalValue > 0 && objectRows.every((row) => parseNumber(row.amount) > 0);
  const hasStockObject = objectRows.some((row) => row.type === "Stok");
  const hasRequiredObjectNotes = objectRows.every((row) => !requiresObjectNote(row.type) || Boolean(String(row.note || "").trim()));
  const hasRequiredFloorCount = !showFloorInput || Number(floorCount) > 0;
  const canAdvanceInternalStepOne = hasValidStepOneIdentity && hasValidStepOneContact && hasValidStepOneLocation && hasValidObjects && hasRequiredObjectNotes && hasRequiredFloorCount;
  const effectiveUwIdNumber = String(useAccountProfileCustomerData ? accountIdentityNumber : uwForm.idNumber || "").trim();
  const effectiveUwInsuredAddress = String(
    useAccountProfileCustomerData
      ? accountInsuredAddress
      : (uwForm.sameAsPropertyAddress ? form.locationSearch : uwForm.insuredAddress) || "",
  ).trim();
  const hasValidUwIdentity = !effectiveUwIdNumber || isValidIdNumber(form.customerType, effectiveUwIdNumber);
  const hasValidPicName = form.customerType !== "Badan Usaha" || Boolean(uwForm.picName.trim());
  const hasValidInsuredAddress = Boolean(effectiveUwInsuredAddress);
  const hasValidStockType = !hasStockObject || Boolean(String(uwForm.stockType || "").trim());
  const hasClaimHistoryReviewBlock = Boolean(uwForm.claimHistory) && uwForm.claimHistory !== "Tidak Ada";
  const operatingPaymentBlockMessage = paymentBlockMessage(operatingRecord);
  const hasOperatingPaymentBlock = Boolean(operatingPaymentBlockMessage) && operatingRecord && !canProceedToPaymentFromOperating(operatingRecord);
  const canProceedUnderwritingPayment = !hasOperatingPaymentBlock;
  const needsKtpRead = !useAccountProfileCustomerData && form.customerType !== "Badan Usaha" && (uwForm.customerDataMode || "scan") === "scan" && !uwForm.ktpRead;
  const hasValidFireProtection = uwForm.fireProtectionChoice === "Tidak Ada" || (uwForm.fireProtectionChoice === "Ada" && Array.isArray(uwForm.fireProtection) && uwForm.fireProtection.length > 0);
  const hasValidUnderwriting = hasValidInsuredAddress && Boolean(uwForm.coverageStartDate) && hasValidFireProtection && Boolean(uwForm.claimHistory) && hasValidStockType;
  const hasCompleteUploads = hasRequiredUploads(uploads);
  const canSendIndicativeOffer = hasValidUwIdentity && hasValidPicName && hasValidUnderwriting && hasCompleteUploads && !hasClaimHistoryReviewBlock;
  const canAdvanceUnderwriting = canSendIndicativeOffer && canProceedUnderwritingPayment;
  const shouldShowPaymentPage = (externalView === "offer-final" || externalView === "payment") && canAdvanceUnderwriting && canProceedToPaymentFromOperating(operatingRecord);
  const canContinueFromSimulation = quoted && canAdvanceInternalStepOne;
  const stepOnePendingItems = [];
  if (!hasValidStepOneIdentity) stepOnePendingItems.push(allowCustomerLookup ? "Isi nama nasabah atau pilih CIF." : "Isi nama nasabah.");
  if (!hasValidPhoneContact) stepOnePendingItems.push("Masukkan nomor handphone yang valid.");
  if (!hasValidEmailContact) stepOnePendingItems.push("Masukkan alamat email yang valid.");
  if (!hasValidStepOneLocation) stepOnePendingItems.push("Isi lokasi properti atau gunakan tombol lokasi cepat.");
  if (!hasValidObjects) stepOnePendingItems.push("Setiap objek harus punya nilai yang ingin dilindungi.");
  if (!hasRequiredObjectNotes) stepOnePendingItems.push("Lengkapi keterangan objek yang masih wajib.");
  if (!hasRequiredFloorCount) stepOnePendingItems.push("Lengkapi jumlah lantai pada perluasan Risiko Gempa Bumi.");
  useEffect(() => {
    if (!isAuthenticatedExternalJourney || !authenticatedExternalProfile) return;
    setSelectedCustomer(null);
    setForm((prev) => {
      const nextIdentity = prev.identity || authenticatedExternalProfile.name || "";
      const nextCustomerType = prev.customerType || authenticatedExternalProfile.customerType || "";
      const nextPhone = prev.phone || authenticatedExternalProfile.phone || "";
      const nextEmail = prev.email || authenticatedExternalProfile.email || "";

      if (
        nextIdentity === prev.identity
        && nextCustomerType === prev.customerType
        && nextPhone === prev.phone
        && nextEmail === prev.email
      ) {
        return prev;
      }

      return {
        ...prev,
        identity: nextIdentity,
        customerType: nextCustomerType,
        phone: nextPhone,
        email: nextEmail,
      };
    });
  }, [authenticatedExternalProfile, isAuthenticatedExternalJourney]);
  useEffect(() => {
    if (!useAccountProfileCustomerData) return;
    setUwForm((prev) => {
      const nextIdNumber = prev.idNumber || accountIdentityNumber || "";
      const nextInsuredAddress = prev.insuredAddress || accountInsuredAddress || "";

      if (nextIdNumber === prev.idNumber && nextInsuredAddress === prev.insuredAddress) {
        return prev;
      }

      return {
        ...prev,
        idNumber: nextIdNumber,
        insuredAddress: nextInsuredAddress,
      };
    });
  }, [accountIdentityNumber, accountInsuredAddress, useAccountProfileCustomerData]);
  const underwritingPendingItems = [];
  const operatingPaymentPendingItem =
    operatingRecord?.status === "Pending Review Internal"
      ? "Penawaran masih menunggu peninjauan sebelum bisa lanjut ke pembayaran."
      : operatingPaymentBlockMessage;
  if (effectiveUwIdNumber && !hasValidUwIdentity) underwritingPendingItems.push(form.customerType === "Badan Usaha" ? "NPWP yang diisi minimal 15 digit." : "NIK yang diisi harus 16 digit.");
  if (!hasValidPicName) underwritingPendingItems.push("Lengkapi kontak di lokasi.");
  if (needsKtpRead) underwritingPendingItems.push("Ambil foto KTP atau pilih Isi Manual.");
  if (!hasValidInsuredAddress && !needsKtpRead) underwritingPendingItems.push("Lengkapi alamat calon pemegang polis.");
  if (!hasValidUnderwriting) underwritingPendingItems.push("Masih ada data lanjutan wajib yang perlu diisi.");
  if (!hasValidStockType) underwritingPendingItems.push("Pilih jenis stok agar sistem bisa mengkategorikan stok mudah terbakar atau tidak mudah terbakar.");
  if (!hasCompleteUploads) underwritingPendingItems.push("Unggah tiga foto properti: depan, samping kanan, dan samping kiri.");
  if (hasClaimHistoryReviewBlock) underwritingPendingItems.push("Riwayat klaim terdeteksi. Penawaran masih perlu kami tinjau sebelum bisa lanjut ke pembayaran.");
  if (hasOperatingPaymentBlock && operatingPaymentPendingItem) underwritingPendingItems.push(operatingPaymentPendingItem);
  const internalUnderwritingPendingItems = underwritingPendingItems.filter((item) => item !== operatingPaymentPendingItem);
  useEffect(() => {
    if (isInternalUnderwritingContext) {
      if (externalView !== "" && externalView !== "offer-indicative" && externalView !== "external-underwriting") {
        setExternalView("external-underwriting");
        replaceViewerStateInUrl(externalViewerMode, "external-underwriting");
      }
      return;
    }

    if (
      (externalView === "offer-final" || externalView === "payment") &&
      (!canAdvanceUnderwriting || !canProceedToPaymentFromOperating(operatingRecord))
    ) {
      setExternalView("external-underwriting");
      replaceViewerStateInUrl(externalViewerMode, "external-underwriting");
    }
  }, [externalView, canAdvanceUnderwriting, externalViewerMode, isInternalUnderwritingContext, operatingRecord]);
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
        deductible: effectiveConstructionClass === "Kelas 1" ? activeVariant.primaryCoverageDeductibleClassOne : activeVariant.primaryCoverageDeductibleOther,
      },
    ];
    guaranteeBreakdown.forEach((item) => items.push({ title: item.title, detail: item.detail, deductible: item.key === "earthquake" ? "2,5% dari Rp " + formatRupiah(totalValue) : item.deductible }));
    return items;
  }, [activeVariant, effectiveConstructionClass, guaranteeBreakdown, totalValue]);

  const fillStepOneDemoData = () => {
    const demoCustomer = resolvedDemoCustomer;
    const demoIdentity =
      isAuthenticatedExternalJourney
        ? demoCustomer.name
        : allowCustomerLookup
          ? `${demoCustomer.name} - ${demoCustomer.cif}`
          : demoCustomer.name;
    const demoAddress = "Jl. Sudirman Kav. 44, Jakarta Selatan";
    setInternalStep(1);
    setExternalView("");
    setSelectedCustomer(allowCustomerLookup && !isAuthenticatedExternalJourney ? demoCustomer : null);
    setField("identity", demoIdentity);
    setField("phone", demoCustomer.phone);
    setField("email", demoCustomer.email);
    setField("propertyType", PROPERTY_TYPES.includes("Rumah Tinggal") ? "Rumah Tinggal" : PROPERTY_TYPES[0]);
    setField("occupancy", "Rumah Tinggal");
    setField("constructionClass", "Kelas 1");
    setField("wallMaterial", "Seluruhnya dari beton, bata, hebel, atau bahan tidak mudah terbakar");
    setField("structureMaterial", "Beton, baja, atau bahan tidak mudah terbakar");
    setField("roofMaterial", "Beton, metal, genteng, atau bahan tidak mudah terbakar");
    setField("flammableMaterial", "Tidak ada");
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
    const demoCustomer = resolvedDemoCustomer;
    const selectedCoverageDate = formatDateInput(new Date());
    const demoAddress = accountInsuredAddress || uwForm.insuredAddress || "Jl. Sudirman Kav. 44, Jakarta Selatan";
    const demoIdentityNumber = accountIdentityNumber || uwForm.idNumber || "3173010101010001";
    const declarationTime = formatDateInput(new Date());
    const demoPhotoDataUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><rect width="640" height="400" fill="#eef6fd"/><rect x="40" y="50" width="560" height="300" rx="24" fill="#dbe9f6" stroke="#9bb8d3"/><text x="320" y="190" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="#0A4D82">Foto Properti</text><text x="320" y="225" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#5a748b">Simulasi upload untuk langkah data lanjutan</text></svg>'
    )}`;
    setUwForm({
      idNumber: demoIdentityNumber,
      customerDataMode: "scan",
      ktpRead: true,
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
    setDocumentChecks({
      ktp: evaluateDocumentRead({
        docType: "KTP",
        extractedData: {
          fullName: demoCustomer.name,
          identityNumber: demoIdentityNumber,
          address: demoAddress,
        },
        expectedData: {
          fullName: demoCustomer.name,
          identityNumber: "",
          address: "",
        },
      }),
    });
    setUploads({
      frontView: demoPhotoDataUrl,
      sideRightView: demoPhotoDataUrl,
      sideLeftView: demoPhotoDataUrl,
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

  if (externalView === "offer-indicative" && hasSharedOfferJourney) {
    return (
      <>
        <RejectModal open={showRejectModal} onClose={() => setShowRejectModal(false)} reason={rejectReason} setReason={setRejectReason} customReason={rejectCustomReason} setCustomReason={setRejectCustomReason} onSubmit={() => { const finalReason = rejectReason === "Alasan lainnya" ? rejectCustomReason.trim() : rejectReason; setRejectionStatus("Alasan penolakan tersimpan: " + finalReason + ". Ini masih simulasi untuk handoff ke tim IT."); setShowRejectModal(false); }} />
        <ExternalProposalPage
          internalPreviewMode={entryMode === "internal"}
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
          constructionClass={effectiveConstructionClass}
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
            replaceViewerStateInUrl(mode, externalView);
          }}
        />
      </>
    );
  }

  if (!isInternalUnderwritingContext && shouldShowPaymentPage) {
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
          onEditExtensions={() => {
            setPaymentStatus("");
            setExternalView(hasSharedOfferJourney ? "offer-indicative" : "");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          policyConsentApproved={policyConsentApproved}
          onOpenConsent={() => setShowConsentModal(true)}
          onConfirmPayment={() => setPaymentStatus(`${activeVariant.paymentSuccessMessage} Integrasi pembayaran online akan disambungkan pada tahap berikutnya.`)}
          paymentStatus={paymentStatus}
          operatingRecord={operatingRecord}
          isExpired={operatingRecord?.status === "Expired"}
          productConfig={activeVariant}
          stepOneTitle={hasSharedOfferJourney ? "Tinjau Penawaran" : "Simulasi Premi"}
          guestMode={isGuestExternalJourney}
        />
      </>
    );
  }

  if (
    !isInternalUnderwritingContext &&
    (externalView === "external-underwriting" || externalView === "offer-final" || externalView === "payment")
  ) {
    const externalDataValidity = resolveOfferValidity(true, uwForm.coverageStartDate);
    const externalDataObjectLabel =
      form.occupancy || (objectRows.length ? `${objectRows.length} objek dilindungi` : "-");
    const externalDataOfferMeta = {
      reference: transactionAuthority.transactionId,
      version: "Rev 1",
      validUntil: formatDisplayDate(externalDataValidity.expiresAt),
      statusLabel: underwritingPendingItems.length ? "Menunggu data tambahan" : "Siap dilanjutkan",
    };

    return (
      <CustomerDataJourneyShell
        productName={activeVariant.title}
        heroDescription="Lengkapi data berikut untuk menyiapkan penawaran Anda ke tahap pembayaran."
        contentDescription="Data yang Anda isi pada halaman ini merupakan bagian dari SPAU (Surat Permohonan Asuransi Umum) elektronik dan menjadi dasar ringkasan final sebelum pembayaran serta penerbitan polis."
        stepOneTitle={hasSharedOfferJourney ? "Tinjau Penawaran" : "Simulasi Premi"}
        customerName={effectiveCustomerName || "Calon Pemegang Polis"}
        guestMode={isGuestExternalJourney}
        objectLabel={externalDataObjectLabel}
        sumInsuredLabel="Total Harga Pertanggungan"
        sumInsuredValue={`Rp ${formatRupiah(totalValue)}`}
        premiumLabel="Estimasi Premi 1 Tahun"
        premiumValue={`Rp ${formatRupiah(estimatedTotalNumber)}`}
        offerReference={externalDataOfferMeta.reference}
        version={externalDataOfferMeta.version}
        validUntil={externalDataOfferMeta.validUntil}
        statusLabel={externalDataOfferMeta.statusLabel}
        guidanceText={
          hasClaimHistoryReviewBlock
            ? "Riwayat klaim yang Anda isi masih perlu kami tinjau, sehingga penawaran belum bisa dilanjutkan ke pembayaran."
            : hasOperatingPaymentBlock
              ? operatingPaymentBlockMessage || "Penawaran ini masih perlu kami tinjau sebelum lanjut ke pembayaran."
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
              ? "Minta Bantuan Peninjauan"
              : undefined
        }
        onSecondary={
          isInternalUnderwritingContext
            ? () => setExternalView("offer-indicative")
            : hasClaimHistoryReviewBlock || hasOperatingPaymentBlock
              ? (() => setHelpRequestSent(true))
              : undefined
        }
        onBack={() => setExternalView(hasSharedOfferJourney ? "offer-indicative" : "")}
        topActionLabel="Simulasi"
        onTopAction={fillStepTwoDemoData}
        bottomBackLabel={hasSharedOfferJourney ? "Kembali ke Tinjau Penawaran" : "Kembali ke Simulasi Premi"}
        showPaymentStep={!isInternalUnderwritingContext}
      >
          <UnderwritingSections
            form={form}
            customerType={form.customerType}
            selectedCustomer={selectedCustomer}
            objectRows={objectRows}
            uwForm={uwForm}
            setUwField={setUwField}
            ktpCheck={documentChecks.ktp}
            onCaptureKtp={handleCaptureKtp}
            uploads={uploads}
            setUploads={setUploads}
            setEvidence={setEvidence}
            expandedRows={expandedRows}
            setExpandedRows={setExpandedRows}
            external={true}
            useAccountProfileCustomerData={useAccountProfileCustomerData}
            profileCustomerOverrideEnabled={externalProfileCustomerOverride}
            profileCustomerEditMode={externalProfileCustomerEditMode}
            accountIdentityNumber={accountIdentityNumber}
            accountInsuredAddress={accountInsuredAddress}
            onEnableProfileCustomerEdit={enableExternalProfileCustomerEdit}
            onCancelProfileCustomerEdit={cancelExternalProfileCustomerEdit}
            onSaveProfileCustomerEdit={saveExternalProfileCustomerEdit}
          />
      </CustomerDataJourneyShell>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F5F7] text-slate-900">
      <SentOffersModal open={showSentOffers} onClose={() => setShowSentOffers(false)} />
        <IndicationModal
          open={showIndicationModal}
          onClose={() => {
            setShowIndicationModal(false);
            setShareFeedback("");
          }}
          onOpenIndicativeOffer={
            isFinalShareFlow
              ? null
              : () => {
                  setExternalViewerMode("customer");
                  setShowIndicationModal(false);
                  setExternalView("offer-indicative");
                  openShareWindow(previewUrl);
                }
          }
          onOpenFinalOffer={
            isFinalShareFlow
              ? () => {
                  setExternalViewerMode("customer");
                  setShowIndicationModal(false);
                  setExternalView("payment");
                  openShareWindow(finalShareUrl);
                }
              : null
          }
          onPrintPdf={handlePrintIndicativePdf}
          customerName={effectiveCustomerName}
          shareUrl={shareUrl}
          onShowQrInfo={() => setQrInfoVisible((prev) => !prev)}
          onCopyLink={handleCopyLink}
          copyStatus={shareFeedback}
          shareLabel={activeVariant.shareLabel}
          shareSubject={activeVariant.shareSubject}
        />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0A4D82] shadow-sm">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-white"><div className="text-[15px] font-black leading-tight md:text-[18px]">Danantara<div className="-mt-1 text-[15px] md:text-[18px]">Indonesia</div></div><div className="hidden text-[15px] font-semibold text-white/95 sm:block">asuransi jasindo</div></div>
                <div className="hidden items-center gap-3 md:flex"><button type="button" onClick={() => { window.location.href = "https://esppa.asuransijasindo.co.id/"; }} className="inline-flex items-center gap-2 rounded-[8px] bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"><Home className="h-4 w-4" />Beranda</button><button type="button" onClick={() => { if (embedded && onExit) onExit(); else setScreen("catalog"); }} className="inline-flex items-center gap-2 rounded-[8px] bg-[#F5A623] px-4 py-2 text-sm font-semibold text-white shadow-sm"><Package className="h-4 w-4" />Produk</button></div>
          </div>
          <div className="relative flex items-center gap-4 text-white">
            <button type="button" onClick={fillDemoForCurrentStep} className="hidden rounded-[10px] border border-white/30 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 md:inline-flex md:text-sm">Simulasi</button>
            {isGuestExternalJourney ? (
              <button
                type="button"
                onClick={() => {
                  window.location.href = "https://esppa.asuransijasindo.co.id/";
                }}
                className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#0A4D82] px-4 text-sm font-semibold text-white shadow-sm ring-1 ring-white/20 hover:bg-[#0C5D9E]"
              >
                <Home className="h-4 w-4" aria-hidden="true" />
                Masuk
              </button>
            ) : (
              <>
                <button type="button" onClick={() => setShowUserMenu((prev) => !prev)} className="relative inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">ID</span>{sessionName}{helpRequestSent ? <span className="absolute -right-1 -top-1 inline-flex h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" /> : null}</button>
                <button type="button" aria-label="Lihat notifikasi" className="hidden h-11 w-11 items-center justify-center rounded-[10px] border border-white/20 bg-white/10 text-white shadow-sm hover:bg-white/15 md:inline-flex"><Bell className="h-4 w-4" /></button>
              </>
            )}
            {!isGuestExternalJourney ? (
              <UserMenu
                open={showUserMenu}
                items={propertyUserMenuItems}
              />
            ) : null}
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
              <div className="mt-6 text-center text-white">{!isGuestExternalJourney ? <div className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90">{entryMode === "external" ? `Halo, ${sessionName}` : `Selamat datang kembali, ${sessionName}`}</div> : null}<h1 className="mt-4 text-[32px] font-bold tracking-tight md:text-[40px]">{activeVariant.title}</h1><p className="mx-auto mt-2 max-w-3xl text-[14px] text-white/90 md:text-[17px]">{activeVariant.heroSubtitle}</p></div>
              <div className="mx-auto mt-6 max-w-[860px] rounded-2xl bg-white p-3 shadow-2xl shadow-black/15 md:mt-7 md:max-w-[960px] md:p-5">
                <div className="rounded-2xl border border-[#D8E1EA] bg-[#F4F7FA] px-3 py-4 md:px-5 md:py-5">
                  <div className="flex flex-col gap-5 md:flex-row md:gap-5">
                      <StepNode
                        step="Langkah 1"
                        title={isExternalSelfServeJourney ? "Simulasi Premi" : internalStepOneTitle}
                        subtitle={isExternalSelfServeJourney ? "Sedang dibuka" : internalStep === 1 ? "Sedang dibuka" : "Selesai"}
                        active={isExternalSelfServeJourney || internalStep === 1}
                        done={!isExternalSelfServeJourney && internalStep > 1}
                      icon={<FileText className="h-4 w-4" />}
                      onClick={() => {
                        if (!isExternalSelfServeJourney && internalStep !== 1) setInternalStep(1);
                      }}
                    />
                    <div className="hidden h-px flex-1 self-center bg-slate-300 md:block" />
                    <StepNode
                      step="Langkah 2"
                      title="Data Lanjutan"
                      subtitle={isExternalSelfServeJourney ? "Menunggu" : internalStep === 2 ? (canAdvanceUnderwriting ? "Siap dikirim" : "Sedang diisi") : "Menunggu"}
                      active={!isExternalSelfServeJourney && internalStep === 2}
                      done={false}
                      icon={<FileText className="h-4 w-4" />}
                      onClick={() => {
                        if (!isExternalSelfServeJourney && quoted) setInternalStep(2);
                      }}
                    />
                    {isExternalSelfServeJourney ? <div className="hidden h-px flex-1 self-center bg-slate-300 md:block" /> : null}
                    {isExternalSelfServeJourney ? (
                      <StepNode
                        step="Langkah 3"
                        title="Pembayaran"
                        subtitle="Menunggu"
                        active={false}
                        done={false}
                        icon={<Wallet className="h-4 w-4" />}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {rejectionStatus ? <div className="mx-auto mt-6 max-w-[860px] rounded-2xl border border-[#CFE0F0] bg-[#F8FBFE] px-4 py-3 text-sm text-[#0A4D82]">{rejectionStatus}</div> : null}
          {qrInfoVisible ? <div className="mx-auto mt-4 max-w-[860px] rounded-2xl border border-[#CFE0F0] bg-white px-4 py-4 text-sm text-slate-700 shadow-sm"><div className="font-semibold text-slate-900">QR Code belum digenerate otomatis.</div><div className="mt-1">Untuk handoff ke IT, tautan yang akan diencode adalah: <span className="break-all text-[#0A4D82]">{shareUrl}</span></div></div> : null}
          {internalStep === 1 || isExternalSelfServeJourney ? (
            <div className="mx-auto mt-6 max-w-[860px] px-4 md:px-6">
              <div className="space-y-5">
                  {isExternalSelfServeJourney ? (
                    <div className="rounded-2xl border border-[#D8E1EA] bg-white p-4 shadow-sm md:p-5">
                      <div className="text-center">
                      <div className="text-[26px] font-bold tracking-tight text-slate-900 md:text-[30px]">Simulasi Premi</div>
                        <div className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-[15px]">
                          Data yang Anda isi pada tahap simulasi ini merupakan bagian awal dari SPAU (Surat Permohonan Asuransi Umum) elektronik dan menjadi dasar simulasi premi serta langkah berikutnya.
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {canShowExternalStepOneCustomerSummary && !externalStepOneEditMode ? (
                    <SectionCard
                      title="Informasi Calon Pemegang Polis"
                      action={
                        canEditExternalStepOneCustomerSummary ? (
                          <button
                            type="button"
                            onClick={startExternalStepOneEdit}
                            className="inline-flex h-9 items-center rounded-[10px] border border-[#D5DEEA] bg-white px-4 text-sm font-semibold text-[#0A4D82] hover:bg-[#F8FBFE]"
                          >
                            Edit
                          </button>
                        ) : null
                      }
                    >
                      <div className="rounded-[16px] border border-[#D8E1EA] bg-[#F8FBFE] px-4 py-4">
                        <div className="space-y-1">
                          <OfferSummaryKeyValue label="Nama Calon Pemegang Polis" value={effectiveStepOneIdentity} />
                          <OfferSummaryKeyValue label="Nomor Handphone" value={effectiveStepOnePhone} />
                          <OfferSummaryKeyValue label="Alamat Email" value={effectiveStepOneEmail} />
                        </div>
                      </div>
                    </SectionCard>
                  ) : null}

                  {showStepOneCustomerInfo ? (
                    <SectionCard
                      title="Informasi Calon Pemegang Polis"
                      action={
                        externalStepOneEditMode ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={cancelExternalStepOneEdit}
                              className="inline-flex h-9 items-center rounded-[10px] border border-[#D5DEEA] bg-white px-4 text-sm font-semibold text-[#0A4D82] hover:bg-[#F8FBFE]"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              onClick={saveExternalStepOneEdit}
                              className="inline-flex h-9 items-center rounded-[10px] bg-[#0A4D82] px-4 text-sm font-semibold text-white hover:bg-[#0D5B98]"
                            >
                              Simpan
                            </button>
                          </div>
                        ) : null
                      }
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <FieldLabel label="Nama Calon Pemegang Polis" required />
                          <div className="relative">
                            <TextInput
                              value={form.identity}
                              onChange={(value) => {
                                setSelectedCustomer(null);
                                setField("identity", value);
                              }}
                              placeholder={allowCustomerLookup ? "Masukkan nama calon pemegang polis atau kode CIF" : "Masukkan nama calon pemegang polis"}
                              icon={<User className="h-4 w-4" />}
                            />
                            {allowCustomerLookup && form.identity && customerSuggestions.length > 0 && !selectedCustomer ? (
                              <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
                                {customerSuggestions.map((item) => (
                                  <button
                                    key={item.cif}
                                    type="button"
                                    onClick={() => {
                                      setSelectedCustomer(item);
                                      setForm((prev) => ({
                                        ...prev,
                                        identity: item.name + " - " + item.cif,
                                        customerType: item.type,
                                        phone: item.phone || prev.phone,
                                        email: item.email || prev.email,
                                      }));
                                    }}
                                    className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50"
                                  >
                                    <div>
                                      <div className="font-semibold text-slate-900">{item.name}</div>
                                      <div className="text-xs text-slate-500">{item.type}</div>
                                    </div>
                                    <div className="rounded-full bg-[#F8FBFE] px-3 py-1 text-xs font-semibold text-[#0A4D82]">{item.cif}</div>
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                          {allowCustomerLookup ? (
                            selectedCustomer ? (
                              <div className="mt-1 text-xs text-green-600">Data CIF terpilih. Anda akan melanjutkan sebagai nasabah existing.</div>
                            ) : form.identity ? (
                              <div className="mt-1 text-xs text-slate-500">Nama belum cocok dengan CIF simulasi. Sistem akan memperlakukan sebagai nasabah baru.</div>
                            ) : null
                          ) : null}
                        </div>
                        {Boolean(form.identity.trim()) && (!allowCustomerLookup || (!selectedCustomer && !isDigitsOnly(form.identity.trim()))) ? (
                          <div>
                            <FieldLabel label="Tipe Nasabah" required />
                            <SelectInput value={form.customerType} onChange={(value) => setField("customerType", value)} options={CUSTOMER_TYPES} placeholder="Nasabah ini perorangan atau badan usaha?" />
                          </div>
                        ) : null}
                        <div><FieldLabel label="Nomor Handphone" required /><TextInput value={form.phone} onChange={(value) => setField("phone", value)} placeholder="08xxxxxxxxxx" icon={<Phone className="h-4 w-4" />} /></div>
                        <div><FieldLabel label="Alamat Email" required /><TextInput value={form.email} onChange={(value) => setField("email", value)} placeholder="nama@email.com" icon={<Mail className="h-4 w-4" />} type="email" /></div>
                      </div>
                    </SectionCard>
                  ) : null}

                  <SectionCard title="Informasi Properti">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2 md:max-w-[760px]">
                        <div className={cls("grid gap-3", canShowOccupancyCode && occupancyCode ? "md:grid-cols-[minmax(0,1fr)_180px]" : "md:grid-cols-1")}>
                          <div className="min-w-0">
                            <FieldLabel label="Penggunaan Properti yang Diasuransikan" required helpText="Pilih penggunaan untuk properti yang akan diasuransikan pada pengajuan ini." />
                            <SelectInput value={form.occupancy} onChange={(value) => setField("occupancy", value)} options={OCCUPANCY_OPTIONS} placeholder="Pilih penggunaan properti yang diasuransikan" />
                          </div>
                          {canShowOccupancyCode && occupancyCode ? (
                            <div className="self-end rounded-xl border border-[#D5DDE6] bg-[#F8FBFE] px-3 py-2.5">
                              <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">Kode Okupasi</div>
                              <div className="mt-1 text-sm font-semibold text-[#0A4D82]">{occupancyCode}</div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        {isExternalSelfServeJourney ? (
                          <div className="rounded-xl border border-[#D5DDE6] bg-[#F8FBFE] p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-[15px] font-bold text-slate-900">Material Bangunan</div>
                              {effectiveConstructionClass ? (
                                <div className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0A4D82] ring-1 ring-[#D5DDE6]">
                                  {effectiveConstructionClass}
                                </div>
                              ) : null}
                            </div>
                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                              <div>
                                <FieldLabel label="Dinding utama" required />
                                  <SelectInput
                                    value={form.wallMaterial}
                                    onChange={(value) => setField("wallMaterial", value)}
                                    options={WALL_MATERIAL_OPTIONS}
                                    placeholder="Dinding utamanya terbuat dari apa?"
                                  />
                              </div>
                              <div>
                                <FieldLabel label="Struktur / lantai utama" required />
                                  <SelectInput
                                    value={form.structureMaterial}
                                    onChange={(value) => setField("structureMaterial", value)}
                                    options={STRUCTURE_MATERIAL_OPTIONS}
                                    placeholder="Struktur atau lantai utamanya terbuat dari apa?"
                                  />
                              </div>
                              <div>
                                <FieldLabel label="Atap" required />
                                  <SelectInput
                                    value={form.roofMaterial}
                                    onChange={(value) => setField("roofMaterial", value)}
                                    options={ROOF_MATERIAL_OPTIONS}
                                    placeholder="Penutup atapnya terbuat dari apa?"
                                  />
                              </div>
                              <div>
                                <FieldLabel label="Bagian mudah terbakar lainnya?" required />
                                  <SelectInput
                                    value={form.flammableMaterial}
                                    onChange={(value) => setField("flammableMaterial", value)}
                                    options={FLAMMABLE_MATERIAL_OPTIONS}
                                    placeholder="Apakah ada bagian utama bangunan lain yang mudah terbakar?"
                                  />
                              </div>
                            </div>
                            {selectedConstructionGuide ? (
                              <div className="mt-3 rounded-[12px] border border-[#D5DDE6] bg-white px-3 py-2.5">
                                <div className="text-[11px] leading-[1.45] text-slate-600 md:text-[12px]">{selectedConstructionGuide.desc}</div>
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <>
                            <FieldLabel label="Kelas Konstruksi" required />
                            <div className="space-y-2.5 md:max-w-[760px]">
                              <div className="space-y-2 md:flex md:items-center md:gap-3 md:space-y-0">
                                <div className="md:min-w-0 md:max-w-[420px] md:flex-1">
                                  <SelectInput
                                    value={form.constructionClass}
                                    onChange={(value) => setField("constructionClass", value)}
                                    options={CONSTRUCTION_CLASSES}
                                    placeholder="Pilih sesuai material utama bangunan."
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setShowConstructionGuide((prev) => !prev)}
                                  className="inline-flex h-auto shrink-0 items-center self-start rounded-none border-0 bg-transparent px-0 py-2 text-sm font-medium text-[#0A4D82] underline-offset-2 hover:underline"
                                >
                                  {showConstructionGuide ? "Sembunyikan panduan lengkap" : "Lihat panduan lengkap"}
                                </button>
                              </div>
                              {selectedConstructionGuide ? (
                                <div className="rounded-[12px] border border-[#D5DDE6] bg-[#F8FBFE] px-3 py-2.5">
                                  <div className="text-[11px] leading-[1.45] text-slate-600 md:text-[12px]">{selectedConstructionGuide.desc}</div>
                                </div>
                              ) : null}
                              {showConstructionGuide ? (
                                <div className="overflow-hidden rounded-[14px] border border-[#D5DDE6] bg-[#F8FBFE]">
                                  {CONSTRUCTION_GUIDE.map((item, index) => (
                                    <div
                                      key={item.title}
                                      className={cls(
                                        "grid gap-1.5 px-3 py-2.5 md:grid-cols-[76px_minmax(0,1fr)] md:items-start md:gap-x-3",
                                        index !== 0 && "border-t border-[#E2E8F0]",
                                      )}
                                    >
                                      <div className="text-[12px] font-semibold text-[#0A4D82] md:text-[13px]">{item.title}</div>
                                      <div className="text-[11px] leading-[1.45] text-slate-600 md:text-[12px]">{item.desc}</div>
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <FieldLabel label="Alamat / Lokasi Properti" required />
                        <div className="space-y-2.5 md:flex md:items-start md:gap-3 md:space-y-0">
                          <div className="md:min-w-0 md:flex-1">
                            <TextInput
                              value={form.locationSearch}
                              onChange={(value) => setField("locationSearch", value)}
                              placeholder="Ketik alamat, nama jalan, atau nama gedung"
                              icon={<Search className="h-4 w-4" />}
                            />
                          </div>
                          <div className="flex flex-wrap gap-2.5 md:flex-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                setField("locationSearch", "Lokasi GPS tersimulasi - Jl. Sudirman Kav. 44, Jakarta Selatan");
                                setEvidence((prev) => ({
                                  ...prev,
                                  location: createLocationEvidence({ declaredAddress: "Jl. Sudirman Kav. 44, Jakarta Selatan", source: "gps" }),
                                }));
                              }}
                              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium whitespace-nowrap text-slate-700 hover:bg-slate-50"
                            >
                              <MapPin className="h-4 w-4" />
                              Ambil Lokasi Sekarang
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setField("locationSearch", "Pin peta tersimulasi - Ruko Blok A3, Jl. Boulevard Raya, Kelapa Gading");
                                setEvidence((prev) => ({
                                  ...prev,
                                  location: createLocationEvidence({ declaredAddress: "Ruko Blok A3, Jl. Boulevard Raya, Kelapa Gading", source: "map" }),
                                }));
                              }}
                              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium whitespace-nowrap text-slate-700 hover:bg-slate-50"
                            >
                              <MapPin className="h-4 w-4" />
                              Pilih di Peta
                            </button>
                          </div>
                        </div>
                      </div>
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
                                <FieldLabel label="Harga Pertanggungan" required />
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
                          <span>Total Harga Pertanggungan</span>
                          <span className="break-words text-left text-[18px] font-bold text-[#E8A436] sm:text-right">Rp {formatRupiah(totalValue)}</span>
                        </div>
                      </div>
                    </div>
                </SectionCard>
                  {quoted ? (
                    <div ref={resultsRef} className="space-y-5">
                      <SectionCard title="Rincian Jaminan" subtitle="Klik setiap baris untuk melihat penjelasan detailnya.">
                        <div className="space-y-5">
                          <div>
                            <div className="text-[15px] font-semibold tracking-tight text-slate-900">{activeVariant.insuredRisksSectionTitle}</div>
                            <div className="mt-3">
                              <AccordionRiskRow title={activeVariant.primaryCoverageTitle} icon={Flame} premium={shouldShowQuotedPricing ? "Rp " + formatRupiah(basePremiumNumber) : "-"} detail={activeVariant.primaryCoverageDescription} deductible={effectiveConstructionClass === "Kelas 1" ? activeVariant.primaryCoverageDeductibleClassOne : activeVariant.primaryCoverageDeductibleOther} alwaysIncluded={true} expanded={expandedRows.fire} onToggleExpand={() => setExpandedRows((prev) => ({ ...prev, fire: !prev.fire }))} />
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

                      <SectionCard title="Ringkasan Pembayaran">
                        <PremiumPriceHero label="Total Pembayaran" value={pricingSummaryValue} />
                        <PremiumBreakdown>
                          <ProposalRow label="Premi" value={pricingSummaryValue} />
                          {extensionPremiumSummaryValue ? <ProposalRow label="Premi Perluasan" value={extensionPremiumSummaryValue} /> : null}
                          <ProposalRow label="Biaya Meterai" value={stampDutySummaryValue} />
                        </PremiumBreakdown>
                      </SectionCard>
                    </div>
                  ) : null}
                  <div className={cls("flex justify-stretch gap-3", quoted ? "justify-stretch sm:justify-end" : "sm:justify-end sm:gap-3")}>
                    {!quoted ? <button type="button" disabled={!canAdvanceInternalStepOne} onClick={() => setQuoted(true)} className={cls("inline-flex h-[50px] flex-1 items-center justify-center gap-2 rounded-[12px] px-5 text-sm font-semibold text-white shadow-sm transition", canAdvanceInternalStepOne ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}>Cek Premi</button> : null}
                    {!isExternalSelfServeJourney ? (
                      <button
                        type="button"
                        disabled={!canAdvanceInternalStepOne}
                        onClick={() => {
                          setQuoted(true);
                          setShowIndicationModal(true);
                        }}
                          className={cls("inline-flex h-[50px] flex-1 items-center justify-center gap-2 rounded-[12px] px-5 text-sm font-semibold text-white shadow-sm transition", canAdvanceInternalStepOne ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}
                      >
                        Kirim Penawaran
                      </button>
                    ) : null}
                    {(isExternalSelfServeJourney ? canContinueFromSimulation : quoted || canAdvanceInternalStepOne) ? (
                      <button
                        type="button"
                        disabled={!canAdvanceInternalStepOne}
                        onClick={() => {
                          setQuoted(true);
                          if (isExternalSelfServeJourney) {
                            setExternalView("external-underwriting");
                          } else {
                            setInternalStep(2);
                          }
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                          className={cls("inline-flex h-[50px] flex-1 items-center justify-center gap-2 rounded-[12px] px-5 text-sm font-semibold text-white shadow-sm transition", canAdvanceInternalStepOne ? "bg-[#0A4D82] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}
                        >
                          {"Isi Data Lanjutan"}
                      </button>
                    ) : null}
                  </div>
                  {stepOnePendingItems.length ? (
                    <div className="mt-4">
                      <SummarySidebarAlert items={stepOnePendingItems} />
                    </div>
                  ) : null}
              </div>
            </div>
          ) : (
            <div className="mx-auto mt-6 max-w-[860px] px-4 md:px-6">
                <div className="space-y-5">
                  <UnderwritingSections
                    form={form}
                    customerType={form.customerType}
                    selectedCustomer={selectedCustomer}
                    objectRows={objectRows}
                    uwForm={uwForm}
                    setUwField={setUwField}
                    ktpCheck={documentChecks.ktp}
                    onCaptureKtp={handleCaptureKtp}
                    uploads={uploads}
                    setUploads={setUploads}
                    setEvidence={setEvidence}
                    expandedRows={expandedRows}
                    setExpandedRows={setExpandedRows}
                    external={true}
                    useAccountProfileCustomerData={useAccountProfileCustomerData}
                    profileCustomerOverrideEnabled={externalProfileCustomerOverride}
                    profileCustomerEditMode={externalProfileCustomerEditMode}
                    accountIdentityNumber={accountIdentityNumber}
                    accountInsuredAddress={accountInsuredAddress}
                    onEnableProfileCustomerEdit={enableExternalProfileCustomerEdit}
                    onCancelProfileCustomerEdit={cancelExternalProfileCustomerEdit}
                    onSaveProfileCustomerEdit={saveExternalProfileCustomerEdit}
                  />

                  <SectionCard title="Ringkasan Pembayaran">
                  <PremiumPriceHero label="Total Pembayaran" value={`Rp ${formatRupiah(estimatedTotalNumber)}`} />
                  <PremiumBreakdown>
                    <ProposalRow label="Premi" value={`Rp ${formatRupiah(basePremiumNumber)}`} />
                    {additionalPremiumNumber > 0 ? <ProposalRow label="Premi Perluasan" value={`Rp ${formatRupiah(additionalPremiumNumber)}`} /> : null}
                    <ProposalRow label="Biaya Meterai" value={`Rp ${formatRupiah(stampDutyNumber)}`} />
                  </PremiumBreakdown>
                </SectionCard>

                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setInternalStep(1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="flex h-[48px] w-full items-center justify-center rounded-[12px] border border-[#D5DEEA] bg-white px-5 text-center text-sm font-semibold text-[#0A4D82] shadow-sm transition hover:bg-[#F8FBFE]"
                  >
                    Kembali ke Data Awal
                  </button>
                  <button
                    type="button"
                    disabled={hasClaimHistoryReviewBlock ? false : !canSendIndicativeOffer}
                    onClick={() => {
                      if (hasClaimHistoryReviewBlock) {
                        setHelpRequestSent(true);
                        return;
                      }
                      setShowIndicationModal(true);
                    }}
                    className={cls(
                      "flex h-[48px] w-full items-center justify-center rounded-[12px] px-5 text-center text-sm font-semibold text-white shadow-sm transition",
                      hasClaimHistoryReviewBlock
                        ? "bg-[#0A4D82] hover:brightness-105"
                        : canSendIndicativeOffer
                        ? "bg-[#F5A623] hover:brightness-105"
                        : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400",
                    )}
                  >
                    {hasClaimHistoryReviewBlock ? "Minta Bantuan Peninjauan" : "Kirim Penawaran"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

















