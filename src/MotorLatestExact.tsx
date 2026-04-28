import React, { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  FileText,
  Home,
  Mail,
  MapPin,
  Package,
  Phone,
  QrCode,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  Trash2,
  User,
  Wallet,
  Waves,
  X,
} from "lucide-react";
import { canProceedToPaymentFromOperating, paymentBlockMessage } from "./operatingLayer.js";
import { CustomerDataJourneyShell } from "./components/CustomerDataJourneyShell.jsx";
import { OfferShareModal } from "./components/OfferShareModal.jsx";
import { PremiumBreakdown, PremiumPriceHero, ProposalRow } from "./components/PremiumSummaryBlocks.jsx";
import { SentOffersHistoryModal, UserPillMenu } from "./components/UserPillMenu.jsx";
import { VehicleYearPicker } from "./components/VehicleYearPicker.jsx";
import { createEmptyDocumentCheck, createPhotoEvidence, createTransactionAuthority, evaluateDocumentRead, summarizeFraudSignals } from "./platform/securityControls.js";
import { findVehicleSuggestions, getVehicleCatalogItem, getVehicleCatalogItems } from "./vehicleCatalog.js";

const CURRENT_YEAR = 2026;
const MIN_YEAR_TLO = CURRENT_YEAR - 20;
const MIN_YEAR_COMP = CURRENT_YEAR - 15;

type FlowType = "motor" | "carComp" | "carTlo";
type DataMode = "scan" | "manual";
type EntryMode = "internal" | "external";

type ExtensionsState = Record<string, any>;
type VehicleCatalogItem = {
  label: string;
  brand: string;
  model: string;
  fuelType: string;
  ojkCategory: string;
  bodyType?: string;
};

type FlowState = {
  ui: { extOpen: boolean; dataMode: DataMode; stnkMode: DataMode };
  underwriting: { claimHistory: string; noExistingDamage: boolean; existingDamageStatus: "" | "none" | "yes"; existingDamagePhotoCount: number };
  quote: {
    usage: string;
    vehicleType: string;
    plateRegion: string;
    vehicleName: string;
    vehicleFuelType: string;
    vehicleBodyType: string;
    year: string;
    marketValue: string;
    coverageStart: string;
    coverageEnd: string;
    mainDeductibleOverrideAmount: number | "";
    extensions: ExtensionsState;
  };
  insured: { customerType: string; nik: string; fullName: string; lookup: string; address: string; email: string; phone: string };
  vehicle: { plateNumber: string; ownerNameOnStnk: string; chassisNumber: string; engineNumber: string; color: string; year: string; contactOnLocation: string };
  ktpRead: boolean;
  stnkRead: boolean;
  uploads: Record<string, boolean>;
  paymentMethod: string;
  promoCode: string;
  agree: boolean;
};

const PRODUCTS = [
  {
    id: "motor",
    title: "Asuransi Sepeda Motor - Total Loss",
    category: "Kendaraan",
    subtitle: "Perlindungan untuk sepeda motor terhadap kehilangan akibat pencurian atau kerusakan berat yang termasuk total loss sesuai ketentuan polis.",
    gradient: "from-slate-700 via-slate-600 to-slate-500",
  },
  {
    id: "carComp",
    title: "Asuransi Mobil Komprehensif",
    category: "Kendaraan",
    subtitle: "Menjamin kerugian atau kerusakan pada Kendaraan Bermotor yang secara langsung disebabkan oleh tabrakan, benturan, terbalik, tergelincir, terperosok, perbuatan jahat, pencurian, dan kebakaran sesuai ketentuan polis.",
    gradient: "from-sky-800 via-sky-700 to-sky-600",
  },
  {
    id: "carTlo",
    title: "Asuransi Mobil - Total Loss",
    category: "Kendaraan",
    subtitle: "Perlindungan mobil untuk kerugian total akibat pencurian, kebakaran, atau risiko lain yang dijamin polis.",
    gradient: "from-slate-900 via-slate-800 to-slate-700",
  },
] as const;

const MOTOR_UPLOAD_FIELDS = [
  "Foto motor dari sudut depan samping",
  "Foto salah satu sisi motor secara penuh",
  "Foto panel speedometer saat kontak ON",
] as const;

const CAR_UPLOAD_FIELDS = [
  "Ambil foto bagian depan",
  "Ambil foto bagian samping kanan",
  "Ambil foto bagian samping kiri",
  "Ambil foto bagian belakang",
] as const;
const CAR_COMP_EXISTING_DAMAGE_PREFIX = "Foto kerusakan sebelum polis";
const CAR_EQUIPMENT_PHOTO_PREFIX = "Foto perlengkapan tambahan";
const CAR_COMP_UPLOAD_FIELDS = [
  "Ambil foto bagian depan",
  "Ambil foto bagian belakang",
  "Ambil foto bagian samping kanan",
  "Ambil foto bagian samping kiri",
  "Foto interior dashboard dan odometer",
  "Foto nomor rangka / VIN",
] as const;

function getVehicleUploadFields(type: FlowType) {
  if (type === "motor") return [...MOTOR_UPLOAD_FIELDS];
  if (type === "carComp") return [...CAR_COMP_UPLOAD_FIELDS];
  return [...CAR_UPLOAD_FIELDS];
}

function getExistingDamageUploadName(index: number) {
  return `${CAR_COMP_EXISTING_DAMAGE_PREFIX} ${index}`;
}

function isExistingDamageUploadName(name: string) {
  return String(name || "").startsWith(CAR_COMP_EXISTING_DAMAGE_PREFIX);
}

function getExistingDamagePhotoNames(count: number) {
  const safeCount = Math.max(1, Number(count || 1));
  return Array.from({ length: safeCount }, (_, index) => getExistingDamageUploadName(index + 1));
}

function getEquipmentPhotoName(index: number) {
  return `${CAR_EQUIPMENT_PHOTO_PREFIX} ${index}`;
}

function isEquipmentPhotoName(name: string) {
  return String(name || "").startsWith(CAR_EQUIPMENT_PHOTO_PREFIX);
}

function getEquipmentPhotoNames(count: number) {
  const safeCount = Math.max(1, Number(count || 1));
  return Array.from({ length: safeCount }, (_, index) => getEquipmentPhotoName(index + 1));
}

const OJK_REGION_1_CODES = ["BA", "BB", "BD", "BE", "BG", "BH", "BK", "BL", "BM", "BN", "BP"];
const OJK_REGION_2_CODES = ["A", "B", "D", "E", "F", "T", "Z"];

const PLATES = [
  "A - Banten",
  "AA - Kedu",
  "AB - DI Yogyakarta",
  "AD - Surakarta",
  "AE - Madiun",
  "AG - Kediri",
  "B - Jakarta/Depok/Tangerang/Bekasi",
  "BA - Sumatera Barat",
  "BB - Tapanuli",
  "BD - Bengkulu",
  "BE - Lampung",
  "BG - Sumatera Selatan",
  "BH - Jambi",
  "BK - Sumatera Utara Timur",
  "BL - Aceh",
  "BM - Riau",
  "BN - Bangka Belitung",
  "BP - Kepulauan Riau",
  "D - Bandung",
  "DA - Kalimantan Selatan",
  "DB - Sulawesi Utara Daratan",
  "DC - Sulawesi Barat",
  "DD - Sulawesi Selatan",
  "DE - Maluku",
  "DG - Maluku Utara",
  "DH - NTT Timor",
  "DK - Bali",
  "DL - Sulawesi Utara Kepulauan",
  "DM - Gorontalo",
  "DN - Sulawesi Tengah",
  "DR - NTB Lombok",
  "DT - Sulawesi Tenggara",
  "E - Cirebon",
  "EA - NTB Sumbawa",
  "EB - Flores",
  "ED - Sumba",
  "F - Bogor/Sukabumi/Cianjur",
  "G - Pekalongan/Tegal",
  "H - Semarang",
  "K - Pati",
  "KB - Kalimantan Barat",
  "KH - Kalimantan Tengah",
  "KT - Kalimantan Timur",
  "KU - Kalimantan Utara",
  "L - Surabaya",
  "M - Madura",
  "N - Malang",
  "P - Besuki",
  "PA - Papua",
  "PB - Papua Barat",
  "R - Banyumas",
  "S - Bojonegoro",
  "T - Karawang/Purwakarta",
  "W - Sidoarjo",
  "Z - Garut/Tasik/Majalengka",
];

const CUSTOMER_TYPES = ["Pribadi", "Perusahaan / Badan Usaha"];
type MockCustomer = {
  name: string;
  cif: string;
  type: string;
  phone: string;
  email: string;
};

const VEHICLE_MOCK_CIF_BY_FLOW: Record<FlowType, readonly MockCustomer[]> = {
  motor: [
    { name: "Rama Pratama", cif: "MTR21", type: "Pribadi", phone: "081311220011", email: "rama.pratama@email.com" },
    { name: "Nadia Permata", cif: "MTR32", type: "Pribadi", phone: "081377665544", email: "nadia.permata@email.com" },
    { name: "CV Dua Roda Abadi", cif: "MTR45", type: "Perusahaan / Badan Usaha", phone: "02150881122", email: "admin@duarodaabadi.co.id" },
  ],
  carComp: [
    { name: "Bimo Santoso", cif: "CAR18", type: "Pribadi", phone: "081244556677", email: "bimo.santoso@email.com" },
    { name: "Karina Putri", cif: "CAR27", type: "Pribadi", phone: "081355884422", email: "karina.putri@email.com" },
    { name: "PT Cakra Mobilitas", cif: "CAR39", type: "Perusahaan / Badan Usaha", phone: "02150997711", email: "fleet@cakramobilitas.co.id" },
  ],
  carTlo: [
    { name: "Bimo Santoso", cif: "CAR18", type: "Pribadi", phone: "081244556677", email: "bimo.santoso@email.com" },
    { name: "Karina Putri", cif: "CAR27", type: "Pribadi", phone: "081355884422", email: "karina.putri@email.com" },
    { name: "PT Cakra Mobilitas", cif: "CAR39", type: "Perusahaan / Badan Usaha", phone: "02150997711", email: "fleet@cakramobilitas.co.id" },
  ],
} as const;

const MOTOR_EXTS = [
  { id: "tpl", label: "Jaminan Tanggung Jawab Hukum terhadap Pihak Ketiga", type: "amount", icon: Shield },
  { id: "srcc", label: "Jaminan Kerusuhan & Huru-hara", type: "toggle", icon: Shield },
  { id: "ts", label: "Jaminan Terorisme", type: "toggle", icon: AlertTriangle },
  { id: "flood", label: "Jaminan Banjir", type: "toggle", icon: Waves },
  { id: "quake", label: "Jaminan Gempa Bumi", type: "toggle", icon: Sparkles },
] as const;

const CAR_EXTS = [
  { id: "tpl", label: "Jaminan Tanggung Jawab Hukum terhadap Pihak Ketiga", type: "amount", icon: Shield },
  { id: "driverPa", label: "Jaminan Kecelakaan Diri Pengemudi", type: "amount", icon: User },
  { id: "passengerPa", label: "Jaminan Kecelakaan Diri Penumpang", type: "amount-seat", icon: User },
  { id: "srcc", label: "Jaminan Kerusuhan & Huru-hara", type: "toggle", icon: Shield },
  { id: "ts", label: "Jaminan Terorisme", type: "toggle", icon: AlertTriangle },
  { id: "flood", label: "Jaminan Banjir", type: "toggle", icon: Waves },
  { id: "quake", label: "Jaminan Gempa Bumi", type: "toggle", icon: Sparkles },
  { id: "authorizedWorkshop", label: "Perbaikan di Bengkel Authorized", type: "toggle", icon: Building2 },
] as const;

function getVisibleExtensionItems(flowType: FlowType) {
  if (flowType === "motor") return MOTOR_EXTS;
  if (flowType === "carTlo") return CAR_EXTS.filter((item) => item.id !== "authorizedWorkshop");
  return CAR_EXTS;
}

const TLO_RATES_MOTOR = {
  1: { min: 0.0176 },
  2: { min: 0.018 },
  3: { min: 0.0067 },
};

const TLO_RATES_CAR = {
  1: { 1: { min: 0.0047 }, 2: { min: 0.0063 }, 3: { min: 0.0041 }, 4: { min: 0.0025 }, 5: { min: 0.002 } },
  2: { 1: { min: 0.0065 }, 2: { min: 0.0044 }, 3: { min: 0.0038 }, 4: { min: 0.0025 }, 5: { min: 0.002 } },
  3: { 1: { min: 0.0051 }, 2: { min: 0.0044 }, 3: { min: 0.0029 }, 4: { min: 0.0023 }, 5: { min: 0.002 } },
};

const COMP_RATES_CAR = {
  1: { 1: { min: 0.0382 }, 2: { min: 0.0267 }, 3: { min: 0.0208 }, 4: { min: 0.012 }, 5: { min: 0.0105 } },
  2: { 1: { min: 0.0247 }, 2: { min: 0.0269 }, 3: { min: 0.0271 }, 4: { min: 0.0139 }, 5: { min: 0.012 } },
  3: { 1: { min: 0.0253 }, 2: { min: 0.0246 }, 3: { min: 0.0238 }, 4: { min: 0.012 }, 5: { min: 0.0105 } },
};

const FLOOD_RATES_TLO = { 1: { min: 0.0005 }, 2: { min: 0.00075 }, 3: { min: 0.0005 } };
const FLOOD_RATES_COMP = { 1: { min: 0.00075 }, 2: { min: 0.001 }, 3: { min: 0.00075 } };
const QUAKE_RATES_TLO = { 1: { min: 0.00085 }, 2: { min: 0.00075 }, 3: { min: 0.0005 } };
const QUAKE_RATES_COMP = { 1: { min: 0.0012 }, 2: { min: 0.001 }, 3: { min: 0.00075 } };
const SRCC_RATE_TLO = 0.00035;
const SRCC_RATE_COMP = 0.0005;
const TS_RATE_TLO = 0.00035;
const TS_RATE_COMP = 0.0005;
const DRIVER_PA_RATE = 0.005;
const PASSENGER_PA_RATE = 0.001;
const AUTH_WORKSHOP_RATE = 0.0025;
const MIN_COVERAGE_INPUT_AMOUNT = 1000000;
const DEFAULT_CAR_TPL_AMOUNT = 25000000;
const DEFAULT_CAR_PA_AMOUNT = 10000000;
const DEFAULT_CAR_PASSENGER_SEATS = "4";
const CAR_COMP_LOADING_DEDUCTIBLE_AMOUNT_CATEGORY_1_5 = 500000;
const CAR_COMP_LOADING_DEDUCTIBLE_AMOUNT_CATEGORY_6_7 = 750000;
const COMMERCIAL_CASCO_LOADING_RATE = 0.05;
const PAYMENT_OPTIONS = ["Virtual Account", "Kartu Kredit", "Transfer Bank"];
const CLAIM_HISTORY_OPTIONS = ["Tidak Ada", "Ada 1 Klaim", "Ada Lebih dari 1 Klaim"];
const DEMO_MODEL_LABELS: Record<FlowType, string> = {
  motor: "Yamaha NMAX 155 Connected",
  carComp: "BYD Atto 3 Advanced",
  carTlo: "Toyota Avanza 1.5 G",
};

const EXT_INFO: Record<string, string> = {
  tpl: "Menjamin tanggung jawab hukum Tertanggung atas kerugian pihak ketiga yang secara langsung disebabkan oleh Kendaraan Bermotor yang dipertanggungkan akibat risiko yang dijamin polis, termasuk kerusakan harta benda, biaya pengobatan, cedera badan, dan/atau kematian.",
  srcc: "Menjamin kerugian atau kerusakan kendaraan yang secara langsung disebabkan oleh kerusuhan, pemogokan, penghalangan bekerja, tawuran, huru-hara, pembangkitan rakyat tanpa penggunaan senjata api, revolusi tanpa penggunaan senjata api, pencegahan terkait risiko tersebut, serta penjarahan yang terjadi selama kerusuhan atau huru-hara.",
  ts: "Menjamin kerugian atau kerusakan kendaraan yang secara langsung disebabkan oleh makar, terorisme, sabotase, atau tindakan pencegahan yang berkaitan dengan risiko tersebut.",
  flood: "Menjamin kerugian atau kerusakan kendaraan yang secara langsung disebabkan oleh angin topan, badai, hujan es, banjir, genangan air, dan/atau tanah longsor.",
  quake: "Menjamin kerugian atau kerusakan kendaraan yang secara langsung disebabkan oleh gempa bumi, tsunami, dan/atau letusan gunung berapi.",
  driverPa: "Menjamin cedera badan, kematian, dan/atau biaya pengobatan terhadap pengemudi di dalam kendaraan yang secara langsung disebabkan oleh kecelakaan Kendaraan Bermotor akibat risiko yang dijamin polis.",
  passengerPa: "Menjamin cedera badan, kematian, dan/atau biaya pengobatan terhadap penumpang di dalam kendaraan yang secara langsung disebabkan oleh kecelakaan Kendaraan Bermotor akibat risiko yang dijamin polis.",
  equipment: "Menjamin peralatan atau perlengkapan non-standar yang dirinci jenis, jumlah, dan harga pertanggungannya dalam polis sebagai bagian dari kendaraan yang dipertanggungkan.",
  authorizedWorkshop: "Memberikan fasilitas perbaikan kendaraan di bengkel resmi sesuai merek kendaraan. Jika bengkel resmi merek tersebut tidak tersedia di wilayah Tertanggung, perbaikan dapat dilakukan di bengkel resmi merek lain yang setara dengan persetujuan Penanggung.",
};
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

function cls(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(" ");
}

function normalizeConsentTextLine(line: string) {
  return String(line || "")
    .replaceAll("â€œ", "“")
    .replaceAll("â€", "”")
    .replaceAll("Ã¢â‚¬Å“", "“")
    .replaceAll("Ã¢â‚¬Â", "”");
}

function normalizeConsentLine(line: string) {
  return normalizeConsentTextLine(line);
}

function createFlowState(type: FlowType): FlowState {
  const isMotor = type === "motor";
  return {
    ui: { extOpen: false, dataMode: "scan", stnkMode: "scan" },
    underwriting: { claimHistory: "", noExistingDamage: false, existingDamageStatus: "", existingDamagePhotoCount: 1 },
    quote: {
      usage: "",
      vehicleType: "",
      plateRegion: "",
      vehicleName: "",
      vehicleFuelType: "",
      vehicleBodyType: "",
      year: "",
      marketValue: "",
      coverageStart: "",
      coverageEnd: "",
      mainDeductibleOverrideAmount: "",
      extensions: isMotor
        ? { tpl: { enabled: false, amount: "" }, srcc: { enabled: false }, ts: { enabled: false }, flood: { enabled: false }, quake: { enabled: false } }
        : {
            tpl: { enabled: false, amount: DEFAULT_CAR_TPL_AMOUNT },
            srcc: { enabled: false },
            ts: { enabled: false },
            flood: { enabled: false },
            quake: { enabled: false },
            driverPa: { enabled: false, amount: DEFAULT_CAR_PA_AMOUNT },
            passengerPa: { enabled: false, amount: DEFAULT_CAR_PA_AMOUNT, seats: DEFAULT_CAR_PASSENGER_SEATS },
            equipment: { enabled: false, amount: "", status: "none", inclusion: "", declaredValue: "", description: "", photoCount: 1 },
            authorizedWorkshop: { enabled: false },
          },
    },
    insured: { customerType: "", nik: "", fullName: "", lookup: "", address: "", email: "", phone: "" },
    vehicle: { plateNumber: "", ownerNameOnStnk: "", chassisNumber: "", engineNumber: "", color: "", year: "", contactOnLocation: "" },
    ktpRead: false,
    stnkRead: false,
    uploads: Object.fromEntries(getVehicleUploadFields(type).map((label) => [label, false])),
    paymentMethod: "",
    promoCode: "",
    agree: false,
  };
}

function formatRupiah(v: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(v || 0));
}
function digitsOnly(value: string | number) {
  return String(value || "").replace(/[^0-9]/g, "");
}
function formatDisplayDateTime(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}
function formatDisplayDate(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(value);
}
function encodeShareToken(payload: any) {
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
function decodeShareToken(value: string) {
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
function readVehicleShareContextFromUrl() {
  if (typeof window === "undefined") return { view: "", viewer: "", shareData: null };
  const params = new URLSearchParams(window.location.search);
  const shareToken = params.get("share") || "";
  return {
    view: params.get("view") || "",
    viewer: params.get("viewer") || "",
    shareToken,
    shareData: decodeShareToken(shareToken),
  };
}
function clearVehicleShareContextFromUrl() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  ["view", "viewer", "share", "referral", "sender", "customer", "offer"].forEach((key) => {
    url.searchParams.delete(key);
  });
  window.history.replaceState({}, "", url.toString());
}
function replaceVehicleShareContextInUrl({ view = "", viewer = "", shareData = null }: any = {}) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (view) url.searchParams.set("view", view);
  else url.searchParams.delete("view");
  if (viewer) url.searchParams.set("viewer", viewer);
  else url.searchParams.delete("viewer");
  const encoded = encodeShareToken(shareData);
  if (encoded) url.searchParams.set("share", encoded);
  else url.searchParams.delete("share");
  ["referral", "sender", "customer", "offer"].forEach((key) => {
    url.searchParams.delete(key);
  });
  window.history.replaceState({}, "", url.toString());
}
function getJourneyShareUrl(journeyKey: string, params: any = {}) {
  if (typeof window === "undefined") return `?journey=${journeyKey}`;
  const url = new URL(window.location.href);
  ["journey", "role", "view", "viewer", "share", "referral", "sender", "customer", "offer"].forEach((key) => {
    url.searchParams.delete(key);
  });
  url.searchParams.set("journey", journeyKey);
  if (params.role) url.searchParams.set("role", params.role);
  if (params.view) url.searchParams.set("view", params.view);
  if (params.viewer) url.searchParams.set("viewer", params.viewer);
  if (params.shareData) {
    const encoded = encodeShareToken(params.shareData);
    if (encoded) url.searchParams.set("share", encoded);
  }
  return `${url.origin}${url.pathname}?${url.searchParams.toString()}`;
}
function openOfferPreview(targetUrl: string) {
  if (typeof window === "undefined" || !targetUrl) return;
  window.location.assign(targetUrl);
}
function openShareWindow(targetUrl: string) {
  if (typeof window === "undefined" || !targetUrl) return;
  window.open(targetUrl, "_blank", "noopener,noreferrer");
}
function downloadVehicleOfferPdf({
  fileName,
  productTitle,
  customerName,
  phone,
  email,
  vehicleName,
  plateRegion,
  usage,
  year,
  marketValue,
  tariffInfo,
  basePremium,
  extensionPremium,
  stampDuty,
  totalPremium,
  extensionItems,
  offerReference,
  downloadedAt,
  shareUrl,
}: any) {
  try {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const marginX = 16;
    const pageWidth = 210;
    const contentWidth = pageWidth - marginX * 2;
    let y = 18;
    const split = (text: string, width = contentWidth) => doc.splitTextToSize(String(text || "-"), width);
    const drawLabelValue = (label: string, value: string) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(label, marginX, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      const lines = split(value, contentWidth - 52);
      doc.text(lines, marginX + 52, y);
      y += Math.max(6, lines.length * 5);
    };

    doc.setFillColor(10, 77, 130);
    doc.roundedRect(marginX, y - 6, contentWidth, 28, 4, 4, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.text(productTitle || "Penawaran Kendaraan", marginX + 6, y + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Referensi: ${offerReference || "-"}`, marginX + 6, y + 12);
    doc.text(`Diunduh: ${downloadedAt || "-"}`, marginX + 6, y + 18);
    y += 34;

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Ringkasan Informasi Calon Pemegang Polis", marginX, y);
    y += 8;
    drawLabelValue("Nama Calon Pemegang Polis", customerName || "Calon Pemegang Polis");
    drawLabelValue("Alamat Email", email || "-");
    drawLabelValue("Nomor Handphone", phone || "-");
    y += 4;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Ringkasan Informasi Kendaraan", marginX, y);
    y += 8;
    drawLabelValue("Merek / Tipe", vehicleName || "-");
    drawLabelValue("Kode Wilayah", plateRegion || "-");
    drawLabelValue("Tahun Kendaraan", year || "-");
    drawLabelValue("Harga Pertanggungan", formatRupiah(Number(marketValue || 0)));
    drawLabelValue("Penggunaan Kendaraan", usage || "-");
    if (tariffInfo) drawLabelValue("Wilayah Tarif dan Kategori Tarif", tariffInfo);
    y += 4;

    if (extensionItems?.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Perluasan Jaminan", marginX, y);
      y += 8;
      extensionItems.forEach((item: any) => {
        drawLabelValue(item.title, formatRupiah(item.premium || 0));
      });
      y += 2;
    }

    doc.setFillColor(248, 251, 254);
    doc.setDrawColor(213, 221, 230);
    doc.roundedRect(marginX, y, contentWidth, 26, 4, 4, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("Premi Penawaran", marginX + 6, y + 8);
    doc.setFontSize(18);
    doc.setTextColor(10, 77, 130);
    doc.text(formatRupiah(Number(totalPremium || 0)), marginX + 6, y + 19);
    y += 34;

    drawLabelValue("Premi", formatRupiah(Number(basePremium || 0)));
    if (Number(extensionPremium || 0) > 0) {
      drawLabelValue("Premi Perluasan", formatRupiah(Number(extensionPremium || 0)));
    }
    drawLabelValue("Biaya Meterai", formatRupiah(Number(stampDuty || 0)));
    y += 4;
    drawLabelValue("Tautan Penawaran", shareUrl || "-");

    const safeName = String(fileName || "Penawaran-Kendaraan").replace(/[\\/:*?\"<>|]+/g, "-");
    doc.save(`${safeName}.pdf`);
    return true;
  } catch {
    return false;
  }
}
function isDigitsOnly(value: string) {
  return /^\d+$/.test(String(value || "").trim());
}
function getPlateCode(plate: string) {
  return String(plate || "").split(" - ")[0].trim().toUpperCase();
}
function getRegion(plate: string) {
  const code = getPlateCode(plate);
  if (OJK_REGION_1_CODES.includes(code)) return 1;
  if (OJK_REGION_2_CODES.includes(code)) return 2;
  return 3;
}
function getRegionLabel(plate: string) {
  return plate ? `Wilayah ${getRegion(plate)}` : "";
}
function validateMaxHP(flowType: FlowType, value: number) {
  if (flowType === "motor") return value <= 500000000;
  return value <= 1500000000;
}

function maxHPText(flowType: FlowType) {
  return flowType === "motor"
    ? "Maksimum harga pertanggungan untuk motor adalah Rp500.000.000."
    : "Maksimum harga pertanggungan untuk mobil adalah Rp1.500.000.000.";
}

function getCategory(value: number) {
  const v = Math.max(0, Number(value) || 0);
  if (v <= 125000000) return 1;
  if (v <= 200000000) return 2;
  if (v <= 400000000) return 3;
  if (v <= 800000000) return 4;
  return 5;
}
function getCarCategory(vehicleType: string) {
  if (vehicleType === "Angkutan Penumpang" || vehicleType === "Angkutan Barang" || vehicleType === "Bis") return vehicleType;
  const value = String(vehicleType || "").toLowerCase();
  if (!value) return "Angkutan Penumpang";
  if (value.includes("bus") || value.includes("elf") || value.includes("microbus")) return "Bis";
  if (
    value.includes("barang") ||
    value.includes("pick up") ||
    value.includes("pickup") ||
    value.includes("truck") ||
    value.includes("truk") ||
    value.includes("double cabin") ||
    value.includes("box") ||
    value.includes("blind van") ||
    value.includes("van") ||
    value.includes("cab chassis") ||
    value.includes("towing") ||
    value.includes("tangki")
  ) {
    return "Angkutan Barang";
  }
  return "Angkutan Penumpang";
}
function getCarTloBaseRate(region: number, vehicleType: string, marketValue: number) {
  const vehicleCategory = getCarCategory(vehicleType);
  if (vehicleCategory === "Angkutan Penumpang") {
    const category = getCategory(marketValue);
    return TLO_RATES_CAR[region as 1 | 2 | 3][category as 1 | 2 | 3 | 4 | 5].min;
  }
  if (vehicleCategory === "Angkutan Barang") return region === 1 ? 0.0088 : region === 2 ? 0.0168 : 0.0081;
  return region === 1 ? 0.0023 : region === 2 ? 0.0023 : 0.0018;
}
function getCarCompBaseRate(region: number, vehicleType: string, marketValue: number) {
  const vehicleCategory = getCarCategory(vehicleType);
  if (vehicleCategory === "Angkutan Penumpang") {
    const category = getCategory(marketValue);
    return COMP_RATES_CAR[region as 1 | 2 | 3][category as 1 | 2 | 3 | 4 | 5].min;
  }
  if (vehicleCategory === "Angkutan Barang") return region === 1 ? 0.0242 : region === 2 ? 0.0239 : 0.0223;
  return region === 1 ? 0.0104 : region === 2 ? 0.0104 : 0.0088;
}
function getCategoryLabel(category: number) {
  if (category === 1) return "Kategori 1 - s.d. Rp125 juta";
  if (category === 2) return "Kategori 2 - >Rp125 juta s.d. Rp200 juta";
  if (category === 3) return "Kategori 3 - >Rp200 juta s.d. Rp400 juta";
  if (category === 4) return "Kategori 4 - >Rp400 juta s.d. Rp800 juta";
  return "Kategori 5 - >Rp800 juta";
}
function getVehicleTariffCategory(flowType: FlowType, quote: any) {
  if (flowType === "motor") return "Kategori 8";
  const vehicleCategory = getCarCategory(quote.vehicleType);
  if (vehicleCategory === "Angkutan Barang") return "Kategori 6";
  if (vehicleCategory === "Bis") return "Kategori 7";
  return `Kategori ${getCategory(Number(quote.marketValue || 0))}`;
}
function progressiveTPL(amount: number, vehicleType: string) {
  let remaining = Math.max(0, amount);
  let total = 0;
  const vehicleCategory = getCarCategory(vehicleType);
  const r1 = vehicleCategory === "Angkutan Penumpang" ? 0.01 : 0.015;
  const r2 = vehicleCategory === "Angkutan Penumpang" ? 0.005 : 0.0075;
  const r3 = vehicleCategory === "Angkutan Penumpang" ? 0.0025 : 0.00375;
  const a = Math.min(remaining, 25000000);
  total += a * r1;
  remaining -= a;
  if (remaining > 0) {
    const b = Math.min(remaining, 25000000);
    total += b * r2;
    remaining -= b;
  }
  if (remaining > 0) total += Math.min(remaining, 50000000) * r3;
  return Math.round(total);
}

function computeCarTplFee(limitAmount: number, vehicleType: string) {
  const amount = Math.max(0, Number(limitAmount) || 0);
  return progressiveTPL(Math.min(100000000, amount), vehicleType);
}
function getCarEquipmentCap(marketValue: number) {
  return Math.min(25000000, Math.round(Math.max(0, Number(marketValue) || 0) * 0.1));
}
function getCarEquipmentAmount(q: any, marketValue: number, requireEnabled = true) {
  const isEnabled = Boolean(q.extensions.equipment?.enabled);
  if (requireEnabled && !isEnabled) return 0;
  return Math.min(getCarEquipmentCap(marketValue), Math.max(0, Number(q.extensions.equipment?.amount || 0) || 0));
}
function clampCoverageInputAmount(value: any, minAmount: number, maxAmount: number, fallbackAmount = minAmount) {
  const maxSafe = Math.max(0, Number(maxAmount) || 0);
  const minSafe = Math.max(0, Number(minAmount) || 0);
  const effectiveMin = maxSafe > 0 ? Math.min(minSafe, maxSafe) : minSafe;
  const parsed = Number(value);
  const requested = Number.isFinite(parsed) && parsed > 0 ? parsed : Number(fallbackAmount || effectiveMin);
  const withMinimum = Math.max(effectiveMin, requested);
  return maxSafe > 0 ? Math.min(maxSafe, withMinimum) : withMinimum;
}
function getCarTplCoverageAmount(q: any, marketValue: number, fallbackAmount = 0) {
  const maxCoverage = marketValue ? Math.min(100000000, Math.max(0, Number(marketValue) || 0)) : 100000000;
  const rawAmount = q.extensions.tpl?.amount;
  const fallback = fallbackAmount || MIN_COVERAGE_INPUT_AMOUNT;
  return clampCoverageInputAmount(rawAmount, MIN_COVERAGE_INPUT_AMOUNT, maxCoverage, fallback);
}
function getCarPaCoverageAmount(q: any, itemId: "driverPa" | "passengerPa", marketValue: number, fallbackAmount = 0) {
  const maxCoverage = marketValue ? Math.min(100000000, Math.max(0, Number(marketValue) || 0)) : 100000000;
  const rawAmount = q.extensions[itemId]?.amount;
  const fallback = fallbackAmount || MIN_COVERAGE_INPUT_AMOUNT;
  return clampCoverageInputAmount(rawAmount, MIN_COVERAGE_INPUT_AMOUNT, maxCoverage, fallback);
}
function getVehicleExtensionCoverageAmount(flowType: FlowType, q: any, itemId: string) {
  const mv = Math.max(0, Number(q.marketValue) || 0);
  const isMotor = flowType === "motor";
  if (itemId === "tpl") {
    if (isMotor) return clampCoverageInputAmount(q.extensions.tpl?.amount, MIN_COVERAGE_INPUT_AMOUNT, MIN_COVERAGE_INPUT_AMOUNT, MIN_COVERAGE_INPUT_AMOUNT);
    return getCarTplCoverageAmount(q, mv, DEFAULT_CAR_TPL_AMOUNT);
  }
  if (itemId === "driverPa") return isMotor ? 0 : getCarPaCoverageAmount(q, "driverPa", mv, DEFAULT_CAR_PA_AMOUNT);
  if (itemId === "passengerPa") return isMotor ? 0 : getCarPaCoverageAmount(q, "passengerPa", mv, DEFAULT_CAR_PA_AMOUNT);
  if (itemId === "equipment") return isMotor ? 0 : getCarEquipmentAmount(q, mv, false);
  if (itemId === "authorizedWorkshop") return flowType === "carComp" ? mv + getCarEquipmentAmount(q, mv) : 0;
  if (itemId === "srcc" || itemId === "ts" || itemId === "flood" || itemId === "quake") {
    return isMotor ? mv : mv + getCarEquipmentAmount(q, mv);
  }
  return 0;
}
function getVehicleExtensionCoverageText(flowType: FlowType, q: any, itemId: string) {
  if (!["tpl", "driverPa", "passengerPa"].includes(itemId)) return "";
  const amount = getVehicleExtensionCoverageAmount(flowType, q, itemId);
  return amount > 0 ? formatRupiah(amount) : "";
}
function getPassengerSeatsValue(q: any) {
  return String(q.extensions.passengerPa?.seats || DEFAULT_CAR_PASSENGER_SEATS);
}
function addOneYear(dateStr: string) {
  if (!dateStr) return "";
  const x = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(x.getTime())) return "";
  x.setFullYear(x.getFullYear() + 1);
  return x.toISOString().slice(0, 10);
}
function getStampDuty(netPremium: number) {
  if (Number(netPremium) <= 0) return 0;
  return netPremium > 5000000 ? 20000 : 10000;
}
function isYearEligible(flowType: FlowType, year: string) {
  if (!year) return true;
  const y = Number(year);
  if (Number.isNaN(y)) return false;
  if (flowType === "carComp") return y >= MIN_YEAR_COMP;
  return y >= MIN_YEAR_TLO;
}
function yearLimitText(flowType: FlowType) {
  return flowType === "carComp"
    ? `Maksimum usia kendaraan untuk Comprehensive adalah 15 tahun (tahun pembuatan minimum ${MIN_YEAR_COMP}).`
    : `Maksimum usia kendaraan untuk TLO adalah 20 tahun (tahun pembuatan minimum ${MIN_YEAR_TLO}).`;
}
function getExtensionDisplayFee(flowType: FlowType, q: any, itemId: string) {
  const mv = Math.max(0, Number(q.marketValue) || 0);
  const region = getRegion(q.plateRegion);
  const isMotor = flowType === "motor";
  const equipmentAmount = !isMotor ? getCarEquipmentAmount(q, mv) : 0;
  const insuredValue = mv + equipmentAmount;
  if (itemId === "tpl") {
    if (isMotor) {
      const amount = getVehicleExtensionCoverageAmount(flowType, q, "tpl");
      return progressiveTPL(amount, "Angkutan Penumpang");
    }
    const amount = getCarTplCoverageAmount(q, mv, DEFAULT_CAR_TPL_AMOUNT);
    return computeCarTplFee(amount, q.vehicleType || "Angkutan Penumpang");
  }
  if (!mv) return 0;
  if (itemId === "srcc") return Math.round((isMotor ? mv : insuredValue) * (flowType === "carComp" ? SRCC_RATE_COMP : SRCC_RATE_TLO));
  if (itemId === "ts") return Math.round((isMotor ? mv : insuredValue) * (flowType === "carComp" ? TS_RATE_COMP : TS_RATE_TLO));
  if (itemId === "flood") {
    const rates = flowType === "carComp" ? FLOOD_RATES_COMP : FLOOD_RATES_TLO;
    return Math.round((isMotor ? mv : insuredValue) * rates[region as 1 | 2 | 3].min);
  }
  if (itemId === "quake") {
    const rates = flowType === "carComp" ? QUAKE_RATES_COMP : QUAKE_RATES_TLO;
    return Math.round((isMotor ? mv : insuredValue) * rates[region as 1 | 2 | 3].min);
  }
  if (isMotor) return 0;
  if (itemId === "driverPa") {
    const amount = getCarPaCoverageAmount(q, "driverPa", mv, DEFAULT_CAR_PA_AMOUNT);
    return Math.round(amount * DRIVER_PA_RATE);
  }
  if (itemId === "passengerPa") {
    const amount = getCarPaCoverageAmount(q, "passengerPa", mv, DEFAULT_CAR_PA_AMOUNT);
    const seats = Math.min(7, Math.max(1, Number(q.extensions.passengerPa.seats || DEFAULT_CAR_PASSENGER_SEATS) || Number(DEFAULT_CAR_PASSENGER_SEATS)));
    return Math.round(amount * PASSENGER_PA_RATE * seats);
  }
  if (itemId === "equipment") {
    const baseRate = flowType === "carComp"
      ? getCarCompBaseRate(region, q.vehicleType || "Angkutan Penumpang", mv)
      : getCarTloBaseRate(region, q.vehicleType || "Angkutan Penumpang", mv);
    return Math.round(equipmentAmount * baseRate);
  }
  if (itemId === "authorizedWorkshop") return flowType === "carComp" ? Math.round(insuredValue * AUTH_WORKSHOP_RATE) : 0;
  return 0;
}

function calcMotor(q: any) {
  const mv = Math.max(0, Number(q.marketValue) || 0);
  const region = getRegion(q.plateRegion);
  const mainPremium = Math.round(mv * TLO_RATES_MOTOR[region as 1 | 2 | 3].min);
  const details = {
    tplFee: q.extensions.tpl.enabled ? progressiveTPL(getVehicleExtensionCoverageAmount("motor", q, "tpl"), "Angkutan Penumpang") : 0,
    srccFee: q.extensions.srcc.enabled ? Math.round(mv * SRCC_RATE_TLO) : 0,
    tsFee: q.extensions.ts.enabled ? Math.round(mv * TS_RATE_TLO) : 0,
    floodFee: q.extensions.flood.enabled ? Math.round(mv * FLOOD_RATES_TLO[region as 1 | 2 | 3].min) : 0,
    quakeFee: q.extensions.quake.enabled ? Math.round(mv * QUAKE_RATES_TLO[region as 1 | 2 | 3].min) : 0,
  };
  const extensionTotal = Object.values(details).reduce((a, b) => a + Number(b), 0);
  const netPremium = mainPremium + extensionTotal;
  const stamp = getStampDuty(netPremium);
  return { mainPremium, extensionTotal, stamp, total: netPremium + stamp, details, status: mv <= 50000000 && Number(q.year) >= 2018 ? "Straight Through" : "Need Review" };
}

function calcCarShared(
  q: any,
  mv: number,
  region: number,
  category: number,
  mainPremium: number,
  srccRate = SRCC_RATE_TLO,
  tsRate = TS_RATE_TLO,
  floodRates = FLOOD_RATES_TLO,
  quakeRates = QUAKE_RATES_TLO,
  equipmentRate = 0,
  includeAuthorizedWorkshop = false
) {
  const equipmentCap = getCarEquipmentCap(mv);
  const equipmentAmount = getCarEquipmentAmount(q, mv);
  const insuredValue = mv + equipmentAmount;
  const driverPaAmount = q.extensions.driverPa?.enabled ? getCarPaCoverageAmount(q, "driverPa", mv, DEFAULT_CAR_PA_AMOUNT) : 0;
  const passengerPaAmount = q.extensions.passengerPa?.enabled ? getCarPaCoverageAmount(q, "passengerPa", mv, DEFAULT_CAR_PA_AMOUNT) : 0;
  const passengerSeats = Math.min(7, Math.max(1, Number(q.extensions.passengerPa.seats || DEFAULT_CAR_PASSENGER_SEATS) || Number(DEFAULT_CAR_PASSENGER_SEATS)));
  const details = {
    tplFee: q.extensions.tpl.enabled ? computeCarTplFee(getCarTplCoverageAmount(q, mv), q.vehicleType) : 0,
    srccFee: q.extensions.srcc.enabled ? Math.round(insuredValue * srccRate) : 0,
    tsFee: q.extensions.ts.enabled ? Math.round(insuredValue * tsRate) : 0,
    floodFee: q.extensions.flood.enabled ? Math.round(insuredValue * floodRates[region as 1 | 2 | 3].min) : 0,
    quakeFee: q.extensions.quake.enabled ? Math.round(insuredValue * quakeRates[region as 1 | 2 | 3].min) : 0,
    driverPaFee: q.extensions.driverPa?.enabled ? Math.round(driverPaAmount * DRIVER_PA_RATE) : 0,
    passengerPaFee: q.extensions.passengerPa?.enabled ? Math.round(passengerPaAmount * PASSENGER_PA_RATE * passengerSeats) : 0,
    equipmentFee: q.extensions.equipment?.enabled ? Math.round(equipmentAmount * equipmentRate) : 0,
    authWorkshopFee: includeAuthorizedWorkshop && q.extensions.authorizedWorkshop?.enabled ? Math.round((mv + equipmentAmount) * AUTH_WORKSHOP_RATE) : 0,
    equipmentCap,
    insuredValue,
  };
  const extensionTotal = Object.entries(details).filter(([k]) => !["equipmentCap", "insuredValue"].includes(k)).reduce((a, [, b]) => a + Number(b), 0);
  const netPremium = mainPremium + extensionTotal;
  const stamp = getStampDuty(netPremium);
  return {
    mainPremium,
    extensionTotal,
    stamp,
    total: netPremium + stamp,
    details,
    categoryLabel: category <= 5 ? getCategoryLabel(category) : category === 6 ? "Kategori 6 - Truk & Pickup" : "Kategori 7 - Bus",
    status: q.usage === "Komersial" ? "Need Review" : "Straight Through",
  };
}

function calcCarTlo(q: any) {
  const mv = Math.max(0, Number(q.marketValue) || 0);
  const region = getRegion(q.plateRegion);
  if (!q.vehicleType) return { mainPremium: 0, extensionTotal: 0, stamp: 0, total: 0, details: { tplFee: 0, srccFee: 0, tsFee: 0, floodFee: 0, quakeFee: 0, driverPaFee: 0, passengerPaFee: 0, equipmentFee: 0, authWorkshopFee: 0, equipmentCap: 0 }, categoryLabel: "-", status: "Isi Data" };
  const vehicleCategory = getCarCategory(q.vehicleType);
  if (vehicleCategory === "Angkutan Penumpang") {
    const category = getCategory(mv);
    const baseRate = TLO_RATES_CAR[region as 1 | 2 | 3][category as 1 | 2 | 3 | 4 | 5].min;
    return calcCarShared(q, mv, region, category, Math.round(mv * baseRate), SRCC_RATE_TLO, TS_RATE_TLO, FLOOD_RATES_TLO, QUAKE_RATES_TLO, baseRate);
  }
  if (vehicleCategory === "Angkutan Barang") {
    const baseRate = region === 1 ? 0.0088 : region === 2 ? 0.0168 : 0.0081;
    return calcCarShared(q, mv, region, 6, Math.round(mv * baseRate), SRCC_RATE_TLO, TS_RATE_TLO, FLOOD_RATES_TLO, QUAKE_RATES_TLO, baseRate);
  }
  const baseRate = region === 1 ? 0.0023 : region === 2 ? 0.0023 : 0.0018;
  return calcCarShared(q, mv, region, 7, Math.round(mv * baseRate), SRCC_RATE_TLO, TS_RATE_TLO, FLOOD_RATES_TLO, QUAKE_RATES_TLO, baseRate);
}

function getCarCompAgeLoadingYears(year: string | number) {
  const vehicleYear = Number(year || CURRENT_YEAR);
  if (Number.isNaN(vehicleYear)) return 0;
  return Math.max(0, CURRENT_YEAR - vehicleYear - 5);
}

function getCarCompLoadingDeductibleAmount(vehicleType: string) {
  const vehicleCategory = getCarCategory(vehicleType);
  return vehicleCategory === "Angkutan Penumpang"
    ? CAR_COMP_LOADING_DEDUCTIBLE_AMOUNT_CATEGORY_1_5
    : CAR_COMP_LOADING_DEDUCTIBLE_AMOUNT_CATEGORY_6_7;
}

function getCarCompStandardDeductibleAmount(vehicleType: string) {
  return getCarCategory(vehicleType) === "Angkutan Penumpang" ? 300000 : 500000;
}

function usesCarCompLoadingDeductibleSubstitution(q: any) {
  const requiredDeductible = getCarCompLoadingDeductibleAmount(q?.vehicleType || "");
  return getCarCompAgeLoadingYears(q?.year) > 0
    && Number(q?.mainDeductibleOverrideAmount || 0) >= requiredDeductible;
}

function calcCarComp(q: any) {
  const mv = Math.max(0, Number(q.marketValue) || 0);
  const region = getRegion(q.plateRegion);
  if (!q.vehicleType) return { mainPremium: 0, extensionTotal: 0, stamp: 0, total: 0, details: { tplFee: 0, srccFee: 0, tsFee: 0, floodFee: 0, quakeFee: 0, driverPaFee: 0, passengerPaFee: 0, equipmentFee: 0, authWorkshopFee: 0, equipmentCap: 0 }, categoryLabel: "-", status: "Isi Data", baseMainPremium: 0, ageLoadingAmount: 0, standardAgeLoadingAmount: 0, ageLoadingYears: 0, ageLoadingDeductibleSubstituted: false };
  let category = 0;
  let baseMainPremium = 0;
  const vehicleCategory = getCarCategory(q.vehicleType);
  if (vehicleCategory === "Angkutan Penumpang") {
    category = getCategory(mv);
    baseMainPremium = Math.round(mv * COMP_RATES_CAR[region as 1 | 2 | 3][category as 1 | 2 | 3 | 4 | 5].min);
  } else if (vehicleCategory === "Angkutan Barang") {
    category = 6;
    baseMainPremium = Math.round(mv * (region === 1 ? 0.0242 : region === 2 ? 0.0239 : 0.0223));
  } else {
    category = 7;
    baseMainPremium = Math.round(mv * (region === 1 ? 0.0104 : region === 2 ? 0.0104 : 0.0088));
  }
  const ageLoadingYears = getCarCompAgeLoadingYears(q.year);
  const standardAgeLoadingAmount = Math.round(baseMainPremium * ageLoadingYears * 0.05);
  const ageLoadingDeductibleSubstituted = usesCarCompLoadingDeductibleSubstitution(q);
  const ageLoadingAmount = ageLoadingDeductibleSubstituted ? 0 : standardAgeLoadingAmount;
  const commercialLoadingAmount = q.usage === "Komersial" ? Math.round(baseMainPremium * COMMERCIAL_CASCO_LOADING_RATE) : 0;
  const mainPremium = baseMainPremium + ageLoadingAmount + commercialLoadingAmount;
  const equipmentRate = mv ? mainPremium / mv : 0;
  const res = calcCarShared(q, mv, region, category, mainPremium, SRCC_RATE_COMP, TS_RATE_COMP, FLOOD_RATES_COMP, QUAKE_RATES_COMP, equipmentRate, true) as any;
  res.baseMainPremium = baseMainPremium;
  res.ageLoadingAmount = ageLoadingAmount;
  res.standardAgeLoadingAmount = standardAgeLoadingAmount;
  res.commercialLoadingAmount = commercialLoadingAmount;
  res.ageLoadingYears = ageLoadingYears;
  res.ageLoadingDeductibleSubstituted = ageLoadingDeductibleSubstituted;
  return res;
}

function deductibleText(flowType: FlowType, vehicleType: string, itemId: string) {
  if (flowType === "motor") {
    if (itemId === "main") return "Rp150.000.";
  if (itemId === "tpl") return "Tanpa risiko sendiri saat klaim.";
    if (itemId === "srcc" || itemId === "ts") return "10% dari nilai yang disetujui, paling sedikit Rp500.000,- per kejadian.";
    if (itemId === "flood" || itemId === "quake") return "10% dari nilai kerugian, minimum Rp500.000,-- untuk setiap kejadian.";
    return "";
  }
  if (itemId === "main") return getCarCategory(vehicleType) === "Angkutan Penumpang" ? "Rp300.000." : "Rp500.000.";
  if (itemId === "tpl" || itemId === "driverPa" || itemId === "passengerPa") return "Tanpa risiko sendiri saat klaim.";
  if (itemId === "srcc" || itemId === "ts") return "10% dari nilai yang disetujui, paling sedikit Rp500.000,- per kejadian.";
  if (itemId === "flood" || itemId === "quake") return "10% dari nilai kerugian, minimum Rp500.000,-- untuk setiap kejadian.";
  if (itemId === "equipment") return "Mengikuti ketentuan pertanggungan utama.";
  return "";
}

function mainCoverText(flowType: FlowType) {
  if (flowType === "carComp") {
    return "Menjamin kerugian atau kerusakan pada Kendaraan Bermotor yang secara langsung disebabkan oleh tabrakan, benturan, terbalik, tergelincir, terperosok, perbuatan jahat, pencurian, dan kebakaran, termasuk kebakaran akibat benda lain yang berdekatan, sambaran petir, upaya pemadaman, atau perintah pihak berwenang untuk mencegah menjalarnya kebakaran.";
  }
  if (flowType === "motor") {
    return "Menjamin kerugian total pada sepeda motor yang secara langsung disebabkan oleh tabrakan, benturan, terbalik, tergelincir, terperosok, perbuatan jahat, pencurian, dan kebakaran, apabila biaya perbaikan, penggantian, atau pemulihan mencapai sekurang-kurangnya 75% dari harga sebenarnya sesaat sebelum kejadian. Kehilangan karena pencurian dijamin bila sepeda motor tidak ditemukan dalam waktu 60 hari sejak terjadinya pencurian.";
  }
  return "Menjamin kerugian total pada Kendaraan Bermotor yang secara langsung disebabkan oleh tabrakan, benturan, terbalik, tergelincir, terperosok, perbuatan jahat, pencurian, dan kebakaran, apabila biaya perbaikan, penggantian, atau pemulihan mencapai sekurang-kurangnya 75% dari harga sebenarnya sesaat sebelum kejadian. Kehilangan karena pencurian dijamin bila Kendaraan Bermotor tidak ditemukan dalam waktu 60 hari sejak terjadinya pencurian.";
}

function mainCoverTitle(flowType: FlowType) {
  if (flowType === "carComp") return "Jaminan Utama (Comprehensive)";
  return "Jaminan Utama (TLO)";
}

function getVehiclePhotoTitle(name: string) {
  if (name === "Foto motor dari sudut depan samping") return "Foto Tampak Depan";
  if (name === "Foto salah satu sisi motor secara penuh") return "Foto Samping";
  if (name === "Foto panel speedometer saat kontak ON") return "Foto Panel Speedometer";
  if (name === "Ambil foto bagian depan") return "Depan + plat terlihat";
  if (name === "Ambil foto bagian belakang") return "Belakang + plat terlihat";
  if (name === "Ambil foto bagian samping kanan") return "Sisi kanan penuh";
  if (name === "Ambil foto bagian samping kiri") return "Sisi kiri penuh";
  if (name === "Foto interior dashboard dan odometer") return "Interior/dashboard + odometer";
  if (name === "Foto nomor rangka / VIN") return "Nomor rangka/VIN";
  if (isExistingDamageUploadName(name)) return name.replace(CAR_COMP_EXISTING_DAMAGE_PREFIX, "Foto kerusakan");
  if (isEquipmentPhotoName(name)) return name.replace(CAR_EQUIPMENT_PHOTO_PREFIX, "Foto perlengkapan");
  return "Foto kendaraan";
}

function getVehiclePhotoHelper(name: string) {
  if (name === "Ambil foto bagian depan") return "Pastikan bagian depan kendaraan dan plat nomor terlihat jelas.";
  if (name === "Ambil foto bagian belakang") return "Pastikan bagian belakang kendaraan dan plat nomor terlihat jelas.";
  if (name === "Ambil foto bagian samping kanan") return "Ambil kendaraan sisi kanan secara penuh dari ujung depan sampai belakang.";
  if (name === "Ambil foto bagian samping kiri") return "Ambil kendaraan sisi kiri secara penuh dari ujung depan sampai belakang.";
  if (name === "Foto interior dashboard dan odometer") return "Pastikan dashboard dan angka odometer/kilometer terlihat jelas.";
  if (name === "Foto nomor rangka / VIN") return "Ambil area nomor rangka/VIN kendaraan bila dapat diakses dengan aman.";
  if (isExistingDamageUploadName(name)) return "Ambil foto area kerusakan dengan jelas. Anda bisa menambahkan lebih dari satu foto.";
  if (isEquipmentPhotoName(name)) return "Ambil foto perlengkapan non-standar yang ingin dicatat atau dijamin.";
  return "Wajib diisi.";
}

function createVehiclePhotoMetadata(name: string, declaredAddress: string) {
  return createPhotoEvidence({
    label: getVehiclePhotoTitle(name),
    declaredAddress,
  });
}

function secondaryMainCoverText(flowType: FlowType) {
  return "Menjamin kehilangan kendaraan karena pencurian bila kendaraan tidak ditemukan dalam 60 hari.";
}

function mainDeductibleText(flowType: FlowType, vehicleType: string, quote?: any) {
  if (flowType === "motor") return "Kerugian total: Rp150.000. Kehilangan karena pencurian: 5% dari harga pertanggungan.";
  if (flowType === "carTlo") {
    return getCarCategory(vehicleType) === "Angkutan Penumpang"
      ? "Kerugian total: Rp300.000. Kehilangan karena pencurian: 5% dari harga pertanggungan."
      : "Kerugian total: Rp500.000. Kehilangan karena pencurian: 5% dari harga pertanggungan.";
  }
  if (usesCarCompLoadingDeductibleSubstitution(quote)) {
    const deductibleAmount = Math.max(
      getCarCompLoadingDeductibleAmount(vehicleType),
      Number(quote?.mainDeductibleOverrideAmount || 0),
    );
    return `Kerugian sebagian dan kerugian total: ${formatRupiah(deductibleAmount)} per kejadian. Kehilangan karena pencurian: 5% dari harga pertanggungan.`;
  }
  return getCarCategory(vehicleType) === "Angkutan Penumpang"
    ? "Kerugian sebagian dan kerugian total: Rp300.000 per kejadian. Kehilangan karena pencurian: 5% dari harga pertanggungan."
    : "Kerugian sebagian dan kerugian total: Rp500.000 per kejadian. Kehilangan karena pencurian: 5% dari harga pertanggungan.";
}

function vehicleDeductibleIsDirectText(value: string) {
  const text = String(value || "").trim().toLowerCase();
  return ["tanpa risiko sendiri", "tidak dikenakan risiko sendiri", "tidak ada risiko sendiri"].some((token) => text.startsWith(token));
}

function VehicleGuaranteeDetailCard({
  title,
  icon: Icon = Shield,
  premium,
  detail,
  deductible,
  coverageAmount,
}: {
  title: string;
  icon?: any;
  premium: string;
  detail: string;
  deductible?: string;
  coverageAmount?: string;
}) {
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
          {coverageAmount ? (
            <div className="mb-2 text-[12px] leading-5 text-slate-600">
              <span className="font-medium text-slate-700">Nilai pertanggungan: </span>
              <span>{coverageAmount}</span>
            </div>
          ) : null}
          <div className="whitespace-pre-line text-[12.5px] leading-5 text-slate-700">{detail}</div>
          {deductible ? (
            <div className="mt-2 text-[12px] leading-5 text-slate-600">
              {vehicleDeductibleIsDirectText(deductible) ? (
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

function secondaryCoverTitle(flowType: FlowType) {
  return "Risiko Kehilangan";
}

function secondaryDeductibleText(flowType: FlowType) {
  return "5% dari Harga Pertanggungan.";
}

function getMainPremiumSplit(flowType: FlowType, calc: any) {
  if (!calc) return { ownDamage: 0, theft: 0 };
  if (flowType === "carComp") return { ownDamage: calc.mainPremium, theft: 0 };
  const theft = Math.round(calc.mainPremium * 0.5);
  const ownDamage = calc.mainPremium - theft;
  return { ownDamage, theft };
}

function HelpDot({ text }: { text: string }) {
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
        aria-label="Lihat penjelasan"
        aria-expanded={open}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 bg-white text-[10px] font-bold text-slate-500"
      >
        i
      </button>
      {open ? (
        <span className="absolute left-0 top-6 z-40 w-72 whitespace-pre-line rounded-xl bg-slate-900 px-3 py-2 text-xs leading-5 text-white shadow-xl">
          {text}
        </span>
      ) : null}
    </span>
  );
}

function FieldLabel({ label, required = true, helpText, compact = false }: { label: string; required?: boolean; helpText?: string; compact?: boolean }) {
  return (
    <div className={cls("flex items-center gap-2", compact ? "mb-1" : "mb-1.5")}>
      <label className={cls(compact ? "text-[12px]" : "text-[13px]", "font-semibold text-slate-800")}>
        {label}
        {required ? <span className="text-[#F5A623]"> *</span> : null}
      </label>
      {helpText ? <HelpDot text={helpText} /> : null}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, icon, type = "text", readOnly = false, listId, inputMode }: any) {
  return (
    <div className="relative">
      {icon ? <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div> : null}
      <input
        list={listId}
        type={type}
        value={value}
        readOnly={readOnly}
        inputMode={inputMode}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={cls(
          "h-[44px] w-full rounded-[8px] border border-[#D5DDE6] bg-white px-3.5 text-[14px] text-slate-800 outline-none transition placeholder:text-slate-500",
          "focus:border-[#0A4D82] focus:ring-4 focus:ring-[#0A4D82]/10",
          icon && "pl-10",
          readOnly && "bg-slate-50"
        )}
      />
    </div>
  );
}

function CurrencyAmountInput({ value, onCommit, min = 0, max = Number.MAX_SAFE_INTEGER, placeholder }: any) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const numericValue = Math.max(0, Number(value || 0) || 0);
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(numericValue > 0 ? formatRupiah(numericValue) : "");

  useEffect(() => {
    if (!focused) setDraft(numericValue > 0 ? formatRupiah(numericValue) : "");
  }, [focused, numericValue]);

  const commitDraft = () => {
    const raw = Number(digitsOnly(draft)) || 0;
    const next = clampCoverageInputAmount(raw, Number(min) || 0, Number(max) || Number.MAX_SAFE_INTEGER, Number(min) || 0);
    onCommit?.(next);
    setFocused(false);
    setDraft(next > 0 ? formatRupiah(next) : "");
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={focused ? draft : numericValue > 0 ? formatRupiah(numericValue) : ""}
        inputMode="numeric"
        onFocus={() => {
          setFocused(true);
          window.setTimeout(() => inputRef.current?.select(), 0);
        }}
        onClick={(event) => event.currentTarget.select()}
        onMouseUp={(event) => event.preventDefault()}
        onChange={(event) => setDraft(digitsOnly(event.target.value))}
        onBlur={commitDraft}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commitDraft();
          }
          if (event.key === "Escape") {
            setFocused(false);
            setDraft(numericValue > 0 ? formatRupiah(numericValue) : "");
            inputRef.current?.blur();
          }
        }}
        placeholder={placeholder}
        className="h-[44px] w-full rounded-[8px] border border-[#D5DDE6] bg-white px-3.5 text-[14px] text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-[#0A4D82] focus:ring-4 focus:ring-[#0A4D82]/10"
      />
    </div>
  );
}

function SelectInput({ value, onChange, options, placeholder = "Pilih opsi yang sesuai" }: any) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={cls("h-[44px] w-full appearance-none rounded-[8px] border border-[#D5DDE6] bg-white px-3.5 pr-10 text-[14px] outline-none transition focus:border-[#0A4D82] focus:ring-4 focus:ring-[#0A4D82]/10", value ? "text-slate-800" : "text-slate-500")}>
        <option value="" disabled hidden>{placeholder}</option>
        {options.map((option: string) => <option key={option} value={option}>{option}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function VehicleAutocomplete({
  value,
  onChange,
  onSelect,
  catalogType,
  placeholder,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onSelect: (item: VehicleCatalogItem) => void;
  catalogType: "motor" | "car";
  placeholder: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const deferredValue = useDeferredValue(value);
  const suggestions = useMemo(
    () => findVehicleSuggestions(catalogType, deferredValue, 8),
    [catalogType, deferredValue],
  );

  return (
    <div className="relative">
      <div className="relative">
        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={value}
          disabled={disabled}
          onFocus={() => {
            if (!disabled) setOpen(true);
          }}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 120);
          }}
          onChange={(event) => {
            onChange(event.target.value);
            if (!open) setOpen(true);
          }}
          placeholder={placeholder}
          className={cls(
            "h-[44px] w-full rounded-[8px] border border-[#D5DDE6] bg-white px-3.5 pl-10 pr-10 text-[14px] text-slate-800 outline-none transition placeholder:text-slate-500",
            "focus:border-[#0A4D82] focus:ring-4 focus:ring-[#0A4D82]/10",
            disabled && "cursor-not-allowed bg-slate-50 text-slate-500",
          )}
        />
        {value ? (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Kosongkan pilihan kendaraan"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {!disabled && open ? (
        <div className="absolute inset-x-0 z-30 mt-2 overflow-hidden rounded-2xl border border-[#D8E1EA] bg-white shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
          {suggestions.length ? (
            <div className="max-h-72 overflow-y-auto">
              {suggestions.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    startTransition(() => onSelect(item));
                    setOpen(false);
                  }}
                  className={cls(
                    "flex w-full flex-col items-start gap-1 px-4 py-3 text-left transition hover:bg-[#F8FBFE]",
                    index > 0 && "border-t border-slate-100",
                  )}
                >
                  <div className="flex w-full items-start justify-between gap-3">
                    <div className="text-sm font-semibold text-slate-900">{item.label}</div>
                  </div>
                  <div className="text-xs leading-5 text-slate-500">
                    {item.ojkCategory}
                    {item.bodyType ? ` · ${item.bodyType}` : ""}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-slate-500">
              Belum ada dummy data yang cocok. Coba ketik merek atau tipe lain.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-slate-100 py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="max-w-full break-words text-left text-sm text-slate-900 sm:max-w-[60%] sm:text-right">{value || "-"}</div>
    </div>
  );
}

function StepNode({ step, title, subtitle, active, done, icon, onClick }: any) {
  const content = (
    <>
      <div
        className={cls(
          "flex h-9 w-9 items-center justify-center rounded-full border-2 bg-white md:h-10 md:w-10",
          done ? "border-green-600 text-green-600" : active ? "border-[#0A4D82] text-[#0A4D82]" : "border-slate-300 text-slate-300",
        )}
      >
        {done ? <CheckCircle2 className="h-4 w-4" /> : icon}
      </div>
      <div className="mt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400 md:text-[10px] md:tracking-[0.16em]">{step}</div>
      <div className={cls("mt-0.5 text-[13px] font-bold md:text-[14px]", active || done ? "text-slate-900" : "text-slate-500")}>{title}</div>
      <div className={cls("mt-0.5 text-[11px] md:text-[12px]", active ? "text-[#E8A436]" : done ? "text-green-600" : "text-slate-400")}>{subtitle}</div>
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="relative flex flex-1 flex-col items-center text-center">
        {content}
      </button>
    );
  }
  return <div className="relative flex flex-1 flex-col items-center text-center">{content}</div>;
}

function ProductCard({ item, onClick }: any) {
  return (
    <button type="button" onClick={onClick} className={`group relative h-[260px] overflow-hidden rounded-xl bg-gradient-to-br ${item.gradient} text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute left-3 top-3 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">{item.category}</div>
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <div className="text-[26px] font-bold leading-none">{item.title}</div>
        <div className="mt-1.5 text-sm text-white/85">{item.subtitle}</div>
      </div>
    </button>
  );
}

function ActionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cls("rounded-2xl border border-[#D8E1EA] bg-white p-4 shadow-sm md:p-5", className)}>{children}</div>;
}

function SectionCard({
  title,
  subtitle,
  children,
  action,
  headerAlign = "left",
  className = "",
  compactHeader = false,
  heroHeader = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  headerAlign?: "left" | "center";
  className?: string;
  compactHeader?: boolean;
  heroHeader?: boolean;
}) {
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

function OfferSummarySection({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
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

function SummaryEditButton({ onClick }: { onClick: () => void }) {
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

function OfferSummaryKeyValue({ label, value }: { label: string; value: React.ReactNode }) {
  const normalizedLabel = String(label || "").replace(/:\s*$/, "");
  const normalizedValue = typeof value === "string" ? value.trim() : value;
  if (!normalizedValue || normalizedValue === "-" || normalizedValue === "") return null;
  return (
    <div className="border-t border-slate-100 py-2 first:border-t-0 first:pt-0 last:pb-0">
      <div className="space-y-1 md:grid md:grid-cols-[170px_10px_minmax(0,1fr)] md:gap-x-1.5 md:space-y-0">
        <div className="text-[12px] font-normal leading-[1.4] text-slate-500">
          {normalizedLabel}
          <span className="md:hidden">:</span>
        </div>
        <div className="hidden text-[12px] font-normal leading-[1.4] tracking-[0.08em] text-slate-400 md:block">:</div>
        <div className="text-[14px] font-normal leading-[1.45] text-slate-900">{value}</div>
      </div>
    </div>
  );
}

function SummaryGuaranteeItem({ title, icon: Icon = Shield, compact = false }: { title: string; icon?: any; compact?: boolean }) {
  return (
    <div className={cls("flex items-start", compact ? "gap-2" : "gap-2.5")}>
      <div className={cls("mt-0.5 flex shrink-0 items-center justify-center border border-[#D6E0EA] bg-[#F8FBFE] text-[#0A4D82]", compact ? "h-6 w-6 rounded-md" : "h-7 w-7 rounded-lg")}>
        <Icon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </div>
      <div className={cls("min-w-0 text-slate-900", compact ? "text-[14px] leading-[1.35]" : "text-[15px] leading-[1.45]")}>{title}</div>
    </div>
  );
}

function PreviewGuaranteeOption({
  title,
  icon: Icon = Shield,
  premium,
  checked,
  expanded,
  onToggleChecked,
  onToggleExpand,
  detail,
  deductible,
  coverageAmount,
}: {
  title: string;
  icon?: any;
  premium: string;
  checked: boolean;
  expanded: boolean;
  onToggleChecked: () => void;
  onToggleExpand: () => void;
  detail?: string;
  deductible?: string;
  coverageAmount?: string;
}) {
  return (
    <div
      className={cls(
        "group relative overflow-hidden rounded-xl border px-3 py-2.5 transition-all duration-200",
        checked
          ? "border-[#AFCFEA] bg-[linear-gradient(180deg,#FFFFFF_0%,#F4FAFF_100%)] shadow-[0_12px_26px_rgba(10,77,130,0.10)]"
          : "border-slate-200 bg-white hover:border-[#C8D9EA] hover:bg-[#FBFDFF] hover:shadow-[0_8px_18px_rgba(15,23,42,0.05)]",
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
              : "border-[#CAD6E3] bg-white text-transparent hover:border-[#9DB8D4]",
          )}
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <button type="button" onClick={onToggleChecked} className="min-w-0 flex-1 text-left">
              <SummaryGuaranteeItem title={title} icon={Icon} compact />
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
              {vehicleDeductibleIsDirectText(deductible) ? (
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

function ConsentModal({ open, agreed, onClose, onAgree }: any) {
  if (!open) return null;
      return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4"><div className="w-full max-w-2xl rounded-[28px] bg-white shadow-[0_32px_80px_rgba(15,23,42,0.24)]"><div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5"><div><div className="text-[20px] font-bold tracking-tight text-slate-900">Syarat dan Ketentuan Persetujuan</div><div className="mt-1 text-sm leading-6 text-slate-500">Dengan melanjutkan proses ini, Anda menyatakan telah membaca dan memahami poin persetujuan atas SPAU elektronik ini.</div></div><button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"><X className="h-5 w-5" /></button></div><div className="max-h-[60vh] space-y-4 overflow-y-auto px-6 py-5"><div className="rounded-2xl border border-[#D8E1EA] bg-[linear-gradient(180deg,#FBFDFF_0%,#F5F9FD_100%)] p-4"><ol className="space-y-4">{CONSENT_SECTIONS.map((section, index) => <li key={section.key} className="flex items-start gap-3"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#C9D8E8] bg-white text-[13px] font-semibold text-[#0A4D82]">{index + 1}</div><div className="min-w-0"><div className="text-[14px] font-semibold text-slate-900">{section.title}</div><div className="mt-1 space-y-2 text-[13px] leading-[1.75] text-slate-600" style={{ textAlign: "justify" }}>{(section.detailLines || []).map((line: string, lineIndex: number) => <div key={`${section.key}-line-${lineIndex}`}><span>{normalizeConsentTextLine(line)}</span>{lineIndex === (section.detailLines || []).length - 1 && section.detailLinkHref ? <><span> </span><a href={section.detailLinkHref} target="_blank" rel="noreferrer" className="font-medium text-[#0A4D82] underline underline-offset-2 hover:text-[#0D5B98]">{section.detailLinkLabel || section.detailLinkHref}</a></> : null}</div>)}</div></div></li>)}</ol></div></div><div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"><div className="text-sm leading-6 text-slate-500">Silakan setujui jika isi persetujuan ini sudah sesuai.</div><div className="flex items-center gap-3"><button type="button" onClick={onClose} className="inline-flex h-11 items-center justify-center rounded-[12px] border border-slate-200 px-5 text-sm font-medium text-slate-700 hover:bg-slate-50">Tutup</button><button type="button" onClick={onAgree} className="inline-flex h-11 items-center justify-center rounded-[12px] bg-[#0A4D82] px-5 text-sm font-semibold text-white hover:brightness-105">{agreed ? "Sudah Disetujui" : "Saya Setuju"}</button></div></div></div></div>;
}
function PaymentInfoButton({ title, description, onClick }: any) {
  return <button type="button" onClick={onClick} className="rounded-xl border border-[#D5DDE6] bg-white px-4 py-3 text-left hover:bg-slate-50"><div className="text-sm font-semibold text-slate-900">{title}</div><div className="mt-1 text-xs leading-5 text-slate-500">{description}</div></button>;
}
function PaymentInfoPanel({ title, children }: any) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4"><div className="text-sm font-semibold text-slate-900">{title}</div><div className="mt-2 text-sm leading-6 text-slate-600">{children}</div></div>;
}

function AccordionRiskRow({
  title,
  premium,
  summary,
  detail,
  deductible,
  coverageAmount,
  checked,
  onToggleChecked,
  expanded,
  onToggleExpand,
  alwaysIncluded = false,
  readOnly = false,
  extra,
  itemIcon,
}: any) {
  const Icon = itemIcon || Shield;
  return (
    <div className="rounded-xl border border-[#C9D5E3] bg-[#F8FBFE]">
      <div className="flex items-center gap-3 px-3.5 py-3">
        {alwaysIncluded || readOnly ? (
          <div className="flex h-5 w-5 items-center justify-center rounded border border-[#0A4D82] bg-[#0A4D82]/10 text-[#0A4D82]">
            {React.createElement(alwaysIncluded ? Shield : Icon, { className: "h-3.5 w-3.5" })}
          </div>
        ) : (
          <input type="checkbox" checked={checked} onChange={onToggleChecked} className="h-5 w-5 rounded border-slate-300 text-[#0A4D82] focus:ring-[#0A4D82]" />
        )}
        <button type="button" onClick={onToggleExpand} className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[#0A4D82]">
              {!alwaysIncluded && !readOnly && itemIcon ? React.createElement(itemIcon, { className: "h-4 w-4 shrink-0" }) : null}
              <div className="truncate text-[14px] font-medium leading-[1.35]">{title}</div>
            </div>
            <div className="mt-0.5 text-[12px] font-normal text-slate-500">Premi: {premium}</div>
            {coverageAmount ? <div className="mt-0.5 text-[12px] font-normal text-slate-500">Nilai pertanggungan: {coverageAmount}</div> : null}
          </div>
          <ChevronDown className={cls("h-4 w-4 shrink-0 text-slate-500 transition", expanded && "rotate-180")} />
        </button>
      </div>
      {expanded ? (
        <div className="border-t border-[#D6E0EA] px-3.5 py-3">
          <div className="whitespace-pre-line text-[12.5px] leading-5 text-slate-700">{summary}</div>
              {deductible ? <div className="mt-2 text-[12px] leading-5 text-slate-600">{vehicleDeductibleIsDirectText(deductible) ? deductible : <><span className="font-medium text-slate-700">Risiko sendiri saat klaim:</span> {deductible}</>}</div> : null}
          {detail ? <div className="mt-2 whitespace-pre-line text-[12px] leading-5 text-slate-500">{detail}</div> : null}
          {extra ? (
            <div className="mt-3 rounded-xl border border-[#D8E1EA] bg-white/85 p-3">
              {extra}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function MotorLatestExact({
  onExit,
  sessionName = "Dita (External)",
  sessionProfile = null,
  initialFlow = "motor",
  entryMode = "external",
  operatingRecord = null,
  onOperatingSignal = () => {},
  accountMenuItems = [],
}: {
  onExit?: () => void;
  sessionName?: string;
  sessionProfile?: any;
  initialFlow?: FlowType;
  entryMode?: EntryMode;
  operatingRecord?: any;
  onOperatingSignal?: (signal: any) => void;
  accountMenuItems?: Array<{ label: string; onClick: () => void; primary?: boolean }>;
}) {
  const [screen, setScreen] = useState<"catalog" | "flow">("flow");
  const [flowType, setFlowType] = useState<FlowType | null>(initialFlow);
  const [step, setStep] = useState(1);
  const [openCatalog, setOpenCatalog] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({ main: false });
  const [showPremiumDetails, setShowPremiumDetails] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [paymentPanel, setPaymentPanel] = useState("");
  const [checkoutStatus, setCheckoutStatus] = useState("");
  const [journeyStatus, setJourneyStatus] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSentOffers, setShowSentOffers] = useState(false);
  const [showOfferShareModal, setShowOfferShareModal] = useState(false);
  const [shareFeedback, setShareFeedback] = useState("");
  const [viewerMode, setViewerMode] = useState<"internal" | "customer">(entryMode === "internal" ? "internal" : "customer");
  const [viewerMenuOpen, setViewerMenuOpen] = useState(false);
  const [hasSharedOfferJourney, setHasSharedOfferJourney] = useState(false);
  const [flows, setFlows] = useState<Record<FlowType, FlowState>>({
    motor: createFlowState("motor"),
    carComp: createFlowState("carComp"),
    carTlo: createFlowState("carTlo"),
  });
  const [selectedCustomers, setSelectedCustomers] = useState<Record<FlowType, MockCustomer | null>>({
    motor: null,
    carComp: null,
    carTlo: null,
  });
  const [documentChecks, setDocumentChecks] = useState<Record<FlowType, { ktp: any; stnk: any }>>({
    motor: { ktp: createEmptyDocumentCheck("KTP"), stnk: createEmptyDocumentCheck("STNK") },
    carComp: { ktp: createEmptyDocumentCheck("KTP"), stnk: createEmptyDocumentCheck("STNK") },
    carTlo: { ktp: createEmptyDocumentCheck("KTP"), stnk: createEmptyDocumentCheck("STNK") },
  });
  const [sharedPreviewEditing, setSharedPreviewEditing] = useState({ insured: false, vehicle: false });
  const [evidence, setEvidence] = useState<Record<FlowType, Record<string, any>>>({
    motor: {},
    carComp: {},
    carTlo: {},
  });
  const coverageDateFieldRef = useRef<HTMLInputElement | null>(null);
  const operatingSignalRef = useRef(onOperatingSignal);
  const lastAuthoritySignalRef = useRef("");
  const lastFraudSignalRef = useRef("");
  const lastStageSignalRef = useRef("");
  const lastHydratedShareKeyRef = useRef("");

  const currentData = flowType ? flows[flowType] : null;
  const selectedCustomer = flowType ? selectedCustomers[flowType] : null;
  const allowCustomerLookup = entryMode === "internal";
  const currentFlowCustomers = useMemo(() => VEHICLE_MOCK_CIF_BY_FLOW[flowType], [flowType]);
  const customerSuggestions = useMemo(() => {
    if (!flowType || !allowCustomerLookup) return [];
    const keyword = String(flows[flowType].insured.lookup || flows[flowType].insured.fullName || "").trim().toLowerCase();
    if (!keyword) return [];
    return currentFlowCustomers.filter((item) => item.name.toLowerCase().includes(keyword) || item.cif.toLowerCase().includes(keyword)).slice(0, 5);
  }, [allowCustomerLookup, currentFlowCustomers, flowType, flows]);
  const operatingBlockedMessage = paymentBlockMessage(operatingRecord);
  const canProceedPayment = canProceedToPaymentFromOperating(operatingRecord);
  const calc = useMemo(() => {
    if (!flowType) return null;
    if (flowType === "motor") return calcMotor(flows.motor.quote);
    if (flowType === "carComp") return calcCarComp(flows.carComp.quote);
    return calcCarTlo(flows.carTlo.quote);
  }, [flowType, flows]);

  const setAt = (type: FlowType, path: string, value: any) => {
    setFlows((prev) => {
      const copy: any = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let ref = copy[type];
      for (let i = 0; i < parts.length - 1; i += 1) ref = ref[parts[i]];
      ref[parts[parts.length - 1]] = value;
      if (path === "quote.coverageStart") copy[type].quote.coverageEnd = addOneYear(value);
      return copy;
    });
  };

  const openCoverageDatePicker = () => {
    const field = coverageDateFieldRef.current;
    if (!field) return;
    try {
      if (typeof field.showPicker === "function") {
        field.showPicker();
        return;
      }
    } catch {
      // Fallback to click/focus flow when showPicker is unsupported or blocked.
    }
    try {
      field.focus();
      field.click();
    } catch {
      // Ignore browser-specific picker limitations to avoid breaking the page.
    }
  };

  const resolveDemoVehicle = (type: FlowType) => {
    const catalogType = type === "motor" ? "motor" : "car";
    return getVehicleCatalogItem(catalogType, DEMO_MODEL_LABELS[type]) || getVehicleCatalogItems(catalogType)[0] || null;
  };

  const updateVehicleSelection = (type: FlowType, value: string, explicitItem?: VehicleCatalogItem | null) => {
    const catalogType = type === "motor" ? "motor" : "car";
    const matchedItem = explicitItem || getVehicleCatalogItem(catalogType, value);

    setFlows((prev) => {
      const next: any = JSON.parse(JSON.stringify(prev));
      next[type].quote.vehicleName = value;
      next[type].quote.vehicleType = matchedItem?.ojkCategory || "";
      next[type].quote.vehicleFuelType = matchedItem?.fuelType || "";
      next[type].quote.vehicleBodyType = matchedItem?.bodyType || "";
      return next;
    });
  };

  const fillStepOneDemoData = (type: FlowType) => {
    const demoVehicle = resolveDemoVehicle(type);
    if (!demoVehicle) return;
    const demoCustomer = VEHICLE_MOCK_CIF_BY_FLOW[type][0];
    const demoLookupValue = allowCustomerLookup ? `${demoCustomer.name} - ${demoCustomer.cif}` : demoCustomer.name;

    const baseQuoteByFlow: Record<FlowType, { plateRegion: string; year: string; marketValue: string; usage: string }> = {
      motor: {
        plateRegion: "B - Jakarta/Depok/Tangerang/Bekasi",
        year: "2025",
        marketValue: "36500000",
        usage: "Pribadi",
      },
      carComp: {
        plateRegion: "B - Jakarta/Depok/Tangerang/Bekasi",
        year: "2024",
        marketValue: "465000000",
        usage: "Pribadi",
      },
      carTlo: {
        plateRegion: "D - Bandung",
        year: "2023",
        marketValue: "248000000",
        usage: "Pribadi",
      },
    };

    setFlows((prev) => {
      const next: any = JSON.parse(JSON.stringify(prev));
      next[type].quote = {
        ...next[type].quote,
        ...baseQuoteByFlow[type],
        vehicleName: demoVehicle.label,
        vehicleType: demoVehicle.ojkCategory,
        vehicleFuelType: demoVehicle.fuelType,
        vehicleBodyType: demoVehicle.bodyType || "",
      };
      if (isInternalMode) {
        next[type].insured = {
          ...next[type].insured,
          customerType: demoCustomer.type,
          nik: next[type].insured.nik || "3174********0012",
          fullName: demoCustomer.name,
          lookup: demoLookupValue,
          address: next[type].insured.address || "Jl. Kemang Raya No. 18, Jakarta Selatan",
          email: demoCustomer.email,
          phone: demoCustomer.phone,
        };
      } else {
        next[type].insured = {
          ...next[type].insured,
          customerType: demoCustomer.type,
          fullName: demoCustomer.name,
          lookup: demoLookupValue,
          email: demoCustomer.email,
          phone: demoCustomer.phone,
        };
      }
      return next;
    });
    if (isInternalMode) {
      setSelectedCustomers((prev) => ({ ...prev, [type]: demoCustomer }));
    }
  };

  const fillStepTwoDemoData = (type: FlowType) => {
    const demoVehicle = resolveDemoVehicle(type);
    if (!demoVehicle) return;
    const demoCustomer = VEHICLE_MOCK_CIF_BY_FLOW[type][0];
    const demoLookupValue = allowCustomerLookup ? `${demoCustomer.name} - ${demoCustomer.cif}` : demoCustomer.name;

    fillStepOneDemoData(type);

    const vehicleDetailByFlow: Record<FlowType, { plateNumber: string; chassisNumber: string; engineNumber: string; color: string; year: string }> = {
      motor: {
        plateNumber: "B 4123 UYT",
        chassisNumber: "MH1JM8112PK123456",
        engineNumber: "JM81E1234567",
        color: "Hitam",
        year: "2025",
      },
      carComp: {
        plateNumber: "B 1458 NZX",
        chassisNumber: "LGXCE4CB8R1234567",
        engineNumber: "ATTO3EV123456",
        color: "Putih",
        year: "2024",
      },
      carTlo: {
        plateNumber: "D 1724 AQA",
        chassisNumber: "MHKK1BA3JPK123456",
        engineNumber: "2NRFKE7654321",
        color: "Silver",
        year: "2023",
      },
    };

    setFlows((prev) => {
      const next: any = JSON.parse(JSON.stringify(prev));
      next[type].ui.dataMode = "manual";
      next[type].ui.stnkMode = "manual";
      next[type].insured = {
        ...next[type].insured,
        customerType: demoCustomer.type,
        nik: "3174********0012",
        fullName: demoCustomer.name,
        lookup: demoLookupValue,
        address: "Jl. Kemang Raya No. 18, Jakarta Selatan",
        email: demoCustomer.email,
        phone: demoCustomer.phone,
      };
      next[type].vehicle = {
        ...next[type].vehicle,
        ...vehicleDetailByFlow[type],
        contactOnLocation: demoCustomer.name,
      };
      next[type].underwriting = {
        ...next[type].underwriting,
        claimHistory: "Tidak Ada",
        noExistingDamage: type === "carComp" ? true : next[type].underwriting.noExistingDamage,
        existingDamageStatus: type === "carComp" ? "none" : next[type].underwriting.existingDamageStatus,
        existingDamagePhotoCount: 1,
      };
      next[type].quote = {
        ...next[type].quote,
        vehicleName: demoVehicle.label,
        vehicleType: demoVehicle.ojkCategory,
        vehicleFuelType: demoVehicle.fuelType,
        vehicleBodyType: demoVehicle.bodyType || "",
        coverageStart: "2026-05-01",
        coverageEnd: addOneYear("2026-05-01"),
      };
      if (type !== "motor") {
        next[type].quote.extensions.equipment = {
          ...next[type].quote.extensions.equipment,
          enabled: false,
          amount: "",
          status: "none",
          inclusion: "",
          declaredValue: "",
          description: "",
          photoCount: 1,
        };
      }
      next[type].uploads = Object.keys(next[type].uploads).reduce((acc: Record<string, boolean>, key: string) => {
        acc[key] = true;
        return acc;
      }, {});
      return next;
    });
    setSelectedCustomers((prev) => ({ ...prev, [type]: demoCustomer }));

    setEvidence((prev) => {
      const next: any = { ...prev, [type]: { ...prev[type] } };
      Object.keys(flows[type].uploads).forEach((name) => {
        next[type][name] = createVehiclePhotoMetadata(name, "Jl. Kemang Raya No. 18, Jakarta Selatan");
      });
      return next;
    });

  };

  const fillDemoForCurrentStep = () => {
    if (!flowType) return;
    if (step === 1) {
      fillStepOneDemoData(flowType);
      return;
    }
    fillStepTwoDemoData(flowType);
  };

  const openFlow = (type: FlowType) => {
    setFlowType(type);
    setScreen("flow");
    setStep(1);
    setShowPremiumDetails(false);
    setJourneyStatus("");
    setCheckoutStatus("");
  };

  const returnToLauncher = () => {
    if (onExit) {
      onExit();
      return;
    }
    setScreen("catalog");
    setFlowType(null);
    setStep(1);
    setJourneyStatus("");
    setCheckoutStatus("");
  };

  if (!flowType && screen === "flow") return null;
  const selected = currentData!;
  const userName = sessionName;
  const isInternalMode = entryMode === "internal";
  const authenticatedExternalProfile =
    entryMode === "external" && sessionProfile?.authenticated ? sessionProfile : null;
  const isAuthenticatedExternalJourney = Boolean(authenticatedExternalProfile);
  const isGuestExternalSession = entryMode === "external" && !isAuthenticatedExternalJourney;
  const accountIdentity = String(authenticatedExternalProfile?.name || "").trim();
  const accountCustomerType = String(authenticatedExternalProfile?.customerType || "").trim();
  const accountPhone = String(authenticatedExternalProfile?.phone || "").trim();
  const accountEmail = String(authenticatedExternalProfile?.email || "").trim();
  const accountIdentityNumber = String(authenticatedExternalProfile?.identityNumber || "").trim();
  const accountInsuredAddress = String(authenticatedExternalProfile?.insuredAddress || "").trim();
  const isInternalPreview = isInternalMode && viewerMode === "internal";
  const isCustomerPreview = !isInternalPreview;
  const externalDisplayName =
    accountIdentity
    || String(selected?.insured?.fullName || "").trim()
    || "Calon Pemegang Polis";
  const displayUserName = isInternalMode ? userName : externalDisplayName;
  const heroGreeting = isInternalMode ? `Selamat datang kembali, ${userName}` : `Halo, ${externalDisplayName}`;
  const showPaymentStep = entryMode === "external" || viewerMode === "customer";
  const isSharedCustomerPreview = !isInternalMode && hasSharedOfferJourney;
  const stepOneTitle = hasSharedOfferJourney ? "Tinjau Penawaran" : "Simulasi Premi";
  const activeProduct = PRODUCTS.find((item) => item.id === flowType);
  const hasQuoteBasis = Boolean(selected.quote.plateRegion)
    && Boolean(selected.quote.year)
    && isYearEligible(flowType, selected.quote.year)
    && Boolean(String(selected.quote.marketValue || "").trim())
    && validateMaxHP(flowType, Number(selected.quote.marketValue || 0))
    && Boolean(selected.quote.usage)
    && Boolean(String(selected.quote.vehicleName || "").trim())
    && (flowType === "motor" || Boolean(selected.quote.vehicleType));
  const quoteReady = hasQuoteBasis;
  const selectedVehicleMeta = getVehicleCatalogItem(flowType === "motor" ? "motor" : "car", selected.quote.vehicleName);
  const tariffCategoryLabel = getVehicleTariffCategory(flowType, selected.quote);
  const tariffRegionLabel = getRegionLabel(selected.quote.plateRegion);
  const tariffInfoValue = tariffRegionLabel ? `${tariffRegionLabel} dengan ${tariffCategoryLabel}` : tariffCategoryLabel;
  const shouldShowTariffSummary = Boolean(
    isInternalMode &&
      selected.quote.plateRegion &&
      (flowType === "motor" || selected.quote.marketValue || selected.quote.vehicleType),
  );
  const tariffInfoSummary = tariffRegionLabel
    ? `Kendaraan ini termasuk dalam ${tariffRegionLabel} dengan ${tariffCategoryLabel}.`
    : `Kendaraan ini termasuk dalam ${tariffCategoryLabel}.`;
  const vehicleUsageHelpText = `Kendaraan ini digunakan untuk apa?

Penggunaan Pribadi berarti kendaraan digunakan untuk keperluan pribadi dan bukan untuk disewakan atau menerima balas jasa, misalnya untuk ojek, kurir berbayar, layanan antar, atau sewa kendaraan.

Penggunaan Komersial berarti kendaraan digunakan untuk disewakan atau menerima balas jasa, misalnya untuk ojek, kurir berbayar, layanan antar, atau sewa kendaraan.`;
  const vehicleUsageSummaryText =
    selected.quote.usage === "Pribadi"
      ? "Penggunaan Pribadi berarti kendaraan digunakan untuk keperluan pribadi dan bukan untuk disewakan atau menerima balas jasa, misalnya untuk ojek, kurir berbayar, layanan antar, atau sewa kendaraan."
      : selected.quote.usage === "Komersial"
        ? "Penggunaan Komersial berarti kendaraan digunakan untuk disewakan atau menerima balas jasa, misalnya untuk ojek, kurir berbayar, layanan antar, atau sewa kendaraan."
        : "";
  const exts = getVisibleExtensionItems(flowType);
  const enabledExtensionItems = exts
    .filter((item) => selected.quote.extensions[item.id]?.enabled)
    .map((item) => ({ title: item.label, premium: Number(getExtensionDisplayFee(flowType, selected.quote, item.id) || 0) }));
  const shouldShowSidebarPricing = hasQuoteBasis && (showPremiumDetails || step > 1);
  const displayedBasePremium = shouldShowSidebarPricing ? formatRupiah(flowType === "carComp" ? calc.mainPremium : getMainPremiumSplit(flowType, calc).ownDamage + getMainPremiumSplit(flowType, calc).theft) : "-";
  const displayedExtensionPremium = shouldShowSidebarPricing && calc.extensionTotal > 0 ? formatRupiah(calc.extensionTotal) : null;
  const displayedStampDuty = shouldShowSidebarPricing ? formatRupiah(calc.stamp) : "-";
  const displayedTotalPremium = shouldShowSidebarPricing ? formatRupiah(calc.total) : "-";
  const carCompStandardAgeLoadingAmount = flowType === "carComp" ? Number((calc as any).standardAgeLoadingAmount || 0) : 0;
  const carCompAgeLoadingYears = flowType === "carComp" ? Number((calc as any).ageLoadingYears || 0) : 0;
  const carCompLoadingDeductibleAmount = flowType === "carComp" ? getCarCompLoadingDeductibleAmount(selected.quote.vehicleType) : 0;
  const carCompStandardDeductibleAmount = flowType === "carComp" ? getCarCompStandardDeductibleAmount(selected.quote.vehicleType) : 0;
  const carCompUsesDeductibleSubstitution = flowType === "carComp" && usesCarCompLoadingDeductibleSubstitution(selected.quote);
  const shouldShowCarCompInternalLoadingSetting = Boolean(
    isInternalMode && flowType === "carComp" && showPremiumDetails && carCompStandardAgeLoadingAmount > 0,
  );
  const showSidebar = false;
  const shouldAutoSyncOperatingSignals = false;
  const policySummaryTitle = "Polis Standar Asuransi Kendaraan Bermotor Indonesia";
  const insuredSummaryName = String(selected.insured.fullName || accountIdentity || "").trim() || "Calon Pemegang Polis";
  const insuredSummaryEmail = String(selected.insured.email || "").trim() || "-";
  const insuredSummaryPhone = String(selected.insured.phone || "").trim() || "-";
  const vehicleSummaryName = String(selected.quote.vehicleName || "").trim() || "-";
  const vehicleSummaryPlateRegion = String(selected.quote.plateRegion || "").trim() || "-";
  const vehicleSummaryPlateNumber = String(selected.vehicle.plateNumber || "").trim() || "-";
  const vehicleSummaryYear = String(selected.quote.year || "").trim() || "-";
  const vehicleSummaryUsage = String(selected.quote.usage || "").trim() || "-";
  const vehicleSummaryValue = String(selected.quote.marketValue || "").trim()
    ? formatRupiah(Number(selected.quote.marketValue || 0))
    : "-";
  const enabledExtensionVisualItems = exts.filter((item) => selected.quote.extensions[item.id]?.enabled);

  const feeMap = calc
    ? {
        tpl: getExtensionDisplayFee(flowType, selected.quote, "tpl"),
        srcc: getExtensionDisplayFee(flowType, selected.quote, "srcc"),
        ts: getExtensionDisplayFee(flowType, selected.quote, "ts"),
        flood: getExtensionDisplayFee(flowType, selected.quote, "flood"),
        quake: getExtensionDisplayFee(flowType, selected.quote, "quake"),
        driverPa: getExtensionDisplayFee(flowType, selected.quote, "driverPa"),
        passengerPa: getExtensionDisplayFee(flowType, selected.quote, "passengerPa"),
        equipment: getExtensionDisplayFee(flowType, selected.quote, "equipment"),
        authorizedWorkshop: getExtensionDisplayFee(flowType, selected.quote, "authorizedWorkshop"),
      }
    : {};
  const selectedExtensionDetailItems = enabledExtensionVisualItems.map((item) => ({
    title: item.label,
    icon: item.icon || Shield,
    premium: formatRupiah(Number((feeMap as any)[item.id] || 0)),
    coverageAmount: getVehicleExtensionCoverageText(flowType, selected.quote, item.id),
    detail: EXT_INFO[item.id],
    deductible: deductibleText(flowType, selected.quote.vehicleType, item.id),
  }));

  const visibleUploadNames = selected && flowType ? getVehicleUploadFields(flowType) : [];
  const existingDamageStatus =
    flowType === "carComp"
      ? (selected?.underwriting.existingDamageStatus || (selected?.underwriting.noExistingDamage ? "none" : ""))
      : "";
  const existingDamagePhotoNames =
    flowType === "carComp" ? getExistingDamagePhotoNames(selected?.underwriting.existingDamagePhotoCount || 1) : [];
  const hasExistingDamagePhotos = existingDamagePhotoNames.some((name) => Boolean(selected?.uploads[name]));
  const existingDamageRequirementMet =
    flowType !== "carComp" || existingDamageStatus === "none" || (existingDamageStatus === "yes" && hasExistingDamagePhotos);
  const equipmentState = flowType !== "motor" ? (selected?.quote.extensions.equipment || {}) : {};
  const equipmentStatus =
    flowType !== "motor"
      ? (equipmentState.status || (equipmentState.enabled || equipmentState.amount || equipmentState.description || equipmentState.inclusion ? "yes" : "none"))
      : "none";
  const equipmentInclusion = String(equipmentState.inclusion || "");
  const equipmentChargeableAmount = Number(equipmentState.amount || 0) || 0;
  const equipmentPhotoNames = flowType !== "motor" ? getEquipmentPhotoNames(equipmentState.photoCount || 1) : [];
  const hasEquipmentPhotos = equipmentPhotoNames.some((name) => Boolean(selected?.uploads[name]));
  const equipmentRequirementMet =
    flowType === "motor" ||
    equipmentStatus !== "yes" ||
    (
      Boolean(String(equipmentState.description || "").trim()) &&
      (equipmentInclusion === "included" || (equipmentInclusion === "additional" && equipmentChargeableAmount > 0)) &&
      hasEquipmentPhotos
    );
  const equipmentPendingMessage =
    flowType !== "motor" && !equipmentRequirementMet
      ? !String(equipmentState.description || "").trim()
        ? "Rincian perlengkapan tambahan belum diisi."
        : !equipmentInclusion
          ? "Pilih apakah perlengkapan sudah termasuk dalam harga pertanggungan utama."
          : equipmentInclusion === "additional" && equipmentChargeableAmount <= 0
            ? "Nilai perlengkapan tambahan yang ingin dijamin belum diisi."
            : "Unggah minimal satu foto perlengkapan tambahan."
      : null;
  const requiredUploadNames = visibleUploadNames;
  const uploadsComplete = selected ? requiredUploadNames.every((name) => Boolean(selected.uploads[name])) && existingDamageRequirementMet : false;
  const stnkPhotoComplete = flowType !== "carComp" || Boolean(selected?.stnkRead);
  const dataComplete = selected ? !!(selected.insured.customerType && selected.insured.fullName && selected.insured.address && selected.insured.email && selected.insured.phone && selected.vehicle.plateNumber && selected.vehicle.chassisNumber && selected.vehicle.engineNumber) : false;
  const periodComplete = selected ? !!(selected.quote.coverageStart && selected.quote.coverageEnd) : false;
  const readyForNextStage = !!(selected && calc && uploadsComplete && equipmentRequirementMet && stnkPhotoComplete && dataComplete && periodComplete && calc.status !== "Need Review");
  const canIssue = !!(readyForNextStage && selected.agree && selected.paymentMethod);
  const coverageEndDate = selected?.quote?.coverageStart ? addOneYear(selected.quote.coverageStart) : "";
  const coverageStartDisplay = selected?.quote?.coverageStart ? formatDisplayDate(new Date(`${selected.quote.coverageStart}T00:00:00`)) : "-";
  const coverageEndDisplay = coverageEndDate ? formatDisplayDate(new Date(`${coverageEndDate}T00:00:00`)) : "-";
  const coveragePeriodDisplay = selected?.quote?.coverageStart ? `${coverageStartDisplay} - ${coverageEndDisplay}` : "Pilih tanggal mulai pertanggungan";
  const vehicleSummaryCoveragePeriod = selected.quote.coverageStart ? coveragePeriodDisplay : "-";
  const claimHistorySummary = String(selected.underwriting?.claimHistory || "").trim() || "-";
  const transactionAuthority = useMemo(
    () =>
      createTransactionAuthority({
        productCode: flowType === "motor" ? "MTR" : flowType === "carComp" ? "CMP" : "CAR",
        primaryValue: selected?.vehicle.plateNumber || selected?.quote.plateRegion || selected?.insured.fullName,
        versionLabel: operatingRecord?.version || (step === 1 ? "Rev 1" : "Rev 2"),
        preparedBy: operatingRecord?.owner || sessionName || "Tim Jasindo",
        transactionId: operatingRecord?.id,
        validUntil: operatingRecord?.validUntil || "",
      }),
    [flowType, operatingRecord, selected?.insured.fullName, selected?.quote.plateRegion, selected?.vehicle.plateNumber, sessionName, step],
  );
  const shareJourneyKey = flowType === "motor" ? "motor-external" : flowType === "carTlo" ? "car-tlo-external" : "mobil-comp";
  const sharedOfferView = isInternalMode && step === 2 && readyForNextStage ? "payment" : "offer-indicative";
  const shareUrl = getJourneyShareUrl(shareJourneyKey, {
    role: "guest",
    view: sharedOfferView,
    viewer: "customer",
    shareData: {
      flowType,
      referral: transactionAuthority.transactionId,
      sender: sessionName,
      customer: selected?.insured?.fullName || "",
      offer: {
        quote: selected?.quote,
        underwriting: selected?.underwriting,
        insured: selected?.insured,
        vehicle: selected?.vehicle,
        uploads: selected?.uploads,
      },
    },
  });
  const shareRecipientName = String(selected?.insured?.fullName || accountIdentity || "").trim() || "Calon Pemegang Polis";
  const shareLabel = activeProduct?.title || "Asuransi Kendaraan";
  const shareSubject = `${shareLabel} - ${shareRecipientName}`;
  const fraudAlerts = useMemo(
    () =>
      summarizeFraudSignals({
        documentChecks: flowType ? [documentChecks[flowType]?.ktp, documentChecks[flowType]?.stnk] : [],
        evidenceChecks: flowType ? Object.values(evidence[flowType] || {}) : [],
      }),
    [documentChecks, evidence, flowType],
  );

  useEffect(() => {
    operatingSignalRef.current = onOperatingSignal;
  }, [onOperatingSignal]);

  useEffect(() => {
    if (!shouldAutoSyncOperatingSignals) return;
    if (!flowType) return;
    const authorityKey = JSON.stringify(transactionAuthority || {});
    if (JSON.stringify(operatingRecord?.authority || null) === authorityKey) return;
    if (lastAuthoritySignalRef.current === authorityKey) return;
    lastAuthoritySignalRef.current = authorityKey;
    operatingSignalRef.current?.({ authority: transactionAuthority });
  }, [flowType, operatingRecord?.authority, shouldAutoSyncOperatingSignals, transactionAuthority]);

  useEffect(() => {
    if (!shouldAutoSyncOperatingSignals) return;
    if (!fraudAlerts.length) {
      lastFraudSignalRef.current = "";
      return;
    }
    const fraudKey = JSON.stringify(fraudAlerts);
    const recordFraudKey = JSON.stringify(operatingRecord?.flags || []);
    if (
      operatingRecord?.status === "Pending Review Internal" &&
      recordFraudKey === fraudKey &&
      operatingRecord?.reason === fraudAlerts[0]
    ) {
      return;
    }
    if (lastFraudSignalRef.current === fraudKey) return;
    lastFraudSignalRef.current = fraudKey;
    operatingSignalRef.current?.({
      status: "Pending Review Internal",
      reason: fraudAlerts[0],
      notes: "Transaksi perlu review internal berdasarkan hasil verifikasi dokumen atau evidence.",
      flags: fraudAlerts,
    });
  }, [fraudAlerts, operatingRecord?.flags, operatingRecord?.reason, operatingRecord?.status, shouldAutoSyncOperatingSignals]);

  useEffect(() => {
    if (isInternalMode && step > 2) setStep(2);
  }, [isInternalMode, step]);

  useEffect(() => {
    if (!shouldAutoSyncOperatingSignals) return;
    if (!flowType || !showPremiumDetails) return;
    if (isInternalMode) return;
    let stageSignalKey = "";
    if (step === 2) {
      stageSignalKey = `${flowType}:step-2`;
      if (lastStageSignalRef.current === stageSignalKey) return;
      lastStageSignalRef.current = stageSignalKey;
      operatingSignalRef.current?.({
        status: "Isi Data Lanjutan",
        reason: "Data lanjutan kendaraan sedang dilengkapi.",
        notes: "Flow kendaraan sedang berada pada tahap data lanjutan.",
      });
    }
    if (step === 3 && readyForNextStage) {
      if (
        operatingRecord?.status === "Siap Bayar" &&
        operatingRecord?.reason === "Data kendaraan sudah lengkap dan siap dilanjutkan ke pembayaran."
      ) {
        lastStageSignalRef.current = `${flowType}:step-3:ready`;
        return;
      }
      stageSignalKey = `${flowType}:step-3:ready`;
      if (lastStageSignalRef.current === stageSignalKey) return;
      lastStageSignalRef.current = stageSignalKey;
      operatingSignalRef.current?.({
        status: "Siap Bayar",
        reason: "Data kendaraan sudah lengkap dan siap dilanjutkan ke pembayaran.",
        notes: "Versi final kendaraan siap dibayarkan oleh calon pemegang polis.",
      });
    }
    if (!stageSignalKey) lastStageSignalRef.current = "";
  }, [flowType, isInternalMode, operatingRecord?.reason, operatingRecord?.status, readyForNextStage, shouldAutoSyncOperatingSignals, showPremiumDetails, step]);

  useEffect(() => {
    if (!showOfferShareModal) setShareFeedback("");
  }, [showOfferShareModal]);

  useEffect(() => {
    if (entryMode !== "external" || !flowType) return;
    const { view, viewer, shareData, shareToken } = readVehicleShareContextFromUrl();
    const sharedOffer = shareData?.offer;
    const requestedView = view === "payment" ? "payment" : "offer-indicative";
    const nextStep = requestedView === "payment" ? 3 : 1;
    if (!sharedOffer || shareData?.flowType !== flowType) {
      setHasSharedOfferJourney(false);
      setViewerMode("customer");
      setStep(1);
      setShowPremiumDetails(false);
      lastHydratedShareKeyRef.current = `${flowType}:self-serve`;
      if (view || viewer || shareData) {
        clearVehicleShareContextFromUrl();
      }
      return;
    }
    const shareHydrationKey = `${flowType}:${shareToken}:${viewer}:${view}`;
    setHasSharedOfferJourney(true);
    setViewerMode(viewer === "internal" ? "internal" : "customer");
    setStep(nextStep);
    setShowPremiumDetails(true);
    if (view !== requestedView || viewer !== "customer") {
      replaceVehicleShareContextInUrl({
        view: requestedView,
        viewer: "customer",
        shareData,
      });
    }
    if (lastHydratedShareKeyRef.current === shareHydrationKey) return;
    lastHydratedShareKeyRef.current = shareHydrationKey;
    setFlows((prev) => {
      const next: any = JSON.parse(JSON.stringify(prev));
      next[flowType] = {
        ...next[flowType],
        quote: {
          ...next[flowType].quote,
          ...(sharedOffer.quote || {}),
        },
        underwriting: {
          ...next[flowType].underwriting,
          ...(sharedOffer.underwriting || {}),
        },
        insured: {
          ...next[flowType].insured,
          ...(sharedOffer.insured || {}),
        },
        vehicle: {
          ...next[flowType].vehicle,
          ...(sharedOffer.vehicle || {}),
        },
        uploads: {
          ...next[flowType].uploads,
          ...(sharedOffer.uploads || {}),
        },
      };
      return next;
    });
    if ((sharedOffer.insured?.fullName || "").trim()) {
      setSelectedCustomers((prev) => ({ ...prev, [flowType]: null }));
    }
  }, [entryMode, flowType]);

  useEffect(() => {
    if (!flowType || !isAuthenticatedExternalJourney || !authenticatedExternalProfile) return;
    setFlows((prev) => {
      const current = prev[flowType];
      const nextInsured = {
        ...current.insured,
        customerType: current.insured.customerType || accountCustomerType,
        nik: current.insured.nik || accountIdentityNumber,
        fullName: current.insured.fullName || accountIdentity,
        lookup: current.insured.lookup || accountIdentity,
        address: current.insured.address || accountInsuredAddress,
        email: current.insured.email || accountEmail,
        phone: current.insured.phone || accountPhone,
      };

      const unchanged =
        nextInsured.customerType === current.insured.customerType
        && nextInsured.nik === current.insured.nik
        && nextInsured.fullName === current.insured.fullName
        && nextInsured.lookup === current.insured.lookup
        && nextInsured.address === current.insured.address
        && nextInsured.email === current.insured.email
        && nextInsured.phone === current.insured.phone;

      if (unchanged) return prev;

      return {
        ...prev,
        [flowType]: {
          ...current,
          insured: nextInsured,
        },
      };
    });
  }, [
    accountCustomerType,
    accountEmail,
    accountIdentity,
    accountIdentityNumber,
    accountInsuredAddress,
    accountPhone,
    authenticatedExternalProfile,
    flowType,
    isAuthenticatedExternalJourney,
  ]);

  useEffect(() => {
    if (!isSharedCustomerPreview) {
      setSharedPreviewEditing((prev) => (prev.insured || prev.vehicle ? { insured: false, vehicle: false } : prev));
    }
  }, [isSharedCustomerPreview]);

  const handleSendIndicative = () => {
    setJourneyStatus("Penawaran awal kendaraan sudah disiapkan untuk calon pemegang polis.");
    setShowOfferShareModal(true);
    onOperatingSignal({
      status: "Penawaran Terkirim",
      reason: "Penawaran kendaraan dikirim ke calon pemegang polis.",
      notes: "Calon pemegang polis dapat membuka langkah 1 untuk melihat simulasi premi awal.",
    });
  };

  const handleSendFinalizedOffer = () => {
    setJourneyStatus("Data lanjutan kendaraan sudah lengkap dan siap dikirim ke calon pemegang polis.");
    setShowOfferShareModal(true);
    onOperatingSignal({
      status: "Penawaran Terkirim",
      reason: "Versi penawaran kendaraan terbaru dikirim ke calon pemegang polis.",
      notes: "Versi terbaru mencakup data lanjutan yang sudah dilengkapi dari jalur internal.",
    });
  };

  const handleCopyShareLink = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setShareFeedback("Link berhasil disalin.");
    } catch {
      setShareFeedback("Copy otomatis gagal. Silakan salin tautan secara manual.");
    }
  };

  const handleDownloadSharePdf = () => {
    const downloaded = downloadVehicleOfferPdf({
      fileName: `Penawaran-${shareLabel}-${shareRecipientName}`,
      productTitle: shareLabel,
      customerName: shareRecipientName,
      phone: selected.insured.phone,
      email: selected.insured.email,
      vehicleName: selected.quote.vehicleName,
      plateRegion: selected.quote.plateRegion,
      usage: selected.quote.usage,
      year: selected.quote.year,
      marketValue: selected.quote.marketValue,
      tariffInfo: isInternalMode ? tariffInfoValue : "",
      basePremium: flowType === "carComp" ? calc.mainPremium : getMainPremiumSplit(flowType, calc).ownDamage + getMainPremiumSplit(flowType, calc).theft,
      extensionPremium: calc.extensionTotal,
      stampDuty: calc.stamp,
      totalPremium: calc.total,
      extensionItems: enabledExtensionItems,
      offerReference: transactionAuthority.transactionId,
      downloadedAt: formatDisplayDateTime(new Date()),
      shareUrl,
    });
    setShareFeedback(downloaded ? "File PDF penawaran sedang diunduh." : "File PDF belum berhasil diunduh. Coba lagi sebentar.");
  };

  const stepTwoPendingItems = [
    !selected.insured.fullName ? "Nama nasabah belum lengkap." : null,
    !selected.insured.address ? "Alamat calon pemegang polis belum lengkap." : null,
    !selected.insured.email ? "Alamat email belum lengkap." : null,
    !selected.insured.phone ? "Nomor handphone belum lengkap." : null,
    !selected.vehicle.plateNumber ? "Nomor polisi / TNKB belum lengkap." : null,
    !selected.vehicle.chassisNumber ? "Nomor rangka kendaraan belum lengkap." : null,
    !selected.vehicle.engineNumber ? "Nomor mesin kendaraan belum lengkap." : null,
    !selected.underwriting.claimHistory ? "Riwayat klaim 3 tahun terakhir belum diisi." : null,
    !periodComplete ? "Tanggal mulai perlindungan belum diisi." : null,
    equipmentPendingMessage,
    !uploadsComplete
      ? flowType === "carComp" && !existingDamageRequirementMet
        ? existingDamageStatus === "yes"
          ? "Unggah minimal satu foto kerusakan sebelum polis aktif."
          : "Pilih kondisi kendaraan sebelum polis aktif."
        : "Foto kendaraan belum lengkap."
      : null,
    selected.ui.dataMode === "scan" && !selected.ktpRead ? "Foto KTP belum terbaca." : null,
    !stnkPhotoComplete ? "Foto STNK wajib diunggah dan terbaca untuk Mobil Comprehensive." : null,
    flowType !== "carComp" && selected.ui.stnkMode === "scan" && !selected.stnkRead ? "Foto STNK belum terbaca." : null,
    calc?.status === "Need Review" ? "Profil risiko kendaraan masih perlu kami cek lebih lanjut." : null,
  ].filter(Boolean) as string[];

  const renderPremiumSummaryCard = (showHeroAsFinal = false) => (
    <ActionCard>
      <div className="text-[18px] font-bold text-slate-900">Ringkasan Pembayaran</div>
      <div className="mt-4">
        <PremiumPriceHero
          label="Total Pembayaran"
          value={displayedTotalPremium}
          tooltipText={
            !showHeroAsFinal
              ? "Total pembayaran ini masih perkiraan awal. Setelah Anda melengkapi Data Lanjutan, nilainya akan dihitung ulang dan bisa berubah sesuai informasi yang Anda isi."
              : undefined
          }
        />
        <PremiumBreakdown>
          <ProposalRow label="Premi" value={displayedBasePremium} />
          {displayedExtensionPremium ? <ProposalRow label="Premi Perluasan" value={displayedExtensionPremium} /> : null}
          <ProposalRow label="Biaya Meterai" value={displayedStampDuty} />
        </PremiumBreakdown>
      </div>
    </ActionCard>
  );

  const renderCoverageSummaryCard = () => {
    const visibleExtensionRows = isSharedCustomerPreview
      ? exts.filter((item) => selected.quote.extensions[item.id]?.enabled)
      : exts;

    return (
    <ActionCard>
      <div className="space-y-5">
        <div>
          <div className="text-[18px] font-bold text-slate-900">{isSharedCustomerPreview ? "Ringkasan Syarat dan Ketentuan" : "Rincian Jaminan"}</div>
          <div className="mt-1 text-sm leading-6 text-slate-500">
            {isSharedCustomerPreview ? "Ringkasan jaminan utama dan perluasan yang berlaku pada penawaran ini." : "Klik setiap baris untuk melihat penjelasan detailnya."}
          </div>
          <div className="mt-4 text-[15px] font-semibold tracking-tight text-slate-900">Risiko yang Dijamin</div>
          <div className="mt-3 space-y-2.5">
            <AccordionRiskRow itemIcon={Shield} title={mainCoverTitle(flowType)} premium={formatRupiah(calc.mainPremium)} summary={mainCoverText(flowType)} detail="" deductible={mainDeductibleText(flowType, selected.quote.vehicleType, selected.quote)} alwaysIncluded expanded={!!expandedRows.main} onToggleExpand={() => setExpandedRows((prev) => ({ ...prev, main: !prev.main }))} />
          </div>
        </div>
        <div>
          <div>
            <div className="text-[15px] font-semibold tracking-tight text-slate-900">Perluasan Jaminan</div>
          </div>
          <div className="mt-4 space-y-2.5">
            {visibleExtensionRows.map((item) => {
              const enabled = selected.quote.extensions[item.id].enabled;
              const marketValue = Number(selected.quote.marketValue || 0) || 0;
              const personalCoverageMax = Math.min(100000000, marketValue || 100000000);
              const amountInputMin = item.id === "equipment" ? 0 : MIN_COVERAGE_INPUT_AMOUNT;
              const amountInputMax = item.id === "tpl"
                ? flowType === "motor" ? MIN_COVERAGE_INPUT_AMOUNT : personalCoverageMax
                : item.id === "equipment" ? calc?.details?.equipmentCap || 0 : personalCoverageMax;
              const amountInputValue = item.id === "equipment"
                ? Number(selected.quote.extensions[item.id]?.amount || 0) || 0
                : getVehicleExtensionCoverageAmount(flowType, selected.quote, item.id);
              return (
                <AccordionRiskRow
                  key={item.id}
                  itemIcon={item.icon}
                  title={item.label}
                  premium={formatRupiah((feeMap as any)[item.id] || 0)}
                  coverageAmount={getVehicleExtensionCoverageText(flowType, selected.quote, item.id)}
                  summary={EXT_INFO[item.id]}
                  deductible={deductibleText(flowType, selected.quote.vehicleType, item.id)}
                  checked={isSharedCustomerPreview || enabled}
                  readOnly={isSharedCustomerPreview}
                  onToggleChecked={() => {
                    if (isSharedCustomerPreview) return;
                    const next = !enabled;
                    if (item.id === "ts") {
                      setAt(flowType, `quote.extensions.ts.enabled`, next);
                      if (next) setAt(flowType, `quote.extensions.srcc.enabled`, true);
                      return;
                    }
                    if (item.id === "srcc") {
                      const tsEnabled = selected.quote.extensions.ts.enabled;
                      if (tsEnabled && !next) {
                        setAt(flowType, `quote.extensions.srcc.enabled`, true);
                        return;
                      }
                    }
                    if (item.id === "tpl" && next && !selected.quote.extensions.tpl.amount) {
                      setAt(flowType, "quote.extensions.tpl.amount", flowType === "motor" ? MIN_COVERAGE_INPUT_AMOUNT : DEFAULT_CAR_TPL_AMOUNT);
                    }
                    if (item.id === "driverPa" && flowType !== "motor" && next && !selected.quote.extensions.driverPa.amount) {
                      setAt(flowType, "quote.extensions.driverPa.amount", DEFAULT_CAR_PA_AMOUNT);
                    }
                    if (item.id === "passengerPa" && flowType !== "motor" && next) {
                      if (!selected.quote.extensions.passengerPa.amount) setAt(flowType, "quote.extensions.passengerPa.amount", DEFAULT_CAR_PA_AMOUNT);
                      if (!selected.quote.extensions.passengerPa.seats) setAt(flowType, "quote.extensions.passengerPa.seats", DEFAULT_CAR_PASSENGER_SEATS);
                    }
                    setAt(flowType, `quote.extensions.${item.id}.enabled`, next);
                  }}
                  expanded={!!expandedRows[item.id]}
                  onToggleExpand={() => setExpandedRows((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                  extra={!isSharedCustomerPreview ? item.type === "amount-seat" ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      <div><FieldLabel label="Nilai pertanggungan per penumpang" compact required={false} /><CurrencyAmountInput value={getVehicleExtensionCoverageAmount(flowType, selected.quote, "passengerPa")} min={MIN_COVERAGE_INPUT_AMOUNT} max={personalCoverageMax} onCommit={(next: number) => setAt(flowType, "quote.extensions.passengerPa.amount", next)} /></div>
                      <div><FieldLabel label="Jumlah penumpang yang dijamin" compact required={false} /><SelectInput value={getPassengerSeatsValue(selected.quote)} onChange={(value: string) => setAt(flowType, "quote.extensions.passengerPa.seats", value)} options={["1", "2", "3", "4", "5", "6", "7"]} placeholder="Berapa penumpang yang dijamin?" /></div>
                    </div>
                  ) : item.type === "amount" ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      <div><FieldLabel label={item.id === "tpl" ? "Nilai pertanggungan pihak ketiga" : item.id === "driverPa" ? "Nilai pertanggungan pengemudi" : item.id === "equipment" ? "Nilai perlengkapan" : "Nilai pertanggungan"} compact required={false} /><CurrencyAmountInput value={amountInputValue} min={amountInputMin} max={amountInputMax} onCommit={(next: number) => setAt(flowType, `quote.extensions.${item.id}.amount`, next)} /></div>
                      {item.id === "equipment" ? <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">Batas maksimal: {formatRupiah(calc.details.equipmentCap || 0)}</div> : null}
                    </div>
                  ) : null : null}
                />
              );
            })}
            {isSharedCustomerPreview && visibleExtensionRows.length === 0 ? (
              <div className="rounded-xl border border-[#D8E1EA] bg-white px-3.5 py-3 text-[13px] leading-5 text-slate-600">
                Tidak ada perluasan jaminan tambahan pada penawaran ini.
              </div>
            ) : null}
          </div>
          {selected.quote.extensions.ts.enabled ? (
            <div className="mt-3 rounded-xl border border-[#D8E1EA] bg-white px-3.5 py-3 text-[13px] leading-5 text-slate-600">
              Jaminan Terorisme mensyaratkan Jaminan Kerusuhan &amp; Huru-hara, sehingga perluasan tersebut ikut dipilih otomatis.
            </div>
          ) : null}
        </div>
      </div>
    </ActionCard>
    );
  };

  const renderInternalCarCompLoadingSetting = () => {
    if (!shouldShowCarCompInternalLoadingSetting) return null;

    const optionBaseClass = "flex min-h-[58px] flex-1 items-start gap-2.5 rounded-xl border px-3 py-2 text-left transition";
    const loadingOptionClass = carCompUsesDeductibleSubstitution
      ? "border-[#D8E1EA] bg-white text-slate-700 hover:border-[#A9C7E3]"
      : "border-[#0A4D82] bg-[#F0F7FD] text-[#0A4D82]";
    const deductibleOptionClass = carCompUsesDeductibleSubstitution
      ? "border-[#0A4D82] bg-[#F0F7FD] text-[#0A4D82]"
      : "border-[#D8E1EA] bg-white text-slate-700 hover:border-[#A9C7E3]";

    return (
      <ActionCard className="p-3 md:p-3">
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EEF6FD] text-[#0A4D82]">
                <ShieldAlert className="h-3.5 w-3.5" />
              </div>
              <div>
                <div className="text-[14px] font-bold text-slate-900">Pengaturan Ketentuan Usia Kendaraan</div>
                <div className="mt-0.5 text-xs leading-5 text-slate-500">
                  Usia kendaraan di atas 5 tahun, sehingga terkena ketentuan loading {carCompAgeLoadingYears} tahun. Pilih ketentuan yang akan diterapkan.
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setAt(flowType, "quote.mainDeductibleOverrideAmount", "")}
              className={cls(optionBaseClass, loadingOptionClass)}
            >
              <span className={cls("mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border", carCompUsesDeductibleSubstitution ? "border-slate-300" : "border-[#0A4D82] bg-[#0A4D82] text-white")}>
                {!carCompUsesDeductibleSubstitution ? <Check className="h-3 w-3" /> : null}
              </span>
              <span>
                <span className="block text-[13px] font-bold">Dikenakan loading usia</span>
                <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">Premi utama ditambah loading {formatRupiah(carCompStandardAgeLoadingAmount)}. Risiko sendiri tetap {formatRupiah(carCompStandardDeductibleAmount)} per kejadian.</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setAt(flowType, "quote.mainDeductibleOverrideAmount", carCompLoadingDeductibleAmount)}
              className={cls(optionBaseClass, deductibleOptionClass)}
            >
              <span className={cls("mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border", carCompUsesDeductibleSubstitution ? "border-[#0A4D82] bg-[#0A4D82] text-white" : "border-slate-300")}>
                {carCompUsesDeductibleSubstitution ? <Check className="h-3 w-3" /> : null}
              </span>
              <span>
                <span className="block text-[13px] font-bold">Dikenakan risiko sendiri {formatRupiah(carCompLoadingDeductibleAmount)}</span>
                <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">Loading tidak ditagihkan. Risiko sendiri kerugian sebagian dan kerugian total menjadi {formatRupiah(carCompLoadingDeductibleAmount)} per kejadian.</span>
              </span>
            </button>
          </div>
        </div>
      </ActionCard>
    );
  };

  const renderSharedPreviewSummaryCard = () => (
    <SectionCard
      title="Ringkasan Penawaran Anda"
      subtitle={`Ringkasan ini disusun dari data SPAU (Surat Permohonan Asuransi Umum) elektronik yang Anda isi dan lengkapi, serta mengacu pada ${policySummaryTitle}.`}
      headerAlign="center"
    >
      <div className="rounded-[24px] border border-[#D8E1EA] bg-[linear-gradient(180deg,#FBFDFF_0%,#F5F9FD_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
        <div className="space-y-3">
          <OfferSummarySection
            title="Ringkasan Informasi Calon Pemegang Polis"
            action={!sharedPreviewEditing.insured ? <SummaryEditButton onClick={() => setSharedPreviewEditing({ insured: true, vehicle: false })} /> : null}
          >
            {sharedPreviewEditing.insured ? (
              <div className="space-y-4">
                <OfferSummaryKeyValue label="Nama Calon Pemegang Polis" value={insuredSummaryName} />
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <FieldLabel label="Alamat Email" required />
                    <TextInput
                      value={selected.insured.email}
                      onChange={(value: string) => setAt(flowType, "insured.email", value)}
                      placeholder="nama@email.com"
                      icon={<Mail className="h-4 w-4" />}
                      type="email"
                    />
                  </div>
                  <div>
                    <FieldLabel label="Nomor Handphone" required />
                    <TextInput
                      value={selected.insured.phone}
                      onChange={(value: string) => setAt(flowType, "insured.phone", value)}
                      placeholder="08xxxxxxxxxx"
                      icon={<Phone className="h-4 w-4" />}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-slate-500">Yang bisa diubah di bagian ini hanya alamat email dan nomor handphone.</div>
                  <button
                    type="button"
                    onClick={() => setSharedPreviewEditing((prev) => ({ ...prev, insured: false }))}
                    className="inline-flex h-9 items-center rounded-[10px] bg-[#0A4D82] px-4 text-sm font-semibold text-white hover:bg-[#0D5B98]"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <OfferSummaryKeyValue label="Nama Calon Pemegang Polis" value={insuredSummaryName} />
                <OfferSummaryKeyValue label="Alamat Email" value={insuredSummaryEmail} />
                <OfferSummaryKeyValue label="Nomor Handphone" value={insuredSummaryPhone} />
              </div>
            )}
          </OfferSummarySection>

          <OfferSummarySection
            title="Ringkasan Informasi Kendaraan"
            action={!sharedPreviewEditing.vehicle ? <SummaryEditButton onClick={() => setSharedPreviewEditing({ insured: false, vehicle: true })} /> : null}
          >
            {sharedPreviewEditing.vehicle ? (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <FieldLabel label={flowType === "motor" ? "Merek / Tipe Motor" : "Merek / Tipe Kendaraan"} />
                    <VehicleAutocomplete
                      value={selected.quote.vehicleName}
                      onChange={(value: string) => updateVehicleSelection(flowType, value)}
                      onSelect={(item: VehicleCatalogItem) => updateVehicleSelection(flowType, item.label, item)}
                      catalogType={flowType === "motor" ? "motor" : "car"}
                      placeholder={flowType === "motor" ? "Sepeda motor ini merek dan tipenya apa?" : "Mobil ini merek dan tipenya apa?"}
                    />
                  </div>
                  <div>
                    <FieldLabel label="Kode wilayah plat / TNKB" />
                    <TextInput
                      value={selected.quote.plateRegion}
                      onChange={(value: string) => setAt(flowType, "quote.plateRegion", value)}
                      placeholder="Pilih kode wilayah kendaraan"
                      icon={<MapPin className="h-4 w-4" />}
                      listId={`${flowType}-preview-plate-list`}
                    />
                    <datalist id={`${flowType}-preview-plate-list`}>{PLATES.map((p) => <option key={p} value={p} />)}</datalist>
                  </div>
                  <div>
                    <FieldLabel label="Tahun Pembuatan Kendaraan" helpText="Sesuai tahun pembuatan/manufacture year pada STNK." />
                    <VehicleYearPicker
                      value={selected.quote.year}
                      onChange={(value: string) => setAt(flowType, "quote.year", value)}
                      minYear={flowType === "carComp" ? MIN_YEAR_COMP : MIN_YEAR_TLO}
                      maxYear={CURRENT_YEAR}
                      placeholder="Kendaraan ini dibuat tahun berapa?"
                    />
                  </div>
                  <div>
                    <FieldLabel label="Harga Pertanggungan" helpText="Harga pertanggungan adalah nilai kendaraan yang diasuransikan. Isi sesuai harga pasar wajar kendaraan saat ini, karena nilai ini menjadi dasar perhitungan premi dan batas ganti rugi sesuai ketentuan polis." />
                    <TextInput
                      value={selected.quote.marketValue ? formatRupiah(Number(String(selected.quote.marketValue).replace(/[^0-9]/g, ""))) : ""}
                      onChange={(value: string) => setAt(flowType, "quote.marketValue", String(value).replace(/[^0-9]/g, ""))}
                      placeholder={flowType === "motor" ? "Berapa harga pertanggungan sepeda motor ini?" : "Berapa harga pertanggungan mobil ini?"}
                      inputMode="numeric"
                    />
                  </div>
                </div>
                <div className="md:max-w-[760px]">
                  <FieldLabel label="Penggunaan Kendaraan" helpText={vehicleUsageHelpText} />
                  <SelectInput
                    value={selected.quote.usage}
                    onChange={(value: string) => setAt(flowType, "quote.usage", value)}
                    options={["Pribadi", "Komersial"]}
                    placeholder="Kendaraan ini digunakan untuk apa?"
                  />
                  {selected.quote.usage === "Pribadi" ? (
                    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
                      <span className="font-semibold text-slate-800">Penggunaan Pribadi</span> berarti kendaraan digunakan untuk keperluan pribadi dan bukan untuk disewakan atau menerima balas jasa, misalnya untuk ojek, kurir berbayar, layanan antar, atau sewa kendaraan.
                    </div>
                  ) : selected.quote.usage === "Komersial" ? (
                    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
                      <span className="font-semibold text-slate-800">Penggunaan Komersial</span> berarti kendaraan digunakan untuk disewakan atau menerima balas jasa, misalnya untuk ojek, kurir berbayar, layanan antar, atau sewa kendaraan.
                    </div>
                  ) : null}
                  {shouldShowTariffSummary ? (
                    <div className="mt-3 rounded-xl border border-[#D5DDE6] bg-[#F8FBFE] px-3 py-2 text-sm leading-6 text-slate-600">
                      <span className="font-semibold text-[#0A4D82]">{tariffInfoSummary}</span>
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSharedPreviewEditing((prev) => ({ ...prev, vehicle: false }))}
                    className="inline-flex h-9 items-center rounded-[10px] bg-[#0A4D82] px-4 text-sm font-semibold text-white hover:bg-[#0D5B98]"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <OfferSummaryKeyValue label={flowType === "motor" ? "Merek / Tipe Motor" : "Merek / Tipe Kendaraan"} value={vehicleSummaryName} />
                <OfferSummaryKeyValue label="Kode wilayah plat / TNKB" value={vehicleSummaryPlateRegion} />
                <OfferSummaryKeyValue label="Tahun Pembuatan Kendaraan" value={vehicleSummaryYear} />
                <OfferSummaryKeyValue label="Penggunaan Kendaraan" value={vehicleSummaryUsage} />
                <OfferSummaryKeyValue label="Harga Pertanggungan" value={vehicleSummaryValue} />
              </div>
            )}
          </OfferSummarySection>

          <OfferSummarySection title="Ringkasan Syarat dan Ketentuan">
              <div className="space-y-4">
                <div className="rounded-xl border border-[#D8E1EA] bg-[linear-gradient(180deg,#FFFFFF_0%,#F7FAFD_100%)] px-4 py-3">
                  <div className="text-[15px] font-medium leading-[1.4] text-slate-900">{policySummaryTitle}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-[14px] font-medium text-slate-600">Risiko yang dijamin</div>
                  <VehicleGuaranteeDetailCard
                    title={mainCoverTitle(flowType)}
                    icon={Shield}
                    premium={displayedBasePremium}
                    detail={mainCoverText(flowType)}
                    deductible={mainDeductibleText(flowType, selected.quote.vehicleType, selected.quote)}
                  />
                </div>
              <div className="space-y-2">
                <div>
                  <div className="text-[14px] font-medium text-slate-600">Perluasan Jaminan</div>
                </div>
                {exts.map((item) => {
                  const enabled = selected.quote.extensions[item.id].enabled;
                  return (
                    <PreviewGuaranteeOption
                      key={item.id}
                      icon={item.icon}
                      title={item.label}
                      premium={formatRupiah((feeMap as any)[item.id] || 0)}
                      coverageAmount={getVehicleExtensionCoverageText(flowType, selected.quote, item.id)}
                      checked={enabled}
                      expanded={!!expandedRows[item.id]}
                      onToggleChecked={() => {
                        const next = !enabled;
                        if (item.id === "ts") {
                          setAt(flowType, `quote.extensions.ts.enabled`, next);
                          if (next) setAt(flowType, `quote.extensions.srcc.enabled`, true);
                          return;
                        }
                        if (item.id === "srcc") {
                          const tsEnabled = selected.quote.extensions.ts.enabled;
                          if (tsEnabled && !next) {
                            setAt(flowType, `quote.extensions.srcc.enabled`, true);
                            return;
                          }
                        }
                        if (item.id === "tpl" && next && !selected.quote.extensions.tpl.amount) {
                          setAt(flowType, "quote.extensions.tpl.amount", flowType === "motor" ? MIN_COVERAGE_INPUT_AMOUNT : DEFAULT_CAR_TPL_AMOUNT);
                        }
                        if (item.id === "driverPa" && flowType !== "motor" && next && !selected.quote.extensions.driverPa.amount) {
                          setAt(flowType, "quote.extensions.driverPa.amount", DEFAULT_CAR_PA_AMOUNT);
                        }
                        if (item.id === "passengerPa" && flowType !== "motor" && next) {
                          if (!selected.quote.extensions.passengerPa.amount) setAt(flowType, "quote.extensions.passengerPa.amount", DEFAULT_CAR_PA_AMOUNT);
                          if (!selected.quote.extensions.passengerPa.seats) setAt(flowType, "quote.extensions.passengerPa.seats", DEFAULT_CAR_PASSENGER_SEATS);
                        }
                        setAt(flowType, `quote.extensions.${item.id}.enabled`, next);
                      }}
                      onToggleExpand={() => setExpandedRows((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                      detail={EXT_INFO[item.id]}
                      deductible={deductibleText(flowType, selected.quote.vehicleType, item.id)}
                    />
                  );
                })}
                {selected.quote.extensions.ts.enabled ? (
                  <div className="rounded-xl border border-[#D8E1EA] bg-white px-3.5 py-3 text-[13px] leading-5 text-slate-600">
                    Jaminan Terorisme mensyaratkan Jaminan Kerusuhan &amp; Huru-hara, sehingga perluasan tersebut ikut dipilih otomatis.
                  </div>
                ) : null}
              </div>
            </div>
          </OfferSummarySection>

          <OfferSummarySection title="Ringkasan Pembayaran">
            <PremiumPriceHero
              label="Total Pembayaran"
              value={displayedTotalPremium}
              tooltipText="Total pembayaran ini masih perkiraan awal. Setelah Anda melengkapi Data Lanjutan, nilainya akan dihitung ulang dan bisa berubah sesuai informasi yang Anda isi."
            />
            <PremiumBreakdown>
              <ProposalRow label="Premi" value={displayedBasePremium} />
              {displayedExtensionPremium ? <ProposalRow label="Premi Perluasan" value={displayedExtensionPremium} /> : null}
              <ProposalRow label="Biaya Meterai" value={displayedStampDuty} />
            </PremiumBreakdown>
          </OfferSummarySection>

          <div className="rounded-[24px] border border-[#D8E1EA] bg-white p-5 shadow-sm">
            {journeyStatus ? (
              <div className="rounded-xl border border-[#CFE0F0] bg-[#F8FBFE] p-4 text-sm text-[#0A4D82]">{journeyStatus}</div>
            ) : null}
            <div className={journeyStatus ? "mt-4" : ""}>
              <button
                type="button"
                onClick={() => {
                  setJourneyStatus("");
                  setStep(2);
                }}
                className="flex h-[48px] w-full items-center justify-center rounded-[12px] bg-[#F5A623] px-5 text-sm font-semibold text-white shadow-sm hover:brightness-105"
              >
                Isi Data Lanjutan
              </button>
            </div>
            <div className="mt-3 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => setJourneyStatus("Tim asuransi akan membantu menindaklanjuti penawaran kendaraan ini.")}
                className="text-sm font-medium text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
              >
                Minta Bantuan Isi Data Lanjutan
              </button>
              <button
                type="button"
                onClick={() => setJourneyStatus("Penawaran kendaraan ini ditandai untuk tidak dilanjutkan.")}
                className="text-xs font-medium text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
              >
                Tidak mau melanjutkan penawaran
              </button>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );

  const renderStepOneActions = () => (
    <div>
      <div className={cls("flex justify-stretch gap-3", showPremiumDetails ? "justify-stretch sm:justify-end" : "sm:justify-end sm:gap-3")}>
        {!showPremiumDetails ? (
          <button
            type="button"
            disabled={!quoteReady}
            onClick={() => setShowPremiumDetails(true)}
            className={cls(
              "inline-flex h-[50px] flex-1 items-center justify-center gap-2 rounded-[12px] px-5 text-sm font-semibold text-white shadow-sm transition",
              quoteReady ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400",
            )}
          >
            Cek Premi
          </button>
        ) : null}
        {showPremiumDetails && isInternalMode ? (
          <button
            type="button"
            disabled={!quoteReady}
            onClick={handleSendIndicative}
            className={cls(
              "inline-flex h-[50px] flex-1 items-center justify-center gap-2 rounded-[12px] px-5 text-sm font-semibold text-white shadow-sm transition",
              quoteReady ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400",
            )}
          >
            Kirim Penawaran Awal
          </button>
        ) : null}
        {showPremiumDetails ? (
          <button
            type="button"
            disabled={!quoteReady}
            onClick={() => {
              setJourneyStatus("");
              setStep(2);
            }}
            className={cls(
              "inline-flex h-[50px] flex-1 items-center justify-center gap-2 rounded-[12px] px-5 text-sm font-semibold text-white shadow-sm transition",
              quoteReady ? (isInternalMode ? "bg-[#0A4D82] hover:brightness-105" : "bg-[#F5A623] hover:brightness-105") : "cursor-not-allowed bg-slate-400",
            )}
          >
            {"Isi Data Lanjutan"}
          </button>
        ) : null}
      </div>
      {!isInternalMode && hasSharedOfferJourney ? (
        <div className="mt-3 space-y-3">
          <button
            type="button"
            onClick={() => setJourneyStatus("Tim asuransi akan membantu menindaklanjuti penawaran kendaraan ini.")}
            className="flex h-11 w-full items-center justify-center rounded-[12px] border border-[#D5DEEA] bg-white text-sm font-semibold text-[#0A4D82] hover:bg-[#F8FBFE]"
          >
            Minta Bantuan Isi Data Lanjutan
          </button>
          <div className="text-center">
            <button
              type="button"
              onClick={() => setJourneyStatus("Penawaran kendaraan ini ditandai untuk tidak dilanjutkan.")}
              className="text-xs font-medium text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
            >
              Tidak mau melanjutkan penawaran
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );

  const renderExternalStepTwoActions = () => (
    <ActionCard>
      <div className="space-y-4">
        {journeyStatus ? <div className="rounded-xl border border-[#CFE0F0] bg-[#F8FBFE] p-4 text-sm text-[#0A4D82]">{journeyStatus}</div> : null}
        {(selected.ui.dataMode === "scan" && !selected.ktpRead) || ((selected.ui.stnkMode === "scan" || flowType === "carComp") && !selected.stnkRead) ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <div>Dokumen yang dipilih untuk isi otomatis belum terbaca penuh. Anda masih bisa lanjut dengan pengisian manual bila diperlukan.</div>
            </div>
          </div>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setJourneyStatus("");
              setStep(1);
            }}
            className="flex h-[48px] w-full items-center justify-center rounded-[12px] border border-[#D5DEEA] bg-white px-5 text-center text-sm font-semibold text-[#0A4D82] shadow-sm hover:bg-[#F8FBFE]"
          >
            {hasSharedOfferJourney ? "Kembali ke Tinjau Penawaran" : "Kembali ke Simulasi Premi"}
          </button>
          <button
            onClick={() => {
              if (readyForNextStage) {
                setJourneyStatus("");
                setStep(3);
              }
            }}
            disabled={!readyForNextStage}
            className={cls("flex h-[48px] w-full items-center justify-center rounded-[12px] px-5 text-center text-sm font-semibold text-white shadow-sm", readyForNextStage ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}
          >
            Lanjut ke Pembayaran
          </button>
        </div>
        {hasSharedOfferJourney ? (
          <div className="mt-3 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setJourneyStatus("Tim asuransi akan membantu melengkapi data lanjutan kendaraan ini.")}
              className="text-sm font-medium text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
            >
              Minta Bantuan Isi Data Lanjutan
            </button>
            <button
              type="button"
              onClick={() => setJourneyStatus("Penawaran kendaraan ini ditandai untuk tidak dilanjutkan.")}
              className="text-xs font-medium text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
            >
              Tidak mau melanjutkan penawaran
            </button>
          </div>
        ) : null}
      </div>
    </ActionCard>
  );

  const renderInternalStepTwoActions = () => (
    <ActionCard>
      <div className="space-y-4">
        {journeyStatus ? <div className="rounded-xl border border-[#CFE0F0] bg-[#F8FBFE] p-4 text-sm text-[#0A4D82]">{journeyStatus}</div> : null}
        {step === 2 && ((selected.ui.dataMode === "scan" && !selected.ktpRead) || ((selected.ui.stnkMode === "scan" || flowType === "carComp") && !selected.stnkRead)) ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <div>Dokumen yang dipilih untuk isi otomatis belum terbaca penuh. Anda masih bisa lanjut dengan pengisian manual bila diperlukan.</div>
            </div>
          </div>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setJourneyStatus("");
              setStep(1);
            }}
            className="flex h-11 w-full items-center justify-center rounded-[12px] border border-[#D5DEEA] bg-white text-sm font-semibold text-[#0A4D82] hover:bg-[#F8FBFE]"
          >
            Kembali ke Simulasi Premi
          </button>
          <button
            type="button"
            onClick={() => {
              if (readyForNextStage) handleSendFinalizedOffer();
            }}
            disabled={!readyForNextStage}
            className={cls(
              "flex h-[48px] w-full items-center justify-center rounded-[12px] px-5 text-center text-sm font-semibold text-white shadow-sm transition",
              readyForNextStage ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400",
            )}
          >
            Kirim Penawaran Final
          </button>
        </div>
      </div>
    </ActionCard>
  );

  const renderStepTwoContent = (showIntroHeader: boolean) => {
    const ktpConfidenceLabel = documentChecks[flowType].ktp.confidence
      ? `${Math.round(documentChecks[flowType].ktp.confidence * 100)}%`
      : "-";
    const stnkConfidenceLabel = documentChecks[flowType].stnk.confidence
      ? `${Math.round(documentChecks[flowType].stnk.confidence * 100)}%`
      : "-";
    const canShowInsuredStepTwoFields = selected.ui.dataMode !== "scan" || selected.ktpRead;
    const canShowStnkVehicleFields = selected.ui.stnkMode !== "scan" || selected.stnkRead;

    return (
      <ActionCard className={showIntroHeader ? "rounded-[28px]" : ""}>
          {showIntroHeader ? (
            <div className="px-2 pb-5 text-center">
              <div className="min-w-0 flex-1 text-center">
                <div className="text-[26px] font-bold tracking-tight text-slate-900 md:text-[30px]">Data Lanjutan</div>
                <div className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-[15px]">
                  Data yang Anda isi pada halaman ini merupakan bagian dari SPAU (Surat Permohonan Asuransi
                  Umum) elektronik dan menjadi dasar ringkasan final sebelum pembayaran serta penerbitan polis.
                </div>
              </div>
            </div>
          ) : null}

          <div className={showIntroHeader ? "mt-5 space-y-6" : "space-y-6"}>
            <div className="rounded-[16px] border border-[#D8E1EA] bg-[#F8FBFE] px-4 py-4 md:px-5">
              <div className="space-y-4">
                <div className="text-[18px] font-bold tracking-tight text-slate-900">Informasi Calon Pemegang Polis</div>
                <div className="grid gap-2.5 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setAt(flowType, "ui.dataMode", "scan")}
                    className={cls(
                      "rounded-[14px] border px-4 py-2.5 text-left transition",
                      selected.ui.dataMode === "scan" ? "border-[#0A4D82] bg-white" : "border-slate-200 bg-white",
                    )}
                  >
                    <div className="text-[14px] font-semibold text-[#0A4D82]">Gunakan Foto KTP</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAt(flowType, "ui.dataMode", "manual")}
                    className={cls(
                      "rounded-[14px] border px-4 py-2.5 text-left transition",
                      selected.ui.dataMode === "manual" ? "border-[#0A4D82] bg-white" : "border-slate-200 bg-white",
                    )}
                  >
                    <div className="text-[14px] font-semibold text-[#0A4D82]">Isi Manual</div>
                  </button>
                </div>

                {selected.ui.dataMode === "scan" ? (
                  <div className="rounded-[16px] border border-[#D8E1EA] bg-white px-4 py-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className={cls("text-[13px] font-medium", selected.ktpRead ? "text-emerald-700" : "text-slate-600")}>
                        {selected.ktpRead ? `Data dari foto KTP berhasil dibaca (${ktpConfidenceLabel})` : "Isi otomatis dengan foto KTP"}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const extractedData = {
                            fullName: "Rizky Pratama",
                            address: "Jl. Pahlawan No. 18, Palmerah, Jakarta Barat",
                            identityNumber: selected.insured.nik || "3174********0012",
                          };
                          setFlows((prev) => ({
                            ...prev,
                            [flowType]: {
                              ...prev[flowType],
                              insured: {
                                ...prev[flowType].insured,
                                nik: prev[flowType].insured.nik || "3174********0012",
                                fullName: "Rizky Pratama",
                                address: "Jl. Pahlawan No. 18, Palmerah, Jakarta Barat",
                              },
                              ktpRead: true,
                            },
                          }));
                          setDocumentChecks((prev) => ({
                            ...prev,
                            [flowType]: {
                              ...prev[flowType],
                              ktp: evaluateDocumentRead({
                                docType: "KTP",
                                extractedData,
                                expectedData: {
                                  fullName: selected.insured.fullName,
                                  identityNumber: selected.insured.nik,
                                },
                              }),
                            },
                          }));
                        }}
                        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[10px] bg-[#0A4D82] px-4 text-sm font-bold text-white hover:brightness-105"
                      >
                        <Camera className="h-4 w-4" />
                        Foto KTP
                      </button>
                    </div>
                  </div>
                ) : null}

                {canShowInsuredStepTwoFields ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <FieldLabel label={selected.insured.customerType === "Perusahaan / Badan Usaha" ? "NPWP" : "NIK"} required={false} />
                      <TextInput value={selected.insured.nik} onChange={(value: string) => setAt(flowType, "insured.nik", value)} placeholder={selected.insured.customerType === "Perusahaan / Badan Usaha" ? "NPWP" : "NIK"} icon={<User className="h-4 w-4" />} />
                    </div>
                    <div className="md:col-span-2">
                      <FieldLabel label="Alamat Calon Pemegang Polis" />
                      <div className="space-y-2.5">
                        <TextInput
                          value={selected.insured.address}
                          onChange={(value: string) => setAt(flowType, "insured.address", value)}
                          placeholder="Ketik alamat calon pemegang polis"
                          icon={<MapPin className="h-4 w-4" />}
                        />
                        <div className="flex flex-wrap gap-2.5">
                          <button
                            type="button"
                            onClick={() => setAt(flowType, "insured.address", "Lokasi calon pemegang polis tersimulasi - Jl. Pahlawan No. 18, Palmerah, Jakarta Barat")}
                            className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <MapPin className="h-4 w-4" />
                            Ambil Lokasi Sekarang
                          </button>
                          <button
                            type="button"
                            onClick={() => setAt(flowType, "insured.address", "Pin lokasi calon pemegang polis tersimulasi - Jl. Kemang Raya No. 18, Jakarta Selatan")}
                            className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <MapPin className="h-4 w-4" />
                            Pilih di Peta
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-[16px] border border-[#D8E1EA] bg-[#F8FBFE] px-4 py-4 md:px-5">
              <div className="space-y-4">
                <div className="text-[18px] font-bold tracking-tight text-slate-900">Informasi Kendaraan Lanjutan</div>
                <div className={cls("grid gap-2.5", flowType === "carComp" ? "md:grid-cols-1" : "md:grid-cols-2")}>
                  <button
                    type="button"
                    onClick={() => setAt(flowType, "ui.stnkMode", "scan")}
                    className={cls(
                      "rounded-[14px] border px-4 py-2.5 text-left transition",
                      selected.ui.stnkMode === "scan" ? "border-[#0A4D82] bg-white" : "border-slate-200 bg-white",
                    )}
                  >
                    <div className="text-[14px] font-semibold text-[#0A4D82]">Gunakan Foto STNK</div>
                  </button>
                  {flowType !== "carComp" ? (
                    <button
                      type="button"
                      onClick={() => setAt(flowType, "ui.stnkMode", "manual")}
                      className={cls(
                        "rounded-[14px] border px-4 py-2.5 text-left transition",
                        selected.ui.stnkMode === "manual" ? "border-[#0A4D82] bg-white" : "border-slate-200 bg-white",
                      )}
                    >
                      <div className="text-[14px] font-semibold text-[#0A4D82]">Isi Manual</div>
                    </button>
                  ) : null}
                </div>
                {selected.ui.stnkMode === "scan" ? (
                  <div className="rounded-[16px] border border-[#D8E1EA] bg-white px-4 py-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className={cls("text-[13px] font-medium", selected.stnkRead ? "text-emerald-700" : "text-slate-600")}>
                        {selected.stnkRead ? `Data dari foto STNK berhasil dibaca (${stnkConfidenceLabel})` : "Isi otomatis dengan foto STNK"}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const extractedData = {
                            ownerNameOnStnk: "Rizky Pratama",
                            plateNumber: flowType === "motor" ? "B 4123 UYT" : "B 1234 UYT",
                            chassisNumber: flowType === "motor" ? "MH1JM8112PK123456" : "MHFCBA2J0PK123456",
                            engineNumber: flowType === "motor" ? "JM81E1234567" : "2NRFKE1234567",
                            color: "Hitam",
                          };
                          setFlows((prev) => ({
                            ...prev,
                            [flowType]: {
                              ...prev[flowType],
                              vehicle: {
                                ...prev[flowType].vehicle,
                                ownerNameOnStnk: extractedData.ownerNameOnStnk,
                                plateNumber: extractedData.plateNumber,
                                chassisNumber: extractedData.chassisNumber,
                                engineNumber: extractedData.engineNumber,
                                color: extractedData.color,
                                year: prev[flowType].quote.year,
                                contactOnLocation: prev[flowType].vehicle.contactOnLocation,
                              },
                              stnkRead: true,
                            },
                          }));
                          setDocumentChecks((prev) => ({
                            ...prev,
                            [flowType]: {
                              ...prev[flowType],
                              stnk: evaluateDocumentRead({
                                docType: "STNK",
                                extractedData,
                                expectedData: {
                                  plateNumber: selected.vehicle.plateNumber,
                                  chassisNumber: selected.vehicle.chassisNumber,
                                },
                              }),
                            },
                          }));
                        }}
                        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[10px] bg-[#0A4D82] px-4 text-sm font-bold text-white hover:brightness-105"
                      >
                        <Camera className="h-4 w-4" />
                        Foto STNK
                      </button>
                    </div>
                  </div>
                ) : null}

                <>
                    {selected.insured.customerType === "Perusahaan / Badan Usaha" ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <FieldLabel label="Kontak di Lokasi" />
                          <TextInput value={selected.vehicle.contactOnLocation} onChange={(value: string) => setAt(flowType, "vehicle.contactOnLocation", value)} placeholder="Masukkan kontak di lokasi" icon={<Phone className="h-4 w-4" />} />
                        </div>
                      </div>
                    ) : null}

                    <div className="grid gap-4 md:grid-cols-2">
                      {canShowStnkVehicleFields ? (
                        <>
                          <div>
                            <FieldLabel label="Nomor Polisi / TNKB" />
                            <TextInput
                              value={selected.vehicle.plateNumber}
                              onChange={(value: string) => setAt(flowType, "vehicle.plateNumber", value)}
                              placeholder="Masukkan nomor polisi / TNKB"
                            />
                          </div>
                          <div>
                            <FieldLabel label="Nama Pemilik sesuai STNK" />
                            <TextInput
                              value={selected.vehicle.ownerNameOnStnk}
                              onChange={(value: string) => setAt(flowType, "vehicle.ownerNameOnStnk", value)}
                              placeholder="Masukkan nama pemilik sesuai STNK"
                            />
                          </div>
                          <div>
                            <FieldLabel label="Nomor Rangka" />
                            <TextInput
                              value={selected.vehicle.chassisNumber}
                              onChange={(value: string) => setAt(flowType, "vehicle.chassisNumber", value)}
                              placeholder="Masukkan nomor rangka kendaraan"
                            />
                          </div>
                          <div>
                            <FieldLabel label="Nomor Mesin" />
                            <TextInput
                              value={selected.vehicle.engineNumber}
                              onChange={(value: string) => setAt(flowType, "vehicle.engineNumber", value)}
                              placeholder="Masukkan nomor mesin kendaraan"
                            />
                          </div>
                        </>
                      ) : null}
                    </div>
                </>
              </div>
            </div>
          </div>
          {flowType !== "motor" ? (
            <div className="rounded-xl border border-[#D8E1EA] bg-white p-3">
              <div className="space-y-2.5">
                <div>
                  <div className="text-[14px] font-bold text-slate-900">Perlengkapan Tambahan</div>
                  <div className="mt-0.5 text-[11px] leading-4 text-slate-500">
                    Aksesori atau perangkat non-standar yang bukan bawaan pabrik. Pilih apakah nilainya sudah termasuk dalam harga pertanggungan utama agar premi tidak dihitung dua kali.
                  </div>
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFlows((prev) => {
                        const copy: any = JSON.parse(JSON.stringify(prev));
                        copy[flowType].quote.extensions.equipment = {
                          ...copy[flowType].quote.extensions.equipment,
                          enabled: false,
                          amount: "",
                          status: "none",
                          inclusion: "",
                          declaredValue: "",
                          description: "",
                          photoCount: 1,
                        };
                        Object.keys(copy[flowType].uploads || {}).forEach((key) => {
                          if (isEquipmentPhotoName(key)) copy[flowType].uploads[key] = false;
                        });
                        return copy;
                      });
                      setEvidence((prev) => {
                        const next: any = { ...prev, [flowType]: { ...prev[flowType] } };
                        Object.keys(next[flowType] || {}).forEach((key) => {
                          if (isEquipmentPhotoName(key)) next[flowType][key] = null;
                        });
                        return next;
                      });
                    }}
                    className={cls(
                      "flex min-h-[58px] items-start gap-2.5 rounded-xl border px-3 py-2 text-left transition",
                      equipmentStatus !== "yes" ? "border-[#0A4D82] bg-[#F0F7FD] text-[#0A4D82]" : "border-[#D8E1EA] bg-white text-slate-700 hover:border-[#A9C7E3]",
                    )}
                  >
                    <span className={cls("mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border", equipmentStatus !== "yes" ? "border-[#0A4D82] bg-[#0A4D82] text-white" : "border-slate-300")}>
                      {equipmentStatus !== "yes" ? <Check className="h-3 w-3" /> : null}
                    </span>
                    <span>
                      <span className="block text-[13px] font-bold">Tidak ada perlengkapan tambahan</span>
                      <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">Tidak ada aksesori non-standar yang perlu dicatat atau dijamin.</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFlows((prev) => {
                        const copy: any = JSON.parse(JSON.stringify(prev));
                        const current = copy[flowType].quote.extensions.equipment || {};
                        const amount = Math.min(calc?.details?.equipmentCap || 0, Number(current.amount || 0) || 0);
                        copy[flowType].quote.extensions.equipment = {
                          ...current,
                          status: "yes",
                          inclusion: current.inclusion || "",
                          amount: current.inclusion === "additional" ? amount : "",
                          enabled: current.inclusion === "additional" && amount > 0,
                          photoCount: Math.max(1, Number(current.photoCount || 1)),
                        };
                        return copy;
                      });
                    }}
                    className={cls(
                      "flex min-h-[58px] items-start gap-2.5 rounded-xl border px-3 py-2 text-left transition",
                      equipmentStatus === "yes" ? "border-[#0A4D82] bg-[#F0F7FD] text-[#0A4D82]" : "border-[#D8E1EA] bg-white text-slate-700 hover:border-[#A9C7E3]",
                    )}
                  >
                    <span className={cls("mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border", equipmentStatus === "yes" ? "border-[#0A4D82] bg-[#0A4D82] text-white" : "border-slate-300")}>
                      {equipmentStatus === "yes" ? <Check className="h-3 w-3" /> : null}
                    </span>
                    <span>
                      <span className="block text-[13px] font-bold">Ada perlengkapan tambahan</span>
                      <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">Isi rincian, status nilai pertanggungan, dan foto perlengkapannya.</span>
                    </span>
                  </button>
                </div>

                {equipmentStatus === "yes" ? (
                  <div className="space-y-4">
                    <div>
                      <FieldLabel label="Rincian perlengkapan" />
                      <TextInput
                        value={String(equipmentState.description || "")}
                        onChange={(value: string) => setAt(flowType, "quote.extensions.equipment.description", value)}
                        placeholder="Contoh: dashcam depan-belakang, audio tambahan, velg non-standar"
                      />
                    </div>

                    <div>
                      <div className="text-[13px] font-semibold text-slate-800">Apakah nilainya sudah termasuk dalam harga pertanggungan utama?</div>
                      <div className="mt-2 grid gap-2.5 md:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAt(flowType, "quote.extensions.equipment.inclusion", "included");
                            setAt(flowType, "quote.extensions.equipment.amount", "");
                            setAt(flowType, "quote.extensions.equipment.enabled", false);
                          }}
                          className={cls(
                            "rounded-[14px] border px-4 py-3 text-left transition",
                            equipmentInclusion === "included" ? "border-[#0A4D82] bg-white shadow-sm" : "border-slate-200 bg-white hover:border-[#A9C7E3]",
                          )}
                        >
                          <div className="text-sm font-semibold text-[#0A4D82]">Sudah termasuk</div>
                          <div className="mt-1 text-xs leading-5 text-slate-500">Tidak menambah premi. Foto tetap dicatat untuk verifikasi.</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const amount = Math.min(calc?.details?.equipmentCap || 0, Number(equipmentState.amount || 0) || 0);
                            setAt(flowType, "quote.extensions.equipment.inclusion", "additional");
                            setAt(flowType, "quote.extensions.equipment.amount", amount || "");
                            setAt(flowType, "quote.extensions.equipment.enabled", amount > 0);
                          }}
                          className={cls(
                            "rounded-[14px] border px-4 py-3 text-left transition",
                            equipmentInclusion === "additional" ? "border-[#0A4D82] bg-white shadow-sm" : "border-slate-200 bg-white hover:border-[#A9C7E3]",
                          )}
                        >
                          <div className="text-sm font-semibold text-[#0A4D82]">Belum termasuk, ingin ikut dijamin</div>
                          <div className="mt-1 text-xs leading-5 text-slate-500">Nilainya menambah total yang dijamin dan mengubah premi.</div>
                        </button>
                      </div>
                    </div>

                    {equipmentInclusion ? (
                      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
                        <div>
                          <FieldLabel
                            label={equipmentInclusion === "additional" ? "Nilai yang ingin dijamin" : "Estimasi nilai perlengkapan"}
                            required={equipmentInclusion === "additional"}
                          />
                          <TextInput
                            value={
                              equipmentInclusion === "additional"
                                ? equipmentChargeableAmount ? formatRupiah(equipmentChargeableAmount) : ""
                                : equipmentState.declaredValue ? formatRupiah(Number(equipmentState.declaredValue)) : ""
                            }
                            onChange={(value: string) => {
                              const raw = Number(String(value).replace(/[^0-9]/g, "")) || 0;
                              if (equipmentInclusion === "additional") {
                                const capped = Math.min(calc?.details?.equipmentCap || 0, raw);
                                setAt(flowType, "quote.extensions.equipment.amount", capped || "");
                                setAt(flowType, "quote.extensions.equipment.enabled", capped > 0);
                              } else {
                                setAt(flowType, "quote.extensions.equipment.declaredValue", raw || "");
                              }
                            }}
                            placeholder={
                              equipmentInclusion === "additional"
                                ? `Maksimum ${formatRupiah(calc?.details?.equipmentCap || 0)}`
                                : "Opsional, tidak menambah premi"
                            }
                            inputMode="numeric"
                          />
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-600">
                          {equipmentInclusion === "additional" ? (
                            <>
                              Batas maksimal: {formatRupiah(calc?.details?.equipmentCap || 0)}. Nilai kendaraan utama {formatRupiah(Number(selected.quote.marketValue || 0))} + perlengkapan {formatRupiah(equipmentChargeableAmount)}.
                            </>
                          ) : (
                            <>
                              Premi tidak berubah karena perlengkapan dianggap sudah masuk dalam harga pertanggungan utama {formatRupiah(Number(selected.quote.marketValue || 0))}.
                            </>
                          )}
                        </div>
                      </div>
                    ) : null}

                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                        {equipmentPhotoNames.map((name) => {
                          const uploaded = selected.uploads[name];
                          const photoEvidence = evidence[flowType]?.[name];
                          return (
                            <div key={name} className="rounded-xl border border-[#D8E1EA] bg-white p-2.5">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="text-[13px] font-semibold leading-5 tracking-tight text-slate-900">{getVehiclePhotoTitle(name)}</div>
                                  <div className="mt-1 text-[12px] leading-5 text-slate-500">{getVehiclePhotoHelper(name)}</div>
                                </div>
                                <Camera className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setAt(flowType, `uploads.${name}`, true);
                                  setEvidence((prev) => ({
                                    ...prev,
                                    [flowType]: {
                                      ...prev[flowType],
                                      [name]: createVehiclePhotoMetadata(name, selected.insured.address),
                                    },
                                  }));
                                }}
                                className={cls(
                                  "mt-2 flex h-28 w-full flex-col items-center justify-center rounded-xl border px-3 text-center transition hover:border-[#0A4D82]/30",
                                  uploaded
                                    ? "border-[#D8E1EA] bg-white"
                                    : "border-dashed border-[#C9D6E4] bg-[linear-gradient(180deg,#FAFCFF_0%,#F4F8FC_100%)]",
                                )}
                              >
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[#DCE6F0]">
                                  <Camera className="h-4 w-4 text-[#0A4D82]" />
                                </span>
                                <span className="mt-2 text-[13px] font-medium text-slate-700">
                                  {uploaded ? "Foto sudah diambil" : "Ambil foto"}
                                </span>
                                <span className="mt-0.5 text-[11px] leading-4 text-slate-500">
                                  {uploaded && photoEvidence?.capturedAt ? "Tersimpan untuk verifikasi." : "Ketuk untuk membuka kamera."}
                                </span>
                              </button>
                              {uploaded ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAt(flowType, `uploads.${name}`, false);
                                    setEvidence((prev) => ({
                                      ...prev,
                                      [flowType]: {
                                        ...prev[flowType],
                                        [name]: null,
                                      },
                                    }));
                                  }}
                                  className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-[#D5DDE6] bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Hapus Foto
                                </button>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={() => setAt(flowType, "quote.extensions.equipment.photoCount", Math.max(1, Number(equipmentState.photoCount || 1)) + 1)}
                        className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-3 text-sm font-semibold text-[#0A4D82] hover:bg-[#F8FBFE]"
                      >
                        <Camera className="h-4 w-4" />
                        Tambah Foto Perlengkapan
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
          <div className="rounded-[16px] border border-[#D8E1EA] bg-[#F8FBFE] px-4 py-4 md:px-5">
            <div className="space-y-4">
              <div className="text-[18px] font-bold tracking-tight text-slate-900">Informasi Pertanggungan</div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <FieldLabel label="Tanggal Mulai Perlindungan" helpText="Perlindungan asuransi berlaku 1 tahun sejak tanggal ini." />
                  <input
                    ref={coverageDateFieldRef}
                    type="date"
                    value={selected.quote.coverageStart}
                    onChange={(event) => setAt(flowType, "quote.coverageStart", event.target.value)}
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    onClick={openCoverageDatePicker}
                    className={cls(
                      "flex min-h-[48px] w-full items-center justify-between gap-3 rounded-[12px] border border-[#D5DDE6] bg-white px-4 py-3 text-left text-[14px] transition hover:border-[#A9C7E3] hover:bg-[#F8FBFE]",
                      selected.quote.coverageStart ? "text-slate-900 shadow-[0_8px_18px_rgba(15,23,42,0.04)]" : "text-slate-400",
                    )}
                  >
                    <span className={cls("block", selected.quote.coverageStart ? "font-medium text-slate-900" : "font-normal text-slate-400")}>
                      {coveragePeriodDisplay}
                    </span>
                    <span className="inline-flex shrink-0 items-center rounded-full bg-[#EEF6FD] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0A4D82]">
                      1 Tahun
                    </span>
                  </button>
                  {selected.quote.coverageStart ? (
                    <div className="mt-1.5 text-[12px] leading-5 text-slate-500">
                      Berlaku sampai pukul 12.00 siang pada {coverageEndDisplay}.
                    </div>
                  ) : null}
                </div>
                <div className="md:col-span-2">
                  <FieldLabel
                    label="Pernah diajukan klaim asuransi dalam 3 tahun terakhir?"
                    helpText="Klaim asuransi adalah permintaan ganti rugi ke perusahaan asuransi atas kerusakan, kehilangan, atau kejadian lain yang dijamin polis."
                  />
                  <SelectInput
                    value={selected.underwriting.claimHistory}
                    onChange={(value: string) => setAt(flowType, "underwriting.claimHistory", value)}
                    options={CLAIM_HISTORY_OPTIONS}
                    placeholder="Pilih jawaban yang sesuai"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-[16px] border border-[#D8E1EA] bg-[#F8FBFE] px-4 py-4 md:px-5">
            <div className="space-y-4">
              <div>
                <div className="text-[18px] font-bold tracking-tight text-slate-900">Foto Kendaraan</div>
                {flowType === "carComp" ? (
                  <div className="mt-1 text-xs leading-5 text-slate-500">
                    Foto standar untuk memastikan kondisi kendaraan sebelum polis aktif. Kerusakan sebelum polis diisi di section terpisah.
                  </div>
                ) : null}
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {visibleUploadNames.map((name) => {
                const uploaded = selected.uploads[name];
                const photoTitle = getVehiclePhotoTitle(name);
                const helperText = getVehiclePhotoHelper(name);
                const photoEvidence = evidence[flowType]?.[name];
                return (
                  <div
                    key={name}
                    className="rounded-xl border border-[#D8E1EA] bg-white p-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold leading-5 tracking-tight text-slate-900">{photoTitle}</div>
                        <div className="mt-1 text-[12px] leading-5 text-slate-500">{helperText}</div>
                      </div>
                      <Camera className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAt(flowType, `uploads.${name}`, true);
                        setEvidence((prev) => ({
                          ...prev,
                          [flowType]: {
                            ...prev[flowType],
                            [name]: createVehiclePhotoMetadata(name, selected.insured.address),
                          },
                        }));
                      }}
                      className={cls(
                        "mt-2 flex h-28 w-full flex-col items-center justify-center rounded-xl border px-3 text-center transition hover:border-[#0A4D82]/30",
                        uploaded
                          ? "border-[#D8E1EA] bg-white"
                          : "border-dashed border-[#C9D6E4] bg-[linear-gradient(180deg,#FAFCFF_0%,#F4F8FC_100%)]",
                      )}
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[#DCE6F0]">
                        <Camera className="h-4 w-4 text-[#0A4D82]" />
                      </span>
                      <span className="mt-2 text-[13px] font-medium text-slate-700">
                        {uploaded ? "Foto sudah diambil" : "Ambil foto"}
                      </span>
                      <span className="mt-0.5 text-[11px] leading-4 text-slate-500">
                        {uploaded && photoEvidence?.capturedAt ? "Tersimpan untuk verifikasi." : "Ketuk untuk membuka kamera."}
                      </span>
                    </button>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {uploaded ? (
                        <button
                          type="button"
                          onClick={() => {
                            setAt(flowType, `uploads.${name}`, false);
                            setEvidence((prev) => ({
                              ...prev,
                              [flowType]: {
                                ...prev[flowType],
                                [name]: null,
                              },
                            }));
                          }}
                          className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-[#D5DDE6] bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Hapus Foto
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </div>
          {flowType === "carComp" ? (
            <div className="rounded-xl border border-[#D8E1EA] bg-white p-3">
              <div className="space-y-2.5">
                <div>
                  <div className="text-[14px] font-bold text-slate-900">Kondisi Kendaraan Sebelum Polis</div>
                  <div className="mt-0.5 text-[11px] leading-4 text-slate-500">
                    Pilih apakah kendaraan sudah memiliki kerusakan sebelum polis aktif. Jika ada, unggah satu atau lebih foto area kerusakan.
                  </div>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFlows((prev) => {
                        const copy: any = JSON.parse(JSON.stringify(prev));
                        copy[flowType].underwriting.existingDamageStatus = "none";
                        copy[flowType].underwriting.noExistingDamage = true;
                        Object.keys(copy[flowType].uploads || {}).forEach((key) => {
                          if (isExistingDamageUploadName(key)) copy[flowType].uploads[key] = false;
                        });
                        return copy;
                      });
                      setEvidence((prev) => {
                        const next: any = { ...prev, [flowType]: { ...prev[flowType] } };
                        Object.keys(next[flowType] || {}).forEach((key) => {
                          if (isExistingDamageUploadName(key)) next[flowType][key] = null;
                        });
                        return next;
                      });
                    }}
                    className={cls(
                      "flex min-h-[58px] items-start gap-2.5 rounded-xl border px-3 py-2 text-left transition",
                      existingDamageStatus === "none" ? "border-[#0A4D82] bg-[#F0F7FD] text-[#0A4D82]" : "border-[#D8E1EA] bg-white text-slate-700 hover:border-[#A9C7E3]",
                    )}
                  >
                    <span className={cls("mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border", existingDamageStatus === "none" ? "border-[#0A4D82] bg-[#0A4D82] text-white" : "border-slate-300")}>
                      {existingDamageStatus === "none" ? <Check className="h-3 w-3" /> : null}
                    </span>
                    <span>
                      <span className="block text-[13px] font-bold">Tidak ada kerusakan sebelum polis</span>
                      <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">Tidak perlu unggah foto kerusakan.</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFlows((prev) => {
                        const copy: any = JSON.parse(JSON.stringify(prev));
                        copy[flowType].underwriting.existingDamageStatus = "yes";
                        copy[flowType].underwriting.noExistingDamage = false;
                        copy[flowType].underwriting.existingDamagePhotoCount = Math.max(1, Number(copy[flowType].underwriting.existingDamagePhotoCount || 1));
                        return copy;
                      });
                    }}
                    className={cls(
                      "flex min-h-[58px] items-start gap-2.5 rounded-xl border px-3 py-2 text-left transition",
                      existingDamageStatus === "yes" ? "border-[#0A4D82] bg-[#F0F7FD] text-[#0A4D82]" : "border-[#D8E1EA] bg-white text-slate-700 hover:border-[#A9C7E3]",
                    )}
                  >
                    <span className={cls("mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border", existingDamageStatus === "yes" ? "border-[#0A4D82] bg-[#0A4D82] text-white" : "border-slate-300")}>
                      {existingDamageStatus === "yes" ? <Check className="h-3 w-3" /> : null}
                    </span>
                    <span>
                      <span className="block text-[13px] font-bold">Ada kerusakan sebelum polis</span>
                      <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">Unggah minimal satu foto, bisa lebih dari satu.</span>
                    </span>
                  </button>
                </div>
                {existingDamageStatus === "yes" ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                      {existingDamagePhotoNames.map((name) => {
                        const uploaded = selected.uploads[name];
                        const photoEvidence = evidence[flowType]?.[name];
                        return (
                          <div key={name} className="rounded-xl border border-[#D8E1EA] bg-white p-2.5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-[13px] font-semibold leading-5 tracking-tight text-slate-900">{getVehiclePhotoTitle(name)}</div>
                                <div className="mt-1 text-[12px] leading-5 text-slate-500">{getVehiclePhotoHelper(name)}</div>
                              </div>
                              <Camera className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setAt(flowType, `uploads.${name}`, true);
                                setEvidence((prev) => ({
                                  ...prev,
                                  [flowType]: {
                                    ...prev[flowType],
                                    [name]: createVehiclePhotoMetadata(name, selected.insured.address),
                                  },
                                }));
                              }}
                              className={cls(
                                "mt-2 flex h-28 w-full flex-col items-center justify-center rounded-xl border px-3 text-center transition hover:border-[#0A4D82]/30",
                                uploaded
                                  ? "border-[#D8E1EA] bg-white"
                                  : "border-dashed border-[#C9D6E4] bg-[linear-gradient(180deg,#FAFCFF_0%,#F4F8FC_100%)]",
                              )}
                            >
                              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[#DCE6F0]">
                                <Camera className="h-4 w-4 text-[#0A4D82]" />
                              </span>
                              <span className="mt-2 text-[13px] font-medium text-slate-700">
                                {uploaded ? "Foto sudah diambil" : "Ambil foto"}
                              </span>
                              <span className="mt-0.5 text-[11px] leading-4 text-slate-500">
                                {uploaded && photoEvidence?.capturedAt ? "Tersimpan untuk verifikasi." : "Ketuk untuk membuka kamera."}
                              </span>
                            </button>
                            {uploaded ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setAt(flowType, `uploads.${name}`, false);
                                  setEvidence((prev) => ({
                                    ...prev,
                                    [flowType]: {
                                      ...prev[flowType],
                                      [name]: null,
                                    },
                                  }));
                                }}
                                className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-[#D5DDE6] bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Hapus Foto
                              </button>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => setAt(flowType, "underwriting.existingDamagePhotoCount", Math.max(1, Number(selected.underwriting.existingDamagePhotoCount || 1)) + 1)}
                      className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-3 text-sm font-semibold text-[#0A4D82] hover:bg-[#F8FBFE]"
                    >
                      <Camera className="h-4 w-4" />
                      Tambah Foto Kerusakan
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
      </ActionCard>
    );
  };

  return (
    <div className="min-h-screen bg-[#F3F5F7] text-slate-900">
      <SentOffersHistoryModal open={showSentOffers} onClose={() => setShowSentOffers(false)} />
      <OfferShareModal
        open={showOfferShareModal}
        onClose={() => setShowOfferShareModal(false)}
        recipientName={shareRecipientName}
        shareLabel={shareLabel}
        productIcon={<Shield className="h-5 w-5" />}
        onOpenIndicativeOffer={
          sharedOfferView === "offer-indicative"
            ? () => {
                setShowOfferShareModal(false);
                openOfferPreview(shareUrl);
              }
            : null
        }
        onOpenFinalOffer={
          sharedOfferView === "payment"
            ? () => {
                setShowOfferShareModal(false);
                openOfferPreview(shareUrl);
              }
            : null
        }
        onPrintPdf={handleDownloadSharePdf}
        onOpenWhatsApp={() => {
          const shareMessage = encodeURIComponent(`Halo ${shareRecipientName}, berikut tautan simulasi ${shareLabel}: ${shareUrl}`);
          openShareWindow(`https://wa.me/?text=${shareMessage}`);
        }}
        onOpenEmail={() => {
          const shareMessage = encodeURIComponent(`Halo ${shareRecipientName}, berikut tautan simulasi ${shareLabel}: ${shareUrl}`);
          openShareWindow(`mailto:?subject=${encodeURIComponent(shareSubject)}&body=${shareMessage}`);
        }}
        onCopyLink={handleCopyShareLink}
        onShowQrInfo={() => setShareFeedback(`QR Code belum digenerate otomatis. Untuk handoff ke IT, tautan yang akan diencode adalah: ${shareUrl}`)}
        feedback={shareFeedback}
      />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0A4D82] shadow-sm">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-white">
              <div className="text-[15px] font-black leading-tight md:text-[18px]">Danantara<div className="-mt-1 text-[15px] md:text-[18px]">Indonesia</div></div>
              <div className="hidden text-[15px] font-semibold text-white/95 sm:block">asuransi jasindo</div>
            </div>
            <div className="hidden items-center gap-3 md:flex">
              <button type="button" onClick={() => { window.location.href = "https://esppa.asuransijasindo.co.id/"; }} className="inline-flex items-center gap-2 rounded-[8px] bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"><Home className="h-4 w-4" />Beranda</button>
              <button onClick={returnToLauncher} className="inline-flex items-center gap-2 rounded-[8px] bg-[#F5A623] px-4 py-2 text-sm font-semibold text-white shadow-sm"><Package className="h-4 w-4" />Produk</button>
            </div>
          </div>
          <div className="flex items-center gap-4 text-white">
            {screen === "flow" ? (
              <button
                type="button"
                onClick={fillDemoForCurrentStep}
                className="hidden h-11 items-center justify-center rounded-[10px] border border-white/30 bg-white/10 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-white/15 md:inline-flex"
              >
                Simulasi
              </button>
            ) : null}
            {isGuestExternalSession ? (
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
              <div className="relative">
                <button type="button" onClick={() => setShowUserMenu((prev) => !prev)} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">ID</span>
                  {displayUserName}
                </button>
                <UserPillMenu
                  open={showUserMenu}
                  items={accountMenuItems.map((item) => ({
                    ...item,
                    onClick: () => {
                      setShowUserMenu(false);
                      item.onClick();
                    },
                  }))}
                />
              </div>
            )}
            {!isGuestExternalSession ? (
              <button type="button" aria-label="Lihat notifikasi" className="hidden h-11 w-11 items-center justify-center rounded-[10px] border border-white/20 bg-white/10 text-white shadow-sm hover:bg-white/15 md:inline-flex">
                <Bell className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {screen === "catalog" ? (
        <div className="mx-auto max-w-[1800px] px-4 py-8 md:px-6">
          <div className="text-center text-[28px] font-bold text-slate-900 md:text-[32px]">Pilihan Produk Asuransi Jasindo</div>
          <div className="mt-6 rounded-2xl bg-[#F1F3F5] p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 text-[#0A4D82]">
                <Shield className="h-8 w-8" />
                <div>
                  <div className="text-[22px] font-bold">Asuransi Kendaraan</div>
            <div className="text-[15px] text-slate-600">Perlindungan kendaraan untuk risiko yang dijamin sesuai produk yang dipilih</div>
                </div>
              </div>
              <button onClick={() => setOpenCatalog((v) => !v)}><ChevronDown className={cls("h-6 w-6 text-slate-500 transition", openCatalog && "rotate-180")} /></button>
            </div>
            {openCatalog ? <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{PRODUCTS.map((item) => <ProductCard key={item.id} item={item} onClick={() => openFlow(item.id as FlowType)} />)}</div> : null}
          </div>
        </div>
      ) : (
        <>
          <div className="bg-[#0A4D82] pb-10">
            <div className="mx-auto max-w-[1280px] px-4 pt-6 md:px-6">
              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={returnToLauncher} className="inline-flex items-center gap-2 rounded-[8px] border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"><ArrowLeft className="h-4 w-4" />Kembali ke Produk</button>
                {!isInternalMode && !isGuestExternalSession ? (
                  <div className="inline-flex items-center gap-2 rounded-[10px] border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white shadow-sm">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">View as</span>
                    <span>Calon Pemegang Polis</span>
                  </div>
                ) : null}
              </div>
              <div className="mt-6 text-center text-white">
                {!isGuestExternalSession ? <div className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90">{heroGreeting}</div> : null}
                <h1 className="mt-4 text-[32px] font-bold tracking-tight md:text-[40px]">{activeProduct?.title || "Produk Kendaraan"}</h1>
                <p className="mx-auto mt-2 max-w-3xl text-[14px] text-white/90 md:text-[17px]">{activeProduct?.subtitle || "Perlindungan kendaraan untuk risiko yang dijamin sesuai produk yang dipilih."}</p>
              </div>
              <div className="mx-auto mt-6 max-w-[860px] rounded-2xl bg-white p-3 shadow-2xl shadow-black/15 md:mt-7 md:max-w-[960px] md:p-5">
                <div className="rounded-2xl border border-[#D8E1EA] bg-[#F4F7FA] px-3 py-4 md:px-5 md:py-5">
                  <div className="flex flex-col gap-5 md:flex-row md:gap-5">
                    <StepNode step="Langkah 1" title={stepOneTitle} subtitle={step === 1 ? "Sedang dibuka" : "Selesai"} active={step === 1} done={step > 1} icon={<FileText className="h-4 w-4" />} onClick={() => setStep(1)} />
                    <div className="hidden h-px flex-1 self-center bg-slate-300 md:block" />
                    <StepNode
                      step="Langkah 2"
                      title="Data Lanjutan"
                      subtitle={step === 2 ? (readyForNextStage ? (isInternalMode ? "Siap dikirim" : "Siap dibayar") : "Sedang diisi") : isInternalMode ? "Menunggu" : step > 2 ? "Selesai" : "Menunggu"}
                      active={step === 2}
                      done={!isInternalMode && step > 2}
                      icon={<FileText className="h-4 w-4" />}
                      onClick={showPremiumDetails ? () => setStep(2) : undefined}
                    />
                    {!isInternalMode ? <div className="hidden h-px flex-1 self-center bg-slate-300 md:block" /> : null}
                    {!isInternalMode ? (
                      <StepNode
                        step="Langkah 3"
                        title="Pembayaran"
                        subtitle={step === 3 ? "Sedang dibuka" : readyForNextStage ? "Menunggu" : "Tertunda"}
                        active={step === 3}
                        done={false}
                        icon={<Wallet className="h-4 w-4" />}
                        onClick={step > 1 && readyForNextStage ? () => setStep(3) : undefined}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={showSidebar ? "mx-auto max-w-[1280px] px-4 pb-12 md:px-6" : "mx-auto mt-6 max-w-[860px] px-4 pb-12 md:px-6"}>
            <div className={showSidebar ? "grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]" : "space-y-5"}>
              <div className="space-y-5">
                {step === 1 ? (
                  <>
                    {isSharedCustomerPreview ? (
                      <>
                        {renderSharedPreviewSummaryCard()}
                      </>
                    ) : (
                      <>
                    {isInternalMode ? (
                      <ActionCard>
                        <div className="text-[18px] font-bold text-slate-900">Informasi Calon Pemegang Polis</div>
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          <div className="md:col-span-2">
                            <FieldLabel label="Nama Calon Pemegang Polis" />
                            <div className="relative">
                              <TextInput
                                value={selected.insured.lookup || selected.insured.fullName}
                                onChange={(value: string) => {
                                  setSelectedCustomers((prev) => ({ ...prev, [flowType]: null }));
                                  setAt(flowType, "insured.lookup", value);
                                  setAt(flowType, "insured.fullName", value);
                                }}
                                placeholder={allowCustomerLookup ? "Masukkan nama calon pemegang polis atau kode CIF" : "Masukkan nama calon pemegang polis"}
                                icon={<User className="h-4 w-4" />}
                              />
                              {allowCustomerLookup && selected.insured.lookup && customerSuggestions.length > 0 && !selectedCustomer ? (
                                <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
                                  {customerSuggestions.map((item) => (
                                    <button
                                      key={item.cif}
                                      type="button"
                                      onClick={() => {
                                        setSelectedCustomers((prev) => ({ ...prev, [flowType]: item }));
                                        setAt(flowType, "insured.lookup", `${item.name} - ${item.cif}`);
                                        setAt(flowType, "insured.fullName", item.name);
                                        setAt(flowType, "insured.customerType", item.type);
                                        setAt(flowType, "insured.phone", item.phone);
                                        setAt(flowType, "insured.email", item.email);
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
                            {allowCustomerLookup && selectedCustomer ? (
                              <div className="mt-1 text-xs text-green-600">Data CIF terpilih. Anda akan melanjutkan sebagai nasabah yang sudah terdaftar.</div>
                            ) : allowCustomerLookup && selected.insured.lookup ? (
                              <div className="mt-1 text-xs text-slate-500">Nama belum cocok dengan CIF simulasi. Sistem akan memperlakukan sebagai nasabah baru.</div>
                            ) : null}
                          </div>
                          {Boolean((selected.insured.lookup || selected.insured.fullName || "").trim()) && (!allowCustomerLookup || (!selectedCustomer && !isDigitsOnly(selected.insured.lookup || selected.insured.fullName))) ? (
                            <div>
                              <FieldLabel label="Tipe Nasabah" />
                              <SelectInput
                                value={selected.insured.customerType}
                                onChange={(value: string) => setAt(flowType, "insured.customerType", value)}
                                options={CUSTOMER_TYPES}
                                placeholder="Nasabah ini perorangan atau badan usaha?"
                              />
                            </div>
                          ) : null}
                          <div>
                            <FieldLabel label="Nomor Handphone" />
                            <TextInput
                              value={selected.insured.phone}
                              onChange={(value: string) => setAt(flowType, "insured.phone", value)}
                              placeholder="08xxxxxxxxxx"
                              icon={<Phone className="h-4 w-4" />}
                            />
                          </div>
                          <div>
                            <FieldLabel label="Alamat Email" />
                            <TextInput
                              value={selected.insured.email}
                              onChange={(value: string) => setAt(flowType, "insured.email", value)}
                              placeholder="nama@email.com"
                              icon={<Mail className="h-4 w-4" />}
                              type="email"
                            />
                          </div>
                        </div>
                      </ActionCard>
                    ) : null}

                    {!isInternalMode && !hasSharedOfferJourney ? (
                      <ActionCard>
                        <div className="text-center">
                          <div className="text-[26px] font-bold tracking-tight text-slate-900 md:text-[30px]">Simulasi Premi</div>
                          <div className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-[15px]">
                            Data yang Anda isi pada tahap simulasi ini merupakan bagian awal dari SPAU (Surat Permohonan Asuransi Umum) elektronik dan menjadi dasar simulasi premi serta langkah berikutnya.
                          </div>
                        </div>
                      </ActionCard>
                    ) : null}

                    <ActionCard>
                      <div className="text-[18px] font-bold text-slate-900">Informasi Kendaraan</div>
                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div>
                          <FieldLabel label={flowType === "motor" ? "Merek / Tipe Motor" : "Merek / Tipe Mobil"} />
                          <VehicleAutocomplete
                            value={selected.quote.vehicleName}
                            onChange={(value: string) => updateVehicleSelection(flowType, value)}
                            onSelect={(item: VehicleCatalogItem) => updateVehicleSelection(flowType, item.label, item)}
                            catalogType={flowType === "motor" ? "motor" : "car"}
                            placeholder={flowType === "motor" ? "Sepeda motor ini merek dan tipenya apa?" : "Mobil ini merek dan tipenya apa?"}
                          />
                        </div>
                        <div>
                          <FieldLabel label="Kode wilayah plat / TNKB" />
                          <TextInput value={selected.quote.plateRegion} onChange={(value: string) => setAt(flowType, "quote.plateRegion", value)} placeholder="Pilih kode wilayah kendaraan" icon={<MapPin className="h-4 w-4" />} listId={`${flowType}-plate-list`} />
                          <datalist id={`${flowType}-plate-list`}>{PLATES.map((p) => <option key={p} value={p} />)}</datalist>
                        </div>
                        <div>
                          <FieldLabel label="Tahun Pembuatan Kendaraan" helpText="Sesuai tahun pembuatan/manufacture year pada STNK." />
                          <VehicleYearPicker
                            value={selected.quote.year}
                            onChange={(value: string) => setAt(flowType, "quote.year", value)}
                            minYear={flowType === "carComp" ? MIN_YEAR_COMP : MIN_YEAR_TLO}
                            maxYear={CURRENT_YEAR}
                            placeholder="Kendaraan ini dibuat tahun berapa?"
                          />
                        </div>
                        <div>
                          <FieldLabel label="Harga Pertanggungan" helpText="Harga pertanggungan adalah nilai kendaraan yang diasuransikan. Isi sesuai harga pasar wajar kendaraan saat ini, karena nilai ini menjadi dasar perhitungan premi dan batas ganti rugi sesuai ketentuan polis." />
                          <TextInput value={selected.quote.marketValue ? formatRupiah(Number(String(selected.quote.marketValue).replace(/[^0-9]/g, ""))) : ""} onChange={(value: string) => setAt(flowType, "quote.marketValue", String(value).replace(/[^0-9]/g, ""))} placeholder={flowType === "motor" ? "Berapa harga pertanggungan sepeda motor ini?" : "Berapa harga pertanggungan mobil ini?"} inputMode="numeric" />
                          {String(selected.quote.marketValue || "").trim() && !validateMaxHP(flowType, Number(selected.quote.marketValue || 0)) ? <div className="mt-2 text-xs font-medium text-[#E8A436]">{maxHPText(flowType)}</div> : null}
                        </div>
                        <div className="md:col-span-2">
                          <div className="md:max-w-[760px]">
                            <div className="min-w-0">
                              <FieldLabel label="Penggunaan Kendaraan" helpText={vehicleUsageHelpText} />
                              <SelectInput value={selected.quote.usage} onChange={(value: string) => setAt(flowType, "quote.usage", value)} options={["Pribadi", "Komersial"]} placeholder="Kendaraan ini digunakan untuk apa?" />
                            </div>
                            {selected.quote.usage === "Pribadi" && vehicleUsageSummaryText ? (
                              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
                                <span className="font-semibold text-slate-800">Penggunaan Pribadi</span> berarti kendaraan digunakan untuk keperluan pribadi dan bukan untuk disewakan atau menerima balas jasa, misalnya untuk ojek, kurir berbayar, layanan antar, atau sewa kendaraan.
                              </div>
                            ) : null}
                            {selected.quote.usage === "Komersial" && vehicleUsageSummaryText ? (
                              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
                                <span className="font-semibold text-slate-800">Penggunaan Komersial</span> berarti kendaraan digunakan untuk disewakan atau menerima balas jasa, misalnya untuk ojek, kurir berbayar, layanan antar, atau sewa kendaraan.
                              </div>
                            ) : null}
                            {shouldShowTariffSummary ? (
                              <div className="mt-3 rounded-xl border border-[#D5DDE6] bg-[#F8FBFE] px-3 py-2 text-sm leading-6 text-slate-600">
                                <span className="font-semibold text-[#0A4D82]">{tariffInfoSummary}</span>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </ActionCard>

                    {showPremiumDetails ? renderInternalCarCompLoadingSetting() : null}
                    {showPremiumDetails ? renderCoverageSummaryCard() : null}
                    {showPremiumDetails ? renderPremiumSummaryCard(false) : null}
                    {step === 1 ? renderStepOneActions() : null}
                    {!isInternalMode && journeyStatus && step === 1 ? (
                      <ActionCard>
                        <div className="rounded-xl border border-[#CFE0F0] bg-[#F8FBFE] p-4 text-sm text-[#0A4D82]">{journeyStatus}</div>
                      </ActionCard>
                    ) : null}
                      </>
                    )}
                  </>
                ) : null}

                {step === 2 ? renderStepTwoContent(true) : null}
                {isInternalMode && step === 2 ? renderInternalStepTwoActions() : null}
                {!isInternalMode && step === 2 ? renderExternalStepTwoActions() : null}

                {!isInternalMode && step === 3 ? (
                  <>
                    <SectionCard
                      title="Ringkasan Sebelum Pembayaran"
                      subtitle={`Tinjau kembali ringkasan Anda sebelum melanjutkan ke pembayaran. Ringkasan ini disusun dari data SPAU (Surat Permohonan Asuransi Umum) elektronik yang Anda isi dan lengkapi, serta mengacu pada ${policySummaryTitle}.`}
                      headerAlign="center"
                      heroHeader
                    >
                      <div className="rounded-[24px] border border-[#D8E1EA] bg-[linear-gradient(180deg,#FBFDFF_0%,#F5F9FD_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                        <div className="space-y-3">
                          <OfferSummarySection title="Ringkasan Informasi Calon Pemegang Polis">
                            <div className="space-y-2.5">
                              <OfferSummaryKeyValue label="Nama Calon Pemegang Polis" value={insuredSummaryName} />
                              <OfferSummaryKeyValue label="Alamat Email" value={insuredSummaryEmail} />
                              <OfferSummaryKeyValue label="Nomor Handphone" value={insuredSummaryPhone} />
                            </div>
                          </OfferSummarySection>

                          <OfferSummarySection title="Ringkasan Informasi Kendaraan">
                            <div className="space-y-2.5">
                              <OfferSummaryKeyValue label={flowType === "motor" ? "Merek / Tipe Motor" : "Merek / Tipe Kendaraan"} value={vehicleSummaryName} />
                              <OfferSummaryKeyValue label="Nomor Polisi / TNKB" value={vehicleSummaryPlateNumber} />
                              <OfferSummaryKeyValue label="Kode wilayah plat / TNKB" value={vehicleSummaryPlateRegion} />
                              <OfferSummaryKeyValue label="Tahun Pembuatan Kendaraan" value={vehicleSummaryYear} />
                              <OfferSummaryKeyValue label="Penggunaan Kendaraan" value={vehicleSummaryUsage} />
                              <OfferSummaryKeyValue label="Harga Pertanggungan" value={vehicleSummaryValue} />
                              <OfferSummaryKeyValue label="Riwayat Klaim 3 Tahun Terakhir" value={claimHistorySummary} />
                              <OfferSummaryKeyValue label="Periode Perlindungan" value={vehicleSummaryCoveragePeriod} />
                            </div>
                          </OfferSummarySection>

                          <OfferSummarySection title="Ringkasan Syarat dan Ketentuan">
                            <div className="space-y-4">
                              <div className="text-[15px] font-normal text-slate-900">{policySummaryTitle}</div>
                              <div className="space-y-2">
                                <div className="text-[13px] font-medium text-slate-500">Risiko yang dijamin</div>
                                <VehicleGuaranteeDetailCard
                                  title={mainCoverTitle(flowType)}
                                  icon={Shield}
                                  premium={displayedBasePremium}
                                  detail={mainCoverText(flowType)}
                                  deductible={mainDeductibleText(flowType, selected.quote.vehicleType, selected.quote)}
                                />
                              </div>
                              <div>
                                <div className="mb-2 flex items-center justify-between gap-3">
                                  <div className="text-[13px] font-medium text-slate-500">Perluasan Jaminan</div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCheckoutStatus("");
                                      setStep(1);
                                      window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                    className="text-[12px] font-medium text-[#0A4D82] underline underline-offset-2 hover:text-[#0D5B98]"
                                  >
                                    {selectedExtensionDetailItems.length ? "Ubah Perluasan Jaminan" : "Tambahkan Perluasan Jaminan"}
                                  </button>
                                </div>
                                {selectedExtensionDetailItems.length ? (
                                  <div className="space-y-2">
                                    {selectedExtensionDetailItems.map((item) => (
                                      <VehicleGuaranteeDetailCard
                                        key={item.title}
                                        title={item.title}
                                        icon={item.icon}
                                        premium={item.premium}
                                        coverageAmount={item.coverageAmount}
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
                            <PremiumPriceHero label="Total Pembayaran" value={displayedTotalPremium} />
                            <PremiumBreakdown>
                              <ProposalRow label="Premi" value={displayedBasePremium} />
                              {displayedExtensionPremium ? <ProposalRow label="Premi Perluasan" value={displayedExtensionPremium} /> : null}
                              <ProposalRow label="Biaya Meterai" value={displayedStampDuty} />
                            </PremiumBreakdown>
                          </OfferSummarySection>
                        </div>
                      </div>
                    </SectionCard>

                    <SectionCard title="Pilih Metode Pembayaran" subtitle="Pilih metode pembayaran yang ingin Anda gunakan untuk melanjutkan proses polis.">
                      <div className="space-y-3">
                        {PAYMENT_OPTIONS.map((method) => (
                          <button
                            key={method}
                            onClick={() => { setAt(flowType, "paymentMethod", method); setCheckoutStatus(""); }}
                            className={cls(
                              "flex w-full items-center justify-between rounded-xl border px-4 py-4 text-left transition",
                              selected.paymentMethod === method ? "border-[#0A4D82] bg-[#F8FBFE] shadow-sm" : "border-slate-200 bg-white hover:border-[#C9D5E3] hover:bg-[#FBFDFF]",
                            )}
                          >
                            <span className="font-semibold text-slate-900">{method}</span>
                            {selected.paymentMethod === method ? <CheckCircle2 className="h-5 w-5 text-[#0A4D82]" /> : null}
                          </button>
                        ))}
                      </div>
                      {operatingBlockedMessage ? <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{operatingBlockedMessage}</div> : null}
                      {checkoutStatus ? <div className="mt-4 rounded-xl border border-[#CFE0F0] bg-[#F8FBFE] p-4 text-sm text-[#0A4D82]">{checkoutStatus}</div> : null}
                    </SectionCard>

                    <SectionCard title="Lanjutkan Pembayaran" subtitle="Selesaikan persetujuan atas SPAU elektronik ini terlebih dahulu, lalu lanjutkan pembayaran.">
                      {(() => {
                        const paymentPendingItems = [];
                        if (!selected.paymentMethod) paymentPendingItems.push("Pilih salah satu metode pembayaran terlebih dahulu.");
                        if (!selected.agree) paymentPendingItems.push("Buka dan setujui Syarat dan Ketentuan Persetujuan atas SPAU elektronik ini.");
                        return (
                          <>
                      <div className="rounded-2xl border border-[#D8E1EA] bg-white px-4 py-4">
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => setShowConsentModal(true)}
                            className={cls(
                              "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border transition",
                              selected.agree ? "border-[#0A4D82] bg-[#0A4D82] text-white" : "border-[#B7C7D8] bg-white text-transparent hover:border-[#0A4D82]",
                            )}
                            aria-label={selected.agree ? "Persetujuan kebijakan sudah disetujui" : "Buka syarat dan ketentuan persetujuan"}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <div className="min-w-0 text-sm leading-6 text-slate-700">
                            <span>Saya telah membaca dan menyetujui </span>
                            <button
                              type="button"
                              onClick={() => setShowConsentModal(true)}
                              className="inline p-0 font-medium text-[#0A4D82] underline underline-offset-2 hover:text-[#0D5B98]"
                            >
                              Syarat dan Ketentuan Persetujuan
                            </button>
                            <span> atas SPAU elektronik ini.</span>
                          </div>
                        </div>
                      </div>
                      {!checkoutStatus && paymentPendingItems.length ? (
                        <div className="mt-4 rounded-xl border border-[#F0D8A8] bg-[#FFF7E8] p-3 text-[12px] leading-[1.45] text-[#8A6830]">
                          <div className="font-semibold text-[#8A6830]">Yang masih perlu dilengkapi</div>
                          <div className="mt-1.5 space-y-1.5">
                            {paymentPendingItems.map((item) => (
                              <div key={item} className="flex items-start gap-2">
                                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C1892E]" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => { setStep(2); setCheckoutStatus(""); }}
                          className="flex h-[48px] w-full items-center justify-center rounded-[12px] border border-[#D5DEEA] bg-white px-5 text-center text-sm font-semibold text-[#0A4D82] shadow-sm hover:bg-[#F8FBFE] sm:flex-1"
                        >
                          Kembali ke Data Lanjutan
                        </button>
                        <button
                          type="button"
                          onClick={() => { if (canIssue && canProceedPayment) setCheckoutStatus("Pembayaran berhasil disimulasikan. Sistem akan melanjutkan ke validasi pembayaran dan penerbitan dokumen final."); }}
                          disabled={!canIssue || !canProceedPayment}
                          className={cls("flex h-[48px] w-full items-center justify-center rounded-[12px] px-5 text-center text-sm font-bold uppercase tracking-wide text-white shadow-sm sm:flex-1", canIssue && canProceedPayment ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}
                        >
                          {checkoutStatus ? "Pembayaran Selesai" : "Lanjutkan Pembayaran"}
                        </button>
                      </div>
                          </>
                        );
                      })()}
                    </SectionCard>
                  </>
                ) : null}
              </div>

              {showSidebar ? (
              <aside className="h-fit self-start rounded-2xl border border-[#D8E1EA] bg-white p-4 shadow-sm md:sticky md:top-32 md:p-5">
                <div className="text-[18px] font-bold text-slate-900">Ringkasan Pembayaran</div>
                <div className="mt-4">
                  <SummaryRow label="Produk" value={activeProduct?.title || "-"} />
                  <SummaryRow label="Kode Wilayah" value={selected.quote.plateRegion || "-"} />
                  <SummaryRow label="Penggunaan" value={selected.quote.usage || "-"} />
                  {flowType !== "motor" ? <SummaryRow label="Nilai yang Dilindungi" value={formatRupiah(calc?.details?.insuredValue || Number(selected.quote.marketValue || 0))} /> : null}
                  {flowType !== "motor" && selectedVehicleMeta ? <SummaryRow label="Kategori Kendaraan" value={`${selectedVehicleMeta.ojkCategory} · ${selectedVehicleMeta.fuelType}`} /> : null}
                </div>
                <div className="mt-3 border-t border-slate-100 pt-2.5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Rincian</div>
                  <SummaryRow label="Premi" value={formatRupiah(flowType === "carComp" ? calc.mainPremium : getMainPremiumSplit(flowType, calc).ownDamage + getMainPremiumSplit(flowType, calc).theft)} />
                  {calc.extensionTotal > 0 ? <SummaryRow label="Premi Perluasan" value={formatRupiah(calc.extensionTotal)} /> : null}
                  <SummaryRow label="Biaya Meterai" value={formatRupiah(calc.stamp)} />
                </div>
                <div className="mt-4 rounded-2xl border border-[#D8E1EA] bg-[linear-gradient(180deg,#FFFFFF_0%,#F4F8FD_100%)] px-4 py-3 shadow-[0_8px_18px_rgba(15,23,42,0.04)] md:px-6 md:py-4">
                  <div className="mx-auto flex max-w-[460px] flex-col items-center text-center">
                    <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">{!isInternalMode && readyForNextStage ? "Premi 1 Tahun" : "Estimasi Premi 1 Tahun"}</div>
                    <div className="mt-2 text-[20px] font-bold tracking-tight text-[#0A4D82] md:text-[22px]">{formatRupiah(calc.total)}</div>
                  </div>
                </div>
                {journeyStatus ? <div className="mt-4 rounded-xl border border-[#CFE0F0] bg-[#F8FBFE] p-4 text-sm text-[#0A4D82]">{journeyStatus}</div> : null}
                {step === 2 ? (
                  <div className="mt-4 grid gap-3">
                    <button
                      onClick={() => {
                        if (isInternalMode) {
                          if (readyForNextStage) handleSendFinalizedOffer();
                          return;
                        }
                        if (readyForNextStage) {
                          setJourneyStatus("");
                          setStep(3);
                        }
                      }}
                      disabled={!readyForNextStage}
                      className={cls("flex h-[48px] w-full items-center justify-center rounded-[12px] px-5 text-center text-sm font-semibold text-white shadow-sm", readyForNextStage ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}
                    >
                      {isInternalMode ? "Kirim Penawaran Final" : "Lanjut ke Pembayaran"}
                    </button>
                    {!isInternalMode && hasSharedOfferJourney ? (
                      <button
                        type="button"
                        onClick={() => setJourneyStatus("Tim asuransi akan membantu melengkapi data lanjutan kendaraan ini.")}
                        className="flex h-11 w-full items-center justify-center rounded-[12px] border border-[#D5DEEA] bg-white text-sm font-semibold text-[#0A4D82] hover:bg-[#F8FBFE]"
                      >
                        Minta Bantuan Isi Data Lanjutan
                      </button>
                    ) : null}
                    <button onClick={() => { setJourneyStatus(""); setStep(1); }} className="flex h-11 w-full items-center justify-center rounded-[12px] border border-[#D5DEEA] bg-white text-sm font-semibold text-[#0A4D82] hover:bg-[#F8FBFE]">{isInternalMode ? "Kembali ke Data Awal" : hasSharedOfferJourney ? "Kembali ke Tinjau Penawaran" : "Kembali ke Simulasi Premi"}</button>
                    {!isInternalMode && hasSharedOfferJourney ? (
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setJourneyStatus("Penawaran kendaraan ini ditandai untuk tidak dilanjutkan.")}
                          className="text-xs font-medium text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
                        >
                          Tidak mau melanjutkan penawaran
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {step === 2 && ((selected.ui.dataMode === "scan" && !selected.ktpRead) || ((selected.ui.stnkMode === "scan" || flowType === "carComp") && !selected.stnkRead)) ? <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4" /><div>Dokumen yang dipilih untuk isi otomatis belum terbaca penuh. Anda masih bisa lanjut dengan pengisian manual bila diperlukan.</div></div></div> : null}
              </aside>
              ) : null}
            </div>
          </div>
          <ConsentModal open={showConsentModal} agreed={selected.agree} onClose={() => setShowConsentModal(false)} onAgree={() => { setAt(flowType, "agree", true); setShowConsentModal(false); }} />
        </>
      )}
    </div>
  );
}












