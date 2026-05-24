import React, { useState } from "react";
import { Building2, Car, ChevronDown, CreditCard, FileText, Search, Settings, User } from "lucide-react";

import { PROMOS } from "../menuData.js";
import { PageIntro, PromoProductPicker, StaffBadge, StaffField } from "../menuShared.jsx";
import { cls } from "../menuUtils.js";

export default function PromotionMenu() {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Semua");
  const [category, setCategory] = useState("Semua");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [active, setActive] = useState(true);
  const [form, setForm] = useState({ code: "JAS26DKHL", quota: "10", percent: "", period: "1 Minggu" });
  const statusFilters = [{ label: "Semua", count: 12 }, { label: "Aktif", count: 9 }, { label: "Berakhir", count: 3 }];
  const categoryFilters = [{ label: "Semua", icon: CreditCard }, { label: "Properti", icon: Building2 }, { label: "Mobil", icon: Car }, { label: "Motor", icon: Settings }, { label: "Personal", icon: User }, { label: "Lainnya", icon: FileText }];
  const updateForm = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
  const toggleProduct = (title) => setSelectedProducts((current) => (current.includes(title) ? current.filter((item) => item !== title) : [...current, title]));
  const rows = PROMOS.filter((promo) => {
    const keyword = search.toLowerCase();
    return (status === "Semua" || promo.status === status) && (category === "Semua" || promo.category === category) && [promo.code, promo.products, promo.discount, String(promo.quota), promo.period].some((value) => value.toLowerCase().includes(keyword));
  });

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
            <button type="button" onClick={() => setModalOpen(true)} className="inline-flex h-10 items-center justify-center rounded-lg bg-[#004B78] px-4 text-[12px] font-black text-white shadow-sm hover:bg-[#003F65]">+ Tambah Promo Code</button>
          </div>
        </div>
      </section>
      <section className="rounded-xl border border-[#D9E1EA] bg-[#F6F8FA] p-3 shadow-sm">
        <div className="overflow-hidden rounded-xl border border-[#D9E1EA] bg-white">
          <table className="w-full min-w-[980px] text-left text-[12px]">
            <thead className="bg-[#EEF5FA] text-[#004B78]"><tr>{["Promo Code", "Produk Diskon", "Diskon", "Kuota", "Periode", "Status", "Action"].map((item) => <th key={item} className="px-4 py-3 font-medium">{item}</th>)}</tr></thead>
            <tbody className="divide-y divide-[#E7EDF4] text-[#041E42]">{rows.map((promo) => <tr key={`${promo.code}-${promo.period}`} className="hover:bg-[#F8FAFC]"><td className="px-4 py-4 font-medium">{promo.code}</td><td className="px-4 py-4">{promo.products}</td><td className="px-4 py-4">{promo.discount}</td><td className="px-4 py-4">{promo.quota}</td><td className="px-4 py-4">{promo.period}</td><td className="px-4 py-4"><StaffBadge>{promo.status}</StaffBadge></td><td className="px-4 py-4"><button type="button" className="inline-flex h-8 items-center gap-2 rounded-lg border border-[#D9E1EA] bg-white px-3 text-[12px] font-medium text-[#004B78] hover:bg-[#EEF5FA]">Kelola<ChevronDown className="h-3.5 w-3.5" /></button></td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <div className="flex flex-col gap-2 text-[12px] text-[#5F7A99] md:flex-row md:items-center md:justify-between"><p>Showing Page 1 of 2</p><div className="flex gap-2"><button type="button" className="h-8 rounded-lg border border-[#D9E1EA] bg-white px-3 font-bold text-[#9AAAC0]">Prev</button><button type="button" className="h-8 rounded-lg bg-[#004B78] px-3 font-bold text-white">Next</button></div></div>
      {modalOpen ? <div className="fixed inset-0 z-50 grid place-items-center bg-[#041E42]/35 px-4 py-6"><div className="w-full max-w-[570px] overflow-hidden rounded-xl border border-[#D9E1EA] bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-[#E7EDF4] px-4 py-3"><div className="inline-flex items-center gap-2 text-[15px] font-black text-[#041E42]"><CreditCard className="h-4 w-4 text-[#004B78]" />Tambah Promo Code</div><button type="button" onClick={() => setModalOpen(false)} className="h-8 rounded-lg border border-[#D9E1EA] bg-white px-3 text-[12px] font-bold text-[#304B68] hover:bg-[#F8FAFC]">Tutup</button></div><div className="grid gap-4 px-4 py-4"><label className="block"><span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#9AAAC0]">Produk</span><div className="mt-2"><PromoProductPicker selected={selectedProducts} onToggle={toggleProduct} /></div></label><label className="block"><span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#9AAAC0]">Kode Promo</span><div className="mt-2 flex rounded-lg border border-[#D9E1EA] bg-white"><input value={form.code} onChange={(event) => updateForm("code")(event.target.value)} className="h-10 min-w-0 flex-1 rounded-lg border-0 bg-transparent px-3 text-[13px] font-black text-[#041E42] outline-none" /><button type="button" className="m-1 rounded-md border border-[#D9E1EA] px-3 text-[11px] font-black text-[#004B78] hover:bg-[#EEF5FA]">Generate Ulang</button></div></label><div className="grid gap-3 md:grid-cols-[124px_minmax(0,1fr)]"><StaffField label="Kuota" value={form.quota} onChange={updateForm("quota")} /><StaffField label="Diskon (%)" suffix="%" value={form.percent} onChange={updateForm("percent")} /></div><StaffField label="Periode Promo" value={form.period} onChange={updateForm("period")} /><label className="flex items-center justify-between gap-4 rounded-lg border border-[#D9E1EA] bg-[#F8FAFC] px-3 py-3"><span className="text-[12px] font-black text-[#041E42]">Status Aktif</span><button type="button" onClick={() => setActive((current) => !current)} className={cls("relative h-8 w-14 rounded-full transition", active ? "bg-[#004B78]" : "bg-[#CBD5E1]")}><span className={cls("absolute top-1 h-6 w-6 rounded-full bg-white shadow transition", active ? "left-7" : "left-1")} /></button></label></div><div className="flex justify-end gap-2 border-t border-[#E7EDF4] bg-white px-4 py-3"><button type="button" onClick={() => setModalOpen(false)} className="h-9 rounded-lg border border-[#D9E1EA] bg-white px-4 text-[12px] font-bold text-[#004B78] hover:bg-[#EEF5FA]">Batal</button><button type="button" onClick={() => setModalOpen(false)} className="h-9 rounded-lg bg-[#9AAAC0] px-4 text-[12px] font-bold text-white">Simpan Promo</button></div></div></div> : null}
    </div>
  );
}
