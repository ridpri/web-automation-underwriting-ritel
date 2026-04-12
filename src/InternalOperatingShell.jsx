import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Clock3, FileText, FolderClock, PencilLine, Send, ShieldAlert, X } from "lucide-react";
import { OPERATING_STATUSES, REVIEW_REASON_OPTIONS } from "./operatingLayer.js";

function cls() {
  return Array.from(arguments).filter(Boolean).join(" ");
}

function toneClasses(tone) {
  if (tone === "amber") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "green") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (tone === "red") return "border-red-200 bg-red-50 text-red-900";
  if (tone === "blue") return "border-sky-200 bg-sky-50 text-sky-900";
  return "border-slate-200 bg-slate-50 text-slate-800";
}

function toneDotClasses(tone) {
  if (tone === "amber") return "bg-amber-500";
  if (tone === "green") return "bg-emerald-500";
  if (tone === "red") return "bg-red-500";
  if (tone === "blue") return "bg-sky-500";
  return "bg-slate-400";
}

function CompactBadge({ label, tone = "slate" }) {
  return (
    <span className={cls("inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold", toneClasses(tone))}>
      {label}
    </span>
  );
}

function TimelineRow({ item }) {
  const actorInitial = String(item.actor || "S").trim().charAt(0).toUpperCase();
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF3FF] text-[11px] font-bold text-[#0A4D82]">
        {actorInitial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <div className="text-[12px] font-semibold text-slate-900">{item.actor}</div>
          <div className="text-[10px] text-slate-400">{item.at}</div>
        </div>
        <div className="mt-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[12px] leading-5 text-slate-600">
          {item.text}
        </div>
      </div>
    </div>
  );
}

function ReviewStepNode({ step, title, subtitle, active, icon, onClick }) {
  return (
    <button type="button" onClick={onClick} className="relative flex flex-1 flex-col items-center text-center">
      <div className={cls("flex h-9 w-9 items-center justify-center rounded-full border-2 bg-white transition", active ? "border-[#0A4D82] text-[#0A4D82]" : "border-slate-300 text-slate-300")}>
        {icon}
      </div>
      <div className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">{step}</div>
      <div className={cls("mt-0.5 text-[13px] font-bold", active ? "text-slate-900" : "text-slate-500")}>{title}</div>
      <div className={cls("mt-0.5 text-[11px]", active ? "text-[#E8A436]" : "text-slate-400")}>{subtitle}</div>
    </button>
  );
}

export default function InternalOperatingShell({ record, onUpdateRecord, onOpenWorkbench, sessionName = "Taqwim (Internal)", children }) {
  const [reasonDraft, setReasonDraft] = useState(record.reason || REVIEW_REASON_OPTIONS[0]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  const handleStatus = (status, reason = "") => {
    onUpdateRecord({
      status,
      reason,
      statusTone:
        status === "Pending Review Internal" || status === "Perlu Revisi"
          ? "amber"
          : status === "Siap Bayar" || status === "Paid"
            ? "green"
            : status === "Rejected" || status === "Expired"
              ? "red"
              : "blue",
      lastActivity: "Baru diperbarui",
      timeline: [
        {
          at: new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date()),
          actor: sessionName,
          text:
            status === "Pending Review Internal"
              ? `Transaksi dipindahkan ke review internal: ${reason || reasonDraft}.`
              : status === "Perlu Revisi"
                ? `Permintaan revisi dikirim: ${reason || reasonDraft}.`
                : status === "Siap Bayar"
                  ? "Review internal selesai. Penawaran dinyatakan siap bayar."
                  : status === "Rejected"
                    ? `Transaksi ditolak: ${reason || reasonDraft}.`
                    : "Status transaksi diperbarui.",
        },
        ...record.timeline,
      ],
    });
  };

  return (
    <div className="overflow-x-hidden bg-[#EEF2F6]">
      <div className="fixed bottom-3 right-3 z-40 md:bottom-6 md:right-6">
        <button
          type="button"
          aria-label="Lihat status transaksi"
          onClick={() => setReviewOpen(true)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur hover:bg-slate-50 md:h-10 md:w-auto md:gap-2 md:px-4 md:text-sm md:font-semibold"
        >
          <span className={cls("inline-flex h-2.5 w-2.5 rounded-full", toneDotClasses(record.statusTone))} />
          <span className="hidden md:inline">Status</span>
        </button>
      </div>
      {reviewOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="max-h-[90vh] w-full max-w-[1120px] overflow-auto rounded-[28px] bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <div className="text-[22px] font-bold tracking-tight text-slate-900">Tinjauan Internal</div>
                <div className="mt-1 text-[13px] text-slate-600">Fokuskan review ke hal yang perlu diputuskan saat ini.</div>
              </div>
          <button type="button" onClick={() => setReviewOpen(false)} aria-label="Tutup tinjauan internal" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
            <X className="h-4 w-4" />
          </button>
            </div>
            <div className="p-4">
              <div className="mx-auto max-w-3xl rounded-2xl bg-white p-3 shadow-2xl shadow-black/10 md:max-w-4xl md:p-5">
                <div className="rounded-2xl border border-[#D8E1EA] bg-[#F4F7FA] px-3 py-4 md:px-5 md:py-5">
                  <div className="flex flex-col gap-5 md:flex-row md:gap-5">
                    <ReviewStepNode step="Langkah 1" title="Ringkasan" subtitle="Lihat konteks transaksi" active={activeStep === 1} icon={<FileText className="h-4 w-4" />} onClick={() => setActiveStep(1)} />
                    <div className="hidden h-px flex-1 self-center bg-slate-300 md:block" />
                    <ReviewStepNode step="Langkah 2" title="Alasan" subtitle="Tentukan fokus review" active={activeStep === 2} icon={<ShieldAlert className="h-4 w-4" />} onClick={() => setActiveStep(2)} />
                    <div className="hidden h-px flex-1 self-center bg-slate-300 md:block" />
                    <ReviewStepNode step="Langkah 3" title="Linimasa" subtitle="Cek update terakhir" active={activeStep === 3} icon={<Clock3 className="h-4 w-4" />} onClick={() => setActiveStep(3)} />
                    <div className="hidden h-px flex-1 self-center bg-slate-300 md:block" />
                    <ReviewStepNode step="Langkah 4" title="Keputusan" subtitle="Pilih tindakan berikutnya" active={activeStep === 4} icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => setActiveStep(4)} />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                {activeStep === 1 ? (
                <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-900">
                    <FileText className="h-4 w-4 text-[#0A4D82]" />
                    Langkah 1. Ringkasan transaksi
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <CompactBadge label={record.product} tone="blue" />
                    <CompactBadge label={record.status} tone={record.statusTone} />
                    <CompactBadge label={record.version} />
                    <CompactBadge label={record.channel} />
                  </div>
                  <div className="mt-3 text-[12px] leading-5 text-slate-600">{record.notes}</div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Nomor referensi</div>
                      <div className="mt-1 text-[12px] font-semibold text-slate-900">{record.id}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Penanggung jawab</div>
                      <div className="mt-1 text-[12px] font-semibold text-slate-900">{record.owner}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">SLA</div>
                      <div className="mt-1 text-[12px] font-semibold text-slate-900">{record.sla}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Berlaku sampai</div>
                      <div className="mt-1 text-[12px] font-semibold text-slate-900">{record.validUntil}</div>
                    </div>
                  </div>
                </div>
                ) : null}
                {activeStep === 2 ? (
                <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-900">
                    <ShieldAlert className="h-4 w-4 text-[#0A4D82]" />
                    Langkah 2. Alasan tinjauan
                  </div>
                  <div className="mt-3 text-[12px] leading-5 text-slate-600">
                    {record.reason ? `Fokus review saat ini: ${record.reason}.` : "Pilih alasan yang paling sesuai agar keputusan internal lebih jelas."}
                  </div>
                  <div className="mt-4">
                    <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Alasan review / revisi</label>
                    <select
                      value={reasonDraft}
                      onChange={(event) => setReasonDraft(event.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-[12px] text-slate-700 outline-none focus:border-[#0A4D82]"
                    >
                      {REVIEW_REASON_OPTIONS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                  {record.flags?.length ? (
                    <div className="mt-3 space-y-2">
                      {record.flags.slice(0, 3).map((flag) => (
                        <div key={flag} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700">{flag}</div>
                      ))}
                    </div>
                  ) : null}
                </div>
                ) : null}
                {activeStep === 3 ? (
                <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-900">
                    <Clock3 className="h-4 w-4 text-[#0A4D82]" />
                    Langkah 3. Linimasa singkat
                  </div>
                  <div className="mt-4 space-y-4">
                    {record.timeline.slice(0, 3).map((item, index) => (
                      <TimelineRow key={`${item.at}-${index}`} item={item} />
                    ))}
                  </div>
                </div>
                ) : null}
                {activeStep === 4 ? (
                <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-900">
                    <CheckCircle2 className="h-4 w-4 text-[#0A4D82]" />
                    Langkah 4. Pilih keputusan
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <button type="button" onClick={() => handleStatus("Pending Review Internal", reasonDraft)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 text-[12px] font-semibold text-amber-900 hover:bg-amber-100">
                      <FolderClock className="h-4 w-4" />
                      Pending review
                    </button>
                    <button type="button" onClick={() => handleStatus("Perlu Revisi", reasonDraft)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[12px] font-semibold text-slate-700 hover:bg-slate-100">
                      <PencilLine className="h-4 w-4" />
                      Minta revisi
                    </button>
                    <button type="button" onClick={() => handleStatus("Siap Bayar")} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0A4D82] px-4 text-[12px] font-semibold text-white hover:brightness-110">
                      <CheckCircle2 className="h-4 w-4" />
                      Siap bayar
                    </button>
                    <button type="button" onClick={onOpenWorkbench} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#F5A623] px-4 text-[12px] font-semibold text-white hover:brightness-105">
                      <Send className="h-4 w-4" />
                      Buka antrean
                    </button>
                  </div>
                  <div className="mt-4 rounded-xl border border-[#CFE0F0] bg-[#F8FBFE] p-3 text-[12px] text-[#0A4D82]">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>Hanya versi aktif yang boleh dilanjutkan ke pembayaran. Versi sebelumnya tetap tersimpan sebagai riwayat.</span>
                    </div>
                  </div>
                </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {children}
    </div>
  );
}
