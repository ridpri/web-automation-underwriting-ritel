import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  Building2,
  Car,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  Gauge,
  Grid2X2,
  Headphones,
  List,
  Home,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Plane,
  Printer,
  QrCode,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  SlidersHorizontal,
  Upload,
  User,
  Wallet,
} from "lucide-react";

import AddPartnerMenu from "./portal/internal/menus/AddPartnerMenu.jsx";
import AddUserMenu from "./portal/internal/menus/AddUserMenu.jsx";
import ClaimsMenu from "./portal/internal/menus/ClaimsMenu.jsx";
import DashboardMenu from "./portal/internal/menus/DashboardMenu.jsx";
import MasterDataMenu from "./portal/internal/menus/MasterDataMenu.jsx";
import OfferMenu from "./portal/internal/menus/OfferMenu.jsx";
import PromotionMenu from "./portal/internal/menus/PromotionMenu.jsx";
import SettingsMenu from "./portal/internal/menus/SettingsMenu.jsx";
import TasklistMenu from "./portal/internal/menus/TasklistMenu.jsx";
import TransactionsMenu from "./portal/internal/menus/TransactionsMenu.jsx";

const DEFAULT_POLICIES = [
  {
    id: "policy-home",
    category: "Hunian utama",
    product: "Asuransi Rumah Tinggal",
    objectName: "Rumah tinggal 2 lantai, Kebayoran Baru",
    policyNumber: "JSD-PROP-2026-100184",
    insuredValue: 1250000000,
    annualPremium: 3480000,
    paymentStatus: "Lunas",
    status: "Aktif",
    tone: "success",
    periodStart: "12 Apr 2025",
    periodEnd: "11 Apr 2026",
    benefits: ["Kebakaran", "Banjir", "Gempa bumi", "Kerusuhan"],
    claimChecklist: ["Foto area kerusakan", "Kronologi kejadian", "Daftar bagian terdampak", "Dokumen tambahan bila diminta surveyor"],
    documents: ["E-polis", "Schedule benefit", "Bukti bayar", "Endorsement"],
  },
  {
    id: "policy-car",
    category: "Kendaraan pribadi",
    product: "Comprehensive Kendaraan - Mobil",
    objectName: "Honda Brio RS 2023",
    policyNumber: "JSD-MTR-2026-220091",
    insuredValue: 228000000,
    annualPremium: 5260000,
    paymentStatus: "Lunas",
    status: "Aktif",
    tone: "success",
    periodStart: "08 Jan 2026",
    periodEnd: "07 Jan 2027",
    benefits: ["Kerusakan sendiri", "Tanggung jawab hukum", "Banjir dan angin topan"],
    claimChecklist: ["Foto kerusakan kendaraan", "Kronologi kejadian", "STNK atau data kendaraan", "Dokumen pihak ketiga bila ada"],
    documents: ["E-polis", "Kartu ringkasan polis", "Invoice", "Bukti bayar"],
  },
  {
    id: "policy-pa",
    category: "Perlindungan keluarga",
    product: "Personal Accident Family",
    objectName: "Perlindungan kecelakaan diri keluarga",
    policyNumber: "JSD-PA-2026-300044",
    insuredValue: 500000000,
    annualPremium: 940000,
    paymentStatus: "Metode Bayar Perlu Diperbarui",
    status: "Aktif",
    tone: "warning",
    periodStart: "01 Mar 2026",
    periodEnd: "28 Feb 2027",
    benefits: ["Meninggal dunia akibat kecelakaan", "Cacat tetap", "Biaya perawatan darurat"],
    claimChecklist: ["Kronologi kejadian", "Surat dokter atau resume medis", "Kuitansi biaya perawatan", "Dokumen identitas tertanggung"],
    documents: ["E-polis", "Ringkasan manfaat", "Invoice", "Riwayat pembayaran"],
  },
  {
    id: "policy-home-2024",
    category: "Riwayat hunian",
    product: "Asuransi Rumah Tinggal 2024",
    objectName: "Rumah tinggal lama, Bintaro Jaya",
    policyNumber: "JSD-PROP-2024-087512",
    insuredValue: 980000000,
    annualPremium: 3010000,
    paymentStatus: "Periode Berakhir",
    status: "Berakhir",
    tone: "default",
    periodStart: "12 Apr 2024",
    periodEnd: "11 Apr 2025",
    benefits: ["Kebakaran", "Banjir"],
    claimChecklist: ["Lihat polis baru bila ingin melanjutkan perlindungan.", "Riwayat dokumen masih bisa dilihat dari daftar dokumen utama."],
    documents: ["E-polis 2024", "Bukti bayar 2024"],
  },
];

const DEFAULT_CLAIMS = [
  {
    id: "CLM-2602-8820",
    policyId: "policy-pa",
    title: "Biaya rawat inap kecelakaan",
    lossDate: "25 Feb 2026",
    reportedDate: "25 Feb 2026",
    status: "Dokumen kurang",
    tone: "danger",
    stage: 2,
    amount: "Rp 8.200.000",
    nextAction: "Unggah surat dokter dan kuitansi asli agar review bisa dilanjutkan.",
    dueLabel: "Butuh tindak lanjut hari ini",
    assignedTo: "Tim klaim personal accident",
    nextUpdate: "Setelah dokumen masuk, review berikutnya dikirim maksimal 1 x 24 jam kerja.",
    requiredDocs: ["Surat dokter", "Kuitansi asli", "KTP tertanggung"],
    history: [
      { date: "25 Feb 2026", text: "Laporan awal diterima." },
      { date: "26 Feb 2026", text: "Tim klaim meminta dokumen medis tambahan." },
    ],
    canUpload: true,
    settled: false,
  },
  {
    id: "CLM-2602-9981",
    policyId: "policy-car",
    title: "Kerusakan bemper depan",
    lossDate: "28 Feb 2026",
    reportedDate: "28 Feb 2026",
    status: "Sedang disurvei",
    tone: "warning",
    stage: 3,
    amount: "Rp 4.500.000",
    nextAction: "Tunggu hasil survei. Anda belum perlu mengirim dokumen tambahan.",
    dueLabel: "Update berikutnya paling lambat besok",
    assignedTo: "Claim Assessment Center",
    nextUpdate: "Hasil survei akan ditampilkan di portal dan dikirim ke email terdaftar.",
    requiredDocs: [],
    history: [
      { date: "28 Feb 2026", text: "Laporan klaim kendaraan diterima." },
      { date: "29 Feb 2026", text: "Jadwal survei dikonfirmasi." },
    ],
    canUpload: false,
    settled: false,
  },
  {
    id: "CLM-2512-0091",
    policyId: "policy-car",
    title: "Kehilangan sepeda motor",
    lossDate: "15 Des 2025",
    reportedDate: "15 Des 2025",
    status: "Selesai",
    tone: "success",
    stage: 4,
    amount: "Rp 21.000.000",
    nextAction: "Tidak ada tindakan lanjutan.",
    dueLabel: "Selesai",
    assignedTo: "Pembayaran klaim",
    nextUpdate: "Dana sudah ditransfer ke rekening tertanggung.",
    requiredDocs: [],
    history: [
      { date: "15 Des 2025", text: "Laporan awal diterima." },
      { date: "20 Des 2025", text: "Dokumen lengkap." },
      { date: "05 Jan 2026", text: "Pembayaran klaim dilakukan." },
    ],
    canUpload: false,
    settled: true,
  },
];

const DEFAULT_BILLING_ITEMS = [
  {
    id: "INV-2604-1001",
    policyId: "policy-home",
    title: "Perpanjangan polis rumah tinggal",
    dueDate: "11 Apr 2026",
    amount: 3520000,
    status: "Perlu Dibayar",
    tone: "warning",
    method: "BCA Virtual Account",
    helper: "Bayar hari ini agar perpanjangan tidak tertunda.",
  },
  {
    id: "INV-2603-1007",
    policyId: "policy-pa",
    title: "Premi Personal Accident Family",
    dueDate: "01 Mar 2026",
    amount: 940000,
    status: "Metode Bayar Perlu Diperbarui",
    tone: "danger",
    method: "Kartu Tersimpan Perlu Diperbarui",
    helper: "Metode bayar lama tidak lagi valid.",
  },
];

const DEFAULT_PRINT_REQUESTS = [
  {
    id: "PRN-2604-0001",
    policyId: "policy-home",
    requestedAt: "10 Apr 2026",
    status: "Diproses",
    deliveryAddress: "Jl. Jenderal Sudirman Kav. 1, Jakarta Pusat",
    helper: "Cetakan polis sedang disiapkan untuk dikirim ke alamat terdaftar.",
  },
];

const DEFAULT_OFFICIAL_CONTACTS = [
  { label: "Contact Center", value: "1500-073", helper: "24 jam", href: "tel:1500073", icon: Phone },
  { label: "Layanan pelanggan", value: "care@jasindo.co.id", helper: "Email resmi", href: "mailto:care@jasindo.co.id", icon: Mail },
  { label: "Telepon kantor", value: "(021) 3924737", helper: "Graha Jasindo", href: "tel:+62213924737", icon: Headphones },
];

const TOKEN = "tk8f3x9q2m";
const BASE_URL = "https://esppa.asuransijasindo.co.id/product";
const PRODUCTION_ASSETS = {
  danantara: "/production-assets/danantara.57629308.png",
  jasindoWhite: "/production-assets/jasindo-white-all.814f5299.png",
};

const STAFF_NAV_ITEMS = [
  { key: "dashboard", slug: "dashboard", label: "Dashboard", icon: Gauge },
  { key: "tasklist", slug: "tasklist", label: "Tasklist", icon: ClipboardList, badge: 5 },
  { key: "buat-penawaran", slug: "buat-penawaran", label: "Buat Penawaran", icon: ShoppingCart },
  { key: "add-partner", slug: "add-partner", label: "Add Partner", icon: User },
  { key: "promotion", slug: "promotion", label: "Promosi", icon: CreditCard },
  { key: "transaksi-polis", slug: "transaksi-polis", label: "Transaksi Polis", icon: Shield },
  { key: "riwayat-klaim", slug: "riwayat-klaim", label: "Riwayat Klaim", icon: FileText },
  { key: "add-user", slug: "add-user", label: "Add User", icon: User },
  { key: "master-data", slug: "master-data", label: "Master Data", icon: Settings },
  { key: "settings", slug: "setelan", label: "Setelan", icon: Settings },
];
function cls(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID").format(Number(value || 0));
}

function staffStatusTone(value) {
  const normalized = String(value || "").toLowerCase();
  if (/(aktif|terbit|selesai|lunas|disetujui)/.test(normalized)) return "success";
  if (/(tidak aktif|ditolak|gagal|expired)/.test(normalized)) return "danger";
  if (/(menunggu|butuh|validasi|review|checker|maker|proses)/.test(normalized)) return "warning";
  return "default";
}

function productRoute(product) {
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

function productBaseUrl(product) {
  return `${BASE_URL}/${productRoute(product)}`;
}

function productTrackedUrl(product) {
  return `${productBaseUrl(product)}/${TOKEN}`;
}

function formatRange(start, end) {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
    return `${startDate.getDate()}–${endDate.getDate()} ${endDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`;
  }
  return `${startDate.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} – ${endDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`;
}

function getInitials(name) {
  return String(name || "AY")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0])
    .join("")
    .toUpperCase();
}

const POLICY_FILTERS = {
  status: [
    { key: "all", label: "Semua", value: "Semua" },
    { key: "aktif", label: "Aktif", value: "Aktif" },
    { key: "berakhir", label: "Berakhir", value: "Berakhir" },
  ],
  category: [
    { key: "all", label: "Semua", icon: "\u{1F4CB}" },
    { key: "properti", label: "Properti", icon: "\u{1F3E0}" },
    { key: "mobil", label: "Mobil", icon: "\u{1F697}" },
    { key: "motor", label: "Motor", icon: "\u{1F6F5}" },
    { key: "personal", label: "Personal", icon: "\u{1F464}" },
    { key: "lainnya", label: "Lainnya", icon: "\u{1F4DC}" },
  ],
};

const PORTAL_MENU_KEYS = STAFF_NAV_ITEMS.map((item) => item.key);
const PORTAL_MENU_SLUGS = STAFF_NAV_ITEMS.reduce((map, item) => ({ ...map, [item.key]: item.slug }), {});

function normalizePortalMenu(value, fallback = "dashboard") {
  if (PORTAL_MENU_KEYS.includes(value)) return value;
  return Object.entries(PORTAL_MENU_SLUGS).find(([, slug]) => slug === value)?.[0] || fallback;
}

function portalMenuSlug(menu) {
  return PORTAL_MENU_SLUGS[normalizePortalMenu(menu)];
}

function readPortalMenu(defaultTab) {
  if (typeof window === "undefined") return normalizePortalMenu(defaultTab);
  const params = new URLSearchParams(window.location.search);
  const pathSlug = window.location.pathname.split("/").filter(Boolean).pop();
  return normalizePortalMenu(params.get("menu") || pathSlug || defaultTab);
}

function writePortalMenu(menu) {
  if (typeof window === "undefined") return;
  const nextUrl = new URL(window.location.href);
  nextUrl.pathname = `/${portalMenuSlug(menu)}`;
  nextUrl.searchParams.delete("menu");
  window.history.pushState({}, "", nextUrl);
}

function replacePortalMenu(menu) {
  if (typeof window === "undefined") return;
  const nextUrl = new URL(window.location.href);
  nextUrl.pathname = `/${portalMenuSlug(menu)}`;
  nextUrl.searchParams.delete("menu");
  window.history.replaceState({}, "", nextUrl);
}

function policyCategory(policy) {
  const text = `${policy.category || ""} ${policy.product || ""}`.toLowerCase();
  if (text.includes("mobil") || text.includes("kendaraan")) return "mobil";
  if (text.includes("motor") || text.includes("sepeda")) return "motor";
  if (text.includes("pribadi") || text.includes("keluarga") || text.includes("accident") || text.includes("kecelakaan")) return "personal";
  if (text.includes("rumah") || text.includes("hunian")) return "properti";
  return "lainnya";
}

function PolicyCategoryFilters({ activeCategory, onChange }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {POLICY_FILTERS.category.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          className={cls(
            "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[12px] font-bold",
            activeCategory === item.key ? "border-[#004B78] bg-[#004B78] text-white" : "border-[#D9E1EA] bg-white text-[#5F7A99] hover:bg-[#F6F8FA]",
          )}
        >
          <span aria-hidden="true">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

function statusClass(tone = "default") {
  const tones = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    danger: "border-rose-200 bg-rose-50 text-rose-700",
    default: "border-[#D9E1EA] bg-[#F6F8FA] text-[#5F7A99]",
  };
  return tones[tone] || tones.default;
}

function findPolicy(policies, policyId) {
  return policies.find((policy) => policy.id === policyId) || policies[0] || {};
}

function AppLogo() {
  return (
    <div className="production-header__brand">
      <img src={PRODUCTION_ASSETS.danantara} alt="Danantara Indonesia" />
      <img src={PRODUCTION_ASSETS.jasindoWhite} alt="Asuransi Jasindo" />
    </div>
  );
}

function TopBar({ sessionName, onGoHome, onExit }) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const openProducts = () => {
    if (typeof window !== "undefined") {
      const nextUrl = new URL(window.location.href);
      nextUrl.pathname = "/";
      nextUrl.searchParams.delete("menu");
      window.history.pushState({}, "", nextUrl);
    }
    onGoHome?.();
  };

  return (
    <header className="production-header fixed left-0 right-0 top-0 z-30 h-[58px] shadow-sm">
      <div className="production-header__inner h-full">
        <AppLogo />

        <nav className="production-nav" aria-label="Navigasi utama">
          <button
            type="button"
            className="production-nav__item"
            onClick={() => {
              window.location.href = "https://esppa.asuransijasindo.co.id/";
            }}
          >
            <Home size={16} strokeWidth={2.2} aria-hidden="true" />
            <span>Beranda</span>
          </button>
          <button type="button" className="production-nav__item is-active" onClick={openProducts}>
            <Package size={16} strokeWidth={2.2} aria-hidden="true" />
            <span>Produk</span>
          </button>
        </nav>

        <div className="production-actions">
          <button type="button" className="production-language" aria-label="Bahasa Indonesia">
            <span className="production-language__flag" aria-hidden="true" />
            <span>ID</span>
          </button>
          <div className="production-account">
            <button
              type="button"
              className="production-profile"
              aria-label={`Akun ${sessionName}`}
              aria-expanded={accountMenuOpen}
              aria-haspopup="menu"
              aria-controls="staff-account-menu"
              onClick={() => setAccountMenuOpen((current) => !current)}
            >
              <span className="production-profile__badge">{getInitials(sessionName)}</span>
              <span>{sessionName}</span>
              <ChevronDown size={15} strokeWidth={2.2} aria-hidden="true" />
            </button>
            <div id="staff-account-menu" role="menu" className="production-menu" hidden={!accountMenuOpen}>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setAccountMenuOpen(false);
                  onExit?.();
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Sidebar({ activeMenu, setActiveMenu, navItems }) {
  return (
    <aside className="fixed bottom-0 left-0 top-[58px] z-20 hidden w-[270px] border-r border-[#D9E1EA] bg-white md:flex md:flex-col">
      <nav className="space-y-2 px-3 py-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeMenu === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveMenu(item.key)}
              className={cls(
                "flex h-10 w-full items-center gap-3 rounded px-3 text-left text-[14px] font-semibold transition",
                active ? "bg-[#004B78] text-white" : "text-[#004B78] hover:bg-[#EEF5FA]",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badge ? <span className={cls("rounded-full px-2 py-0.5 text-[10px] font-black", active ? "bg-white text-[#004B78]" : "bg-[#F2A62A] text-white")}>{item.badge}</span> : null}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function WorkspaceFilters({ activeMenu, setActiveMenu, navItems }) {
  return (
    <div className="mb-3 flex gap-1.5 overflow-x-auto md:hidden">
      {navItems.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => setActiveMenu(item.key)}
          className={cls("h-8 shrink-0 rounded-full border px-3 text-[12px] font-bold", activeMenu === item.key ? "border-[#004B78] bg-[#004B78] text-white" : "border-[#D9E1EA] bg-white text-[#004B78]")}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function PageShell({ children }) {
  return (
    <main className="min-h-screen bg-white pt-[58px] md:pl-[270px]">
      <div className="px-3 py-3 md:px-[22px] md:py-5">{children}</div>
    </main>
  );
}

function WorkPanel({ children }) {
  return <section className="rounded-xl border border-[#D9E1EA] bg-[#F6F8FA] p-2 shadow-sm md:rounded-[20px] md:p-4">{children}</section>;
}

function FilterPills({ items, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={cls(
            "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[12px] font-bold",
            active === item ? "border-[#004B78] bg-[#004B78] text-white" : "border-[#D9E1EA] bg-white text-[#5F7A99] hover:bg-[#F6F8FA]",
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function Toolbar({ search, setSearch, activeFilter, setActiveFilter, filters }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setActiveFilter(item.key)}
            className={cls(
              "h-8 rounded-full border px-3.5 text-[12px] font-bold",
              activeFilter === item.key ? "border-[#004B78] bg-[#004B78] text-white" : "border-[#D9E1EA] bg-white text-[#5F7A99] hover:bg-[#F6F8FA]",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="flex h-9 min-w-0 items-center gap-2 rounded-lg border border-[#D9E1EA] bg-white px-3 sm:w-[280px]">
          <Search className="h-4 w-4 text-[#9AAAC0]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nomor, nama, produk"
            className="h-full min-w-0 flex-1 border-0 bg-transparent text-[12px] text-[#041E42] outline-none placeholder:text-[#9AAAC0]"
          />
        </label>
        <button type="button" className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#D9E1EA] bg-white px-3 text-[12px] font-bold text-[#304B68] hover:bg-[#F6F8FA]">
          <SlidersHorizontal className="h-4 w-4" />
          Filter
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ children, tone }) {
  return <span className={cls("inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold", statusClass(tone))}>{children}</span>;
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-lg border border-[#D9E1EA] bg-white px-2.5 py-2 md:px-3 md:py-2.5">
      <div className="truncate text-[9px] font-bold uppercase tracking-[0.08em] text-[#9AAAC0] md:text-[10px] md:tracking-[0.16em]">{label}</div>
      <div className="mt-0.5 truncate text-[12px] font-bold text-[#041E42] md:mt-1 md:text-[13px]">{value || "-"}</div>
    </div>
  );
}

function SectionBox({ title, icon = Shield, children }) {
  const SectionIcon = icon;
  return (
    <div className="rounded-xl border border-[#D9E1EA] bg-white p-3">
      <div className="mb-2.5 flex items-center gap-2 text-[13px] font-bold text-[#041E42]">
        <SectionIcon className="h-4 w-4 text-[#004B78]" />
        {title}
      </div>
      {children}
    </div>
  );
}

function PageIntro({ title, description, action, tone = "light" }) {
  return (
    <div className={cls("rounded-xl border p-3 md:p-4", tone === "brand" ? "border-[#004B78] bg-[#004B78] text-white" : "border-[#D9E1EA] bg-white text-[#041E42]")}>
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-[17px] font-bold leading-6 md:text-[18px] md:leading-7">{title}</h1>
          <p className={cls("mt-1 max-w-3xl text-[12px] leading-5 md:text-[13px] md:leading-6", tone === "brand" ? "text-white/80" : "text-[#5F7A99]")}>{description}</p>
        </div>
        {action}
      </div>
    </div>
  );
}

function SmallActionCard({ icon = Shield, title, helper, onClick, tone = "default" }) {
  const Icon = icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cls(
        "rounded-lg border px-3 py-3 text-left transition hover:border-[#004B78]/60 hover:bg-[#F8FAFC]",
        tone === "brand" ? "border-[#B8D7EF] bg-[#F1F8FE]" : "border-[#D9E1EA] bg-white",
      )}
    >
      <Icon className="h-4 w-4 text-[#004B78]" />
      <div className="mt-2 text-[12px] font-bold text-[#041E42]">{title}</div>
      <div className="mt-1 text-[11px] leading-4 text-[#5F7A99]">{helper}</div>
    </button>
  );
}

function Timeline({ items }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={`${item.date}-${index}`} className="flex gap-3">
          <div className="mt-1 grid h-4 w-4 place-items-center rounded-full border-2 border-[#004B78] bg-white">
            <span className="h-1.5 w-1.5 rounded-full bg-[#004B78]" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#9AAAC0]">{item.date}</div>
            <div className="text-[12px] font-bold text-[#041E42]">{item.actor || "System"}</div>
            <div className="text-[12px] leading-5 text-[#5F7A99]">{item.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PolicyRow({ policy, selected, onClick, policyClaim, policyBilling, children }) {
  return (
    <div className={cls("overflow-hidden rounded-xl border bg-white transition", selected ? "border-[#004B78] shadow-[0_0_0_1px_#004B78]" : "border-[#D9E1EA]")}>
      <button type="button" onClick={onClick} className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-2 px-3 py-2.5 text-left hover:bg-[#F8FAFC] sm:gap-3 sm:px-4 sm:py-3 lg:grid-cols-[minmax(220px,1.4fr)_minmax(180px,1fr)_140px_150px_120px_32px] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="truncate text-[13px] font-bold text-[#041E42] md:text-[14px]">{policy.product}</div>
            <StatusBadge tone={policy.tone}>{policy.status}</StatusBadge>
          </div>
          <div className="mt-0.5 truncate text-[11px] text-[#5F7A99] md:mt-1 md:text-[12px]">{policy.policyNumber}</div>
        </div>
        <div className="hidden min-w-0 sm:block">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9AAAC0]">Objek</div>
          <div className="truncate text-[12px] font-semibold text-[#304B68]">{policy.objectName}</div>
        </div>
        <div className="hidden lg:block">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9AAAC0]">Akhir Polis</div>
          <div className="text-[12px] font-semibold text-[#304B68]">{policy.periodEnd}</div>
        </div>
        <div className="hidden lg:block">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9AAAC0]">Pertanggungan</div>
          <div className="text-[12px] font-semibold text-[#304B68]">Rp {formatRupiah(policy.insuredValue)}</div>
        </div>
        <div className="hidden flex-wrap gap-1.5 sm:flex">
          {policyClaim ? <StatusBadge tone={policyClaim.tone}>Klaim</StatusBadge> : null}
          {policyBilling ? <StatusBadge tone={policyBilling.tone}>Tagihan</StatusBadge> : null}
          {!policyClaim && !policyBilling ? <StatusBadge tone="default">Aman</StatusBadge> : null}
        </div>
        <div className="inline-flex items-center gap-1 self-start text-[11px] font-bold text-[#004B78] sm:self-auto md:text-[12px] lg:justify-self-end">
          <span className="hidden sm:inline">{selected ? "Tutup" : "Detail"}</span>
          <ChevronDown className={cls("h-4 w-4 text-[#5F7A99] transition", selected ? "rotate-180" : "")} />
        </div>
      </button>
      {selected ? <div className="border-t border-[#D9E1EA] bg-[#FBFCFD] p-2 md:p-3">{children}</div> : null}
    </div>
  );
}

function PoliciesView({ policies, claims, billingItems, selectedPolicyId, setSelectedPolicyId }) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const activePolicies = policies.filter((policy) => policy.status === "Aktif");
  const historicalPolicies = policies.filter((policy) => policy.status !== "Aktif");
  const keyword = search.trim().toLowerCase();
  const filteredPolicies = policies.filter((policy) => {
    const filterMatch = activeFilter === "all" || policy.status.toLowerCase() === activeFilter;
    const searchMatch = !keyword || [policy.policyNumber, policy.product, policy.objectName, policy.category].some((field) => String(field).toLowerCase().includes(keyword));
    return filterMatch && searchMatch;
  });
  const selectedPolicy = filteredPolicies.find((policy) => policy.id === selectedPolicyId);

  return (
    <WorkPanel>
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
        <PageIntro
          title="Polis yang Anda miliki"
          description="Lihat dulu semua perlindungan aktif dan riwayat polis Anda. Pilih salah satu polis untuk membuka dokumen, manfaat, panduan klaim, tagihan, atau tindak lanjut."
          action={
            <div className="grid grid-cols-3 gap-2 text-center">
              <InfoBox label="Aktif" value={activePolicies.length} />
              <InfoBox label="Riwayat" value={historicalPolicies.length} />
              <InfoBox label="Klaim" value={claims.filter((claim) => !claim.settled).length} />
            </div>
          }
        />
        <SectionBox title="Cari Polis" icon={Search}>
          <div className="space-y-3">
            <label className="flex h-9 min-w-0 items-center gap-2 rounded-lg border border-[#D9E1EA] bg-white px-3">
              <Search className="h-4 w-4 text-[#9AAAC0]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nomor polis, produk, objek"
                className="h-full min-w-0 flex-1 border-0 bg-transparent text-[12px] text-[#041E42] outline-none placeholder:text-[#9AAAC0]"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "Semua" },
                { key: "aktif", label: "Aktif" },
                { key: "berakhir", label: "Berakhir" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveFilter(item.key)}
                  className={cls(
                    "h-8 rounded-full border px-3.5 text-[12px] font-bold",
                    activeFilter === item.key ? "border-[#004B78] bg-[#004B78] text-white" : "border-[#D9E1EA] bg-white text-[#5F7A99] hover:bg-[#F8FAFC]",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </SectionBox>
      </div>

      <div className="mt-3">
        <SectionBox title="Daftar Polis" icon={Shield}>
          <div className="space-y-2">
            {filteredPolicies.map((policy) => {
              const rowClaim = claims.find((item) => item.policyId === policy.id && !item.settled);
              const rowBilling = billingItems.find((item) => item.policyId === policy.id);
              const rowTimeline = [
                { date: policy.periodStart || "-", actor: "System", text: "Polis diterbitkan dan tersedia di portal." },
                { date: policy.periodEnd || "-", actor: "System", text: policy.status === "Aktif" ? "Periode perlindungan berjalan." : "Periode polis sudah berakhir." },
              ];
              return (
                <PolicyRow
                  key={policy.id}
                  policy={policy}
                  selected={selectedPolicy?.id === policy.id}
                  policyClaim={rowClaim}
                  policyBilling={rowBilling}
                  onClick={() => setSelectedPolicyId(selectedPolicyId === policy.id ? "" : policy.id)}
                >
                  <div className="grid gap-2 md:gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-2 xl:grid-cols-4">
                      <InfoBox label="Nomor Polis" value={policy.policyNumber} />
                      <InfoBox label="Periode" value={`${policy.periodStart} - ${policy.periodEnd}`} />
                      <InfoBox label="Nilai Pertanggungan" value={`Rp ${formatRupiah(policy.insuredValue)}`} />
                      <InfoBox label="Premi Tahunan" value={`Rp ${formatRupiah(policy.annualPremium)}`} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className="h-9 rounded-lg bg-[#F2A62A] px-4 text-[12px] font-bold text-white hover:bg-[#DF9620]">Lihat Polis</button>
                        <button type="button" className="h-9 rounded-lg border border-[#D9E1EA] bg-white px-4 text-[12px] font-bold text-[#004B78] hover:bg-[#F8FAFC]">Ajukan Klaim</button>
                        <button type="button" className="h-9 rounded-lg border border-[#D9E1EA] bg-white px-4 text-[12px] font-bold text-[#004B78] hover:bg-[#F8FAFC]">Bantuan</button>
                      </div>
                      <div className="rounded-lg border border-[#D9E1EA] bg-white px-3 py-2 text-[12px] leading-5 text-[#5F7A99]">
                        {rowClaim ? rowClaim.nextAction : rowBilling ? rowBilling.helper : "Tidak ada klaim atau tagihan terbuka untuk polis ini."}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {policy.benefits.slice(0, 4).map((item) => (
                          <span key={item} className="rounded-full border border-[#D9E1EA] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#304B68]">{item}</span>
                        ))}
                      </div>
                    </div>
                    <details className="xl:col-span-2">
                      <summary className="cursor-pointer text-[12px] font-bold text-[#004B78]">Lihat dokumen, panduan, dan timeline</summary>
                      <div className="mt-2 grid gap-3 lg:grid-cols-3">
                        <SectionBox title="Dokumen" icon={FileText}>
                          <div className="grid gap-2">
                            {policy.documents.map((item) => (
                              <button key={item} type="button" className="rounded-md border border-[#D9E1EA] bg-white px-3 py-2 text-left text-[12px] font-bold text-[#004B78] hover:bg-[#EEF5FA]">{item}</button>
                            ))}
                          </div>
                        </SectionBox>
                        <SectionBox title="Panduan Klaim" icon={CheckCircle2}>
                          <div className="space-y-2">
                            {policy.claimChecklist.map((item) => (
                              <div key={item} className="rounded-md border border-[#D9E1EA] bg-white px-3 py-1.5 text-[12px] text-[#5F7A99]">{item}</div>
                            ))}
                          </div>
                        </SectionBox>
                        <SectionBox title="Timeline" icon={ClipboardList}>
                          <Timeline items={rowTimeline} />
                        </SectionBox>
                      </div>
                    </details>
                  </div>
                </PolicyRow>
              );
            })}
          </div>
        </SectionBox>
      </div>
    </WorkPanel>
  );
}

function ClaimRow({ claim, policy, selected, onClick, children }) {
  return (
    <div className={cls("overflow-hidden rounded-xl border bg-white transition", selected ? "border-[#004B78] shadow-[0_0_0_1px_#004B78]" : "border-[#D9E1EA]")}>
      <button type="button" onClick={onClick} className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-2 px-3 py-2.5 text-left hover:bg-[#F8FAFC] sm:gap-3 sm:px-4 sm:py-3 lg:grid-cols-[minmax(220px,1.3fr)_minmax(200px,1fr)_120px_140px_140px_32px] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="truncate text-[13px] font-bold text-[#041E42] md:text-[14px]">{claim.title}</div>
            <StatusBadge tone={claim.tone}>{claim.status}</StatusBadge>
          </div>
          <div className="mt-0.5 truncate text-[11px] text-[#5F7A99] md:mt-1 md:text-[12px]">{claim.id}</div>
        </div>
        <div className="hidden min-w-0 sm:block">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9AAAC0]">Polis</div>
          <div className="truncate text-[12px] font-semibold text-[#304B68]">{policy.product}</div>
        </div>
        <div className="hidden lg:block">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9AAAC0]">Kejadian</div>
          <div className="text-[12px] font-semibold text-[#304B68]">{claim.lossDate}</div>
        </div>
        <div className="hidden lg:block">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9AAAC0]">Nilai</div>
          <div className="text-[12px] font-semibold text-[#304B68]">{claim.amount}</div>
        </div>
        <div className="hidden text-[12px] font-semibold text-[#5F7A99] sm:block">{claim.dueLabel}</div>
        <div className="inline-flex items-center gap-1 self-start text-[11px] font-bold text-[#004B78] sm:self-auto md:text-[12px] lg:justify-self-end">
          <span className="hidden sm:inline">{selected ? "Tutup" : "Detail"}</span>
          <ChevronDown className={cls("h-4 w-4 text-[#5F7A99] transition", selected ? "rotate-180" : "")} />
        </div>
      </button>
      {selected ? <div className="border-t border-[#D9E1EA] bg-[#FBFCFD] p-2 md:p-3">{children}</div> : null}
    </div>
  );
}

function ClaimsView({ claims, policies }) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("open");
  const [selectedClaimId, setSelectedClaimId] = useState("");
  const openClaims = claims.filter((claim) => !claim.settled);
  const actionNeeded = openClaims.filter((claim) => claim.canUpload).length;
  const keyword = search.trim().toLowerCase();
  const filteredClaims = claims.filter((claim) => {
    const filterMatch = activeFilter === "all" || (activeFilter === "open" ? !claim.settled : claim.settled);
    const policy = findPolicy(policies, claim.policyId);
    const searchMatch = !keyword || [claim.id, claim.title, claim.status, policy.product, policy.policyNumber].some((field) => String(field).toLowerCase().includes(keyword));
    return filterMatch && searchMatch;
  });
  const selectedClaim = filteredClaims.find((claim) => claim.id === selectedClaimId);

  return (
    <div className="space-y-3">
      <PageIntro
        title="Klaim yang sedang dipantau"
        description="Lihat status klaim per laporan. Detail klaim fokus ke progres, dokumen yang diminta, dan update berikutnya."
      />

      <WorkPanel>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <InfoBox label="Semua" value={`${claims.length} klaim`} />
          <InfoBox label="Aktif" value={`${openClaims.length} klaim`} />
          <InfoBox label="Selesai" value={`${claims.filter((claim) => claim.settled).length} klaim`} />
          <InfoBox label="Perlu Tindakan" value={`${actionNeeded} item`} />
        </div>
      </WorkPanel>

      <WorkPanel>
        <Toolbar
          search={search}
          setSearch={setSearch}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          filters={[
            { key: "open", label: "Aktif" },
            { key: "settled", label: "Selesai" },
            { key: "all", label: "Semua" },
          ]}
        />
        <div className="mt-3">
        <SectionBox title="Daftar Klaim" icon={FileText}>
          <div className="space-y-2">
            {filteredClaims.map((claim) => {
              const rowPolicy = findPolicy(policies, claim.policyId);
              return (
                <ClaimRow
                  key={claim.id}
                  claim={claim}
                  policy={rowPolicy}
                  selected={selectedClaim?.id === claim.id}
                  onClick={() => setSelectedClaimId(selectedClaimId === claim.id ? "" : claim.id)}
                >
                  <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                      <InfoBox label="Tanggal Kejadian" value={claim.lossDate} />
                      <InfoBox label="Tanggal Lapor" value={claim.reportedDate} />
                      <InfoBox label="Estimasi Nilai" value={claim.amount} />
                      <InfoBox label="Petugas" value={claim.assignedTo} />
                    </div>
                    <div className="space-y-2">
                      <button type="button" className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#F2A62A] px-4 text-[12px] font-bold text-white hover:bg-[#DF9620]">
                        <Upload className="h-4 w-4" />
                        Unggah Dokumen
                      </button>
                      <div className={cls("rounded-md border px-3 py-2 text-[12px] leading-5", statusClass(claim.tone))}>{claim.nextAction}</div>
                      <div className="rounded-md border border-[#D9E1EA] bg-white px-3 py-2 text-[12px] leading-5 text-[#5F7A99]">E-polis tidak perlu dicetak untuk pengajuan klaim melalui portal.</div>
                      <div className="rounded-md border border-[#D9E1EA] bg-white px-3 py-2 text-[12px] leading-5 text-[#5F7A99]">{claim.nextUpdate}</div>
                    </div>
                    <details className="xl:col-span-2">
                      <summary className="cursor-pointer text-[12px] font-bold text-[#004B78]">Lihat timeline dan dokumen klaim</summary>
                      <div className="mt-2 grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <SectionBox title="Timeline Klaim" icon={ClipboardList}>
                          <Timeline items={claim.history.map((item) => ({ ...item, actor: "Jasindo" }))} />
                        </SectionBox>
                        <SectionBox title="Dokumen yang Diperlukan" icon={FileText}>
                          {claim.requiredDocs.length ? (
                            <div className="space-y-2">
                              {claim.requiredDocs.map((item) => (
                                <div key={item} className="rounded-md border border-[#D9E1EA] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#304B68]">{item}</div>
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-md border border-[#D9E1EA] bg-white px-3 py-2 text-[12px] text-[#5F7A99]">Belum ada dokumen tambahan yang diminta.</div>
                          )}
                        </SectionBox>
                      </div>
                    </details>
                  </div>
                </ClaimRow>
              );
            })}
          </div>
        </SectionBox>
        </div>
      </WorkPanel>
    </div>
  );
}

function DashboardMetric({ label, value, helper, tone = "default", icon = Shield }) {
  const Icon = icon;
  const toneClass = {
    success: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    warning: "bg-amber-50 text-amber-700 ring-amber-100",
    danger: "bg-rose-50 text-rose-700 ring-rose-100",
    default: "bg-[#EEF5FA] text-[#004B78] ring-blue-100",
  }[tone] || "bg-[#EEF5FA] text-[#004B78] ring-blue-100";

  return (
    <div className="rounded-lg border border-[#D9E1EA] bg-white p-2.5 md:rounded-xl md:p-4">
      <div className="flex items-start justify-between gap-2 md:gap-3">
        <div className="min-w-0">
          <div className="truncate text-[9px] font-bold uppercase tracking-[0.08em] text-[#9AAAC0] md:text-[11px] md:tracking-[0.14em]">{label}</div>
          <div className="mt-1 truncate text-[18px] font-bold tracking-tight text-[#041E42] md:mt-2 md:text-[26px]">{value}</div>
        </div>
        <div className={cls("grid h-7 w-7 shrink-0 place-items-center rounded-md ring-1 md:h-10 md:w-10 md:rounded-lg", toneClass)}>
          <Icon className="h-3.5 w-3.5 md:h-5 md:w-5" />
        </div>
      </div>
      <div className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#5F7A99] md:mt-2 md:text-[12px] md:leading-5">{helper}</div>
    </div>
  );
}

function DashboardAction({ title, helper, tone = "default", onClick, actionLabel }) {
  return (
    <div className={cls("rounded-xl border bg-white p-3", tone === "danger" ? "border-rose-200" : tone === "warning" ? "border-amber-200" : "border-[#D9E1EA]")}>
      <div className="flex items-start gap-3">
        <span className={cls("mt-0.5 h-2.5 w-2.5 rounded-full", tone === "danger" ? "bg-rose-500" : tone === "warning" ? "bg-amber-500" : "bg-emerald-500")} />
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-bold text-[#041E42]">{title}</div>
          <div className="mt-1 text-[12px] leading-5 text-[#5F7A99]">{helper}</div>
        </div>
        {onClick ? (
          <button type="button" onClick={onClick} className="shrink-0 rounded-md border border-[#D9E1EA] px-3 py-1.5 text-[11px] font-bold text-[#004B78] hover:bg-[#EEF5FA]">
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function DashboardView({ policies, claims, billingItems, setActiveMenu }) {
  const activePolicies = policies.filter((policy) => policy.status === "Aktif");
  const openClaims = claims.filter((claim) => !claim.settled);
  const totalPremium = activePolicies.reduce((sum, policy) => sum + Number(policy.annualPremium || 0), 0);
  const unpaidBills = billingItems.filter((item) => item.status !== "Lunas");
  const nearestPolicy = activePolicies[0];
  const mainAction = unpaidBills[0]
    ? {
        title: unpaidBills[0].title,
        helper: unpaidBills[0].helper,
        tone: unpaidBills[0].tone,
        actionLabel: "Bayar",
        onClick: () => setActiveMenu("cart"),
      }
    : openClaims[0]
      ? {
          title: openClaims[0].title,
          helper: openClaims[0].nextAction,
          tone: openClaims[0].tone,
          actionLabel: "Buka",
          onClick: () => setActiveMenu("claims"),
        }
      : {
          title: "Semua perlindungan utama aman",
          helper: "Tidak ada tagihan atau klaim yang membutuhkan tindakan segera.",
          tone: "success",
          actionLabel: "Polis",
          onClick: () => setActiveMenu("policies"),
        };

  return (
    <WorkPanel>
      <div className="grid gap-2 md:gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
        <PageIntro
          title="Ringkasan perlindungan Anda"
          description="Dashboard ini membantu Anda melihat hal yang aman, hal yang perlu ditindaklanjuti, dan jalur tercepat saat perlu dokumen, klaim, pembayaran, atau bantuan resmi."
          action={
            <button type="button" onClick={() => setActiveMenu("help")} className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#004B78] px-4 text-[12px] font-bold text-white hover:bg-[#003F65]">
              <Phone className="h-4 w-4" />
              Bantuan
            </button>
          }
        />
        <div className="rounded-xl border border-[#D9E1EA] bg-[#004B78] p-3 text-white md:p-5">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/70 md:text-[12px] md:tracking-[0.16em]">Prioritas Saat Ini</div>
          <div className="mt-2 text-[15px] font-bold md:mt-3 md:text-[18px]">{mainAction.title}</div>
          <div className="mt-1 text-[12px] leading-5 text-white/80 md:mt-2 md:text-[13px] md:leading-6">{mainAction.helper}</div>
          <button type="button" onClick={mainAction.onClick} className="mt-3 h-8 rounded-lg bg-white px-3 text-[11px] font-bold text-[#004B78] hover:bg-slate-100 md:mt-4 md:h-9 md:px-4 md:text-[12px]">
            {mainAction.actionLabel}
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 md:gap-3 xl:grid-cols-4">
        <DashboardMetric label="Perlindungan Aktif" value={activePolicies.length} helper="Polis yang masih memberi perlindungan." tone="success" icon={Shield} />
        <DashboardMetric label="Perlu Tindakan" value={unpaidBills.length + openClaims.filter((claim) => claim.canUpload).length} helper="Tagihan atau dokumen klaim yang perlu ditindaklanjuti." tone={unpaidBills.length ? "warning" : "default"} icon={Bell} />
        <DashboardMetric label="Klaim Aktif" value={openClaims.length} helper="Klaim berjalan dengan status dan tindak lanjut." tone={openClaims.length ? "warning" : "success"} icon={FileText} />
        <DashboardMetric label="Premi Aktif" value={`Rp ${formatRupiah(totalPremium)}`} helper="Total premi tahunan dari polis aktif." icon={CreditCard} />
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_380px]">
        <SectionBox title="Yang Perlu Anda Tahu" icon={ClipboardList}>
          <div className="grid gap-2">
            <DashboardAction {...mainAction} />
            <DashboardAction
              title={nearestPolicy ? `${nearestPolicy.product} berakhir ${nearestPolicy.periodEnd}` : "Belum ada polis aktif"}
              helper={nearestPolicy ? "Tanggal akhir polis ditampilkan agar perpanjangan tidak terlewat." : "Mulai dari menu produk untuk membeli perlindungan baru."}
              tone={nearestPolicy ? "default" : "warning"}
              actionLabel="Lihat"
              onClick={() => setActiveMenu("policies")}
            />
            <DashboardAction
              title={openClaims.length ? `${openClaims.length} klaim sedang berjalan` : "Tidak ada klaim aktif"}
              helper={openClaims.length ? "Buka Klaim Saya untuk melihat status, petugas, dokumen, dan update berikutnya." : "Saat terjadi kejadian, akses klaim tersedia dari menu Klaim Saya."}
              tone={openClaims.length ? "warning" : "success"}
              actionLabel="Klaim"
              onClick={() => setActiveMenu("claims")}
            />
          </div>
        </SectionBox>
        <div className="space-y-3">
          <SectionBox title="Akses Cepat" icon={Gauge}>
            <div className="grid grid-cols-2 gap-2">
              <SmallActionCard icon={Shield} title="E-polis" helper="Lihat dokumen" onClick={() => setActiveMenu("policies")} tone="brand" />
              <SmallActionCard icon={FileText} title="Klaim" helper="Pantau status" onClick={() => setActiveMenu("claims")} />
              <SmallActionCard icon={CreditCard} title="Pembayaran" helper="Tagihan aktif" onClick={() => setActiveMenu("cart")} />
              <SmallActionCard icon={Headphones} title="Call Center" helper="Kanal resmi" onClick={() => setActiveMenu("help")} />
            </div>
          </SectionBox>
          <SectionBox title="Cakupan Anda" icon={CheckCircle2}>
            <div className="space-y-2">
              {activePolicies.slice(0, 3).map((policy) => (
                <div key={policy.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#D9E1EA] bg-[#F8FAFC] px-3 py-2">
                  <div className="min-w-0">
                    <div className="truncate text-[12px] font-bold text-[#041E42]">{policy.product}</div>
                    <div className="truncate text-[11px] text-[#5F7A99]">{policy.objectName}</div>
                  </div>
                  <div className="shrink-0 text-[11px] font-bold text-[#5F7A99]">{policy.periodEnd}</div>
                </div>
              ))}
            </div>
          </SectionBox>
        </div>
      </div>
    </WorkPanel>
  );
}

function ProductLinkModal({ product, onClose }) {
  const [showQr, setShowQr] = useState(false);
  if (!product) return null;
  const cells = Array.from({ length: 81 }, (_, index) => index % 2 === 0 || index % 7 === 0 || [10, 16, 28, 35, 52, 64, 70].includes(index));
  const recipientName = "Rama Pratama";
  const trackedUrl = productTrackedUrl(product);
  const shareText = `Halo ${recipientName}, berikut link produk ${product.title} dari Asuransi Jasindo: ${trackedUrl}`;
  const mailSubject = `Link Produk ${product.title}`;
  const mailBody = `${shareText}\n\nSilakan buka link tersebut untuk melihat informasi produk dan melanjutkan proses sesuai kebutuhan.`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

  function downloadQrImage() {
    const canvas = document.createElement("canvas");
    const size = 420;
    const padding = 42;
    const cellCount = 9;
    const cellSize = (size - padding * 2) / cellCount;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = size;
    canvas.height = size;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    cells.forEach((cell, index) => {
      if (!cell) return;
      const x = padding + (index % cellCount) * cellSize;
      const y = padding + Math.floor(index / cellCount) * cellSize;
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(x, y, cellSize * 0.82, cellSize * 0.82);
    });
    ctx.fillStyle = "#004B7C";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("QR Link Produk", size / 2, size - 18);
    const slug = product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `qr-${slug}-${TOKEN}.png`;
    link.click();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-[#041E42]/55 p-3 md:place-items-center">
      <div className="w-full max-w-[640px] overflow-hidden rounded-[20px] border border-[#D9E1EA] bg-white shadow-2xl">
        <div className="bg-[#0E669D] px-5 py-5 text-white md:px-6 md:py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex rounded-full bg-white/15 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/90">Link Produk</div>
              <div className="mt-4 text-[23px] font-black leading-tight md:text-[28px]">Link produk siap dibagikan</div>
              <div className="mt-3 max-w-[520px] text-[13px] leading-6 text-white/90">
                Gunakan menu di bawah untuk membuka link produk atau membagikannya ke calon tertanggung melalui WhatsApp, email, tautan, atau QR.
              </div>
            </div>
            <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/15" aria-label="Tutup modal link produk">
              <span className="text-[24px] leading-none">×</span>
            </button>
          </div>
        </div>

        <div className="p-5 md:p-6">
          <div className="flex items-center gap-3 rounded-[16px] border border-[#D9E1EA] bg-[#F8FAFC] p-3.5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#004B78] text-white">
              <Shield className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="text-[14px] font-black leading-5 text-[#041E42]">{product.title}</div>
              <div className="mt-1 text-[12px] leading-5 text-[#5F7A99]">Penerima: <span className="font-bold text-[#304B68]">{recipientName}</span></div>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <a href={trackedUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center gap-3 rounded-xl bg-[#004B78] px-4 text-[14px] font-black text-white hover:bg-[#003F65]">
              <ExternalLink className="h-5 w-5" />
              Buka Link Produk
            </a>
            <div className="grid gap-3 md:grid-cols-2">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center gap-3 rounded-xl border border-[#D9E1EA] bg-white px-4 text-[13px] font-bold text-[#304B68] hover:bg-[#F8FAFC]">
                <MessageCircle className="h-5 w-5" />
                Kirim via WhatsApp
              </a>
              <a href={emailUrl} className="inline-flex h-11 items-center justify-center gap-3 rounded-xl border border-[#D9E1EA] bg-white px-4 text-[13px] font-bold text-[#304B68] hover:bg-[#F8FAFC]">
                <Mail className="h-5 w-5" />
                Kirim via Email
              </a>
              <button type="button" onClick={() => navigator.clipboard?.writeText(trackedUrl)} className="inline-flex h-11 items-center justify-center gap-3 rounded-xl border border-[#D9E1EA] bg-white px-4 text-[13px] font-bold text-[#304B68] hover:bg-[#F8FAFC]">
                <Copy className="h-5 w-5" />
                Salin Tautan
              </button>
              <button type="button" onClick={() => setShowQr((current) => !current)} className={cls("inline-flex h-11 items-center justify-center gap-3 rounded-xl border px-4 text-[13px] font-bold hover:bg-[#F8FAFC]", showQr ? "border-[#004B78] bg-[#EEF5FA] text-[#004B78]" : "border-[#D9E1EA] bg-white text-[#304B68]")}>
                <QrCode className="h-5 w-5" />
                Lihat Info QR
              </button>
            </div>
          </div>

          {showQr ? (
            <div className="mt-4 rounded-xl border border-[#D9E1EA] bg-[#F8FAFC] p-4 text-center">
              <div className="mx-auto grid h-40 w-40 grid-cols-9 gap-1 rounded-xl bg-white p-4 shadow-sm">
                {cells.map((cell, index) => <span key={index} className={cell ? "rounded-sm bg-slate-900" : "rounded-sm bg-white"} />)}
              </div>
              <div className="mt-3 text-[13px] font-bold text-[#004B78]">QR Link Produk</div>
              <div className="mt-1 text-[11px] text-[#5F7A99]">QR merepresentasikan URL produk dengan token tracking.</div>
              <button type="button" onClick={downloadQrImage} className="mt-3 h-9 rounded-lg bg-[#F2A62A] px-4 text-[12px] font-bold text-white hover:bg-[#DF9620]">Unduh QR</button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function HelpView({ contacts }) {
  const primaryContact = contacts[0] || DEFAULT_OFFICIAL_CONTACTS[0];
  const helpTopics = [
    { title: "Saya butuh polis", helper: "Lihat, unduh PDF, atau minta cetakan fisik polis.", icon: Shield },
    { title: "Saya ingin lapor klaim", helper: "Siapkan kronologi, tanggal kejadian, dan foto/dokumen awal.", icon: FileText },
    { title: "Pembayaran dan perpanjangan", helper: "Cek tagihan, jatuh tempo, dan metode pembayaran aktif.", icon: CreditCard },
    { title: "Perubahan data", helper: "Panduan bila ada perubahan kontak, objek, atau data tertanggung.", icon: ClipboardList },
  ];
  const faqs = [
    { question: "Di mana saya bisa melihat nomor polis dan periode perlindungan?", answer: "Buka Polis Saya, lalu pilih polis untuk melihat detail periode dan nomor polis." },
    { question: "Apakah polis elektronik wajib dicetak untuk klaim?", answer: "Tidak. E-polis yang tersedia di portal cukup untuk pengajuan klaim digital." },
    { question: "Bagaimana cara meminta cetakan polis fisik?", answer: "Buka detail polis, pilih Minta Cetakan, lalu konfirmasi alamat pengiriman." },
    { question: "Dokumen apa saja yang perlu disiapkan saat mengajukan klaim?", answer: "Dokumen mengikuti jenis klaim dan akan ditampilkan di detail Klaim Saya." },
    { question: "Bagaimana jika pembayaran perpanjangan belum masuk?", answer: "Cek Keranjang untuk status tagihan dan metode pembayaran yang tersedia." },
    { question: "Kapan saya perlu menghubungi call center?", answer: "Hubungi call center jika data polis tidak sesuai, klaim mendesak, atau pengiriman cetakan belum terupdate." },
  ];

  return (
    <div className="space-y-3">
      <PageIntro
        title="Bantuan dan Call Center"
        description="Satu tempat untuk memilih kebutuhan bantuan dan menghubungi kanal resmi Jasindo."
        action={
          <a href={primaryContact.href} className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#F2A62A] px-4 text-[12px] font-bold text-white hover:bg-[#DF9620]">
            <Phone className="h-4 w-4" />
            {primaryContact.value}
          </a>
        }
      />

      <WorkPanel>
        <div className="grid gap-2 md:grid-cols-3">
          {contacts.map((contact) => {
            const Icon = contact.icon || Phone;
            return (
              <a key={contact.label} href={contact.href} className="flex min-w-0 items-center gap-3 rounded-lg border border-[#D9E1EA] bg-white px-3 py-2.5 hover:border-[#004B78]/60">
                <Icon className="h-4 w-4 shrink-0 text-[#004B78]" />
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-bold text-[#041E42]">{contact.value}</div>
                  <div className="truncate text-[11px] text-[#5F7A99]">{contact.label} - {contact.helper}</div>
                </div>
              </a>
            );
          })}
        </div>
      </WorkPanel>

      <WorkPanel>
        <SectionBox title="Pilih Kebutuhan Bantuan" icon={Headphones}>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {helpTopics.map((topic) => (
              <SmallActionCard key={topic.title} icon={topic.icon} title={topic.title} helper={topic.helper} />
            ))}
          </div>
        </SectionBox>

        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {faqs.map((item) => (
            <button key={item.question} type="button" className="rounded-lg border border-[#D9E1EA] bg-white px-3 py-2.5 text-left hover:bg-[#EEF5FA]">
              <span className="block text-[12px] font-bold text-[#304B68]">{item.question}</span>
              <span className="mt-1 block text-[11px] leading-4 text-[#5F7A99]">{item.answer}</span>
            </button>
          ))}
        </div>

        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] leading-5 text-emerald-700">
          Simpan nomor polis dan foto kondisi objek pertanggungan. Saat klaim, dua hal ini biasanya mempercepat pengecekan awal.
        </div>
      </WorkPanel>
    </div>
  );
}

function CartView({ billingItems, policies }) {
  const payableItems = billingItems.filter((item) => item.status !== "Lunas");
  const totalPayable = payableItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const nextDue = payableItems[0];

  return (
    <div className="space-y-3">
      <PageIntro
        title="Keranjang pembayaran"
        description="Tagihan premi dan perpanjangan yang perlu diselesaikan agar perlindungan tetap berjalan."
        action={
          <button type="button" className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#F2A62A] px-4 text-[12px] font-bold text-white hover:bg-[#DF9620]" disabled={!payableItems.length}>
            <CreditCard className="h-4 w-4" />
            Bayar Semua
          </button>
        }
      />

      <WorkPanel>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <InfoBox label="Total Tagihan" value={`Rp ${formatRupiah(totalPayable)}`} />
          <InfoBox label="Tagihan Terbuka" value={`${payableItems.length} tagihan`} />
          <InfoBox label="Jatuh Tempo" value={nextDue?.dueDate || "Tidak ada"} />
          <InfoBox label="Metode Utama" value={nextDue?.method || "Belum ada"} />
        </div>
      </WorkPanel>

      <WorkPanel>
        <SectionBox title="Daftar Tagihan" icon={CreditCard}>
          <div className="space-y-2">
            {billingItems.map((item) => {
              const policy = findPolicy(policies, item.policyId);
              return (
                <div key={item.id} className="rounded-xl border border-[#D9E1EA] bg-white p-3">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
                        <StatusBadge tone="default">{item.id}</StatusBadge>
                      </div>
                      <div className="mt-2 text-[14px] font-bold text-[#041E42]">{item.title}</div>
                      <div className="mt-1 text-[12px] text-[#5F7A99]">{policy.product} - jatuh tempo {item.dueDate}</div>
                      <div className="mt-1 text-[12px] leading-5 text-[#5F7A99]">{item.helper}</div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 rounded-lg border border-[#D9E1EA] bg-[#F8FAFC] px-3 py-2">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9AAAC0]">Jumlah</div>
                        <div className="text-[15px] font-bold text-[#041E42]">Rp {formatRupiah(item.amount)}</div>
                      </div>
                      <button type="button" className="h-8 rounded-md bg-[#F2A62A] px-3 text-[12px] font-bold text-white hover:bg-[#DF9620]">Bayar</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionBox>

        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {["BCA Virtual Account", "Transfer bank", "Kartu tersimpan"].map((item, index) => (
            <div key={item} className={cls("rounded-lg border px-3 py-2.5", index === 0 ? "border-[#B8D7EF] bg-[#F1F8FE]" : "border-[#D9E1EA] bg-white")}>
              <div className="flex items-center gap-2 text-[12px] font-bold text-[#041E42]">
                <Wallet className="h-4 w-4 text-[#004B78]" />
                {item}
              </div>
              <div className="mt-1 text-[11px] text-[#5F7A99]">{index === 0 ? "Direkomendasikan untuk perpanjangan." : "Tersedia bila kanal pembayaran diaktifkan."}</div>
            </div>
          ))}
        </div>

        <div className={cls("mt-3 rounded-lg border px-3 py-2 text-[12px] leading-5", payableItems.length ? statusClass(nextDue?.tone) : "border-emerald-200 bg-emerald-50 text-emerald-700")}>
          {payableItems.length ? nextDue.helper : "Pembayaran aman. Tidak ada tagihan terbuka."}
        </div>
      </WorkPanel>
    </div>
  );
}

function FieldInput({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9AAAC0]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 h-10 w-full rounded-lg border border-[#D9E1EA] bg-white px-3 text-[13px] font-semibold text-[#041E42] outline-none transition placeholder:text-[#9AAAC0] focus:border-[#004B78] focus:ring-2 focus:ring-[#004B78]/10"
      />
    </label>
  );
}

function TextAreaInput({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9AAAC0]">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="mt-1 w-full rounded-lg border border-[#D9E1EA] bg-white px-3 py-2 text-[13px] font-semibold leading-6 text-[#041E42] outline-none transition placeholder:text-[#9AAAC0] focus:border-[#004B78] focus:ring-2 focus:ring-[#004B78]/10"
      />
    </label>
  );
}

function ToggleRow({ title, helper, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-[#D9E1EA] bg-[#F8FAFC] px-3 py-2.5">
      <span>
        <span className="block text-[12px] font-bold text-[#041E42]">{title}</span>
        <span className="mt-0.5 block text-[11px] leading-4 text-[#5F7A99]">{helper}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-[#D9E1EA] text-[#004B78]"
      />
    </label>
  );
}

function SettingsView({ sessionName }) {
  const [profile, setProfile] = useState({
    name: sessionName,
    phone: "0812-1797-0000",
    email: "portal@asuransijasindo.co.id",
    identityNumber: "3174********0001",
    birthDate: "1990-08-17",
    address: "Jl. Jenderal Sudirman Kav. 1, Jakarta Pusat",
    correspondenceAddress: "Sama dengan alamat utama",
    emergencyName: "Kontak Keluarga",
    emergencyPhone: "0813-0000-1797",
  });
  const [preferences, setPreferences] = useState({
    whatsapp: true,
    email: true,
    sms: false,
    renewal: true,
    claim: true,
    marketing: false,
  });

  const updateProfile = (key) => (value) => setProfile((prev) => ({ ...prev, [key]: value }));
  const updatePreference = (key) => (value) => setPreferences((prev) => ({ ...prev, [key]: value }));

  return (
    <WorkPanel>
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
        <PageIntro
          title="Setelan akun dan data tertanggung"
          description="Perbarui data kontak, alamat, preferensi notifikasi, dan informasi darurat agar polis, klaim, serta pengingat pembayaran tetap sampai ke kanal yang benar."
          action={
            <button type="button" className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#004B78] px-4 text-[12px] font-bold text-white hover:bg-[#003F65]">
              <CheckCircle2 className="h-4 w-4" />
              Simpan Perubahan
            </button>
          }
        />
        <div className="rounded-xl border border-[#B8D7EF] bg-[#F1F8FE] p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#004B78] text-[14px] font-bold text-white">{getInitials(profile.name)}</span>
            <div className="min-w-0">
              <div className="truncate text-[14px] font-bold text-[#041E42]">{profile.name}</div>
              <div className="truncate text-[12px] text-[#5F7A99]">{profile.email}</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <InfoBox label="Status" value="Terverifikasi" />
            <InfoBox label="Verifikasi" value="Aktif" />
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-3">
          <SectionBox title="Data Kontak" icon={User}>
            <div className="grid gap-3 md:grid-cols-2">
              <FieldInput label="Nama Pemegang Polis" value={profile.name} onChange={updateProfile("name")} />
              <FieldInput label="Nomor Identitas" value={profile.identityNumber} onChange={updateProfile("identityNumber")} />
              <FieldInput label="Nomor Handphone" value={profile.phone} onChange={updateProfile("phone")} />
              <FieldInput label="Email" type="email" value={profile.email} onChange={updateProfile("email")} />
              <FieldInput label="Tanggal Lahir" type="date" value={profile.birthDate} onChange={updateProfile("birthDate")} />
            </div>
          </SectionBox>

          <SectionBox title="Alamat" icon={MapPin}>
            <div className="grid gap-3 md:grid-cols-2">
              <TextAreaInput label="Alamat Utama" value={profile.address} onChange={updateProfile("address")} />
              <TextAreaInput label="Alamat Korespondensi" value={profile.correspondenceAddress} onChange={updateProfile("correspondenceAddress")} />
            </div>
          </SectionBox>

          <SectionBox title="Kontak Darurat" icon={Phone}>
            <div className="grid gap-3 md:grid-cols-2">
              <FieldInput label="Nama Kontak" value={profile.emergencyName} onChange={updateProfile("emergencyName")} />
              <FieldInput label="Nomor Handphone" value={profile.emergencyPhone} onChange={updateProfile("emergencyPhone")} />
            </div>
          </SectionBox>
        </div>

        <div className="space-y-3">
          <SectionBox title="Preferensi Notifikasi" icon={Bell}>
            <div className="space-y-2">
              <ToggleRow title="WhatsApp" helper="Pengingat polis, klaim, dan pembayaran." checked={preferences.whatsapp} onChange={updatePreference("whatsapp")} />
              <ToggleRow title="Email" helper="Dokumen, e-polis, dan ringkasan transaksi." checked={preferences.email} onChange={updatePreference("email")} />
              <ToggleRow title="SMS" helper="Fallback untuk kode dan informasi penting." checked={preferences.sms} onChange={updatePreference("sms")} />
              <ToggleRow title="Pengingat perpanjangan" helper="Pengingat sebelum polis berakhir." checked={preferences.renewal} onChange={updatePreference("renewal")} />
              <ToggleRow title="Notifikasi klaim" helper="Notifikasi ketika status klaim berubah." checked={preferences.claim} onChange={updatePreference("claim")} />
              <ToggleRow title="Info promosi" helper="Penawaran produk relevan dari Jasindo." checked={preferences.marketing} onChange={updatePreference("marketing")} />
            </div>
          </SectionBox>

          <SectionBox title="Keamanan Akun" icon={Lock}>
            <div className="space-y-2">
              <SmallActionCard icon={Lock} title="Ubah kata sandi" helper="Perbarui password akun portal." />
              <SmallActionCard icon={Shield} title="Verifikasi dua langkah" helper="Aktif untuk akses dan perubahan data sensitif." tone="brand" />
              <SmallActionCard icon={Mail} title="Riwayat perangkat" helper="Lihat perangkat terakhir yang mengakses akun." />
            </div>
          </SectionBox>
        </div>
      </div>
    </WorkPanel>
  );
}

function PolicyPrintRequestModal({ policy, onClose, onSubmit }) {
  const [form, setForm] = useState({
    recipient: "Dita",
    phone: "0812-1797-0000",
    deliveryAddress: "Jl. Jenderal Sudirman Kav. 1, Jakarta Pusat",
    note: "",
  });
  const updateForm = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-[#041E42]/35 p-3 md:place-items-center">
      <div className="w-full max-w-[520px] rounded-xl border border-[#D9E1EA] bg-white p-3 shadow-2xl md:p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[15px] font-bold text-[#041E42]">Minta Cetakan Polis</div>
            <div className="mt-1 text-[12px] leading-5 text-[#5F7A99]">{policy.product} - {policy.policyNumber}</div>
          </div>
          <button type="button" onClick={onClose} className="h-8 rounded-md border border-[#D9E1EA] px-3 text-[12px] font-bold text-[#304B68] hover:bg-[#F8FAFC]">
            Tutup
          </button>
        </div>

        <div className="mt-3 grid gap-3">
          <FieldInput label="Nama Penerima" value={form.recipient} onChange={updateForm("recipient")} />
          <FieldInput label="Nomor Handphone" value={form.phone} onChange={updateForm("phone")} />
          <TextAreaInput label="Alamat Pengiriman" value={form.deliveryAddress} onChange={updateForm("deliveryAddress")} />
          <TextAreaInput label="Catatan Pengiriman" value={form.note} onChange={updateForm("note")} placeholder="Contoh: kirim ke resepsionis kantor." />
        </div>

        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] leading-5 text-amber-800">
          Cetakan fisik akan dikirim ke alamat yang Anda konfirmasi. Biaya pengiriman dapat dikenakan sesuai ketentuan perusahaan.
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="h-9 rounded-md border border-[#D9E1EA] px-4 text-[12px] font-bold text-[#304B68] hover:bg-[#F8FAFC]">
            Batal
          </button>
          <button
            type="button"
            onClick={() => onSubmit(form)}
            className="h-9 rounded-md bg-[#004B78] px-4 text-[12px] font-bold text-white hover:bg-[#003F65]"
          >
            Kirim Permintaan
          </button>
        </div>
      </div>
    </div>
  );
}

function PoliciesViewV2({ policies, claims, billingItems, selectedPolicyId, setSelectedPolicyId }) {
  const [search, setSearch] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");
  const [printPolicy, setPrintPolicy] = useState(null);
  const [printRequests, setPrintRequests] = useState(DEFAULT_PRINT_REQUESTS);

  const policySummary = useMemo(() => {
    return {
      all: policies.length,
      aktif: policies.filter((policy) => policy.status === "Aktif").length,
      berakhir: policies.filter((policy) => policy.status === "Berakhir").length,
      tindakan: policies.filter(
        (policy) => policy.paymentStatus && policy.paymentStatus !== "Lunas" && policy.paymentStatus !== "Periode Berakhir",
      ).length,
    };
  }, [policies]);

  const statusFilters = POLICY_FILTERS.status.map((item) => ({
    key: item.key,
    label: `${item.label} ${item.key === "all" ? `(${policySummary.all})` : `(${policySummary[item.key]})`}`,
  }));

  const filteredPolicies = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return policies.filter((policy) => {
      if (activeStatusFilter !== "all" && policy.status.toLowerCase() !== POLICY_FILTERS.status.find((item) => item.key === activeStatusFilter)?.value?.toLowerCase()) {
        return false;
      }
      if (activeCategoryFilter !== "all" && policyCategory(policy) !== activeCategoryFilter) {
        return false;
      }
      if (!keyword) return true;
      return [policy.product, policy.objectName, policy.policyNumber].some((field) => String(field).toLowerCase().includes(keyword));
    });
  }, [activeCategoryFilter, activeStatusFilter, policies, search]);

  return (
    <div className="space-y-3">
      <PageIntro
        title="Polis yang Anda miliki"
        description="Mulai dari daftar polis dulu, lalu buka detailnya jika butuh e-polis, dokumen, manfaat, atau tagihan."
      />

      <WorkPanel>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <InfoBox label="Semua" value={`${policySummary.all} polis`} />
          <InfoBox label="Aktif" value={`${policySummary.aktif} polis`} />
          <InfoBox label="Berakhir" value={`${policySummary.berakhir} polis`} />
          <InfoBox label="Perlu Tindakan" value={`${policySummary.tindakan} item`} />
        </div>
      </WorkPanel>

      <WorkPanel>
        <Toolbar
          search={search}
          setSearch={setSearch}
          activeFilter={activeStatusFilter}
          setActiveFilter={setActiveStatusFilter}
          filters={statusFilters}
        />
        <PolicyCategoryFilters activeCategory={activeCategoryFilter} onChange={setActiveCategoryFilter} />
        <div className="mt-3 space-y-2">
          {filteredPolicies.length ? (
            filteredPolicies.map((policy) => {
              const policyClaim = claims.find((item) => item.policyId === policy.id);
              const policyBilling = billingItems.find((item) => item.policyId === policy.id);
              const policyPrintRequests = printRequests.filter((item) => item.policyId === policy.id);
              return (
                <PolicyRow
                  key={policy.id}
                  policy={policy}
                  selected={selectedPolicyId === policy.id}
                  policyClaim={policyClaim}
                  policyBilling={policyBilling}
                  onClick={() => setSelectedPolicyId(selectedPolicyId === policy.id ? "" : policy.id)}
                >
                  <div className="space-y-2 md:space-y-3">
                    <div className="grid gap-2 md:gap-3 lg:grid-cols-[minmax(0,1fr)_230px]">
                      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
                        <InfoBox label="Periode" value={`${policy.periodStart} - ${policy.periodEnd}`} />
                        <InfoBox label="Premi Tahunan" value={`Rp ${formatRupiah(policy.annualPremium)}`} />
                        <InfoBox label="Status Bayar" value={policy.paymentStatus} />
                        <InfoBox label="Manfaat Utama" value={policy.benefits.slice(0, 2).join(", ")} />
                      </div>
                      <div className="rounded-xl border border-[#D9E1EA] bg-white p-2.5">
                        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9AAAC0]">Aksi cepat</div>
                        <div className="mt-2 grid gap-2">
                          <button type="button" className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-[#004B78] px-3 text-[12px] font-bold text-white hover:bg-[#003F65]">
                            <FileText className="h-4 w-4" />
                            Lihat Polis
                          </button>
                          <button type="button" className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-[#EEF5FA] px-3 text-[12px] font-bold text-[#304B68] hover:bg-[#E1EEFA]">
                            <Download className="h-4 w-4" />
                            Unduh PDF
                          </button>
                          <button type="button" onClick={() => setPrintPolicy(policy)} className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-[#D9E1EA] bg-white px-3 text-[12px] font-bold text-[#304B68] hover:bg-[#F8FAFC]">
                            <Printer className="h-4 w-4" />
                            Minta Cetakan
                          </button>
                          <button type="button" className="inline-flex h-9 w-full items-center justify-center rounded-md border border-[#D9E1EA] px-3 text-[12px] font-bold text-[#304B68] hover:bg-[#F8FAFC]">
                            {policyClaim ? "Lihat klaim" : "Ajukan klaim"}
                          </button>
                        </div>
                        <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11px] leading-4 text-amber-800">
                          Cetakan fisik dapat dikirim ke alamat terdaftar. Biaya pengiriman dapat dikenakan.
                        </div>
                      </div>
                    </div>
                    <details className="rounded-xl border border-[#D9E1EA] bg-white p-3">
                      <summary className="cursor-pointer text-[12px] font-bold text-[#004B78]">Dokumen dan status polis</summary>
                      <div className="mt-2 space-y-1 text-[12px] leading-5 text-[#5F7A99]">
                        <div>Dokumen tersedia: {policy.documents.join(", ")}</div>
                        <div>Polis elektronik dapat dilihat, diunduh, atau dicetak sendiri dari portal ini.</div>
                        {policyClaim ? <div>Klaim terkait: {policyClaim.status}</div> : null}
                        {policyBilling ? <div>Tagihan terkait: {policyBilling.title} - {policyBilling.status}</div> : null}
                        {policyPrintRequests.length ? (
                          <div className="mt-2 space-y-1">
                            {policyPrintRequests.map((request) => (
                              <div key={request.id} className="rounded-md border border-[#D9E1EA] bg-[#F8FAFC] px-3 py-2">
                                <div className="font-bold text-[#041E42]">Permintaan cetakan: {request.status}</div>
                                <div>{request.requestedAt} - {request.deliveryAddress}</div>
                                <div>{request.helper}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div>Belum ada permintaan cetakan polis.</div>
                        )}
                      </div>
                    </details>
                  </div>
                </PolicyRow>
              );
            })
          ) : (
            <div className="rounded-xl border border-dashed border-[#D9E1EA] bg-white px-4 py-6 text-center text-[12px] text-[#5F7A99]">
              Tidak ada polis yang cocok dengan filter ini.
            </div>
          )}
        </div>
      </WorkPanel>
      {printPolicy ? (
        <PolicyPrintRequestModal
          policy={printPolicy}
          onClose={() => setPrintPolicy(null)}
          onSubmit={(form) => {
            setPrintRequests((prev) => [
              {
                id: `PRN-${Date.now().toString().slice(-8)}`,
                policyId: printPolicy.id,
                requestedAt: "Hari ini",
                status: "Diproses",
                deliveryAddress: form.deliveryAddress,
                helper: "Permintaan diterima. Tim layanan akan memproses cetakan polis dan mengirimkan update ke kontak terdaftar.",
              },
              ...prev,
            ]);
            setPrintPolicy(null);
          }}
        />
      ) : null}
    </div>
  );
}

export default function StaffWorkspacePortal({
  sessionName = "Budi Santoso",
  onGoHome,
  onExit,
  defaultTab = "dashboard",
}) {
  const staffSessionName = sessionName;
  const [activeMenu, setActiveMenu] = useState(() => readPortalMenu(defaultTab));
  const [linkProduct, setLinkProduct] = useState(null);
  const availableNavItems = STAFF_NAV_ITEMS;
  const handleMenuChange = useCallback((nextMenu) => {
    const normalizedMenu = normalizePortalMenu(nextMenu);
    setActiveMenu(normalizedMenu);
    writePortalMenu(normalizedMenu);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    replacePortalMenu(readPortalMenu(defaultTab));
    const handlePopState = () => {
      setActiveMenu(readPortalMenu(defaultTab));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [defaultTab]);

  const content = useMemo(() => {
    if (activeMenu === "dashboard") return <DashboardMenu />;
    if (activeMenu === "tasklist") return <TasklistMenu />;
    if (activeMenu === "buat-penawaran") return <OfferMenu onLink={setLinkProduct} />;
    if (activeMenu === "add-partner") return <AddPartnerMenu />;
    if (activeMenu === "promotion") return <PromotionMenu />;
    if (activeMenu === "transaksi-polis") return <TransactionsMenu />;
    if (activeMenu === "riwayat-klaim") return <ClaimsMenu />;
    if (activeMenu === "add-user") return <AddUserMenu />;
    if (activeMenu === "master-data") return <MasterDataMenu />;
    if (activeMenu === "settings") return <SettingsMenu sessionName={staffSessionName} />;
    return <DashboardMenu />;
  }, [activeMenu, staffSessionName]);

  return (
    <div className="min-h-screen bg-white text-[#041E42]" style={{ fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
      <TopBar sessionName={staffSessionName} onGoHome={onGoHome} onExit={onExit} />
      <Sidebar activeMenu={activeMenu} setActiveMenu={handleMenuChange} navItems={availableNavItems} />
      <PageShell>
        <WorkspaceFilters activeMenu={activeMenu} setActiveMenu={handleMenuChange} navItems={availableNavItems} />
        {content}
      </PageShell>
      <ProductLinkModal product={linkProduct} onClose={() => setLinkProduct(null)} />
    </div>
  );
}
