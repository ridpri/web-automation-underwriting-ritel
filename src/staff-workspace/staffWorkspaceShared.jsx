import React, { useState } from "react";
import {
  Bell,
  Bike,
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

const TOKEN = "tk8f3x9q2m";
const BASE_URL = "https://esppa.asuransijasindo.co.id/product";
const PRODUCTION_ASSETS = {
  danantara: "/production-assets/danantara.57629308.png",
  jasindoWhite: "/production-assets/jasindo-white-all.814f5299.png",
};

const STAFF_NAV_ITEMS = [
  { key: "dashboard", slug: "dashboard", label: "Dashboard", icon: Gauge },
  { key: "tasklist", slug: "tasklist", label: "Tasklist", icon: ClipboardList, badge: 5 },
  { key: "buat-penawaran", slug: "buat-penawaran", label: "Penawaran", icon: ShoppingCart },
  { key: "add-partner", slug: "add-partner", label: "Add Partner", icon: User },
  { key: "promotion", slug: "promotion", label: "Promosi", icon: CreditCard },
  { key: "transaksi-polis", slug: "transaksi-polis", label: "Transaksi Polis", icon: Shield },
  { key: "riwayat-klaim", slug: "riwayat-klaim", label: "Riwayat Klaim", icon: FileText },
  { key: "add-user", slug: "add-user", label: "Add User", icon: User },
  { key: "master-data", slug: "master-data", label: "Master Data", icon: Settings },
  { key: "settings", slug: "setelan", label: "Setelan", icon: Settings },
];
const PRODUCT_IMAGES = {
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

const PRODUCTS = [
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

const TASKS = [
  { name: "Rina Maharani", email: "rina.maharani@email.com", product: "Asuransi Mobil - Total Loss", pipeline: "Menunggu Data", detail: "Butuh Assist Internal", owner: "Maker", sla: "Hari ini", action: "Lanjutkan Pengisian", avatar: "RM" },
  { name: "Rizky Pratama", email: "rizky.pratama@email.com", product: "Asuransi Mobil - Komprehensif", pipeline: "Menunggu Data", detail: "Menunggu Data Nasabah", owner: "Nasabah", sla: "1 hari lagi", action: "Kirim Reminder", avatar: "RP" },
  { name: "PT Sinar Jaya", email: "admin@sinarjaya.co.id", product: "Property All Risk", pipeline: "Menunggu Data", detail: "Validasi Data Internal", owner: "Checker", sla: "2 hari lagi", action: "Review Data", avatar: "SJ" },
  { name: "Dewi Lestari", email: "dewi.lestari@email.com", product: "Travel Safe", pipeline: "Menunggu Bayar", detail: "Menunggu Pembayaran Nasabah", owner: "Nasabah", sla: "Hari ini", action: "Konfirmasi Bayar", avatar: "DL" },
  { name: "Andi Wijaya", email: "andi.wijaya@email.com", product: "Life Guard", pipeline: "Penawaran Dikirim", detail: "Menunggu Persetujuan Penawaran", owner: "Nasabah", sla: "1 hari lagi", action: "Follow Up", avatar: "AW" },
];

const PROMOS = [
  { code: "TESDIS2", products: "Travel Safe, Life Guard", discount: "20%", quota: 100, period: "18-05-2026 - 20-05-2026", status: "Aktif" },
  { code: "JASINDO20", products: "Asuransi Mobil - Total Loss", discount: "20%", quota: 100, period: "27-04-2026 - 15-05-2026", status: "Aktif" },
  { code: "GEBYARJASINDO", products: "Trip Guard, Edu Protect", discount: "10%", quota: 100, period: "27-04-2026 - 30-04-2026", status: "Aktif" },
  { code: "TESDIS3", products: "Property All Risk", discount: "Rp 10.000", quota: 50, period: "23-04-2026 - 30-04-2026", status: "Aktif" },
  { code: "TESDIS1", products: "Asuransi Kebakaran", discount: "10%", quota: 10, period: "23-04-2026 - 24-04-2026", status: "Tidak Aktif" },
  { code: "TESTDISKONDUA", products: "Asuransi Mobil - Komprehensif", discount: "3%", quota: 100, period: "13-04-2026 - 28-04-2026", status: "Aktif" },
  { code: "TESTDISKON", products: "Asuransi Sepeda Motor - Total Loss", discount: "5%", quota: 100, period: "13-04-2026 - 30-04-2026", status: "Aktif" },
];

const TRANSACTIONS = [
  { title: "Budi Santoso", sub: "Asuransi Mobil - TLO", value: "Rp 5.250.000", status: "Terbit" },
  { title: "Siti Rahmawati", sub: "Travel Safe", value: "Rp 245.000", status: "Terbit" },
  { title: "PT Maju Bersama", sub: "Property All Risk", value: "Rp 12.000.000", status: "Terbit" },
  { title: "Andi Wijaya", sub: "Life Guard", value: "Rp 350.000", status: "Menunggu Bayar" },
];

const STAFF_CLAIMS = [
  { title: "Baru Diajukan", sub: "Status klaim", value: "12", status: "Aktif" },
  { title: "Dalam Proses", sub: "Status klaim", value: "9", status: "Aktif" },
  { title: "Menunggu Dokumen", sub: "Status klaim", value: "5", status: "Aktif" },
  { title: "Disetujui", sub: "Status klaim", value: "7", status: "Aktif" },
  { title: "Ditolak", sub: "Status klaim", value: "1", status: "Tidak Aktif" },
];

function cls(...classes) {
  return classes.filter(Boolean).join(" ");
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
    return `${startDate.getDate()}------------------${endDate.getDate()} ${endDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`;
  }
  return `${startDate.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} ------------------ ${endDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`;
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

function statusClass(tone = "default") {
  const tones = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    danger: "border-rose-200 bg-rose-50 text-rose-700",
    default: "border-[#D9E1EA] bg-[#F6F8FA] text-[#5F7A99]",
  };
  return tones[tone] || tones.default;
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

function StaffBadge({ children }) {
  return <StatusBadge tone={staffStatusTone(children)}>{children}</StatusBadge>;
}

function StaffStat({ icon = Shield, title, value, note }) {
  const Icon = icon;
  return (
    <div className="rounded-xl border border-[#D9E1EA] bg-white p-3 md:p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#EEF5FA] text-[#004B78]">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[12px] font-bold text-[#304B68]">{title}</div>
          <div className="mt-1 text-[24px] font-bold leading-none text-[#041E42]">{value}</div>
          <div className="mt-1 text-[11px] leading-4 text-[#5F7A99]">{note}</div>
        </div>
      </div>
    </div>
  );
}

function StaffTaskTable({ rows, title }) {
  return (
    <SectionBox title={title} icon={ClipboardList}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-[#FFF4D6] px-3 py-1 text-[11px] font-bold text-[#A86D00]">{rows.length} Ditampilkan</span>
        <button type="button" className="rounded-md border border-[#D9E1EA] px-3 py-1.5 text-[11px] font-bold text-[#004B78] hover:bg-[#EEF5FA]">Lihat Semua ---------- --------</button>
      </div>
      <div className="overflow-auto rounded-xl border border-[#D9E1EA] bg-white">
        <table className="w-full min-w-[980px] text-left text-[12px]">
          <thead className="bg-[#EEF5FA] text-[10px] uppercase tracking-[0.12em] text-[#004B78]">
            <tr>
              <th className="px-3 py-3">Nasabah</th>
              <th className="px-3 py-3">Produk</th>
              <th className="px-3 py-3">Pipeline</th>
              <th className="px-3 py-3">Detail Status</th>
              <th className="px-3 py-3">Action Owner</th>
              <th className="px-3 py-3">SLA</th>
              <th className="px-3 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7EDF4]">
            {rows.map((row) => (
              <tr key={row.email} className="hover:bg-[#F8FAFC]">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#EEF5FA] text-[11px] font-black text-[#004B78]">{row.avatar}</div>
                    <div className="min-w-0">
                      <div className="truncate font-bold text-[#041E42]">{row.name}</div>
                      <div className="truncate text-[11px] text-[#5F7A99]">{row.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 font-semibold text-[#304B68]">{row.product}</td>
                <td className="px-3 py-3"><StaffBadge>{row.pipeline}</StaffBadge></td>
                <td className="px-3 py-3"><StaffBadge>{row.detail}</StaffBadge></td>
                <td className="px-3 py-3"><StaffBadge>{row.owner}</StaffBadge></td>
                <td className="px-3 py-3 font-bold text-rose-600">{row.sla}</td>
                <td className="px-3 py-3">
                  <button type="button" className={cls("rounded-md px-3 py-1.5 text-[11px] font-bold", row.detail === "Butuh Assist Internal" ? "bg-[#F2A62A] text-white" : "border border-[#D9E1EA] bg-white text-[#004B78] hover:bg-[#EEF5FA]")}>
                    {row.action}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionBox>
  );
}

function StaffPipeline() {
  const [showFilter, setShowFilter] = useState(false);
  const [start, setStart] = useState("2026-05-12");
  const [end, setEnd] = useState("2026-05-18");
  const [appliedStart, setAppliedStart] = useState("2026-05-12");
  const [appliedEnd, setAppliedEnd] = useState("2026-05-18");
  const [error, setError] = useState("");
  const steps = [
    { label: "Penawaran Dikirim", value: 42, icon: Mail, note: "Penawaran sudah dikirim ke calon nasabah.", tone: "default" },
    { label: "Menunggu Data", value: 21, icon: FileText, note: "Data atau dokumen belum selesai dipenuhi.", tone: "warning" },
    { label: "Menunggu Bayar", value: 15, icon: CreditCard, note: "Nasabah belum menyelesaikan pembayaran.", tone: "warning" },
    { label: "Polis Terbit", value: 10, icon: CheckCircle2, note: "Pembayaran selesai dan polis sudah terbit.", tone: "success" },
  ];
  const breakdown = [
    { label: "Menunggu Data Nasabah", value: 12, owner: "Nasabah", icon: User, note: "Nasabah belum melengkapi data/dokumen." },
    { label: "Butuh Assist Internal", value: 5, owner: "Maker", icon: Headphones, note: "Nasabah setuju premi dan minta dibantu input data." },
    { label: "Validasi Data Internal", value: 4, owner: "Checker", icon: Shield, note: "Data sudah masuk dan sedang dicek internal." },
  ];

  function applyRange() {
    if (new Date(start) > new Date(end)) {
      setError("Tanggal mulai tidak boleh melebihi tanggal akhir.");
      return;
    }
    setAppliedStart(start);
    setAppliedEnd(end);
    setError("");
    setShowFilter(false);
  }

  function resetRange() {
    setStart("2026-05-12");
    setEnd("2026-05-18");
    setAppliedStart("2026-05-12");
    setAppliedEnd("2026-05-18");
    setError("");
    setShowFilter(false);
  }

  return (
    <SectionBox title="Pipeline Pendampingan Nasabah" icon={Gauge}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-[12px] leading-5 text-[#5F7A99]">Periode data pipeline --------- status dibedakan berdasarkan warna dan icon</div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-[#EEF5FA] px-3 py-2 text-[11px] font-bold text-[#004B78]">{formatRange(appliedStart, appliedEnd)}</span>
          <button type="button" onClick={() => setShowFilter((current) => !current)} className="h-9 rounded-lg border border-[#D9E1EA] bg-white px-3 text-[12px] font-bold text-[#304B68] hover:bg-[#F8FAFC]">Pilih Tanggal</button>
        </div>
      </div>
      {showFilter ? (
        <div className="mt-3 rounded-xl border border-[#D9E1EA] bg-[#F8FAFC] p-3">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
            <FieldInput label="Tanggal Mulai" type="date" value={start} onChange={setStart} />
            <FieldInput label="Tanggal Akhir" type="date" value={end} onChange={setEnd} />
            <button type="button" onClick={applyRange} className="h-10 rounded-lg bg-[#F2A62A] px-4 text-[12px] font-bold text-white">Terapkan</button>
            <button type="button" onClick={resetRange} className="h-10 rounded-lg border border-[#D9E1EA] bg-white px-4 text-[12px] font-bold text-[#304B68]">Reset</button>
          </div>
          {error ? <div className="mt-2 text-[12px] font-bold text-rose-600">{error}</div> : null}
        </div>
      ) : null}
      <div className="mt-4 grid gap-2 md:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.label} className={cls("rounded-xl border p-3 text-center", statusClass(step.tone))}>
              <div className="mx-auto grid h-10 w-10 place-items-center rounded-full border bg-white">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mx-auto mt-2 grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-bold">{index + 1}</div>
              <div className="mt-2 text-[12px] font-bold text-[#304B68]">{step.label}</div>
              <div className="mt-1 text-[26px] font-bold">{step.value}</div>
              <div className="mt-1 text-[11px] leading-4 text-[#5F7A99]">{step.note}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 rounded-xl border border-[#D9E1EA] bg-white p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-[13px] font-bold text-[#004B78]">Rincian Menunggu Data</div>
            <div className="mt-1 text-[11px] text-[#5F7A99]">Dibedakan berdasarkan pihak yang harus melakukan tindak lanjut.</div>
          </div>
          <span className="rounded-full bg-[#FFF4D6] px-3 py-1 text-[11px] font-bold text-[#A86D00]">Total 21</span>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {breakdown.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className={cls("rounded-xl border p-3", statusClass(staffStatusTone(item.label)))}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[12px] font-bold text-[#041E42]">{item.label}</div>
                      <div className="mt-1 text-[11px] leading-4 text-[#5F7A99]">{item.note}</div>
                    </div>
                  </div>
                  <div className="text-[22px] font-bold">{item.value}</div>
                </div>
                <div className="mt-2"><StaffBadge>Owner: {item.owner}</StaffBadge></div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-3 text-[12px] text-[#5F7A99]">Rasio polis terbit: <b>23,8%</b> dari 42 penawaran dikirim</div>
    </SectionBox>
  );
}

function StaffDashboardView() {
  const [activeFilter, setActiveFilter] = useState("Semua");
  const dashboardFilters = ["Semua", "Penawaran", "Tasklist", "Transaksi Polis", "Klaim"];
  const showOverview = activeFilter === "Semua" || activeFilter === "Penawaran";
  const showTasklist = activeFilter === "Semua" || activeFilter === "Tasklist";
  const showPipeline = activeFilter === "Semua" || activeFilter === "Transaksi Polis";
  return (
    <div className="space-y-3">
      <PageIntro
        title="Dashboard"
        description="Ringkasan aktivitas penawaran, tasklist, transaksi polis, dan monitoring klaim."
        action={<span className="rounded-lg bg-[#EEF5FA] px-3 py-2 text-[11px] font-bold text-[#004B78]">Data diperbarui: 18 Mei 2026 09:30 WIB</span>}
      />
      <FilterPills items={dashboardFilters} active={activeFilter} onChange={setActiveFilter} />
      {showOverview ? (
        <WorkPanel>
          <div className="rounded-xl border border-[#004B78] bg-[#004B78] p-4 text-white md:p-5">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">Portal Web Automation Flow Internal</div>
          <div className="mt-2 text-[22px] font-bold leading-tight md:text-[26px]">Dashboard Monitoring Aktivitas Staff</div>
            <div className="mt-2 max-w-3xl text-[13px] leading-6 text-white/85">Pantau assisted selling, penawaran, assist pengisian data, pembayaran, penerbitan polis, dan tindak lanjut klaim.</div>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            <StaffStat icon={ShoppingCart} title="Penawaran Hari Ini" value="24" note="4 menunggu respons nasabah" />
            <StaffStat icon={ClipboardList} title="Tasklist Aktif" value="5" note="1 butuh assist internal" />
            <StaffStat icon={CheckCircle2} title="Transaksi Polis" value="18" note="10 polis sudah terbit" />
            <StaffStat icon={FileText} title="Klaim Dipantau" value="9" note="2 butuh tindak lanjut" />
          </div>
        </WorkPanel>
      ) : null}
      {showPipeline ? (
        <WorkPanel>
          <StaffPipeline />
        </WorkPanel>
      ) : null}
      {showTasklist || activeFilter === "Klaim" ? (
        <WorkPanel>
          <StaffTaskTable rows={activeFilter === "Klaim" ? TASKS.filter((item) => item.product.includes("Travel") || item.product.includes("Life")) : TASKS} title={activeFilter === "Klaim" ? "Task Klaim Terkait" : "Tasklist Prioritas"} />
        </WorkPanel>
      ) : null}
    </div>
  );
}

function ProductCategoryIcon({ category }) {
  const iconMap = {
    "Kecelakaan Diri": User,
    "Harta Benda": Home,
    Kendaraan: Car,
  };
  const Icon = iconMap[category] || FileText;
  return <Icon className="production-product-card__tag-icon" aria-hidden="true" />;
}

function ProductCard({ product, onLink }) {
  return (
    <button type="button" onClick={() => onLink(product)} className="production-product-card block">
      <img src={product.image} alt="" width="640" height="720" loading="lazy" decoding="async" className="production-product-card__image" />
      <span className="production-product-card__shade" />
      <span className="production-product-card__tag">
        <ProductCategoryIcon category={product.category} />
        <span>{product.category}</span>
      </span>
      <span className="production-product-card__title">{product.title}</span>
    </button>
  );
}

function ProductListItem({ product, onLink }) {
  return (
    <div className="grid gap-3 rounded-xl border border-[#D9E1EA] bg-white p-3 transition hover:border-[#004B78]/50 hover:bg-[#F8FAFC] md:grid-cols-[150px_minmax(0,1fr)_260px] md:items-center">
      <img src={product.image} alt={product.title} className="h-[120px] w-full rounded-lg object-cover md:h-[96px]" loading="lazy" />
      <div className="min-w-0">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF5FA] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#004B78]">
          <ProductCategoryIcon category={product.category} />
          {product.category}
        </div>
        <div className="mt-2 text-[14px] font-bold leading-5 text-[#041E42] md:text-[15px]">{product.title}</div>
        <div className="mt-1 text-[12px] leading-5 text-[#5F7A99]">{product.desc}</div>
      </div>
      <button type="button" onClick={() => onLink(product)} className="h-9 rounded-lg border border-[#D9E1EA] bg-white px-3 text-[12px] font-bold text-[#004B78] hover:bg-[#EEF5FA]">Bagikan Link</button>
    </div>
  );
}

function OfferProductsView({ onLink }) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState("card");
  const categories = [
    { key: "all", label: "Semua", icon: ClipboardList },
    { key: "properti", label: "Properti", icon: Home },
    { key: "mobil", label: "Mobil", icon: Car },
    { key: "motor", label: "Motor", icon: Bike },
    { key: "personal", label: "Personal", icon: User },
    { key: "lainnya", label: "Lainnya", icon: FileText },
  ];
  const matchesCategory = (product) => {
    if (category === "all") return true;
    if (category === "properti") return product.category === "Harta Benda";
    if (category === "personal") return product.category === "Kecelakaan Diri";
    if (category === "motor") return /sepeda motor/i.test(product.title);
    if (category === "mobil") return /mobil/i.test(product.title);
    return false;
  };
  const filteredProducts = PRODUCTS.filter((product) => {
    const keyword = query.toLowerCase();
    return matchesCategory(product) && (product.title.toLowerCase().includes(keyword) || product.desc.toLowerCase().includes(keyword));
  });

  return (
    <div className="space-y-3">
      <PageIntro
        title="Buat Penawaran"
        description="Pilih produk asuransi yang akan dibuatkan penawaran atau bagikan link produk ke calon nasabah."
      />
      <WorkPanel>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setCategory(item.key)}
                className={cls(
                  "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[12px] font-bold transition",
                  category === item.key ? "border-[#004B78] bg-[#004B78] text-white shadow-sm" : "border-[#D9E1EA] bg-white text-[#244F7A] hover:bg-[#F6F8FA]",
                )}
              >
                <item.icon className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={2.2} />
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-[#D9E1EA] bg-white px-3 sm:w-[352px]">
              <Search className="h-4 w-4 text-[#9AAAC0]" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari produk asuransi" className="h-full min-w-0 flex-1 border-0 bg-transparent text-[12px] text-[#041E42] outline-none placeholder:text-[#9AAAC0]" />
            </label>
            <div className="inline-flex h-11 w-fit rounded-lg border border-[#D9E1EA] bg-white p-1">
              {[
                { key: "card", label: "Card", icon: Grid2X2 },
                { key: "list", label: "List", icon: List },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setViewMode(item.key)}
                  className={cls(
                    "grid h-8 w-9 place-items-center rounded-md transition",
                    viewMode === item.key ? "bg-[#004B78] text-white" : "text-[#004B78] hover:bg-[#EEF5FA]",
                  )}
                  aria-label={`Tampilan ${item.label}`}
                  aria-pressed={viewMode === item.key}
                  title={`Tampilan ${item.label}`}
                >
                  <item.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </WorkPanel>
      <WorkPanel>
        {viewMode === "card" ? (
          <div className="grid grid-cols-[repeat(auto-fill,220px)] justify-start gap-3">
            {filteredProducts.map((product) => <ProductCard key={product.title} product={product} onLink={onLink} />)}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => <ProductListItem key={product.title} product={product} onLink={onLink} />)}
          </div>
        )}
      </WorkPanel>
    </div>
  );
}

function StaffField({ label, placeholder, type = "text", prefix, suffix, value, onChange }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9AAAC0]">{label}</span>
      <div className="mt-1 flex rounded-lg border border-[#D9E1EA] bg-white">
        {prefix ? <span className="grid place-items-center px-3 text-[12px] font-bold text-[#5F7A99]">{prefix}</span> : null}
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-10 min-w-0 flex-1 rounded-lg border-0 bg-transparent px-3 text-[13px] font-semibold text-[#041E42] outline-none placeholder:text-[#9AAAC0]"
        />
        {suffix ? <span className="grid place-items-center px-3 text-[12px] font-bold text-[#5F7A99]">{suffix}</span> : null}
      </div>
    </label>
  );
}

function PromoProductPicker({ selected, onToggle }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((current) => !current)} className="flex h-10 w-full items-center justify-between rounded-lg border border-[#D9E1EA] bg-white px-3 text-left text-[13px] font-semibold">
        <span className={selected.length ? "text-[#041E42]" : "text-[#9AAAC0]"}>{selected.length ? `${selected.length} produk dipilih` : "Pilih produk yang akan didiskon"}</span>
        <ChevronDown className="h-4 w-4 text-[#004B78]" />
      </button>
      {open ? (
        <div className="absolute left-0 right-0 z-30 mt-2 max-h-72 overflow-auto rounded-xl border border-[#D9E1EA] bg-white p-2 shadow-xl">
          <div className="mb-2 border-b border-[#E7EDF4] px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#9AAAC0]">Pilih lebih dari satu produk</div>
          {PRODUCTS.map((product) => (
            <label key={product.title} className={cls("flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2", selected.includes(product.title) ? "bg-[#EEF5FA]" : "hover:bg-[#F8FAFC]")}>
              <input type="checkbox" checked={selected.includes(product.title)} onChange={() => onToggle(product.title)} className="mt-1 h-4 w-4 accent-[#F2A62A]" />
              <span>
                <span className="block text-[12px] font-bold text-[#041E42]">{product.title}</span>
                <span className="block text-[11px] text-[#5F7A99]">{product.category}</span>
              </span>
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PromotionView() {
  const [mode, setMode] = useState("list");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Semua");
  const [selectedProducts, setSelectedProducts] = useState(["Travel Safe", "Life Guard"]);
  const [active, setActive] = useState(false);
  const [form, setForm] = useState({
    code: "",
    quota: "",
    percent: "",
    flat: "",
    expired: "",
  });
  const rows = PROMOS.filter((promo) => {
    const keyword = search.toLowerCase();
    return (promo.code.toLowerCase().includes(keyword) || promo.products.toLowerCase().includes(keyword)) && (status === "Semua" || promo.status === status);
  });
  const promoStats = [
    { label: "Total Promo", value: PROMOS.length },
    { label: "Aktif", value: PROMOS.filter((promo) => promo.status === "Aktif").length },
    { label: "Tidak Aktif", value: PROMOS.filter((promo) => promo.status === "Tidak Aktif").length },
  ];
  const updateForm = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
  const toggleProduct = (title) => setSelectedProducts((current) => (current.includes(title) ? current.filter((item) => item !== title) : [...current, title]));

  if (mode === "add") {
    return (
      <div className="space-y-3">
        <PageIntro
          title="Tambah Promo Code"
          description="Buat promo code baru dan tentukan produk yang mendapatkan diskon."
          action={<button type="button" onClick={() => setMode("list")} className="h-9 rounded-lg border border-[#D9E1EA] bg-white px-4 text-[12px] font-bold text-[#004B78] hover:bg-[#EEF5FA]">---------- ---- Kembali</button>}
        />
        <WorkPanel>
          <SectionBox title="Form Promo Code" icon={CreditCard}>
            <div className="grid gap-3">
              <StaffField label="Kode Promo" placeholder="Contoh: JASINDOHEMAT" value={form.code} onChange={updateForm("code")} />
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9AAAC0]">Produk yang Didiskon</span>
                <div className="mt-1"><PromoProductPicker selected={selectedProducts} onToggle={toggleProduct} /></div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedProducts.map((item) => <span key={item} className="rounded-full bg-[#EEF5FA] px-3 py-1 text-[11px] font-bold text-[#004B78]">{item}</span>)}
                </div>
              </label>
              <div className="grid gap-3 md:grid-cols-3">
                <StaffField label="Kuota" placeholder="Contoh: 100" type="number" value={form.quota} onChange={updateForm("quota")} />
                <StaffField label="Persentase Diskon" placeholder="Contoh: 10" suffix="%" value={form.percent} onChange={updateForm("percent")} />
                <StaffField label="Diskon Flat" placeholder="Contoh: 50000" prefix="Rp" value={form.flat} onChange={updateForm("flat")} />
              </div>
              <StaffField label="Tanggal Expired" type="date" value={form.expired} onChange={updateForm("expired")} />
              <label className="flex items-center justify-between gap-4 rounded-xl border border-[#D9E1EA] bg-[#F8FAFC] px-3 py-3">
                <span>
                  <span className="block text-[12px] font-bold text-[#041E42]">Status</span>
                  <span className="mt-1 block text-[11px] text-[#5F7A99]">Aktifkan promo agar dapat digunakan.</span>
                </span>
                <button type="button" onClick={() => setActive((current) => !current)} className={cls("relative h-8 w-16 rounded-full transition", active ? "bg-[#F2A62A]" : "bg-[#CBD5E1]")}>
                  <span className={cls("absolute top-1 h-6 w-6 rounded-full bg-white shadow transition", active ? "left-9" : "left-1")} />
                </button>
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2 border-t border-[#E7EDF4] pt-3">
              <button type="button" onClick={() => setMode("list")} className="h-9 rounded-lg border border-[#D9E1EA] bg-white px-4 text-[12px] font-bold text-[#004B78] hover:bg-[#EEF5FA]">Batal</button>
              <button type="button" onClick={() => setMode("list")} className="h-9 rounded-lg bg-[#F2A62A] px-4 text-[12px] font-bold text-white hover:bg-[#DF9620]">Simpan</button>
            </div>
          </SectionBox>
        </WorkPanel>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <PageIntro
        title="Promosi"
        description="Monitoring dan pengelolaan promo code untuk produk asuransi retail."
        action={<button type="button" onClick={() => setMode("add")} className="h-9 rounded-lg bg-[#004B78] px-4 text-[12px] font-bold text-white hover:bg-[#003F65]">+ Tambah Promo Code</button>}
      />
      <WorkPanel>
        <SectionBox title="Promo Code" icon={CreditCard}>
          <div className="mb-3 grid gap-2 md:grid-cols-3">
            {promoStats.map((item) => (
              <div key={item.label} className="rounded-xl border border-[#D9E1EA] bg-white px-3 py-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9AAAC0]">{item.label}</div>
                <div className="mt-1 text-[22px] font-black text-[#041E42]">{item.value}</div>
              </div>
            ))}
          </div>
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
            <StaffField label="Masukan Promo Code / Produk" value={search} onChange={setSearch} placeholder="Contoh: JASINDO20" />
            <button type="button" onClick={() => { setSearch(""); setStatus("Semua"); }} className="h-10 rounded-lg bg-[#F2A62A] px-4 text-[12px] font-bold text-white">Reset Filter</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Semua", "Aktif", "Tidak Aktif"].map((item) => (
              <button key={item} type="button" onClick={() => setStatus(item)} className={cls("inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[12px] font-bold", status === item ? "border-[#004B78] bg-[#004B78] text-white" : "border-[#D9E1EA] bg-white text-[#5F7A99] hover:bg-[#F6F8FA]")}>{item}</button>
            ))}
          </div>
        </SectionBox>
      </WorkPanel>
      <WorkPanel>
        <div className="overflow-auto rounded-xl border border-[#D9E1EA] bg-white">
          <table className="w-full min-w-[980px] text-left text-[12px]">
            <thead className="bg-[#EEF5FA] text-[10px] uppercase tracking-[0.12em] text-[#004B78]">
              <tr>
                <th className="px-4 py-3">Promo Code</th>
                <th className="px-4 py-3">Produk Diskon</th>
                <th className="px-4 py-3">Diskon</th>
                <th className="px-4 py-3">Kuota</th>
                <th className="px-4 py-3">Periode</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EDF4]">
              {rows.map((promo) => (
                <tr key={`${promo.code}-${promo.period}`} className="hover:bg-[#F8FAFC]">
                  <td className="px-4 py-3"><span className="rounded-md bg-[#E7EDF4] px-3 py-1.5 text-[11px] font-black text-[#304B68]">{promo.code}</span></td>
                  <td className="max-w-[260px] px-4 py-3 text-[#5F7A99]">{promo.products}</td>
                  <td className="px-4 py-3 font-bold text-[#041E42]">{promo.discount}</td>
                  <td className="px-4 py-3">{promo.quota}</td>
                  <td className="px-4 py-3">{promo.period}</td>
                  <td className="px-4 py-3"><StaffBadge>{promo.status}</StaffBadge></td>
                  <td className="px-4 py-3"><button type="button" className="h-8 rounded-lg border border-[#D9E1EA] px-3 text-[12px] font-bold text-[#004B78] hover:bg-[#EEF5FA]">Detail</button></td>
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[13px] font-semibold text-[#5F7A99]">Tidak ada promo yang sesuai filter.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </WorkPanel>
      <div className="flex flex-col gap-2 text-[12px] text-[#5F7A99] md:flex-row md:items-center md:justify-between">
        <p>Showing 1 of 2 Page</p>
        <div className="flex gap-2">
          <button type="button" className="h-8 rounded-lg border border-[#D9E1EA] bg-white px-3 font-bold text-[#5F7A99]">--------------- Prev</button>
          <button type="button" className="h-8 rounded-lg bg-[#004B78] px-3 font-bold text-white">Next ---------------</button>
        </div>
      </div>
    </div>
  );
}

function StaffCardGrid({ page, items, filters, activeFilter, onFilterChange }) {
  return (
    <div className="space-y-3">
      <PageIntro title={page.label} description={page.subtitle} />
      {filters?.length ? <FilterPills items={filters} active={activeFilter} onChange={onFilterChange} /> : null}
      <WorkPanel>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <div key={item.title} className="rounded-xl border border-[#D9E1EA] bg-white p-4">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#EEF5FA] text-[12px] font-black text-[#004B78]">{String(item.value).slice(0, 2)}</div>
              <div className="mt-3 font-bold text-[#041E42]">{item.title}</div>
              <div className="mt-1 text-[12px] text-[#5F7A99]">{item.sub}</div>
              <div className="mt-4"><StaffBadge>{item.status}</StaffBadge></div>
            </div>
          ))}
        </div>
      </WorkPanel>
    </div>
  );
}

function StaffListView({ page, items, filters, activeFilter, onFilterChange }) {
  return (
    <div className="space-y-3">
      <PageIntro title={page.label} description={page.subtitle} />
      {filters?.length ? <FilterPills items={filters} active={activeFilter} onChange={onFilterChange} /> : null}
      <WorkPanel>
        <div className="overflow-hidden rounded-xl border border-[#D9E1EA] bg-white">
          <div className="divide-y divide-[#E7EDF4]">
            {items.map((item) => (
              <div key={item.title} className="grid gap-3 px-4 py-3 hover:bg-[#F8FAFC] md:grid-cols-[minmax(0,1fr)_160px_120px] md:items-center">
                <div className="min-w-0">
                <div className="text-[14px] font-bold text-[#041E42]">{item.title}</div>
                  <div className="mt-1 text-[12px] leading-5 text-[#5F7A99]">{item.sub}</div>
                </div>
                <div className="text-[12px] font-bold text-[#304B68]">{item.value}</div>
                <div className="md:text-right"><StaffBadge>{item.status}</StaffBadge></div>
              </div>
            ))}
          </div>
        </div>
      </WorkPanel>
    </div>
  );
}

function StaffSettingsView({ sessionName }) {
  const settings = [
    { title: "Profil Staff", sub: sessionName, value: "Internal", status: "Aktif" },
    { title: "Notifikasi Tasklist", sub: "Pengingat pekerjaan dan tindak lanjut nasabah.", value: "Email + Portal", status: "Aktif" },
    { title: "Preferensi Tampilan", sub: "Mode ringkas untuk daftar kerja operasional.", value: "Default", status: "Aktif" },
  ];
  return (
    <StaffListView
      page={{ label: "Setelan", subtitle: "Pengaturan akun internal, notifikasi, dan preferensi portal kerja." }}
      items={settings}
    />
  );
}

function GenericStaffView({ active }) {
  const [filter, setFilter] = useState("Semua");
  const [pageFilter, setPageFilter] = useState("Semua");
  const pages = {
    tasklist: { label: "Tasklist", subtitle: "Daftar pekerjaan operasional sesuai status dan kebutuhan tindak lanjut." },
    "add-partner": { label: "Add Partner", subtitle: "Maker input partner, Checker verifikasi, Approver memberikan persetujuan final." },
    promotion: { label: "Promosi", subtitle: "Checker/Approver mengelola atau menyetujui program promosi." },
    "transaksi-polis": { label: "Transaksi Polis", subtitle: "Monitoring status penawaran, pembayaran, penerbitan polis, dan transaksi terkait." },
    "riwayat-klaim": { label: "Riwayat Klaim", subtitle: "Melihat riwayat klaim nasabah/polis sebagai referensi layanan." },
    "add-user": { label: "Add User", subtitle: "Checker/Approver mengelola user dan role akses." },
    "master-data": { label: "Master Data", subtitle: "Pengelolaan referensi data sistem seperti produk, partner, promo, dan parameter." },
  };
  const page = pages[active] || pages.tasklist;

  if (active === "promotion") return <PromotionView />;
  if (active === "tasklist") {
    const filters = ["Semua", "Butuh Assist Internal", "Menunggu Data Nasabah", "Validasi Data Internal", "Menunggu Pembayaran Nasabah", "Menunggu Persetujuan Penawaran"];
    const rows = filter === "Semua" ? TASKS : TASKS.filter((item) => item.detail === filter || item.pipeline === filter || item.owner === filter);
    return (
      <div className="space-y-3">
        <PageIntro title={page.label} description={page.subtitle} />
        <WorkPanel>
          <div className="mb-3 flex flex-wrap gap-2">
            {filters.map((item) => (
              <button key={item} type="button" onClick={() => setFilter(item)} className={cls("inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[12px] font-bold", filter === item ? "border-[#004B78] bg-[#004B78] text-white" : "border-[#D9E1EA] bg-white text-[#5F7A99] hover:bg-[#F6F8FA]")}>{item}</button>
            ))}
          </div>
          <StaffTaskTable rows={rows} title="Daftar Task" />
        </WorkPanel>
      </div>
    );
  }
  if (active === "transaksi-polis") {
    const filters = ["Semua", ...Array.from(new Set(TRANSACTIONS.map((item) => item.status)))];
    const rows = pageFilter === "Semua" ? TRANSACTIONS : TRANSACTIONS.filter((item) => item.status === pageFilter);
    return <StaffListView page={page} items={rows} filters={filters} activeFilter={pageFilter} onFilterChange={setPageFilter} />;
  }
  if (active === "riwayat-klaim") {
    const filters = ["Semua", ...STAFF_CLAIMS.map((item) => item.title)];
    const rows = pageFilter === "Semua" ? STAFF_CLAIMS : STAFF_CLAIMS.filter((item) => item.title === pageFilter);
    return <StaffListView page={page} items={rows} filters={filters} activeFilter={pageFilter} onFilterChange={setPageFilter} />;
  }

  const itemMap = {
    "add-partner": [
      { title: "Dealer Mobil Jakarta", sub: "Partner kanal kendaraan", value: "Dealer", status: "Aktif" },
      { title: "Klinik Sehat Bersama", sub: "Partner kanal kesehatan", value: "Klinik", status: "Aktif" },
      { title: "Travel Agent", sub: "Partner kanal perjalanan", value: "Travel", status: "Aktif" },
      { title: "Broker Properti BSD", sub: "Partner kanal properti", value: "Broker", status: "Aktif" },
    ],
    "add-user": [
      { title: "Budi Santoso", sub: "Staff RO / Maker", value: "RO", status: "Aktif" },
      { title: "Sarah Amalia", sub: "Underwriter / Reviewer", value: "Underwriter", status: "Aktif" },
      { title: "Dimas Putra", sub: "Head Of / Approver", value: "Head Of", status: "Aktif" },
    ],
    "master-data": [
      { title: "Produk", sub: "Referensi produk asuransi retail.", value: "Produk", status: "Aktif" },
      { title: "Parameter Premi", sub: "Parameter tarif dan perhitungan.", value: "Parameter", status: "Aktif" },
      { title: "Wilayah OJK", sub: "Referensi wilayah operasional.", value: "Wilayah", status: "Aktif" },
      { title: "Role Akses", sub: "Hak akses internal portal.", value: "Role Akses", status: "Aktif" },
      { title: "Metode Bayar", sub: "Referensi kanal pembayaran.", value: "Pembayaran", status: "Aktif" },
      { title: "Template Penawaran", sub: "Dokumen dan pesan penawaran.", value: "Template", status: "Aktif" },
      { title: "Status Tasklist", sub: "Referensi status operasional.", value: "Tasklist", status: "Aktif" },
      { title: "Referensi Dokumen", sub: "Dokumen pendukung produk.", value: "Dokumen", status: "Aktif" },
    ],
  };
  const items = itemMap[active] || [];
  const filters = ["Semua", ...Array.from(new Set(items.map((item) => item.value)))];
  const filteredItems = pageFilter === "Semua" ? items : items.filter((item) => item.value === pageFilter);
  if (["add-partner", "add-user"].includes(active)) return <StaffListView page={page} items={filteredItems} filters={filters} activeFilter={pageFilter} onFilterChange={setPageFilter} />;
  return <StaffCardGrid page={page} items={filteredItems} filters={filters} activeFilter={pageFilter} onFilterChange={setPageFilter} />;
}

function ProductLinkModal({ product, onClose }) {
  const [showQr, setShowQr] = useState(true);
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
              <span className="text-[24px] leading-none">------------</span>
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
                WhatsApp
              </a>
              <a href={emailUrl} className="inline-flex h-11 items-center justify-center gap-3 rounded-xl border border-[#D9E1EA] bg-white px-4 text-[13px] font-bold text-[#304B68] hover:bg-[#F8FAFC]">
                <Mail className="h-5 w-5" />
                Kirim via Email
              </a>
              <button type="button" onClick={() => navigator.clipboard?.writeText(trackedUrl)} className="inline-flex h-11 items-center justify-center gap-3 rounded-xl border border-[#D9E1EA] bg-white px-4 text-[13px] font-bold text-[#304B68] hover:bg-[#F8FAFC]">
                <Copy className="h-5 w-5" />
                Salin Link
              </button>
              <button type="button" onClick={() => setShowQr((current) => !current)} className={cls("inline-flex h-11 items-center justify-center gap-3 rounded-xl border px-4 text-[13px] font-bold hover:bg-[#F8FAFC]", showQr ? "border-[#004B78] bg-[#EEF5FA] text-[#004B78]" : "border-[#D9E1EA] bg-white text-[#304B68]")}>
                <QrCode className="h-5 w-5" />
                QR
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

export {
  AppLogo,
  PageShell,
  GenericStaffView,
  OfferProductsView,
  ProductLinkModal,
  Sidebar,
  StaffDashboardView,
  StaffSettingsView,
  TopBar,
  WorkspaceFilters,
};
