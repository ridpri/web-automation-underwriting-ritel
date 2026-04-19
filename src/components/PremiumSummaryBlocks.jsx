import React, { useState } from "react";

function cls(...args) {
  return args.filter(Boolean).join(" ");
}

export function TooltipDot({ text, ariaLabel = "Lihat penjelasan" }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 120);
        }}
        aria-label={ariaLabel}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#BFD0E0] bg-white text-[10px] font-semibold text-[#5E7BA6]"
      >
        !
      </button>
      {open ? (
        <span className="absolute left-0 top-[calc(100%+8px)] z-20 w-[240px] rounded-xl bg-white px-3 py-2 text-left text-[12px] font-medium leading-5 text-slate-700 shadow-[0_18px_40px_rgba(15,23,42,0.18)] ring-1 ring-slate-200">
          {text}
        </span>
      ) : null}
    </span>
  );
}

export function PremiumPriceHero({ label, value, tooltipText }) {
  return (
    <div className="rounded-xl border border-[#D8E1EA] bg-[linear-gradient(180deg,#FFFFFF_0%,#F4F8FD_100%)] px-4 py-2.5 shadow-[0_6px_14px_rgba(15,23,42,0.035)] md:px-5 md:py-3">
      <div className="mx-auto flex max-w-[420px] flex-col items-center text-center">
        {label ? <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</div> : null}
        <div className={cls("flex items-center justify-center gap-2", label ? "mt-2" : "")}>
          <div className="text-[18px] font-bold tracking-tight text-[#0A4D82] md:text-[20px]">{value}</div>
          {tooltipText ? <TooltipDot text={tooltipText} /> : null}
        </div>
      </div>
    </div>
  );
}

export function PremiumBreakdown({ children }) {
  return (
    <div className="mt-2.5 border-t border-slate-100 pt-2">
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Rincian</div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

export function ProposalRow({ label, value, strong = false }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-b-0">
      <div className="text-[13px] text-slate-500">{label}</div>
      <div className={cls("max-w-[58%] break-words text-right text-[13px] text-slate-900", strong && "font-semibold")}>{value || "-"}</div>
    </div>
  );
}
