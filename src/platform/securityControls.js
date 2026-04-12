function toSlug(value) {
  return String(value || "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase();
}

function simpleHash(value) {
  const source = String(value || "");
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash << 5) - hash + source.charCodeAt(index);
    hash |= 0;
  }
  return `H${Math.abs(hash).toString(16).toUpperCase().padStart(8, "0")}`;
}

function parseRevisionNumber(versionLabel) {
  const match = String(versionLabel || "").match(/(\d+)/);
  return match ? Number(match[1]) : 1;
}

function formatIdDate(date = new Date()) {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

function guessDeviceLabel() {
  if (typeof navigator === "undefined") return "Browser Prototype";
  return navigator.userAgent.includes("Mobile") ? "Mobile Browser Prototype" : "Desktop Browser Prototype";
}

function cityFromText(value) {
  const text = String(value || "").toLowerCase();
  if (text.includes("jakarta")) return "jakarta";
  if (text.includes("bandung")) return "bandung";
  if (text.includes("surabaya")) return "surabaya";
  if (text.includes("bekasi")) return "bekasi";
  if (text.includes("bogor")) return "bogor";
  return "";
}

function defaultGpsForCity(city) {
  if (city === "bandung") return { lat: -6.9175, lng: 107.6191, area: "Bandung" };
  if (city === "surabaya") return { lat: -7.2575, lng: 112.7521, area: "Surabaya" };
  if (city === "bekasi") return { lat: -6.2383, lng: 106.9756, area: "Bekasi" };
  if (city === "bogor") return { lat: -6.595, lng: 106.8166, area: "Bogor" };
  return { lat: -6.2088, lng: 106.8456, area: "Jakarta" };
}

function duplicateHeuristic(value) {
  const source = String(value || "").replace(/\D/g, "");
  if (!source) return false;
  return /(\d)\1{5,}/.test(source) || /^1234/.test(source);
}

export function createEmptyDocumentCheck(docType) {
  return {
    docType,
    status: "idle",
    confidence: null,
    mismatchFields: [],
    duplicate: false,
    requiresVerification: false,
    requiresReview: false,
    manualReviewReason: "",
    extractedAt: "",
    extractedData: {},
  };
}

export function evaluateDocumentRead({ docType, extractedData = {}, expectedData = {} }) {
  const mismatchFields = Object.entries(expectedData)
    .filter(([, value]) => String(value || "").trim())
    .filter(([key, value]) => String(extractedData[key] || "").trim() && String(extractedData[key] || "").trim() !== String(value || "").trim())
    .map(([key]) => key);

  const duplicate = Object.values(extractedData).some((value) => duplicateHeuristic(value));
  const confidenceBase = docType === "KTP" ? 0.94 : 0.92;
  const confidence = Math.max(0.61, Number((confidenceBase - mismatchFields.length * 0.07 - (duplicate ? 0.08 : 0)).toFixed(2)));
  const requiresReview = mismatchFields.length > 0 || duplicate;
  const requiresVerification = true;
  let manualReviewReason = "";

  if (mismatchFields.length > 0) {
    manualReviewReason = `${docType} perlu verifikasi karena ada data yang tidak cocok.`;
  } else if (duplicate) {
    manualReviewReason = `${docType} perlu verifikasi karena terindikasi duplikasi.`;
  } else if (confidence < 0.9) {
    manualReviewReason = `${docType} perlu verifikasi karena confidence OCR belum kuat.`;
  }

  return {
    docType,
    status: "read",
    confidence,
    mismatchFields,
    duplicate,
    requiresVerification,
    requiresReview,
    manualReviewReason,
    extractedAt: new Date().toISOString(),
    extractedData,
  };
}

export function createPhotoEvidence({ label, declaredAddress = "", source = "camera" }) {
  const city = cityFromText(declaredAddress);
  const gps = defaultGpsForCity(city);
  return {
    label,
    source,
    capturedAt: new Date().toISOString(),
    device: guessDeviceLabel(),
    gps,
    photoHash: simpleHash(`${label}|${declaredAddress}|${source}|${Date.now()}`),
    geoMismatch: false,
    manualReviewReason: "",
  };
}

export function createLocationEvidence({ declaredAddress = "", source = "gps" }) {
  const declaredCity = cityFromText(declaredAddress);
  const gps = defaultGpsForCity(source === "map" ? declaredCity || "jakarta" : declaredCity);
  const geoMismatch = Boolean(declaredCity) && declaredCity !== cityFromText(gps.area);
  return {
    capturedAt: new Date().toISOString(),
    device: guessDeviceLabel(),
    source,
    gps,
    geoMismatch,
    manualReviewReason: geoMismatch ? "Lokasi GPS tidak sejalan dengan alamat obyek." : "",
  };
}

export function createTransactionAuthority({
  productCode,
  primaryValue,
  versionLabel = "Rev 1",
  preparedBy = "System",
  transactionId,
  validUntil,
}) {
  const issuedAt = new Date();
  const baseId = transactionId || `TRX-${productCode}-${formatIdDate(issuedAt)}-${toSlug(primaryValue || "DRAFT").slice(0, 8).padEnd(8, "0")}`;
  const revision = parseRevisionNumber(versionLabel);
  const offerId = `OFR-${productCode}-${formatIdDate(issuedAt)}-${String(revision).padStart(2, "0")}`;
  const versionId = `${baseId}-REV-${String(revision).padStart(2, "0")}`;
  const signedToken = `SIG-${simpleHash(`${baseId}|${offerId}|${versionId}|${preparedBy}|${validUntil || ""}`)}`;

  return {
    transactionId: baseId,
    offerId,
    versionId,
    signedToken,
    preparedBy,
    issuedAt: issuedAt.toISOString(),
  };
}

export function summarizeFraudSignals({ documentChecks = [], evidenceChecks = [] }) {
  const alerts = [];

  documentChecks.forEach((check) => {
    if (!check) return;
    if (check.requiresReview && check.manualReviewReason) alerts.push(check.manualReviewReason);
    else if (check.requiresVerification) alerts.push(`${check.docType} sudah dibaca dan masih perlu verifikasi singkat.`);
  });

  evidenceChecks.forEach((item) => {
    if (!item) return;
    if (item.geoMismatch && item.manualReviewReason) alerts.push(item.manualReviewReason);
  });

  return Array.from(new Set(alerts));
}
