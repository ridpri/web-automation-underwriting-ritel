import React, { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, ChevronDown, Clock3, FileText, Filter, Search, ShieldAlert } from "lucide-react";

function cls() {
  return Array.from(arguments).filter(Boolean).join(" ");
}

function toneClasses(status) {
  if (status === "Pending Review Internal" || status === "Perlu Revisi") return "border-amber-200 bg-amber-50 text-amber-900";
  if (status === "Siap Bayar" || status === "Paid") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (status === "Expired" || status === "Rejected") return "border-red-200 bg-red-50 text-red-900";
  return "border-sky-200 bg-sky-50 text-sky-900";
}

function displayWorkbenchStatus(status) {
  if (status === "Pending Review Internal") return "Menunggu Tinjauan Internal";
  if (status === "Paid") return "Selesai Dibayar";
  if (status === "Expired") return "Kedaluwarsa";
  if (status === "Rejected") return "Ditolak";
  return status;
}

function displayWorkbenchChannel(channel) {
  if (channel === "Internal Assisted") return "Dibantu Internal";
  if (channel === "Partner Portal") return "Portal Partner";
  if (channel === "Partner API") return "API Partner";
  return channel;
}

const FILTERS = ["Semua", "Perlu Ditindak", "Menunggu Tinjauan", "Perlu Revisi", "Kedaluwarsa", "Selesai Dibayar"];

const WORKSPACE_LANES = [
  {
    key: "review",
    label: "Perlu Saya Tinjau",
    helper: "Dokumen dan validasi",
    icon: ShieldAlert,
  },
  {
    key: "waiting",
    label: "Menunggu Respons Nasabah",
    helper: "Tindak lanjut dan kelengkapan",
    icon: Clock3,
  },
  {
    key: "ready",
    label: "Siap Kirim / Bayar",
    helper: "Versi aktif dan final",
    icon: CheckCircle2,
  },
];

function matchesWorkspaceLane(record, laneKey) {
  if (laneKey === "review") return ["Pending Review Internal", "Perlu Revisi"].includes(record.status);
  if (laneKey === "waiting") return ["Isi Data Lanjutan", "Indikasi Terkirim", "Dibuka Calon Tertanggung"].includes(record.status);
  if (laneKey === "ready") return ["Siap Bayar", "Paid"].includes(record.status);
  return true;
}

function workspaceLaneDone(activeLane, laneKey) {
  const order = ["review", "waiting", "ready"];
  return order.indexOf(laneKey) < order.indexOf(activeLane);
}

function AuditFeedRow({ item }) {
  const actorInitial = String(item.actor || "S").trim().charAt(0).toUpperCase();
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF3FF] text-[11px] font-bold text-[#0A4D82]">
        {actorInitial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <div className="text-sm font-semibold text-[#041E42]">{item.actor}</div>
          <div className="text-[12px] text-slate-400">{item.at}</div>
        </div>
        <div className="mt-1 rounded-2xl border border-[#D8E1EA] bg-slate-50 px-3.5 py-2.5 text-[14px] leading-6 text-[#5F7A99]">
          {item.text}
        </div>
      </div>
    </div>
  );
}

function WorkbenchSection({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={cls("rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[15px] font-semibold leading-6 text-[#041E42] md:text-[16px]">{title}</div>
          {subtitle ? <div className="mt-1 max-w-3xl text-[14px] leading-6 text-[#5F7A99]">{subtitle}</div> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cls(
        "inline-flex rounded-full px-4 py-2 text-sm font-semibold transition",
        active ? "bg-[#0A4D82] text-white" : "bg-[#F1F5F9] text-slate-600 hover:bg-slate-200",
      )}
    >
      {children}
    </button>
  );
}

function WorkspaceRail({ activeLane, onChange, records }) {
  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-white p-3 shadow-2xl shadow-black/15 md:max-w-4xl md:p-5">
      <div className="rounded-2xl border border-[#D8E1EA] bg-[#F4F7FA] px-3 py-4 md:px-5 md:py-5">
        <div className="flex flex-col gap-5 md:flex-row md:gap-5">
          {WORKSPACE_LANES.map((item, index) => {
            const Icon = item.icon;
            const active = activeLane === item.key;
            const done = workspaceLaneDone(activeLane, item.key);
            const count = records.filter((record) => matchesWorkspaceLane(record, item.key)).length;
            const showConnector = index < WORKSPACE_LANES.length - 1;
            const subtitle = active ? "Sedang dibuka" : done ? `${count} selesai` : "Klik untuk buka";

            return (
              <React.Fragment key={item.key}>
                <button
                  type="button"
                  onClick={() => onChange(item.key)}
                  className="group relative flex flex-1 flex-col items-center text-center"
                >
                  <div
                    className={cls(
                      "relative flex w-full flex-col items-center text-center transition",
                      active
                        ? "rounded-[20px] border border-[#D8E1EA] bg-white px-4 py-4 shadow-sm md:min-h-[128px] md:justify-center"
                        : "px-1 py-2 md:min-h-[128px] md:justify-center"
                    )}
                  >
                    <div className={cls("flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white transition", done ? "border-green-600 text-green-600" : active ? "border-[#0A4D82] text-[#0A4D82]" : "border-slate-300 text-slate-300 group-hover:border-[#0A4D82] group-hover:text-[#0A4D82]")}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className={cls("mt-3 text-[14px] font-bold leading-5 transition md:text-[16px]", active || done ? "text-[#041E42]" : "text-[#5F7A99] group-hover:text-[#041E42]")}>{item.label}</div>
                    <div className={cls("mt-2 rounded-full px-3 py-1 text-[11px] font-medium leading-4 transition", active ? "bg-[#EAF3FF] text-[#0A4D82]" : done ? "border border-emerald-200 bg-white text-emerald-700" : "border border-[#D8E1EA] bg-white text-[#8EA3BC] group-hover:text-[#0A4D82]")}>
                      {subtitle}
                    </div>
                    <div className={cls("mt-2 text-[13px] leading-5 transition", active || done ? "text-[#8EA3BC]" : "text-[#8EA3BC] group-hover:text-[#5F7A99]")}>
                      {item.helper}
                    </div>
                  </div>
                </button>
                {showConnector ? <div className="hidden h-px flex-1 self-center bg-slate-300 md:block" /> : null}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ReviewWorkbench({
  records,
  onBack,
  onOpenJourney,
  title = "Tinjauan Internal",
  subtitle = "Antrean operasional lintas produk untuk transaksi yang perlu dipantau, ditinjau, atau ditindaklanjuti.",
  emptyMessage = "Belum ada transaksi yang cocok dengan filter saat ini.",
  defaultFilter = "Semua",
  showWorkspaceRail = false,
  defaultWorkspaceLane = "review",
}) {
  const [activeFilter, setActiveFilter] = useState(defaultFilter);
  const [activeWorkspaceLane, setActiveWorkspaceLane] = useState(defaultWorkspaceLane);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(records[0]?.id || "");

  const filtered = useMemo(() => {
    return records.filter((item) => {
      const matchesLane = showWorkspaceRail ? matchesWorkspaceLane(item, activeWorkspaceLane) : true;
      const matchesQuery =
        !query ||
        [item.id, item.product, item.customer, item.status, item.owner].join(" ").toLowerCase().includes(query.toLowerCase());

      const matchesFilter =
        activeFilter === "Semua"
          ? true
          : activeFilter === "Perlu Ditindak"
            ? ["Pending Review Internal", "Perlu Revisi", "Isi Data Lanjutan"].includes(item.status)
            : activeFilter === "Menunggu Tinjauan"
              ? item.status === "Pending Review Internal"
              : activeFilter === "Perlu Revisi"
                ? item.status === "Perlu Revisi"
                : activeFilter === "Kedaluwarsa"
                  ? item.status === "Expired"
                  : item.status === "Paid";

      return matchesLane && matchesQuery && matchesFilter;
    });
  }, [activeFilter, activeWorkspaceLane, query, records, showWorkspaceRail]);

  const selected = filtered.find((item) => item.id === selectedId) || filtered[0] || records[0];

  return (
    <div className="min-h-screen bg-[#F3F5F7] text-slate-900">
      <section className="bg-[#0A4D82] pb-12 pt-6 md:pb-16 md:pt-8">
        <div className="mx-auto max-w-[1280px] px-4 md:px-6">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-[12px] border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/15"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </button>
            <div className="h-[48px] w-[120px] shrink-0 opacity-0" aria-hidden="true" />
          </div>

          <div className="mx-auto mt-8 max-w-[900px] text-center text-white md:mt-10">
            <div className="text-[40px] font-black tracking-tight md:text-[48px]">{title}</div>
            <div className="mx-auto mt-4 max-w-[760px] text-[17px] leading-8 text-white/95">{subtitle}</div>
          </div>

          {showWorkspaceRail ? <div className="mx-auto mt-8 max-w-[900px]">{<WorkspaceRail activeLane={activeWorkspaceLane} onChange={setActiveWorkspaceLane} records={records} />}</div> : null}
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-6 md:py-8">
        <div className="space-y-6">
          <WorkbenchSection title="Antrean internal" subtitle="Cari dan pilih transaksi yang ingin dipantau atau ditinjau.">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {FILTERS.map((item) => (
                  <FilterChip key={item} active={activeFilter === item} onClick={() => setActiveFilter(item)}>
                    {item}
                  </FilterChip>
                ))}
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Cari nomor, nama, produk, atau penanggung jawab"
                    className="h-11 w-full rounded-xl border border-[#D9E1EA] bg-white pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-[#0A4D82]"
                  />
                </div>
                <button type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#D9E1EA] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <Filter className="h-4 w-4" />
                  Filter
                </button>
              </div>
            </div>
          </WorkbenchSection>

          <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
            <WorkbenchSection title="Daftar transaksi" subtitle="Transaksi yang sesuai dengan filter aktif.">
              <div className="space-y-3">
                {filtered.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={cls(
                      "w-full rounded-[20px] border bg-white p-4 text-left shadow-sm transition",
                      selected?.id === item.id ? "border-[#0A4D82] bg-[#F8FBFE]" : "border-[#D8E1EA] hover:bg-slate-50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8EA3BC]">{item.id}</div>
                        <div className="mt-2 text-[15px] font-semibold leading-6 text-[#041E42] md:text-[16px]">{item.product}</div>
                      </div>
                      <span className={cls("inline-flex rounded-full border px-3 py-1 text-xs font-semibold", toneClasses(item.status))}>{displayWorkbenchStatus(item.status)}</span>
                    </div>
                    <div className="mt-3 grid gap-2 text-[14px] leading-6 text-[#5F7A99] sm:grid-cols-2">
                      <div><span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Tertanggung</span><div className="mt-1 text-[14px] font-semibold text-[#041E42]">{item.customer}</div></div>
                      <div><span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Penanggung jawab</span><div className="mt-1 text-[14px] font-semibold text-[#041E42]">{item.owner}</div></div>
                      <div><span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Alasan</span><div className="mt-1 text-[14px] font-semibold text-[#041E42]">{item.reason || "-"}</div></div>
                      <div><span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Aktivitas terakhir</span><div className="mt-1 text-[14px] font-semibold text-[#041E42]">{item.lastActivity}</div></div>
                    </div>
                  </button>
                ))}
                {!filtered.length ? (
                  <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                    {emptyMessage}
                  </div>
                ) : null}
              </div>
            </WorkbenchSection>

            {selected ? (
              <div className="space-y-6">
                <WorkbenchSection
                  title="Ringkasan transaksi"
                  subtitle="Lihat konteks utama transaksi sebelum membuka alur detailnya."
                  action={
                    <button type="button" onClick={() => onOpenJourney(selected)} className="inline-flex h-11 items-center justify-center rounded-xl bg-[#F5A623] px-4 text-sm font-semibold text-white hover:brightness-105">
                      Buka Transaksi
                    </button>
                  }
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">{selected.version}</span>
                        <span className={cls("inline-flex rounded-full border px-3 py-1 text-xs font-semibold", toneClasses(selected.status))}>{displayWorkbenchStatus(selected.status)}</span>
                        <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">{displayWorkbenchChannel(selected.channel)}</span>
                      </div>
                      <div className="mt-3 text-[28px] font-black tracking-tight text-slate-900">{selected.product}</div>
                      <div className="mt-2 text-[14px] leading-6 text-[#5F7A99]">{selected.notes}</div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-[#D8E1EA] bg-white p-4"><div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Tertanggung</div><div className="mt-1.5 text-[15px] font-semibold leading-6 text-[#041E42]">{selected.customer}</div></div>
                    <div className="rounded-2xl border border-[#D8E1EA] bg-white p-4"><div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Penanggung jawab</div><div className="mt-1.5 text-[15px] font-semibold leading-6 text-[#041E42]">{selected.owner}</div></div>
                    <div className="rounded-2xl border border-[#D8E1EA] bg-white p-4"><div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">SLA</div><div className="mt-1.5 text-[15px] font-semibold leading-6 text-[#041E42]">{selected.sla}</div></div>
                    <div className="rounded-2xl border border-[#D8E1EA] bg-white p-4"><div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Berlaku sampai</div><div className="mt-1.5 text-[15px] font-semibold leading-6 text-[#041E42]">{selected.validUntil}</div></div>
                  </div>
                </WorkbenchSection>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <WorkbenchSection title="Linimasa" subtitle="Pantau update terakhir pada transaksi ini.">
                    <div className="space-y-4">
                      {selected.timeline.map((item, index) => (
                        <AuditFeedRow key={`${item.at}-${index}`} item={item} />
                      ))}
                    </div>
                  </WorkbenchSection>

                  <div className="space-y-6">
                    <WorkbenchSection title="Alasan Tinjauan" subtitle="Fokus review aktif untuk transaksi ini.">
                      <div className="rounded-xl border border-[#D8E1EA] bg-slate-50 p-3 text-[14px] leading-6 text-[#041E42]">{selected.reason || "Belum ada alasan tinjauan yang aktif."}</div>
                      {selected.flags?.length ? <div className="mt-3 space-y-2">{selected.flags.map((flag) => <div key={flag} className="rounded-xl border border-[#D8E1EA] bg-slate-50 p-3 text-[14px] leading-6 text-[#041E42]">{flag}</div>)}</div> : null}
                    </WorkbenchSection>

                    <WorkbenchSection title="Langkah Berikutnya" subtitle="Tindakan yang biasanya perlu diperhatikan sebelum lanjut.">
                      <div className="space-y-2 text-[14px] leading-6 text-[#5F7A99]">
                        <div className="rounded-xl border border-[#D8E1EA] bg-slate-50 p-3">Pastikan versi aktif masih berlaku sebelum mengarahkan calon tertanggung ke pembayaran.</div>
                        <div className="rounded-xl border border-[#D8E1EA] bg-slate-50 p-3">Setiap perubahan material harus membentuk revisi baru dan menjadikan versi lama hanya sebagai riwayat.</div>
                        <div className="rounded-xl border border-[#D8E1EA] bg-slate-50 p-3">Jika ada data dokumen yang tidak cocok, arahkan transaksi ke Menunggu Tinjauan Internal atau Perlu Revisi.</div>
                      </div>
                    </WorkbenchSection>

                    <div className="rounded-2xl bg-[#0A4D82] p-4 text-sm text-white shadow-sm">
                      <div className="flex items-start gap-2">
                        {selected.status === "Siap Bayar" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
                        <span>{selected.status === "Siap Bayar" ? "Transaksi ini sudah cukup lengkap untuk masuk ke proposal final dan pembayaran." : "Transaksi ini masih butuh perhatian internal sebelum aman dilanjutkan."}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
