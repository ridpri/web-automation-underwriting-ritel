import React, { useState } from "react";
import { Bell, ChevronDown, ClipboardList, FileText, Gauge, Headphones, Home, LogOut, Search, Settings, Shield, ShoppingCart, SlidersHorizontal } from "lucide-react";
import { cls, formatRupiah, getInitials, statusClass } from "../portalUtils.js";

export function AppLogo() {
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

export function TopBar({ sessionName, onGoHome, onExit }) {
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-30 h-[52px] bg-[#004B78] text-white shadow-sm">
      <div className="flex h-full items-center justify-between px-5 md:px-[70px]">
        <AppLogo />
        <div className="hidden items-center gap-1 rounded-md bg-[#00436F] p-1 md:flex">
          <button type="button" onClick={onGoHome} className="inline-flex h-8 items-center gap-2 rounded px-3 text-[13px] font-semibold hover:bg-white/10">
            <Home className="h-4 w-4" />
            Beranda
          </button>
          <button type="button" className="inline-flex h-8 items-center gap-2 rounded px-3 text-[13px] font-semibold hover:bg-white/10">
            <Shield className="h-4 w-4" />
            Produk
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 md:flex">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-[10px] font-bold text-red-600">ID</span>
            <span className="text-[12px] font-semibold">ID</span>
          </div>
          <button type="button" className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/15">
            <Bell className="h-4 w-4" />
          </button>
          <div className="relative" onMouseLeave={() => setAccountOpen(false)}>
            <button
              type="button"
              onClick={() => setAccountOpen((open) => !open)}
              className="flex h-9 items-center gap-2 rounded-full px-1.5 pr-2 hover:bg-white/10"
              aria-expanded={accountOpen}
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-300 text-[12px] font-bold text-[#004B78]">{getInitials(sessionName)}</span>
              <span className="hidden text-[13px] font-bold md:inline">{sessionName}</span>
              <ChevronDown className={cls("hidden h-4 w-4 transition md:block", accountOpen ? "rotate-180" : "")} />
            </button>
            {accountOpen ? (
              <div className="absolute right-0 mt-2 w-[220px] overflow-hidden rounded-lg border border-[#D9E1EA] bg-white text-[#041E42] shadow-xl">
                <div className="border-b border-[#EEF2F6] px-3 py-2.5">
                  <div className="truncate text-[12px] font-bold">{sessionName}</div>
                  <div className="truncate text-[11px] text-[#5F7A99]">portal@asuransijasindo.co.id</div>
                </div>
                <button type="button" onClick={onExit} className="flex h-10 w-full items-center gap-2 px-3 text-left text-[12px] font-bold text-red-500 hover:bg-red-50">
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

export function Sidebar({ activeMenu, setActiveMenu }) {
  const menus = [
    { key: "dashboard", label: "Dashboard", icon: Gauge },
    { key: "policies", label: "Polis Saya", icon: ClipboardList },
    { key: "claims", label: "Klaim Saya", icon: FileText },
    { key: "cart", label: "Keranjang", icon: ShoppingCart },
    { key: "help", label: "Bantuan", icon: Headphones },
    { key: "settings", label: "Setelan", icon: Settings },
  ];

  return (
    <aside className="fixed bottom-0 left-0 top-[52px] z-20 hidden w-[270px] border-r border-[#D9E1EA] bg-white md:flex md:flex-col">
      <nav className="space-y-2 px-3 py-5">
        {menus.map((item) => {
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
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto p-3" />
    </aside>
  );
}

export function MobileTabs({ activeMenu, setActiveMenu }) {
  const menus = [
    { key: "dashboard", label: "Dashboard" },
    { key: "policies", label: "Polis" },
    { key: "claims", label: "Klaim" },
    { key: "cart", label: "Keranjang" },
    { key: "help", label: "Bantuan" },
    { key: "settings", label: "Setelan" },
  ];

  return (
    <div className="mb-3 flex gap-1.5 overflow-x-auto md:hidden">
      {menus.map((item) => (
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

export function PageShell({ children }) {
  return (
    <main className="min-h-screen bg-white pt-[52px] md:pl-[270px]">
      <div className="px-3 py-3 md:px-[22px] md:py-5">{children}</div>
    </main>
  );
}

export function WorkPanel({ children }) {
  return <section className="rounded-xl border border-[#D9E1EA] bg-[#F6F8FA] p-2 shadow-sm md:rounded-[20px] md:p-4">{children}</section>;
}

export function Toolbar({ search, setSearch, activeFilter, setActiveFilter, filters }) {
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

export function StatusBadge({ children, tone }) {
  return <span className={cls("inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold", statusClass(tone))}>{children}</span>;
}

export function InfoBox({ label, value }) {
  return (
    <div className="rounded-lg border border-[#D9E1EA] bg-white px-2.5 py-2 md:px-3 md:py-2.5">
      <div className="truncate text-[9px] font-bold uppercase tracking-[0.08em] text-[#9AAAC0] md:text-[10px] md:tracking-[0.16em]">{label}</div>
      <div className="mt-0.5 truncate text-[12px] font-bold text-[#041E42] md:mt-1 md:text-[13px]">{value || "-"}</div>
    </div>
  );
}

export function SectionBox({ title, icon = Shield, children }) {
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

export function PageIntro({ title, description, action, tone = "light" }) {
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

export function SmallActionCard({ icon = Shield, title, helper, onClick, tone = "default" }) {
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

export function Timeline({ items }) {
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

export function PolicyRow({ policy, selected, onClick, policyClaim, policyBilling, children }) {
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

export function ClaimRow({ claim, policy, selected, onClick, children }) {
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
