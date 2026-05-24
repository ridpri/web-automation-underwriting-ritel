import React, { useState } from "react";
import { ChevronDown, CreditCard } from "lucide-react";
import { cls, findPolicy, formatRupiah, policyCategory } from "../portalUtils.js";
import { PolicyCategoryFilters } from "../components/PolicyCategoryFilters.jsx";
import { WorkPanel, Toolbar, InfoBox } from "../components/portalComponents.jsx";

function CartRow({ item, policy, selected, onClick, children }) {
  const paid = item.status === "Lunas";

  return (
    <div className={cls("overflow-hidden rounded-xl border bg-white transition", selected ? "border-[#004B78] shadow-[0_0_0_1px_#004B78]" : "border-[#D9E1EA]")}>
      <button type="button" onClick={onClick} className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-2 px-3 py-2.5 text-left hover:bg-[#F8FAFC] sm:gap-3 sm:px-4 sm:py-3 lg:grid-cols-[minmax(220px,1.35fr)_minmax(180px,1fr)_130px_150px_120px_32px] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="truncate text-[13px] font-bold text-[#041E42] md:text-[14px]">{item.title}</div>
            {!selected ? <span className={cls("inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold", paid ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700")}>{paid ? "Selesai" : "Aktif"}</span> : null}
          </div>
          <div className="mt-0.5 truncate text-[11px] text-[#5F7A99] md:mt-1 md:text-[12px]">{item.id}</div>
        </div>
        <div className="hidden min-w-0 sm:block">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9AAAC0]">Polis</div>
          <div className="truncate text-[12px] font-semibold text-[#304B68]">{policy.product}</div>
        </div>
        <div className="hidden lg:block">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9AAAC0]">Jatuh Tempo</div>
          <div className="text-[12px] font-semibold text-[#304B68]">{item.dueDate}</div>
        </div>
        <div className="hidden lg:block">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9AAAC0]">Jumlah</div>
          <div className="text-[12px] font-semibold text-[#304B68]">Rp {formatRupiah(item.amount)}</div>
        </div>
        <div className="hidden text-[12px] font-semibold text-[#5F7A99] sm:block">{item.status}</div>
        <div className="inline-flex items-center gap-1 self-start text-[11px] font-bold text-[#004B78] sm:self-auto md:text-[12px] lg:justify-self-end">
          <span className="hidden sm:inline">{selected ? "Tutup" : "Detail"}</span>
          <ChevronDown className={cls("h-4 w-4 text-[#5F7A99] transition", selected ? "rotate-180" : "")} />
        </div>
      </button>
      {selected ? <div className="border-t border-[#D9E1EA] bg-[#FBFCFD] p-2 md:p-3">{children}</div> : null}
    </div>
  );
}

export function CartView({ billingItems, policies }) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");
  const [selectedBillingId, setSelectedBillingId] = useState("");
  const payableItems = billingItems.filter((item) => item.status !== "Lunas");
  const paidItems = billingItems.filter((item) => item.status === "Lunas");
  const totalPayable = payableItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const nextDue = payableItems[0];
  const statusFilters = [
    { key: "all", label: `Semua (${billingItems.length})` },
    { key: "open", label: `Aktif (${payableItems.length})` },
    { key: "settled", label: `Selesai (${paidItems.length})` },
  ];
  const keyword = search.trim().toLowerCase();
  const filteredBillingItems = billingItems.filter((item) => {
    const policy = findPolicy(policies, item.policyId);
    const filterMatch = activeFilter === "all" || (activeFilter === "open" ? item.status !== "Lunas" : item.status === "Lunas");
    const categoryMatch = activeCategoryFilter === "all" || policyCategory(policy) === activeCategoryFilter;
    const searchMatch = !keyword || [item.id, item.title, item.status, item.method, policy.product, policy.policyNumber].some((field) => String(field).toLowerCase().includes(keyword));
    return filterMatch && categoryMatch && searchMatch;
  });

  return (
    <div className="space-y-3">
      <WorkPanel>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <InfoBox label="Total Tagihan" value={`Rp ${formatRupiah(totalPayable)}`} />
          <InfoBox label="Aktif" value={`${payableItems.length} tagihan`} />
          <InfoBox label="Selesai" value={`${paidItems.length} tagihan`} />
          <InfoBox label="Jatuh Tempo" value={nextDue?.dueDate || "Tidak ada"} />
        </div>
      </WorkPanel>

      <WorkPanel>
        <Toolbar
          search={search}
          setSearch={setSearch}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          filters={statusFilters}
        />
        <PolicyCategoryFilters activeCategory={activeCategoryFilter} onChange={setActiveCategoryFilter} />
        <div className="mt-3 space-y-2">
          {filteredBillingItems.length ? (
            filteredBillingItems.map((item) => {
              const policy = findPolicy(policies, item.policyId);
              return (
                <CartRow
                  key={item.id}
                  item={item}
                  policy={policy}
                  selected={selectedBillingId === item.id}
                  onClick={() => setSelectedBillingId(selectedBillingId === item.id ? "" : item.id)}
                >
                  <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_260px]">
                    <div className="overflow-hidden rounded-lg border border-[#D9E1EA] bg-white">
                      <div className="divide-y divide-[#EEF2F6]">
                        {[
                          { label: "Polis", value: policy.policyNumber },
                          { label: "Produk", value: policy.product },
                          { label: "Metode", value: item.method },
                          { label: "Catatan", value: item.helper },
                        ].map((detail) => (
                          <div key={detail.label} className="flex items-start justify-between gap-3 px-3 py-2">
                            <div className="shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] text-[#9AAAC0]">{detail.label}</div>
                            <div className="min-w-0 text-right text-[12px] font-semibold leading-5 text-[#041E42]">{detail.value || "-"}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg border border-[#D9E1EA] bg-white p-3">
                      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9AAAC0]">Pembayaran</div>
                      <div className="mt-1 text-[20px] font-bold text-[#041E42]">Rp {formatRupiah(item.amount)}</div>
                      <button type="button" className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#F2A62A] px-4 text-[12px] font-bold text-white hover:bg-[#DF9620]">
                        <CreditCard className="h-4 w-4" />
                        Bayar
                      </button>
                    </div>
                  </div>
                </CartRow>
              );
            })
          ) : (
            <div className="rounded-xl border border-dashed border-[#D9E1EA] bg-white px-4 py-6 text-center text-[12px] text-[#5F7A99]">
              Tidak ada tagihan yang cocok dengan filter ini.
            </div>
          )}
        </div>
      </WorkPanel>
    </div>
  );
}
