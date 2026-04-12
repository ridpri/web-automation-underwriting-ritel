export const PROPERTY_PRODUCT_VARIANTS = {
  "property-safe": {
    key: "property-safe",
    title: "Property Safe",
    heroSubtitle: "Perlindungan untuk bangunan dan isi properti terhadap risiko kebakaran, dengan tambahan perlindungan yang bisa dipilih sesuai kebutuhan.",
    catalogSubtitle: "Perlindungan untuk bangunan dan isi properti dari risiko kebakaran.",
    catalogDescription: "Perlindungan untuk bangunan, inventaris, dan isi properti dari risiko kebakaran, dengan tambahan perlindungan opsional.",
    catalogImage: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80",
    productCode: "PSF",
    primaryCoverageTitle: "Kerusakan Akibat Kebakaran",
    primaryCoveragePremiumLabel: "Premi Dasar",
    primaryCoverageDescription:
      "Menjamin kerusakan atau kerugian yang secara langsung disebabkan oleh kebakaran, petir, ledakan, kejatuhan pesawat terbang, dan asap sesuai Polis Standar Asuransi Kebakaran Indonesia.",
    primaryCoverageDeductibleClassOne: "Tidak dikenakan risiko sendiri.",
    primaryCoverageDeductibleOther:
      "5% dari nilai kerugian yang disetujui atau 0,1% dari total nilai yang dilindungi untuk setiap risiko dan setiap lokasi, mana yang lebih besar.",
    insuredRisksSectionTitle: "Risiko yang Dijamin",
    exclusionsSectionTitle: "",
    exclusionsSectionSubtitle: "",
    importantExclusions: [],
    benefitsSummaryIntro:
      "Perlindungan utama mencakup kerusakan akibat kebakaran sesuai jenis bangunan dan nilai yang ingin Anda lindungi.",
    summaryCoverageLine: "Tambahan perlindungan yang tersedia dapat dipilih untuk melengkapi proteksi dari risiko kebakaran.",
    optionalExtensionsLabel: "Tambahan perlindungan yang tersedia",
    shareSubject: "Penawaran Property Safe",
    shareLabel: "Property Safe",
    paymentSuccessMessage: "Pembayaran Property Safe berhasil disimulasikan.",
    activeExtensions: ["riot", "flood", "earthquake"],
  },
  "property-all-risk": {
    key: "property-all-risk",
    title: "Property All Risk",
    heroSubtitle: "Perlindungan untuk bangunan dan isi properti terhadap kerusakan fisik mendadak, dengan tambahan perlindungan yang bisa dipilih sesuai kebutuhan.",
    catalogSubtitle: "Perlindungan lebih luas untuk bangunan dan isi properti.",
    catalogDescription: "Perlindungan untuk kerusakan fisik mendadak pada bangunan, inventaris, dan isi properti, dengan tambahan perlindungan opsional.",
    catalogImage: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
    productCode: "PAR",
    primaryCoverageTitle: "Kerusakan Fisik Mendadak pada Properti",
    primaryCoveragePremiumLabel: "Premi Dasar",
    primaryCoverageDescription:
      "Menjamin kerusakan fisik yang terjadi tiba-tiba dan tidak direncanakan pada bangunan atau isi properti yang diasuransikan, selama berada di lokasi yang tercantum dalam polis dan tidak termasuk dalam pengecualian polis.",
    primaryCoverageDeductibleClassOne: "Besar risiko sendiri mengikuti ketentuan polis final dan tambahan perlindungan yang Anda pilih.",
    primaryCoverageDeductibleOther: "Besar risiko sendiri mengikuti ketentuan polis final dan tambahan perlindungan yang Anda pilih.",
    insuredRisksSectionTitle: "Jaminan Utama",
    exclusionsSectionTitle: "Pengecualian Penting",
    exclusionsSectionSubtitle: "Bagian ini membantu Anda memahami apa saja yang umumnya tidak dijamin, tanpa menggantikan isi polis resmi.",
    importantExclusions: [
      "Kerusakan yang terjadi karena tindakan sengaja, curang, atau disengaja oleh pihak yang berkepentingan.",
      "Kejadian seperti perang, terorisme, sabotase, dan risiko sejenis sepanjang tidak dijamin dalam polis.",
      "Kerusakan yang terjadi perlahan, seperti aus, karat, korosi, jamur, pembusukan, atau cacat bawaan material.",
      "Kerusakan pada mesin atau instalasi listrik yang berasal dari kerusakan internal alat itu sendiri.",
      "Polusi, pencemaran, atau selisih persediaan yang penyebabnya tidak dapat dijelaskan dengan jelas.",
      "Jenis harta tertentu yang memang dikecualikan dalam polis, misalnya kendaraan, perhiasan, karya seni, hewan, tanaman, tanah, dan benda tertentu lainnya.",
    ],
    benefitsSummaryIntro:
      "Perlindungan utama mencakup kerusakan fisik mendadak pada properti yang diasuransikan, selama penyebabnya tidak termasuk dalam pengecualian polis.",
    summaryCoverageLine: "Tambahan perlindungan yang tersedia meliputi badai, banjir, kerusuhan, dan gempa bumi.",
    optionalExtensionsLabel: "Tambahan perlindungan yang tersedia",
    shareSubject: "Penawaran Property All Risk",
    shareLabel: "Property All Risk",
    paymentSuccessMessage: "Pembayaran Property All Risk berhasil disimulasikan.",
    activeExtensions: ["tsfwd", "riot", "earthquake"],
  },
};

export const PROPERTY_EXTENSION_LIBRARY = {
  riot: {
    key: "riot",
    title: "Risiko Kerusuhan & Huru-hara",
    detail:
      "Menjamin kerusakan atau kerugian yang secara langsung disebabkan oleh kerusuhan, pemogokan, penghalangan bekerja, perbuatan jahat, huru-hara, tindakan pencegahan terkait, serta penjarahan dalam rangkaian kejadian tersebut.",
    deductible: "5% dari jumlah ganti rugi yang disetujui, minimum Rp5.000.000 setiap kejadian.",
    rate: 0.0001,
    iconKey: "shield",
  },
  flood: {
    key: "flood",
    title: "Risiko Banjir",
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
    title: "Risiko Gempa Bumi",
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
