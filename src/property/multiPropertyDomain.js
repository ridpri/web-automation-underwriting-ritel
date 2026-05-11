const DEFAULT_GUARANTEES = {
  riot: false,
  flood: false,
  tsfwd: false,
  earthquake: false,
};

export const WALL_MATERIAL_OPTIONS = [
  "Seluruhnya dari beton, bata, hebel, atau bahan tidak mudah terbakar",
  "Ada bagian bahan mudah terbakar, maksimal sekitar 20% dari luas dinding",
  "Bagian bahan mudah terbakar melebihi 20% dari luas dinding",
];
export const STRUCTURE_MATERIAL_OPTIONS = [
  "Beton, baja, atau bahan tidak mudah terbakar",
  "Kayu",
  "Material lain di luar ketentuan kelas 1 dan 2",
];
export const ROOF_MATERIAL_OPTIONS = [
  "Beton, metal, genteng, atau bahan tidak mudah terbakar",
  "Sirap kayu keras",
  "Bahan mudah terbakar lainnya",
];
export const FLAMMABLE_MATERIAL_OPTIONS = ["Tidak ada", "Ada"];

const DEFAULT_UW_FORM = {
  idNumber: "",
  picName: "",
  coverageStartDate: "",
  fireProtectionChoice: "Tidak Ada",
  fireProtectionItems: [],
  claimHistory: "",
  stockType: "",
  surroundingRisk: "",
  additionalNotes: "",
};

const DEFAULT_UPLOADS = {
  frontView: "",
  sideRightView: "",
  sideLeftView: "",
};

export function onlyDigits(value) {
  let result = "";
  const source = String(value || "");
  for (let i = 0; i < source.length; i += 1) {
    const code = source.charCodeAt(i);
    if (code >= 48 && code <= 57) result += source[i];
  }
  return result;
}

export function parseCurrencyValue(value) {
  return Number(onlyDigits(value) || "0");
}

export function deriveConstructionClass(form = {}) {
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

export function createMultiPropertyDraft(index = 0, overrides = {}) {
  const propertyNumber = index + 1;
  const base = {
    id: overrides.id || `property-${propertyNumber}`,
    title: overrides.title || `Properti ${propertyNumber}`,
    propertyType: "",
    occupancy: "",
    locationSearch: "",
    constructionClass: "",
    wallMaterial: "",
    structureMaterial: "",
    roofMaterial: "",
    flammableMaterial: "",
    objectRows: [{ id: "obj-1", type: "", amount: "", note: "" }],
    selectedGuarantees: { ...DEFAULT_GUARANTEES },
    expandedRows: { fire: false, riot: false, flood: false, tsfwd: false, earthquake: false, exclusions: false },
    detailsOpen: index === 0,
    floorCount: "",
    uwForm: { ...DEFAULT_UW_FORM },
    uploads: { ...DEFAULT_UPLOADS },
  };
  return {
    ...base,
    ...overrides,
    objectRows: overrides.objectRows || base.objectRows,
    selectedGuarantees: { ...DEFAULT_GUARANTEES, ...(overrides.selectedGuarantees || {}) },
    expandedRows: { ...base.expandedRows, ...(overrides.expandedRows || {}) },
    uwForm: { ...DEFAULT_UW_FORM, ...(overrides.uwForm || {}) },
    uploads: { ...DEFAULT_UPLOADS, ...(overrides.uploads || {}) },
  };
}

export function calculatePropertyValue(property) {
  return (property.objectRows || []).reduce((sum, row) => sum + parseCurrencyValue(row.amount), 0);
}

function selectedGuaranteesForProperty(property, selectedGuarantees) {
  return { ...DEFAULT_GUARANTEES, ...(selectedGuarantees || property.selectedGuarantees || {}) };
}

export function isOfficeFloorCountRequiredForProperty(property = {}) {
  return property.occupancy === "Kantor" || (!property.occupancy && property.propertyType === "Kantor");
}

function hasEarthquakeFloorExposure(property = {}) {
  const propertyType = property.propertyType || "";
  const occupancy = property.occupancy || "";
  if (!propertyType && !occupancy) return true;
  if (propertyType === "Rumah Tinggal" || propertyType === "Kos-kosan") return false;
  if (occupancy === "Warung / Kelontong") return false;
  return propertyType === "Ruko" || propertyType === "Toko" || propertyType === "Kantor";
}

export function isFloorRelevantForProperty(property, selectedGuarantees) {
  return Boolean(selectedGuaranteesForProperty(property, selectedGuarantees).earthquake) && hasEarthquakeFloorExposure(property);
}

export function shouldShowEarthquakeFloorInputForProperty(property, selectedGuarantees) {
  return isFloorRelevantForProperty(property, selectedGuarantees) && !isOfficeFloorCountRequiredForProperty(property);
}

export function calculatePropertyQuote(property, extensionOptions = [], selectedGuarantees, index = 0) {
  const totalValue = calculatePropertyValue(property);
  const hasQuoteBasis = Boolean(property.occupancy) && Boolean(property.constructionClass) && totalValue > 0;
  const baseRate = property.propertyType === "Rumah Tinggal" ? 0.00185 : 0.00265;
  const basePremium = hasQuoteBasis ? Math.max(Math.round(totalValue * baseRate), 150000) : 0;
  const effectiveSelectedGuarantees = selectedGuaranteesForProperty(property, selectedGuarantees);
  const extensionPremium = hasQuoteBasis
    ? extensionOptions.reduce((sum, item) => {
        if (!effectiveSelectedGuarantees[item.key]) return sum;
        return sum + Math.round(totalValue * item.rate);
      }, 0)
    : 0;
  return {
    propertyId: property.id,
    title: propertyLabel(property, index),
    totalValue,
    basePremium,
    extensionPremium,
    totalPremium: basePremium + extensionPremium,
    hasQuoteBasis,
  };
}

export function calculateMultiPropertyPolicy(properties = [], extensionOptions = [], selectedGuarantees) {
  const propertyQuotes = properties.map((property, index) => calculatePropertyQuote(property, extensionOptions, selectedGuarantees, index));
  const hasAnyQuoteBasis = propertyQuotes.some((item) => item.hasQuoteBasis);
  const hasEarthquake = selectedGuarantees ? Boolean(selectedGuarantees.earthquake) : properties.some((property) => property.selectedGuarantees?.earthquake);
  const stampDuty = hasAnyQuoteBasis ? 10000 + (hasEarthquake ? 10000 : 0) : 0;
  const totalValue = propertyQuotes.reduce((sum, item) => sum + item.totalValue, 0);
  const basePremium = propertyQuotes.reduce((sum, item) => sum + item.basePremium, 0);
  const extensionPremium = propertyQuotes.reduce((sum, item) => sum + item.extensionPremium, 0);
  return {
    propertyQuotes,
    totalValue,
    basePremium,
    extensionPremium,
    stampDuty,
    totalPremium: basePremium + extensionPremium + stampDuty,
  };
}

export function getPrimaryCoverageBreakdown(policyTotals = {}) {
  const propertyQuotes = Array.isArray(policyTotals.propertyQuotes) ? policyTotals.propertyQuotes : [];
  return {
    totalPremium: Number(policyTotals.basePremium || 0),
    items: propertyQuotes.map((quote, index) => ({
      propertyId: quote.propertyId,
      title: quote.title || `Properti ${index + 1}`,
      totalValue: Number(quote.totalValue || 0),
      premium: Number(quote.basePremium || 0),
    })),
  };
}

export function isValidPhoneNumber(value) {
  const digits = onlyDigits(value);
  return digits.length >= 10 && digits.length <= 15;
}

export function isValidEmailAddress(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function hasValidObjectRows(property) {
  const rows = property.objectRows || [];
  return rows.length > 0 && rows.every((row) => String(row.type || "").trim() && parseCurrencyValue(row.amount) > 0);
}

function propertyLabel(property, index) {
  const location = String(property.locationSearch || "").trim();
  if (location) return location;
  return property.title || `Properti ${index + 1}`;
}

export function getMultiPropertyStepOnePendingItems({ identity = "", phone = "", email = "", properties = [], selectedGuarantees, constructionInputMode = "direct" } = {}) {
  const items = [];
  if (!String(identity || "").trim()) items.push("Isi nama calon pemegang polis atau pilih CIF.");
  if (!isValidPhoneNumber(phone) || !isValidEmailAddress(email)) items.push("Lengkapi nomor handphone dan alamat email yang valid.");
  if (!properties.length) items.push("Tambahkan minimal satu properti.");
  properties.forEach((property, index) => {
    const label = propertyLabel(property, index);
    if (!property.occupancy) items.push(`${label}: pilih penggunaan properti.`);
    if (!String(property.locationSearch || "").trim()) items.push(`${label}: isi alamat properti.`);
    if (!property.constructionClass) {
      items.push(constructionInputMode === "guided" ? `${label}: lengkapi panduan konstruksi.` : `${label}: pilih kelas konstruksi.`);
    }
    if (!hasValidObjectRows(property)) items.push(`${label}: lengkapi jenis dan nilai objek pertanggungan.`);
    const hasFloorCount = Number(onlyDigits(property.floorCount)) > 0;
    if (isOfficeFloorCountRequiredForProperty(property) && !hasFloorCount) {
      items.push(`${label}: lengkapi jumlah lantai untuk properti kantor.`);
    } else if (isFloorRelevantForProperty(property, selectedGuarantees) && !hasFloorCount) {
      items.push(`${label}: lengkapi jumlah lantai untuk perluasan Gempa Bumi.`);
    }
  });
  return items;
}

export function isValidIdNumber(customerType, value) {
  const digits = onlyDigits(value);
  if (customerType === "Badan Usaha") return digits.length >= 15;
  return digits.length === 16;
}

function hasValidFireProtection(uwForm) {
  const choice = uwForm.fireProtectionChoice || uwForm.fireProtection;
  if (choice === "Tidak Ada") return true;
  if (choice === "Ada") return Array.isArray(uwForm.fireProtectionItems) && uwForm.fireProtectionItems.length > 0;
  return Boolean(choice);
}

function hasStockObject(property) {
  return (property.objectRows || []).some((row) => row.type === "Stok");
}

function hasCompleteUploads(uploads) {
  return Boolean(uploads?.frontView && uploads?.sideRightView && uploads?.sideLeftView);
}

export function getMultiPropertyStepTwoPendingItems({ customerType = "Nasabah Perorangan", idNumber = "", coverageStartDate = "", properties = [] } = {}) {
  const items = [];
  if (!isValidIdNumber(customerType, idNumber)) {
    items.push(customerType === "Badan Usaha" ? "NPWP yang diisi minimal 15 digit." : "NIK yang diisi harus 16 digit.");
  }
  if (!coverageStartDate) items.push("Lengkapi tanggal mulai pertanggungan.");
  properties.forEach((property, index) => {
    const label = propertyLabel(property, index);
    const uwForm = property.uwForm || {};
    if (customerType === "Badan Usaha" && !String(uwForm.picName || "").trim()) items.push(`${label}: lengkapi kontak properti.`);
    if (!hasValidFireProtection(uwForm)) items.push(`${label}: pilih minimal satu proteksi kebakaran.`);
    if (!uwForm.claimHistory) items.push(`${label}: lengkapi riwayat klaim.`);
    if (hasStockObject(property) && !String(uwForm.stockType || "").trim()) items.push(`${label}: pilih jenis stok.`);
    if (!hasCompleteUploads(property.uploads)) items.push(`${label}: unggah foto tampak depan, samping kanan, dan samping kiri.`);
  });
  return items;
}
