import React from "react";
import { Building2, Car, ChevronDown, Shield } from "lucide-react";

import { PRODUCTS } from "../menuData.js";
import { cls, ProductCategoryIcon } from "../menuShared.jsx";

function AddPartnerProductCard({ product, tag }) {
  return (
    <button type="button" className="production-product-card block" aria-label={product.title}>
      <img src={product.image} alt="" width="640" height="720" loading="lazy" decoding="async" className="production-product-card__image" />
      <span className="production-product-card__shade" />
      <span className="production-product-card__tag"><ProductCategoryIcon category={product.category} /><span>{tag || product.category}</span></span>
      <span className="production-product-card__title">{product.title}</span>
    </button>
  );
}

function AddPartnerProductSection({ icon, title, subtitle, products, tag }) {
  const Icon = icon;
  return (
    <section className="production-product-section">
      <div className="production-product-section__header">
        <div className="production-product-section__icon" aria-hidden="true"><Icon size={35} strokeWidth={2.25} /></div>
        <div className="production-product-section__copy"><h2>{title}</h2><p>{subtitle}</p></div>
        <ChevronDown className="production-product-section__chevron" aria-hidden="true" />
      </div>
      <div className={cls("production-product-grid", products.length === 3 && "is-three-column")}>
        {products.map((product) => <AddPartnerProductCard key={product.title} product={product} tag={tag} />)}
      </div>
    </section>
  );
}

export default function AddPartnerMenu() {
  const personalProducts = ["Life Guard", "Trip Guard", "Edu Protect", "Travel Safe"].map((title) => PRODUCTS.find((product) => product.title === title)).filter(Boolean);
  const propertyProducts = PRODUCTS.filter((product) => product.category === "Harta Benda");
  const vehicleProducts = PRODUCTS.filter((product) => product.category === "Kendaraan");
  return (
    <div className="space-y-6">
      <h1 className="text-center text-[17px] font-black leading-6 text-[#041E42] md:text-[20px]">Pilihan Produk Asuransi Jasindo</h1>
      <AddPartnerProductSection icon={Shield} title="Asuransi Kecelakaan Diri" subtitle="Perlindungan biaya pengobatan akibat kecelakaan" products={personalProducts} tag="Kecelakaan Diri" />
      <AddPartnerProductSection icon={Building2} title="Asuransi Harta Benda" subtitle="Perlindungan bangunan dan isi properti dengan simulasi premi dan penawaran digital." products={propertyProducts} tag="Harta Benda" />
      <AddPartnerProductSection icon={Car} title="Asuransi Kendaraan" subtitle="Perlindungan motor dan mobil dengan simulasi premi dan penawaran digital." products={vehicleProducts} tag="Kendaraan Bermotor" />
    </div>
  );
}
