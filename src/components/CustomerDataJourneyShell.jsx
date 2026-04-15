import React from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2 } from "lucide-react";

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-white/70">{label}</span>
      <span className="text-right font-semibold text-white">{value || "-"}</span>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-sm">
      <span className="text-white/70">{label}</span>
      <span className="text-right font-semibold text-white">{value || "-"}</span>
    </div>
  );
}

export function CustomerDataJourneyShell({
  productName,
  heroDescription,
  customerName,
  objectLabel,
  objectValue,
  sumInsuredLabel,
  sumInsuredValue,
  premiumLabel,
  premiumValue,
  badgeLabel = "Lengkapi Data Penawaran",
  offerReference,
  version,
  validUntil,
  statusLabel,
  guidanceText,
  summaryRows = [],
  pendingItems = [],
  canContinue,
  continueLabel,
  onContinue,
  onBack,
  backLabel = "Kembali",
  children,
}) {
  return (
    <div className="min-h-screen bg-[#F3F5F7] text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="text-[18px] font-black leading-tight text-[#0A4D82]">
              Danantara
              <div className="-mt-1">Indonesia</div>
            </div>
            <div className="text-[16px] font-semibold text-slate-700">asuransi jasindo</div>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-[10px] border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </button>
        </div>
      </div>

      <div className="bg-[linear-gradient(135deg,#0A4D82_0%,#0F5F9C_60%,#1B78B6_100%)] pb-8">
        <div className="mx-auto max-w-[1280px] px-4 pt-8 md:px-6">
          <div className="mx-auto max-w-[960px] rounded-[28px] border border-white/15 bg-white/10 p-5 text-white shadow-2xl shadow-[#08355A]/30 backdrop-blur md:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white/90">
                {badgeLabel}
              </div>
              <div className="inline-flex rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white/90">
                Versi {version}
              </div>
              <div className="inline-flex rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white/90">
                {statusLabel}
              </div>
            </div>
            <h1 className="mt-4 text-[32px] font-bold tracking-tight md:text-[40px]">{productName}</h1>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-white/90 md:text-[17px]">{heroDescription}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-white/10 px-4 py-4 ring-1 ring-white/15">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">Nasabah</div>
                <div className="mt-2 text-[15px] font-semibold text-white">{customerName || "-"}</div>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-4 ring-1 ring-white/15">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">Objek</div>
                <div className="mt-2 text-[15px] font-semibold text-white">{objectLabel || objectValue || "-"}</div>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-4 ring-1 ring-white/15">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
                  {sumInsuredLabel}
                </div>
                <div className="mt-2 text-[15px] font-semibold text-white">{sumInsuredValue || "-"}</div>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-4 ring-1 ring-white/15">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
                  {premiumLabel}
                </div>
                <div className="mt-2 text-[15px] font-semibold text-white">{premiumValue || "-"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">{children}</div>

          <aside className="h-fit self-start rounded-[28px] bg-[#0A4D82] p-5 text-white shadow-[0_24px_60px_rgba(10,77,130,0.32)] lg:sticky lg:top-24">
            <div className="text-[20px] font-bold">Ringkasan Penawaran</div>

            <div className="mt-4 rounded-2xl bg-white/10 p-4">
              <div className="text-sm font-semibold text-white">Detail Penawaran</div>
              <div className="mt-3 space-y-2 text-sm">
                <DetailRow label="Nomor" value={offerReference} />
                <DetailRow label="Versi" value={version} />
                <DetailRow label="Berlaku sampai" value={validUntil} />
                <DetailRow label="Status" value={statusLabel} />
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-white/10 p-4">
              {summaryRows.map((item) => (
                <SummaryRow key={item.label} label={item.label} value={item.value} />
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-white/85">{guidanceText}</div>

            {pendingItems.length ? (
              <div className="mt-4 rounded-2xl bg-white/10 p-4">
                <div className="text-sm font-semibold text-white">Yang masih perlu dilengkapi</div>
                <div className="mt-3 space-y-3 text-sm text-white/85">
                  {pendingItems.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#F5C26B]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-white/10 p-4 text-sm text-white/90">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#9BE4BA]" />
                  <span>Data sudah lengkap dan siap ditinjau pada penawaran final.</span>
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={!canContinue}
              onClick={onContinue}
              className={[
                "mt-4 flex h-[48px] w-full items-center justify-center rounded-[12px] text-sm font-bold uppercase tracking-wide text-white shadow-sm",
                canContinue ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400",
              ].join(" ")}
            >
              {continueLabel}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
