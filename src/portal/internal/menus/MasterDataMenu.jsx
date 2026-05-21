import React, { useState } from "react";

import { StaffCardGrid } from "../menuShared.jsx";

const MASTER_ITEMS = [
  { title: "Produk", sub: "Referensi produk asuransi retail.", value: "Produk", status: "Aktif" },
  { title: "Parameter Premi", sub: "Parameter tarif dan perhitungan.", value: "Parameter", status: "Aktif" },
  { title: "Wilayah OJK", sub: "Referensi wilayah operasional.", value: "Wilayah", status: "Aktif" },
  { title: "Role Akses", sub: "Hak akses internal portal.", value: "Role Akses", status: "Aktif" },
  { title: "Metode Bayar", sub: "Referensi kanal pembayaran.", value: "Pembayaran", status: "Aktif" },
  { title: "Template Penawaran", sub: "Dokumen dan pesan penawaran.", value: "Template", status: "Aktif" },
  { title: "Status Tasklist", sub: "Referensi status operasional.", value: "Tasklist", status: "Aktif" },
  { title: "Referensi Dokumen", sub: "Dokumen pendukung produk.", value: "Dokumen", status: "Aktif" },
];

export default function MasterDataMenu() {
  const [filter, setFilter] = useState("Semua");
  const filters = ["Semua", ...Array.from(new Set(MASTER_ITEMS.map((item) => item.value)))];
  const rows = filter === "Semua" ? MASTER_ITEMS : MASTER_ITEMS.filter((item) => item.value === filter);
  return <StaffCardGrid page={{ label: "Master Data", subtitle: "Pengelolaan referensi data sistem seperti produk, partner, promo, dan parameter." }} items={rows} filters={filters} activeFilter={filter} onFilterChange={setFilter} />;
}
