import React, { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

function cls(...args) {
  return args.filter(Boolean).join(" ");
}

function clampPageStart(targetYear, minYear, maxYear) {
  const safeTarget = Math.min(maxYear, Math.max(minYear, targetYear || maxYear));
  const baseStart = Math.floor(safeTarget / 10) * 10;
  return Math.max(minYear, Math.min(baseStart, maxYear - 11));
}

export function VehicleYearPicker({
  value,
  onChange,
  minYear,
  maxYear = new Date().getFullYear(),
  placeholder = "Pilih tahun kendaraan",
}) {
  const rootRef = useRef(null);
  const selectedYear = Number(value) || maxYear;
  const [open, setOpen] = useState(false);
  const [pageStart, setPageStart] = useState(clampPageStart(selectedYear, minYear, maxYear));

  useEffect(() => {
    setPageStart(clampPageStart(Number(value) || maxYear, minYear, maxYear));
  }, [value, minYear, maxYear]);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const pageEnd = Math.min(maxYear, pageStart + 11);
  const years = useMemo(
    () => Array.from({ length: pageEnd - pageStart + 1 }, (_, index) => pageStart + index),
    [pageEnd, pageStart],
  );

  const canGoPrev = pageStart > minYear;
  const canGoNext = pageEnd < maxYear;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cls(
          "flex h-[44px] w-full items-center justify-between rounded-[10px] border border-[#D5DDE6] bg-white px-3.5 text-left text-[14px] outline-none transition",
          "focus:border-[#0A4D82] focus:ring-4 focus:ring-[#0A4D82]/10",
          value ? "text-slate-800" : "text-slate-500",
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="truncate">{value || placeholder}</span>
        </span>
        <ChevronDown className={cls("h-4 w-4 shrink-0 text-slate-400 transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-40 w-full min-w-[280px] rounded-2xl border border-[#D8E1EA] bg-white p-3 shadow-2xl shadow-slate-900/15">
          <div className="mb-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => canGoPrev && setPageStart((prev) => Math.max(minYear, prev - 12))}
              disabled={!canGoPrev}
              className={cls(
                "inline-flex h-8 w-8 items-center justify-center rounded-full border text-slate-500 transition",
                canGoPrev ? "border-[#D5DDE6] hover:bg-slate-50" : "cursor-not-allowed border-slate-200 text-slate-300",
              )}
              aria-label="Lihat pilihan tahun sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-sm font-semibold text-slate-700">
              {pageStart} - {pageEnd}
            </div>
            <button
              type="button"
              onClick={() => canGoNext && setPageStart((prev) => Math.min(maxYear - 11, prev + 12))}
              disabled={!canGoNext}
              className={cls(
                "inline-flex h-8 w-8 items-center justify-center rounded-full border text-slate-500 transition",
                canGoNext ? "border-[#D5DDE6] hover:bg-slate-50" : "cursor-not-allowed border-slate-200 text-slate-300",
              )}
              aria-label="Lihat pilihan tahun berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {years.map((year) => {
              const active = String(year) === String(value);
              return (
                <button
                  key={year}
                  type="button"
                  onClick={() => {
                    onChange(String(year));
                    setOpen(false);
                  }}
                  className={cls(
                    "rounded-xl px-3 py-3 text-center text-sm font-medium transition",
                    active
                      ? "bg-[#0A4D82] text-white shadow-sm"
                      : "border border-transparent bg-slate-50 text-slate-700 hover:border-[#D5DDE6] hover:bg-white",
                  )}
                >
                  {year}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
