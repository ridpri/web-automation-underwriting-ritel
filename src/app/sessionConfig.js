export const SESSION_OPTIONS = [
  { key: "internal", label: "Internal" },
  { key: "external", label: "Eksternal" },
  { key: "partner", label: "Partner" },
  { key: "guest", label: "Tanpa Login" },
];

export function resolveSessionName(sessionRole) {
  if (sessionRole === "internal") return "Taqwim (Internal)";
  if (sessionRole === "external") return "Dita (External)";
  if (sessionRole === "partner") return "Irwan (Partner)";
  return "Tamu (Tanpa Login)";
}

export function resolveSessionDescription(sessionRole) {
  if (sessionRole === "internal") return "Akses internal untuk review underwriting, antrean kerja, dan assisted journey.";
  if (sessionRole === "external") return "Akses nasabah untuk simulasi premi, melihat polis, dan layanan mandiri.";
  if (sessionRole === "partner") return "Akses partner untuk distribusi produk, konfigurasi channel, dan pemantauan transaksi.";
  return "Akses tamu untuk simulasi tanpa login dan pencarian polis atau klaim.";
}
