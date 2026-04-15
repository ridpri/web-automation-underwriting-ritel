import React from "react";
import { ArrowUpRight, Copy, FileText, Mail, MessageCircle, QrCode, X } from "lucide-react";

function ActionButton({ icon, label, variant = "secondary", onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex h-11 w-full items-center justify-center gap-2 rounded-[12px] px-4 text-sm font-semibold transition",
        variant === "primary"
          ? "bg-[#0A4D82] text-white hover:brightness-105"
          : variant === "accent"
            ? "border border-[#CFE0F0] bg-[#F8FBFE] text-[#0A4D82] hover:bg-[#EEF5FB]"
            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}

export function OfferShareModal({
  open,
  onClose,
  recipientName,
  shareLabel,
  productIcon,
  onOpenIndicativeOffer,
  onOpenFinalOffer,
  onOpenWhatsApp,
  onOpenEmail,
  onCopyLink,
  onShowQrInfo,
  feedback,
}) {
  if (!open) return null;
  const primaryOpenAction = onOpenFinalOffer || onOpenIndicativeOffer;
  const helperCopy = onOpenFinalOffer
    ? "Anda dapat meninjau penawaran final terlebih dahulu, atau langsung mengirimkannya ke calon tertanggung melalui pilihan di bawah."
    : "Anda dapat meninjau penawaran awal terlebih dahulu, atau langsung mengirimkannya ke calon tertanggung melalui pilihan di bawah.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="bg-[linear-gradient(135deg,#0A4D82_0%,#0F5F9C_60%,#1B78B6_100%)] px-5 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/85">
                Bagikan Penawaran
              </div>
              <div className="mt-3 text-[24px] font-bold leading-tight">Penawaran siap dibagikan</div>
              <div className="mt-2 max-w-[520px] text-sm leading-6 text-white/85">
                {helperCopy}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup bagikan penawaran"
              className="rounded-xl border border-white/20 bg-white/10 p-2 text-white/85 hover:bg-white/15"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className="rounded-2xl border border-[#D8E1EA] bg-[#F8FBFE] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0A4D82] text-white">
                {productIcon || <FileText className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">{shareLabel}</div>
                <div className="mt-1 text-sm text-slate-500">
                  Penerima: <span className="font-medium text-slate-700">{recipientName || "Calon tertanggung"}</span>
                </div>
              </div>
            </div>
          </div>

          <ActionButton
            icon={<ArrowUpRight className="h-4 w-4" />}
            label="Buka Penawaran"
            variant="primary"
            onClick={primaryOpenAction}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <ActionButton
              icon={<MessageCircle className="h-4 w-4" />}
              label="Kirim via WhatsApp"
              onClick={onOpenWhatsApp}
            />
            <ActionButton
              icon={<Mail className="h-4 w-4" />}
              label="Kirim via Email"
              onClick={onOpenEmail}
            />
            <ActionButton
              icon={<Copy className="h-4 w-4" />}
              label="Salin Tautan"
              onClick={onCopyLink}
            />
            <ActionButton
              icon={<QrCode className="h-4 w-4" />}
              label="Lihat Info QR"
              onClick={onShowQrInfo}
            />
          </div>

          {feedback ? (
            <div className="rounded-2xl border border-[#D8E1EA] bg-[#F8FBFE] px-4 py-3 text-sm leading-6 text-slate-700">
              {feedback}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
