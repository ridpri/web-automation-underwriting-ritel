import React, { useState } from "react";
import { Car, Copy, Download, Grid2X2, Home, ShoppingCart, User } from "lucide-react";

import { PRODUCTS, productBaseUrl } from "../menuData.js";
import { cls, ProductCategoryIcon, SectionBox, ToolbarSearch, WorkPanel } from "../menuShared.jsx";

const STAFF_TRACKING_TOKEN = "46xs3";
const QR_LOGO_SRC = "/production-assets/Jasindo_Positive-2.adb9525c.png";

function productSlug(product) {
  return product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function productTrackingUrl(product) {
  return `${productBaseUrl(product)}/${STAFF_TRACKING_TOKEN}`;
}

function qrImageUrl(productUrl) {
  return `https://quickchart.io/qr?text=${encodeURIComponent(productUrl)}&size=640&margin=2&format=png&ecLevel=H`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawRoundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

async function createStyledQrBlob(productUrl) {
  const response = await fetch(qrImageUrl(productUrl));
  const qrObjectUrl = URL.createObjectURL(await response.blob());

  try {
    const [qrImage, logoImage] = await Promise.all([loadImage(qrObjectUrl), loadImage(QR_LOGO_SRC)]);
    const size = 720;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = "#F8FAFC";
    ctx.fillRect(0, 0, size, size);
    ctx.save();
    ctx.shadowColor = "rgba(15, 23, 42, 0.24)";
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = "#FFFFFF";
    drawRoundRect(ctx, 20, 20, 680, 680, 34);
    ctx.fill();
    ctx.restore();

    ctx.drawImage(qrImage, 78, 78, 564, 564);

    const gradient = ctx.createLinearGradient(48, 48, 672, 48);
    gradient.addColorStop(0, "#0072CE");
    gradient.addColorStop(1, "#F39200");
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 4;
    drawRoundRect(ctx, 48, 48, 624, 624, 22);
    ctx.stroke();

    const logoBadgeSize = 148;
    const logoBadgeX = (size - logoBadgeSize) / 2;
    const logoBadgeY = (size - logoBadgeSize) / 2;
    ctx.fillStyle = "#FFFFFF";
    drawRoundRect(ctx, logoBadgeX, logoBadgeY, logoBadgeSize, logoBadgeSize, logoBadgeSize / 2);
    ctx.fill();
    ctx.drawImage(logoImage, 0, 0, 360, 370, 311, 310, 100, 102);

    return await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("QR export failed"))), "image/png");
    });
  } finally {
    URL.revokeObjectURL(qrObjectUrl);
  }
}

function buildWhatsappText(product, linkProduk) {
  const namaStaff = "Taqwim";

  return `Halo Bapak/Ibu,

Saya ${namaStaff} dari Asuransi Jasindo.

Berikut tautan produk ${product.title}:

${linkProduk}

Bapak/Ibu dapat membuka tautan tersebut untuk melihat informasi produk dan melakukan simulasi premi secara mandiri.

Apabila membutuhkan bantuan, silakan hubungi saya kembali melalui WhatsApp ini.

Terima kasih.
${namaStaff}
Asuransi Jasindo`;
}

function WhatsAppLogo({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="currentColor">
      <path d="M16.02 3.2c-7.03 0-12.75 5.7-12.75 12.72 0 2.25.59 4.45 1.72 6.38L3.16 29l6.85-1.8a12.7 12.7 0 0 0 6 1.52h.01c7.03 0 12.75-5.7 12.75-12.73S23.05 3.2 16.02 3.2Zm0 23.36h-.01c-1.9 0-3.76-.51-5.39-1.47l-.39-.23-4.06 1.07 1.08-3.96-.26-.41a10.56 10.56 0 0 1-1.62-5.64c0-5.84 4.77-10.59 10.65-10.59 2.84 0 5.52 1.1 7.53 3.1a10.51 10.51 0 0 1 3.12 7.5c0 5.83-4.78 10.58-10.65 10.58Zm5.83-7.92c-.32-.16-1.9-.93-2.19-1.04-.3-.11-.51-.16-.73.16-.21.32-.83 1.04-1.02 1.25-.19.21-.38.24-.7.08-.32-.16-1.36-.5-2.6-1.6a9.8 9.8 0 0 1-1.8-2.24c-.19-.32-.02-.49.14-.65.15-.14.32-.38.48-.57.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.57-.08-.16-.73-1.75-1-2.4-.26-.63-.53-.54-.73-.55h-.62c-.21 0-.56.08-.85.4-.3.32-1.12 1.1-1.12 2.67 0 1.58 1.15 3.1 1.31 3.31.16.21 2.27 3.46 5.5 4.85.77.33 1.37.53 1.84.68.77.24 1.47.21 2.02.13.62-.09 1.9-.77 2.17-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}

function OfferProductRow({ product }) {
  const [copyLabel, setCopyLabel] = useState("Salin Link");
  const productUrl = productBaseUrl(product);
  const trackedProductUrl = productTrackingUrl(product);
  const whatsappText = buildWhatsappText(product, trackedProductUrl);
  const secondaryButtonClass = "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#D9E1EA] bg-white px-2 text-center text-[11px] font-bold leading-4 text-[#004B78] hover:bg-[#EEF5FA]";

  async function copyLink() {
    try {
      await navigator.clipboard?.writeText(trackedProductUrl);
      setCopyLabel("Tersalin");
    } catch {
      setCopyLabel("Gagal salin");
    }
    window.setTimeout(() => setCopyLabel("Salin Link"), 1400);
  }

  async function downloadQr() {
    const fileName = `qr-${productSlug(product)}.png`;
    try {
      const blob = await createStyledQrBlob(trackedProductUrl);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      const link = document.createElement("a");
      link.href = qrImageUrl(trackedProductUrl);
      link.download = fileName;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  }

  return (
    <div className="grid gap-3 rounded-xl border border-[#D9E1EA] bg-white p-3 transition hover:border-[#004B78]/50 hover:bg-[#F8FAFC] md:grid-cols-[150px_minmax(0,1fr)_320px] md:items-center">
      <img src={product.image} alt={product.title} className="h-[120px] w-full rounded-lg object-cover md:h-[96px]" loading="lazy" decoding="async" />
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF5FA] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#004B78]">
          <ProductCategoryIcon category={product.category} />
          {product.category}
        </div>
        <div className="mt-2 text-[14px] font-bold leading-5 text-[#041E42] md:text-[15px]">{product.title}</div>
        <div className="mt-1 text-[12px] leading-5 text-[#5F7A99]">{product.desc}</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <a href={productUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center justify-center rounded-lg bg-[#F2A62A] px-2 text-center text-[11px] font-bold leading-4 text-white hover:bg-[#DF9620]">Buat Penawaran</a>
        <button type="button" onClick={copyLink} className={secondaryButtonClass}>
          <Copy className="h-3.5 w-3.5" />
          {copyLabel}
        </button>
        <a href={`https://web.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`} target="_blank" rel="noopener noreferrer" className={secondaryButtonClass}>
          <WhatsAppLogo className="h-4 w-4" />
          WhatsApp
        </a>
        <button type="button" onClick={downloadQr} className={secondaryButtonClass}>
          <Download className="h-3.5 w-3.5" />
          Unduh QR
        </button>
      </div>
    </div>
  );
}

export default function OfferMenu() {
  const [category, setCategory] = useState("Semua");
  const [query, setQuery] = useState("");
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
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => <button key={item.label} type="button" onClick={() => setCategory(item.label)} className={cls("inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[12px] font-bold", category === item.label ? "border-[#004B78] bg-[#004B78] text-white" : "border-[#D9E1EA] bg-white text-[#5F7A99] hover:bg-[#F6F8FA]")}><item.icon className="h-3.5 w-3.5" />{item.label}</button>)}
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {filteredProducts.map((product) => <OfferProductRow key={product.title} product={product} />)}
          </div>
        </SectionBox>
      </WorkPanel>
    </div>
  );
}
