const FIRE_MANDATORY_PROPERTY_CLAUSES = [
  {
    key: "spau-definition",
    title: "Klausul Definisi Surat Permohonan Asuransi Umum (SPAU)",
  },
  {
    key: "communicable-disease",
    title: "Klausul Endorsemen Penyakit Menular (LMA 5393)",
  },
  {
    key: "electronic-policy",
    title: "Klausul Polis Elektronik",
  },
];

const FIRE_CONDITIONAL_PROPERTY_CLAUSES = [
  {
    key: "flood-endorsement",
    title: "Endorsemen Banjir, Angin Topan, Badai dan Kerusakan Akibat Air (Kode: 4.3 A)",
    includeWhen: ({ selectedGuarantees }) => hasFloodOrTsfwd(selectedGuarantees),
  },
  {
    key: "rsmd-endorsement",
    title: "Endorsemen Kerusuhan, Pemogokan, dan Perbuatan Jahat (Kode: 4.1A/2007)",
    includeWhen: ({ selectedGuarantees }) => Boolean(selectedGuarantees.rsmd),
  },
  {
    key: "rsmdcc-endorsement",
    title: "Endorsemen Kerusuhan, Pemogokan, Perbuatan Jahat, dan Huru-Hara (Kode: 4.1B/2007)",
    includeWhen: ({ selectedGuarantees }) => Boolean(selectedGuarantees.rsmdcc || selectedGuarantees.riot),
  },
  {
    key: "stock-administration",
    title: "Klausul Administrasi Barang Dagangan & Risiko Sendiri",
    includeWhen: ({ stockAmount }) => stockAmount > 0,
  },
  {
    key: "warehouse-management",
    title: "Klausul Kewajiban Tertanggung Terkait Kepemilikan dan Pengelolaan Gudang",
    includeWhen: ({ occupancyCode }) => isWarehouseOccupancyCode(occupancyCode),
  },
];

const FIRE_MANDATORY_PROPERTY_WARRANTIES = [
  {
    key: "occupied-property",
    title: "Objek pertanggungan tidak boleh dibiarkan kosong, tidak aktif, atau tidak diawasi selama masa pertanggungan. Bangunan/aset harus tetap digunakan dan tidak dalam kondisi terbengkalai.",
  },
  {
    key: "no-claim-history",
    title: "Tidak ada riwayat klaim (kerugian/kerusakan yang sudah pernah diajukan ke asuransi) dalam 3 tahun terakhir atas objek pertanggungan yang sama.",
  },
  {
    key: "premises-cleanliness",
    title: "Tertanggung wajib menjaga kebersihan area di premises selama masa periode Pertanggungan.",
  },
];

const FIRE_CONDITIONAL_PROPERTY_WARRANTIES = [
  {
    key: "flood-location",
    title: "Lokasi objek pertanggungan tidak berada di daerah yang rawan atau sering terkena banjir.",
    includeWhen: ({ selectedGuarantees }) => hasFloodOrTsfwd(selectedGuarantees),
  },
];

const GENERIC_PROPERTY_CLAUSES = FIRE_MANDATORY_PROPERTY_CLAUSES;
const GENERIC_PROPERTY_WARRANTIES = FIRE_MANDATORY_PROPERTY_WARRANTIES;

function parseAmount(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  return Number(String(value || "").split(".").join("").replace(/,/g, "") || "0");
}

function isWarehouseOccupancyCode(occupancyCode) {
  return ["2937", "29371"].includes(String(occupancyCode || "").trim());
}

function hasFloodOrTsfwd(selectedGuarantees = {}) {
  return Boolean(selectedGuarantees.flood || selectedGuarantees.tsfwd);
}

function toDisplayClause(item) {
  const displayClause = {
    key: item.key,
    title: item.title,
  };
  if (item.english) displayClause.english = item.english;
  return displayClause;
}

function buildFirePropertyTerms(context) {
  const conditionalClauses = FIRE_CONDITIONAL_PROPERTY_CLAUSES.filter((item) => item.includeWhen(context)).map(toDisplayClause);
  const conditionalWarranties = FIRE_CONDITIONAL_PROPERTY_WARRANTIES.filter((item) => item.includeWhen(context)).map(toDisplayClause);
  const findClause = (key) => conditionalClauses.find((item) => item.key === key);

  return {
    heading: "Syarat dan Ketentuan Lainnya",
    clauses: [
      findClause("flood-endorsement"),
      findClause("rsmd-endorsement"),
      findClause("rsmdcc-endorsement"),
      findClause("stock-administration"),
      ...FIRE_MANDATORY_PROPERTY_CLAUSES,
      findClause("warehouse-management"),
    ].filter(Boolean),
    warranties: [...conditionalWarranties, ...FIRE_MANDATORY_PROPERTY_WARRANTIES],
  };
}

function buildGenericPropertyTerms() {
  return {
    heading: "Syarat dan Ketentuan Lainnya",
    clauses: GENERIC_PROPERTY_CLAUSES,
    warranties: GENERIC_PROPERTY_WARRANTIES,
  };
}

export function buildPropertyTerms({ productKey = "property-safe", stockAmount = 0, occupancyCode = "", selectedGuarantees = {} } = {}) {
  const context = {
    productKey,
    stockAmount: parseAmount(stockAmount),
    occupancyCode,
    selectedGuarantees,
  };

  if (productKey === "property-safe") return buildFirePropertyTerms(context);
  return buildGenericPropertyTerms(context);
}
