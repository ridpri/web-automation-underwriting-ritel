export const PROPERTY_PRODUCT_VARIANTS = {
  "property-safe": {
    key: "property-safe",
    title: "Asuransi Kebakaran",
    heroSubtitle: "Perlindungan untuk bangunan dan isi properti terhadap risiko kebakaran, dengan tambahan perlindungan yang bisa dipilih sesuai kebutuhan.",
    catalogSubtitle: "Perlindungan untuk bangunan dan isi properti dari risiko kebakaran.",
    catalogDescription: "Perlindungan untuk bangunan, inventaris, dan isi properti dari risiko kebakaran, dengan tambahan perlindungan opsional.",
    catalogImage: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80",
    productCode: "PSF",
    primaryCoverageTitle: "Jaminan Kebakaran",
    primaryCoveragePremiumLabel: "Premi",
    primaryCoverageDescription:
      "Menjamin kerusakan atau kerugian yang secara langsung disebabkan oleh kebakaran, petir, ledakan, kejatuhan pesawat terbang, dan asap sesuai Polis Standar Asuransi Kebakaran Indonesia.",
    primaryCoverageDeductibleClassOne: "Tidak dikenakan risiko sendiri.",
    primaryCoverageDeductibleOther:
      "5% dari nilai kerugian yang disetujui atau 0,1% dari total nilai yang dilindungi untuk setiap risiko dan setiap lokasi, mana yang lebih besar.",
    insuredRisksSectionTitle: "Jaminan Utama",
    exclusionsSectionTitle: "",
    exclusionsSectionSubtitle: "",
    importantExclusions: [],
    benefitsSummaryIntro:
      "Perlindungan utama mencakup kerusakan akibat kebakaran sesuai jenis bangunan dan nilai yang ingin Anda lindungi.",
    summaryCoverageLine: "Tambahan perlindungan yang tersedia dapat dipilih untuk melengkapi proteksi dari risiko kebakaran.",
    optionalExtensionsLabel: "Tambahan perlindungan yang tersedia",
    shareSubject: "Penawaran Asuransi Kebakaran",
    shareLabel: "Asuransi Kebakaran",
    paymentSuccessMessage: "Pembayaran Asuransi Kebakaran berhasil disimulasikan.",
    policyDocumentName: "Polis Standar Asuransi Kebakaran Indonesia",
    activeExtensions: ["riot", "flood", "earthquake"],
  },
  "property-all-risk": {
    key: "property-all-risk",
    title: "Asuransi Property All Risk",
    heroSubtitle: "Perlindungan untuk bangunan dan isi properti dengan jaminan Property All Risk, dengan tambahan perlindungan yang bisa dipilih sesuai kebutuhan.",
    catalogSubtitle: "Perlindungan untuk bangunan dan isi properti dengan jaminan Property All Risk.",
    catalogDescription: "Perlindungan untuk bangunan, inventaris, dan isi properti dengan jaminan Property All Risk, dengan tambahan perlindungan opsional.",
    catalogImage: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
    productCode: "PAR",
    primaryCoverageTitle: "Jaminan Property All Risk",
    primaryCoveragePremiumLabel: "Premi",
    primaryCoverageDescription:
      "Menjamin kerusakan atau kerugian fisik yang terjadi secara tiba-tiba dan tidak terduga pada bangunan atau isi properti yang diasuransikan sesuai Wording Property All Risk.",
    primaryCoverageDeductibleClassOne: "Tidak dikenakan risiko sendiri.",
    primaryCoverageDeductibleOther:
      "5% dari nilai kerugian yang disetujui atau 0,1% dari total nilai yang dilindungi untuk setiap risiko dan setiap lokasi, mana yang lebih besar.",
    insuredRisksSectionTitle: "Jaminan Utama",
    exclusionsSectionTitle: "",
    exclusionsSectionSubtitle: "",
    importantExclusions: [],
    benefitsSummaryIntro:
      "Perlindungan utama mencakup kerusakan atau kerugian fisik pada properti yang diasuransikan sesuai Wording Property All Risk.",
    summaryCoverageLine: "Tambahan perlindungan yang tersedia dapat dipilih untuk melengkapi proteksi Property All Risk.",
    optionalExtensionsLabel: "Tambahan perlindungan yang tersedia",
    shareSubject: "Penawaran Asuransi Property All Risk",
    shareLabel: "Asuransi Property All Risk",
    paymentSuccessMessage: "Pembayaran Asuransi Property All Risk berhasil disimulasikan.",
    policyDocumentName: "Wording Property All Risk",
    activeExtensions: ["riot", "tsfwd", "earthquake"],
  },
};

export const PROPERTY_EXTENSION_LIBRARY = {
  riot: {
    key: "riot",
    title: "Jaminan Kerusuhan & Huru-hara",
    detail:
      "Menjamin kerusakan atau kerugian yang secara langsung disebabkan oleh kerusuhan, pemogokan, penghalangan bekerja, perbuatan jahat, huru-hara, tindakan pencegahan terkait, serta penjarahan dalam rangkaian kejadian tersebut.",
    deductible: "5% dari jumlah ganti rugi yang disetujui, minimum Rp5.000.000 setiap kejadian.",
    rate: 0.0001,
    iconKey: "shield",
  },
  flood: {
    key: "flood",
    title: "Jaminan Banjir",
    detail:
      "Menjamin kerugian atau kerusakan akibat banjir, angin topan atau badai, dan air dari luar bangunan yang masuk secara tiba-tiba, termasuk biaya pembersihan atau pemindahan puing akibat risiko tersebut.",
    deductible: "10% dari jumlah ganti rugi yang disetujui.",
    rate: 0.001,
    iconKey: "waves",
  },
  tsfwd: {
    key: "tsfwd",
    title: "Badai, Banjir, dan Kerusakan Akibat Air (TSFWD)",
    detail:
      "Menjamin kerugian atau kerusakan akibat badai, banjir, dan masuknya air secara tiba-tiba sesuai ketentuan tambahan perlindungan yang dipilih.",
    deductible: "10% dari jumlah ganti rugi yang disetujui.",
    rate: 0.001,
    iconKey: "waves",
  },
  earthquake: {
    key: "earthquake",
    title: "Jaminan Gempa Bumi",
    detail:
      "Menjamin kerugian atau kerusakan yang secara langsung disebabkan oleh gempa bumi, letusan gunung berapi, tsunami, atau likuifaksi sesuai ketentuan polis.",
    deductible: "2,5% dari nilai yang dilindungi.",
    rate: 0.01,
    iconKey: "sparkles",
  },
};

export function getPropertyVariant(variantKey = "property-safe") {
  return PROPERTY_PRODUCT_VARIANTS[variantKey] || PROPERTY_PRODUCT_VARIANTS["property-safe"];
}

export function getPropertyExtensions(variantKey = "property-safe") {
  const variant = getPropertyVariant(variantKey);
  return variant.activeExtensions.map((key) => PROPERTY_EXTENSION_LIBRARY[key]).filter(Boolean);
}
