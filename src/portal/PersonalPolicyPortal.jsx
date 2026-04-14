import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  Headphones,
  Home,
  Mail,
  MapPin,
  Phone,
  Plus,
  Printer,
  Search,
  Shield,
  Sparkles,
  Upload,
  Wallet,
  X,
} from "lucide-react";

const TABS = [
  { key: "policies", label: "Polis", helper: "Perlindungan aktif", icon: Shield },
  { key: "claims", label: "Klaim", helper: "Pantau tindak lanjut", icon: FileText },
  { key: "help", label: "Bantuan", helper: "Kanal resmi Jasindo", icon: Headphones },
];

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
    claimChecklist: [
      "Foto area kerusakan dari beberapa sudut",
      "Kronologi singkat kejadian",
      "Daftar barang atau bagian bangunan yang terdampak",
      "Dokumen tambahan bila diminta surveyor",
    ],
    documents: ["E-polis", "Schedule benefit", "Bukti bayar", "Endorsement"],
  },
  {
    id: "policy-car",
    category: "Kendaraan pribadi",
    product: "Asuransi Mobil Komprehensif",
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
    claimChecklist: [
      "Foto kerusakan kendaraan",
      "Kronologi kejadian",
      "STNK atau data kendaraan",
      "Dokumen tambahan bila melibatkan pihak ketiga",
    ],
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
    paymentStatus: "Metode bayar perlu diperbarui",
    status: "Aktif",
    tone: "warning",
    periodStart: "01 Mar 2026",
    periodEnd: "28 Feb 2027",
    benefits: ["Meninggal dunia akibat kecelakaan", "Cacat tetap", "Biaya perawatan darurat"],
    claimChecklist: [
      "Kronologi kejadian",
      "Surat dokter atau resume medis",
      "Kuitansi biaya perawatan bila ada reimbursement",
      "Dokumen identitas tertanggung",
    ],
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
    paymentStatus: "Periode berakhir",
    status: "Berakhir",
    tone: "default",
    periodStart: "12 Apr 2024",
    periodEnd: "11 Apr 2025",
    benefits: ["Kebakaran", "Banjir"],
    claimChecklist: [
      "Lihat polis baru bila ingin melanjutkan perlindungan.",
      "Riwayat dokumen masih bisa dilihat dari daftar dokumen utama.",
    ],
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
    status: "Selesai dibayar",
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
    title: "Renewal polis rumah tinggal",
    dueDate: "11 Apr 2026",
    amount: 3520000,
    status: "Perlu dibayar",
    tone: "warning",
    method: "BCA Virtual Account",
    helper: "Bayar hari ini agar renewal tidak tertunda.",
  },
  {
    id: "INV-2603-1007",
    policyId: "policy-pa",
    title: "Premi Personal Accident Family",
    dueDate: "01 Mar 2026",
    amount: 940000,
    status: "Metode bayar perlu diperbarui",
    tone: "danger",
    method: "Kartu tersimpan perlu diperbarui",
    helper: "Metode bayar lama tidak lagi valid.",
  },
];

const DEFAULT_OFFICIAL_CONTACTS = [
  { label: "Contact Center", value: "1500-073", helper: "24 jam", href: "tel:1500073", icon: Phone },
  { label: "Layanan pelanggan", value: "care@jasindo.co.id", helper: "Email resmi", href: "mailto:care@jasindo.co.id", icon: Mail },
  { label: "Telepon kantor", value: "(021) 3924737", helper: "Graha Jasindo", href: "tel:+62213924737", icon: Headphones },
];

const CLAIM_STAGES = ["Laporan diterima", "Dokumen dicek", "Review atau survei", "Selesai"];

function cls(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID").format(value || 0);
}

function normalizePolicies(items) {
  return Array.isArray(items) && items.length ? items : DEFAULT_POLICIES;
}

function normalizeClaims(items) {
  return Array.isArray(items) && items.length ? items : DEFAULT_CLAIMS;
}

function normalizeBillingItems(items) {
  return Array.isArray(items) ? items : DEFAULT_BILLING_ITEMS;
}

function resolveContactIcon(icon) {
  if (icon === Phone || icon === Mail || icon === Headphones) return icon;
  if (typeof icon === "string") {
    const normalized = icon.toLowerCase();
    if (normalized === "phone") return Phone;
    if (normalized === "mail" || normalized === "email") return Mail;
    if (normalized === "headphones" || normalized === "support") return Headphones;
  }
  return Phone;
}

function normalizeContacts(items) {
  if (!(Array.isArray(items) && items.length)) return DEFAULT_OFFICIAL_CONTACTS;
  return items.map((item, index) => ({
    ...item,
    icon: resolveContactIcon(item.icon || DEFAULT_OFFICIAL_CONTACTS[index]?.icon),
  }));
}

function createSelfCarePortalModel(input = {}) {
  return {
    sessionName: input.sessionName || "Dita (External)",
    policies: normalizePolicies(input.policies),
    claims: normalizeClaims(input.claims),
    billingItems: normalizeBillingItems(input.billingItems),
    contacts: normalizeContacts(input.contacts),
    defaultTab: TABS.some((item) => item.key === input.defaultTab) ? input.defaultTab : "claims",
  };
}

function safeWindow() {
  return typeof window !== "undefined" ? window : null;
}

function useHashTab(defaultTab) {
  const [tab, setTab] = useState(defaultTab);

  useEffect(() => {
    const win = safeWindow();
    if (!win) return undefined;

    const applyHash = () => {
      const next = win.location.hash.replace("#", "");
      if (TABS.some((item) => item.key === next)) setTab(next);
      else setTab(defaultTab);
    };

    applyHash();
    win.addEventListener("hashchange", applyHash);
    return () => win.removeEventListener("hashchange", applyHash);
  }, [defaultTab]);

  const updateTab = (nextTab) => {
    const win = safeWindow();
    setTab(nextTab);
    if (win) win.location.hash = nextTab;
  };

  return [tab, updateTab];
}

function toneBadgeClass(tone) {
  if (tone === "success") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (tone === "warning") return "bg-amber-50 text-amber-700 ring-amber-200";
  if (tone === "danger") return "bg-rose-50 text-rose-700 ring-rose-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function panelToneClass(tone) {
  if (tone === "danger") return "border-rose-200 bg-rose-50";
  if (tone === "warning") return "border-amber-200 bg-amber-50";
  if (tone === "success") return "border-emerald-200 bg-emerald-50";
  return "border-slate-200 bg-white";
}

function findPolicy(policies, policyId) {
  return policies.find((item) => item.id === policyId) || policies[0];
}

function StatusBadge({ tone, children }) {
  return <span className={cls("inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1", toneBadgeClass(tone))}>{children}</span>;
}

function AccordionSectionTitle({ children }) {
  return <div className="text-[15px] font-semibold leading-6 text-[#041E42] md:text-[16px]">{children}</div>;
}

function AccordionRowTitle({ children }) {
  return <div className="text-[15px] font-semibold leading-6 text-[#00539F]">{children}</div>;
}

function AccordionRowMeta({ children }) {
  return <div className="text-[12px] font-normal leading-5 text-[#5F7A99]">{children}</div>;
}

function SectionCard({ title, subtitle, action, children, className }) {
  return (
    <section className={cls("rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[15px] font-semibold leading-6 text-[#041E42] md:text-[16px]">{title}</div>
          {subtitle ? <div className="mt-1 max-w-3xl text-[14px] leading-6 text-[#5F7A99]">{subtitle}</div> : null}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SummaryCard({ label, value, helper, tone = "default", icon: Icon }) {
  return (
    <div className={cls("rounded-2xl border p-4 shadow-sm", tone === "brand" ? "border-[#D6E4F1] bg-[#F7FBFF]" : "border-slate-200 bg-white")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
          <div className="mt-1.5 text-[24px] font-black tracking-tight text-slate-900">{value}</div>
        </div>
        {Icon ? <div className={cls("flex h-11 w-11 items-center justify-center rounded-2xl", tone === "brand" ? "bg-white text-[#0A4D82] ring-1 ring-[#D6E4F1]" : "bg-slate-100 text-slate-500")}><Icon className="h-5 w-5" /></div> : null}
      </div>
      <div className="mt-1.5 text-sm text-slate-500">{helper}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <div className="text-slate-500">{label}</div>
      <div className="text-right font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function AuditTrailEntry({ actor, time, text }) {
  const actorInitial = String(actor || "S").trim().charAt(0).toUpperCase();
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF3FF] text-[11px] font-bold text-[#0A4D82]">
        {actorInitial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <div className="text-sm font-semibold text-[#041E42]">{actor}</div>
          <div className="text-[12px] text-[#8EA3BC]">{time}</div>
        </div>
        <div className="mt-1 rounded-2xl border border-[#D9E1EA] bg-slate-50 px-3.5 py-2.5 text-[14px] leading-6 text-[#5F7A99]">
          {text}
        </div>
      </div>
    </div>
  );
}

function ActionButton({ children, className, ...props }) {
  return <button type="button" className={cls("inline-flex h-11 items-center justify-center rounded-[12px] px-4 text-sm font-semibold transition", className)} {...props}>{children}</button>;
}

function LinkButton({ children, href, className }) {
  return <a href={href} className={cls("inline-flex h-11 items-center justify-center rounded-[12px] px-4 text-sm font-semibold transition", className)}>{children}</a>;
}

function handlePolicyPrint() {
  if (typeof window !== "undefined") {
    window.print();
  }
}

function ModalShell({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8">
      <div className="w-full max-w-3xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 md:px-6">
          <div>
            <div className="text-[24px] font-bold tracking-tight text-slate-900">{title}</div>
            {subtitle ? <div className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</div> : null}
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup jendela" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[78vh] overflow-y-auto px-5 py-5 md:px-6">{children}</div>
      </div>
    </div>
  );
}

function BrandHeader({ onOpenHelp, onGoHome, embedded, sessionName, sessionRoleLabel = "Eksternal" }) {
  if (embedded) return null;

  const accountInitial = String(sessionName || "U").trim().charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0A4D82] shadow-sm">
      <div className="mx-auto flex max-w-[1800px] flex-wrap items-center justify-between gap-3 px-4 py-3 md:flex-nowrap md:px-6">
        <div className="flex min-w-0 items-center gap-3 text-white">
          <div className="text-[13px] font-black leading-tight md:text-[18px]">Danantara<div className="-mt-1 text-[13px] md:text-[18px]">Indonesia</div></div>
          <div className="hidden text-[15px] font-semibold text-white/95 sm:block">asuransi jasindo</div>
        </div>
        <div className="flex w-full items-center justify-end gap-2 md:w-auto md:gap-3">
          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-white/20 bg-white/10 px-3.5 text-sm font-medium text-white shadow-sm"
          >
            <span>{sessionRoleLabel}</span>
            <ChevronDown className="h-4 w-4 text-white/85" />
          </button>
          <button type="button" onClick={onGoHome} className="hidden rounded-[8px] bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 md:inline-flex">Beranda</button>
          <button type="button" onClick={onOpenHelp} className="rounded-[8px] bg-[#F5A623] px-2.5 py-2 text-xs font-semibold text-white shadow-sm md:px-4 md:text-sm">Bantuan</button>
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-2 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EB5757] text-[11px] font-bold text-white">{accountInitial}</span>
            <span className="pr-2">{sessionName}</span>
          </div>
          <button type="button" aria-label="Lihat notifikasi" className="hidden h-11 w-11 items-center justify-center rounded-[10px] border border-white/20 bg-white/10 text-white shadow-sm hover:bg-white/15 md:inline-flex">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

function PortalTabs({ activeTab, onChange }) {
  return (
    <div className="rounded-[24px] border border-[#D9E1EA] bg-[#F7FAFD] px-4 py-4 md:px-8 md:py-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
        {TABS.map((item, index) => {
          const Icon = item.icon;
          const active = activeTab === item.key;
          const showConnector = index < TABS.length - 1;

          return (
            <React.Fragment key={item.key}>
              <button
                type="button"
                onClick={() => onChange(item.key)}
                className={cls(
                  "group flex min-w-0 flex-1 cursor-pointer flex-col items-center rounded-[20px] px-3 py-2.5 text-center transition duration-200",
                  active ? "bg-white shadow-sm ring-1 ring-[#D9E1EA]" : "hover:bg-white/80 hover:shadow-sm"
                )}
              >
                <div className={cls("flex h-10 w-10 items-center justify-center rounded-full border-[2.5px] bg-white transition md:h-11 md:w-11", active ? "border-[#0A4D82] text-[#0A4D82]" : "border-[#C7D4E4] text-[#C7D4E4] group-hover:border-[#7FA5CC] group-hover:text-[#0A4D82]")}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className={cls("mt-3 text-[18px] font-bold leading-none transition md:mt-4 md:text-[22px]", active ? "text-slate-900" : "text-[#526A86] group-hover:text-slate-900")}>{item.label}</div>
                <div className={cls("mt-1.5 text-sm transition md:mt-2", active ? "text-[#C97A1E]" : "text-[#8EA3BC] group-hover:text-[#C97A1E]")}>{item.helper}</div>
                <div className={cls("mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold transition md:mt-3", active ? "bg-[#EAF3FF] text-[#0A4D82]" : "bg-white text-[#7F96B2] ring-1 ring-[#D9E1EA] group-hover:bg-[#EAF3FF] group-hover:text-[#0A4D82]")}>
                  {active ? "Sedang dibuka" : "Klik untuk buka"}
                </div>
              </button>
              {showConnector ? <div className="hidden h-px flex-1 bg-[#C7D4E4] md:block" /> : null}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function TodayView({ claims, policies, billingItems, onGoToClaims, onOpenUpload, onOpenReport, onGoToHelp }) {
  const urgentClaim = claims.find((item) => !item.settled && item.tone === "danger") || claims.find((item) => !item.settled);
  const renewalItem = billingItems.find((item) => item.tone === "warning" || item.tone === "danger");
  const activeClaims = claims.filter((item) => !item.settled).length;
  const activePolicies = policies.filter((item) => item.status === "Aktif").length;
  const dueBilling = billingItems.filter((item) => item.tone === "warning" || item.tone === "danger").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <SectionCard
          title="Yang perlu Anda lakukan hari ini"
          subtitle="Lihat hal yang paling perlu ditindaklanjuti hari ini tanpa harus membuka banyak halaman."
          action={
            <ActionButton className="bg-[#0A4D82] text-white hover:brightness-105" onClick={onOpenReport}>
              <Plus className="mr-2 h-4 w-4" />
              Lapor klaim baru
            </ActionButton>
          }
        >
          {urgentClaim ? (
            <div className={cls("rounded-2xl border p-5", panelToneClass(urgentClaim.tone))}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Prioritas utama</div>
                  <div className="mt-2 text-[28px] font-black tracking-tight text-slate-900">{urgentClaim.title}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-700">{urgentClaim.nextAction}</div>
                </div>
                <StatusBadge tone={urgentClaim.tone}>{urgentClaim.status}</StatusBadge>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Nomor klaim</div>
                  <div className="mt-1 text-sm font-bold text-slate-900">{urgentClaim.id}</div>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Yang harus dilakukan</div>
                  <div className="mt-1 text-sm font-bold text-slate-900">{urgentClaim.dueLabel}</div>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Update berikutnya</div>
                  <div className="mt-1 text-sm font-bold text-slate-900">{urgentClaim.nextUpdate}</div>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <ActionButton className="bg-[#0A4D82] text-white hover:brightness-105" onClick={() => onOpenUpload(urgentClaim)}>
                  Upload dokumen sekarang
                </ActionButton>
                <ActionButton className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" onClick={onGoToClaims}>
                  Lihat detail klaim
                </ActionButton>
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
              <div className="text-base font-bold text-slate-900">Tidak ada klaim yang perlu aksi cepat</div>
              <div className="mt-2 text-sm leading-6 text-slate-700">Jika Anda baru mengalami kejadian, gunakan tombol lapor klaim agar laporan awal langsung tercatat.</div>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Bantuan resmi" subtitle="Hubungi layanan resmi Jasindo bila Anda membutuhkan bantuan lebih lanjut.">
          <div className="space-y-3">
            {DEFAULT_OFFICIAL_CONTACTS.map((item) => {
              const Icon = item.icon;
              return (
                <a key={item.label} href={item.href} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#0A4D82] ring-1 ring-slate-200">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{item.label}</div>
                    <div className="text-sm text-slate-600">{item.value}</div>
                    <div className="text-xs text-slate-400">{item.helper}</div>
                  </div>
                </a>
              );
            })}
          </div>
          <div className="mt-4 rounded-2xl bg-[#F7FBFF] px-4 py-4 text-sm leading-6 text-slate-700 ring-1 ring-[#D6E4F1]">
            Bila Anda masuk karena ingin klaim, prioritasnya adalah kirim laporan awal, unggah dokumen yang diminta, lalu pantau update di menu Klaim.
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <ActionButton className="bg-[#0A4D82] text-white hover:brightness-105" onClick={onGoToHelp}>
              Buka pusat bantuan
            </ActionButton>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SummaryCard label="Klaim aktif" value={String(activeClaims)} helper="Yang masih membutuhkan update atau tindak lanjut" tone="brand" icon={FileText} />
        <SummaryCard label="Polis aktif" value={String(activePolicies)} helper="Semua polis yang masih berjalan" icon={Shield} />
        <SummaryCard label="Tagihan perlu perhatian" value={String(dueBilling)} helper="Yang sebaiknya ditinjau hari ini" icon={Wallet} />
      </div>

      <SectionCard title="Tagihan dan dokumen" subtitle="Hal lain yang bisa Anda cek tanpa membuka detail polis.">
        <div className="grid gap-4 lg:grid-cols-2">
          {renewalItem ? (
            <div className={cls("rounded-[24px] border p-5", panelToneClass(renewalItem.tone))}>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Renewal</div>
              <div className="mt-2 text-xl font-bold text-slate-900">{renewalItem.title}</div>
              <div className="mt-2 text-sm leading-6 text-slate-700">{renewalItem.helper}</div>
              <div className="mt-4 text-sm font-semibold text-slate-900">Jatuh tempo {renewalItem.dueDate}</div>
            </div>
          ) : null}
          <div className="rounded-[24px] border border-slate-200 bg-white p-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Dokumen</div>
            <div className="mt-2 text-xl font-bold text-slate-900">Dokumen utama tersimpan rapi</div>
            <div className="mt-2 text-sm leading-6 text-slate-600">E-polis, bukti bayar, dan dokumen perubahan tetap tersedia tanpa harus mencari ke banyak halaman.</div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function ClaimCard({ claim, policy, onOpenUpload, open, onToggle }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#C9D8E8] bg-white shadow-sm">
      <button type="button" onClick={onToggle} className="w-full px-4 py-3.5 text-left md:px-5 md:py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#C9D8E8] bg-[#F7FBFF] text-[#0A4D82]">
              <FileText className="h-4 w-4" />
            </div>
            <div className="clamp-1 min-w-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8EA3BC]">{policy.product}</div>
          </div>
          <div className="flex shrink-0 items-start gap-2">
            <StatusBadge tone={claim.tone}>{claim.status}</StatusBadge>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white">
              <ChevronDown className={cls("h-4 w-4 text-slate-500 transition-transform", open && "rotate-180")} />
            </span>
          </div>
        </div>

        <div className="mt-3">
          <div className={cls("text-[15px] font-semibold leading-6 text-[#00539F] md:text-[16px]", open ? "" : "clamp-1")}>{claim.title}</div>
          <div className="mt-1 text-[12px] leading-5 text-[#5F7A99]">
            {open ? (
              `No. klaim ${claim.id}`
            ) : (
              <span className="clamp-1">{`No. klaim ${claim.id} - ${claim.dueLabel} - ${claim.amount}`}</span>
            )}
          </div>
        </div>
      </button>

      {open ? (
        <div className="border-t border-[#D9E1EA] bg-[#FBFDFF] px-4 py-4 md:px-5">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.16em] text-[#8EA3BC]">Langkah berikutnya</div>
            <div className="mt-1 text-[14px] leading-6 text-[#041E42]">{claim.nextAction}</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                <div className="text-[10px] uppercase tracking-[0.16em] text-[#8EA3BC]">Penanganan</div>
                <div className="mt-1 text-[12px] font-medium text-[#041E42]">{claim.assignedTo}</div>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                <div className="text-[10px] uppercase tracking-[0.16em] text-[#8EA3BC]">Update berikutnya</div>
                <div className="mt-1 text-[12px] font-medium text-[#041E42]">{claim.dueLabel}</div>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                <div className="text-[10px] uppercase tracking-[0.16em] text-[#8EA3BC]">Nilai</div>
                <div className="mt-1 text-[12px] font-medium text-[#041E42]">{claim.amount}</div>
              </div>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-4">
            {CLAIM_STAGES.map((item, index) => {
              const reached = index + 1 <= claim.stage;
              return (
                <div key={item} className={cls("rounded-xl px-4 py-3 text-sm ring-1", reached ? "bg-white text-[#0A4D82] ring-[#C9D8E8]" : "bg-white text-slate-400 ring-slate-200")}>
                  <div className="text-[14px] font-medium leading-6">{item}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="space-y-4">
              {claim.requiredDocs.length ? (
                <div className="rounded-xl border border-[#D9E1EA] bg-white px-4 py-4">
                  <div className="text-[15px] font-semibold leading-6 text-[#041E42]">Dokumen yang masih diminta</div>
                  <div className="mt-3 space-y-2">
                    {claim.requiredDocs.map((item) => (
                      <div key={item} className="flex items-start gap-3 text-[14px] text-[#041E42]">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="rounded-xl border border-[#D9E1EA] bg-white px-4 py-4">
                <div className="text-[15px] font-semibold leading-6 text-[#041E42]">Riwayat ringkas</div>
                <div className="mt-3 space-y-3">
                  {claim.history.map((item) => (
                    <AuditTrailEntry
                      key={`${claim.id}-${item.date}-${item.text}`}
                      actor="Sistem"
                      time={item.date}
                      text={item.text}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-[#0A4D82] px-4 py-4 text-white">
              <div className="text-sm font-semibold">Ringkasan</div>
              <div className="mt-4 space-y-3 text-sm text-white/90">
                <div className="flex items-start justify-between gap-3">
                  <span>Penanganan</span>
                  <span className="text-right font-semibold text-white">{claim.assignedTo}</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span>Nilai</span>
                  <span className="text-right font-semibold text-white">{claim.amount}</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span>Tanggal kejadian</span>
                  <span className="text-right font-semibold text-white">{claim.lossDate}</span>
                </div>
              </div>
              <div className="mt-5 rounded-xl bg-white/10 px-4 py-3 text-sm leading-6 text-white/90">
                {claim.nextUpdate}
              </div>
              <div className="mt-4 flex flex-col gap-2">
                {claim.canUpload ? (
                  <ActionButton className="bg-white text-[#0A4D82] hover:bg-slate-100" onClick={() => onOpenUpload(claim)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload dokumen
                  </ActionButton>
                ) : null}
                <LinkButton href="tel:1500073" className="border border-white/20 bg-white/10 text-white hover:bg-white/15">
                  Hubungi Contact Center
                </LinkButton>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function HistoryEntryCard({ title, meta, status, tone = "default", onOpen }) {
  const className = cls(
    "flex w-full items-center justify-between gap-3 rounded-2xl border border-[#C9D8E8] bg-white px-4 py-4 text-left shadow-sm",
    onOpen && "transition hover:border-[#0A4D82]/30 hover:bg-[#FBFDFF]"
  );
  const content = (
    <>
      <div className="min-w-0">
        <div className="clamp-1 text-[15px] font-semibold leading-6 text-[#00539F]">{title}</div>
        <div className="mt-1 clamp-1 text-[12px] leading-5 text-[#7F96B2]">{meta}</div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <StatusBadge tone={tone}>{status}</StatusBadge>
        {onOpen ? <ChevronDown className="h-4 w-4 -rotate-90 text-slate-400" /> : null}
      </div>
    </>
  );

  if (!onOpen) {
    return <div className={className}>{content}</div>;
  }

  return (
    <button type="button" onClick={onOpen} className={className}>
      {content}
    </button>
  );
}

function HistoryLauncherCard({ title, helper, countLabel, actionLabel, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-2xl border border-[#C9D8E8] bg-white px-4 py-4 text-left shadow-sm transition hover:border-[#0A4D82]/30 hover:bg-[#FBFDFF] md:px-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[15px] font-semibold leading-6 text-[#00539F]">{title}</div>
          <div className="mt-1 text-[13px] leading-6 text-[#5F7A99]">{helper}</div>
        </div>
        <ChevronDown className="mt-1 h-4 w-4 -rotate-90 shrink-0 text-slate-400" />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex rounded-full bg-[#EAF3FF] px-3 py-1 text-[11px] font-semibold text-[#0A4D82]">{countLabel}</span>
        <span className="inline-flex rounded-full border border-[#D9E1EA] bg-white px-3 py-1 text-[11px] font-semibold text-[#7F96B2]">{actionLabel}</span>
      </div>
    </button>
  );
}

function HistorySearchField({ value, onChange, placeholder }) {
  return (
    <div className="flex h-12 items-center gap-3 rounded-2xl border border-[#D9E1EA] bg-white px-4">
      <Search className="h-4 w-4 text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-full w-full border-0 bg-transparent text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-[#0A4D82] focus-visible:ring-offset-2"
      />
    </div>
  );
}

function CompactTipsAccordion({ title, subtitle, tips }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#C9D8E8] bg-white shadow-sm">
      <button type="button" onClick={() => setOpen((current) => !current)} className="w-full px-4 py-3.5 text-left md:px-5 md:py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[15px] font-semibold leading-6 text-[#00539F]">{title}</div>
            <div className="mt-1 text-[12px] leading-5 text-[#5F7A99]">{subtitle}</div>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white">
            <ChevronDown className={cls("h-4 w-4 text-slate-500 transition-transform", open && "rotate-180")} />
          </span>
        </div>
      </button>

      {open ? (
        <div className="border-t border-slate-200 bg-[#FBFDFF] px-4 py-4 md:px-5">
          <div className="space-y-2">
            {tips.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-xl bg-[#F7FBFF] px-4 py-3 text-sm leading-6 text-slate-700 ring-1 ring-[#D6E4F1]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0A4D82]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SummaryPanel({ title = "Ringkasan", children }) {
  return (
    <section className="rounded-2xl bg-[#0A4D82] px-5 py-5 text-white shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[14px] font-semibold">
          <FileText className="h-4 w-4" />
          {title}
        </div>
        <ChevronDown className="h-4 w-4 text-white/80" />
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function SummaryRows({ items }) {
  return (
    <div className="space-y-3 text-sm text-white/90">
      {items.map((item) => (
        <div key={item.label} className="flex items-start justify-between gap-3">
          <span>{item.label}</span>
          <span className="text-right font-semibold text-white">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function SummaryCallout({ title, value, helper }) {
  return (
    <div className="rounded-xl bg-white/10 px-4 py-4">
      <div className="text-sm text-white/85">{title}</div>
      <div className="mt-2 text-[28px] font-black tracking-tight text-white">{value}</div>
      <div className="mt-1 text-sm text-white/80">{helper}</div>
    </div>
  );
}

function SummaryAlertList({ title, items }) {
  return (
    <div className="rounded-xl bg-[#FFF7E8] px-4 py-4 text-[#8A4B08]">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-3 space-y-2 text-sm">
        {items.map((item) => (
          <div key={item} className="flex gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClaimsView({ claims, policies, onOpenUpload, onOpenReport }) {
  const activeClaims = claims.filter((item) => !item.settled);
  const settledClaims = claims.filter((item) => item.settled);
  const urgentCount = activeClaims.filter((item) => item.tone === "danger").length;
  const [openClaimId, setOpenClaimId] = useState("");
  const [showClaimHistory, setShowClaimHistory] = useState(false);
  const [claimHistorySearch, setClaimHistorySearch] = useState("");
  const filteredSettledClaims = useMemo(() => {
    const keyword = claimHistorySearch.trim().toLowerCase();
    if (!keyword) return settledClaims;
    return settledClaims.filter((claim) => {
      const policy = findPolicy(policies, claim.policyId);
      return [claim.title, claim.id, claim.status, policy.product, claim.lossDate].some((field) =>
        String(field).toLowerCase().includes(keyword)
      );
    });
  }, [claimHistorySearch, policies, settledClaims]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <SectionCard
        title={showClaimHistory ? "Riwayat klaim" : "Rincian klaim"}
        subtitle={
          showClaimHistory
            ? "Cari nomor klaim, produk, atau status untuk menemukan riwayat yang Anda butuhkan."
            : "Klik setiap baris untuk melihat penjelasan detailnya."
        }
      >
        {showClaimHistory ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <ActionButton className="border border-[#D9E1EA] bg-white text-slate-700 hover:bg-slate-50" onClick={() => setShowClaimHistory(false)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke klaim aktif
              </ActionButton>
              <span className="inline-flex rounded-full bg-[#EAF3FF] px-3 py-1 text-[11px] font-semibold text-[#0A4D82]">
                {filteredSettledClaims.length} riwayat ditemukan
              </span>
            </div>
            <HistorySearchField value={claimHistorySearch} onChange={setClaimHistorySearch} placeholder="Cari nomor klaim, produk, atau status" />
            <div className="space-y-3">
              {filteredSettledClaims.length ? (
                filteredSettledClaims.map((claim) => {
                  const policy = findPolicy(policies, claim.policyId);
                  return (
                    <HistoryEntryCard key={claim.id} title={claim.title} meta={`${policy.product} - ${claim.id} - ${claim.lossDate}`} status={claim.status} tone="success" />
                  );
                })
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-sm text-slate-600">
                  Riwayat klaim tidak ditemukan untuk kata kunci tersebut.
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-5 flex justify-center">
              <ActionButton className="bg-[#0A4D82] text-white hover:brightness-105" onClick={onOpenReport}>
                <Plus className="mr-2 h-4 w-4" />
                Lapor klaim baru
              </ActionButton>
            </div>
            <div className="space-y-4">
              {activeClaims.map((claim) => (
                <ClaimCard
                  key={claim.id}
                  claim={claim}
                  policy={findPolicy(policies, claim.policyId)}
                  onOpenUpload={onOpenUpload}
                  open={openClaimId === claim.id}
                  onToggle={() => setOpenClaimId((current) => (current === claim.id ? "" : claim.id))}
                />
              ))}

              {settledClaims.length ? (
                <HistoryLauncherCard
                  title="Riwayat klaim"
                  helper="Riwayat selesai tidak ditampilkan di halaman utama agar fokus tetap ke klaim yang masih berjalan."
                  countLabel={`${settledClaims.length} klaim selesai`}
                  actionLabel="Klik untuk buka riwayat"
                  onOpen={() => setShowClaimHistory(true)}
                />
              ) : null}
            </div>
          </>
        )}
      </SectionCard>

      <aside className="space-y-4 self-start xl:sticky xl:top-32">
        <SummaryPanel>
          <SummaryRows
            items={[
              { label: "Klaim aktif", value: activeClaims.length },
              { label: "Butuh dokumen", value: urgentCount },
              { label: "Riwayat selesai", value: settledClaims.length },
            ]}
          />
          <SummaryCallout title="Contact Center" value="1500-073" helper="Layanan resmi Jasindo" />
          <SummaryAlertList
            title="Yang masih perlu dilengkapi"
            items={[
              "Prioritaskan klaim dengan status dokumen kurang.",
              "Gunakan upload dokumen agar review bisa lanjut.",
            ]}
          />
        </SummaryPanel>
      </aside>
    </div>
  );
}

function PolicyCard({ policy, policyClaim, policyBilling, open, onToggle }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#C9D8E8] bg-white shadow-sm">
      <button type="button" onClick={onToggle} className="w-full px-4 py-3.5 text-left md:px-5 md:py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#C9D8E8] bg-[#F7FBFF] text-[#0A4D82]">
              <Shield className="h-4 w-4" />
            </div>
            <div className="clamp-1 min-w-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8EA3BC]">{policy.category}</div>
          </div>
          <div className="flex shrink-0 items-start gap-2">
            <StatusBadge tone={policy.tone}>{policy.status}</StatusBadge>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white">
              <ChevronDown className={cls("h-4 w-4 text-slate-500 transition-transform", open && "rotate-180")} />
              </span>
          </div>
        </div>

        <div className="mt-3">
          <div className={cls("text-[15px] font-semibold leading-6 text-[#00539F]", open ? "" : "clamp-1")}>{policy.product}</div>
          <div className="mt-1">{open ? <AccordionRowMeta>{policy.objectName}</AccordionRowMeta> : null}</div>
          {!open ? (
            <div className="mt-1 text-[12px] leading-5 text-[#8EA3BC]">
              <span className="clamp-1">{`No. polis ${policy.policyNumber} - Berakhir ${policy.periodEnd}`}</span>
            </div>
          ) : null}
        </div>
      </button>

      {open ? (
        <div className="border-t border-slate-200 bg-[#FBFDFF] px-4 py-4 md:px-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <AccordionSectionTitle>Ringkasan polis</AccordionSectionTitle>
                <div className="mt-3 divide-y divide-slate-100">
                  <InfoRow label="Nomor polis" value={policy.policyNumber} />
                  <InfoRow label="Periode" value={`${policy.periodStart} - ${policy.periodEnd}`} />
                  <InfoRow label="Nilai pertanggungan" value={`Rp ${formatRupiah(policy.insuredValue)}`} />
                  <InfoRow label="Premi tahunan" value={`Rp ${formatRupiah(policy.annualPremium)}`} />
                  <InfoRow label="Status pembayaran" value={policy.paymentStatus} />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <AccordionSectionTitle>Manfaat yang terlihat</AccordionSectionTitle>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {policy.benefits.map((item) => (
                    <div key={item} className="rounded-lg bg-slate-50 px-3 py-2 text-[14px] text-[#041E42] ring-1 ring-slate-200">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <AccordionSectionTitle>Jika terjadi klaim</AccordionSectionTitle>
                <div className="mt-3 space-y-2">
                  {policy.claimChecklist.map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-lg bg-[#F7FBFF] px-3 py-2 text-[14px] text-[#041E42] ring-1 ring-[#D6E4F1]">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0A4D82]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {policyClaim ? (
                <div className={cls("rounded-xl border p-4", panelToneClass(policyClaim.tone))}>
                  <AccordionSectionTitle>Klaim yang sedang berjalan</AccordionSectionTitle>
                  <div className="mt-2"><AccordionRowTitle>{policyClaim.title}</AccordionRowTitle></div>
                  <div className="mt-2 text-[14px] leading-6 text-[#041E42]">{policyClaim.nextAction}</div>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <AccordionSectionTitle>Belum ada klaim aktif</AccordionSectionTitle>
                  <div className="mt-2 text-[14px] leading-6 text-[#5F7A99]">Jika terjadi kejadian yang dijamin polis, gunakan menu Klaim untuk membuat laporan awal.</div>
                </div>
              )}

              {policyBilling ? (
                <div className={cls("rounded-xl border p-4", panelToneClass(policyBilling.tone))}>
                  <AccordionSectionTitle>Status pembayaran</AccordionSectionTitle>
                  <div className="mt-2"><AccordionRowTitle>{policyBilling.title}</AccordionRowTitle></div>
                  <div className="mt-2 text-[14px] leading-6 text-[#041E42]">{policyBilling.helper}</div>
                </div>
              ) : null}

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <AccordionSectionTitle>Dokumen utama</AccordionSectionTitle>
                <div className="mt-3 rounded-xl border border-[#D6E4F1] bg-[#F7FBFF] p-3">
                  <div className="text-[14px] font-semibold text-[#041E42]">Akses salinan polis elektronik</div>
                  <div className="mt-1 text-[13px] leading-5 text-[#5F7A99]">
                    Polis elektronik tersedia untuk dilihat, diunduh, dan dicetak oleh pemegang polis, tertanggung, atau peserta.
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <ActionButton className="border border-[#D9E1EA] bg-white text-[#0A4D82] hover:bg-slate-50">
                      <FileText className="mr-2 h-4 w-4" />
                      Lihat e-polis
                    </ActionButton>
                    <ActionButton className="border border-[#D9E1EA] bg-white text-[#0A4D82] hover:bg-slate-50">
                      <Download className="mr-2 h-4 w-4" />
                      Unduh salinan
                    </ActionButton>
                    <ActionButton className="border border-[#D9E1EA] bg-white text-slate-700 hover:bg-slate-50" onClick={handlePolicyPrint}>
                      <Printer className="mr-2 h-4 w-4" />
                      Cetak polis
                    </ActionButton>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {policy.documents.map((item) => (
                    <div key={item} className="flex items-start gap-3 text-[14px] text-[#041E42]">
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#0A4D82]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PoliciesView({ policies, claims, billingItems, selectedPolicyId, setSelectedPolicyId }) {
  const openPolicyId = selectedPolicyId;
  const activePolicies = policies.filter((policy) => policy.status === "Aktif");
  const historicalPolicies = policies.filter((policy) => policy.status !== "Aktif");
  const activeClaimCount = claims.filter((item) => !item.settled && activePolicies.some((policy) => policy.id === item.policyId)).length;
  const totalAnnualPremium = activePolicies.reduce((sum, policy) => sum + policy.annualPremium, 0);
  const nearestEndDate = activePolicies
    .map((policy) => policy.periodEnd)
    .sort((left, right) => new Date(left) - new Date(right))[0];
  const [showPolicyHistory, setShowPolicyHistory] = useState(false);
  const [policyHistorySearch, setPolicyHistorySearch] = useState("");
  const filteredHistoricalPolicies = useMemo(() => {
    const keyword = policyHistorySearch.trim().toLowerCase();
    if (!keyword) return historicalPolicies;
    return historicalPolicies.filter((policy) =>
      [policy.product, policy.policyNumber, policy.objectName, policy.status, policy.periodEnd].some((field) =>
        String(field).toLowerCase().includes(keyword)
      )
    );
  }, [historicalPolicies, policyHistorySearch]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <SectionCard title="Polis aktif" subtitle="Klik setiap polis untuk melihat ringkasan perlindungan, dokumen, panduan klaim, serta akses salinan polis elektronik." className="bg-[#F1F3F5]">
          <div className="mb-4 rounded-xl border border-[#D6E4F1] bg-white px-4 py-3 text-[13px] leading-5 text-[#5F7A99]">
            Salinan polis elektronik tersedia di portal ini agar dapat dilihat kembali, diunduh, atau dicetak saat dibutuhkan.
          </div>
          <div className="space-y-3">
            {activePolicies.map((policy) => (
              <PolicyCard
                key={policy.id}
                policy={policy}
                policyClaim={claims.find((item) => item.policyId === policy.id && !item.settled)}
                policyBilling={billingItems.find((item) => item.policyId === policy.id)}
                open={openPolicyId === policy.id}
                onToggle={() => setSelectedPolicyId((current) => (current === policy.id ? "" : policy.id))}
              />
            ))}
          </div>
        </SectionCard>

        {historicalPolicies.length ? (
          <SectionCard
            title="Riwayat polis"
            subtitle={
              showPolicyHistory
                ? "Cari nomor polis, nama produk, atau objek untuk membuka riwayat yang Anda perlukan."
                : "Riwayat tidak dibuka default agar halaman utama tetap fokus ke polis yang masih aktif."
            }
            className="bg-[#F1F3F5]"
          >
            {showPolicyHistory ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <ActionButton className="border border-[#D9E1EA] bg-white text-slate-700 hover:bg-slate-50" onClick={() => setShowPolicyHistory(false)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke polis aktif
                  </ActionButton>
                  <span className="inline-flex rounded-full bg-[#EAF3FF] px-3 py-1 text-[11px] font-semibold text-[#0A4D82]">
                    {filteredHistoricalPolicies.length} riwayat ditemukan
                  </span>
                </div>
                <HistorySearchField value={policyHistorySearch} onChange={setPolicyHistorySearch} placeholder="Cari nomor polis, produk, atau objek pertanggungan" />
                <div className="space-y-3">
                  {filteredHistoricalPolicies.length ? (
                    filteredHistoricalPolicies.map((policy) => (
                      <HistoryEntryCard key={policy.id} title={policy.product} meta={`${policy.policyNumber} - ${policy.objectName} - Berakhir ${policy.periodEnd}`} status={policy.status} tone={policy.tone} />
                    ))
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-sm text-slate-600">
                      Riwayat polis tidak ditemukan untuk kata kunci tersebut.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <HistoryLauncherCard
                title="Buka riwayat polis"
                helper="Masuk ke halaman riwayat bila Anda perlu melihat polis yang sudah berakhir atau mencari referensi lama."
                countLabel={`${historicalPolicies.length} polis lama`}
                actionLabel="Klik untuk buka riwayat"
                onOpen={() => setShowPolicyHistory(true)}
              />
            )}
          </SectionCard>
        ) : null}
      </div>

      <aside className="space-y-4 self-start xl:sticky xl:top-32">
        <SummaryPanel>
          <SummaryRows
            items={[
              { label: "Polis aktif", value: activePolicies.length },
              { label: "Klaim berjalan", value: activeClaimCount },
              { label: "Riwayat polis", value: historicalPolicies.length },
            ]}
          />
          <SummaryCallout
            title="Premi tahunan aktif"
            value={`Rp ${formatRupiah(totalAnnualPremium)}`}
            helper={nearestEndDate ? `Polis terdekat berakhir ${nearestEndDate}` : "Tidak ada polis aktif"}
          />
          <SummaryRows
            items={[
              { label: "Polis terdekat berakhir", value: nearestEndDate || "-" },
              { label: "Polis terkait klaim", value: activeClaimCount ? "Ada" : "Tidak ada" },
            ]}
          />
        </SummaryPanel>
      </aside>
    </div>
  );
}

function HelpView({ claims, contacts }) {
  const [openHelpId, setOpenHelpId] = useState("");
  const urgentClaimCount = claims.filter((item) => !item.settled && item.tone === "danger").length;

  return (
    <div className="space-y-6">
      {urgentClaimCount ? (
        <div className="max-w-[560px]">
          <SectionCard title="Bantuan cepat" subtitle="Jika ada klaim yang butuh tindakan cepat, gunakan kanal resmi ini lebih dulu.">
          <div className="flex flex-wrap gap-2">
            <LinkButton href="tel:1500073" className="bg-[#0A4D82] text-white hover:brightness-105">
              Hubungi Contact Center 1500-073
            </LinkButton>
            <LinkButton href="mailto:care@jasindo.co.id" className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
              Kirim email resmi
            </LinkButton>
          </div>
          </SectionCard>
        </div>
      ) : null}

      <div className="space-y-6">
        <SectionCard
          title="Pusat bantuan"
          subtitle="Klik setiap baris untuk melihat detail kanal bantuan resmi."
          className="bg-[#F1F3F5]"
        >
          <div className="space-y-3">
            {contacts.map((item) => {
              const Icon = item.icon;
              const open = openHelpId === item.label;
              return (
                <div key={item.label} className="overflow-hidden rounded-2xl border border-[#C9D8E8] bg-white shadow-sm">
                  <button type="button" onClick={() => setOpenHelpId((current) => (current === item.label ? "" : item.label))} className="w-full px-4 py-3.5 text-left">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F7FBFF] text-[#0A4D82] ring-1 ring-[#D6E4F1]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="clamp-1 text-[15px] font-semibold leading-6 text-[#00539F]">{item.label}</div>
                          <div className="mt-1 text-[12px] leading-5 text-[#5F7A99]">
                            {open ? item.value : <span className="clamp-1">{`${item.value} - ${item.helper}`}</span>}
                          </div>
                        </div>
                      </div>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white">
                        <ChevronDown className={cls("h-4 w-4 text-slate-500 transition-transform", open && "rotate-180")} />
                      </span>
                    </div>
                  </button>

                  {open ? (
                    <div className="border-t border-slate-200 bg-[#FBFDFF] px-4 py-4">
                      <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                        <div className="text-[15px] font-semibold leading-6 text-[#041E42]">Detail kanal bantuan</div>
                        <div className="mt-3 space-y-2 text-[14px] text-[#041E42]">
                          <div className="flex items-start justify-between gap-3">
                            <span>Kontak</span>
                            <span className="text-right font-semibold text-slate-900">{item.value}</span>
                          </div>
                          <div className="flex items-start justify-between gap-3">
                            <span>Keterangan</span>
                            <span className="text-right font-semibold text-slate-900">{item.helper}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <LinkButton href={item.href} className="bg-[#0A4D82] text-white hover:brightness-105">
                          Hubungi sekarang
                        </LinkButton>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </SectionCard>

        <CompactTipsAccordion
          title="Tips sebelum lapor klaim"
          subtitle="Buka bila Anda perlu pengingat singkat sebelum membuat laporan awal."
          tips={[
            "Pastikan nomor polis yang dipilih memang polis untuk kejadian tersebut.",
            "Tulis kronologi singkat yang jelas, tanpa harus panjang.",
            "Unggah dokumen yang benar-benar diminta, bukan semua file sekaligus.",
            "Pantau update di portal agar permintaan tambahan tidak terlewat.",
          ]}
        />
      </div>
    </div>
  );
}

function ReportClaimModal({ open, policies, onClose, onSubmit }) {
  const createInitialForm = () => ({
    policyId: policies[0]?.id || "",
    incidentDate: "",
    incidentType: "",
    location: "",
    chronology: "",
    contactPhone: "",
  });
  const [form, setForm] = useState({
    policyId: policies[0]?.id || "",
    incidentDate: "",
    incidentType: "",
    location: "",
    chronology: "",
    contactPhone: "",
  });
  const [submittedId, setSubmittedId] = useState("");
  const handleClose = () => {
    setSubmittedId("");
    setForm(createInitialForm());
    onClose();
  };

  if (!open) return null;

  const canSubmit = form.policyId && form.incidentDate && form.incidentType && form.location.trim() && form.chronology.trim() && form.contactPhone.trim();

  const handleSubmit = () => {
    const createdId = onSubmit(form);
    setSubmittedId(createdId);
  };

  return (
    <ModalShell title="Lapor klaim baru" subtitle="Isi laporan awal agar nomor referensi klaim dapat segera dibuat." onClose={handleClose}>
      {submittedId ? (
        <div className="space-y-4">
          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
            <div className="text-base font-bold text-slate-900">Laporan awal sudah tercatat</div>
            <div className="mt-2 text-sm leading-6 text-slate-700">Nomor referensi klaim Anda adalah <span className="font-bold">{submittedId}</span>. Langkah berikutnya adalah menunggu pengecekan awal dan melengkapi dokumen jika diminta.</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <ActionButton className="bg-[#0A4D82] text-white hover:brightness-105" onClick={handleClose}>Tutup</ActionButton>
            <LinkButton href="tel:1500073" className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">Hubungi Contact Center</LinkButton>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="mb-2 text-sm font-semibold text-slate-800">Pilih polis</div>
              <select value={form.policyId} onChange={(event) => setForm((prev) => ({ ...prev, policyId: event.target.value }))} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus-visible:border-[#0A4D82] focus-visible:ring-2 focus-visible:ring-[#0A4D82] focus-visible:ring-offset-2">
                {policies.map((policy) => <option key={policy.id} value={policy.id}>{policy.product}</option>)}
              </select>
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold text-slate-800">Tanggal kejadian</div>
              <input type="date" value={form.incidentDate} onChange={(event) => setForm((prev) => ({ ...prev, incidentDate: event.target.value }))} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus-visible:border-[#0A4D82] focus-visible:ring-2 focus-visible:ring-[#0A4D82] focus-visible:ring-offset-2" />
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold text-slate-800">Jenis kejadian</div>
              <input value={form.incidentType} onChange={(event) => setForm((prev) => ({ ...prev, incidentType: event.target.value }))} placeholder="Contoh: rawat inap, kerusakan kendaraan, kerusakan rumah" className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus-visible:border-[#0A4D82] focus-visible:ring-2 focus-visible:ring-[#0A4D82] focus-visible:ring-offset-2" />
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold text-slate-800">Nomor yang bisa dihubungi</div>
              <input value={form.contactPhone} onChange={(event) => setForm((prev) => ({ ...prev, contactPhone: event.target.value }))} placeholder="08xxxxxxxxxx" className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus-visible:border-[#0A4D82] focus-visible:ring-2 focus-visible:ring-[#0A4D82] focus-visible:ring-offset-2" />
            </div>
            <div className="md:col-span-2">
              <div className="mb-2 text-sm font-semibold text-slate-800">Lokasi kejadian</div>
              <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3">
                <MapPin className="h-4 w-4 text-slate-400" />
                <input value={form.location} onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))} placeholder="Tulis lokasi singkat kejadian" className="h-full w-full border-0 bg-transparent text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-[#0A4D82] focus-visible:ring-offset-2" />
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="mb-2 text-sm font-semibold text-slate-800">Kronologi singkat</div>
              <textarea value={form.chronology} onChange={(event) => setForm((prev) => ({ ...prev, chronology: event.target.value }))} rows={5} placeholder="Jelaskan kejadian secara singkat dan jelas." className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus-visible:border-[#0A4D82] focus-visible:ring-2 focus-visible:ring-[#0A4D82] focus-visible:ring-offset-2" />
            </div>
          </div>

          <div className="rounded-2xl bg-[#F7FBFF] px-4 py-4 text-sm leading-6 text-slate-700 ring-1 ring-[#D6E4F1]">
            Setelah laporan awal dikirim, portal akan menampilkan nomor referensi klaim dan daftar dokumen yang benar-benar diminta.
          </div>

          <div className="flex flex-wrap gap-2">
            <ActionButton className={cls(canSubmit ? "bg-[#0A4D82] text-white hover:brightness-105" : "cursor-not-allowed bg-slate-300 text-white")} onClick={handleSubmit} disabled={!canSubmit}>Kirim laporan awal</ActionButton>
            <ActionButton className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" onClick={handleClose}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Batal
            </ActionButton>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

function UploadDocumentsModal({ claim, open, onClose, onSubmit }) {
  const [checkedDocs, setCheckedDocs] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const handleClose = () => {
    setCheckedDocs([]);
    setSubmitted(false);
    onClose();
  };

  if (!open || !claim) return null;

  const toggleDoc = (doc) => {
    setCheckedDocs((prev) => (prev.includes(doc) ? prev.filter((item) => item !== doc) : [...prev, doc]));
  };

  const canSubmit = checkedDocs.length === claim.requiredDocs.length && claim.requiredDocs.length > 0;

  const handleSubmit = () => {
    onSubmit(claim.id);
    setSubmitted(true);
  };

  return (
    <ModalShell title={`Upload dokumen ${claim.id}`} subtitle="Kirim dokumen yang diminta agar proses klaim dapat dilanjutkan." onClose={handleClose}>
      {submitted ? (
        <div className="space-y-4">
          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
            <div className="text-base font-bold text-slate-900">Dokumen berhasil dikirim</div>
            <div className="mt-2 text-sm leading-6 text-slate-700">Status klaim diperbarui menjadi menunggu review dokumen. Portal akan memberi tahu jika masih ada kekurangan lain.</div>
          </div>
          <ActionButton className="bg-[#0A4D82] text-white hover:brightness-105" onClick={handleClose}>Tutup</ActionButton>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">Dokumen yang diminta</div>
            <div className="mt-3 space-y-3">
              {claim.requiredDocs.map((doc) => (
                <label key={doc} className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                  <input type="checkbox" checked={checkedDocs.includes(doc)} onChange={() => toggleDoc(doc)} className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0A4D82]" />
                  <span className="text-sm text-slate-700">{doc}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-[#F7FBFF] px-4 py-4 text-sm leading-6 text-slate-700 ring-1 ring-[#D6E4F1]">
            Pastikan semua dokumen yang diminta sudah siap sebelum Anda mengirimkannya.
          </div>
          <div className="flex flex-wrap gap-2">
            <ActionButton className={cls(canSubmit ? "bg-[#0A4D82] text-white hover:brightness-105" : "cursor-not-allowed bg-slate-300 text-white")} onClick={handleSubmit} disabled={!canSubmit}>Kirim dokumen</ActionButton>
            <ActionButton className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" onClick={onClose}>Tutup</ActionButton>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

export default function PersonalPolicyPortal({
  sessionName = "Dita (External)",
  sessionRoleLabel = "Eksternal",
  embedded = false,
  onGoHome,
  onExit,
  policies: incomingPolicies,
  claims: incomingClaims,
  billingItems: incomingBillingItems,
  contacts: incomingContacts,
  defaultTab = "claims",
}) {
  const portalModel = useMemo(
    () =>
      createSelfCarePortalModel({
        sessionName,
        policies: incomingPolicies,
        claims: incomingClaims,
        billingItems: incomingBillingItems,
        contacts: incomingContacts,
        defaultTab,
      }),
    [defaultTab, incomingBillingItems, incomingClaims, incomingContacts, incomingPolicies, sessionName],
  );
  const sourcePolicies = portalModel.policies;
  const sourceBillingItems = portalModel.billingItems;
  const sourceContacts = portalModel.contacts;
  const [claims, setClaims] = useState(portalModel.claims);
  const [selectedPolicyId, setSelectedPolicyId] = useState("");
  const [reportClaimOpen, setReportClaimOpen] = useState(false);
  const [uploadClaimId, setUploadClaimId] = useState("");
  const search = "";
  const [activeTab, setActiveTab] = useHashTab(portalModel.defaultTab);

  const visiblePolicies = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return sourcePolicies;
    return sourcePolicies.filter((item) =>
      [item.product, item.objectName, item.policyNumber, item.category].some((field) => String(field).toLowerCase().includes(keyword))
    );
  }, [search, sourcePolicies]);

  const uploadClaim = claims.find((item) => item.id === uploadClaimId) || null;

  const handleSubmitClaim = (form) => {
    const nextId = `CLM-${String(Date.now()).slice(-8)}`;
    setClaims((prev) => [
      {
        id: nextId,
        policyId: form.policyId,
        title: form.incidentType,
        lossDate: form.incidentDate,
        reportedDate: form.incidentDate,
        status: "Laporan diterima",
        tone: "warning",
        stage: 1,
        amount: "Menunggu review",
        nextAction: "Tim klaim sedang memeriksa laporan awal Anda. Dokumen yang diperlukan akan muncul di portal jika dibutuhkan.",
        dueLabel: "Menunggu pengecekan awal",
        assignedTo: "Tim klaim Jasindo",
        nextUpdate: "Status awal dikirim setelah pengecekan pertama.",
        requiredDocs: [],
        history: [{ date: form.incidentDate, text: "Laporan awal diterima dari portal." }],
        canUpload: false,
        settled: false,
      },
      ...prev,
    ]);
    setActiveTab("claims");
    return nextId;
  };

  const handleSubmitDocuments = (claimId) => {
    setClaims((prev) =>
      prev.map((item) =>
        item.id === claimId
          ? {
              ...item,
              status: "Menunggu review dokumen",
              tone: "warning",
              stage: 3,
              nextAction: "Dokumen sudah diterima. Tim klaim sedang meninjau kelengkapannya.",
              dueLabel: "Review dokumen berjalan",
              nextUpdate: "Jika ada kekurangan baru, portal akan memberi tahu lagi.",
              requiredDocs: [],
              canUpload: false,
              history: [{ date: "Hari ini", text: "Dokumen tambahan dikirim melalui portal." }, ...item.history],
            }
          : item
      )
    );
  };

  const content = (
    <>
      <section className={cls("bg-[#0A4D82] pb-12 pt-6 md:pb-16 md:pt-8", embedded && "bg-transparent p-0")}>
        <div className={cls("mx-auto max-w-[1280px] px-4 md:px-6", embedded && "max-w-[1480px] px-0")}>
            <div className="flex items-center justify-between gap-4">
              <button type="button" onClick={onExit || onGoHome} className="inline-flex items-center gap-2 rounded-[12px] border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/15">
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Produk
              </button>
              <div className="h-[48px] w-[140px] shrink-0 opacity-0" aria-hidden="true" />
            </div>

          <div className="mx-auto mt-8 max-w-[900px] text-center text-white md:mt-10">
            <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">Selamat datang kembali, {sessionName}</div>
            <div className="mt-6 text-[40px] font-black tracking-tight md:text-[48px]">
              {activeTab === "policies" ? "Polis Saya" : activeTab === "help" ? "Pusat Bantuan" : "Klaim Saya"}
            </div>
            <div className="mx-auto mt-4 max-w-[760px] text-[17px] leading-8 text-white/95">
              Pantau perlindungan aktif, tindak lanjut klaim, dan bantuan resmi Jasindo dengan alur yang ringkas dan terarah.
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-[900px] rounded-[28px] bg-white p-3 shadow-sm md:mt-10 md:p-5">
            <PortalTabs activeTab={activeTab} onChange={setActiveTab} />
          </div>
        </div>
      </section>

      <div className={cls("mx-auto max-w-[1280px] px-4 py-6 md:px-6 md:py-8", embedded && "max-w-[1480px] px-0 py-0")}>
        {activeTab === "policies" ? (
          <PoliciesView policies={visiblePolicies} claims={claims} billingItems={sourceBillingItems} selectedPolicyId={selectedPolicyId} setSelectedPolicyId={setSelectedPolicyId} />
        ) : activeTab === "help" ? (
          <HelpView claims={claims} contacts={sourceContacts} />
        ) : (
          <ClaimsView claims={claims} policies={sourcePolicies} onOpenUpload={(claim) => setUploadClaimId(claim.id)} onOpenReport={() => setReportClaimOpen(true)} />
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F3F5F7] text-slate-900">
      <BrandHeader
        onOpenHelp={() => setActiveTab("help")}
        onGoHome={onGoHome}
        embedded={embedded}
        sessionName={sessionName}
        sessionRoleLabel={sessionRoleLabel}
      />
      {content}
      <ReportClaimModal open={reportClaimOpen} policies={sourcePolicies} onClose={() => setReportClaimOpen(false)} onSubmit={handleSubmitClaim} />
      <UploadDocumentsModal claim={uploadClaim} open={Boolean(uploadClaim)} onClose={() => setUploadClaimId("")} onSubmit={handleSubmitDocuments} />
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
