import { AlertTriangle, Building2, MapPin, Phone, Shield, User } from "lucide-react";

export const CURRENT_YEAR = 2026;
export const MIN_YEAR_TLO = CURRENT_YEAR - 20;
export const MIN_YEAR_COMP = CURRENT_YEAR - 15;

export const PRODUCTS = [
  {
    id: "motor",
    title: "Asuransi Sepeda Motor - Total Loss",
    category: "Kendaraan",
    subtitle:
      "Perlindungan untuk sepeda motor terhadap kehilangan akibat pencurian atau kerusakan berat yang termasuk total loss sesuai ketentuan polis.",
    gradient: "from-slate-700 via-slate-600 to-slate-500",
  },
  {
    id: "carComp",
    title: "Comprehensive Kendaraan - Mobil",
    category: "Kendaraan",
    subtitle: "Perlindungan mobil terhadap kerusakan atau kehilangan akibat tabrakan, perbuatan jahat, pencurian, dan kebakaran.",
    gradient: "from-sky-800 via-sky-700 to-sky-600",
  },
  {
    id: "carTlo",
    title: "Asuransi Mobil - Total Loss",
    category: "Kendaraan",
    subtitle:
      "Perlindungan mobil terhadap kerugian total akibat risiko yang dijamin polis, termasuk pencurian dan kebakaran.",
    gradient: "from-slate-900 via-slate-800 to-slate-700",
  },
] as const;

export const OJK_REGION_1_CODES = ["BA", "BB", "BD", "BE", "BG", "BH", "BK", "BL", "BM", "BN", "BP"];
export const OJK_REGION_2_CODES = ["A", "B", "D", "E", "F", "T", "Z"];

export const PLATES = [
  "A - Banten",
  "AA - Kedu",
  "AB - DI Yogyakarta",
  "AD - Surakarta",
  "AE - Madiun",
  "AG - Kediri",
  "B - Jakarta/Depok/Tangerang/Bekasi",
  "BA - Sumatera Barat",
  "BB - Tapanuli",
  "BD - Bengkulu",
  "BE - Lampung",
  "BG - Sumatera Selatan",
  "BH - Jambi",
  "BK - Sumatera Utara Timur",
  "BL - Aceh",
  "BM - Riau",
  "BN - Bangka Belitung",
  "BP - Kepulauan Riau",
  "D - Bandung",
  "DA - Kalimantan Selatan",
  "DB - Sulawesi Utara Daratan",
  "DC - Sulawesi Barat",
  "DD - Sulawesi Selatan",
  "DE - Maluku",
  "DG - Maluku Utara",
  "DH - NTT Timor",
  "DK - Bali",
  "DL - Sulawesi Utara Kepulauan",
  "DM - Gorontalo",
  "DN - Sulawesi Tengah",
  "DR - NTB Lombok",
  "DT - Sulawesi Tenggara",
  "E - Cirebon",
  "EA - NTB Sumbawa",
  "EB - Flores",
  "ED - Sumba",
  "F - Bogor/Sukabumi/Cianjur",
  "G - Pekalongan/Tegal",
  "H - Semarang",
  "K - Pati",
  "KB - Kalimantan Barat",
  "KH - Kalimantan Tengah",
  "KT - Kalimantan Timur",
  "KU - Kalimantan Utara",
  "L - Surabaya",
  "M - Madura",
  "N - Malang",
  "P - Besuki",
  "PA - Papua",
  "PB - Papua Barat",
  "R - Banyumas",
  "S - Bojonegoro",
  "T - Karawang/Purwakarta",
  "W - Sidoarjo",
  "Z - Garut/Tasik/Majalengka",
];

export const MOTOR_SUGGESTIONS = [
  "Honda BeAT CBS",
  "Honda Scoopy Sporty",
  "Honda Vario 125 CBS",
  "Honda PCX 160 CBS",
  "Yamaha NMAX 155 Connected",
  "Yamaha Aerox 155 Connected",
  "Suzuki Nex II",
];

export const CAR_SUGGESTIONS = [
  "Toyota Avanza 1.5 G",
  "Toyota Veloz 1.5 Q",
  "Honda Brio Satya E",
  "Mitsubishi Xpander Ultimate",
  "Suzuki Ertiga GX",
  "Suzuki XL7 Beta",
];

export const MOTOR_EXTS = [
  { id: "tpl", label: "Jaminan Tanggung Jawab Hukum terhadap Pihak Ketiga", type: "amount", icon: Shield },
  { id: "srcc", label: "Risiko Kerusuhan dan Huru-hara", type: "toggle", icon: AlertTriangle },
  { id: "ts", label: "Risiko Terorisme", type: "toggle", icon: AlertTriangle },
  { id: "flood", label: "Risiko Banjir", type: "toggle", icon: MapPin },
  { id: "quake", label: "Risiko Gempa Bumi", type: "toggle", icon: AlertTriangle },
] as const;

export const CAR_EXTS = [
  { id: "tpl", label: "Jaminan Tanggung Jawab Hukum terhadap Pihak Ketiga", type: "amount", icon: Shield },
  { id: "srcc", label: "Risiko Kerusuhan dan Huru-hara", type: "toggle", icon: AlertTriangle },
  { id: "ts", label: "Risiko Terorisme", type: "toggle", icon: AlertTriangle },
  { id: "flood", label: "Risiko Banjir", type: "toggle", icon: MapPin },
  { id: "quake", label: "Risiko Gempa Bumi", type: "toggle", icon: AlertTriangle },
  { id: "driverPa", label: "Kecelakaan Diri Pengemudi", type: "amount", icon: User },
  { id: "passengerPa", label: "Kecelakaan Diri Penumpang", type: "amount-seat", icon: User },
  { id: "ambulance", label: "Biaya ambulan", type: "toggle", icon: Phone },
  { id: "authorizedWorkshop", label: "Bengkel authorized", type: "toggle", icon: Building2 },
  { id: "theftByOwnDriver", label: "Risiko pencurian oleh pengemudi sendiri", type: "toggle", icon: AlertTriangle },
] as const;

export const TLO_RATES_MOTOR = {
  1: { min: 0.0176 },
  2: { min: 0.018 },
  3: { min: 0.0067 },
};

export const TLO_RATES_CAR = {
  1: { 1: { min: 0.0047 }, 2: { min: 0.0063 }, 3: { min: 0.0041 }, 4: { min: 0.0025 }, 5: { min: 0.002 } },
  2: { 1: { min: 0.0065 }, 2: { min: 0.0044 }, 3: { min: 0.0038 }, 4: { min: 0.0025 }, 5: { min: 0.002 } },
  3: { 1: { min: 0.0051 }, 2: { min: 0.0044 }, 3: { min: 0.0029 }, 4: { min: 0.0023 }, 5: { min: 0.002 } },
};

export const COMP_RATES_CAR = {
  1: { 1: { min: 0.0382 }, 2: { min: 0.0267 }, 3: { min: 0.0208 }, 4: { min: 0.012 }, 5: { min: 0.0105 } },
  2: { 1: { min: 0.0247 }, 2: { min: 0.0269 }, 3: { min: 0.0271 }, 4: { min: 0.0139 }, 5: { min: 0.012 } },
  3: { 1: { min: 0.0253 }, 2: { min: 0.0246 }, 3: { min: 0.0238 }, 4: { min: 0.012 }, 5: { min: 0.0105 } },
};

export const FLOOD_RATES_TLO = { 1: { min: 0.0005 }, 2: { min: 0.00075 }, 3: { min: 0.0005 } };
export const FLOOD_RATES_COMP = { 1: { min: 0.00075 }, 2: { min: 0.001 }, 3: { min: 0.00075 } };
export const QUAKE_RATES_TLO = { 1: { min: 0.00085 }, 2: { min: 0.00075 }, 3: { min: 0.0005 } };
export const QUAKE_RATES_COMP = { 1: { min: 0.0012 }, 2: { min: 0.001 }, 3: { min: 0.00075 } };
export const SRCC_RATE_TLO = 0.00035;
export const SRCC_RATE_COMP = 0.0005;
export const TS_RATE_TLO = 0.00035;
export const TS_RATE_COMP = 0.0005;
export const DRIVER_PA_RATE = 0.005;
export const PASSENGER_PA_RATE = 0.001;
export const AUTH_WORKSHOP_RATE = 0.0025;
export const THEFT_BY_OWN_DRIVER_RATE = 0.001;
export const AMBULANCE_PREMIUM = 50000;

export const EXT_INFO: Record<string, string> = {
  tpl: "Menjamin tanggung jawab hukum Tertanggung terhadap kerusakan harta benda, biaya pengobatan, cedera badan, atau kematian pihak ketiga yang timbul langsung akibat kecelakaan kendaraan yang dijamin polis, dengan nilai pertanggungan maksimum Rp1.000.000 untuk setiap kejadian.",
  srcc: "Menjamin kerugian atau kerusakan kendaraan yang secara langsung disebabkan oleh kerusuhan, pemogokan, penghalangan bekerja, tawuran, huru-hara, pembangkitan rakyat tanpa senjata api, revolusi tanpa senjata api, serta penjarahan yang terjadi dalam peristiwa tersebut.",
  ts: "Menjamin kerugian atau kerusakan kendaraan yang secara langsung disebabkan oleh makar, terorisme, atau sabotase.",
  flood: "Menjamin kerugian atau kerusakan yang secara langsung disebabkan oleh banjir, angin topan, badai, hujan es, genangan air, atau tanah longsor yang mengenai kendaraan.",
  quake: "Menjamin kerugian atau kerusakan kendaraan yang secara langsung disebabkan oleh gempa bumi, tsunami, dan/atau letusan gunung berapi.",
  driverPa: "Menjamin cedera badan, kematian, dan/atau biaya pengobatan pengemudi yang secara langsung disebabkan oleh kecelakaan kendaraan yang dijamin polis.",
  passengerPa: "Menjamin cedera badan, kematian, dan/atau biaya pengobatan penumpang yang secara langsung disebabkan oleh kecelakaan kendaraan yang dijamin polis.",
  equipment: "Perlengkapan tambahan adalah aksesori atau perangkat non-standar yang bukan bawaan pabrik dan ingin ikut dijamin bersama kendaraan.",
  ambulance: "Menjamin biaya ambulans per kejadian akibat kecelakaan dari risiko yang dijamin polis, sampai batas maksimum sesuai Ikhtisar Pertanggungan.",
  authorizedWorkshop: "Memberikan fasilitas perbaikan di bengkel resmi sesuai merek kendaraan atau bengkel setara dengan persetujuan Penanggung.",
  theftByOwnDriver: "Menjamin risiko pencurian yang dilakukan oleh pengemudi yang dipekerjakan Tertanggung, sepanjang memenuhi syarat masa kerja minimum sesuai ketentuan polis.",
};

export const CONSENT_SECTIONS = [
  {
    key: "produk",
    title: "Pemahaman Produk",
    summary: "Tertanggung menyatakan telah menerima penjelasan, membaca, dan memahami informasi produk asuransi.",
    detailLines: [
      'Menyatakan telah menerima penjelasan, membaca, dan memahami informasi produk asuransi PT Asuransi Jasa Indonesia (“Penanggung”) ini;',
    ],
  },
  {
    key: "data",
    title: "Pemrosesan Data Pribadi",
    summary: "Tertanggung memberi izin pemrosesan data pribadi untuk penerbitan polis, pelayanan klaim, dan peningkatan layanan.",
    detailLines: [
      "Memberikan izin kepada Penanggung untuk melakukan pemrosesan Informasi/Data (mengumpulkan, memverifikasi, mengolah, menyimpan, memperbarui, mempergunakan, termasuk memusnahkan) yang tercantum dalam SPAU ini dan mengungkapkan Informasi/Data Pribadi (termasuk namun tidak terbatas pada nama, alamat surat menyurat, alamat email, nomor telepon, kontak, dan informasi/keterangan lainnya) kepada afiliasi Penanggung dan/atau pihak ketiga yang ditunjuk oleh Penanggung serta setuju dihubungi melalui sarana komunikasi pribadi sehubungan dengan pengajuan polis asuransi ini, pelayanan klaim, peningkatan layanan konsumen dan/ atau pelaksanaan ketentuan polis asuransi sesuai dengan kebijakan internal Penanggung maupun peraturan perundang-undangan yang berlaku.",
      "Adapun rincian mengenai tujuan pemrosesan Data Pribadi maupun pihak lain yang dapat memperoleh dan/atau melakukan pemrosesan Informasi/Data Pribadi Kami/Saya untuk menunjang keperluan ini tercantum dalam Kebijakan Privasi Penanggung yang dapat diakses pada",
    ],
    detailLinkLabel: "https://bit.ly/JSDPrivasi",
    detailLinkHref: "https://bit.ly/JSDPrivasi",
  },
  {
    key: "material",
    title: "Kebenaran Fakta Material",
    summary: "Seluruh keterangan yang diberikan harus benar dan menjadi dasar penerbitan polis.",
    detailLines: [
      "Menyatakan bahwa:",
      "(a) seluruh informasi/keterangan yang dicantumkan dalam SPAU ini dibuat dengan sejujurnya dan sesuai dengan keadaan sebenarnya menurut pengetahuan Kami/Saya atau yang seharusnya Kami/Saya ketahui;",
      "(b) menyadari bahwa SPAU ini akan digunakan sebagai dasar dan merupakan bagian yang tidak terpisahkan dari polis asuransi yang akan diterbitkan, oleh karenanya ketidakbenarannya merupakan pelanggaran atau tidak terpenuhinya kewajiban penyampaian fakta material. Pelanggaran tersebut mengakibatkan ditolaknya setiap klaim yang diajukan;",
      "(c) mengerti bahwa pertanggungan yang diminta ini baru berlaku setelah mendapat persetujuan tertulis dari Penanggung.",
    ],
  },
];
