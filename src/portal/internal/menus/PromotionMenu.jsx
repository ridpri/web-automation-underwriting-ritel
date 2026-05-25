import React, { useState } from "react";
import { Building2, Car, ChevronDown, CreditCard, Eye, FileText, Pencil, Power, Search, Settings, User } from "lucide-react";

import { PRODUCTS, PROMOS } from "../menuData.js";
import { PageIntro, StaffBadge, StaffField } from "../menuShared.jsx";
import { cls } from "../menuUtils.js";

const PERIOD_PRESETS = [
  { label: "1 Minggu", days: 7 },
  { label: "2 Minggu", days: 14 },
  { label: "1 Bulan", days: 30 },
  { label: "Custom", days: null },
];

function dateInputValue(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function addCalendarDays(value, days) {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  return dateInputValue(date);
}

function formatPromoDate(value) {
  const [year, month, day] = String(value).split("-");
  return year && month && day ? `${day}-${month}-${year}` : "";
}

function parsePromoPeriod(value) {
  const [start, end] = String(value || "").split(" - ");
  const toInput = (date) => {
    const [day, month, year] = String(date || "").split("-");
    return year && month && day ? `${year}-${month}-${day}` : "";
  };
  const startDate = toInput(start);
  const endDate = toInput(end);
  return startDate && endDate ? { start: startDate, end: endDate } : null;
}

function clampCustomEnd(start, end) {
  if (!start) return end;
  const maxEnd = addCalendarDays(start, 30);
  if (!end || end < start) return start;
  if (end > maxEnd) return maxEnd;
  return end;
}

export default function PromotionMenu() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [openActionCode, setOpenActionCode] = useState(null);
  const [statusOverrides, setStatusOverrides] = useState({});
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Semua");
  const [category, setCategory] = useState("Semua");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [active, setActive] = useState(true);
  const [periodMode, setPeriodMode] = useState("1 Minggu");
  const [customStart, setCustomStart] = useState(() => dateInputValue());
  const [customEnd, setCustomEnd] = useState(() => addCalendarDays(dateInputValue(), 7));
  const [form, setForm] = useState({ code: "JAS26DKHL", quota: "10", percent: "", period: "1 Minggu" });
  const statusFilters = [{ label: "Semua", count: 12 }, { label: "Aktif", count: 9 }, { label: "Berakhir", count: 3 }];
  const categoryFilters = [{ label: "Semua", icon: CreditCard }, { label: "Properti", icon: Building2 }, { label: "Mobil", icon: Car }, { label: "Motor", icon: Settings }, { label: "Personal", icon: User }, { label: "Lainnya", icon: FileText }];
  const updateForm = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
  const updatePeriodMode = (mode) => {
    setPeriodMode(mode);
    if (mode !== "Custom") setForm((current) => ({ ...current, period: mode }));
    if (mode === "Custom") setForm((current) => ({ ...current, period: `${formatPromoDate(customStart)} - ${formatPromoDate(customEnd)}` }));
  };
  const updateCustomStart = (value) => {
    const nextEnd = clampCustomEnd(value, customEnd);
    setCustomStart(value);
    setCustomEnd(nextEnd);
    setForm((current) => ({ ...current, period: `${formatPromoDate(value)} - ${formatPromoDate(nextEnd)}` }));
  };
  const updateCustomEnd = (value) => {
    const nextEnd = clampCustomEnd(customStart, value);
    setCustomEnd(nextEnd);
    setForm((current) => ({ ...current, period: `${formatPromoDate(customStart)} - ${formatPromoDate(nextEnd)}` }));
  };
  const openCreatePromo = () => {
    const start = dateInputValue();
    setEditingPromo(null);
    setModalMode("create");
    setSelectedProduct("");
    setActive(true);
    setPeriodMode("1 Minggu");
    setCustomStart(start);
    setCustomEnd(addCalendarDays(start, 7));
    setForm({ code: "JAS26DKHL", quota: "10", percent: "", period: "1 Minggu" });
    setModalOpen(true);
  };
  const openPromoModal = (promo, mode) => {
    const parsedPeriod = parsePromoPeriod(promo.period);
    setEditingPromo(promo);
    setModalMode(mode);
    setSelectedProduct(promo.products.split(",")[0].trim());
    setActive(promo.status === "Aktif");
    setPeriodMode(parsedPeriod ? "Custom" : promo.period);
    if (parsedPeriod) {
      setCustomStart(parsedPeriod.start);
      setCustomEnd(clampCustomEnd(parsedPeriod.start, parsedPeriod.end));
    }
    setForm({ code: promo.code, quota: String(promo.quota), percent: promo.discount.replace("%", ""), period: promo.period });
    setOpenActionCode(null);
    setModalOpen(true);
  };
  const togglePromoStatus = (promo) => {
    setStatusOverrides((current) => ({ ...current, [promo.code]: promo.status === "Aktif" ? "Berakhir" : "Aktif" }));
    setOpenActionCode(null);
  };
  const closePromoModal = () => {
    setModalOpen(false);
    setEditingPromo(null);
    setModalMode("create");
  };
  const readOnly = modalMode === "detail";
  const rows = PROMOS.map((promo) => ({ ...promo, status: statusOverrides[promo.code] || promo.status })).filter((promo) => {
    const keyword = search.toLowerCase();
    return (status === "Semua" || promo.status === status) && (category === "Semua" || promo.category === category) && [promo.code, promo.products, promo.discount, String(promo.quota), promo.period].some((value) => value.toLowerCase().includes(keyword));
  });
  const modalTitle = modalMode === "create" ? "Tambah Promo Code" : modalMode === "detail" ? `Detail ${editingPromo?.code || ""}` : `Edit ${editingPromo?.code || ""}`;

  return (
    <div className="space-y-4">
      <PageIntro title="Promosi" description="Atur promo code, produk yang berlaku, periode aktif, kuota penggunaan, dan batas diskon." />
      <section className="rounded-xl border border-[#D9E1EA] bg-[#F6F8FA] p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">{statusFilters.map((item) => <button key={item.label} type="button" onClick={() => setStatus(item.label)} className={cls("inline-flex h-10 items-center rounded-full border px-4 text-[12px] font-black", status === item.label ? "border-[#004B78] bg-[#004B78] text-white" : "border-[#D9E1EA] bg-white text-[#304B68] hover:bg-[#EEF5FA]")}>{item.label} ({item.count})</button>)}</div>
            <div className="flex flex-wrap gap-2">{categoryFilters.map((item) => <button key={item.label} type="button" onClick={() => setCategory(item.label)} className={cls("inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[12px] font-black", category === item.label ? "border-[#004B78] bg-[#004B78] text-white" : "border-[#D9E1EA] bg-white text-[#304B68] hover:bg-[#EEF5FA]")}><item.icon className="h-4 w-4" />{item.label}</button>)}</div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row xl:items-end">
            <label className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-[#D9E1EA] bg-white px-3 sm:w-[360px]"><Search className="h-4 w-4 text-[#9AAAC0]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari kode promo, produk, diskon, kuota, periode" className="h-full min-w-0 flex-1 border-0 bg-transparent text-[12px] font-bold text-[#041E42] outline-none placeholder:text-[#9AAAC0]" /></label>
            <button type="button" onClick={openCreatePromo} className="inline-flex h-10 items-center justify-center rounded-lg bg-[#004B78] px-4 text-[12px] font-black text-white shadow-sm hover:bg-[#003F65]">+ Tambah Promo Code</button>
          </div>
        </div>
      </section>
      <section className="rounded-xl border border-[#D9E1EA] bg-[#F6F8FA] p-3 shadow-sm">
        <div className="overflow-hidden rounded-xl border border-[#D9E1EA] bg-white">
          <table className="w-full min-w-[980px] text-left text-[12px]">
            <thead className="bg-[#EEF5FA] text-[#004B78]"><tr>{["Promo Code", "Produk Diskon", "Diskon", "Kuota", "Periode", "Status", "Action"].map((item) => <th key={item} className="px-4 py-3 font-medium">{item}</th>)}</tr></thead>
            <tbody className="divide-y divide-[#E7EDF4] text-[#041E42]">{rows.map((promo) => <tr key={`${promo.code}-${promo.period}`} className="hover:bg-[#F8FAFC]"><td className="px-4 py-4 font-medium">{promo.code}</td><td className="px-4 py-4">{promo.products}</td><td className="px-4 py-4">{promo.discount}</td><td className="px-4 py-4">{promo.quota}</td><td className="px-4 py-4">{promo.period}</td><td className="px-4 py-4"><StaffBadge>{promo.status}</StaffBadge></td><td className="relative px-4 py-4"><button type="button" onClick={() => setOpenActionCode((current) => (current === promo.code ? null : promo.code))} aria-expanded={openActionCode === promo.code} aria-haspopup="menu" aria-label={`Kelola promo ${promo.code}`} className="inline-flex h-8 items-center gap-2 rounded-lg border border-[#D9E1EA] bg-white px-3 text-[12px] font-medium text-[#004B78] hover:bg-[#EEF5FA]">Kelola<ChevronDown className="h-3.5 w-3.5" /></button>{openActionCode === promo.code ? <div role="menu" className="absolute right-4 top-12 z-20 w-40 overflow-hidden rounded-lg border border-[#D9E1EA] bg-white py-1 shadow-xl"><button type="button" role="menuitem" onClick={() => openPromoModal(promo, "detail")} className="flex h-9 w-full items-center gap-2 px-3 text-left text-[12px] font-bold text-[#304B68] hover:bg-[#F8FAFC]"><Eye className="h-3.5 w-3.5" />Lihat Detail</button><button type="button" role="menuitem" onClick={() => openPromoModal(promo, "edit")} className="flex h-9 w-full items-center gap-2 px-3 text-left text-[12px] font-bold text-[#304B68] hover:bg-[#F8FAFC]"><Pencil className="h-3.5 w-3.5" />Edit Promo</button><button type="button" role="menuitem" onClick={() => togglePromoStatus(promo)} className="flex h-9 w-full items-center gap-2 px-3 text-left text-[12px] font-bold text-[#B42318] hover:bg-[#FFF5F5]"><Power className="h-3.5 w-3.5" />{promo.status === "Aktif" ? "Nonaktifkan" : "Aktifkan"}</button></div> : null}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <div className="flex flex-col gap-2 text-[12px] text-[#5F7A99] md:flex-row md:items-center md:justify-between"><p>Showing Page 1 of 2</p><div className="flex gap-2"><button type="button" className="h-8 rounded-lg border border-[#D9E1EA] bg-white px-3 font-bold text-[#9AAAC0]">Prev</button><button type="button" className="h-8 rounded-lg bg-[#004B78] px-3 font-bold text-white">Next</button></div></div>
      {modalOpen ? <div className="fixed inset-0 z-50 grid place-items-center bg-[#041E42]/35 px-4 py-6"><div className="w-full max-w-[570px] overflow-hidden rounded-xl border border-[#D9E1EA] bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-[#E7EDF4] px-4 py-3"><div className="inline-flex items-center gap-2 text-[15px] font-black text-[#041E42]"><CreditCard className="h-4 w-4 text-[#004B78]" />{modalTitle}</div><button type="button" onClick={closePromoModal} className="h-8 rounded-lg border border-[#D9E1EA] bg-white px-3 text-[12px] font-bold text-[#304B68] hover:bg-[#F8FAFC]">Tutup</button></div><div className="grid gap-4 px-4 py-4"><label className="block"><span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#9AAAC0]">Produk</span><div className="mt-2"><SinglePromoProductPicker value={selectedProduct} onChange={setSelectedProduct} disabled={readOnly} /></div></label><label className="block"><span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#9AAAC0]">Kode Promo</span><div className="mt-2 flex rounded-lg border border-[#D9E1EA] bg-white"><input value={form.code} readOnly={readOnly} onChange={(event) => updateForm("code")(event.target.value)} className="h-10 min-w-0 flex-1 rounded-lg border-0 bg-transparent px-3 text-[13px] font-black text-[#041E42] outline-none read-only:text-[#5F7A99]" /><button type="button" disabled={readOnly} className="m-1 rounded-md border border-[#D9E1EA] px-3 text-[11px] font-black text-[#004B78] hover:bg-[#EEF5FA] disabled:cursor-not-allowed disabled:text-[#9AAAC0]">Generate Ulang</button></div></label><div className="grid gap-3 md:grid-cols-[124px_minmax(0,1fr)]"><StaffField label="Kuota" value={form.quota} onChange={updateForm("quota")} /><StaffField label="Diskon (%)" suffix="%" value={form.percent} onChange={updateForm("percent")} /></div><PromoPeriodControl mode={periodMode} onModeChange={updatePeriodMode} start={customStart} end={customEnd} onStartChange={updateCustomStart} onEndChange={updateCustomEnd} disabled={readOnly} /><label className="flex items-center justify-between gap-4 rounded-lg border border-[#D9E1EA] bg-[#F8FAFC] px-3 py-3"><span className="text-[12px] font-black text-[#041E42]">Status Aktif</span><button type="button" disabled={readOnly} onClick={() => setActive((current) => !current)} className={cls("relative h-8 w-14 rounded-full transition disabled:cursor-not-allowed", active ? "bg-[#004B78]" : "bg-[#CBD5E1]")}><span className={cls("absolute top-1 h-6 w-6 rounded-full bg-white shadow transition", active ? "left-7" : "left-1")} /></button></label></div><div className="flex justify-end gap-2 border-t border-[#E7EDF4] bg-white px-4 py-3"><button type="button" onClick={closePromoModal} className="h-9 rounded-lg border border-[#D9E1EA] bg-white px-4 text-[12px] font-bold text-[#004B78] hover:bg-[#EEF5FA]">{readOnly ? "Tutup" : "Batal"}</button>{readOnly ? null : <button type="button" onClick={closePromoModal} className="h-9 rounded-lg bg-[#9AAAC0] px-4 text-[12px] font-bold text-white">{modalMode === "edit" ? "Simpan Perubahan" : "Simpan Promo"}</button>}</div></div></div> : null}
    </div>
  );
}

function SinglePromoProductPicker({ value, onChange, disabled = false }) {
  const [open, setOpen] = useState(false);
  const selectedProduct = PRODUCTS.find((product) => product.title === value);
  return (
    <div className="relative">
      <button type="button" disabled={disabled} onClick={() => setOpen((current) => !current)} className="flex h-10 w-full items-center justify-between rounded-lg border border-[#D9E1EA] bg-white px-3 text-left text-[13px] font-semibold disabled:cursor-not-allowed">
        <span className={value ? "text-[#041E42]" : "text-[#9AAAC0]"}>{selectedProduct ? selectedProduct.title : "Pilih 1 produk yang akan didiskon"}</span>
        <ChevronDown className="h-4 w-4 text-[#004B78]" />
      </button>
      {open ? <div className="absolute left-0 right-0 z-30 mt-2 max-h-72 overflow-auto rounded-xl border border-[#D9E1EA] bg-white p-2 shadow-xl">{PRODUCTS.map((product) => <button key={product.title} type="button" onClick={() => { onChange(product.title); setOpen(false); }} className={cls("flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left", value === product.title ? "bg-[#EEF5FA]" : "hover:bg-[#F8FAFC]")}><span className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-[#D9E1EA] bg-white"><span className={cls("h-2 w-2 rounded-full", value === product.title ? "bg-[#F2A62A]" : "bg-transparent")} /></span><span><span className="block text-[12px] font-bold text-[#041E42]">{product.title}</span><span className="block text-[11px] text-[#5F7A99]">{product.category}</span></span></button>)}</div> : null}
    </div>
  );
}

function PromoPeriodControl({ mode, onModeChange, start, end, onStartChange, onEndChange, disabled = false }) {
  const maxEnd = addCalendarDays(start, 30);
  return (
    <div className="grid gap-2">
      <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#9AAAC0]">Periode Promo</span>
      <div className="flex flex-wrap gap-2">
        {PERIOD_PRESETS.map((item) => (
          <button
            key={item.label}
            type="button"
            disabled={disabled}
            onClick={() => onModeChange(item.label)}
            className={cls(
              "inline-flex h-9 items-center rounded-full border px-3 text-[12px] font-black disabled:cursor-not-allowed",
              mode === item.label ? "border-[#004B78] bg-[#004B78] text-white" : "border-[#D9E1EA] bg-white text-[#304B68] hover:bg-[#EEF5FA]",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      {mode === "Custom" ? (
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9AAAC0]">Tanggal Mulai</span>
            <input type="date" value={start} disabled={disabled} onChange={(event) => onStartChange(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-[#D9E1EA] bg-white px-3 text-[13px] font-semibold text-[#041E42] outline-none disabled:cursor-not-allowed disabled:text-[#5F7A99]" />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9AAAC0]">Tanggal Selesai</span>
            <input type="date" value={end} min={start} max={maxEnd} disabled={disabled} onChange={(event) => onEndChange(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-[#D9E1EA] bg-white px-3 text-[13px] font-semibold text-[#041E42] outline-none disabled:cursor-not-allowed disabled:text-[#5F7A99]" />
          </label>
        </div>
      ) : null}
    </div>
  );
}
