export function cls(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID").format(Number(value || 0));
}

export function getInitials(name) {
  return String(name || "AY")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0])
    .join("")
    .toUpperCase();
}

export function policyCategory(policy) {
  const text = `${policy.category || ""} ${policy.product || ""}`.toLowerCase();
  if (text.includes("mobil") || text.includes("kendaraan")) return "mobil";
  if (text.includes("motor") || text.includes("sepeda")) return "motor";
  if (text.includes("pribadi") || text.includes("keluarga") || text.includes("accident") || text.includes("kecelakaan")) return "personal";
  if (text.includes("rumah") || text.includes("hunian")) return "properti";
  return "lainnya";
}

export function statusClass(tone = "default") {
  const tones = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    danger: "border-rose-200 bg-rose-50 text-rose-700",
    default: "border-[#D9E1EA] bg-[#F6F8FA] text-[#5F7A99]",
  };
  return tones[tone] || tones.default;
}

export function findPolicy(policies, policyId) {
  return policies.find((policy) => policy.id === policyId) || policies[0] || {};
}
