import React, { useState } from "react";

import { StaffListView } from "../menuShared.jsx";

const USERS = [
  { title: "Budi Santoso", sub: "Staff RO / Maker", value: "RO", status: "Aktif" },
  { title: "Sarah Amalia", sub: "Underwriter / Reviewer", value: "Underwriter", status: "Aktif" },
  { title: "Dimas Putra", sub: "Head Of / Approver", value: "Head Of", status: "Aktif" },
];

export default function AddUserMenu() {
  const [filter, setFilter] = useState("Semua");
  const filters = ["Semua", ...Array.from(new Set(USERS.map((item) => item.value)))];
  const rows = filter === "Semua" ? USERS : USERS.filter((item) => item.value === filter);
  return <StaffListView page={{ label: "Add User", subtitle: "Checker/Approver mengelola user dan role akses." }} items={rows} filters={filters} activeFilter={filter} onFilterChange={setFilter} />;
}
