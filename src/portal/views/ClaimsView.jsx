import React, { useState } from "react";
import { ClipboardList, FileText, Upload } from "lucide-react";
import { cls, findPolicy, policyCategory, statusClass } from "../portalUtils.js";
import { WorkPanel, Toolbar, InfoBox, SectionBox, Timeline, ClaimRow } from "../components/portalComponents.jsx";
import { PolicyCategoryFilters } from "../components/PolicyCategoryFilters.jsx";

export function ClaimsView({ claims, policies }) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");
  const [selectedClaimId, setSelectedClaimId] = useState("");
  const openClaims = claims.filter((claim) => !claim.settled);
  const settledClaims = claims.filter((claim) => claim.settled);
  const actionNeeded = openClaims.filter((claim) => claim.canUpload).length;
  const statusFilters = [
    { key: "all", label: `Semua (${claims.length})` },
    { key: "open", label: `Aktif (${openClaims.length})` },
    { key: "settled", label: `Selesai (${settledClaims.length})` },
  ];
  const keyword = search.trim().toLowerCase();
  const filteredClaims = claims.filter((claim) => {
    const filterMatch = activeFilter === "all" || (activeFilter === "open" ? !claim.settled : claim.settled);
    const policy = findPolicy(policies, claim.policyId);
    const categoryMatch = activeCategoryFilter === "all" || policyCategory(policy) === activeCategoryFilter;
    const searchMatch = !keyword || [claim.id, claim.title, claim.status, policy.product, policy.policyNumber].some((field) => String(field).toLowerCase().includes(keyword));
    return filterMatch && categoryMatch && searchMatch;
  });
  const selectedClaim = filteredClaims.find((claim) => claim.id === selectedClaimId);

  return (
    <div className="space-y-3">
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
          filters={statusFilters}
        />
        <PolicyCategoryFilters activeCategory={activeCategoryFilter} onChange={setActiveCategoryFilter} />
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
