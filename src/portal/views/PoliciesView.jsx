import React, { useMemo, useState } from "react";
import { ClipboardList, Download, FileText, Printer } from "lucide-react";
import { DEFAULT_PRINT_REQUESTS, POLICY_FILTERS } from "../portalData.js";
import { formatRupiah, policyCategory } from "../portalUtils.js";
import { PolicyCategoryFilters } from "../components/PolicyCategoryFilters.jsx";
import { WorkPanel, Toolbar, InfoBox, SectionBox, StatusBadge, PolicyRow } from "../components/portalComponents.jsx";
import { FieldInput, TextAreaInput } from "./SettingsView.jsx";

export function PolicyPrintRequestModal({ policy, onClose, onSubmit }) {
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

export function PoliciesView({ policies, claims, billingItems, selectedPolicyId, setSelectedPolicyId }) {
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
