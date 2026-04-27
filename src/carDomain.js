import { PLATES, addOneYear, getRegion } from "./motorDomain.js";

export { PLATES, addOneYear };

export const CURRENT_YEAR = 2026;
export const MIN_YEAR_CAR_TLO = CURRENT_YEAR - 20;
export const MIN_YEAR_CAR_COMP = CURRENT_YEAR - 15;
export const CAR_USAGES = ["Pribadi", "Komersial"];
export const CAR_TYPES = [
  "Sedan",
  "Hatchback",
  "City Car",
  "MPV",
  "SUV",
  "Crossover",
  "Station Wagon",
  "Coupe",
  "Convertible",
  "Minibus",
  "Van Penumpang",
  "Double Cabin",
  "Pick Up",
  "Pick Up Box",
  "Pick Up Bak",
  "Blind Van",
  "Light Truck",
  "Truck Box",
  "Truck Bak",
  "Truck Engkel",
  "Truck Double",
  "Truck Tangki",
  "Truck Derek",
  "Truck Pendingin",
  "Bus Mini",
  "Bus Sedang",
  "Bus Besar",
  "Microbus",
  "Elf",
  "Ambulance",
  "Mobil Jenazah",
  "Mobil Operasional",
  "Mobil Barang",
  "Mobil Penumpang",
  "Minivan",
  "Panel Van",
  "Cab Chassis",
  "Pick Up Double Cabin",
  "Food Truck",
  "Mobil Box",
  "Mobil Towing",
  "Mobil Tangki",
  "Mobil Listrik Penumpang",
  "Mobil Listrik Barang",
  "SUV Listrik",
  "MPV Listrik",
  "Sedan Listrik",
  "Bus Listrik",
  "Pick Up Listrik",
  "Van Listrik",
];

export const CAR_SUGGESTIONS = [
  "Toyota Avanza 1.5 G",
  "Toyota Veloz 1.5 Q",
  "Honda Brio Satya E",
  "Mitsubishi Xpander Ultimate",
  "Suzuki Ertiga GX",
  "Suzuki XL7 Beta",
];

export const PASSENGER_CAR_MODELS = [
  "Toyota Agya",
  "Toyota Raize",
  "Toyota Yaris",
  "Toyota Avanza",
  "Toyota Veloz",
  "Toyota Rush",
  "Toyota Kijang Innova",
  "Toyota Innova Zenix",
  "Toyota Camry",
  "Toyota Fortuner",
  "Honda Brio",
  "Honda City Hatchback",
  "Honda HR-V",
  "Honda BR-V",
  "Honda CR-V",
  "Honda Civic",
  "Mitsubishi Xpander",
  "Mitsubishi Xforce",
  "Suzuki Baleno",
  "Suzuki Ertiga",
  "Suzuki XL7",
  "Daihatsu Ayla",
  "Daihatsu Sigra",
  "Daihatsu Xenia",
  "Daihatsu Rocky",
  "Hyundai Stargazer",
  "Hyundai Creta",
  "Hyundai Ioniq 5",
  "Hyundai Kona Electric",
  "Wuling Air EV",
  "Wuling Alvez",
  "Wuling Almaz",
  "Wuling Cortez",
  "Wuling Confero",
  "BYD Dolphin",
  "BYD Atto 3",
  "BYD Seal",
  "Chery Omoda 5",
  "Chery Tiggo 7 Pro",
  "Nissan Livina",
  "Nissan Serena",
  "Mazda 2",
  "Mazda CX-3",
  "Mazda CX-5",
  "Kia Sonet",
  "Kia Seltos",
  "BMW 320i",
  "Mercedes-Benz C200",
  "Lexus ES 300h",
];

const PASSENGER_CAR_MODEL_META = {
  "Toyota Agya": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Toyota Raize": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Toyota Yaris": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Toyota Avanza": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Toyota Veloz": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Toyota Rush": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Toyota Kijang Innova": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Toyota Innova Zenix": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Toyota Camry": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Toyota Fortuner": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Honda Brio": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Honda City Hatchback": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Honda HR-V": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Honda BR-V": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Honda CR-V": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Honda Civic": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Mitsubishi Xpander": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Mitsubishi Xforce": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Suzuki Baleno": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Suzuki Ertiga": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Suzuki XL7": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Daihatsu Ayla": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Daihatsu Sigra": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Daihatsu Xenia": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Daihatsu Rocky": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Hyundai Stargazer": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Hyundai Creta": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Hyundai Ioniq 5": { category: "Angkutan Penumpang", fuelType: "Listrik" },
  "Hyundai Kona Electric": { category: "Angkutan Penumpang", fuelType: "Listrik" },
  "Wuling Air EV": { category: "Angkutan Penumpang", fuelType: "Listrik" },
  "Wuling Alvez": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Wuling Almaz": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Wuling Cortez": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Wuling Confero": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "BYD Dolphin": { category: "Angkutan Penumpang", fuelType: "Listrik" },
  "BYD Atto 3": { category: "Angkutan Penumpang", fuelType: "Listrik" },
  "BYD Seal": { category: "Angkutan Penumpang", fuelType: "Listrik" },
  "Chery Omoda 5": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Chery Tiggo 7 Pro": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Nissan Livina": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Nissan Serena": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Mazda 2": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Mazda CX-3": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Mazda CX-5": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Kia Sonet": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Kia Seltos": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "BMW 320i": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Mercedes-Benz C200": { category: "Angkutan Penumpang", fuelType: "Bensin" },
  "Lexus ES 300h": { category: "Angkutan Penumpang", fuelType: "Bensin" },
};

export function getPassengerCarMeta(model) {
  return PASSENGER_CAR_MODEL_META[model] || { category: "Angkutan Penumpang", fuelType: "Bensin" };
}

export const CAR_TLO_EXTENSIONS = [
  {
    key: "tpl",
    title: "Jaminan Tanggung Jawab Hukum terhadap Pihak Ketiga",
    detail:
      "Menjamin tanggung jawab hukum Tertanggung atas kematian, cidera badan, biaya perawatan/pengobatan, serta kerugian atau kerusakan harta benda milik penumpang atau pihak ketiga yang timbul langsung akibat kecelakaan kendaraan yang dijamin polis.",
    deductible: "Tanpa risiko sendiri saat klaim.",
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
  {
    key: "driverPa",
    title: "Kecelakaan Diri Pengemudi",
    detail:
      "Menjamin cidera badan, kematian, dan atau biaya pengobatan pengemudi yang secara langsung disebabkan oleh kecelakaan kendaraan yang dijamin polis.",
    deductible: "Tanpa risiko sendiri saat klaim.",
    type: "amount",
  },
  {
    key: "passengerPa",
    title: "Kecelakaan Diri Penumpang",
    detail:
      "Menjamin cidera badan, kematian, dan atau biaya pengobatan penumpang yang secara langsung disebabkan oleh kecelakaan kendaraan yang dijamin polis.",
    deductible: "Tanpa risiko sendiri saat klaim.",
    type: "amount-seat",
  },
];

const TLO_RATES_CAR = {
  1: { 1: { min: 0.0047 }, 2: { min: 0.0063 }, 3: { min: 0.0041 }, 4: { min: 0.0025 }, 5: { min: 0.002 } },
  2: { 1: { min: 0.0065 }, 2: { min: 0.0044 }, 3: { min: 0.0038 }, 4: { min: 0.0025 }, 5: { min: 0.002 } },
  3: { 1: { min: 0.0051 }, 2: { min: 0.0044 }, 3: { min: 0.0029 }, 4: { min: 0.0023 }, 5: { min: 0.002 } },
};
const FLOOD_RATES = { 1: { min: 0.0005 }, 2: { min: 0.00075 }, 3: { min: 0.0005 } };
const QUAKE_RATES = { 1: { min: 0.00085 }, 2: { min: 0.00075 }, 3: { min: 0.0005 } };
const SRCC_RATE = 0.00035;
const TS_RATE = 0.00035;
const COMP_RATES_CAR = {
  1: { 1: { min: 0.0382 }, 2: { min: 0.0267 }, 3: { min: 0.0208 }, 4: { min: 0.012 }, 5: { min: 0.0105 } },
  2: { 1: { min: 0.0247 }, 2: { min: 0.0269 }, 3: { min: 0.0271 }, 4: { min: 0.0139 }, 5: { min: 0.012 } },
  3: { 1: { min: 0.0253 }, 2: { min: 0.0246 }, 3: { min: 0.0238 }, 4: { min: 0.012 }, 5: { min: 0.0105 } },
};
const FLOOD_RATES_COMP = { 1: { min: 0.00075 }, 2: { min: 0.001 }, 3: { min: 0.00075 } };
const QUAKE_RATES_COMP = { 1: { min: 0.0012 }, 2: { min: 0.001 }, 3: { min: 0.00075 } };
const SRCC_RATE_COMP = 0.0005;
const TS_RATE_COMP = 0.0005;
const AUTH_WORKSHOP_RATE = 0.0025;

export function getCarVehicleCategory(vehicleType) {
  const value = String(vehicleType || "").toLowerCase();
  if (!value) return "";
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

function progressiveTPL(amount, vehicleType) {
  let remaining = Math.max(0, amount);
  let total = 0;
  const vehicleCategory = getCarVehicleCategory(vehicleType);
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

function computeCarTplFee(limitAmount, vehicleType) {
  const amount = Math.max(0, Number(limitAmount) || 0);
  return progressiveTPL(Math.min(100000000, amount), vehicleType);
}

function getCarTplCoverageAmount(quote, marketValue, fallbackAmount = 0) {
  const requested = Math.max(0, Number(quote.extensions.tpl?.amount || fallbackAmount) || fallbackAmount);
  const maxCoverage = marketValue ? Math.min(100000000, Math.max(0, Number(marketValue) || 0)) : 100000000;
  return Math.min(maxCoverage, requested);
}

function previewCarExtensionFee(quote, key) {
  const marketValue = Math.max(0, Number(quote.marketValue) || 0);
  const equipmentAmount = Math.min(
    Math.min(25000000, Math.round(marketValue * 0.1)),
    Math.max(0, Number(quote.extensions.equipment?.amount || 0))
  );
  const insuredValue = marketValue + equipmentAmount;
  const region = getRegion(quote.plateRegion);
  const vehicleType = quote.vehicleType || "Mobil Penumpang";
  if (key === "tpl") return computeCarTplFee(getCarTplCoverageAmount(quote, marketValue, 25000000), vehicleType);
  if (!marketValue) return 0;
  if (key === "srcc") return Math.round(insuredValue * SRCC_RATE);
  if (key === "ts") return Math.round(insuredValue * TS_RATE);
  if (key === "flood") return Math.round(insuredValue * FLOOD_RATES[region].min);
  if (key === "quake") return Math.round(insuredValue * QUAKE_RATES[region].min);
  if (key === "driverPa") return Math.round(Math.min(100000000, marketValue || 100000000, Math.max(0, Number(quote.extensions.driverPa.amount || 10000000))) * 0.005);
  if (key === "passengerPa") {
    const amount = Math.min(100000000, marketValue || 100000000, Math.max(0, Number(quote.extensions.passengerPa.amount || 10000000)));
    const seats = Math.min(7, Math.max(1, Number(quote.extensions.passengerPa.seats || 4)));
    return Math.round(amount * 0.001 * seats);
  }
  if (key === "equipment") return Math.round(equipmentAmount * getCarTloBaseRate(region, vehicleType, marketValue));
  return 0;
}

function getCategory(value) {
  const v = Math.max(0, Number(value) || 0);
  if (v <= 125000000) return 1;
  if (v <= 200000000) return 2;
  if (v <= 400000000) return 3;
  if (v <= 800000000) return 4;
  return 5;
}

function getCarTloBaseRate(region, vehicleType, marketValue) {
  const vehicleCategory = getCarVehicleCategory(vehicleType);
  if (vehicleCategory === "Angkutan Penumpang") {
    const category = getCategory(marketValue);
    return TLO_RATES_CAR[region][category].min;
  }
  if (vehicleCategory === "Angkutan Barang") return region === 1 ? 0.0088 : region === 2 ? 0.0168 : 0.0081;
  return region === 1 ? 0.0023 : region === 2 ? 0.0023 : 0.0018;
}

export function isCarYearEligible(year) {
  if (!year) return false;
  const y = Number(year);
  return !Number.isNaN(y) && y >= MIN_YEAR_CAR_TLO;
}

export function carYearLimitText() {
  return `Maksimum usia kendaraan untuk TLO adalah 20 tahun (tahun pembuatan minimum ${MIN_YEAR_CAR_TLO}).`;
}

export function isCarCompYearEligible(year) {
  if (!year) return false;
  const y = Number(year);
  return !Number.isNaN(y) && y >= MIN_YEAR_CAR_COMP;
}

export function carCompYearLimitText() {
  return `Maksimum usia kendaraan untuk Comprehensive adalah 15 tahun (tahun pembuatan minimum ${MIN_YEAR_CAR_COMP}).`;
}

export function validateCarSumInsured(value) {
  return Number(value || 0) > 0 && Number(value || 0) <= 1500000000;
}

export function carSumInsuredLimitText() {
  return "Maksimum harga pertanggungan untuk mobil adalah Rp1.500.000.000.";
}

export function createCarInternalState() {
  return {
    quote: {
      plateRegion: "",
      year: "",
      usage: "",
      vehicleType: "",
      vehicleName: "",
      marketValue: "",
      coverageStart: "",
      coverageEnd: "",
      extensions: {
        tpl: { enabled: false, amount: 25000000 },
        srcc: { enabled: false },
        ts: { enabled: false },
        flood: { enabled: false },
        quake: { enabled: false },
        driverPa: { enabled: false, amount: 10000000 },
        passengerPa: { enabled: false, amount: 10000000, seats: 4 },
        equipment: { enabled: false, amount: "" },
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
      rightView: false,
      leftView: false,
    },
    readStatus: {
      ktp: false,
      stnk: false,
    },
  };
}

export function createCarCompInternalState() {
  const base = createCarInternalState();
  return {
    ...base,
    quote: {
      ...base.quote,
      extensions: {
        ...base.quote.extensions,
        authorizedWorkshop: { enabled: false },
      },
    },
  };
}

export function calcCarTloPremium(quote) {
  const marketValue = Math.max(0, Number(quote.marketValue) || 0);
  const equipmentCap = Math.min(25000000, Math.round(marketValue * 0.1));
  const equipmentAmount = quote.extensions.equipment?.enabled
    ? Math.min(equipmentCap, Math.max(0, Number(quote.extensions.equipment.amount || 0)))
    : 0;
  const insuredValue = marketValue + equipmentAmount;
  const region = getRegion(quote.plateRegion);
  const vehicleType = quote.vehicleType || "Mobil Penumpang";
  const vehicleCategory = getCarVehicleCategory(vehicleType);
  const driverPaAmount = Math.min(100000000, marketValue || 100000000, Math.max(0, Number(quote.extensions.driverPa.amount || 0)));
  const passengerPaAmount = Math.min(100000000, marketValue || 100000000, Math.max(0, Number(quote.extensions.passengerPa.amount || 0)));
  const passengerSeats = Math.min(7, Math.max(1, Number(quote.extensions.passengerPa.seats || 4)));
  let mainPremium = 0;
  if (vehicleCategory === "Angkutan Penumpang") {
    const category = getCategory(marketValue);
    mainPremium = Math.round(marketValue * TLO_RATES_CAR[region][category].min);
  } else if (vehicleCategory === "Angkutan Barang") {
    mainPremium = Math.round(marketValue * (region === 1 ? 0.0088 : region === 2 ? 0.0168 : 0.0081));
  } else {
    mainPremium = Math.round(marketValue * (region === 1 ? 0.0023 : region === 2 ? 0.0023 : 0.0018));
  }
  const baseRate = marketValue ? mainPremium / marketValue : 0;
  const details = {
    tplFee: quote.extensions.tpl.enabled ? computeCarTplFee(getCarTplCoverageAmount(quote, marketValue), vehicleType) : 0,
    srccFee: quote.extensions.srcc.enabled ? Math.round(insuredValue * SRCC_RATE) : 0,
    tsFee: quote.extensions.ts.enabled ? Math.round(insuredValue * TS_RATE) : 0,
    floodFee: quote.extensions.flood.enabled ? Math.round(insuredValue * FLOOD_RATES[region].min) : 0,
    quakeFee: quote.extensions.quake.enabled ? Math.round(insuredValue * QUAKE_RATES[region].min) : 0,
    driverPaFee: quote.extensions.driverPa.enabled ? Math.round(driverPaAmount * 0.005) : 0,
    passengerPaFee: quote.extensions.passengerPa.enabled
      ? Math.round(passengerPaAmount * 0.001 * passengerSeats)
      : 0,
    equipmentFee: quote.extensions.equipment?.enabled ? Math.round(equipmentAmount * baseRate) : 0,
    equipmentCap,
    insuredValue,
  };
  const extensionTotal = Object.entries(details)
    .filter(([key]) => !["equipmentCap", "insuredValue"].includes(key))
    .reduce((sum, [, item]) => sum + Number(item || 0), 0);
  const netPremium = mainPremium + extensionTotal;
  const stamp = netPremium > 5000000 ? 20000 : 10000;
  return {
    mainPremium,
    extensionTotal,
    stamp,
    total: netPremium + stamp,
    details,
    status: quote.usage === "Komersial" ? "Need Review" : "Straight Through",
  };
}

export function getCarExtensionFee(quote, key) {
  return previewCarExtensionFee(quote, key);
}

export function calcCarCompPremium(quote) {
  const marketValue = Math.max(0, Number(quote.marketValue) || 0);
  const equipmentCap = Math.min(25000000, Math.round(marketValue * 0.1));
  const equipmentAmount = quote.extensions.equipment?.enabled
    ? Math.min(equipmentCap, Math.max(0, Number(quote.extensions.equipment.amount || 0)))
    : 0;
  const insuredValue = marketValue + equipmentAmount;
  const region = getRegion(quote.plateRegion);
  const vehicleType = quote.vehicleType || "Mobil Penumpang";
  const vehicleCategory = getCarVehicleCategory(vehicleType);
  let baseMainPremium = 0;
  if (vehicleCategory === "Angkutan Penumpang") {
    const category = getCategory(marketValue);
    baseMainPremium = Math.round(marketValue * COMP_RATES_CAR[region][category].min);
  } else if (vehicleCategory === "Angkutan Barang") {
    baseMainPremium = Math.round(marketValue * (region === 1 ? 0.0242 : region === 2 ? 0.0239 : 0.0223));
  } else {
    baseMainPremium = Math.round(marketValue * (region === 1 ? 0.0104 : region === 2 ? 0.0104 : 0.0088));
  }
  const ageLoadingAmount = Math.round(baseMainPremium * Math.max(0, CURRENT_YEAR - Number(quote.year || CURRENT_YEAR) - 5) * 0.05);
  const driverPaAmount = Math.min(100000000, marketValue || 100000000, Math.max(0, Number(quote.extensions.driverPa.amount || 0)));
  const passengerPaAmount = Math.min(100000000, marketValue || 100000000, Math.max(0, Number(quote.extensions.passengerPa.amount || 0)));
  const passengerSeats = Math.min(7, Math.max(1, Number(quote.extensions.passengerPa.seats || 4)));
  const equipmentRate = marketValue ? (baseMainPremium + ageLoadingAmount) / marketValue : 0;
  const details = {
    tplFee: quote.extensions.tpl.enabled ? computeCarTplFee(getCarTplCoverageAmount(quote, marketValue), vehicleType) : 0,
    srccFee: quote.extensions.srcc.enabled ? Math.round(insuredValue * SRCC_RATE_COMP) : 0,
    tsFee: quote.extensions.ts.enabled ? Math.round(insuredValue * TS_RATE_COMP) : 0,
    floodFee: quote.extensions.flood.enabled ? Math.round(insuredValue * FLOOD_RATES_COMP[region].min) : 0,
    quakeFee: quote.extensions.quake.enabled ? Math.round(insuredValue * QUAKE_RATES_COMP[region].min) : 0,
    driverPaFee: quote.extensions.driverPa.enabled ? Math.round(driverPaAmount * 0.005) : 0,
    passengerPaFee: quote.extensions.passengerPa.enabled ? Math.round(passengerPaAmount * 0.001 * passengerSeats) : 0,
    equipmentFee: quote.extensions.equipment?.enabled ? Math.round(equipmentAmount * equipmentRate) : 0,
    authWorkshopFee: quote.extensions.authorizedWorkshop?.enabled ? Math.round((marketValue + equipmentAmount) * AUTH_WORKSHOP_RATE) : 0,
    equipmentCap,
    insuredValue,
    baseMainPremium,
    ageLoadingAmount,
  };
  const extensionTotal = Object.entries(details)
    .filter(([key]) => !["equipmentCap", "insuredValue", "baseMainPremium", "ageLoadingAmount"].includes(key))
    .reduce((sum, [, item]) => sum + Number(item || 0), 0);
  const netPremium = baseMainPremium + ageLoadingAmount + extensionTotal;
  const stamp = netPremium > 5000000 ? 20000 : 10000;
  return {
    mainPremium: baseMainPremium + ageLoadingAmount,
    extensionTotal,
    stamp,
    total: netPremium + stamp,
    details,
    status: quote.usage === "Komersial" ? "Need Review" : "Straight Through",
  };
}
