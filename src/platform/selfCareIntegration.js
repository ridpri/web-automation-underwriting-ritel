const DEFAULT_PORTAL_CONTACTS = [
  { label: "Contact Center", value: "1500-073", helper: "24 jam", href: "tel:1500073", icon: "phone" },
  { label: "Layanan pelanggan", value: "care@jasindo.co.id", helper: "Email resmi", href: "mailto:care@jasindo.co.id", icon: "mail" },
  { label: "Telepon kantor", value: "(021) 3924737", helper: "Graha Jasindo", href: "tel:+62213924737", icon: "headphones" },
];

export const SELF_CARE_ROUTES = {
  root: "/portal",
  policies: "/portal/policies",
  claims: "/portal/claims",
  help: "/portal/help",
  policyDetail: (policyId) => `/portal/policies/${policyId}`,
  claimDetail: (claimId) => `/portal/claims/${claimId}`,
  purchaseSuccess: (policyId) => `/portal/policies/${policyId}?entry=issued`,
};

function toIdrLabel(value) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(Number(value || 0))}`;
}

function toPortalTone(status) {
  const normalized = String(status || "").toLowerCase();
  if (/(aktif|paid|lunas|success|selesai)/.test(normalized)) return "success";
  if (/(kurang|gagal|expired|rejected|ditolak)/.test(normalized)) return "danger";
  if (/(pending|review|survei|menunggu|proses|perlu)/.test(normalized)) return "warning";
  return "default";
}

function createPolicyCategory(policy) {
  return policy.category || policy.segment || policy.productType || "Perlindungan";
}

export function mapIssuedPolicyToPortalPolicy(policy) {
  return {
    id: policy.id,
    category: createPolicyCategory(policy),
    product: policy.productName || policy.product || "Produk Asuransi",
    objectName: policy.objectName || policy.insuredObject || policy.summary || "Objek pertanggungan",
    policyNumber: policy.policyNumber || policy.number || "-",
    insuredValue: Number(policy.insuredValue || policy.sumInsured || 0),
    annualPremium: Number(policy.annualPremium || policy.totalPremium || 0),
    paymentStatus: policy.paymentStatus || (policy.paid ? "Lunas" : "Menunggu pembayaran"),
    status: policy.status || "Aktif",
    tone: policy.tone || toPortalTone(policy.status || policy.paymentStatus),
    periodStart: policy.periodStart || policy.coverageStart || "-",
    periodEnd: policy.periodEnd || policy.coverageEnd || "-",
    benefits: policy.benefits || [],
    claimChecklist: policy.claimChecklist || [],
    documents: policy.documents || [],
  };
}

export function mapClaimToPortalClaim(claim) {
  return {
    id: claim.id,
    policyId: claim.policyId,
    title: claim.title || claim.lossType || "Klaim",
    lossDate: claim.lossDate || claim.incidentDate || "-",
    reportedDate: claim.reportedDate || claim.createdAt || "-",
    status: claim.status || "Laporan diterima",
    tone: claim.tone || toPortalTone(claim.status),
    stage: Number(claim.stage || 1),
    amount: claim.amountLabel || toIdrLabel(claim.amount),
    nextAction: claim.nextAction || "Pantau tindak lanjut pada klaim ini.",
    dueLabel: claim.dueLabel || "Menunggu update berikutnya",
    assignedTo: claim.assignedTo || "Tim klaim Jasindo",
    nextUpdate: claim.nextUpdate || "Update berikutnya ditampilkan di portal.",
    requiredDocs: claim.requiredDocs || [],
    history: claim.history || [],
    canUpload: Boolean(claim.canUpload),
    settled: Boolean(claim.settled),
  };
}

export function mapInvoiceToPortalBilling(invoice) {
  return {
    id: invoice.id,
    policyId: invoice.policyId,
    title: invoice.title || invoice.description || "Tagihan polis",
    dueDate: invoice.dueDate || "-",
    amount: Number(invoice.amount || 0),
    status: invoice.status || "Perlu dibayar",
    tone: invoice.tone || toPortalTone(invoice.status),
    method: invoice.method || invoice.paymentMethod || "-",
    helper: invoice.helper || "Tindak lanjuti sebelum jatuh tempo.",
  };
}

export function buildSelfCarePortalModel({
  customer,
  policies = [],
  claims = [],
  invoices = [],
  contacts = DEFAULT_PORTAL_CONTACTS,
  defaultTab = "policies",
} = {}) {
  return {
    sessionName: customer?.displayName || customer?.name || "Dita (External)",
    policies: policies.map(mapIssuedPolicyToPortalPolicy),
    claims: claims.map(mapClaimToPortalClaim),
    billingItems: invoices.map(mapInvoiceToPortalBilling),
    contacts,
    defaultTab,
  };
}

export function buildPostPurchaseNavigation({ policyId, hasOutstandingClaim = false } = {}) {
  if (hasOutstandingClaim) return SELF_CARE_ROUTES.claims;
  if (policyId) return SELF_CARE_ROUTES.purchaseSuccess(policyId);
  return SELF_CARE_ROUTES.policies;
}
