export const CURRENT_YEAR = 2026;
export const MIN_YEAR_TLO = CURRENT_YEAR - 20;

export const PLATES = [
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

export const MOTOR_USAGES = ["Pribadi", "Komersial"];

export const MOTOR_EXTENSIONS = [
  {
    key: "tpl",
    title: "Jaminan Tanggung Jawab Hukum terhadap Pihak Ketiga",
    detail:
      "Menjamin tanggung jawab hukum Tertanggung atas kematian, cidera badan, biaya perawatan/pengobatan, serta kerugian atau kerusakan harta benda milik penumpang atau pihak ketiga yang timbul langsung akibat kecelakaan kendaraan yang dijamin polis.",
    deductible: "Jaminan ini tidak dikenakan risiko sendiri",
    type: "amount",
  },
  {
    key: "srcc",
    title: "Jaminan Kerusuhan dan Huru-hara",
    detail:
      "Menjamin kerugian atau kerusakan kendaraan yang secara langsung disebabkan oleh kerusuhan, pemogokan, penghalangan bekerja, tawuran, huru-hara, pembangkitan rakyat tanpa senjata api, revolusi tanpa senjata api, serta penjarahan yang terjadi dalam peristiwa tersebut.",
    deductible: "10% dari klaim yang disetujui, minimum Rp500.000 per kejadian.",
    type: "toggle",
  },
  {
    key: "ts",
    title: "Jaminan Terorisme",
    detail: "Menjamin kerugian atau kerusakan kendaraan yang secara langsung disebabkan oleh makar, terorisme, atau sabotase.",
    deductible: "10% dari klaim yang disetujui, minimum Rp500.000 per kejadian.",
    type: "toggle",
  },
  {
    key: "flood",
    title: "Jaminan Banjir",
    detail:
      "Menjamin kerugian atau kerusakan akibat banjir, angin topan, badai, hujan es, genangan air, dan atau tanah longsor yang secara langsung mengenai kendaraan.",
    deductible: "10% dari nilai kerugian yang disetujui, minimum Rp500.000 per kejadian.",
    type: "toggle",
  },
  {
    key: "quake",
    title: "Jaminan Gempa Bumi",
    detail: "Menjamin kerugian atau kerusakan kendaraan yang secara langsung disebabkan oleh gempa bumi, tsunami, dan atau letusan gunung berapi.",
    deductible: "10% dari nilai kerugian yang disetujui, minimum Rp500.000 per kejadian.",
    type: "toggle",
  },
];

const OJK_REGION_1_CODES = ["BA", "BB", "BD", "BE", "BG", "BH", "BK", "BL", "BM", "BN", "BP"];
const OJK_REGION_2_CODES = ["A", "B", "D", "E", "F", "T", "Z"];

const TLO_RATES_MOTOR = {
  1: { min: 0.0176 },
  2: { min: 0.018 },
  3: { min: 0.0067 },
};

const FLOOD_RATES = { 1: { min: 0.00075 }, 2: { min: 0.001 }, 3: { min: 0.00075 } };
const QUAKE_RATES = { 1: { min: 0.00085 }, 2: { min: 0.00075 }, 3: { min: 0.0005 } };
const SRCC_RATE = 0.00035;
const TS_RATE = 0.00035;

function progressiveTPL(amount) {
  let remaining = Math.max(0, Number(amount) || 0);
  let total = 0;
  const band1 = Math.min(remaining, 25000000);
  total += band1 * 0.01;
  remaining -= band1;
  if (remaining > 0) {
    const band2 = Math.min(remaining, 25000000);
    total += band2 * 0.005;
    remaining -= band2;
  }
  if (remaining > 0) total += Math.min(remaining, 50000000) * 0.0025;
  return Math.round(total);
}

function previewMotorExtensionFee(quote, key) {
  const marketValue = Math.max(0, Number(quote.marketValue) || 0);
  const region = getRegion(quote.plateRegion);
  if (key === "tpl") return progressiveTPL(Math.min(1000000, Number(quote.extensions.tpl.amount || 1000000)));
  if (!marketValue) return 0;
  if (key === "srcc") return Math.round(marketValue * SRCC_RATE);
  if (key === "ts") return Math.round(marketValue * TS_RATE);
  if (key === "flood") return Math.round(marketValue * FLOOD_RATES[region].min);
  if (key === "quake") return Math.round(marketValue * QUAKE_RATES[region].min);
  return 0;
}

export function getPlateCode(plateRegion) {
  return String(plateRegion || "").split(" - ")[0].trim().toUpperCase();
}

export function getRegion(plateRegion) {
  const code = getPlateCode(plateRegion);
  if (OJK_REGION_1_CODES.includes(code)) return 1;
  if (OJK_REGION_2_CODES.includes(code)) return 2;
  return 3;
}

export function addOneYear(dateStr) {
  if (!dateStr) return "";
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
}

export function isMotorYearEligible(year) {
  if (!year) return false;
  const y = Number(year);
  return !Number.isNaN(y) && y >= MIN_YEAR_TLO;
}

export function motorYearLimitText() {
  return `Maksimum usia kendaraan untuk TLO adalah 20 tahun (tahun pembuatan minimum ${MIN_YEAR_TLO}).`;
}

export function validateMotorSumInsured(value) {
  return Number(value || 0) > 0 && Number(value || 0) <= 500000000;
}

export function motorSumInsuredLimitText() {
  return "Maksimum harga pertanggungan untuk motor adalah Rp500.000.000.";
}

export function createMotorInternalState() {
  return {
    quote: {
      plateRegion: "",
      year: "",
      usage: "",
      vehicleName: "",
      marketValue: "",
      coverageStart: "",
      coverageEnd: "",
      extensions: {
        tpl: { enabled: false, amount: 1000000 },
        srcc: { enabled: false },
        ts: { enabled: false },
        flood: { enabled: false },
        quake: { enabled: false },
      },
    },
    insured: {
      sourceType: "",
      customerType: "Pribadi",
      displayName: "",
      fullName: "",
      address: "",
      email: "",
      phone: "",
      identityNumber: "",
      cifMatched: false,
    },
    vehicle: {
      plateNumber: "",
      chassisNumber: "",
      engineNumber: "",
      color: "",
      contactOnLocation: "",
    },
    uploads: {
      frontView: false,
      backView: false,
    },
    readStatus: {
      ktp: false,
      stnk: false,
    },
  };
}

export function calcMotorPremium(quote) {
  const marketValue = Math.max(0, Number(quote.marketValue) || 0);
  const region = getRegion(quote.plateRegion);
  const mainPremium = Math.round(marketValue * TLO_RATES_MOTOR[region].min);
  const details = {
    tplFee: quote.extensions.tpl.enabled ? progressiveTPL(Math.min(1000000, Number(quote.extensions.tpl.amount || 0))) : 0,
    srccFee: quote.extensions.srcc.enabled ? Math.round(marketValue * SRCC_RATE) : 0,
    tsFee: quote.extensions.ts.enabled ? Math.round(marketValue * TS_RATE) : 0,
    floodFee: quote.extensions.flood.enabled ? Math.round(marketValue * FLOOD_RATES[region].min) : 0,
    quakeFee: quote.extensions.quake.enabled ? Math.round(marketValue * QUAKE_RATES[region].min) : 0,
  };
  const extensionTotal = Object.values(details).reduce((sum, item) => sum + Number(item || 0), 0);
  const netPremium = mainPremium + extensionTotal;
  const stamp = netPremium > 5000000 ? 20000 : 10000;
  return {
    mainPremium,
    extensionTotal,
    stamp,
    total: netPremium + stamp,
    details,
    status: marketValue <= 50000000 && Number(quote.year) >= 2018 ? "Straight Through" : "Need Review",
  };
}

export function getExtensionFee(quote, key) {
  return previewMotorExtensionFee(quote, key);
}
