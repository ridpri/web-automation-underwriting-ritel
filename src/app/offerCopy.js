export function getSharedOfferSummarySubtitle(policyDocumentName = "ketentuan polis", offerStage = "indicative") {
  const policyName = String(policyDocumentName || "").trim() || "ketentuan polis";
  if (offerStage === "final") {
    return `Ringkasan ini disiapkan dari data penawaran dan SPAU elektronik yang telah dilengkapi oleh petugas asuransi untuk ditinjau dan disetujui calon pemegang polis sebelum pembayaran, serta mengacu pada ${policyName}.`;
  }
  return `Ringkasan ini disiapkan dari data awal penawaran yang dikirim oleh petugas asuransi untuk ditinjau calon pemegang polis, serta mengacu pada ${policyName}. Data SPAU elektronik akan dilengkapi pada langkah Data Lanjutan.`;
}
