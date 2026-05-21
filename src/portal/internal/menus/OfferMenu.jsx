import React, { useState } from "react";
import { Car, Grid2X2, Home, List, ShoppingCart, User } from "lucide-react";

import { PRODUCTS } from "../menuData.js";
import { cls, ProductCard, ProductListItem, SectionBox, ToolbarSearch, WorkPanel } from "../menuShared.jsx";

export default function OfferMenu() {
  const [category, setCategory] = useState("Semua");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState("card");
  const categories = [
    { label: "Semua", icon: Grid2X2 },
    { label: "Kecelakaan Diri", icon: User },
    { label: "Harta Benda", icon: Home },
    { label: "Kendaraan", icon: Car },
  ];
  const filteredProducts = PRODUCTS.filter((product) => {
    const keyword = query.toLowerCase();
    return (category === "Semua" || product.category === category) && (product.title.toLowerCase().includes(keyword) || product.desc.toLowerCase().includes(keyword));
  });

  return (
    <div className="space-y-3">
      <WorkPanel>
        <SectionBox title="Pilih Produk Asuransi" icon={ShoppingCart}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-[12px] text-[#5F7A99]">Gunakan pencarian atau filter kategori.</div>
            <ToolbarSearch value={query} onChange={setQuery} />
          </div>
          <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => <button key={item.label} type="button" onClick={() => setCategory(item.label)} className={cls("inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[12px] font-bold", category === item.label ? "border-[#004B78] bg-[#004B78] text-white" : "border-[#D9E1EA] bg-white text-[#5F7A99] hover:bg-[#F6F8FA]")}><item.icon className="h-3.5 w-3.5" />{item.label}</button>)}
            </div>
            <div className="inline-flex w-fit rounded-lg border border-[#D9E1EA] bg-white p-1">
              {[{ key: "card", label: "Card", icon: Grid2X2 }, { key: "list", label: "List", icon: List }].map((item) => <button key={item.key} type="button" onClick={() => setViewMode(item.key)} className={cls("grid h-8 w-9 place-items-center rounded-md transition", viewMode === item.key ? "bg-[#004B78] text-white" : "text-[#004B78] hover:bg-[#EEF5FA]")} aria-label={`Tampilan ${item.label}`}><item.icon className="h-4 w-4" /></button>)}
            </div>
          </div>
          {viewMode === "card" ? <div className="mt-4 grid grid-cols-[repeat(auto-fill,200px)] justify-start gap-3">{filteredProducts.map((product) => <ProductCard key={product.title} product={product} />)}</div> : <div className="mt-4 space-y-3">{filteredProducts.map((product) => <ProductListItem key={product.title} product={product} />)}</div>}
        </SectionBox>
      </WorkPanel>
    </div>
  );
}
