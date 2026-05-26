import React, { useEffect, useState } from "react";
import { ArrowUpRight, CheckCircle2, ClipboardCheck, FileCheck2, FileSearch, RotateCcw, Send, ShieldCheck, UserRoundCheck, XCircle } from "lucide-react";

import { PageIntro, StaffBadge, WorkPanel } from "../menuShared.jsx";
import { cls } from "../menuUtils.js";

const ROLE_VIEWS = {
  maker: {
    label: "Maker",
    role: "Staff RO",
    tone: "blue",
    description: "Membuat penawaran, melengkapi data nasabah, mengirim link pembayaran setelah approval, dan memonitor penerbitan polis.",
    stats: [
      { label: "Butuh Assist", value: 5, note: "Nasabah perlu dibantu input data" },
      { label: "Perlu Revisi", value: 3, note: "Dikembalikan oleh Checker/Approver" },
      { label: "Siap Submit", value: 8, note: "Menunggu dikirim ke Checker" },
    ],
    steps: [
      { icon: UserRoundCheck, title: "Input Data Awal", detail: "Lengkapi data calon tertanggung dan pilih produk asuransi." },
      { icon: Send, title: "Kirim Penawaran", detail: "Bagikan WhatsApp, email, link, atau QR ke nasabah." },
      { icon: ClipboardCheck, title: "Submit ke Checker", detail: "Kirim data lanjutan dan dokumen pendukung untuk review underwriting." },
      { icon: CheckCircle2, title: "Lanjut Pembayaran", detail: "Kirim link pembayaran setelah approval diberikan." },
    ],
    tasks: [
      { name: "Rina Maharani", email: "rina.maharani@email.com", product: "Asuransi Mobil - Total Loss", pipeline: "Menunggu Data", detail: "Butuh Assist Internal", owner: "Maker", sla: "Hari ini", action: "Lanjutkan Pengisian", avatar: "RM" },
      { name: "Fajar Nugroho", email: "fajar.nugroho@email.com", product: "Asuransi Kebakaran", pipeline: "Perlu Revisi", detail: "Lengkapi Dokumen Pendukung", owner: "Maker", sla: "Hari ini", action: "Revisi Data", avatar: "FN" },
      { name: "CV Mitra Jaya", email: "admin@mitrajaya.co.id", product: "Property All Risk", pipeline: "Draft Penawaran", detail: "Siap Submit ke Checker", owner: "Maker", sla: "Besok", action: "Submit Review", avatar: "MJ" },
      { name: "Andi Wijaya", email: "andi.wijaya@email.com", product: "Life Guard", pipeline: "Approved", detail: "Kirim Link Pembayaran", owner: "Maker", sla: "1 hari lagi", action: "Kirim Link", avatar: "AW" },
    ],
  },
  checker: {
    label: "Checker",
    role: "Staff Underwriting",
    tone: "purple",
    description: "Menerima submission dari Maker, melakukan review data dan dokumen, validasi parameter underwriting, lalu memutuskan revisi atau eskalasi.",
    stats: [
      { label: "Masuk Review", value: 4, note: "Submission baru dari Maker" },
      { label: "Perlu Revisi", value: 2, note: "Dikembalikan ke Maker" },
      { label: "Eskalasi", value: 3, note: "Butuh keputusan Approver" },
    ],
    steps: [
      { icon: FileSearch, title: "Review Data", detail: "Periksa data calon tertanggung, objek, dokumen, dan nilai pertanggungan." },
      { icon: ClipboardCheck, title: "Validasi Parameter", detail: "Cek rule, scoring, limit kewenangan, dan kelengkapan underwriting." },
      { icon: RotateCcw, title: "Return for Revision", detail: "Kembalikan ke Maker jika data belum lengkap atau perlu koreksi." },
      { icon: ArrowUpRight, title: "Eskalasi Approver", detail: "Lanjutkan kasus yang melewati kewenangan Checker." },
    ],
    tasks: [
      { name: "PT Sinar Jaya", email: "admin@sinarjaya.co.id", product: "Property All Risk", pipeline: "Validasi Data", detail: "Review Data dan Dokumen", owner: "Checker", sla: "Hari ini", action: "Review Data", avatar: "SJ" },
      { name: "Rizky Pratama", email: "rizky.pratama@email.com", product: "Asuransi Mobil - Komprehensif", pipeline: "Validasi Rule", detail: "Cek Parameter Underwriting", owner: "Checker", sla: "1 hari lagi", action: "Validasi", avatar: "RP" },
      { name: "PT Berkah Logistik", email: "risk@berkahlogistik.co.id", product: "Asuransi Kebakaran", pipeline: "Butuh Koreksi", detail: "Perlu Revisi Maker", owner: "Checker", sla: "2 hari lagi", action: "Return Revisi", avatar: "BL" },
      { name: "Dewi Lestari", email: "dewi.lestari@email.com", product: "Travel Safe", pipeline: "Limit Tinggi", detail: "Eskalasi ke Approver", owner: "Checker", sla: "Hari ini", action: "Eskalasi", avatar: "DL" },
    ],
  },
  approver: {
    label: "Approver",
    role: "HO Underwriting",
    tone: "orange",
    description: "Menerima eskalasi dari Checker, meninjau kasus, lalu memberi keputusan final approve, reject, atau return for revision.",
    stats: [
      { label: "Eskalasi Masuk", value: 3, note: "Menunggu keputusan final" },
      { label: "Approved", value: 7, note: "Siap lanjut pembayaran" },
      { label: "Return/Reject", value: 2, note: "Butuh koreksi atau ditolak" },
    ],
    steps: [
      { icon: FileCheck2, title: "Review Kasus Eskalasi", detail: "Tinjau ringkasan Checker, risiko, scoring, dan dasar pertimbangan." },
      { icon: CheckCircle2, title: "Approve", detail: "Setujui agar Maker dapat melanjutkan proses pembayaran dan penerbitan." },
      { icon: XCircle, title: "Reject", detail: "Tolak pengajuan bila risiko tidak dapat diterima." },
      { icon: RotateCcw, title: "Return for Revision", detail: "Kembalikan untuk revisi atau kelengkapan data." },
    ],
    tasks: [
      { name: "PT Garuda Prima", email: "legal@garudaprima.co.id", product: "Property All Risk", pipeline: "Eskalasi Checker", detail: "Keputusan Final", owner: "Approver", sla: "Hari ini", action: "Putuskan", avatar: "GP" },
      { name: "Budi Santoso", email: "budi.santoso@email.com", product: "Asuransi Mobil - Komprehensif", pipeline: "Limit Approval", detail: "Review Kasus Eskalasi", owner: "Approver", sla: "Hari ini", action: "Review Final", avatar: "BS" },
      { name: "PT Sinar Jaya", email: "admin@sinarjaya.co.id", product: "Property All Risk", pipeline: "Revisi Checker", detail: "Return for Revision", owner: "Approver", sla: "1 hari lagi", action: "Return Revisi", avatar: "SJ" },
      { name: "CV Tirta Abadi", email: "finance@tirtaabadi.co.id", product: "Asuransi Kebakaran", pipeline: "High Risk", detail: "Pertimbangan Reject", owner: "Approver", sla: "2 hari lagi", action: "Review Risiko", avatar: "TA" },
    ],
  },
};

const ROLE_KEYS = Object.keys(ROLE_VIEWS);

function normalizeStaffRole(staffRole) {
  const normalized = String(staffRole || "").trim().toLowerCase();
  if (normalized === "checker") return "checker";
  if (normalized === "approver") return "approver";
  return "maker";
}

function roleClasses(tone, active = false) {
  const tones = {
    blue: active ? "border-[#004B78] bg-[#004B78] text-white" : "border-blue-100 bg-blue-50 text-[#004B78]",
    purple: active ? "border-violet-700 bg-violet-700 text-white" : "border-violet-100 bg-violet-50 text-violet-700",
    orange: active ? "border-orange-500 bg-orange-500 text-white" : "border-orange-100 bg-orange-50 text-orange-700",
  };
  return tones[tone] || tones.blue;
}

export default function TasklistMenu({ staffRole = "Maker" }) {
  const [activeRole, setActiveRole] = useState(() => normalizeStaffRole(staffRole));
  const roleView = ROLE_VIEWS[activeRole];
  useEffect(() => {
    setActiveRole(normalizeStaffRole(staffRole));
  }, [staffRole]);
  return (
    <div className="space-y-3">
      <PageIntro title="Tasklist" description="Daftar pekerjaan operasional berdasarkan kewenangan Maker, Checker, dan Approver." />
      <WorkPanel>
        <div className="grid gap-2 md:grid-cols-3">
          {ROLE_KEYS.map((key) => {
            const item = ROLE_VIEWS[key];
            return (
              <button key={key} type="button" onClick={() => setActiveRole(key)} className={cls("min-h-[92px] rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm", roleClasses(item.tone, activeRole === key))}>
                <div className="text-[15px] font-black">{item.label}</div>
                <div className={cls("mt-1 text-[12px] font-bold", activeRole === key ? "text-white/85" : "text-current/80")}>{item.role}</div>
                <div className={cls("mt-2 text-[11px] leading-4", activeRole === key ? "text-white/75" : "text-[#5F7A99]")}>{item.description}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl border border-[#D9E1EA] bg-white p-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#5F7A99]">Role Aktif</div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h2 className="text-[18px] font-black text-[#041E42]">{roleView.label}</h2>
                <span className={cls("rounded-full border px-2.5 py-1 text-[11px] font-bold", roleClasses(roleView.tone))}>{roleView.role}</span>
              </div>
              <p className="mt-1 max-w-3xl text-[12px] leading-5 text-[#5F7A99]">{roleView.description}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3 lg:w-[460px]">
              {roleView.stats.map((item) => (
                <div key={item.label} className="rounded-xl border border-[#D9E1EA] bg-[#F8FAFC] p-3">
                  <div className="text-[11px] font-bold text-[#304B68]">{item.label}</div>
                  <div className="mt-1 text-[24px] font-black leading-none text-[#041E42]">{item.value}</div>
                  <div className="mt-1 text-[10px] leading-4 text-[#5F7A99]">{item.note}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-2 lg:grid-cols-4">
            {roleView.steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-xl border border-[#D9E1EA] bg-white p-3">
                  <div className="flex items-start gap-3">
                    <div className={cls("grid h-10 w-10 shrink-0 place-items-center rounded-lg border", roleClasses(roleView.tone))}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#5F7A99]">Step {index + 1}</div>
                      <div className="mt-1 text-[13px] font-black text-[#041E42]">{step.title}</div>
                      <div className="mt-1 text-[11px] leading-4 text-[#5F7A99]">{step.detail}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <RoleTaskTable rows={roleView.tasks} title={`Daftar Task ${roleView.label}`} tone={roleView.tone} />
      </WorkPanel>
    </div>
  );
}

function RoleTaskTable({ rows, title, tone }) {
  return (
    <div className="mt-4 rounded-xl border border-[#D9E1EA] bg-white p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[13px] font-bold text-[#041E42]">
          <ShieldCheck className="h-4 w-4 text-[#004B78]" />
          {title}
        </div>
        <span className={cls("rounded-full border px-3 py-1 text-[11px] font-bold", roleClasses(tone))}>{rows.length} Task Aktif</span>
      </div>
      <div className="overflow-auto rounded-xl border border-[#D9E1EA]">
        <table className="w-full min-w-[980px] text-left text-[12px]">
          <thead className="bg-[#EEF5FA] text-[10px] uppercase tracking-[0.12em] text-[#004B78]">
            <tr>
              <th className="px-3 py-3">Nasabah</th>
              <th className="px-3 py-3">Produk</th>
              <th className="px-3 py-3">Pipeline</th>
              <th className="px-3 py-3">Detail Status</th>
              <th className="px-3 py-3">Owner</th>
              <th className="px-3 py-3">SLA</th>
              <th className="px-3 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7EDF4] bg-white">
            {rows.map((row) => (
              <tr key={`${row.email}-${row.action}`} className="hover:bg-[#F8FAFC]">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#EEF5FA] text-[11px] font-black text-[#004B78]">{row.avatar}</div>
                    <div className="min-w-0">
                      <div className="font-bold text-[#041E42]">{row.name}</div>
                      <div className="text-[11px] text-[#5F7A99]">{row.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 font-semibold text-[#304B68]">{row.product}</td>
                <td className="px-3 py-3"><StaffBadge>{row.pipeline}</StaffBadge></td>
                <td className="px-3 py-3"><StaffBadge>{row.detail}</StaffBadge></td>
                <td className="px-3 py-3"><StaffBadge>{row.owner}</StaffBadge></td>
                <td className="px-3 py-3 font-bold text-rose-600">{row.sla}</td>
                <td className="px-3 py-3">
                  <button type="button" className={cls("rounded-md px-3 py-1.5 text-[11px] font-bold", tone === "orange" ? "bg-orange-500 text-white" : tone === "purple" ? "bg-violet-700 text-white" : "bg-[#F2A62A] text-white")}>
                    {row.action}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
