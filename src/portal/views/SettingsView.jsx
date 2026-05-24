import React, { useState } from "react";
import { Bell, CheckCircle2, Lock, Mail, MapPin, Phone, Shield, User } from "lucide-react";
import { getInitials } from "../portalUtils.js";
import { WorkPanel, PageIntro, SectionBox, SmallActionCard, InfoBox } from "../components/portalComponents.jsx";

export function FieldInput({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9AAAC0]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 h-10 w-full rounded-lg border border-[#D9E1EA] bg-white px-3 text-[13px] font-semibold text-[#041E42] outline-none transition placeholder:text-[#9AAAC0] focus:border-[#004B78] focus:ring-2 focus:ring-[#004B78]/10"
      />
    </label>
  );
}

export function TextAreaInput({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9AAAC0]">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="mt-1 w-full rounded-lg border border-[#D9E1EA] bg-white px-3 py-2 text-[13px] font-semibold leading-6 text-[#041E42] outline-none transition placeholder:text-[#9AAAC0] focus:border-[#004B78] focus:ring-2 focus:ring-[#004B78]/10"
      />
    </label>
  );
}

export function ToggleRow({ title, helper, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-[#D9E1EA] bg-[#F8FAFC] px-3 py-2.5">
      <span>
        <span className="block text-[12px] font-bold text-[#041E42]">{title}</span>
        <span className="mt-0.5 block text-[11px] leading-4 text-[#5F7A99]">{helper}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-[#D9E1EA] text-[#004B78]"
      />
    </label>
  );
}

export function SettingsView({ sessionName }) {
  const [profile, setProfile] = useState({
    name: sessionName,
    phone: "0812-1797-0000",
    email: "portal@asuransijasindo.co.id",
    identityNumber: "3174********0001",
    birthDate: "1990-08-17",
    address: "Jl. Jenderal Sudirman Kav. 1, Jakarta Pusat",
    correspondenceAddress: "Sama dengan alamat utama",
    emergencyName: "Kontak Keluarga",
    emergencyPhone: "0813-0000-1797",
  });
  const [preferences, setPreferences] = useState({
    whatsapp: true,
    email: true,
    sms: false,
    renewal: true,
    claim: true,
    marketing: false,
  });

  const updateProfile = (key) => (value) => setProfile((prev) => ({ ...prev, [key]: value }));
  const updatePreference = (key) => (value) => setPreferences((prev) => ({ ...prev, [key]: value }));

  return (
    <WorkPanel>
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
        <PageIntro
          title="Setelan akun dan data tertanggung"
          description="Perbarui data kontak, alamat, preferensi notifikasi, dan informasi darurat agar polis, klaim, serta pengingat pembayaran tetap sampai ke kanal yang benar."
          action={
            <button type="button" className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#004B78] px-4 text-[12px] font-bold text-white hover:bg-[#003F65]">
              <CheckCircle2 className="h-4 w-4" />
              Simpan Perubahan
            </button>
          }
        />
        <div className="rounded-xl border border-[#B8D7EF] bg-[#F1F8FE] p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#004B78] text-[14px] font-bold text-white">{getInitials(profile.name)}</span>
            <div className="min-w-0">
              <div className="truncate text-[14px] font-bold text-[#041E42]">{profile.name}</div>
              <div className="truncate text-[12px] text-[#5F7A99]">{profile.email}</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <InfoBox label="Status" value="Terverifikasi" />
            <InfoBox label="Verifikasi" value="Aktif" />
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-3">
          <SectionBox title="Data Kontak" icon={User}>
            <div className="grid gap-3 md:grid-cols-2">
              <FieldInput label="Nama Pemegang Polis" value={profile.name} onChange={updateProfile("name")} />
              <FieldInput label="Nomor Identitas" value={profile.identityNumber} onChange={updateProfile("identityNumber")} />
              <FieldInput label="Nomor Handphone" value={profile.phone} onChange={updateProfile("phone")} />
              <FieldInput label="Email" type="email" value={profile.email} onChange={updateProfile("email")} />
              <FieldInput label="Tanggal Lahir" type="date" value={profile.birthDate} onChange={updateProfile("birthDate")} />
            </div>
          </SectionBox>

          <SectionBox title="Alamat" icon={MapPin}>
            <div className="grid gap-3 md:grid-cols-2">
              <TextAreaInput label="Alamat Utama" value={profile.address} onChange={updateProfile("address")} />
              <TextAreaInput label="Alamat Korespondensi" value={profile.correspondenceAddress} onChange={updateProfile("correspondenceAddress")} />
            </div>
          </SectionBox>

          <SectionBox title="Kontak Darurat" icon={Phone}>
            <div className="grid gap-3 md:grid-cols-2">
              <FieldInput label="Nama Kontak" value={profile.emergencyName} onChange={updateProfile("emergencyName")} />
              <FieldInput label="Nomor Handphone" value={profile.emergencyPhone} onChange={updateProfile("emergencyPhone")} />
            </div>
          </SectionBox>
        </div>

        <div className="space-y-3">
          <SectionBox title="Preferensi Notifikasi" icon={Bell}>
            <div className="space-y-2">
              <ToggleRow title="WhatsApp" helper="Pengingat polis, klaim, dan pembayaran." checked={preferences.whatsapp} onChange={updatePreference("whatsapp")} />
              <ToggleRow title="Email" helper="Dokumen, e-polis, dan ringkasan transaksi." checked={preferences.email} onChange={updatePreference("email")} />
              <ToggleRow title="SMS" helper="Fallback untuk kode dan informasi penting." checked={preferences.sms} onChange={updatePreference("sms")} />
              <ToggleRow title="Pengingat perpanjangan" helper="Pengingat sebelum polis berakhir." checked={preferences.renewal} onChange={updatePreference("renewal")} />
              <ToggleRow title="Notifikasi klaim" helper="Notifikasi ketika status klaim berubah." checked={preferences.claim} onChange={updatePreference("claim")} />
              <ToggleRow title="Info promosi" helper="Penawaran produk relevan dari Jasindo." checked={preferences.marketing} onChange={updatePreference("marketing")} />
            </div>
          </SectionBox>

          <SectionBox title="Keamanan Akun" icon={Lock}>
            <div className="space-y-2">
              <SmallActionCard icon={Lock} title="Ubah kata sandi" helper="Perbarui password akun portal." />
              <SmallActionCard icon={Shield} title="Verifikasi dua langkah" helper="Aktif untuk akses dan perubahan data sensitif." tone="brand" />
              <SmallActionCard icon={Mail} title="Riwayat perangkat" helper="Lihat perangkat terakhir yang mengakses akun." />
            </div>
          </SectionBox>
        </div>
      </div>
    </WorkPanel>
  );
}
