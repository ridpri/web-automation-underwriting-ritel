import React from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, FileText, Wallet } from "lucide-react";

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

function StepNode({ step, title, subtitle, active, done, icon }) {
  return (
    <div className="relative flex flex-1 flex-col items-center text-center">
      <div
        className={[
          "flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white",
          done ? "border-green-600 text-green-600" : active ? "border-[#0A4D82] text-[#0A4D82]" : "border-slate-300 text-slate-300",
        ].join(" ")}
      >
        {done ? <CheckCircle2 className="h-4 w-4" /> : icon}
      </div>
      <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{step}</div>
      <div className={["mt-0.5 text-[14px] font-bold", active || done ? "text-slate-900" : "text-slate-500"].join(" ")}>
        {title}
      </div>
      <div className={["mt-0.5 text-[12px]", active ? "text-[#E8A436]" : done ? "text-green-600" : "text-slate-400"].join(" ")}>
        {subtitle}
      </div>
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
  badgeLabel = "Data Lanjutan Penawaran",
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
  secondaryLabel,
  onSecondary,
  onBack,
  topActionLabel,
  onTopAction,
  backLabel = "Kembali",
  bottomBackLabel = "Kembali ke Ringkasan Penawaran",
  showSidebar = true,
  showPaymentStep = true,
  children,
}) {
  const shouldShowPrimaryAction = canContinue || !(secondaryLabel && onSecondary);

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
          <div className="flex items-center gap-2">
            {topActionLabel && onTopAction ? (
              <button
                type="button"
                onClick={onTopAction}
                className="inline-flex h-[40px] items-center justify-center rounded-[10px] border border-[#D5DEEA] bg-[#F8FBFE] px-4 text-sm font-semibold text-[#0A4D82] shadow-sm transition hover:border-[#BFD0E2] hover:bg-white"
              >
                {topActionLabel}
              </button>
            ) : null}
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
      </div>

      <div className="bg-[linear-gradient(135deg,#0A4D82_0%,#0F5F9C_60%,#1B78B6_100%)] pb-8">
        <div className="mx-auto max-w-[1280px] px-4 pt-8 md:px-6">
          <div className="mx-auto max-w-[960px]">
            <div className="mt-1 text-center text-white">
              <div className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90">
                {customerName ? `Halo, ${String(customerName).trim().split(/\s+/)[0]}` : badgeLabel}
              </div>
              <h1 className="mt-4 text-[32px] font-bold tracking-tight md:text-[40px]">{productName}</h1>
              <p className="mx-auto mt-3 max-w-3xl text-[15px] leading-7 text-white/90 md:text-[17px]">{heroDescription}</p>
            </div>

            <div className="mx-auto mt-6 max-w-3xl rounded-2xl bg-white p-3 shadow-2xl shadow-black/15 md:mt-7 md:max-w-4xl md:p-5">
              <div className="rounded-2xl border border-[#D8E1EA] bg-[#F4F7FA] px-3 py-4 md:px-5 md:py-5">
                <div className="flex flex-col gap-5 md:flex-row md:gap-5">
                  <StepNode step="Langkah 1" title="Tinjau Penawaran" subtitle="Selesai" done={true} active={false} icon={<FileText className="h-4 w-4" />} />
                  <div className="hidden h-px flex-1 self-center bg-slate-300 md:block" />
                  <StepNode step="Langkah 2" title="Data Lanjutan" subtitle="Sedang diisi" done={false} active={true} icon={<FileText className="h-4 w-4" />} />
                  <div className="hidden h-px flex-1 self-center bg-slate-300 md:block" />
                  {showPaymentStep ? (
                    <StepNode step="Langkah 3" title="Pembayaran" subtitle="Menunggu" done={false} active={false} icon={<Wallet className="h-4 w-4" />} />
                  ) : null}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-6">
          <div className={showSidebar ? "grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]" : "mx-auto max-w-[860px] space-y-5"}>
          <div className="space-y-5">
            {!showSidebar ? (
              <div className="rounded-[28px] border border-[#D8E1EA] bg-white p-4 shadow-sm md:p-5">
                <div className="px-2 pb-5 text-center">
                  <div className="min-w-0 flex-1 text-center">
                    <div className="text-[26px] font-bold tracking-tight text-slate-900 md:text-[30px]">Data Lanjutan Penawaran Anda</div>
                    <div className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-[15px]">
                    Informasi berikut diperlukan agar penawaran dapat dilanjutkan ke tahap pembayaran.
                    </div>
                  </div>
                </div>
                {children}
              </div>
            ) : (
              children
            )}
            {!showSidebar ? (
              <div className="rounded-[24px] border border-[#D8E1EA] bg-white p-5 shadow-sm">
                <div className="text-[18px] font-bold text-slate-900">Lanjutkan Penawaran</div>
                <div className="mt-2 text-sm leading-6 text-slate-600">{guidanceText}</div>

                {pendingItems.length ? (
                  <div className="mt-4 rounded-2xl border border-[#D8E1EA] bg-[#F8FBFE] p-4">
                    <div className="text-sm font-semibold text-slate-900">Yang masih perlu dilengkapi</div>
                    <div className="mt-3 space-y-3 text-sm text-slate-700">
                      {pendingItems.map((item) => (
                        <div key={item} className="flex items-start gap-2">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#F5A623]" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-[#D8E1EA] bg-[#F8FBFE] p-4 text-sm text-slate-700">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1F8B4C]" />
                      <span>Data sudah lengkap dan siap dilanjutkan ke pembayaran.</span>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={onBack}
                    className="flex h-[48px] w-full items-center justify-center rounded-[12px] border border-[#D5DEEA] bg-white px-5 text-center text-sm font-semibold text-[#0A4D82] shadow-sm hover:bg-[#F8FBFE] sm:flex-1"
                  >
                    {bottomBackLabel}
                  </button>
                  <button
                    type="button"
                    disabled={shouldShowPrimaryAction ? !canContinue : false}
                    onClick={shouldShowPrimaryAction ? onContinue : onSecondary}
                    className={[
                      "flex h-[48px] w-full items-center justify-center rounded-[12px] px-5 text-center text-sm font-bold shadow-sm sm:flex-1",
                      shouldShowPrimaryAction
                        ? canContinue
                          ? "bg-[#F5A623] uppercase tracking-wide text-white hover:brightness-105"
                          : "cursor-not-allowed bg-slate-400 uppercase tracking-wide text-white"
                        : "bg-[#0A4D82] text-white hover:brightness-105",
                    ].join(" ")}
                  >
                    {shouldShowPrimaryAction ? continueLabel : secondaryLabel}
                  </button>
                </div>
                {secondaryLabel && onSecondary && shouldShowPrimaryAction ? (
                  <button
                    type="button"
                    onClick={onSecondary}
                    className="mt-3 flex h-[44px] w-full items-center justify-center rounded-[12px] border border-[#D5DEEA] bg-white px-5 text-sm font-semibold text-[#0A4D82] shadow-sm hover:bg-[#F8FBFE]"
                  >
                    {secondaryLabel}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          {showSidebar ? (
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
                    <span>Data sudah lengkap dan siap dilanjutkan ke pembayaran.</span>
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
          ) : null}
        </div>
      </div>
    </div>
  );
}
