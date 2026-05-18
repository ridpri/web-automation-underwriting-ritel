import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock3,
  FileText,
  Gauge,
  Home,
  LogOut,
  Search,
  Settings2,
  Shield,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
import { buildTimelineEvent, createOfferValidUntil, getEffectiveOperatingStatus } from "./operatingLayer.js";
import { buildInternalWorkspaceSummary, getInternalPortalMenus, getTaskListRecords } from "./workspacePortalModel.js";

function cls() {
  return Array.from(arguments).filter(Boolean).join(" ");
}

function displayWorkbenchStatus(status) {
  if (status === "Pending Review Internal") return "Menunggu Tinjauan Internal";
  if (status === "Paid") return "Selesai Dibayar";
  if (status === "Expired") return "Kedaluwarsa";
  if (status === "Rejected") return "Ditolak";
  return status;
}

function displayWorkbenchChannel(channel) {
  if (channel === "Internal Assisted") return "Dibantu Internal";
  if (channel === "Partner Portal") return "Portal Partner";
  if (channel === "Partner API") return "API Partner";
  return channel;
}

function statusClass(status) {
  const effectiveStatus = typeof status === "string" ? status : getEffectiveOperatingStatus(status);
  if (effectiveStatus === "Expired" || effectiveStatus === "Rejected") return "border-rose-200 bg-rose-50 text-rose-700";
  if (effectiveStatus === "Pending Review Internal" || effectiveStatus === "Perlu Revisi") return "border-amber-200 bg-amber-50 text-amber-700";
  if (effectiveStatus === "Siap Bayar" || effectiveStatus === "Paid") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-[#D9E1EA] bg-[#F6F8FA] text-[#5F7A99]";
}

function getInitials(name) {
  return String(name || "IW")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0])
    .join("")
    .toUpperCase();
}

function formatMenuIcon(menuKey) {
  if (menuKey === "dashboard") return Gauge;
  if (menuKey === "policies") return Shield;
  if (menuKey === "claims") return ShieldAlert;
  if (menuKey === "tasks") return ClipboardList;
  return Settings2;
}

function nextRevisionLabel(version = "Rev 1") {
  const current = Number(String(version || "").match(/\d+/)?.[0] || "1");
  return `Rev ${current + 1}`;
}

function workspaceActionItems(status) {
  if (status === "Expired") {
    return [
      { key: "reissue", label: "Buat Versi Baru", helper: "Membentuk revisi aktif dengan masa berlaku baru sebelum dikirim ulang." },
      { key: "handoff", label: "Kirim ke Staf", helper: "Masukkan kembali ke antrean review internal untuk disiapkan ulang." },
    ];
  }
  if (["Isi Data Lanjutan", "Indikasi Terkirim", "Dibuka Calon Tertanggung"].includes(status)) {
    return [
      { key: "remind", label: "Kirim Pengingat", helper: "Catat pengingat ke calon pemegang polis untuk melengkapi data." },
      { key: "assist", label: "Ambil Alih ke Staf", helper: "Pindahkan transaksi ke review internal karena calon pemegang polis butuh bantuan." },
    ];
  }
  if (["Pending Review Internal", "Perlu Revisi"].includes(status)) {
    return [
      { key: "approve", label: "Tandai Siap Bayar", helper: "Setujui versi aktif dan buka jalur final offer atau pembayaran." },
      { key: "request-revision", label: "Minta Revisi Data", helper: "Kembalikan transaksi ke status perlu revisi dengan alasan aktif." },
    ];
  }
  if (status === "Siap Bayar") {
    return [
      { key: "resend-final", label: "Kirim Ulang Link Final", helper: "Catat pengiriman ulang tautan pembayaran final." },
      { key: "expire-now", label: "Tandai Kedaluwarsa", helper: "Tutup versi aktif agar tidak bisa dibayar sebelum reissue." },
    ];
  }
  return [];
}

function buildWorkspaceActionPatch(actionKey, record, sessionName) {
  const actor = sessionName || "System";
  const eventText = {
    reissue: "Versi baru disiapkan karena penawaran sebelumnya kedaluwarsa.",
    handoff: "Transaksi dikirim kembali ke staf untuk penyiapan ulang.",
    remind: "Pengingat kelengkapan data dikirim ke calon pemegang polis.",
    assist: "Transaksi diambil alih staf untuk membantu pengisian data lanjutan.",
    approve: "Review selesai. Transaksi ditandai siap bayar.",
    "request-revision": "Transaksi dikembalikan untuk revisi data.",
    "resend-final": "Tautan final offer dikirim ulang ke calon pemegang polis.",
    "expire-now": "Versi aktif ditandai kedaluwarsa oleh staf.",
  }[actionKey] || "Status transaksi diperbarui.";
  const event = buildTimelineEvent(eventText, actor);
  const patch = {
    lastActivity: event.at,
    timeline: [event, ...(record.timeline || [])],
  };

  if (actionKey === "reissue") {
    return {
      ...patch,
      status: "Perlu Revisi",
      version: nextRevisionLabel(record.version),
      validUntil: createOfferValidUntil(7),
      reason: "Penawaran kedaluwarsa; siapkan versi baru sebelum dikirim ulang.",
      notes: "Versi sebelumnya tidak bisa dilanjutkan ke pembayaran karena masa berlaku telah berakhir.",
    };
  }
  if (actionKey === "handoff" || actionKey === "assist") {
    return {
      ...patch,
      status: "Pending Review Internal",
      reason: "Butuh bantuan staf asuransi",
      notes: "Calon pemegang polis membutuhkan bantuan staf sebelum proses dilanjutkan.",
    };
  }
  if (actionKey === "approve") {
    return {
      ...patch,
      status: "Siap Bayar",
      validUntil: createOfferValidUntil(7),
      reason: "",
      notes: "Review internal selesai. Penawaran final aktif dan siap dilanjutkan ke pembayaran.",
    };
  }
  if (actionKey === "request-revision") {
    return {
      ...patch,
      status: "Perlu Revisi",
      reason: "Perlu revisi data penawaran",
      notes: "Perubahan material harus dibuat sebagai revisi sebelum penawaran dikirim ulang.",
    };
  }
  if (actionKey === "expire-now") {
    return {
      ...patch,
      status: "Expired",
      reason: "Masa berlaku penawaran ditutup",
      notes: "Versi aktif ditutup dan perlu dibuatkan versi baru sebelum pembayaran.",
    };
  }
  return patch;
}

function matchesTaskScope(record, scope) {
  const status = getEffectiveOperatingStatus(record);
  if (scope === "review") return ["Pending Review Internal", "Perlu Revisi"].includes(status);
  if (scope === "waiting") return ["Isi Data Lanjutan", "Indikasi Terkirim", "Dibuka Calon Tertanggung"].includes(status);
  if (scope === "ready") return ["Siap Bayar", "Paid"].includes(status);
  if (scope === "expired") return status === "Expired";
  return true;
}

function recordMatchesFilter(record, filterKey) {
  const status = getEffectiveOperatingStatus(record);
  if (filterKey === "all") return true;
  if (filterKey === "action") return ["Pending Review Internal", "Perlu Revisi", "Isi Data Lanjutan", "Expired"].includes(status);
  if (filterKey === "review") return status === "Pending Review Internal";
  if (filterKey === "revision") return status === "Perlu Revisi";
  if (filterKey === "ready") return status === "Siap Bayar";
  if (filterKey === "done") return status === "Paid";
  return true;
}

function normalizeDefaultFilter(filterKey) {
  if (filterKey === "Perlu Ditindak") return "action";
  if (filterKey === "Menunggu Tinjauan") return "review";
  if (filterKey === "Perlu Revisi") return "revision";
  if (filterKey === "Selesai Dibayar") return "done";
  if (filterKey === "Semua") return "all";
  return filterKey || "all";
}

function taskScopeLabel(scope) {
  if (scope === "review") return "Perlu Saya Tinjau";
  if (scope === "waiting") return "Menunggu Respons";
  if (scope === "ready") return "Siap Kirim / Bayar";
  if (scope === "expired") return "Kedaluwarsa / Reissue";
  return "Semua Task";
}

function AppLogo() {
  return (
    <div className="flex items-center gap-4 text-white">
      <div className="leading-none">
        <div className="text-[14px] font-bold">Danantara</div>
        <div className="text-[13px] font-bold">Indonesia</div>
      </div>
      <div className="h-7 w-px bg-white/25" />
      <div className="leading-none">
        <div className="text-[18px] font-bold italic">J</div>
        <div className="-mt-1 text-[11px] font-semibold">asuransi jasindo</div>
      </div>
    </div>
  );
}

function TopBar({ sessionName, sessionRoleLabel, onGoHome, onGoProducts, accountMenuOpen, setAccountMenuOpen, onOpenWorkspace, onOpenPartnerConfig }) {
  return (
    <header className="fixed left-0 right-0 top-0 z-30 h-[52px] bg-[#004B78] text-white shadow-sm">
      <div className="flex h-full items-center justify-between px-5 md:px-[70px]">
        <AppLogo />
        <div className="hidden items-center gap-1 rounded-md bg-[#00436F] p-1 md:flex">
          <button type="button" onClick={onGoHome} className="inline-flex h-8 items-center gap-2 rounded px-3 text-[13px] font-semibold hover:bg-white/10">
            <Home className="h-4 w-4" />
            Beranda
          </button>
          <button type="button" onClick={onGoProducts} className="inline-flex h-8 items-center gap-2 rounded px-3 text-[13px] font-semibold hover:bg-white/10">
            <Shield className="h-4 w-4" />
            Produk
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 md:flex">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-[10px] font-bold text-red-600">ID</span>
            <span className="text-[12px] font-semibold">{sessionRoleLabel}</span>
          </div>
          <button type="button" className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/15">
            <Bell className="h-4 w-4" />
          </button>
          <div className="relative">
            <button type="button" onClick={() => setAccountMenuOpen((current) => !current)} className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-300 text-[12px] font-bold text-[#004B78]">{getInitials(sessionName)}</span>
              <span className="hidden text-[13px] font-bold md:inline">{sessionName}</span>
              <ChevronDown className={cls("hidden h-4 w-4 md:inline", accountMenuOpen && "rotate-180")} />
            </button>
            {accountMenuOpen ? (
              <div className="absolute right-0 top-[calc(100%+10px)] z-40 w-[220px] rounded-[14px] border border-[#D9E1EA] bg-white p-2 text-slate-900 shadow-[0_20px_45px_rgba(15,23,42,0.16)]">
                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    onOpenWorkspace?.();
                  }}
                  className="flex w-full items-center justify-center rounded-[10px] px-3 py-3 text-center text-sm font-semibold text-[#004B78] hover:bg-[#F7FAFD]"
                >
                  Ruang Kerja Saya
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    onOpenPartnerConfig?.();
                  }}
                  className="mt-1 flex w-full items-center justify-center rounded-[10px] px-3 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-[#F7FAFD]"
                >
                  Konfigurasi Partner
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

function Sidebar({ activeMenu, onMenuChange, sessionName, onExit }) {
  const menus = getInternalPortalMenus();
  return (
    <aside className="fixed bottom-0 left-0 top-[52px] z-20 hidden w-[270px] border-r border-[#D9E1EA] bg-white md:flex md:flex-col">
      <nav className="space-y-2 px-3 py-5">
        {menus.map((item) => {
          const Icon = formatMenuIcon(item.key);
          const active = activeMenu === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onMenuChange(item.key)}
              className={cls(
                "flex h-10 w-full items-center gap-3 rounded px-3 text-left text-[14px] font-semibold transition",
                active ? "bg-[#004B78] text-white" : "text-[#004B78] hover:bg-[#EEF5FA]",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto space-y-4 p-3">
        <div className="flex items-center gap-3 rounded-md bg-[#EAF0F4] p-2">
          <span className="grid h-9 w-9 place-items-center rounded bg-[#004B78] text-[12px] font-bold text-white">{getInitials(sessionName)}</span>
          <div className="min-w-0">
            <div className="truncate text-[12px] font-bold text-[#041E42]">{sessionName}</div>
            <div className="truncate text-[11px] text-[#5F7A99]">internal@asuransijasindo.co.id</div>
          </div>
        </div>
        <button type="button" onClick={onExit} className="flex h-10 items-center gap-3 px-2 text-[14px] font-medium text-red-500 hover:text-red-600">
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}

function MobileTabs({ activeMenu, onMenuChange }) {
  const menus = getInternalPortalMenus();
  return (
    <div className="mb-3 flex gap-1.5 overflow-x-auto md:hidden">
      {menus.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onMenuChange(item.key)}
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
    <main className="min-h-screen bg-white pt-[52px] md:pl-[270px]">
      <div className="px-3 py-3 md:px-[22px] md:py-5">{children}</div>
    </main>
  );
}

function WorkPanel({ children }) {
  return <section className="rounded-xl border border-[#D9E1EA] bg-[#F6F8FA] p-2 shadow-sm md:rounded-[20px] md:p-4">{children}</section>;
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
  return <span className={cls("inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold", tone)}>{children}</span>;
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
          <h1 className="text-[17px] font-bold leading-6 md:text-[20px] md:leading-7">{title}</h1>
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
        <div key={`${item.at || item.date}-${index}`} className="flex gap-3">
          <div className="mt-1 grid h-4 w-4 place-items-center rounded-full border-2 border-[#004B78] bg-white">
            <span className="h-1.5 w-1.5 rounded-full bg-[#004B78]" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#9AAAC0]">{item.at || item.date}</div>
            <div className="text-[12px] font-bold text-[#041E42]">{item.actor || "System"}</div>
            <div className="text-[12px] leading-5 text-[#5F7A99]">{item.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskScopeTabs({ activeScope, setActiveScope, records }) {
  const scopes = ["all", "review", "waiting", "ready", "expired"];
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {scopes.map((scope) => {
        const count = scope === "all" ? records.length : records.filter((item) => matchesTaskScope(item, scope)).length;
        return (
          <button
            key={scope}
            type="button"
            onClick={() => setActiveScope(scope)}
            className={cls(
              "inline-flex h-9 items-center gap-2 rounded-full border px-3 text-[12px] font-bold",
              activeScope === scope ? "border-[#004B78] bg-[#004B78] text-white" : "border-[#D9E1EA] bg-white text-[#304B68] hover:bg-[#F8FAFC]",
            )}
          >
            <span>{taskScopeLabel(scope)}</span>
            <span className={cls("rounded-full px-2 py-0.5 text-[11px]", activeScope === scope ? "bg-white/20 text-white" : "bg-[#EEF5FA] text-[#004B78]")}>{count}</span>
          </button>
        );
      })}
    </div>
  );
}

function RecordRow({ record, expanded, onToggle, onOpenJourney, onAction, actionItems }) {
  const status = getEffectiveOperatingStatus(record);
  return (
    <div className={cls("overflow-hidden rounded-xl border bg-white transition", expanded ? "border-[#004B78] shadow-[0_0_0_1px_#004B78]" : "border-[#D9E1EA]")}>
      <button type="button" onClick={onToggle} className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-2 px-3 py-2.5 text-left hover:bg-[#F8FAFC] sm:gap-3 sm:px-4 sm:py-3 lg:grid-cols-[minmax(220px,1.4fr)_minmax(180px,1fr)_140px_140px_120px_32px] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="truncate text-[13px] font-bold text-[#041E42] md:text-[14px]">{record.product}</div>
            <StatusBadge tone={statusClass(status)}>{displayWorkbenchStatus(status)}</StatusBadge>
          </div>
          <div className="mt-0.5 truncate text-[11px] text-[#5F7A99] md:mt-1 md:text-[12px]">{record.id}</div>
        </div>
        <div className="hidden min-w-0 sm:block">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9AAAC0]">Tertanggung</div>
          <div className="truncate text-[12px] font-semibold text-[#304B68]">{record.customer}</div>
        </div>
        <div className="hidden lg:block">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9AAAC0]">PIC</div>
          <div className="text-[12px] font-semibold text-[#304B68]">{record.owner}</div>
        </div>
        <div className="hidden lg:block">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9AAAC0]">Berlaku</div>
          <div className="text-[12px] font-semibold text-[#304B68]">{record.validUntil}</div>
        </div>
        <div className="hidden text-[12px] font-semibold text-[#5F7A99] sm:block">{displayWorkbenchChannel(record.channel)}</div>
        <div className="inline-flex items-center gap-1 self-start text-[11px] font-bold text-[#004B78] sm:self-auto md:text-[12px] lg:justify-self-end">
          <span className="hidden sm:inline">{expanded ? "Tutup" : "Detail"}</span>
          <ChevronDown className={cls("h-4 w-4 text-[#5F7A99] transition", expanded ? "rotate-180" : "")} />
        </div>
      </button>
      {expanded ? (
        <div className="border-t border-[#D9E1EA] bg-[#FBFCFD] p-2 md:p-3">
          <div className="space-y-3">
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              <InfoBox label="Versi" value={record.version} />
              <InfoBox label="SLA" value={record.sla} />
              <InfoBox label="Alasan" value={record.reason || "-"} />
              <InfoBox label="Aktivitas" value={record.lastActivity} />
            </div>
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-3">
                <SectionBox title="Catatan Transaksi" icon={ClipboardList}>
                  <div className="text-[12px] leading-5 text-[#5F7A99]">{record.notes}</div>
                </SectionBox>
                <SectionBox title="Linimasa" icon={Clock3}>
                  <Timeline items={record.timeline || []} />
                </SectionBox>
              </div>
              <div className="space-y-3">
                <SectionBox title="Aksi Cepat" icon={ShieldAlert}>
                  <div className="grid gap-2">
                    <button type="button" onClick={() => onOpenJourney(record)} className="inline-flex h-9 items-center justify-center rounded-lg bg-[#F2A62A] px-4 text-[12px] font-bold text-white hover:bg-[#DF9620]">
                      Buka Transaksi
                    </button>
                    {actionItems.length ? actionItems.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => onAction(item.key, record)}
                        className="rounded-lg border border-[#D9E1EA] bg-white px-3 py-2 text-left hover:bg-[#EEF5FA]"
                      >
                        <span className="block text-[12px] font-bold text-[#041E42]">{item.label}</span>
                        <span className="mt-1 block text-[11px] leading-4 text-[#5F7A99]">{item.helper}</span>
                      </button>
                    )) : (
                      <div className="rounded-lg border border-[#D9E1EA] bg-[#F8FAFC] px-3 py-2 text-[12px] leading-5 text-[#5F7A99]">
                        Tidak ada aksi tambahan untuk status ini.
                      </div>
                    )}
                  </div>
                </SectionBox>
                {record.flags?.length ? (
                  <SectionBox title="Penanda Review" icon={AlertTriangle}>
                    <div className="space-y-2">
                      {record.flags.map((flag) => (
                        <div key={flag} className="rounded-md border border-[#D9E1EA] bg-white px-3 py-2 text-[12px] leading-5 text-[#5F7A99]">
                          {flag}
                        </div>
                      ))}
                    </div>
                  </SectionBox>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-xl border border-dashed border-[#D9E1EA] bg-white px-4 py-6 text-center text-[12px] text-[#5F7A99]">
      {message}
    </div>
  );
}

function DashboardView({ title, subtitle, records, onMenuChange, onOpenJourney }) {
  const summary = buildInternalWorkspaceSummary(records);
  const taskRecords = getTaskListRecords(records);
  const priorityRecord =
    taskRecords.find((item) => ["Pending Review Internal", "Perlu Revisi"].includes(getEffectiveOperatingStatus(item))) ||
    taskRecords.find((item) => ["Isi Data Lanjutan", "Expired"].includes(getEffectiveOperatingStatus(item))) ||
    taskRecords[0];

  return (
    <WorkPanel>
      <div className="grid gap-2 md:gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
        <PageIntro
          title={title}
          description={subtitle}
          action={
            <button type="button" onClick={() => onMenuChange("claims")} className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#004B78] px-4 text-[12px] font-bold text-white hover:bg-[#003F65]">
              <ShieldAlert className="h-4 w-4" />
              Review Queue
            </button>
          }
        />
        <div className="rounded-xl border border-[#D9E1EA] bg-[#004B78] p-3 text-white md:p-5">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/70 md:text-[12px] md:tracking-[0.16em]">Prioritas Saat Ini</div>
          <div className="mt-2 text-[15px] font-bold md:mt-3 md:text-[18px]">{priorityRecord ? priorityRecord.product : "Belum ada task aktif"}</div>
          <div className="mt-1 text-[12px] leading-5 text-white/80 md:mt-2 md:text-[13px] md:leading-6">
            {priorityRecord ? priorityRecord.reason || priorityRecord.notes : "Saat ini belum ada transaksi yang perlu perhatian segera."}
          </div>
          <button
            type="button"
            onClick={() => {
              if (priorityRecord) onOpenJourney(priorityRecord);
              else onMenuChange("tasks");
            }}
            className="mt-3 h-8 rounded-lg bg-white px-3 text-[11px] font-bold text-[#004B78] hover:bg-slate-100 md:mt-4 md:h-9 md:px-4 md:text-[12px]"
          >
            {priorityRecord ? "Buka Transaksi" : "Lihat Task List"}
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 md:gap-3 xl:grid-cols-4">
        <InfoBox label="Total Transaksi" value={`${summary.total} item`} />
        <InfoBox label="Perlu Tindakan" value={`${summary.needAction} item`} />
        <InfoBox label="Menunggu Review" value={`${summary.reviewCount} item`} />
        <InfoBox label="Siap / Selesai" value={`${summary.readyCount} item`} />
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_380px]">
        <SectionBox title="Yang Perlu Anda Tahu" icon={ClipboardList}>
          <div className="grid gap-2">
            <SmallActionCard icon={ClipboardList} title="Task List" helper="Buka daftar kerja aktif per transaksi." onClick={() => onMenuChange("tasks")} tone="brand" />
            <SmallActionCard icon={ShieldAlert} title="Review Queue" helper="Fokus ke transaksi yang perlu review, revisi, dan reissue." onClick={() => onMenuChange("claims")} />
            <SmallActionCard icon={Shield} title="Semua Transaksi" helper="Pantau semua transaksi internal lintas produk." onClick={() => onMenuChange("policies")} />
          </div>
        </SectionBox>
        <div className="space-y-3">
          <SectionBox title="Akses Cepat" icon={Gauge}>
            <div className="grid grid-cols-2 gap-2">
              <SmallActionCard icon={ClipboardList} title="Task Aktif" helper="Lanjut kerja" onClick={() => onMenuChange("tasks")} tone="brand" />
              <SmallActionCard icon={ShieldAlert} title="Review Queue" helper="Prioritas staf" onClick={() => onMenuChange("claims")} />
              <SmallActionCard icon={Shield} title="Semua Transaksi" helper="Lihat portofolio lengkap" onClick={() => onMenuChange("policies")} />
              <SmallActionCard icon={Settings2} title="Partner Config" helper="Atur studio partner" onClick={() => onMenuChange("settings")} />
            </div>
          </SectionBox>
          <SectionBox title="Transaksi Prioritas" icon={Clock3}>
            <div className="space-y-2">
              {taskRecords.slice(0, 3).map((record) => (
                <div key={record.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#D9E1EA] bg-[#F8FAFC] px-3 py-2">
                  <div className="min-w-0">
                    <div className="truncate text-[12px] font-bold text-[#041E42]">{record.product}</div>
                    <div className="truncate text-[11px] text-[#5F7A99]">{record.customer}</div>
                  </div>
                  <div className="shrink-0 text-[11px] font-bold text-[#5F7A99]">{displayWorkbenchStatus(getEffectiveOperatingStatus(record))}</div>
                </div>
              ))}
            </div>
          </SectionBox>
        </div>
      </div>
    </WorkPanel>
  );
}

function RecordsView({ title, description, records, search, setSearch, activeFilter, setActiveFilter, expandedId, setExpandedId, onOpenJourney, onAction, emptyMessage }) {
  const filters = [
    { key: "all", label: "Semua" },
    { key: "action", label: "Perlu Tindakan" },
    { key: "review", label: "Review" },
    { key: "revision", label: "Revisi" },
    { key: "ready", label: "Siap Bayar" },
    { key: "done", label: "Selesai" },
  ];
  const keyword = search.trim().toLowerCase();
  const filteredRecords = records.filter((record) => {
    const matchesKeyword = !keyword || [record.id, record.product, record.customer, record.owner, record.reason].some((field) => String(field || "").toLowerCase().includes(keyword));
    return matchesKeyword && recordMatchesFilter(record, activeFilter);
  });

  useEffect(() => {
    if (filteredRecords.length && !filteredRecords.some((item) => item.id === expandedId)) {
      setExpandedId(filteredRecords[0].id);
    }
    if (!filteredRecords.length) {
      setExpandedId("");
    }
  }, [expandedId, filteredRecords, setExpandedId]);

  return (
    <div className="space-y-3">
      <PageIntro title={title} description={description} />

      <WorkPanel>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <InfoBox label="Total" value={`${records.length} item`} />
          <InfoBox label="Review" value={`${records.filter((item) => matchesTaskScope(item, "review")).length} item`} />
          <InfoBox label="Menunggu" value={`${records.filter((item) => matchesTaskScope(item, "waiting")).length} item`} />
          <InfoBox label="Kedaluwarsa" value={`${records.filter((item) => matchesTaskScope(item, "expired")).length} item`} />
        </div>
      </WorkPanel>

      <WorkPanel>
        <Toolbar search={search} setSearch={setSearch} activeFilter={activeFilter} setActiveFilter={setActiveFilter} filters={filters} />
        <div className="mt-3 space-y-2">
          {filteredRecords.length ? (
            filteredRecords.map((record) => {
              const status = getEffectiveOperatingStatus(record);
              return (
                <RecordRow
                  key={record.id}
                  record={record}
                  expanded={expandedId === record.id}
                  onToggle={() => setExpandedId(expandedId === record.id ? "" : record.id)}
                  onOpenJourney={onOpenJourney}
                  onAction={onAction}
                  actionItems={workspaceActionItems(status)}
                />
              );
            })
          ) : (
            <EmptyState message={emptyMessage} />
          )}
        </div>
      </WorkPanel>
    </div>
  );
}

function TaskListView({ records, search, setSearch, activeFilter, setActiveFilter, activeScope, setActiveScope, expandedId, setExpandedId, onOpenJourney, onAction }) {
  const scopeRecords = records.filter((record) => matchesTaskScope(record, activeScope));
  return (
    <div className="space-y-3">
        <PageIntro
        title="Task List"
        description="Daftar kerja internal untuk task aktif, tindak lanjut, dan eksekusi transaksi lintas produk."
        action={<StatusBadge tone="border-[#B8D7EF] bg-[#F1F8FE] text-[#004B78]">{`${scopeRecords.length} task aktif`}</StatusBadge>}
      />

      <WorkPanel>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <InfoBox label="Total Task" value={`${records.length} item`} />
          <InfoBox label="Perlu Review" value={`${records.filter((item) => matchesTaskScope(item, "review")).length} item`} />
          <InfoBox label="Menunggu Respons" value={`${records.filter((item) => matchesTaskScope(item, "waiting")).length} item`} />
          <InfoBox label="Siap / Bayar" value={`${records.filter((item) => matchesTaskScope(item, "ready")).length} item`} />
        </div>
        <TaskScopeTabs activeScope={activeScope} setActiveScope={setActiveScope} records={records} />
      </WorkPanel>

      <RecordsView
        title="Task operasional"
        description="Pilih satu task untuk membuka detail, lanjutkan review, atau buka transaksi asal."
        records={scopeRecords}
        search={search}
        setSearch={setSearch}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        expandedId={expandedId}
        setExpandedId={setExpandedId}
        onOpenJourney={onOpenJourney}
        onAction={onAction}
        emptyMessage="Belum ada task yang cocok dengan filter ini."
      />
    </div>
  );
}

export default function ReviewWorkbench({
  records,
  allRecords,
  onBack,
  onOpenJourney,
  title = "Tinjauan Internal",
  subtitle = "Antrean operasional lintas produk untuk transaksi yang perlu dipantau, ditinjau, atau ditindaklanjuti.",
  emptyMessage = "Belum ada transaksi yang cocok dengan filter saat ini.",
  defaultFilter = "all",
  showWorkspaceRail = false,
  defaultWorkspaceLane = "review",
  sessionName = "Taqwim (Internal)",
  sessionRoleLabel = "Internal",
  onNavigateHome,
  onNavigateProducts,
  onOpenWorkspace,
  onOpenQueue,
  onOpenPartnerConfig,
  onUpdateRecord,
  defaultMenu,
}) {
  const resolvedDefaultMenu = defaultMenu || (showWorkspaceRail ? "dashboard" : "claims");
  const [activeMenu, setActiveMenu] = useState(resolvedDefaultMenu);
  const [activeFilter, setActiveFilter] = useState(normalizeDefaultFilter(defaultFilter));
  const [activeScope, setActiveScope] = useState(showWorkspaceRail ? defaultWorkspaceLane : "all");
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const transactionRecords = allRecords?.length ? allRecords : records;
  const openTaskRecords = useMemo(() => getTaskListRecords(records), [records]);
  const queueRecords = useMemo(() => transactionRecords.filter((item) => ["Pending Review Internal", "Perlu Revisi", "Isi Data Lanjutan", "Expired"].includes(getEffectiveOperatingStatus(item))), [transactionRecords]);

  const handleAction = (actionKey, record) => {
    if (!onUpdateRecord) return;
    onUpdateRecord(record.id, buildWorkspaceActionPatch(actionKey, record, sessionName));
  };

  const handleMenuChange = (nextMenu) => {
    if (nextMenu === "settings") {
      onOpenPartnerConfig?.();
      return;
    }
    if (nextMenu === "claims" && !showWorkspaceRail) {
      onOpenQueue?.();
    }
    setActiveMenu(nextMenu);
  };

  const workspaceTitle = showWorkspaceRail ? "Ruang Kerja Saya" : title;
  const workspaceSubtitle = showWorkspaceRail
    ? `Transaksi yang saat ini menjadi tanggung jawab ${sessionName}. Tampilan workspace ini mengikuti portal eksternal, dengan Task List sebagai pusat kerja operasional.`
    : subtitle;

  let content = null;
  if (activeMenu === "dashboard") {
    content = <DashboardView title={workspaceTitle} subtitle={workspaceSubtitle} records={records} onMenuChange={handleMenuChange} onOpenJourney={onOpenJourney} />;
  } else if (activeMenu === "policies") {
    content = (
      <RecordsView
        title="Semua transaksi"
        description="Portofolio transaksi underwriting lintas produk yang sedang berjalan di jalur internal."
        records={transactionRecords}
        search={query}
        setSearch={setQuery}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        expandedId={expandedId}
        setExpandedId={setExpandedId}
        onOpenJourney={onOpenJourney}
        onAction={handleAction}
        emptyMessage={emptyMessage}
      />
    );
  } else if (activeMenu === "claims") {
    content = (
      <RecordsView
        title="Review Queue"
        description="Antrean review internal untuk transaksi yang perlu keputusan staf, revisi, tindak lanjut, atau reissue."
        records={queueRecords}
        search={query}
        setSearch={setQuery}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        expandedId={expandedId}
        setExpandedId={setExpandedId}
        onOpenJourney={onOpenJourney}
        onAction={handleAction}
        emptyMessage="Belum ada transaksi yang masuk antrean review internal."
      />
    );
  } else if (activeMenu === "tasks") {
    content = (
      <TaskListView
        records={openTaskRecords}
        search={query}
        setSearch={setQuery}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        activeScope={activeScope}
        setActiveScope={setActiveScope}
        expandedId={expandedId}
        setExpandedId={setExpandedId}
        onOpenJourney={onOpenJourney}
        onAction={handleAction}
      />
    );
  } else {
    content = null;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <TopBar
        sessionName={sessionName}
        sessionRoleLabel={sessionRoleLabel}
        onGoHome={onNavigateHome || onBack}
        onGoProducts={onNavigateProducts || onBack}
        accountMenuOpen={accountMenuOpen}
        setAccountMenuOpen={setAccountMenuOpen}
        onOpenWorkspace={onOpenWorkspace}
        onOpenPartnerConfig={onOpenPartnerConfig}
      />
      <Sidebar activeMenu={activeMenu} onMenuChange={handleMenuChange} sessionName={sessionName} onExit={onBack} />
      <PageShell>
        <MobileTabs activeMenu={activeMenu} onMenuChange={handleMenuChange} />
        {content}
      </PageShell>
    </div>
  );
}
