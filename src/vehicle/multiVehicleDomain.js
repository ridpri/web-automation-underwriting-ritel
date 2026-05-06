import {
  addOneYear,
  calcMotorPremium,
  isMotorYearEligible,
  validateMotorSumInsured,
} from "../motorDomain.js";
import {
  calcCarCompPremium,
  calcCarTloPremium,
  isCarCompYearEligible,
  isCarYearEligible,
  validateCarSumInsured,
} from "../carDomain.js";

const DEFAULT_MOTOR_EXTENSIONS = {
  tpl: { enabled: false, amount: 1000000 },
  srcc: { enabled: false },
  ts: { enabled: false },
  flood: { enabled: false },
  quake: { enabled: false },
};

const DEFAULT_CAR_EXTENSIONS = {
  tpl: { enabled: false, amount: 25000000 },
  srcc: { enabled: false },
  ts: { enabled: false },
  flood: { enabled: false },
  quake: { enabled: false },
  driverPa: { enabled: false, amount: 10000000 },
  passengerPa: { enabled: false, amount: 10000000, seats: 4 },
  equipment: { enabled: false, amount: "", status: "none", inclusion: "", declaredValue: "", description: "", photoCount: 1 },
};

const DEFAULT_CAR_COMP_EXTENSIONS = {
  ...DEFAULT_CAR_EXTENSIONS,
  authorizedWorkshop: { enabled: false },
};

export const MULTI_VEHICLE_UPLOAD_SLOTS = {
  motor: [
    { key: "frontAngle", label: "Foto motor dari sudut depan samping" },
    { key: "sideFull", label: "Foto salah satu sisi motor secara penuh" },
    { key: "speedometer", label: "Foto panel speedometer saat kontak ON" },
  ],
  carTlo: [
    { key: "frontView", label: "Ambil foto bagian depan" },
    { key: "rightView", label: "Ambil foto bagian samping kanan" },
    { key: "leftView", label: "Ambil foto bagian samping kiri" },
    { key: "backView", label: "Ambil foto bagian belakang" },
  ],
  carComp: [
    { key: "frontView", label: "Ambil foto bagian depan" },
    { key: "backView", label: "Ambil foto bagian belakang" },
    { key: "rightView", label: "Ambil foto bagian samping kanan" },
    { key: "leftView", label: "Ambil foto bagian samping kiri" },
    { key: "dashboardView", label: "Foto interior dashboard dan odometer" },
    { key: "vinView", label: "Foto nomor rangka / VIN" },
    { key: "stnkView", label: "Foto STNK" },
  ],
};

export function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

export function isValidPhoneNumber(value) {
  const digits = onlyDigits(value);
  return digits.length >= 10 && digits.length <= 15;
}

export function isValidEmailAddress(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function defaultExtensionsForFlow(flowType) {
  if (flowType === "motor") return DEFAULT_MOTOR_EXTENSIONS;
  if (flowType === "carComp") return DEFAULT_CAR_COMP_EXTENSIONS;
  return DEFAULT_CAR_EXTENSIONS;
}

function createDefaultUploads(flowType) {
  return Object.fromEntries((MULTI_VEHICLE_UPLOAD_SLOTS[flowType] || MULTI_VEHICLE_UPLOAD_SLOTS.motor).map((slot) => [slot.key, false]));
}

export function isMultiVehicleFlowEnabled(flowType) {
  return ["motor", "carTlo", "carComp"].includes(flowType);
}

export function createMultiVehicleDraft(flowType = "motor", index = 0, overrides = {}) {
  const vehicleNumber = index + 1;
  const defaultQuote = {
    plateRegion: "",
    year: "",
    usage: "",
    vehicleType: "",
    vehicleName: "",
    vehicleFuelType: "",
    vehicleBodyType: "",
    marketValue: "",
    coverageStart: "",
    coverageEnd: "",
    mainDeductibleOverrideAmount: "",
    extensions: defaultExtensionsForFlow(flowType),
  };
  const defaultVehicle = {
    plateNumber: "",
    ownerNameOnStnk: "",
    chassisNumber: "",
    engineNumber: "",
    color: "",
    contactOnLocation: "",
  };
  const defaultUnderwriting = {
    claimHistory: "",
    existingDamageStatus: "",
    existingDamagePhotoCount: 1,
  };
  const quote = { ...defaultQuote, ...(overrides.quote || {}) };
  return {
    id: overrides.id || `vehicle-${vehicleNumber}`,
    title: overrides.title || `Kendaraan ${vehicleNumber}`,
    detailsOpen: overrides.detailsOpen ?? index === 0,
    uwDetailsOpen: overrides.uwDetailsOpen ?? index === 0,
    quote: {
      ...quote,
      coverageEnd: quote.coverageStart ? addOneYear(quote.coverageStart) : quote.coverageEnd,
      extensions: {
        ...defaultExtensionsForFlow(flowType),
        ...((overrides.quote && overrides.quote.extensions) || {}),
      },
    },
    vehicle: { ...defaultVehicle, ...(overrides.vehicle || {}) },
    underwriting: { ...defaultUnderwriting, ...(overrides.underwriting || {}) },
    uploads: { ...createDefaultUploads(flowType), ...(overrides.uploads || {}) },
  };
}

function calculateVehicleQuote(flowType, vehicle) {
  const quote = vehicle.quote || {};
  const result =
    flowType === "motor"
      ? calcMotorPremium(quote)
      : flowType === "carComp"
        ? calcCarCompPremium(quote)
        : calcCarTloPremium(quote);
  return {
    vehicleId: vehicle.id,
    title: vehicle.title,
    marketValue: Number(quote.marketValue || 0) || 0,
    mainPremium: Number(result.mainPremium || 0),
    extensionPremium: Number(result.extensionTotal || 0),
    totalBeforeStamp: Number(result.mainPremium || 0) + Number(result.extensionTotal || 0),
    status: result.status || "Isi Data",
    details: result.details || {},
  };
}

export function calculateMultiVehiclePolicy(flowType = "motor", vehicles = []) {
  const vehicleQuotes = vehicles.map((vehicle) => calculateVehicleQuote(flowType, vehicle));
  const marketValue = vehicleQuotes.reduce((sum, item) => sum + item.marketValue, 0);
  const mainPremium = vehicleQuotes.reduce((sum, item) => sum + item.mainPremium, 0);
  const extensionPremium = vehicleQuotes.reduce((sum, item) => sum + item.extensionPremium, 0);
  const netPremium = mainPremium + extensionPremium;
  const stampDuty = netPremium > 0 ? (netPremium > 5000000 ? 20000 : 10000) : 0;
  return {
    vehicleQuotes,
    marketValue,
    mainPremium,
    extensionPremium,
    stampDuty,
    totalPremium: netPremium + stampDuty,
    status: vehicleQuotes.some((item) => item.status === "Need Review") ? "Need Review" : "Straight Through",
  };
}

function isYearEligible(flowType, year) {
  if (flowType === "carComp") return isCarCompYearEligible(year);
  if (flowType === "carTlo") return isCarYearEligible(year);
  return isMotorYearEligible(year);
}

function isValidSumInsured(flowType, value) {
  if (flowType === "motor") return validateMotorSumInsured(value);
  return validateCarSumInsured(value);
}

function vehicleLabel(vehicle, index) {
  return String(vehicle?.quote?.vehicleName || "").trim() || vehicle.title || `Kendaraan ${index + 1}`;
}

export function getMultiVehicleStepOnePendingItems({ flowType = "motor", insuredName = "", phone = "", email = "", vehicles = [] } = {}) {
  const items = [];
  if (!String(insuredName || "").trim()) items.push("Isi nama calon pemegang polis atau pilih CIF.");
  if (!isValidPhoneNumber(phone) || !isValidEmailAddress(email)) items.push("Lengkapi nomor handphone dan alamat email yang valid.");
  if (!vehicles.length) items.push("Tambahkan minimal satu kendaraan.");
  vehicles.forEach((vehicle, index) => {
    const label = vehicleLabel(vehicle, index);
    const quote = vehicle.quote || {};
    if (!String(quote.vehicleName || "").trim()) items.push(`${label}: pilih merek / tipe kendaraan.`);
    if (!String(quote.plateRegion || "").trim()) items.push(`${label}: pilih kode wilayah plat / TNKB.`);
    if (!isYearEligible(flowType, quote.year)) items.push(`${label}: tahun kendaraan melewati batas usia produk.`);
    if (!isValidSumInsured(flowType, quote.marketValue)) items.push(`${label}: isi harga pertanggungan yang valid.`);
    if (!String(quote.usage || "").trim()) items.push(`${label}: pilih penggunaan kendaraan.`);
    if (flowType !== "motor" && !String(quote.vehicleType || "").trim()) items.push(`${label}: pilih merek / tipe kendaraan dari database.`);
  });
  return items;
}

function hasCompleteUploads(flowType, uploads = {}) {
  return (MULTI_VEHICLE_UPLOAD_SLOTS[flowType] || []).every((slot) => Boolean(uploads[slot.key]));
}

function isValidIdentityNumber(customerType, value) {
  const digits = onlyDigits(value);
  if (customerType === "Perusahaan / Badan Usaha") return digits.length >= 15;
  return digits.length === 16;
}

export function getMultiVehicleStepTwoPendingItems({ flowType = "motor", customerType = "Pribadi", idNumber = "", insuredName = "", address = "", email = "", phone = "", coverageStartDate = "", vehicles = [] } = {}) {
  const items = [];
  if (!String(insuredName || "").trim()) items.push("Nama nasabah belum lengkap.");
  if (!isValidIdentityNumber(customerType, idNumber)) items.push(customerType === "Perusahaan / Badan Usaha" ? "NPWP yang diisi minimal 15 digit." : "NIK yang diisi harus 16 digit.");
  if (!String(address || "").trim()) items.push("Alamat calon pemegang polis belum lengkap.");
  if (!isValidEmailAddress(email)) items.push("Alamat email belum lengkap.");
  if (!isValidPhoneNumber(phone)) items.push("Nomor handphone belum lengkap.");
  if (!coverageStartDate) items.push("Tanggal mulai perlindungan belum diisi.");
  vehicles.forEach((vehicle, index) => {
    const label = vehicleLabel(vehicle, index);
    const vehicleData = vehicle.vehicle || {};
    const underwriting = vehicle.underwriting || {};
    if (!String(vehicleData.plateNumber || "").trim()) items.push(`${label}: nomor polisi / TNKB belum lengkap.`);
    if (!String(vehicleData.chassisNumber || "").trim()) items.push(`${label}: nomor rangka kendaraan belum lengkap.`);
    if (!String(vehicleData.engineNumber || "").trim()) items.push(`${label}: nomor mesin kendaraan belum lengkap.`);
    if (!String(underwriting.claimHistory || "").trim()) items.push(`${label}: riwayat klaim 3 tahun terakhir belum diisi.`);
    if (flowType === "carComp" && !String(underwriting.existingDamageStatus || "").trim()) items.push(`${label}: jawaban kerusakan pada kendaraan belum dipilih.`);
    if (!hasCompleteUploads(flowType, vehicle.uploads)) items.push(`${label}: foto kendaraan belum lengkap.`);
  });
  return items;
}

export function getMultiVehicleReviewPendingItems(policyStatus = "") {
  if (policyStatus !== "Need Review") return [];
  return ["Profil risiko salah satu kendaraan masih perlu dicek oleh underwriter sebelum pembayaran."];
}
