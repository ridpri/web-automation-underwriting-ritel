import React, { useState } from "react";

import { TASKS } from "../menuData.js";
import { cls, PageIntro, StaffTaskTable, WorkPanel } from "../menuShared.jsx";

export default function TasklistMenu() {
  const [filter, setFilter] = useState("Semua");
  const filters = ["Semua", "Butuh Assist Internal", "Menunggu Data Nasabah", "Validasi Data Internal", "Menunggu Pembayaran Nasabah", "Menunggu Persetujuan Penawaran"];
  const rows = filter === "Semua" ? TASKS : TASKS.filter((item) => item.detail === filter || item.pipeline === filter || item.owner === filter);
  return (
    <div className="space-y-3">
      <PageIntro title="Tasklist" description="Daftar pekerjaan operasional sesuai status dan kebutuhan tindak lanjut." />
      <WorkPanel>
        <div className="mb-3 flex flex-wrap gap-2">
          {filters.map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={cls("inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[12px] font-bold", filter === item ? "border-[#004B78] bg-[#004B78] text-white" : "border-[#D9E1EA] bg-white text-[#5F7A99] hover:bg-[#F6F8FA]")}>{item}</button>)}
        </div>
        <StaffTaskTable rows={rows} title="Daftar Task" />
      </WorkPanel>
    </div>
  );
}
