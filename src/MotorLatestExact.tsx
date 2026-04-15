import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Building2,
  Camera,
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
  User,
  Wallet,
  X,
} from "lucide-react";
import { canProceedToPaymentFromOperating, paymentBlockMessage } from "./operatingLayer.js";
import { SentOffersHistoryModal, UserPillMenu } from "./components/UserPillMenu.jsx";
import { VehicleYearPicker } from "./components/VehicleYearPicker.jsx";
import { createEmptyDocumentCheck, createPhotoEvidence, createTransactionAuthority, evaluateDocumentRead, summarizeFraudSignals } from "./platform/securityControls.js";
import { PASSENGER_CAR_MODELS, getPassengerCarMeta } from "./carDomain.js";

const CURRENT_YEAR = 2026;
const MIN_YEAR_TLO = CURRENT_YEAR - 20;
const MIN_YEAR_COMP = CURRENT_YEAR - 15;

type FlowType = "motor" | "carComp" | "carTlo";
type DataMode = "scan" | "manual";

type ExtensionsState = Record<string, any>;

type FlowState = {
  ui: { extOpen: boolean; dataMode: DataMode };
  quote: {
    usage: string;
    vehicleType: string;
    plateRegion: string;
    vehicleName: string;
    year: string;
    marketValue: string;
    coverageStart: string;
    coverageEnd: string;
    extensions: ExtensionsState;
  };
  insured: { customerType: string; nik: string; fullName: string; address: string; email: string; phone: string };
  vehicle: { plateNumber: string; chassisNumber: string; engineNumber: string; color: string; year: string; contactOnLocation: string };
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
    title: "Total Loss Kendaraan - Motor",
    category: "Kendaraan",
    subtitle: "Perlindungan motor untuk kerugian total akibat risiko yang dijamin polis, termasuk pencurian dan kebakaran.",
    gradient: "from-slate-700 via-slate-600 to-slate-500",
  },
  {
    id: "carComp",
    title: "Kendaraan Bermotor Roda 4 - Comprehensive",
    category: "Kendaraan",
    subtitle: "Perlindungan mobil terhadap kerusakan atau kehilangan akibat tabrakan, perbuatan jahat, pencurian, dan kebakaran.",
    gradient: "from-sky-800 via-sky-700 to-sky-600",
  },
  {
    id: "carTlo",
    title: "Total Loss Kendaraan - Mobil",
    category: "Kendaraan",
    subtitle: "Perlindungan mobil untuk kerugian total akibat risiko yang dijamin polis, termasuk pencurian dan kebakaran.",
    gradient: "from-slate-900 via-slate-800 to-slate-700",
  },
] as const;

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

const MOTOR_SUGGESTIONS = [
  "Honda BeAT CBS",
  "Honda Scoopy Sporty",
  "Honda Vario 125 CBS",
  "Honda PCX 160 CBS",
  "Yamaha NMAX 155 Connected",
  "Yamaha Aerox 155 Connected",
  "Suzuki Nex II",
];

const CAR_SUGGESTIONS = [
  "Toyota Avanza 1.5 G",
  "Toyota Veloz 1.5 Q",
  "Honda Brio Satya E",
  "Mitsubishi Xpander Ultimate",
  "Suzuki Ertiga GX",
  "Suzuki XL7 Beta",
];

const MOTOR_EXTS = [
  { id: "tpl", label: "Jaminan Tanggung Jawab Hukum terhadap Pihak Ketiga", type: "amount", icon: Shield },
  { id: "srcc", label: "Risiko Kerusuhan dan Huru-hara", type: "toggle", icon: AlertTriangle },
  { id: "ts", label: "Risiko Terorisme", type: "toggle", icon: AlertTriangle },
  { id: "flood", label: "Risiko Banjir", type: "toggle", icon: MapPin },
  { id: "quake", label: "Risiko Gempa Bumi", type: "toggle", icon: AlertTriangle },
] as const;

const CAR_EXTS = [
  { id: "tpl", label: "Jaminan Tanggung Jawab Hukum terhadap Pihak Ketiga", type: "amount", icon: Shield },
  { id: "srcc", label: "Risiko Kerusuhan dan Huru-hara", type: "toggle", icon: AlertTriangle },
  { id: "ts", label: "Risiko Terorisme", type: "toggle", icon: AlertTriangle },
  { id: "flood", label: "Risiko Banjir", type: "toggle", icon: MapPin },
  { id: "quake", label: "Risiko Gempa Bumi", type: "toggle", icon: AlertTriangle },
  { id: "driverPa", label: "Kecelakaan Diri Pengemudi", type: "amount", icon: User },
  { id: "passengerPa", label: "Kecelakaan Diri Penumpang", type: "amount-seat", icon: User },
  { id: "ambulance", label: "Biaya ambulan", type: "toggle", icon: Phone },
  { id: "authorizedWorkshop", label: "Bengkel authorized", type: "toggle", icon: Building2 },
  { id: "theftByOwnDriver", label: "Risiko pencurian oleh pengemudi sendiri", type: "toggle", icon: AlertTriangle },
] as const;

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
const THEFT_BY_OWN_DRIVER_RATE = 0.001;
const AMBULANCE_PREMIUM = 50000;

const EXT_INFO: Record<string, string> = {
  tpl: "Jika dicantumkan dalam Ikhtisar Pertanggungan, menjamin tanggung jawab hukum Tertanggung atas kematian, cedera badan, biaya perawatan atau pengobatan, serta kerugian atau kerusakan harta benda milik penumpang atau pihak ketiga yang timbul langsung akibat kecelakaan kendaraan yang dijamin polis.",
  srcc: "Menjamin kerugian atau kerusakan kendaraan yang secara langsung disebabkan oleh kerusuhan, pemogokan, penghalangan bekerja, tawuran, huru-hara, pembangkitan rakyat tanpa senjata api, revolusi tanpa senjata api, serta penjarahan yang terjadi dalam peristiwa tersebut.",
  ts: "Menjamin kerugian atau kerusakan kendaraan yang secara langsung disebabkan oleh makar, terorisme, atau sabotase.",
  flood: "Menjamin kerugian atau kerusakan yang secara langsung disebabkan oleh banjir, angin topan, badai, hujan es, genangan air, atau tanah longsor yang mengenai kendaraan.",
  quake: "Menjamin kerugian atau kerusakan kendaraan yang secara langsung disebabkan oleh gempa bumi, tsunami, dan/atau letusan gunung berapi.",
  driverPa: "Menjamin cedera badan, kematian, dan/atau biaya pengobatan pengemudi yang secara langsung disebabkan oleh kecelakaan kendaraan yang dijamin polis.",
  passengerPa: "Menjamin cedera badan, kematian, dan/atau biaya pengobatan penumpang yang secara langsung disebabkan oleh kecelakaan kendaraan yang dijamin polis.",
  equipment: "Perlengkapan tambahan adalah aksesori atau perangkat non-standar yang bukan bawaan pabrik dan ingin ikut dijamin bersama kendaraan.",
  ambulance: "Menjamin biaya ambulans per kejadian akibat kecelakaan dari risiko yang dijamin polis, sampai batas maksimum sesuai Ikhtisar Pertanggungan.",
  authorizedWorkshop: "Memberikan fasilitas perbaikan di bengkel resmi sesuai merek kendaraan atau bengkel setara dengan persetujuan Penanggung.",
  theftByOwnDriver: "Menjamin risiko pencurian yang dilakukan oleh pengemudi yang dipekerjakan Tertanggung, sepanjang memenuhi syarat masa kerja minimum sesuai ketentuan polis.",
};
const CONSENT_SECTIONS = [
  {
    key: "produk",
    title: "Pemahaman Produk",
    summary: "Tertanggung menyatakan telah menerima penjelasan, membaca, dan memahami informasi produk asuransi.",
    detail: "Tertanggung menyatakan telah menerima penjelasan, membaca, dan memahami informasi produk asuransi yang diajukan pada penawaran ini.",
  },
  {
    key: "data",
    title: "Pemrosesan Data Pribadi",
    summary: "Tertanggung memberi izin pemrosesan data pribadi untuk penerbitan polis, pelayanan klaim, dan peningkatan layanan.",
    detail: "Tertanggung memberikan izin kepada Penanggung untuk memproses data yang dicantumkan dalam formulir ini dan mengungkapkannya kepada pihak yang ditunjuk untuk pelayanan polis, klaim, dan peningkatan layanan sesuai ketentuan yang berlaku.",
  },
  {
    key: "material",
    title: "Kebenaran Fakta Material",
    summary: "Seluruh keterangan yang diberikan harus benar dan menjadi dasar penerbitan polis.",
    detail: "Tertanggung menyatakan seluruh informasi yang diberikan benar, jujur, dan menjadi dasar bagi penerbitan polis. Ketidaksesuaian data dapat memengaruhi penerimaan risiko maupun penyelesaian klaim.",
  },
];

function cls(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(" ");
}

function createFlowState(type: FlowType): FlowState {
  const isMotor = type === "motor";
  return {
    ui: { extOpen: false, dataMode: "scan" },
    quote: {
      usage: "",
      vehicleType: "",
      plateRegion: "",
      vehicleName: "",
      year: "",
      marketValue: "",
      coverageStart: "",
      coverageEnd: "",
      extensions: isMotor
        ? { tpl: { enabled: false, amount: "" }, srcc: { enabled: false }, ts: { enabled: false }, flood: { enabled: false }, quake: { enabled: false } }
        : {
            tpl: { enabled: false, amount: "" },
            srcc: { enabled: false },
            ts: { enabled: false },
            flood: { enabled: false },
            quake: { enabled: false },
            driverPa: { enabled: false, amount: "" },
            passengerPa: { enabled: false, amount: "", seats: "" },
            equipment: { enabled: false, amount: "" },
            ambulance: { enabled: false },
            authorizedWorkshop: { enabled: false },
            theftByOwnDriver: { enabled: false },
          },
    },
    insured: { customerType: "", nik: "", fullName: "", address: "", email: "", phone: "" },
    vehicle: { plateNumber: "", chassisNumber: "", engineNumber: "", color: "", year: "", contactOnLocation: "" },
    ktpRead: false,
    stnkRead: false,
    uploads: isMotor
      ? { "Ambil foto bagian depan": false, "Ambil foto bagian belakang": false }
      : { "Ambil foto bagian depan": false, "Ambil foto bagian belakang": false, "Ambil foto bagian samping kanan": false, "Ambil foto bagian samping kiri": false },
    paymentMethod: "",
    promoCode: "",
    agree: false,
  };
}

function formatRupiah(v: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(v || 0));
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
  if (PASSENGER_CAR_MODELS.includes(vehicleType)) return "Angkutan Penumpang";
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

function computeCarTplFee(limitAmount: number, marketValue: number, vehicleType: string) {
  const amount = Math.max(0, Number(limitAmount) || 0);
  const hp = Math.max(0, Number(marketValue) || 0);
  const vehicleCategory = getCarCategory(vehicleType);
  if (!hp) return 0;
  if (vehicleCategory === "Angkutan Penumpang") {
    if (amount <= 25000000) return Math.round(hp * 0.01);
    if (amount <= 50000000) return Math.round(hp * 0.005);
    return Math.round(hp * 0.0025);
  }
  return progressiveTPL(Math.min(100000000, amount), vehicleType);
}
function addOneYear(dateStr: string) {
  if (!dateStr) return "";
  const x = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(x.getTime())) return "";
  x.setFullYear(x.getFullYear() + 1);
  return x.toISOString().slice(0, 10);
}
function getStampDuty(netPremium: number) {
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
  const equipmentAmount = !isMotor
    ? Math.min(
        Math.min(25000000, Math.round(mv * 0.1)),
        Math.max(0, Number(q.extensions.equipment?.amount || 0) || 0)
      )
    : 0;
  const insuredValue = mv + equipmentAmount;
  if (itemId === "tpl") {
    if (isMotor) {
      const amount = Math.min(1000000, Math.max(0, Number(q.extensions.tpl.amount || 1000000)));
      return progressiveTPL(amount, "Angkutan Penumpang");
    }
    const amount = Math.min(100000000, Math.max(0, Number(q.extensions.tpl.amount || 25000000)));
    return computeCarTplFee(amount, mv, q.vehicleType || "Angkutan Penumpang");
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
    const amount = Math.max(0, Number(q.extensions.driverPa.amount || 10000000) || 10000000);
    const capped = Math.min(25000000, mv || 25000000, amount);
    return Math.round(capped * DRIVER_PA_RATE);
  }
  if (itemId === "passengerPa") {
    const amount = Math.max(0, Number(q.extensions.passengerPa.amount || 10000000) || 10000000);
    const seats = Math.min(7, Math.max(1, Number(q.extensions.passengerPa.seats || 4) || 4));
    const capped = Math.min(25000000, mv || 25000000, amount);
    return Math.round(capped * PASSENGER_PA_RATE * seats);
  }
  if (itemId === "equipment") {
    const baseRate = flowType === "carComp"
      ? getCarCompBaseRate(region, q.vehicleType || "Angkutan Penumpang", mv)
      : getCarTloBaseRate(region, q.vehicleType || "Angkutan Penumpang", mv);
    return Math.round(equipmentAmount * baseRate);
  }
  if (itemId === "ambulance") return AMBULANCE_PREMIUM;
  if (itemId === "authorizedWorkshop") return Math.round(mv * AUTH_WORKSHOP_RATE);
  if (itemId === "theftByOwnDriver") return Math.round(mv * THEFT_BY_OWN_DRIVER_RATE);
  return 0;
}

function calcMotor(q: any) {
  const mv = Math.max(0, Number(q.marketValue) || 0);
  const region = getRegion(q.plateRegion);
  const mainPremium = Math.round(mv * TLO_RATES_MOTOR[region as 1 | 2 | 3].min);
  const details = {
    tplFee: q.extensions.tpl.enabled ? progressiveTPL(Math.min(1000000, Number(q.extensions.tpl.amount) || 0), "Angkutan Penumpang") : 0,
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
  equipmentRate = 0
) {
  const equipmentCap = Math.min(25000000, Math.round(mv * 0.1));
  const equipmentAmount = q.extensions.equipment?.enabled ? Math.min(equipmentCap, Math.max(0, Number(q.extensions.equipment.amount) || 0)) : 0;
  const insuredValue = mv + equipmentAmount;
  const driverPaAmount = q.extensions.driverPa?.enabled ? Math.min(25000000, mv || 25000000, Math.max(0, Number(q.extensions.driverPa.amount) || 0)) : 0;
  const passengerPaAmount = q.extensions.passengerPa?.enabled ? Math.min(25000000, mv || 25000000, Math.max(0, Number(q.extensions.passengerPa.amount) || 0)) : 0;
  const passengerSeats = Math.min(7, Math.max(1, Number(q.extensions.passengerPa.seats) || 1));
  const details = {
    tplFee: q.extensions.tpl.enabled ? computeCarTplFee(Math.min(100000000, Number(q.extensions.tpl.amount) || 0), mv, q.vehicleType) : 0,
    srccFee: q.extensions.srcc.enabled ? Math.round(insuredValue * srccRate) : 0,
    tsFee: q.extensions.ts.enabled ? Math.round(insuredValue * tsRate) : 0,
    floodFee: q.extensions.flood.enabled ? Math.round(insuredValue * floodRates[region as 1 | 2 | 3].min) : 0,
    quakeFee: q.extensions.quake.enabled ? Math.round(insuredValue * quakeRates[region as 1 | 2 | 3].min) : 0,
    driverPaFee: q.extensions.driverPa?.enabled ? Math.round(driverPaAmount * DRIVER_PA_RATE) : 0,
    passengerPaFee: q.extensions.passengerPa?.enabled ? Math.round(passengerPaAmount * PASSENGER_PA_RATE * passengerSeats) : 0,
    equipmentFee: q.extensions.equipment?.enabled ? Math.round(equipmentAmount * equipmentRate) : 0,
    ambulanceFee: q.extensions.ambulance?.enabled ? AMBULANCE_PREMIUM : 0,
    authWorkshopFee: q.extensions.authorizedWorkshop?.enabled ? Math.round((mv + equipmentAmount) * AUTH_WORKSHOP_RATE) : 0,
    theftByOwnDriverFee: q.extensions.theftByOwnDriver?.enabled ? Math.round((mv + equipmentAmount) * THEFT_BY_OWN_DRIVER_RATE) : 0,
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
  if (!q.vehicleType) return { mainPremium: 0, extensionTotal: 0, stamp: 0, total: 0, details: { tplFee: 0, srccFee: 0, tsFee: 0, floodFee: 0, quakeFee: 0, driverPaFee: 0, passengerPaFee: 0, equipmentFee: 0, ambulanceFee: 0, authWorkshopFee: 0, theftByOwnDriverFee: 0, equipmentCap: 0 }, categoryLabel: "-", status: "Isi Data" };
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

function calcCarComp(q: any) {
  const mv = Math.max(0, Number(q.marketValue) || 0);
  const region = getRegion(q.plateRegion);
  if (!q.vehicleType) return { mainPremium: 0, extensionTotal: 0, stamp: 0, total: 0, details: { tplFee: 0, srccFee: 0, tsFee: 0, floodFee: 0, quakeFee: 0, driverPaFee: 0, passengerPaFee: 0, equipmentFee: 0, ambulanceFee: 0, authWorkshopFee: 0, theftByOwnDriverFee: 0, equipmentCap: 0 }, categoryLabel: "-", status: "Isi Data", baseMainPremium: 0, ageLoadingAmount: 0 };
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
  const ageLoadingAmount = Math.round(baseMainPremium * Math.max(0, CURRENT_YEAR - Number(q.year || CURRENT_YEAR) - 5) * 0.05);
  const equipmentRate = mv ? (baseMainPremium + ageLoadingAmount) / mv : 0;
  const res = calcCarShared(q, mv, region, category, baseMainPremium + ageLoadingAmount, SRCC_RATE_COMP, TS_RATE_COMP, FLOOD_RATES_COMP, QUAKE_RATES_COMP, equipmentRate) as any;
  res.baseMainPremium = baseMainPremium;
  res.ageLoadingAmount = ageLoadingAmount;
  return res;
}

function deductibleText(flowType: FlowType, vehicleType: string, itemId: string) {
  if (flowType === "motor") {
    if (itemId === "main") return "Rp150.000.";
    if (itemId === "tpl") return "Tanpa biaya sendiri saat klaim.";
    if (itemId === "srcc" || itemId === "ts") return "10% dari nilai yang disetujui, paling sedikit Rp500.000,- per kejadian.";
    if (itemId === "flood" || itemId === "quake") return "10% dari nilai kerugian, minimum Rp500.000,-- untuk setiap kejadian.";
    return "";
  }
  if (itemId === "main") return getCarCategory(vehicleType) === "Angkutan Penumpang" ? "Rp300.000." : "Rp500.000.";
  if (itemId === "tpl" || itemId === "driverPa" || itemId === "passengerPa") return "Tanpa biaya sendiri saat klaim.";
  if (itemId === "srcc" || itemId === "ts") return "10% dari nilai yang disetujui, paling sedikit Rp500.000,- per kejadian.";
  if (itemId === "flood" || itemId === "quake") return "10% dari nilai kerugian, minimum Rp500.000,-- untuk setiap kejadian.";
  if (itemId === "theftByOwnDriver") return "10% dari Total Harga Pertanggungan.";
  if (itemId === "equipment") return "Mengikuti ketentuan pertanggungan utama.";
  return "";
}

function mainCoverText(flowType: FlowType) {
  if (flowType === "carComp") {
    return "Menjamin kerugian atau kerusakan pada kendaraan yang langsung disebabkan oleh tabrakan, benturan, terbalik, tergelincir, terperosok, perbuatan jahat, pencurian, dan kebakaran. Kehilangan karena pencurian dijamin bila kendaraan tidak ditemukan dalam 60 hari. Termasuk biaya penyelamatan yang wajar untuk penjagaan, pengangkutan, atau penarikan kendaraan ke bengkel atau tempat lain guna mengurangi kerugian, paling tinggi 0,5% dari harga pertanggungan dan tanpa biaya sendiri saat klaim.";
  }
  return "Menjamin kerugian total pada kendaraan yang langsung disebabkan oleh tabrakan, benturan, terbalik, tergelincir, terperosok, perbuatan jahat, pencurian, dan kebakaran, apabila biaya perbaikan mencapai sedikitnya 75% dari harga sebenarnya sesaat sebelum kejadian. Kehilangan karena pencurian dijamin bila kendaraan tidak ditemukan dalam 60 hari. Termasuk biaya penyelamatan yang wajar untuk penjagaan, pengangkutan, atau penarikan kendaraan ke bengkel atau tempat lain guna mengurangi kerugian, paling tinggi 0,5% dari harga pertanggungan dan tanpa biaya sendiri saat klaim.";
}

function mainCoverTitle(flowType: FlowType) {
  if (flowType === "carComp") return "Jaminan Utama - Comprehensive";
  return "Jaminan Utama - Total Loss Only (TLO)";
}

function secondaryMainCoverText(flowType: FlowType) {
  return "Menjamin kehilangan kendaraan karena pencurian bila kendaraan tidak ditemukan dalam 60 hari.";
}

function mainDeductibleText(flowType: FlowType, vehicleType: string) {
  if (flowType === "motor") return "Kerugian total: Rp150.000. Kehilangan karena pencurian: 5% dari harga pertanggungan.";
  if (flowType === "carTlo") {
    return getCarCategory(vehicleType) === "Angkutan Penumpang"
      ? "Kerugian total: Rp300.000. Kehilangan karena pencurian: 5% dari harga pertanggungan."
      : "Kerugian total: Rp500.000. Kehilangan karena pencurian: 5% dari harga pertanggungan.";
  }
  return getCarCategory(vehicleType) === "Angkutan Penumpang"
    ? "Kerugian atau kerusakan: Rp300.000. Kehilangan karena pencurian: 5% dari harga pertanggungan."
    : "Kerugian atau kerusakan: Rp500.000. Kehilangan karena pencurian: 5% dari harga pertanggungan.";
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
  return (
    <div className="group relative inline-flex">
      <button type="button" className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-500">i</button>
      <div className="pointer-events-none absolute left-0 top-6 z-40 hidden w-72 whitespace-pre-line rounded-xl bg-slate-900 px-3 py-2 text-xs leading-5 text-white shadow-xl group-hover:block">
        {text}
      </div>
    </div>
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

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-sm">
      <div className="min-w-0 flex-1 text-white/75">{label}</div>
      <div className="shrink-0 whitespace-nowrap text-right font-semibold text-white">{value}</div>
    </div>
  );
}

function StepNode({ step, title, subtitle, active, icon }: any) {
  return (
    <div className="relative flex flex-1 flex-col items-center text-center">
      <div className={cls("flex h-9 w-9 items-center justify-center rounded-full border-2 bg-white", active ? "border-[#0A4D82] text-[#0A4D82] shadow-md shadow-[#0A4D82]/10" : "border-slate-300 text-slate-300")}>{icon}</div>
      <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{step}</div>
      <div className={cls("mt-0.5 text-[14px] font-bold", active ? "text-slate-900" : "text-slate-500")}>{title}</div>
      <div className={cls("mt-0.5 text-[12px]", active ? "text-[#E8A436]" : "text-slate-400")}>{subtitle}</div>
    </div>
  );
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

function ActionCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-white p-5 shadow-sm">{children}</div>;
}
function ConsentAccordion({ section, open, onToggle }: any) {
  return <div className="rounded-xl border border-[#D6E0EA] bg-[#F8FBFE]"><button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"><div><div className="text-sm font-semibold text-slate-900">{section.title}</div><div className="mt-1 text-xs leading-5 text-slate-500">{section.summary}</div></div><ChevronDown className={cls("h-4 w-4 shrink-0 text-slate-500 transition", open && "rotate-180")} /></button>{open ? <div className="border-t border-[#D6E0EA] px-4 py-3 text-sm leading-6 text-slate-600">{section.detail}</div> : null}</div>;
}
function ConsentModal({ open, agreed, onClose, onAgree }: any) {
  const [expanded, setExpanded] = useState({ produk: true, data: false, material: false });
  const [reachedBottom, setReachedBottom] = useState(false);
  const handleScroll = (e: any) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 8) setReachedBottom(true);
  };
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4"><div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-200 px-6 py-5"><div><div className="text-[24px] font-bold tracking-tight text-slate-900">Persetujuan Kebijakan</div><div className="mt-1 text-sm text-slate-500">Buka seluruh bagian dan gulir sampai bawah sebelum menyetujui.</div></div><button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"><X className="h-5 w-5" /></button></div><div className="max-h-[60vh] overflow-y-auto px-6 py-5" onScroll={handleScroll}><div className="space-y-3">{CONSENT_SECTIONS.map((section) => <ConsentAccordion key={section.key} section={section} open={(expanded as any)[section.key]} onToggle={() => setExpanded((prev: any) => ({ ...prev, [section.key]: !prev[section.key] }))} />)}</div><div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">Dengan melanjutkan, Anda menyatakan telah membaca persetujuan yang berlaku dan memahami bahwa polis diterbitkan berdasarkan data yang diberikan pada penawaran ini.</div><div className="h-3" /></div><div className="flex items-center justify-between gap-3 border-t border-slate-200 px-6 py-4"><div className="text-sm text-slate-500">{reachedBottom ? "Persetujuan siap disetujui." : "Gulir sampai bagian paling bawah untuk mengaktifkan tombol setuju."}</div><div className="flex items-center gap-3"><button type="button" onClick={onClose} className="inline-flex h-11 items-center justify-center rounded-[12px] border border-slate-200 px-5 text-sm font-medium text-slate-700 hover:bg-slate-50">Tutup</button><button type="button" disabled={!reachedBottom} onClick={onAgree} className={cls("inline-flex h-11 items-center justify-center rounded-[12px] px-5 text-sm font-bold text-white", reachedBottom ? "bg-[#0A4D82] hover:brightness-105" : "cursor-not-allowed bg-slate-300")}>{agreed ? "Sudah Disetujui" : "Saya Setuju"}</button></div></div></div></div>;
}
function PaymentInfoButton({ title, description, onClick }: any) {
  return <button type="button" onClick={onClick} className="rounded-xl border border-[#D5DDE6] bg-white px-4 py-3 text-left hover:bg-slate-50"><div className="text-sm font-semibold text-slate-900">{title}</div><div className="mt-1 text-xs leading-5 text-slate-500">{description}</div></button>;
}
function PaymentInfoPanel({ title, children }: any) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4"><div className="text-sm font-semibold text-slate-900">{title}</div><div className="mt-2 text-sm leading-6 text-slate-600">{children}</div></div>;
}

function AccordionRiskRow({ title, premium, summary, detail, deductible, checked, onToggleChecked, expanded, onToggleExpand, alwaysIncluded = false, extra, itemIcon }: any) {
  return (
    <div className="rounded-xl border border-[#C9D5E3] bg-[#F8FBFE]">
      <div className="flex items-center gap-3 px-3.5 py-3">
        {alwaysIncluded ? (
          <div className="flex h-5 w-5 items-center justify-center rounded border border-[#0A4D82] bg-[#0A4D82]/10 text-[#0A4D82]"><Shield className="h-3.5 w-3.5" /></div>
        ) : (
          <input type="checkbox" checked={checked} onChange={onToggleChecked} className="h-5 w-5 rounded border-slate-300 text-[#0A4D82] focus:ring-[#0A4D82]" />
        )}
        <button type="button" onClick={onToggleExpand} className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[#0A4D82]">
              {!alwaysIncluded && itemIcon ? React.createElement(itemIcon, { className: "h-4 w-4 shrink-0" }) : null}
              <div className="truncate text-[15px] font-semibold">{title}</div>
            </div>
            <div className="mt-0.5 text-[12px] text-slate-500">Premi: {premium}</div>
          </div>
          <ChevronDown className={cls("h-4 w-4 shrink-0 text-slate-500 transition", expanded && "rotate-180")} />
        </button>
      </div>
      {expanded ? (
        <div className="border-t border-[#D6E0EA] px-3.5 py-3">
          <div className="whitespace-pre-line text-[13px] leading-5 text-slate-700">{summary}</div>
          {deductible ? <div className="mt-2 text-[12px] leading-5 text-slate-600">{["tanpa biaya sendiri", "tidak dikenakan risiko sendiri", "tidak ada risiko sendiri"].some((token) => String(deductible || "").trim().toLowerCase().startsWith(token)) ? deductible : <><span className="font-semibold text-slate-700">Biaya sendiri saat klaim:</span> {deductible}</>}</div> : null}
          {detail ? <div className="mt-2 whitespace-pre-line text-[12px] leading-5 text-slate-500">{detail}</div> : null}
          {extra ? <div className="mt-3">{extra}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

export default function MotorLatestExact({
  onExit,
  sessionName = "Dita (External)",
  initialFlow = "motor",
  operatingRecord = null,
  onOperatingSignal = () => {},
  accountMenuItems = [],
}: {
  onExit?: () => void;
  sessionName?: string;
  initialFlow?: FlowType;
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
  const [userName] = useState(sessionName);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSentOffers, setShowSentOffers] = useState(false);
  const [flows, setFlows] = useState<Record<FlowType, FlowState>>({
    motor: createFlowState("motor"),
    carComp: createFlowState("carComp"),
    carTlo: createFlowState("carTlo"),
  });
  const [documentChecks, setDocumentChecks] = useState<Record<FlowType, { ktp: any; stnk: any }>>({
    motor: { ktp: createEmptyDocumentCheck("KTP"), stnk: createEmptyDocumentCheck("STNK") },
    carComp: { ktp: createEmptyDocumentCheck("KTP"), stnk: createEmptyDocumentCheck("STNK") },
    carTlo: { ktp: createEmptyDocumentCheck("KTP"), stnk: createEmptyDocumentCheck("STNK") },
  });
  const [evidence, setEvidence] = useState<Record<FlowType, Record<string, any>>>({
    motor: {},
    carComp: {},
    carTlo: {},
  });

  const currentData = flowType ? flows[flowType] : null;
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

  const openFlow = (type: FlowType) => {
    setFlowType(type);
    setScreen("flow");
    setStep(1);
    setShowPremiumDetails(false);
  };

  const returnToLauncher = () => {
    if (onExit) {
      onExit();
      return;
    }
    setScreen("catalog");
    setFlowType(null);
    setStep(1);
  };

  if (!flowType && screen === "flow") return null;
  const selected = currentData!;
  const selectedPassengerCarMeta = flowType === "carTlo" && selected.quote.vehicleType ? getPassengerCarMeta(selected.quote.vehicleType) : null;
  const exts = flowType === "motor" ? MOTOR_EXTS : CAR_EXTS;
  const suggestions = flowType === "motor" ? MOTOR_SUGGESTIONS : CAR_SUGGESTIONS;

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
        ambulance: getExtensionDisplayFee(flowType, selected.quote, "ambulance"),
        authorizedWorkshop: getExtensionDisplayFee(flowType, selected.quote, "authorizedWorkshop"),
        theftByOwnDriver: getExtensionDisplayFee(flowType, selected.quote, "theftByOwnDriver"),
      }
    : {};

  const uploadsComplete = selected ? Object.values(selected.uploads).every(Boolean) : false;
  const dataComplete = selected ? !!(selected.insured.customerType && selected.insured.fullName && selected.insured.address && selected.insured.email && selected.insured.phone && selected.vehicle.plateNumber && selected.vehicle.chassisNumber && selected.vehicle.engineNumber) : false;
  const periodComplete = selected ? !!(selected.quote.coverageStart && selected.quote.coverageEnd) : false;
  const canIssue = !!(selected && calc && uploadsComplete && dataComplete && periodComplete && selected.agree && calc.status !== "Need Review");
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
  const fraudAlerts = useMemo(
    () =>
      summarizeFraudSignals({
        documentChecks: flowType ? [documentChecks[flowType]?.ktp, documentChecks[flowType]?.stnk] : [],
        evidenceChecks: flowType ? Object.values(evidence[flowType] || {}) : [],
      }),
    [documentChecks, evidence, flowType],
  );

  useEffect(() => {
    if (!flowType) return;
    onOperatingSignal({ authority: transactionAuthority });
  }, [flowType, onOperatingSignal, transactionAuthority]);

  useEffect(() => {
    if (!fraudAlerts.length) return;
    onOperatingSignal({
      status: "Pending Review Internal",
      reason: fraudAlerts[0],
      notes: "Transaksi perlu review internal berdasarkan hasil verifikasi dokumen atau evidence.",
      flags: fraudAlerts,
    });
  }, [fraudAlerts, onOperatingSignal]);

  return (
    <div className="min-h-screen bg-[#F3F5F7] text-slate-900">
      <SentOffersHistoryModal open={showSentOffers} onClose={() => setShowSentOffers(false)} />
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
            <div className="relative">
              <button type="button" onClick={() => setShowUserMenu((prev) => !prev)} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">ID</span>
                {userName}
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
            <button type="button" aria-label="Lihat notifikasi" className="hidden h-11 w-11 items-center justify-center rounded-[10px] border border-white/20 bg-white/10 text-white shadow-sm hover:bg-white/15 md:inline-flex">
              <Bell className="h-4 w-4" />
            </button>
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
          <div className="relative overflow-hidden bg-[#0A4D82] pb-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.20),transparent_28%),radial-gradient(circle_at_80%_25%,rgba(255,255,255,0.14),transparent_24%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.12),transparent_24%)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A4D82]/60 to-[#0A4D82]/75" />
            <div className="relative mx-auto max-w-[1800px] px-4 pt-6 md:px-6">
              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={returnToLauncher} className="inline-flex items-center gap-2 rounded-[8px] border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"><ArrowLeft className="h-4 w-4" />Kembali ke Produk</button>
                <button type="button" tabIndex={-1} aria-hidden="true" className="pointer-events-none invisible inline-flex items-center gap-2 rounded-[8px] border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white"><ArrowLeft className="h-4 w-4" />Kembali ke Produk</button>
              </div>
              <div className="mt-6 text-center text-white">
                <div className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90">Selamat datang kembali, {userName}</div>
                <h1 className="mt-4 text-[32px] font-bold tracking-tight md:text-[40px]">{flowType === "motor" ? "Total Loss Kendaraan - Motor" : flowType === "carComp" ? "Asuransi Mobil Comprehensive" : "Total Loss Kendaraan - Mobil"}</h1>
<p className="mx-auto mt-2 max-w-3xl text-[14px] text-white/90 md:text-[17px]">{flowType === "motor" ? "Perlindungan sepeda motor untuk kerugian total akibat risiko yang dijamin polis, termasuk pencurian dan kebakaran." : flowType === "carComp" ? "Perlindungan mobil terhadap kerusakan atau kehilangan akibat tabrakan, perbuatan jahat, pencurian, dan kebakaran." : "Perlindungan mobil untuk kerugian total akibat risiko yang dijamin polis, termasuk pencurian dan kebakaran."}</p>
              </div>
              <div className="mx-auto mt-7 max-w-4xl rounded-2xl bg-white p-4 shadow-2xl shadow-black/15 md:p-5">
                <div className="rounded-2xl border border-[#D8E1EA] bg-[#F4F7FA] px-4 py-4 md:px-5 md:py-5">
                  <div className="flex flex-col gap-6 md:flex-row md:gap-5">
                    <StepNode step="LANGKAH 1" title="Simulasi Premi" subtitle={step === 1 ? "Dalam proses" : "Selesai"} active={step === 1} icon={<Building2 className="h-4 w-4" />} onClick={() => setStep(1)} />
                    <div className="hidden h-px flex-1 self-center bg-slate-300 md:block" />
                    <StepNode step="LANGKAH 2" title="Isi Data" subtitle={step === 2 ? "Dalam proses" : step > 2 ? "Selesai" : "Tertunda"} active={step === 2} icon={<FileText className="h-4 w-4" />} onClick={showPremiumDetails ? () => setStep(2) : undefined} />
                    <div className="hidden h-px flex-1 self-center bg-slate-300 md:block" />
                    <StepNode step="LANGKAH 3" title="Pembayaran" subtitle={step === 3 ? "Dalam proses" : "Tertunda"} active={step === 3} icon={<Wallet className="h-4 w-4" />} onClick={step > 1 ? () => setStep(3) : undefined} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={cls("mx-auto px-4 pb-12 md:px-6", step > 1 || showPremiumDetails ? "max-w-[1280px]" : "max-w-4xl")}>
            <div className={cls("grid items-start gap-5", step > 1 || showPremiumDetails ? "lg:grid-cols-[minmax(0,1fr)_320px]" : "lg:grid-cols-1")}>
              <div className="space-y-5">
                {step === 1 ? (
                  <>
                    <ActionCard>
                      <div className="text-[20px] font-bold tracking-tight text-slate-900">Informasi Obyek</div>
                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        {flowType === "carTlo" ? (
                          <div>
                            <FieldLabel label="Merek / Tipe Kendaraan" />
                            <SelectInput
                              value={selected.quote.vehicleType}
                              onChange={(value: string) => setAt(flowType, "quote.vehicleType", value)}
                              options={PASSENGER_CAR_MODELS}
                              placeholder="Pilih merek dan tipe mobil penumpang"
                            />
                          </div>
                        ) : flowType !== "motor" ? <div><FieldLabel label="Jenis Kendaraan" /><SelectInput value={selected.quote.vehicleType} onChange={(value: string) => setAt(flowType, "quote.vehicleType", value)} options={["Angkutan Penumpang", "Angkutan Barang", "Bis"]} placeholder="Mobil ini termasuk jenis apa?" /></div> : null}
                        <div>
                          <FieldLabel label="Kode Nomor Polisi / TNKB" />
                          <TextInput value={selected.quote.plateRegion} onChange={(value: string) => setAt(flowType, "quote.plateRegion", value)} placeholder={`Cari contoh: ${PLATES[0]}`} icon={<MapPin className="h-4 w-4" />} listId={`${flowType}-plate-list`} />
                          <datalist id={`${flowType}-plate-list`}>{PLATES.map((p) => <option key={p} value={p} />)}</datalist>
                        </div>
                        {flowType === "motor" ? (
                          <div>
                            <FieldLabel label="Merek / Tipe Motor" />
                            <TextInput value={selected.quote.vehicleName} onChange={(value: string) => setAt(flowType, "quote.vehicleName", value)} placeholder="Masukkan merek dan tipe motor" icon={<Search className="h-4 w-4" />} />
                          </div>
                        ) : null}
                        <div>
                          <FieldLabel label="Tahun Pembuatan Kendaraan" helpText="Sesuai tahun pembuatan/manufacture year pada STNK." />
                          <VehicleYearPicker
                            value={selected.quote.year}
                            onChange={(value: string) => setAt(flowType, "quote.year", value)}
                            minYear={flowType === "carComp" ? MIN_YEAR_COMP : MIN_YEAR_TLO}
                            maxYear={CURRENT_YEAR}
                            placeholder="Pilih tahun kendaraan"
                          />
                        </div>
                        <div>
                          <FieldLabel label="Harga Pertanggungan" helpText="Harga pertanggungan sebaiknya mencerminkan harga sebenarnya kendaraan sesaat sebelum kerugian atau kerusakan. Jika lebih rendah dari harga sebenarnya, penyelesaian klaim dapat diperhitungkan secara proporsional sebelum pengurangan risiko sendiri." />
                          <TextInput value={selected.quote.marketValue ? formatRupiah(Number(String(selected.quote.marketValue).replace(/[^0-9]/g, ""))) : ""} onChange={(value: string) => setAt(flowType, "quote.marketValue", String(value).replace(/[^0-9]/g, ""))} placeholder="Contoh: 180.000.000" inputMode="numeric" />
                          {String(selected.quote.marketValue || "").trim() && !validateMaxHP(flowType, Number(selected.quote.marketValue || 0)) ? <div className="mt-2 text-xs font-medium text-[#E8A436]">{maxHPText(flowType)}</div> : null}
                        </div>
                        <div>
                          <FieldLabel label="Penggunaan" helpText={`Penggunaan Pribadi adalah penggunaan kendaraan untuk kepentingan pribadi pengguna kendaraan.

Penggunaan Komersial adalah penggunaan kendaraan untuk disewakan atau digunakan untuk menerima balas jasa.`} />
                          <SelectInput value={selected.quote.usage} onChange={(value: string) => setAt(flowType, "quote.usage", value)} options={["Pribadi", "Komersial"]} placeholder="Kendaraan ini digunakan untuk apa?" />
                          {selected.quote.usage === "Pribadi" ? (
                            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                              <span className="font-semibold text-slate-800">Penggunaan Pribadi</span> adalah penggunaan kendaraan untuk kepentingan pribadi pengguna kendaraan. Contoh: kendaraan harian, ke kantor, dan aktivitas keluarga.
                            </div>
                          ) : null}
                          {selected.quote.usage === "Komersial" ? (
                            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                              <span className="font-semibold text-slate-800">Penggunaan Komersial</span> adalah penggunaan kendaraan untuk disewakan atau digunakan untuk menerima balas jasa. Contoh: ojek, rental, antar barang, dan kendaraan operasional usaha.
                            </div>
                          ) : null}
                        </div>
                      </div>
                      {flowType === "carTlo" && selected.quote.vehicleType ? (
                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                          Sistem mengenali kendaraan ini sebagai <span className="font-semibold text-slate-700">{selectedPassengerCarMeta?.category}</span> dengan jenis bahan bakar <span className="font-semibold text-slate-700">{selectedPassengerCarMeta?.fuelType}</span>.
                        </div>
                      ) : null}
                      {!showPremiumDetails ? (
                        <div className="mt-5 flex justify-end">
                          <button type="button" disabled={!(Boolean(selected.quote.plateRegion) && Boolean(selected.quote.year) && isYearEligible(flowType, selected.quote.year) && Boolean(String(selected.quote.marketValue || "").trim()) && validateMaxHP(flowType, Number(selected.quote.marketValue || 0)) && Boolean(selected.quote.usage) && (flowType !== "motor" || Boolean(String(selected.quote.vehicleName || "").trim())) && (flowType !== "carTlo" || Boolean(selected.quote.vehicleType)))} onClick={() => setShowPremiumDetails(true)} className={cls("flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-sm", Boolean(selected.quote.plateRegion) && Boolean(selected.quote.year) && isYearEligible(flowType, selected.quote.year) && Boolean(String(selected.quote.marketValue || "").trim()) && validateMaxHP(flowType, Number(selected.quote.marketValue || 0)) && Boolean(selected.quote.usage) && (flowType !== "motor" || Boolean(String(selected.quote.vehicleName || "").trim())) && (flowType !== "carTlo" || Boolean(selected.quote.vehicleType)) ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}><Wallet className="h-4 w-4" />CEK PREMI</button>
                        </div>
                      ) : null}
                    </ActionCard>

                    {showPremiumDetails ? (
                      <ActionCard>
                        <div className="space-y-5">
                          <div>
                            <div className="text-[20px] font-bold tracking-tight text-slate-900">Rincian Jaminan</div>
                            <div className="mt-1 text-sm text-slate-500">Klik setiap baris untuk melihat penjelasan detailnya.</div>
                            <div className="mt-4 text-[18px] font-bold tracking-tight text-slate-900">Risiko yang Dijamin</div>
                            <div className="mt-3 space-y-2.5">
                    <AccordionRiskRow itemIcon={Shield} title={mainCoverTitle(flowType)} premium={formatRupiah(calc.mainPremium)} summary={mainCoverText(flowType)} detail="" deductible={mainDeductibleText(flowType, selected.quote.vehicleType)} alwaysIncluded expanded={!!expandedRows.main} onToggleExpand={() => setExpandedRows((prev) => ({ ...prev, main: !prev.main }))} />
                            </div>
                          </div>
                          <div>
                            <div>
                              <div className="text-[20px] font-bold tracking-tight text-slate-900">Perluasan Jaminan</div>
                              <div className="mt-1 text-sm text-slate-500">Pilih perluasan yang dibutuhkan.</div>
                            </div>
                            <div className="mt-4 space-y-2.5">
                              {exts.map((item) => {
                                const enabled = selected.quote.extensions[item.id].enabled;
                                return (
                                  <AccordionRiskRow
                                    key={item.id}
                                    itemIcon={item.icon}
                                    title={item.label}
                                    premium={formatRupiah((feeMap as any)[item.id] || 0)}
                                    summary={EXT_INFO[item.id]}
                                    deductible={deductibleText(flowType, selected.quote.vehicleType, item.id)}
                                    checked={enabled}
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
                                      setAt(flowType, `quote.extensions.${item.id}.enabled`, next);
                                    }}
                                    expanded={!!expandedRows[item.id]}
                                    onToggleExpand={() => setExpandedRows((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                                    extra={enabled ? item.type === "amount-seat" ? (
                                      <div className="grid gap-3 md:grid-cols-2">
                                        <div><FieldLabel label="Nilai pertanggungan per penumpang" compact /><TextInput value={selected.quote.extensions.passengerPa.amount ? formatRupiah(Number(selected.quote.extensions.passengerPa.amount)) : ""} onChange={(value: string) => {
                                          const raw = Number(String(value).replace(/[^0-9]/g, "")) || 0;
                                          const marketValue = Number(selected.quote.marketValue || 0) || 0;
                                          const capped = Math.min(raw, 25000000, marketValue || 25000000);
                                          setAt(flowType, "quote.extensions.passengerPa.amount", capped);
                                        }} inputMode="numeric" /></div>
                                        <div><FieldLabel label="Jumlah penumpang" compact /><SelectInput value={String(selected.quote.extensions.passengerPa.seats || "")} onChange={(value: string) => setAt(flowType, "quote.extensions.passengerPa.seats", value)} options={["1", "2", "3", "4", "5", "6", "7"]} placeholder="Jumlah penumpangnya berapa?" /></div>
                      <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">Tarif 0,1% dari nilai pertanggungan per penumpang. Tanpa biaya sendiri saat klaim.</div>
                                      </div>
                                    ) : item.type === "amount" ? (
                                      <div className="grid gap-3 md:grid-cols-2">
                        <div><FieldLabel label={item.id === "tpl" ? "Nilai pertanggungan pihak ketiga" : item.id === "driverPa" ? "Nilai pertanggungan pengemudi" : item.id === "equipment" ? "Nilai perlengkapan tambahan" : "Nilai pertanggungan"} compact /><TextInput value={selected.quote.extensions[item.id].amount ? formatRupiah(Number(selected.quote.extensions[item.id].amount)) : ""} onChange={(value: string) => {
                                            const raw = Number(String(value).replace(/[^0-9]/g, "")) || 0;
                                            let capped = raw;

                                            if (item.id === "tpl") {
                                              capped = flowType === "motor" ? Math.min(raw, 1000000) : Math.min(raw, 100000000);
                                            }

                                            if (item.id === "driverPa" || item.id === "passengerPa") {
                                              const marketValue = Number(selected.quote.marketValue || 0) || 0;
                                              capped = Math.min(raw, 25000000, marketValue || 25000000);
                                            }

                                            if (item.id === "equipment") {
                                              const max = calc?.details?.equipmentCap || 0;
                                              capped = Math.min(raw, max);
                                            }

                                            setAt(flowType, `quote.extensions.${item.id}.amount`, capped);
                                          }} inputMode="numeric" /></div>
                                        {item.id === "equipment" ? <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">Batas maksimal: {formatRupiah(calc.details.equipmentCap || 0)}</div> : null}
                        {item.id === "driverPa" ? <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">Tarif 0,5% dari nilai pertanggungan. Tanpa biaya sendiri saat klaim.</div> : null}
                                      </div>
                                    ) : null : null}
                                  />
                                );
                              })}
                            </div>
                          </div>
                          {step === 1 ? (
                            <div className="flex justify-stretch sm:justify-end">
                              <button
                                type="button"
                                disabled={
                                  !(
                                    Boolean(selected.quote.plateRegion) &&
                                    Boolean(selected.quote.year) &&
                                    isYearEligible(flowType, selected.quote.year) &&
                                    Boolean(String(selected.quote.marketValue || "").trim()) &&
                                    validateMaxHP(flowType, Number(selected.quote.marketValue || 0)) &&
                                    Boolean(selected.quote.usage) &&
                                    (flowType !== "motor" || Boolean(String(selected.quote.vehicleName || "").trim())) &&
                                    (flowType !== "carTlo" || Boolean(selected.quote.vehicleType))
                                  )
                                }
                                onClick={() => setStep(2)}
                                className={cls(
                                  "inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-[12px] px-5 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition sm:w-auto",
                                  Boolean(selected.quote.plateRegion) &&
                                    Boolean(selected.quote.year) &&
                                    isYearEligible(flowType, selected.quote.year) &&
                                    Boolean(String(selected.quote.marketValue || "").trim()) &&
                                    validateMaxHP(flowType, Number(selected.quote.marketValue || 0)) &&
                                    Boolean(selected.quote.usage) &&
                                    (flowType !== "motor" || Boolean(String(selected.quote.vehicleName || "").trim())) &&
                                    (flowType !== "carTlo" || Boolean(selected.quote.vehicleType))
                                    ? "bg-[#F5A623] hover:brightness-105"
                                    : "cursor-not-allowed bg-slate-400",
                                )}
                              >
                                Isi Data
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </ActionCard>
                    ) : null}
                  </>
                ) : null}

                {step === 2 ? (
                  <>
                    <ActionCard>
                      <div className="text-[20px] font-bold tracking-tight text-slate-900">Pilih Cara Isi Data</div>
                      <div className="mt-1 text-sm text-slate-500">Pilih cara pengisian data nasabah dan kendaraan.</div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <button onClick={() => setAt(flowType, "ui.dataMode", "scan")} className={cls("rounded-xl border p-4 text-left", selected.ui.dataMode === "scan" ? "border-[#0A4D82] bg-[#F8FBFE]" : "border-slate-200 bg-white")}>
                          <div className="text-[15px] font-bold text-[#0A4D82]">Foto KTP & STNK</div>
                          <div className="mt-1.5 text-sm leading-6 text-slate-600">Bantu isi data dari dokumen.</div>
                        </button>
                        <button onClick={() => setAt(flowType, "ui.dataMode", "manual")} className={cls("rounded-xl border p-4 text-left", selected.ui.dataMode === "manual" ? "border-[#0A4D82] bg-[#F8FBFE]" : "border-slate-200 bg-white")}>
                          <div className="text-[15px] font-bold text-[#0A4D82]">Isi Manual</div>
                          <div className="mt-1.5 text-sm leading-6 text-slate-600">Lewati pembacaan dokumen.</div>
                        </button>
                      </div>

                      {selected.ui.dataMode === "scan" ? (
                        <div className="mt-5 space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
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
                            className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#0A4D82] px-4 py-3 text-sm font-bold text-white"
                          >
                            <Camera className="h-4 w-4" />Foto KTP
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const extractedData = {
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
                            className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#0A4D82] px-4 py-3 text-sm font-bold text-white"
                          >
                            <Camera className="h-4 w-4" />Foto STNK
                          </button>
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className={cls("rounded-xl border p-4 text-sm", selected.ktpRead ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500")}>
                              {selected.ktpRead ? `Foto KTP berhasil dibaca. Data nasabah sudah terisi dan perlu diverifikasi singkat. Confidence OCR: ${documentChecks[flowType].ktp.confidence ? `${Math.round(documentChecks[flowType].ktp.confidence * 100)}%` : "-"}.` : "Belum ada hasil pembacaan KTP."}
                            </div>
                            <div className={cls("rounded-xl border p-4 text-sm", selected.stnkRead ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500")}>
                              {selected.stnkRead ? `Foto STNK berhasil dibaca. Data kendaraan sudah terisi dan perlu diverifikasi singkat. Confidence OCR: ${documentChecks[flowType].stnk.confidence ? `${Math.round(documentChecks[flowType].stnk.confidence * 100)}%` : "-"}.` : "Belum ada hasil pembacaan STNK."}
                            </div>
                          </div>
                        </div>
                      ) : null}

                      <div className="mt-5 space-y-5">
                        <div>
                          <div className="text-[18px] font-bold tracking-tight text-slate-900">Informasi Nasabah</div>
                          <div className="mt-1 text-sm text-slate-500">Nama nasabah, alamat email, dan nomor handphone ditampilkan langsung. Data lain muncul setelah pilih metode pengisian.</div>
                          {selected.ui.dataMode === "scan" && !selected.ktpRead ? (
                            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                              Upload foto KTP terlebih dahulu untuk menampilkan informasi nasabah.
                            </div>
                          ) : (
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                              <div>
                                <FieldLabel label="Siapa yang akan menjadi nasabah?" />
                                <SelectInput value={selected.insured.customerType} onChange={(value: string) => setAt(flowType, "insured.customerType", value)} options={["Pribadi", "Perusahaan / Badan usaha"]} placeholder="Nasabah ini perorangan atau badan usaha?" />
                              </div>
                              <div>
                                <FieldLabel label={selected.insured.customerType === "Perusahaan / Badan usaha" ? "Nama Perusahaan / Badan Usaha" : "Nama Lengkap"} />
                                <TextInput value={selected.insured.fullName} onChange={(value: string) => setAt(flowType, "insured.fullName", value)} placeholder={selected.insured.customerType === "Perusahaan / Badan usaha" ? "Nama perusahaan / badan usaha" : "Nama lengkap"} icon={<User className="h-4 w-4" />} />
                              </div>
                              <div>
                                <FieldLabel label="Alamat" />
                                <TextInput value={selected.insured.address} onChange={(value: string) => setAt(flowType, "insured.address", value)} placeholder="Alamat" icon={<MapPin className="h-4 w-4" />} />
                              </div>
                              <div>
                                <FieldLabel label="Alamat Email" />
                                <TextInput value={selected.insured.email} onChange={(value: string) => setAt(flowType, "insured.email", value)} placeholder="nama@email.com" icon={<Mail className="h-4 w-4" />} type="email" />
                              </div>
                              <div>
                                <FieldLabel label="Nomor Handphone" />
                                <TextInput value={selected.insured.phone} onChange={(value: string) => setAt(flowType, "insured.phone", value)} placeholder="08xxxxxxxxxx" icon={<Phone className="h-4 w-4" />} />
                              </div>
                              <div>
                                <FieldLabel label={selected.insured.customerType === "Perusahaan / Badan usaha" ? "NPWP" : "NIK"} required={false} />
                                <TextInput value={selected.insured.nik} onChange={(value: string) => setAt(flowType, "insured.nik", value)} placeholder={selected.insured.customerType === "Perusahaan / Badan usaha" ? "NPWP" : "NIK"} icon={<User className="h-4 w-4" />} />
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="text-[18px] font-bold tracking-tight text-slate-900">Informasi Kendaraan Lanjutan</div>
                          <div className="mt-1 text-sm text-slate-500">Isi data kendaraan setelah memilih cara pengisian.</div>

                          {selected.ui.dataMode === "scan" && !selected.stnkRead ? (
                            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                              Upload foto STNK terlebih dahulu untuk menampilkan informasi kendaraan lanjutan.
                            </div>
                          ) : null}

                          {(selected.ui.dataMode !== "scan" || selected.stnkRead) && selected.insured.customerType === "Perusahaan / Badan usaha" ? (
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                              <div>
                                <FieldLabel label="Kontak di Lokasi" />
                                <TextInput value={selected.vehicle.contactOnLocation} onChange={(value: string) => setAt(flowType, "vehicle.contactOnLocation", value)} placeholder="Masukkan kontak di lokasi" icon={<Phone className="h-4 w-4" />} />
                              </div>
                            </div>
                          ) : null}

                          {(selected.ui.dataMode !== "scan" || selected.stnkRead) ? <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div>
                                  <FieldLabel label="Jangka Waktu Pertanggungan (Mulai)" />
                              <TextInput value={selected.quote.coverageStart} onChange={(value: string) => setAt(flowType, "quote.coverageStart", value)} type="date" />
                            </div>

                            {selected.ui.dataMode ? (
                              <>
                                <div>
                                  <FieldLabel label="Jangka Waktu Pertanggungan (Akhir)" />
                                  <TextInput value={selected.quote.coverageEnd} type="date" readOnly />
                                </div>
                                {flowType === "carTlo" ? (
                                  <div>
                                    <FieldLabel label="Merek / Tipe Kendaraan" />
                                    <SelectInput value={selected.quote.vehicleType} onChange={(value: string) => setAt(flowType, "quote.vehicleType", value)} options={PASSENGER_CAR_MODELS} placeholder="Pilih merek dan tipe mobil penumpang" />
                                  </div>
                                ) : flowType !== "motor" ? (
                                  <div>
                                    <FieldLabel label="Jenis Kendaraan" />
                                    <SelectInput value={selected.quote.vehicleType} onChange={(value: string) => setAt(flowType, "quote.vehicleType", value)} options={["Angkutan Penumpang", "Angkutan Barang", "Bis"]} placeholder="Mobil ini termasuk jenis apa?" />
                                  </div>
                                ) : null}
                                <div>
                                  <FieldLabel label="Nomor Polisi / TNKB" />
                                  <TextInput value={selected.vehicle.plateNumber} onChange={(value: string) => setAt(flowType, "vehicle.plateNumber", value)} placeholder={selected.ui.dataMode === "scan" && !selected.stnkRead ? "Isi manual atau gunakan Foto STNK" : "Masukkan nomor polisi / TNKB"} icon={<MapPin className="h-4 w-4" />} />
                                </div>
                                <div>
                                  <FieldLabel label="Nomor Rangka" />
                                  <TextInput value={selected.vehicle.chassisNumber} onChange={(value: string) => setAt(flowType, "vehicle.chassisNumber", value)} placeholder={selected.ui.dataMode === "scan" && !selected.stnkRead ? "Isi manual atau gunakan Foto STNK" : "Masukkan nomor rangka kendaraan"} />
                                </div>
                                <div>
                                  <FieldLabel label="Nomor Mesin" />
                                  <TextInput value={selected.vehicle.engineNumber} onChange={(value: string) => setAt(flowType, "vehicle.engineNumber", value)} placeholder={selected.ui.dataMode === "scan" && !selected.stnkRead ? "Isi manual atau gunakan Foto STNK" : "Masukkan nomor mesin kendaraan"} />
                                </div>
                                <div>
                                  <FieldLabel label="Warna" />
                                  <TextInput value={selected.vehicle.color} onChange={(value: string) => setAt(flowType, "vehicle.color", value)} placeholder={selected.ui.dataMode === "scan" && !selected.stnkRead ? "Isi manual atau gunakan Foto STNK" : "Masukkan warna kendaraan"} />
                                </div>
                                <div>
                                  <FieldLabel label={`Merek / Tipe ${flowType === "motor" ? "Motor" : "Mobil"}`} />
                                  <TextInput value={selected.quote.vehicleName} onChange={(value: string) => setAt(flowType, "quote.vehicleName", value)} placeholder={selected.ui.dataMode === "scan" && !selected.stnkRead ? "Isi manual atau gunakan Foto STNK" : `Cari contoh: ${suggestions[0]}`} icon={<Search className="h-4 w-4" />} listId={`${flowType}-list-2`} />
                                  <datalist id={`${flowType}-list-2`}>{suggestions.map((s) => <option key={s} value={s} />)}</datalist>
                                </div>
                                <div>
                                  <FieldLabel label="Tahun Pembuatan Kendaraan" helpText="Sesuai tahun pembuatan/manufacture year pada STNK." />
                                  <TextInput value={selected.vehicle.year} onChange={(value: string) => setAt(flowType, "vehicle.year", value)} placeholder={selected.ui.dataMode === "scan" && !selected.stnkRead ? "Isi manual atau gunakan Foto STNK" : "Masukkan tahun kendaraan"} />
                                </div>
                              </>
                            ) : null}
                          </div> : null}

                          {(selected.ui.dataMode !== "scan" || selected.stnkRead) && flowType !== "motor" ? (
                            <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50">
                              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-left">
                                <div>
                                  <div className="text-sm font-semibold text-slate-900">Perlengkapan Tambahan</div>
                                  <div className="mt-1 text-xs text-slate-500">Aksesori atau perangkat non-standar yang bukan bawaan pabrik dan ingin ikut dijamin bersama kendaraan.</div>
                                </div>
                                <ChevronDown className="h-4 w-4 text-slate-400" />
                              </summary>
                              <div className="border-t border-slate-200 px-4 py-4">
                                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                                  <div>
                                    <FieldLabel label="Nilai perlengkapan tambahan" required={false} />
                                    <TextInput
                                      value={selected.quote.extensions.equipment.amount ? formatRupiah(Number(selected.quote.extensions.equipment.amount)) : ""}
                                      onChange={(value: string) => {
                                        const raw = Number(String(value).replace(/[^0-9]/g, "")) || 0;
                                        const capped = Math.min(calc?.details?.equipmentCap || 0, raw);
                                        setAt(flowType, "quote.extensions.equipment.amount", capped);
                                        setAt(flowType, "quote.extensions.equipment.enabled", capped > 0);
                                      }}
                                      placeholder={`Maksimum ${formatRupiah(calc?.details?.equipmentCap || 0)}`}
                                      inputMode="numeric"
                                    />
                                  </div>
                                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600">
                                    Maksimum 10% dari harga pertanggungan casco, paling tinggi Rp25.000.000.
                                  </div>
                                </div>
                              </div>
                            </details>
                          ) : null}
                        </div>
                      </div>
                    </ActionCard>

                    <ActionCard>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                      <div className="text-[20px] font-bold tracking-tight text-slate-900">Foto Kendaraan</div>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {Object.keys(selected.uploads).map((name, index) => (
                          <button key={name} onClick={() => {
                            const nextValue = !selected.uploads[name];
                            setAt(flowType, `uploads.${name}`, nextValue);
                            setEvidence((prev) => ({
                              ...prev,
                              [flowType]: {
                                ...prev[flowType],
                                [name]: nextValue
                                  ? createPhotoEvidence({
                                      label:
                                        name === "Ambil foto bagian depan"
                                      ? "Foto Kendaraan Tampak Depan"
                                          : name === "Ambil foto bagian belakang"
                                            ? "Foto Kendaraan Tampak Belakang"
                                            : name === "Ambil foto bagian samping kanan"
                                              ? "Foto Kendaraan Tampak Samping Kanan"
                                              : "Foto Kendaraan Tampak Samping Kiri",
                                      declaredAddress: selected.insured.address,
                                    })
                                  : null,
                              },
                            }));
                          }} className={cls("rounded-xl border p-4 text-left", selected.uploads[name] ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white")}>
                            <div className="text-sm font-bold text-slate-900">{index === 0 ? "Foto Kendaraan Tampak Depan" : "Foto Kendaraan Tampak Belakang"}</div>
                            <div className="mt-1 text-xs text-slate-500">{selected.uploads[name] ? "Foto sudah diambil" : "Buka kamera"}</div>
                          </button>
                        ))}
                      </div>
                    </ActionCard>

                  </>
                ) : null}

                {step === 3 ? (
                  <>
                    <ActionCard>
                      <div className="text-[20px] font-bold tracking-tight text-slate-900">Informasi Nasabah</div>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div><div className="text-sm text-slate-500">Nama Nasabah</div><div className="mt-1 text-lg font-semibold text-slate-900">{selected.insured.fullName || "-"}</div></div>
                        <div><div className="text-sm text-slate-500">Nilai yang Dilindungi</div><div className="mt-1 text-lg font-semibold text-slate-900">{formatRupiah(calc?.details?.insuredValue || Number(selected.quote.marketValue || 0))}</div></div>
                      </div>
                    </ActionCard>
                    <ActionCard>
                      <div className="text-[20px] font-bold tracking-tight text-slate-900">Perlindungan Asuransi</div>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <PaymentInfoButton title="Lihat Ringkasan Manfaat" description="Rangkuman jaminan utama dan perluasan yang dipilih pada penawaran ini." onClick={() => setPaymentPanel((prev) => prev === "benefit" ? "" : "benefit")} />
                        <PaymentInfoButton title="Lihat Syarat Utama" description="Ringkasan syarat penting sebelum pembayaran, tanpa menampilkan wording polis penuh." onClick={() => setPaymentPanel((prev) => prev === "terms" ? "" : "terms")} />
                      </div>
                      {paymentPanel === "benefit" ? <div className="mt-4"><PaymentInfoPanel title="Ringkasan Manfaat">Jaminan utama mengikuti jenis pertanggungan kendaraan yang dipilih. {Object.keys(selected.quote.extensions).some((key) => selected.quote.extensions[key]?.enabled) ? `Perluasan yang dipilih: ${exts.filter((item) => selected.quote.extensions[item.id]?.enabled).map((item) => item.label).join(", ")}.` : "Belum ada perluasan tambahan yang dipilih."}</PaymentInfoPanel></div> : null}
                      {paymentPanel === "terms" ? <div className="mt-4"><PaymentInfoPanel title="Ringkasan Syarat Utama">Premi pada halaman ini berlaku untuk versi penawaran yang sedang aktif. Polis lengkap dan wording resmi tetap mengacu pada dokumen final setelah pembayaran berhasil. Jika data kendaraan berubah, premi dan kelayakan penawaran dapat diperbarui kembali.</PaymentInfoPanel></div> : null}
                    </ActionCard>
                    <ActionCard>
                      <div className="text-[20px] font-bold tracking-tight text-slate-900">Persetujuan Kebijakan</div>
                      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <div className="flex items-start gap-3">
                          <div className={cls("mt-1 inline-flex h-5 w-5 items-center justify-center rounded border", selected.agree ? "border-[#0A4D82] bg-[#0A4D82] text-white" : "border-slate-300 bg-white text-transparent")}><CheckCircle2 className="h-4 w-4" /></div>
                          <div className="text-sm leading-7 text-slate-600">Saya menyetujui persetujuan kebijakan yang berlaku. <button type="button" onClick={() => setShowConsentModal(true)} className="font-semibold text-[#0A4D82] underline underline-offset-2">Lihat di sini</button></div>
                        </div>
                        {selected.agree ? <div className="mt-3 text-sm font-medium text-emerald-700">Persetujuan sudah diberikan untuk melanjutkan pembayaran.</div> : null}
                      </div>
                    </ActionCard>
                    <ActionCard>
                      <div className="text-[20px] font-bold tracking-tight text-slate-900">Kode Promo</div>
                      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_140px]"><TextInput value={selected.promoCode} onChange={(value: string) => setAt(flowType, "promoCode", value)} placeholder="Masukkan kode promo yang tersedia" icon={<Search className="h-4 w-4" />} /><button className="rounded-[8px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">Cek Promo</button></div>
                    </ActionCard>
                    <ActionCard>
                      <div className="text-[20px] font-bold tracking-tight text-slate-900">Metode Pembayaran</div>
                      <div className="mt-4 grid gap-4 md:grid-cols-3">{["Virtual Account", "E-Wallet", "QRIS"].map((m) => <button key={m} onClick={() => { setAt(flowType, "paymentMethod", m); setCheckoutStatus(""); }} className={cls("rounded-xl border px-4 py-4 text-left text-sm font-bold", selected.paymentMethod === m ? "border-[#0A4D82] bg-[#0A4D82] text-white" : "border-slate-300 bg-white text-slate-700")}>{m}</button>)}</div>
                    </ActionCard>
                  </>
                ) : null}
              </div>

              {step > 1 || showPremiumDetails ? <aside className="h-fit self-start rounded-2xl bg-[#0A4D82] p-5 text-white shadow-lg md:sticky md:top-32">
                <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-[18px] font-bold"><FileText className="h-5 w-5" />Ringkasan</div><ChevronDown className="h-5 w-5 text-white/80" /></div>
                <div className="mt-4 border-t border-white/15 pt-3.5">
                  <SummaryRow label="Produk" value={flowType === "motor" ? "Total Loss Kendaraan - Motor" : flowType === "carComp" ? "Kendaraan Roda 4 - Comprehensive" : "Total Loss Kendaraan - Mobil"} />
                  <SummaryRow label="Kode Wilayah" value={selected.quote.plateRegion || "-"} />
                  <SummaryRow label="Penggunaan" value={selected.quote.usage || "-"} />
                  {flowType !== "motor" ? <SummaryRow label="Nilai yang Dilindungi" value={formatRupiah(calc?.details?.insuredValue || Number(selected.quote.marketValue || 0))} /> : null}
                </div>
                <div className="mt-3 border-t border-white/15 pt-3.5">
                  <SummaryRow label="Premi" value={formatRupiah(flowType === "carComp" ? calc.mainPremium : getMainPremiumSplit(flowType, calc).ownDamage + getMainPremiumSplit(flowType, calc).theft)} />
                  {calc.extensionTotal > 0 ? <SummaryRow label="Premi Perluasan" value={formatRupiah(calc.extensionTotal)} /> : null}
                  <SummaryRow label="Biaya Meterai" value={formatRupiah(calc.stamp)} />
                </div>
                <div className="mt-4 rounded-xl bg-white/10 p-4"><div className="text-sm text-white/75">Estimasi Premi 1 Tahun</div><div className="mt-2 text-right text-[30px] font-bold leading-none">{formatRupiah(calc.total)}</div></div>
                {step === 1 ? <div className="mt-4"><button onClick={() => setStep(2)} disabled={!isYearEligible(flowType, selected.quote.year) || !validateMaxHP(flowType, Number(selected.quote.marketValue || 0))} className={cls("flex h-[48px] w-full items-center justify-center rounded-[8px] text-sm font-bold uppercase tracking-wide text-white shadow-sm", isYearEligible(flowType, selected.quote.year) ? "bg-[#F5A623] hover:brightness-105" : "bg-white/20")}>Isi Data</button></div> : null}
                {step === 2 ? <div className="mt-4 space-y-2.5"><button onClick={() => setStep(3)} className="flex h-[48px] w-full items-center justify-center rounded-[8px] bg-[#F5A623] text-sm font-bold uppercase tracking-wide text-white shadow-sm hover:brightness-105">Pembayaran</button><button onClick={() => setStep(1)} className="flex h-11 w-full items-center justify-center rounded-[8px] border border-white/20 bg-white/10 text-sm font-medium text-white hover:bg-white/15">Kembali</button></div> : null}
                {step === 3 ? <div className="mt-4 space-y-2.5"><button onClick={() => { if (canIssue && canProceedPayment) setCheckoutStatus("Pembayaran berhasil disimulasikan. Sistem akan melanjutkan ke validasi pembayaran dan penerbitan dokumen final."); }} className={cls("flex h-[48px] w-full items-center justify-center rounded-[8px] text-sm font-bold uppercase tracking-wide text-white shadow-sm", canIssue && canProceedPayment ? "bg-[#F5A623] hover:brightness-105" : "bg-white/20")}>{operatingBlockedMessage ? "Menunggu Review" : calc.status === "Need Review" ? "Perlu Review Underwriter" : canIssue ? "Bayar Premi" : "Isi Data"}</button><button onClick={() => { setStep(2); setCheckoutStatus(""); }} className="flex h-11 w-full items-center justify-center rounded-[8px] border border-white/20 bg-white/10 text-sm font-medium text-white hover:bg-white/15">Kembali</button></div> : null}
                {step === 2 && selected.ui.dataMode === "scan" && (!selected.ktpRead || !selected.stnkRead) ? <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4" /><div>Dokumen KTP atau STNK belum terbaca penuh. Kamu masih bisa lanjut isi manual bila diperlukan.</div></div></div> : null}
                {step === 3 && !selected.agree ? <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4" /><div>Persetujuan kebijakan harus dibuka dan disetujui sebelum pembayaran.</div></div></div> : null}
                {step === 3 && operatingBlockedMessage ? <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4" /><div>{operatingBlockedMessage}</div></div></div> : null}
                {step === 3 && checkoutStatus ? <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"><div className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4" /><div>{checkoutStatus}</div></div></div> : null}
              </aside> : null}
            </div>
          </div>
          <ConsentModal open={showConsentModal} agreed={selected.agree} onClose={() => setShowConsentModal(false)} onAgree={() => { setAt(flowType, "agree", true); setShowConsentModal(false); }} />
        </>
      )}
    </div>
  );
}











