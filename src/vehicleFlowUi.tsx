import React from "react";
import { CheckCircle2, ChevronDown, Shield, X } from "lucide-react";
import { CONSENT_SECTIONS } from "./vehicleFlowData";

function cls(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(" ");
}

function normalizeConsentTextLine(line: string) {
  return String(line || "")
    .replaceAll("â€œ", "“")
    .replaceAll("â€", "”")
    .replaceAll("Ã¢â‚¬Å“", "“")
    .replaceAll("Ã¢â‚¬Â", "”");
}

export function HelpDot({ text }: { text: string }) {
  return (
    <div className="group relative inline-flex">
      <button type="button" aria-label={`Bantuan untuk ${text}`} className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-500">
        i
      </button>
      <div className="pointer-events-none absolute left-0 top-6 z-40 hidden w-72 whitespace-pre-line rounded-xl bg-slate-900 px-3 py-2 text-xs leading-5 text-white shadow-xl group-hover:block">
        {text}
      </div>
    </div>
  );
}

export function FieldLabel({ label, required = true, helpText, compact = false }: { label: string; required?: boolean; helpText?: string; compact?: boolean }) {
  return (
    <div className={cls("flex items-center gap-2", compact ? "mb-1" : "mb-1.5")}>
      <label className={cls(compact ? "text-[12px]" : "text-[13px]", "font-semibold text-slate-800")}>
        {label}
        {required ? <span className="text-[#F5A623]"> *</span> : null}
      </label>
      {helpText ? <HelpDot text={helpText} /> : null}
    </div>
  );
}

export function TextInput({ value, onChange, placeholder, icon, type = "text", readOnly = false, listId, inputMode }: any) {
  return (
    <div className="relative">
      {icon ? <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div> : null}
      <input
        list={listId}
        type={type}
        value={value}
        readOnly={readOnly}
        inputMode={inputMode}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={cls(
          "h-[44px] w-full rounded-[8px] border border-[#D5DDE6] bg-white px-3.5 text-[14px] text-slate-800 outline-none transition placeholder:text-slate-500",
          "focus:border-[#0A4D82] focus:ring-4 focus:ring-[#0A4D82]/10",
          icon && "pl-10",
          readOnly && "bg-slate-50",
        )}
      />
    </div>
  );
}

export function SelectInput({ value, onChange, options, placeholder = "Pilih opsi yang sesuai" }: any) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={cls("h-[44px] w-full appearance-none rounded-[8px] border border-[#D5DDE6] bg-white px-3.5 pr-10 text-[14px] outline-none transition focus:border-[#0A4D82] focus:ring-4 focus:ring-[#0A4D82]/10", value ? "text-slate-800" : "text-slate-500")}>
        <option value="" disabled hidden>{placeholder}</option>
        {options.map((option: string) => <option key={option} value={option}>{option}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

export function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-sm">
      <div className="min-w-0 flex-1 pr-2 text-white/75">{label}</div>
      <div className="max-w-[52%] break-words text-right font-semibold leading-5 text-white">{value}</div>
    </div>
  );
}

export function StepNode({ step, title, subtitle, active, icon }: any) {
  return (
    <div className="relative flex flex-1 flex-col items-center text-center">
      <div className={cls("flex h-9 w-9 items-center justify-center rounded-full border-2 bg-white", active ? "border-[#0A4D82] text-[#0A4D82] shadow-md shadow-[#0A4D82]/10" : "border-slate-300 text-slate-300")}>{icon}</div>
      <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{step}</div>
      <div className={cls("mt-0.5 text-[14px] font-bold", active ? "text-slate-900" : "text-slate-500")}>{title}</div>
      <div className={cls("mt-0.5 text-[12px]", active ? "text-[#E8A436]" : "text-slate-400")}>{subtitle}</div>
    </div>
  );
}

export function ProductCard({ item, onClick }: any) {
  return (
    <button type="button" onClick={onClick} className={`group relative h-[260px] overflow-hidden rounded-xl bg-gradient-to-br ${item.gradient} text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute left-3 top-3 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">{item.category}</div>
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <div className="text-[26px] font-bold leading-none">{item.title}</div>
        <div className="mt-1.5 text-sm text-white/85">{item.subtitle}</div>
      </div>
    </button>
  );
}

export function ActionCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-white p-5 shadow-sm">{children}</div>;
}

export function ConsentAccordion({ section, open, onToggle }: any) {
  return <div className="rounded-xl border border-[#D6E0EA] bg-[#F8FBFE]"><button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"><div><div className="text-sm font-semibold text-slate-900">{section.title}</div><div className="mt-1 text-xs leading-5 text-slate-500">{section.summary}</div></div><ChevronDown className={cls("h-4 w-4 shrink-0 text-slate-500 transition", open && "rotate-180")} /></button>{open ? <div className="border-t border-[#D6E0EA] px-4 py-3 text-sm leading-6 text-slate-600">{section.detail}</div> : null}</div>;
}

export function ConsentModal({ open, agreed, onClose, onAgree }: any) {
  if (!open) return null;

return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4"><div className="w-full max-w-2xl rounded-[28px] bg-white shadow-[0_32px_80px_rgba(15,23,42,0.24)]"><div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5"><div><div className="text-[20px] font-bold tracking-tight text-slate-900">Syarat dan Ketentuan Persetujuan</div><div className="mt-1 text-sm leading-6 text-slate-500">Dengan melanjutkan proses ini, Anda menyatakan telah membaca dan memahami poin persetujuan atas SPAU elektronik ini.</div></div><button type="button" onClick={onClose} aria-label="Tutup persetujuan kebijakan" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"><X className="h-5 w-5" /></button></div><div className="max-h-[60vh] space-y-4 overflow-y-auto px-6 py-5"><div className="rounded-2xl border border-[#D8E1EA] bg-[linear-gradient(180deg,#FBFDFF_0%,#F5F9FD_100%)] p-4"><ol className="space-y-4">{CONSENT_SECTIONS.map((section, index) => <li key={section.key} className="flex items-start gap-3"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#C9D8E8] bg-white text-[13px] font-semibold text-[#0A4D82]">{index + 1}</div><div className="min-w-0"><div className="text-[14px] font-semibold text-slate-900">{section.title}</div><div className="mt-1 space-y-2 text-[13px] leading-[1.75] text-slate-600" style={{ textAlign: "justify" }}>{(section.detailLines || []).map((line: string, lineIndex: number) => <div key={`${section.key}-line-${lineIndex}`}><span>{normalizeConsentTextLine(line)}</span>{lineIndex === (section.detailLines || []).length - 1 && section.detailLinkHref ? <><span> </span><a href={section.detailLinkHref} target="_blank" rel="noreferrer" className="font-medium text-[#0A4D82] underline underline-offset-2 hover:text-[#0D5B98]">{section.detailLinkLabel || section.detailLinkHref}</a></> : null}</div>)}</div></div></li>)}</ol></div></div><div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"><div className="text-sm leading-6 text-slate-500">Silakan setujui jika isi persetujuan ini sudah sesuai.</div><div className="flex items-center gap-3"><button type="button" onClick={onClose} className="inline-flex h-11 items-center justify-center rounded-[12px] border border-slate-200 px-5 text-sm font-medium text-slate-700 hover:bg-slate-50">Tutup</button><button type="button" onClick={onAgree} className="inline-flex h-11 items-center justify-center rounded-[12px] bg-[#0A4D82] px-5 text-sm font-bold text-white hover:brightness-105">{agreed ? "Sudah Disetujui" : "Saya Setuju"}</button></div></div></div></div>;
}

export function PaymentInfoButton({ title, description, onClick }: any) {
  return <button type="button" onClick={onClick} className="rounded-xl border border-[#D5DDE6] bg-white px-4 py-3 text-left hover:bg-slate-50"><div className="text-sm font-semibold text-slate-900">{title}</div><div className="mt-1 text-xs leading-5 text-slate-500">{description}</div></button>;
}

export function PaymentInfoPanel({ title, children }: any) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4"><div className="text-sm font-semibold text-slate-900">{title}</div><div className="mt-2 text-sm leading-6 text-slate-600">{children}</div></div>;
}

export function AccordionRiskRow({ title, premium, summary, detail, deductible, checked, onToggleChecked, expanded, onToggleExpand, alwaysIncluded = false, extra, itemIcon }: any) {
  const deductibleIsDirect = ["tanpa biaya sendiri", "tanpa risiko sendiri", "tidak dikenakan risiko sendiri", "tidak ada risiko sendiri"].some((token) =>
    String(deductible || "").trim().toLowerCase().startsWith(token)
  );
  return (
    <div className="rounded-xl border border-[#C9D5E3] bg-[#F8FBFE]">
      <div className="flex items-center gap-3 px-3.5 py-3">
        {alwaysIncluded ? (
          <div className="flex h-5 w-5 items-center justify-center rounded border border-[#0A4D82] bg-[#0A4D82]/10 text-[#0A4D82]"><Shield className="h-3.5 w-3.5" /></div>
        ) : (
          <input type="checkbox" checked={checked} onChange={onToggleChecked} className="h-5 w-5 rounded border-slate-300 text-[#0A4D82] focus:ring-[#0A4D82]" />
        )}
        <button type="button" onClick={onToggleExpand} className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[#0A4D82]">
              {!alwaysIncluded && itemIcon ? React.createElement(itemIcon, { className: "h-4 w-4 shrink-0" }) : null}
              <div className="truncate text-[15px] font-semibold">{title}</div>
            </div>
            <div className="mt-0.5 text-[12px] text-slate-500">Premi: {premium}</div>
          </div>
          <ChevronDown className={cls("h-4 w-4 shrink-0 text-slate-500 transition", expanded && "rotate-180")} />
        </button>
      </div>
      {expanded ? (
        <div className="border-t border-[#D6E0EA] px-3.5 py-3">
          <div className="whitespace-pre-line text-[13px] leading-5 text-slate-700">{summary}</div>
      {deductible ? <div className="mt-2 text-[12px] leading-5 text-slate-600">{deductibleIsDirect ? deductible.replace(/biaya sendiri/gi, "risiko sendiri") : <><span className="font-semibold text-slate-700">Risiko sendiri saat klaim:</span> {deductible.replace(/biaya sendiri/gi, "risiko sendiri")}</>}</div> : null}
          {detail ? <div className="mt-2 whitespace-pre-line text-[12px] leading-5 text-slate-500">{detail}</div> : null}
          {extra ? <div className="mt-3">{extra}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

