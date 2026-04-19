import React from "react";
import { X } from "lucide-react";

const DEFAULT_OFFERS = [
  { id: "TRX-20260411-0001", name: "Sony Laksono", product: "Asuransi Sepeda Motor - Total Loss", status: "Indikasi Terkirim" },
  { id: "TRX-20260411-0002", name: "PT Maju Sentosa", product: "Asuransi Mobil - Total Loss", status: "Isi Data Lanjutan" },
  { id: "TRX-20260411-0003", name: "Siti Rahma", product: "Asuransi Properti - Kebakaran", status: "Siap Bayar" },
];

export function UserPillMenu({ open, items = [] }) {
  if (!open) return null;
  return (
    <div className="absolute right-0 top-full z-40 mt-2 w-[220px] rounded-[14px] border border-[#D9E1EA] bg-white p-2 shadow-[0_20px_45px_rgba(15,23,42,0.16)]">
      {items.map((item) => {
        const Icon = item.icon || null;
        return (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            className={[
              "flex w-full items-center justify-center rounded-[10px] px-3 py-3 text-center text-sm font-semibold hover:bg-[#F7FAFD]",
              item.primary ? "text-[#0A4D82]" : "text-slate-700",
              item.className || "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {Icon ? <Icon className="mr-2 h-4 w-4" /> : null}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export function SentOffersHistoryModal({ open, onClose, items = DEFAULT_OFFERS }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <div className="text-[20px] font-bold text-slate-900">Riwayat Penawaran Terkirim</div>
            <div className="mt-1 text-sm text-slate-500">Simulasi daftar penawaran yang pernah dikirim ke calon tertanggung.</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup riwayat penawaran" className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 p-5">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 bg-[#F8FBFE] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[15px] font-semibold text-slate-900">{item.name}</div>
                  <div className="mt-1 text-sm text-slate-500">{item.product}</div>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0A4D82] ring-1 ring-slate-200">{item.id}</div>
              </div>
              <div className="mt-2 text-sm text-slate-700">Status: {item.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
