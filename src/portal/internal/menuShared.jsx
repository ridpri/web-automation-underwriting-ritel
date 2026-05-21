import React, { useState } from "react";
import { Building2, Car, CheckCircle2, ChevronDown, ClipboardList, Copy, CreditCard, Download, FileText, Gauge, Grid2X2, Headphones, Home, Mail, Search, Shield, SlidersHorizontal, User } from "lucide-react";

import { PRODUCTS, productBaseUrl, productTrackedUrl } from "./menuData.js";

export function cls(...classes) {
  return classes.filter(Boolean).join(" ");
}

function staffStatusTone(value) {
  const normalized = String(value || "").toLowerCase();
  if (/(aktif|terbit|selesai|lunas|disetujui)/.test(normalized)) return "success";
  if (/(tidak aktif|ditolak|gagal|expired|berakhir)/.test(normalized)) return "danger";
  if (/(menunggu|butuh|validasi|review|checker|maker|proses)/.test(normalized)) return "warning";
  return "default";
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

export function WorkPanel({ children }) {
  return <section className="rounded-xl border border-[#D9E1EA] bg-[#F6F8FA] p-2 shadow-sm md:rounded-[20px] md:p-4">{children}</section>;
}

export function FilterPills({ items, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button key={item} type="button" onClick={() => onChange(item)} className={cls("inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[12px] font-bold", active === item ? "border-[#004B78] bg-[#004B78] text-white" : "border-[#D9E1EA] bg-white text-[#5F7A99] hover:bg-[#F6F8FA]")}>
          {item}
        </button>
      ))}
    </div>
  );
}

export function PageIntro({ title, description, action, tone = "light" }) {
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

export function StaffBadge({ children }) {
  return <span className={cls("inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold", statusClass(staffStatusTone(children)))}>{children}</span>;
}

export function StaffStat({ icon = Shield, title, value, note }) {
  const Icon = icon;
  return (
    <div className="rounded-xl border border-[#D9E1EA] bg-white p-3 md:p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#EEF5FA] text-[#004B78]"><Icon className="h-5 w-5" /></div>
        <div className="min-w-0">
          <div className="text-[12px] font-bold text-[#304B68]">{title}</div>
          <div className="mt-1 text-[24px] font-bold leading-none text-[#041E42]">{value}</div>
          <div className="mt-1 text-[11px] leading-4 text-[#5F7A99]">{note}</div>
        </div>
      </div>
    </div>
  );
}

export function StaffTaskTable({ rows, title }) {
  return (
    <SectionBox title={title} icon={ClipboardList}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-[#FFF4D6] px-3 py-1 text-[11px] font-bold text-[#A86D00]">{rows.length} Ditampilkan</span>
      </div>
      <div className="overflow-auto rounded-xl border border-[#D9E1EA] bg-white">
        <table className="w-full min-w-[980px] text-left text-[12px]">
          <thead className="bg-[#EEF5FA] text-[10px] uppercase tracking-[0.12em] text-[#004B78]">
            <tr><th className="px-3 py-3">Nasabah</th><th className="px-3 py-3">Produk</th><th className="px-3 py-3">Pipeline</th><th className="px-3 py-3">Detail Status</th><th className="px-3 py-3">Owner</th><th className="px-3 py-3">SLA</th><th className="px-3 py-3">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-[#E7EDF4]">
            {rows.map((row) => (
              <tr key={row.email} className="hover:bg-[#F8FAFC]">
                <td className="px-3 py-3"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-[#EEF5FA] text-[11px] font-black text-[#004B78]">{row.avatar}</div><div><div className="font-bold text-[#041E42]">{row.name}</div><div className="text-[11px] text-[#5F7A99]">{row.email}</div></div></div></td>
                <td className="px-3 py-3 font-semibold text-[#304B68]">{row.product}</td>
                <td className="px-3 py-3"><StaffBadge>{row.pipeline}</StaffBadge></td>
                <td className="px-3 py-3"><StaffBadge>{row.detail}</StaffBadge></td>
                <td className="px-3 py-3"><StaffBadge>{row.owner}</StaffBadge></td>
                <td className="px-3 py-3 font-bold text-rose-600">{row.sla}</td>
                <td className="px-3 py-3"><button type="button" className={cls("rounded-md px-3 py-1.5 text-[11px] font-bold", row.detail === "Butuh Assist Internal" ? "bg-[#F2A62A] text-white" : "border border-[#D9E1EA] bg-white text-[#004B78] hover:bg-[#EEF5FA]")}>{row.action}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionBox>
  );
}

export function StaffPipeline() {
  const steps = [
    { label: "Penawaran Dikirim", value: 42, icon: Mail, tone: "default" },
    { label: "Menunggu Data", value: 21, icon: FileText, tone: "warning" },
    { label: "Menunggu Bayar", value: 15, icon: CreditCard, tone: "warning" },
    { label: "Polis Terbit", value: 10, icon: CheckCircle2, tone: "success" },
  ];
  return (
    <SectionBox title="Pipeline Pendampingan Nasabah" icon={Gauge}>
      <div className="grid gap-2 md:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return <div key={step.label} className={cls("rounded-xl border p-3 text-center", statusClass(step.tone))}><div className="mx-auto grid h-10 w-10 place-items-center rounded-full border bg-white"><Icon className="h-5 w-5" /></div><div className="mx-auto mt-2 grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-bold">{index + 1}</div><div className="mt-2 text-[12px] font-bold text-[#304B68]">{step.label}</div><div className="mt-1 text-[26px] font-bold">{step.value}</div></div>;
        })}
      </div>
    </SectionBox>
  );
}

export function ProductCategoryIcon({ category }) {
  const iconMap = { "Kecelakaan Diri": User, "Harta Benda": Home, Kendaraan: Car };
  const Icon = iconMap[category] || FileText;
  return <Icon className="production-product-card__tag-icon" aria-hidden="true" />;
}

function productSlug(product) {
  return product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function qrImageUrl(product) {
  return `https://quickchart.io/qr?text=${encodeURIComponent(productTrackedUrl(product))}&size=480&margin=2&format=png`;
}

function WhatsAppLogo({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="currentColor">
      <path d="M16.02 3.2c-7.03 0-12.75 5.7-12.75 12.72 0 2.25.59 4.45 1.72 6.38L3.16 29l6.85-1.8a12.7 12.7 0 0 0 6 1.52h.01c7.03 0 12.75-5.7 12.75-12.73S23.05 3.2 16.02 3.2Zm0 23.36h-.01c-1.9 0-3.76-.51-5.39-1.47l-.39-.23-4.06 1.07 1.08-3.96-.26-.41a10.56 10.56 0 0 1-1.62-5.64c0-5.84 4.77-10.59 10.65-10.59 2.84 0 5.52 1.1 7.53 3.1a10.51 10.51 0 0 1 3.12 7.5c0 5.83-4.78 10.58-10.65 10.58Zm5.83-7.92c-.32-.16-1.9-.93-2.19-1.04-.3-.11-.51-.16-.73.16-.21.32-.83 1.04-1.02 1.25-.19.21-.38.24-.7.08-.32-.16-1.36-.5-2.6-1.6a9.8 9.8 0 0 1-1.8-2.24c-.19-.32-.02-.49.14-.65.15-.14.32-.38.48-.57.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.57-.08-.16-.73-1.75-1-2.4-.26-.63-.53-.54-.73-.55h-.62c-.21 0-.56.08-.85.4-.3.32-1.12 1.1-1.12 2.67 0 1.58 1.15 3.1 1.31 3.31.16.21 2.27 3.46 5.5 4.85.77.33 1.37.53 1.84.68.77.24 1.47.21 2.02.13.62-.09 1.9-.77 2.17-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}

async function copyProductLink(product, onDone) {
  const url = productTrackedUrl(product);
  try {
    await navigator.clipboard?.writeText(url);
    onDone("Tersalin");
  } catch {
    onDone("Gagal salin");
  }
}

async function downloadProductQr(product) {
  const fileName = `qr-${productSlug(product)}.png`;
  try {
    const response = await fetch(qrImageUrl(product));
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch {
    const link = document.createElement("a");
    link.href = qrImageUrl(product);
    link.download = fileName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

function ProductShareActions({ product, inline = false }) {
  const [copyLabel, setCopyLabel] = useState("Salin Link");
  const trackedUrl = productTrackedUrl(product);
  const whatsappText = `Halo Bapak/Ibu, saya ingin membagikan informasi produk ${product.title} dari Asuransi Jasindo. Silakan cek detail produk dan lanjutkan pengajuan melalui link berikut: ${trackedUrl}`;
  const buttonClass = "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#D9E1EA] bg-white px-2.5 text-[11px] font-bold text-[#004B78] hover:bg-[#EEF5FA]";
  const whatsappUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;

  function markCopied(label) {
    setCopyLabel(label);
    window.setTimeout(() => setCopyLabel("Salin Link"), 1400);
  }

  const actions = (
    <>
      <button type="button" onClick={() => copyProductLink(product, markCopied)} className={buttonClass}>
        <Copy className="h-3.5 w-3.5" />
        {copyLabel}
      </button>
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={buttonClass}>
        <WhatsAppLogo className="h-4 w-4 text-[#25D366]" />
        WhatsApp
      </a>
      <button type="button" onClick={() => downloadProductQr(product)} className={buttonClass}>
        <Download className="h-3.5 w-3.5" />
        Unduh QR
      </button>
    </>
  );

  if (inline) return actions;
  return (
    <div className="grid grid-cols-2 gap-2">
      {actions}
    </div>
  );
}

export function ProductCard({ product }) {
  return (
    <div className="w-[200px]">
      <div className="production-product-card block">
        <img src={product.image} alt="" width="640" height="720" loading="lazy" decoding="async" className="production-product-card__image" />
        <span className="production-product-card__shade" />
        <span className="production-product-card__tag"><ProductCategoryIcon category={product.category} /><span>{product.category}</span></span>
        <span className="production-product-card__title">{product.title}</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <a href={productBaseUrl(product)} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center justify-center rounded-lg bg-[#F2A62A] px-2 text-center text-[11px] font-bold leading-4 text-white hover:bg-[#DF9620]">Buat Penawaran</a>
        <ProductShareActions product={product} inline />
      </div>
    </div>
  );
}

export function ProductListItem({ product }) {
  return (
    <div className="grid gap-3 rounded-xl border border-[#D9E1EA] bg-white p-3 transition hover:border-[#004B78]/50 hover:bg-[#F8FAFC] md:grid-cols-[150px_minmax(0,1fr)_320px] md:items-center">
      <img src={product.image} alt={product.title} className="h-[120px] w-full rounded-lg object-cover md:h-[96px]" loading="lazy" />
      <div><div className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF5FA] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#004B78]"><ProductCategoryIcon category={product.category} />{product.category}</div><div className="mt-2 text-[14px] font-bold leading-5 text-[#041E42] md:text-[15px]">{product.title}</div><div className="mt-1 text-[12px] leading-5 text-[#5F7A99]">{product.desc}</div></div>
      <div className="grid grid-cols-2 gap-2"><a href={productBaseUrl(product)} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center justify-center rounded-lg bg-[#F2A62A] px-2 text-center text-[11px] font-bold leading-4 text-white hover:bg-[#DF9620]">Buat Penawaran</a><ProductShareActions product={product} inline /></div>
    </div>
  );
}

export function StaffField({ label, placeholder, type = "text", prefix, suffix, value, onChange }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9AAAC0]">{label}</span>
      <div className="mt-1 flex rounded-lg border border-[#D9E1EA] bg-white">
        {prefix ? <span className="grid place-items-center px-3 text-[12px] font-bold text-[#5F7A99]">{prefix}</span> : null}
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-10 min-w-0 flex-1 rounded-lg border-0 bg-transparent px-3 text-[13px] font-semibold text-[#041E42] outline-none placeholder:text-[#9AAAC0]" />
        {suffix ? <span className="grid place-items-center px-3 text-[12px] font-bold text-[#5F7A99]">{suffix}</span> : null}
      </div>
    </label>
  );
}

export function PromoProductPicker({ selected, onToggle }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((current) => !current)} className="flex h-10 w-full items-center justify-between rounded-lg border border-[#D9E1EA] bg-white px-3 text-left text-[13px] font-semibold">
        <span className={selected.length ? "text-[#041E42]" : "text-[#9AAAC0]"}>{selected.length ? `${selected.length} produk dipilih` : "Pilih produk yang akan didiskon"}</span>
        <ChevronDown className="h-4 w-4 text-[#004B78]" />
      </button>
      {open ? <div className="absolute left-0 right-0 z-30 mt-2 max-h-72 overflow-auto rounded-xl border border-[#D9E1EA] bg-white p-2 shadow-xl">{PRODUCTS.map((product) => <label key={product.title} className={cls("flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2", selected.includes(product.title) ? "bg-[#EEF5FA]" : "hover:bg-[#F8FAFC]")}><input type="checkbox" checked={selected.includes(product.title)} onChange={() => onToggle(product.title)} className="mt-1 h-4 w-4 accent-[#F2A62A]" /><span><span className="block text-[12px] font-bold text-[#041E42]">{product.title}</span><span className="block text-[11px] text-[#5F7A99]">{product.category}</span></span></label>)}</div> : null}
    </div>
  );
}

export function StaffListView({ page, items, filters, activeFilter, onFilterChange }) {
  return (
    <div className="space-y-3">
      <PageIntro title={page.label} description={page.subtitle} />
      {filters?.length ? <FilterPills items={filters} active={activeFilter} onChange={onFilterChange} /> : null}
      <WorkPanel><div className="overflow-hidden rounded-xl border border-[#D9E1EA] bg-white"><div className="divide-y divide-[#E7EDF4]">{items.map((item) => <div key={item.title} className="grid gap-3 px-4 py-3 hover:bg-[#F8FAFC] md:grid-cols-[minmax(0,1fr)_160px_120px] md:items-center"><div><div className="text-[14px] font-bold text-[#041E42]">{item.title}</div><div className="mt-1 text-[12px] leading-5 text-[#5F7A99]">{item.sub}</div></div><div className="text-[12px] font-bold text-[#304B68]">{item.value}</div><div className="md:text-right"><StaffBadge>{item.status}</StaffBadge></div></div>)}</div></div></WorkPanel>
    </div>
  );
}

export function StaffCardGrid({ page, items, filters, activeFilter, onFilterChange }) {
  return (
    <div className="space-y-3">
      <PageIntro title={page.label} description={page.subtitle} />
      {filters?.length ? <FilterPills items={filters} active={activeFilter} onChange={onFilterChange} /> : null}
      <WorkPanel><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{items.map((item) => <div key={item.title} className="rounded-xl border border-[#D9E1EA] bg-white p-4"><div className="grid h-10 w-10 place-items-center rounded-lg bg-[#EEF5FA] text-[12px] font-black text-[#004B78]">{String(item.value).slice(0, 2)}</div><div className="mt-3 font-bold text-[#041E42]">{item.title}</div><div className="mt-1 text-[12px] text-[#5F7A99]">{item.sub}</div><div className="mt-4"><StaffBadge>{item.status}</StaffBadge></div></div>)}</div></WorkPanel>
    </div>
  );
}

export function ToolbarSearch({ value, onChange, placeholder = "Cari produk asuransi..." }) {
  return <label className="flex h-9 min-w-0 items-center gap-2 rounded-lg border border-[#D9E1EA] bg-white px-3 lg:w-[320px]"><Search className="h-4 w-4 text-[#9AAAC0]" /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-full min-w-0 flex-1 border-0 bg-transparent text-[12px] text-[#041E42] outline-none placeholder:text-[#9AAAC0]" /></label>;
}
