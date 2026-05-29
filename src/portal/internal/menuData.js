export const PRODUCT_IMAGES = {
  "Life Guard": "/production-assets/product-lintasan.df53665c.jpg",
  "Trip Guard": "/production-assets/product-kecelakaan-diri.31916e3d.jpg",
  "Edu Protect": "/production-assets/product-anak-sekolah.56785bac.jpg",
  "Travel Safe": "/production-assets/product-travel.51b3edff.jpg",
  "Asuransi Kebakaran": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
  "Property All Risk": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
  "Asuransi Sepeda Motor - Total Loss": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80",
  "Asuransi Mobil - Total Loss": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
  "Asuransi Mobil - Komprehensif": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80",
};

export const PRODUCTS = [
  { title: "Trip Guard", category: "Kecelakaan Diri", desc: "Perlindungan perjalanan dan mobilitas pribadi.", image: PRODUCT_IMAGES["Trip Guard"] },
  { title: "Edu Protect", category: "Kecelakaan Diri", desc: "Perlindungan aktivitas pendidikan dan pembelajaran.", image: PRODUCT_IMAGES["Edu Protect"] },
  { title: "Travel Safe", category: "Kecelakaan Diri", desc: "Perlindungan perjalanan domestik dan internasional.", image: PRODUCT_IMAGES["Travel Safe"] },
  { title: "Life Guard", category: "Kecelakaan Diri", desc: "Perlindungan aktivitas harian terhadap risiko kecelakaan diri.", image: PRODUCT_IMAGES["Life Guard"] },
  { title: "Asuransi Kebakaran", category: "Harta Benda", desc: "Perlindungan bangunan dan isi properti dari risiko kebakaran.", image: PRODUCT_IMAGES["Asuransi Kebakaran"] },
  { title: "Property All Risk", category: "Harta Benda", desc: "Perlindungan properti dengan jaminan all risk.", image: PRODUCT_IMAGES["Property All Risk"] },
  { title: "Asuransi Sepeda Motor - Total Loss", category: "Kendaraan", desc: "Perlindungan sepeda motor terhadap kehilangan atau kerusakan total.", image: PRODUCT_IMAGES["Asuransi Sepeda Motor - Total Loss"] },
  { title: "Asuransi Mobil - Total Loss", category: "Kendaraan", desc: "Perlindungan mobil terhadap kehilangan atau kerusakan total.", image: PRODUCT_IMAGES["Asuransi Mobil - Total Loss"] },
  { title: "Asuransi Mobil - Komprehensif", category: "Kendaraan", desc: "Perlindungan menyeluruh untuk mobil dari kerusakan sebagian hingga total.", image: PRODUCT_IMAGES["Asuransi Mobil - Komprehensif"] },
];

export const TASKS = [
  { name: "Rina Maharani", email: "rina.maharani@email.com", product: "Asuransi Mobil - Total Loss", pipeline: "Menunggu Data", detail: "Butuh Assist Internal", owner: "Maker", sla: "Hari ini", action: "Lanjutkan Pengisian", avatar: "RM" },
  { name: "Rizky Pratama", email: "rizky.pratama@email.com", product: "Asuransi Mobil - Komprehensif", pipeline: "Menunggu Data", detail: "Menunggu Data Nasabah", owner: "Nasabah", sla: "1 hari lagi", action: "Kirim Reminder", avatar: "RP" },
  { name: "PT Sinar Jaya", email: "admin@sinarjaya.co.id", product: "Property All Risk", pipeline: "Menunggu Data", detail: "Validasi Data Internal", owner: "Checker", sla: "2 hari lagi", action: "Review Data", avatar: "SJ" },
  { name: "Dewi Lestari", email: "dewi.lestari@email.com", product: "Travel Safe", pipeline: "Menunggu Bayar", detail: "Menunggu Pembayaran Nasabah", owner: "Nasabah", sla: "Hari ini", action: "Konfirmasi Bayar", avatar: "DL" },
  { name: "Andi Wijaya", email: "andi.wijaya@email.com", product: "Life Guard", pipeline: "Penawaran Dikirim", detail: "Menunggu Persetujuan Penawaran", owner: "Nasabah", sla: "1 hari lagi", action: "Follow Up", avatar: "AW" },
];

export const PROMOS = [
  { code: "JAS26TRV8", products: "Travel Safe", category: "Personal", discount: "20%", quota: 100, period: "20-05-2026 - 27-05-2026", status: "Aktif" },
  { code: "JAS26LIF5", products: "Life Guard", category: "Personal", discount: "25%", quota: 80, period: "20-05-2026 - 03-06-2026", status: "Aktif" },
  { code: "JAS26EDU7", products: "Edu Protect", category: "Personal", discount: "30%", quota: 60, period: "20-05-2026 - 20-06-2026", status: "Aktif" },
  { code: "JAS26TRP4", products: "Trip Guard", category: "Personal", discount: "25%", quota: 50, period: "20-05-2026 - 20-06-2026", status: "Aktif" },
  { code: "JAS26CAR9", products: "Asuransi Mobil - Total Loss", category: "Mobil", discount: "25%", quota: 100, period: "20-05-2026 - 20-06-2026", status: "Aktif" },
  { code: "JAS26PRP2", products: "Property All Risk", category: "Properti", discount: "15%", quota: 40, period: "20-05-2026 - 03-06-2026", status: "Aktif" },
  { code: "JAS26FIR6", products: "Asuransi Kebakaran", category: "Properti", discount: "15%", quota: 10, period: "23-04-2026 - 24-04-2026", status: "Berakhir" },
];

export const PRODUCT_POLICY_CODES = {
  "Life Guard": "705",
  "Edu Protect": "705",
  "Trip Guard": "728",
  "Travel Safe": "794",
  "Asuransi Kebakaran": "201",
  "Asuransi Gempa Bumi": "203",
  "Asuransi Property All Risk": "297",
  "Asuransi Mobil TLO": "601",
  "Asuransi Sepeda Motor TLO": "605",
};

export const TRANSACTIONS = [
  { customer: "Andi Wijaya", product: "Life Guard", object: "Perlindungan diri individu", premium: "Rp 350.000", status: "Menunggu Bayar", stage: "Link pembayaran terkirim", issuedAt: "-", sequence: "00041" },
  { customer: "Nadia Putri", product: "Edu Protect", object: "Proteksi pelajar", premium: "Rp 180.000", status: "Draft Polis", stage: "Menunggu validasi data", issuedAt: "-", sequence: "00042" },
  { customer: "Rafi Mahendra", product: "Trip Guard", object: "Perjalanan domestik", premium: "Rp 125.000", status: "Terbit", stage: "E-polis tersedia", issuedAt: "28-05-2026", sequence: "00043" },
  { customer: "Siti Rahmawati", product: "Travel Safe", object: "Perjalanan internasional", premium: "Rp 245.000", status: "Terbit", stage: "E-polis tersedia", issuedAt: "28-05-2026", sequence: "00044" },
  { customer: "Fajar Nugroho", product: "Asuransi Kebakaran", object: "Rumah tinggal Bandung", premium: "Rp 2.850.000", status: "Review Checker", stage: "Cek okupasi dan nilai bangunan", issuedAt: "-", sequence: "00045" },
  { customer: "PT Maju Bersama", product: "Asuransi Property All Risk", object: "Gudang dan stok barang", premium: "Rp 12.000.000", status: "Terbit", stage: "E-polis tersedia", issuedAt: "27-05-2026", sequence: "00046" },
  { customer: "Budi Santoso", product: "Asuransi Mobil TLO", object: "Toyota Avanza 2024", premium: "Rp 5.250.000", status: "Terbit", stage: "E-polis tersedia", issuedAt: "27-05-2026", sequence: "00047" },
  { customer: "Ayu Lestari", product: "Asuransi Sepeda Motor TLO", object: "Honda Vario 2025", premium: "Rp 620.000", status: "Menunggu Bayar", stage: "Link pembayaran terkirim", issuedAt: "-", sequence: "00048" },
];

export const STAFF_CLAIMS = [
  { title: "Baru Diajukan", sub: "Status klaim", value: "12", status: "Aktif" },
  { title: "Dalam Proses", sub: "Status klaim", value: "9", status: "Aktif" },
  { title: "Menunggu Dokumen", sub: "Status klaim", value: "5", status: "Aktif" },
  { title: "Disetujui", sub: "Status klaim", value: "7", status: "Aktif" },
  { title: "Ditolak", sub: "Status klaim", value: "1", status: "Tidak Aktif" },
];

const TOKEN = "tk8f3x9q2m";
const BASE_URL = "https://esppa.asuransijasindo.co.id/product";

export function productRoute(product) {
  const routeMap = {
    "Trip Guard": "kecelakaan-diri/728",
    "Life Guard": "kecelakaan-diri/705",
    "Edu Protect": "kecelakaan-diri/edu-protect",
    "Travel Safe": "kecelakaan-diri/travel-safe",
    "Asuransi Kebakaran": "harta-benda/asuransi-kebakaran",
    "Property All Risk": "harta-benda/property-all-risk",
    "Asuransi Sepeda Motor - Total Loss": "kendaraan/sepeda-motor-total-loss",
    "Asuransi Mobil - Total Loss": "kendaraan/mobil-total-loss",
    "Asuransi Mobil - Komprehensif": "kendaraan/mobil-komprehensif",
  };
  return routeMap[product.title] || product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function productBaseUrl(product) {
  return `${BASE_URL}/${productRoute(product)}`;
}

export function productTrackedUrl(product) {
  return `${productBaseUrl(product)}/${TOKEN}`;
}
