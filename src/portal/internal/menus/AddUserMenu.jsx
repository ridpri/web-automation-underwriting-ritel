import React, { useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";

import { PageIntro, WorkPanel } from "../menuShared.jsx";
import { cls } from "../menuUtils.js";

const USER_ROWS = [
  { name: "Taqwim", nik: "01021", email: "taqwim@asuransijasindo.co.id", unit: "Representative Office", branch: "RO Jakarta", crmId: "taqwim01021", phone: "081234567001", role: "Maker", status: "Aktif" },
  { name: "Resdy", nik: "04410", email: "resdy@asuransijasindo.co.id", unit: "Group Underwriting Ritel", branch: "Head Office - Graha Jasindo", crmId: "resdy04410", phone: "081234567002", role: "Checker", status: "Aktif" },
  { name: "Ridho", nik: "08821", email: "ridho@asuransijasindo.co.id", unit: "Group Underwriting Ritel", branch: "Head Office - Graha Jasindo", crmId: "ridho08821", phone: "081234567003", role: "Approver", status: "Aktif" },
  { name: "Dita Larasati", nik: "02994", email: "dita.larasati@asuransijasindo.co.id", unit: "Digital Channel", branch: "Digital Channel", crmId: "dita02994", phone: "081234567004", role: "Maker", status: "Non Aktif" },
  { name: "Ilham Pratama", nik: "08007", email: "ilham.pratama@asuransijasindo.co.id", unit: "Representative Office", branch: "RO Jambi", crmId: "ilham08007", phone: "081234567005", role: "Maker", status: "Aktif" },
];

const EMPTY_FORM = {
  name: "",
  nik: "",
  email: "",
  unit: "Group Underwriting Ritel",
  branch: "Head Office - Graha Jasindo",
  crmId: "",
  phone: "",
  role: "Maker",
  active: true,
};

const UNIT_OPTIONS = ["Group Underwriting Ritel", "Representative Office", "Digital Channel"];
const BRANCH_OPTIONS = ["Head Office - Graha Jasindo", "RO Jakarta", "RO Jambi", "Digital Channel"];
const ROLE_OPTIONS = ["Maker", "Checker", "Approver"];

function roleBadgeClass() {
  return "border-[#D9E1EA] bg-[#EEF5FA] text-[#004B78]";
}

function statusBadgeClass(status) {
  return status === "Aktif" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-[#D9E1EA] bg-[#F6F8FA] text-[#5F7A99]";
}

function normalizeQuery(value) {
  return String(value || "").trim().toLowerCase();
}

function createFormFromUser(user) {
  return {
    name: user.name,
    nik: user.nik,
    email: user.email,
    unit: user.unit,
    branch: user.branch,
    crmId: user.crmId,
    phone: user.phone,
    role: user.role,
    active: user.status === "Aktif",
  };
}

export default function AddUserMenu() {
  const [mode, setMode] = useState("list");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  const rows = useMemo(() => {
    const needle = normalizeQuery(query);
    if (!needle) return USER_ROWS;
    return USER_ROWS.filter((user) => [user.name, user.email, user.nik, user.crmId, user.role, user.unit, user.branch].some((value) => normalizeQuery(value).includes(needle)));
  }, [query]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setMode("form");
  }

  function openEdit(user) {
    setForm(createFormFromUser(user));
    setMode("form");
  }

  function updateForm(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  if (mode === "form") {
    return (
      <div className="space-y-4">
        <PageIntro
          title="Tambah User Internal"
          description="Isi data user internal untuk mapping SSO, role, cabang, CRM ID, dan status akses."
          action={
            <button type="button" onClick={() => setMode("list")} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#004B78] bg-white px-4 text-[12px] font-black text-[#004B78] hover:bg-[#EEF5FA]">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </button>
          }
        />
        <WorkPanel>
          <div className="rounded-xl border border-[#D9E1EA] bg-white p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <UserField label="Nama Lengkap" value={form.name} onChange={updateForm("name")} placeholder="Contoh: Budi Santoso" />
              <UserField label="NIK (Nomor Induk Karyawan)" value={form.nik} onChange={updateForm("nik")} placeholder="Contoh: 02994" />
              <UserField label="Email Corporate" value={form.email} onChange={updateForm("email")} placeholder="nama@asuransijasindo.co.id" type="email" />
              <UserSelect label="Unit / Group" value={form.unit} onChange={updateForm("unit")} options={UNIT_OPTIONS} />
              <div className="md:col-span-2">
                <UserSelect label="Cabang / Kantor" value={form.branch} onChange={updateForm("branch")} options={BRANCH_OPTIONS} />
              </div>
              <UserField label="CRM ID" value={form.crmId} onChange={updateForm("crmId")} placeholder="Contoh: dita02994" />
              <UserField label="No. WA" value={form.phone} onChange={updateForm("phone")} placeholder="08xxxxxxxxxx" />
              <div className="md:col-span-2">
                <UserSelect label="Role" value={form.role} onChange={updateForm("role")} options={ROLE_OPTIONS} />
              </div>
            </div>

            <div className="mt-6 border-t border-[#E7EDF4] pt-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-[13px] font-black text-[#304B68]">Status User</div>
                  <div className="mt-1 text-[12px] text-[#5F7A99]">Geser toggle untuk mengaktifkan atau menonaktifkan akses user.</div>
                </div>
                <button type="button" onClick={() => setForm((current) => ({ ...current, active: !current.active }))} className={cls("inline-flex h-8 w-[74px] items-center rounded-full p-1 text-[11px] font-black transition", form.active ? "justify-end bg-emerald-500 text-white" : "justify-start bg-slate-300 text-slate-700")} aria-pressed={form.active}>
                  <span className="px-1.5">{form.active ? "Aktif" : ""}</span>
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-emerald-600 shadow">{form.active ? "✓" : ""}</span>
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-[#E7EDF4] pt-4">
              <button type="button" onClick={() => setMode("list")} className="h-11 rounded-lg border border-[#D9E1EA] bg-white px-5 text-[13px] font-black text-[#004B78] hover:bg-[#EEF5FA]">Batal</button>
              <button type="button" onClick={() => setMode("list")} className="h-11 rounded-lg bg-[#F2A62A] px-5 text-[13px] font-black text-white hover:bg-[#DF9620]">Simpan User</button>
            </div>
          </div>
        </WorkPanel>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageIntro
        title="Add User"
        description="Daftar user internal yang sudah terdaftar pada portal dan mapping role aksesnya."
        action={
          <button type="button" onClick={openCreate} className="inline-flex h-10 items-center justify-center rounded-lg bg-[#F2A62A] px-4 text-[13px] font-black text-white shadow-sm hover:bg-[#DF9620]">
            + Add User
          </button>
        }
      />
      <WorkPanel>
        <div className="rounded-xl border border-[#D9E1EA] bg-white p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-[18px] font-black text-[#004B78]">Daftar User Internal</h2>
              <p className="mt-1 text-[13px] leading-5 text-[#5F7A99]">Halaman ini mengatur profil, role, cabang, dan status akses portal.</p>
            </div>
            <label className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-[#D9E1EA] bg-white px-3 lg:w-[380px]">
              <Search className="h-4 w-4 text-[#9AAAC0]" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, email, CRM ID, atau role" className="h-full min-w-0 flex-1 border-0 bg-transparent text-[13px] text-[#041E42] outline-none placeholder:text-[#9AAAC0]" />
            </label>
          </div>

          <div className="mt-4 overflow-auto rounded-xl border border-[#D9E1EA] bg-white">
            <table className="w-full min-w-[1120px] text-left text-[12px]">
              <thead className="bg-[#EEF5FA] text-[11px] text-[#004B78]">
                <tr>
                  <th className="px-3 py-3">Nama</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-3 py-3">Unit / Group</th>
                  <th className="px-3 py-3">Cabang</th>
                  <th className="px-3 py-3">CRM ID</th>
                  <th className="px-3 py-3">No. WA</th>
                  <th className="px-3 py-3">Role</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7EDF4]">
                {rows.map((user) => (
                  <tr key={user.email} className="hover:bg-[#F8FAFC]">
                    <td className="px-3 py-3"><div className="font-black text-[#041E42]">{user.name}</div><div className="mt-0.5 text-[11px] text-[#5F7A99]">NIK: {user.nik}</div></td>
                    <td className="px-3 py-3 font-semibold text-[#5F7A99]">{user.email}</td>
                    <td className="px-3 py-3 font-semibold text-[#304B68]">{user.unit}</td>
                    <td className="px-3 py-3 font-semibold text-[#304B68]">{user.branch}</td>
                    <td className="px-3 py-3 font-mono font-black text-[#004B78]">{user.crmId}</td>
                    <td className="px-3 py-3 font-semibold text-[#304B68]">{user.phone}</td>
                    <td className="px-3 py-3"><span className={cls("inline-flex rounded-md border px-2.5 py-1 text-[11px] font-black", roleBadgeClass())}>{user.role}</span></td>
                    <td className="px-3 py-3"><span className={cls("inline-flex rounded-md border px-2.5 py-1 text-[11px] font-black", statusBadgeClass(user.status))}>{user.status}</span></td>
                    <td className="px-3 py-3"><button type="button" onClick={() => openEdit(user)} className="h-9 rounded-lg border border-[#D9E1EA] bg-white px-4 text-[12px] font-black text-[#004B78] hover:bg-[#EEF5FA]">Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </WorkPanel>
    </div>
  );
}

function UserField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="text-[13px] font-black text-[#304B68]">{label}</span>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="mt-1 h-11 w-full rounded-lg border border-[#D9E1EA] bg-white px-3 text-[13px] font-semibold text-[#041E42] outline-none placeholder:text-[#9AAAC0] focus:border-[#004B78] focus:ring-2 focus:ring-[#004B78]/10" />
    </label>
  );
}

function UserSelect({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-[13px] font-black text-[#304B68]">{label}</span>
      <select value={value} onChange={onChange} className="mt-1 h-11 w-full rounded-lg border border-[#D9E1EA] bg-white px-3 text-[13px] font-semibold text-[#041E42] outline-none focus:border-[#004B78] focus:ring-2 focus:ring-[#004B78]/10">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}
