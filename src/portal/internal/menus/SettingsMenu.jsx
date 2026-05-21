import React from "react";

import { StaffListView } from "../menuShared.jsx";

export default function SettingsMenu({ sessionName }) {
  const settings = [
    { title: "Profil Staff", sub: sessionName, value: "Internal", status: "Aktif" },
    { title: "Notifikasi Tasklist", sub: "Pengingat pekerjaan dan tindak lanjut nasabah.", value: "Email + Portal", status: "Aktif" },
    { title: "Preferensi Tampilan", sub: "Mode ringkas untuk daftar kerja operasional.", value: "Default", status: "Aktif" },
  ];
  return <StaffListView page={{ label: "Setelan", subtitle: "Pengaturan akun internal, notifikasi, dan preferensi portal kerja." }} items={settings} />;
}
