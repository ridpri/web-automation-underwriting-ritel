export const OPERATING_STATUSES = [
  "Draft",
  "Indikasi Terkirim",
  "Dibuka Calon Tertanggung",
  "Isi Data Lanjutan",
  "Pending Review Internal",
  "Perlu Revisi",
  "Siap Bayar",
  "Pending Payment",
  "Paid",
  "Expired",
  "Rejected",
];

export const REVIEW_REASON_OPTIONS = [
  "Foto obyek kurang jelas",
  "Data identitas perlu verifikasi",
  "Harga pertanggungan mendekati limit",
  "Perlu review underwriting",
  "Perlu revisi data tertanggung",
  "Perlu revisi data obyek",
  "Menunggu dokumen tambahan",
];

export const OPERATING_QUEUE_SEED = [
  {
    id: "TRX-PRO-2026-001",
    journeyKey: "property-internal",
    product: "Asuransi Properti - Kebakaran",
    channel: "Internal Assisted",
    customer: "Taqwim (Internal)",
    owner: "Taqwim (Internal)",
    version: "Rev 2",
    status: "Pending Review Internal",
    statusTone: "amber",
    reason: "Foto obyek kurang jelas",
    sla: "2 jam",
    lastActivity: "10 Apr 2026, 15:20",
    validUntil: "14 Apr 2026, 23:59",
    flags: ["Foto obyek kurang jelas", "Perlu validasi ulang detail obyek"],
    notes:
      "Calon tertanggung sudah mengisi data lanjutan. Review difokuskan pada kualitas foto obyek dan kecukupan data underwriting.",
    timeline: [
      { at: "10 Apr 2026, 09:10", actor: "Taqwim (Internal)", text: "Draft dibuat." },
      { at: "10 Apr 2026, 09:40", actor: "Taqwim (Internal)", text: "Indikasi Rev 1 dikirim." },
      { at: "10 Apr 2026, 14:15", actor: "Calon tertanggung", text: "Link penawaran dibuka dan data lanjutan diisi." },
      { at: "10 Apr 2026, 15:20", actor: "System", text: "Masuk pending review internal: foto obyek kurang jelas." },
    ],
  },
  {
    id: "TRX-PRO-2026-004",
    journeyKey: "property-internal",
    product: "Asuransi Properti - Kebakaran",
    channel: "Internal Assisted",
    customer: "PT Sentra Prima",
    owner: "Taqwim (Internal)",
    version: "Rev 1",
    status: "Perlu Revisi",
    statusTone: "amber",
    reason: "Perlu revisi data obyek",
    sla: "4 jam",
    lastActivity: "11 Apr 2026, 11:05",
    validUntil: "15 Apr 2026, 23:59",
    flags: ["Nilai pertanggungan berubah setelah indikasi", "Alamat obyek perlu dikonfirmasi"],
    notes:
      "Versi aktif perlu diperbarui karena ada perubahan material pada rincian obyek setelah indikasi awal dikirim.",
    timeline: [
      { at: "11 Apr 2026, 08:40", actor: "Taqwim (Internal)", text: "Indikasi Rev 1 dikirim." },
      { at: "11 Apr 2026, 10:15", actor: "Calon tertanggung", text: "Mengajukan perubahan pada nilai obyek dan alamat lokasi." },
      { at: "11 Apr 2026, 11:05", actor: "System", text: "Transaksi ditandai perlu revisi karena perubahan material setelah indikasi." },
    ],
  },
  {
    id: "TRX-PAR-2026-003",
    journeyKey: "property-all-risk-internal",
    product: "Asuransi Properti All Risk",
    channel: "Internal Assisted",
    customer: "PT Arunika Properti",
    owner: "Taqwim (Internal)",
    version: "Rev 1",
    status: "Pending Review Internal",
    statusTone: "amber",
    reason: "Perlu review underwriting",
    sla: "3 jam",
    lastActivity: "11 Apr 2026, 13:40",
    validUntil: "16 Apr 2026, 23:59",
    flags: ["Butuh verifikasi detail material damage", "Perlu konfirmasi perluasan yang dipilih"],
    notes:
      "Pengajuan Asuransi Properti All Risk menunggu tinjauan internal untuk memastikan rincian objek dan perluasan masih selaras dengan kebutuhan proteksi properti.",
    timeline: [
      { at: "11 Apr 2026, 09:05", actor: "Taqwim (Internal)", text: "Draft Asuransi Properti All Risk dibuat." },
      { at: "11 Apr 2026, 10:10", actor: "Taqwim (Internal)", text: "Indikasi Rev 1 dikirim." },
      { at: "11 Apr 2026, 13:10", actor: "Calon tertanggung", text: "Data lanjutan dan pilihan perluasan diperbarui." },
      { at: "11 Apr 2026, 13:40", actor: "System", text: "Masuk pending review internal untuk validasi Asuransi Properti All Risk." },
    ],
  },
  {
    id: "TRX-MTR-2026-014",
    journeyKey: "motor-internal",
    product: "Asuransi Motor TLO",
    channel: "Internal Assisted",
    customer: "Rizki Maulana",
    owner: "Taqwim (Internal)",
    version: "Rev 1",
    status: "Isi Data Lanjutan",
    statusTone: "blue",
    reason: "Menunggu dokumen tambahan",
    sla: "Hari ini",
    lastActivity: "11 Apr 2026, 08:45",
    validUntil: "15 Apr 2026, 23:59",
    flags: ["KTP sudah terbaca", "STNK masih menunggu upload"],
    notes:
      "KTP sudah terbaca. STNK dan foto obyek masih menunggu dilengkapi sebelum penawaran lanjutan dikirim.",
    timeline: [
      { at: "11 Apr 2026, 08:20", actor: "Taqwim (Internal)", text: "Draft simulasi dibuat." },
      { at: "11 Apr 2026, 08:30", actor: "Taqwim (Internal)", text: "Indikasi Rev 1 dikirim." },
      { at: "11 Apr 2026, 08:45", actor: "Calon tertanggung", text: "Mulai mengisi data lanjutan." },
    ],
  },
  {
    id: "TRX-CAR-2026-006",
    journeyKey: "car-tlo-internal",
    product: "Asuransi Mobil TLO",
    channel: "Internal Assisted",
    customer: "PT Cakra Sentosa",
    owner: "Taqwim (Internal)",
    version: "Rev 3",
    status: "Siap Bayar",
    statusTone: "green",
    reason: "",
    sla: "Selesai",
    lastActivity: "11 Apr 2026, 09:30",
    validUntil: "16 Apr 2026, 23:59",
    flags: ["Foto obyek lengkap", "Data kendaraan lolos validasi internal"],
    notes:
      "Review internal selesai. Penawaran final sudah aktif dan siap dilanjutkan ke pembayaran oleh calon tertanggung.",
    timeline: [
      { at: "10 Apr 2026, 11:00", actor: "Taqwim (Internal)", text: "Indikasi Rev 1 dikirim." },
      { at: "10 Apr 2026, 16:25", actor: "Calon tertanggung", text: "Data lanjutan dan foto obyek dilengkapi." },
      { at: "11 Apr 2026, 09:30", actor: "Underwriter", text: "Review disetujui. Rev 3 dinyatakan siap bayar." },
    ],
  },
  {
    id: "TRX-CMP-2026-002",
    journeyKey: "car-comp-internal",
    product: "Asuransi Mobil Comprehensive",
    channel: "Internal Assisted",
    customer: "Budi Santoso",
    owner: "Taqwim (Internal)",
    version: "Rev 1",
    status: "Draft",
    statusTone: "slate",
    reason: "",
    sla: "Baru dibuat",
    lastActivity: "11 Apr 2026, 10:10",
    validUntil: "16 Apr 2026, 23:59",
    flags: ["Menunggu pengecekan batas usia kendaraan", "Perlu verifikasi kategori kendaraan"],
    notes:
      "Draft awal untuk jalur internal comprehensive. Belum ada indikasi yang dibagikan ke calon tertanggung.",
    timeline: [{ at: "11 Apr 2026, 10:10", actor: "Taqwim (Internal)", text: "Draft dibuat." }],
  },
];

export function buildTimelineEvent(text, actor = "System") {
  const now = new Date();
  const at = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);

  return { at, actor, text };
}

export function statusTone(status) {
  if (status === "Pending Review Internal" || status === "Perlu Revisi") return "amber";
  if (status === "Siap Bayar" || status === "Paid") return "green";
  if (status === "Rejected" || status === "Expired") return "red";
  if (status === "Indikasi Terkirim" || status === "Dibuka Calon Tertanggung" || status === "Isi Data Lanjutan") return "blue";
  return "slate";
}

export function canProceedToPaymentFromOperating(record) {
  if (!record) return true;
  return ["Siap Bayar", "Pending Payment", "Paid"].includes(record.status);
}

export function paymentBlockMessage(record) {
  if (!record) return "";
  if (record.status === "Pending Review Internal") return "Transaksi ini masih dalam review internal dan belum dapat dilanjutkan ke pembayaran.";
  if (record.status === "Perlu Revisi") return "Transaksi ini masih perlu revisi sebelum dapat dilanjutkan ke pembayaran.";
  if (record.status === "Rejected") return "Transaksi ini telah ditolak dan tidak dapat dilanjutkan ke pembayaran.";
  if (record.status === "Expired") return "Versi transaksi ini sudah expired. Buat versi penawaran terbaru sebelum melanjutkan pembayaran.";
  if (record.status === "Draft" || record.status === "Indikasi Terkirim" || record.status === "Dibuka Calon Tertanggung" || record.status === "Isi Data Lanjutan") {
    return "Transaksi ini belum siap bayar. Lengkapi atau review dahulu sebelum melanjutkan.";
  }
  return "";
}
