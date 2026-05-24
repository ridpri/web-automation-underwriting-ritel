import React from "react";
import { Bell, CheckCircle2, ClipboardList, CreditCard, FileText, Gauge, Headphones, Phone, Shield } from "lucide-react";
import { cls, formatRupiah } from "../portalUtils.js";
import { WorkPanel, PageIntro, SectionBox, SmallActionCard } from "../components/portalComponents.jsx";

export function DashboardMetric({ label, value, helper, tone = "default", icon = Shield }) {
  const Icon = icon;
  const toneClass = {
    success: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    warning: "bg-amber-50 text-amber-700 ring-amber-100",
    danger: "bg-rose-50 text-rose-700 ring-rose-100",
    default: "bg-[#EEF5FA] text-[#004B78] ring-blue-100",
  }[tone] || "bg-[#EEF5FA] text-[#004B78] ring-blue-100";

  return (
    <div className="rounded-lg border border-[#D9E1EA] bg-white p-2.5 md:rounded-xl md:p-4">
      <div className="flex items-start justify-between gap-2 md:gap-3">
        <div className="min-w-0">
          <div className="truncate text-[9px] font-bold uppercase tracking-[0.08em] text-[#9AAAC0] md:text-[11px] md:tracking-[0.14em]">{label}</div>
          <div className="mt-1 truncate text-[18px] font-bold tracking-tight text-[#041E42] md:mt-2 md:text-[26px]">{value}</div>
        </div>
        <div className={cls("grid h-7 w-7 shrink-0 place-items-center rounded-md ring-1 md:h-10 md:w-10 md:rounded-lg", toneClass)}>
          <Icon className="h-3.5 w-3.5 md:h-5 md:w-5" />
        </div>
      </div>
      <div className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#5F7A99] md:mt-2 md:text-[12px] md:leading-5">{helper}</div>
    </div>
  );
}

export function DashboardAction({ title, helper, tone = "default", onClick, actionLabel }) {
  return (
    <div className={cls("rounded-xl border bg-white p-3", tone === "danger" ? "border-rose-200" : tone === "warning" ? "border-amber-200" : "border-[#D9E1EA]")}>
      <div className="flex items-start gap-3">
        <span className={cls("mt-0.5 h-2.5 w-2.5 rounded-full", tone === "danger" ? "bg-rose-500" : tone === "warning" ? "bg-amber-500" : "bg-emerald-500")} />
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-bold text-[#041E42]">{title}</div>
          <div className="mt-1 text-[12px] leading-5 text-[#5F7A99]">{helper}</div>
        </div>
        {onClick ? (
          <button type="button" onClick={onClick} className="shrink-0 rounded-md border border-[#D9E1EA] px-3 py-1.5 text-[11px] font-bold text-[#004B78] hover:bg-[#EEF5FA]">
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function DashboardView({ policies, claims, billingItems, setActiveMenu }) {
  const activePolicies = policies.filter((policy) => policy.status === "Aktif");
  const openClaims = claims.filter((claim) => !claim.settled);
  const totalPremium = activePolicies.reduce((sum, policy) => sum + Number(policy.annualPremium || 0), 0);
  const unpaidBills = billingItems.filter((item) => item.status !== "Lunas");
  const nearestPolicy = activePolicies[0];
  const mainAction = unpaidBills[0]
    ? {
        title: unpaidBills[0].title,
        helper: unpaidBills[0].helper,
        tone: unpaidBills[0].tone,
        actionLabel: "Bayar",
        onClick: () => setActiveMenu("cart"),
      }
    : openClaims[0]
      ? {
          title: openClaims[0].title,
          helper: openClaims[0].nextAction,
          tone: openClaims[0].tone,
          actionLabel: "Buka",
          onClick: () => setActiveMenu("claims"),
        }
      : {
          title: "Semua perlindungan utama aman",
          helper: "Tidak ada tagihan atau klaim yang membutuhkan tindakan segera.",
          tone: "success",
          actionLabel: "Polis",
          onClick: () => setActiveMenu("policies"),
        };

  return (
    <WorkPanel>
      <div className="grid gap-2 md:gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
        <PageIntro
          title="Ringkasan perlindungan Anda"
          description="Dashboard ini membantu Anda melihat hal yang aman, hal yang perlu ditindaklanjuti, dan jalur tercepat saat perlu dokumen, klaim, pembayaran, atau bantuan resmi."
          action={
            <button type="button" onClick={() => setActiveMenu("help")} className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#004B78] px-4 text-[12px] font-bold text-white hover:bg-[#003F65]">
              <Phone className="h-4 w-4" />
              Bantuan
            </button>
          }
        />
        <div className="rounded-xl border border-[#D9E1EA] bg-[#004B78] p-3 text-white md:p-5">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/70 md:text-[12px] md:tracking-[0.16em]">Prioritas Saat Ini</div>
          <div className="mt-2 text-[15px] font-bold md:mt-3 md:text-[18px]">{mainAction.title}</div>
          <div className="mt-1 text-[12px] leading-5 text-white/80 md:mt-2 md:text-[13px] md:leading-6">{mainAction.helper}</div>
          <button type="button" onClick={mainAction.onClick} className="mt-3 h-8 rounded-lg bg-white px-3 text-[11px] font-bold text-[#004B78] hover:bg-slate-100 md:mt-4 md:h-9 md:px-4 md:text-[12px]">
            {mainAction.actionLabel}
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 md:gap-3 xl:grid-cols-4">
        <DashboardMetric label="Perlindungan Aktif" value={activePolicies.length} helper="Polis yang masih memberi perlindungan." tone="success" icon={Shield} />
        <DashboardMetric label="Perlu Tindakan" value={unpaidBills.length + openClaims.filter((claim) => claim.canUpload).length} helper="Tagihan atau dokumen klaim yang perlu ditindaklanjuti." tone={unpaidBills.length ? "warning" : "default"} icon={Bell} />
        <DashboardMetric label="Klaim Aktif" value={openClaims.length} helper="Klaim berjalan dengan status dan tindak lanjut." tone={openClaims.length ? "warning" : "success"} icon={FileText} />
        <DashboardMetric label="Premi Aktif" value={`Rp ${formatRupiah(totalPremium)}`} helper="Total premi tahunan dari polis aktif." icon={CreditCard} />
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_380px]">
        <SectionBox title="Yang Perlu Anda Tahu" icon={ClipboardList}>
          <div className="grid gap-2">
            <DashboardAction {...mainAction} />
            <DashboardAction
              title={nearestPolicy ? `${nearestPolicy.product} berakhir ${nearestPolicy.periodEnd}` : "Belum ada polis aktif"}
              helper={nearestPolicy ? "Tanggal akhir polis ditampilkan agar perpanjangan tidak terlewat." : "Mulai dari menu produk untuk membeli perlindungan baru."}
              tone={nearestPolicy ? "default" : "warning"}
              actionLabel="Lihat"
              onClick={() => setActiveMenu("policies")}
            />
            <DashboardAction
              title={openClaims.length ? `${openClaims.length} klaim sedang berjalan` : "Tidak ada klaim aktif"}
              helper={openClaims.length ? "Buka Klaim Saya untuk melihat status, petugas, dokumen, dan update berikutnya." : "Saat terjadi kejadian, akses klaim tersedia dari menu Klaim Saya."}
              tone={openClaims.length ? "warning" : "success"}
              actionLabel="Klaim"
              onClick={() => setActiveMenu("claims")}
            />
          </div>
        </SectionBox>
        <div className="space-y-3">
          <SectionBox title="Akses Cepat" icon={Gauge}>
            <div className="grid grid-cols-2 gap-2">
              <SmallActionCard icon={Shield} title="E-polis" helper="Lihat dokumen" onClick={() => setActiveMenu("policies")} tone="brand" />
              <SmallActionCard icon={FileText} title="Klaim" helper="Pantau status" onClick={() => setActiveMenu("claims")} />
              <SmallActionCard icon={CreditCard} title="Pembayaran" helper="Tagihan aktif" onClick={() => setActiveMenu("cart")} />
              <SmallActionCard icon={Headphones} title="Call Center" helper="Kanal resmi" onClick={() => setActiveMenu("help")} />
            </div>
          </SectionBox>
          <SectionBox title="Cakupan Anda" icon={CheckCircle2}>
            <div className="space-y-2">
              {activePolicies.slice(0, 3).map((policy) => (
                <div key={policy.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#D9E1EA] bg-[#F8FAFC] px-3 py-2">
                  <div className="min-w-0">
                    <div className="truncate text-[12px] font-bold text-[#041E42]">{policy.product}</div>
                    <div className="truncate text-[11px] text-[#5F7A99]">{policy.objectName}</div>
                  </div>
                  <div className="shrink-0 text-[11px] font-bold text-[#5F7A99]">{policy.periodEnd}</div>
                </div>
              ))}
            </div>
          </SectionBox>
        </div>
      </div>
    </WorkPanel>
  );
}
