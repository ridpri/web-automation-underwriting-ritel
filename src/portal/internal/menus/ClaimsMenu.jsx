import React, { useState } from "react";

import { STAFF_CLAIMS } from "../menuData.js";
import { StaffListView } from "../menuShared.jsx";

export default function ClaimsMenu() {
  const [filter, setFilter] = useState("Semua");
  const filters = ["Semua", ...STAFF_CLAIMS.map((item) => item.title)];
  const rows = filter === "Semua" ? STAFF_CLAIMS : STAFF_CLAIMS.filter((item) => item.title === filter);
  return <StaffListView page={{ label: "Riwayat Klaim", subtitle: "Melihat riwayat klaim nasabah/polis sebagai referensi layanan." }} items={rows} filters={filters} activeFilter={filter} onFilterChange={setFilter} />;
}
