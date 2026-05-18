import { getEffectiveOperatingStatus } from "./operatingLayer.js";

const INTERNAL_STATUS_GROUPS = {
  needAction: new Set(["Pending Review Internal", "Perlu Revisi", "Isi Data Lanjutan"]),
  reviewOnly: new Set(["Pending Review Internal"]),
  ready: new Set(["Siap Bayar", "Pending Payment", "Paid"]),
  closed: new Set(["Paid", "Rejected"]),
};

function getInternalEffectiveStatus(record, now = new Date()) {
  return getEffectiveOperatingStatus(record, now);
}

export function getInternalPortalMenus() {
  return [
    { key: "dashboard", label: "Dashboard" },
    { key: "tasks", label: "Task List" },
    { key: "claims", label: "Review Queue" },
    { key: "policies", label: "Semua Transaksi" },
    { key: "settings", label: "Partner Config" },
  ];
}

export function buildInternalWorkspaceSummary(records, now = new Date()) {
  const allRecords = Array.isArray(records) ? records : [];
  const effectiveStatuses = allRecords.map((record) => getInternalEffectiveStatus(record, now));
  return {
    total: allRecords.length,
    needAction: effectiveStatuses.filter((status) => INTERNAL_STATUS_GROUPS.needAction.has(status)).length,
    reviewCount: effectiveStatuses.filter((status) => INTERNAL_STATUS_GROUPS.reviewOnly.has(status)).length,
    readyCount: effectiveStatuses.filter((status) => INTERNAL_STATUS_GROUPS.ready.has(status)).length,
  };
}

export function getTaskListRecords(records, now = new Date()) {
  return (Array.isArray(records) ? records : []).filter(
    (item) => !INTERNAL_STATUS_GROUPS.closed.has(getInternalEffectiveStatus(item, now))
  );
}
