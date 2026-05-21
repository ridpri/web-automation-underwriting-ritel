import React, { useState } from "react";

import { TRANSACTIONS } from "../menuData.js";
import { StaffListView } from "../menuShared.jsx";

export default function TransactionsMenu() {
  const [filter, setFilter] = useState("Semua");
  const filters = ["Semua", ...Array.from(new Set(TRANSACTIONS.map((item) => item.status)))];
  const rows = filter === "Semua" ? TRANSACTIONS : TRANSACTIONS.filter((item) => item.status === filter);
  return <StaffListView page={{ label: "Transaksi Polis", subtitle: "Monitoring status penawaran, pembayaran, penerbitan polis, dan transaksi terkait." }} items={rows} filters={filters} activeFilter={filter} onFilterChange={setFilter} />;
}
