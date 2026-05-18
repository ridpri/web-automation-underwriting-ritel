const MANDATORY_PROPERTY_CLAUSES = [
  {
    key: "spau-definition",
    title: "Klausul Definisi Surat Permohonan Asuransi Umum (SPAU)",
    english: "General Insurance Application Form (SPAU) Definition Clause",
    badge: "Wajib",
  },
  {
    key: "communicable-disease",
    title: "Klausul Endorsemen Penyakit Menular (LMA 5393)",
    badge: "Wajib",
  },
  {
    key: "electronic-policy",
    title: "Klausul Polis Elektronik",
    badge: "Wajib",
  },
];

const CONDITIONAL_PROPERTY_CLAUSES = [
  {
    key: "stock-administration",
    title: "Klausul Administrasi Barang Dagangan & Risiko Sendiri",
    badge: "Jika terdapat stok",
    includeWhen: ({ stockAmount }) => stockAmount > 0,
  },
  {
    key: "warehouse-management",
    title: "Klausul Kewajiban Tertanggung Terkait Kepemilikan dan Pengelolaan Gudang",
    badge: "Jika okupasi warehouse",
    includeWhen: ({ occupancy }) => isWarehouseOccupancy(occupancy),
  },
];

const MANDATORY_PROPERTY_WARRANTIES = [
  {
    key: "occupied-property",
    title: "Objek pertanggungan tidak boleh dibiarkan kosong, tidak aktif, atau tidak diawasi selama masa pertanggungan. Bangunan/aset harus tetap digunakan dan tidak dalam kondisi terbengkalai.",
    badge: "Wajib",
  },
  {
    key: "no-claim-history",
    title: "Tidak ada riwayat klaim (kerugian/kerusakan yang sudah pernah diajukan ke asuransi) dalam 3 tahun terakhir atas objek pertanggungan yang sama.",
    badge: "Wajib",
  },
  {
    key: "premises-cleanliness",
    title: "Tertanggung wajib menjaga kebersihan area di premises selama masa periode Pertanggungan.",
    badge: "Wajib",
  },
];

function parseAmount(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  return Number(String(value || "").split(".").join("").replace(/,/g, "") || "0");
}

function isWarehouseOccupancy(occupancy) {
  const normalized = String(occupancy || "").trim().toLowerCase();
  return normalized === "warehouse" || normalized.includes("warehouse") || normalized.includes("gudang");
}

function toDisplayClause(item) {
  const displayClause = {
    key: item.key,
    title: item.title,
    badge: item.badge,
  };
  if (item.english) displayClause.english = item.english;
  return displayClause;
}

export function buildPropertyTerms({ stockAmount = 0, occupancy = "" } = {}) {
  const context = {
    stockAmount: parseAmount(stockAmount),
    occupancy,
  };
  const conditionalClauses = CONDITIONAL_PROPERTY_CLAUSES.filter((item) => item.includeWhen(context)).map(toDisplayClause);
  const clauses = [conditionalClauses.find((item) => item.key === "stock-administration"), ...MANDATORY_PROPERTY_CLAUSES, conditionalClauses.find((item) => item.key === "warehouse-management")].filter(Boolean);

  return {
    heading: "Syarat dan Ketentuan Lainnya",
    clauses,
    warranties: MANDATORY_PROPERTY_WARRANTIES,
  };
}
