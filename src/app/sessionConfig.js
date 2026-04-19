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
  if (sessionRole === "external") return "Akses nasabah untuk meninjau penawaran, melengkapi data lanjutan, melihat polis, dan layanan mandiri.";
  if (sessionRole === "partner") return "Akses partner untuk distribusi produk, konfigurasi channel, dan pemantauan transaksi.";
  return "Akses tamu untuk melihat penawaran awal tanpa login dan pencarian polis atau klaim.";
}

export function resolveSessionProfile(sessionRole) {
  if (sessionRole === "external") {
    return {
      authenticated: true,
      name: "Dita",
      customerType: "Nasabah Perorangan",
      identityNumber: "3173010101010001",
      insuredAddress: "Jl. Pahlawan No. 18, Palmerah, Jakarta Barat",
      phone: "081298765432",
      email: "dita.external@email.com",
    };
  }

  if (sessionRole === "internal") {
    return {
      authenticated: true,
      name: "Taqwim",
      customerType: "Nasabah Perorangan",
      phone: "081277700011",
      email: "taqwim.internal@email.com",
    };
  }

  if (sessionRole === "partner") {
    return {
      authenticated: true,
      name: "Irwan",
      customerType: "Badan Usaha",
      phone: "02150990088",
      email: "irwan.partner@email.com",
    };
  }

  return {
    authenticated: false,
    name: "",
    customerType: "",
    phone: "",
    email: "",
  };
}
