import React, { useState } from "react";
import { CheckCircle2, ClipboardList, FileText, ShoppingCart } from "lucide-react";

import { TASKS } from "../menuData.js";
import { FilterPills, PageIntro, StaffPipeline, StaffStat, StaffTaskTable, WorkPanel } from "../menuShared.jsx";

export default function DashboardMenu() {
  const [activeFilter, setActiveFilter] = useState("Ringkasan");
  const filters = ["Ringkasan", "Pipeline", "Tasklist", "Klaim"];
  const showOverview = activeFilter === "Ringkasan";
  const showPipeline = activeFilter === "Ringkasan" || activeFilter === "Pipeline";
  const showTasklist = activeFilter === "Ringkasan" || activeFilter === "Tasklist";

  return (
    <div className="space-y-3">
      <PageIntro title="Dashboard" description="Monitoring aktivitas staff, pipeline penawaran, task prioritas, dan status transaksi." action={<span className="rounded-lg bg-[#EEF5FA] px-3 py-2 text-[11px] font-bold text-[#004B78]">Data diperbarui: 18 Mei 2026 09:30 WIB</span>} />
      <FilterPills items={filters} active={activeFilter} onChange={setActiveFilter} />
      {showOverview ? (
        <WorkPanel>
          <div className="rounded-xl border border-[#004B78] bg-[#004B78] p-4 text-white md:p-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">Portal Web Automation Flow Internal</div>
            <div className="mt-2 text-[22px] font-bold leading-tight md:text-[26px]">Dashboard Monitoring Aktivitas Staff</div>
            <div className="mt-2 max-w-3xl text-[13px] leading-6 text-white/85">Pantau assisted selling, penawaran, assist pengisian data, pembayaran, penerbitan polis, dan tindak lanjut klaim.</div>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            <StaffStat icon={ShoppingCart} title="Penawaran Hari Ini" value="24" note="4 menunggu respons nasabah" />
            <StaffStat icon={ClipboardList} title="Tasklist Aktif" value="5" note="1 butuh assist internal" />
            <StaffStat icon={CheckCircle2} title="Transaksi Polis" value="18" note="10 polis sudah terbit" />
            <StaffStat icon={FileText} title="Klaim Dipantau" value="9" note="2 butuh tindak lanjut" />
          </div>
        </WorkPanel>
      ) : null}
      {showPipeline ? <WorkPanel><StaffPipeline /></WorkPanel> : null}
      {showTasklist || activeFilter === "Klaim" ? <WorkPanel><StaffTaskTable rows={activeFilter === "Klaim" ? TASKS.filter((item) => item.product.includes("Travel") || item.product.includes("Life")) : TASKS} title={activeFilter === "Klaim" ? "Task Klaim Terkait" : "Tasklist Prioritas"} /></WorkPanel> : null}
    </div>
  );
}
