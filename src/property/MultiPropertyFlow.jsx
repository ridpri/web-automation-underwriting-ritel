import React, { useMemo } from "react";
import {
  AlertTriangle,
  Building2,
  Camera,
  CheckCircle2,
  ChevronDown,
  Flame,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Shield,
  Trash2,
  User,
  Wallet,
} from "lucide-react";

import {
  calculateMultiPropertyPolicy,
  createMultiPropertyDraft,
  deriveConstructionClass,
  FLAMMABLE_MATERIAL_OPTIONS,
  getMultiPropertyStepOnePendingItems,
  getMultiPropertyStepTwoPendingItems,
  isOfficeFloorCountRequiredForProperty,
  onlyDigits,
  ROOF_MATERIAL_OPTIONS,
  shouldShowEarthquakeFloorInputForProperty,
  STRUCTURE_MATERIAL_OPTIONS,
  WALL_MATERIAL_OPTIONS,
} from "./multiPropertyDomain.js";

const FIRE_PROTECTION_ITEMS = ["APAR", "Hydrant", "Sprinkler"];
const FIRE_PROTECTION_CHOICES = ["Tidak Ada", "Ada"];
const CLAIM_HISTORY_OPTIONS = ["Tidak Ada", "Ada 1 Klaim", "Ada Lebih dari 1 Klaim"];
const STOCK_TYPE_OPTIONS = [
  "Sembako",
  "Minuman Kemasan",
  "Bahan Bangunan",
  "Elektronik",
  "Pakaian / Tekstil",
  "Kertas / Buku",
  "Furniture / Kayu",
  "Plastik / Karet",
];
const PAYMENT_OPTIONS = ["BRI", "Mandiri", "BCA", "BNI", "QRIS", "Credit Card"];
const UPLOAD_SLOTS = [
  { key: "frontView", label: "Foto Tampak Depan" },
  { key: "sideRightView", label: "Foto Samping Kanan" },
  { key: "sideLeftView", label: "Foto Samping Kiri" },
];
const DEFAULT_SELECTED_GUARANTEES = {
  riot: false,
  flood: false,
  tsfwd: false,
  earthquake: false,
};
const DEFAULT_EXPANDED_GUARANTEES = {
  riot: false,
  flood: false,
  tsfwd: false,
  earthquake: false,
};

function cls(...args) {
  return args.filter(Boolean).join(" ");
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID").format(Number(value || 0));
}

function isDigitsOnly(value) {
  const source = String(value || "").trim();
  if (!source) return false;
  return onlyDigits(source) === source;
}

function FieldLabel({ label, required, helpText }) {
  return (
    <div className="mb-1.5 flex items-center gap-2">
      <label className="text-[13px] font-semibold text-slate-800">
        {label}
        {required ? <span className="text-[#E66A1E]"> *</span> : null}
      </label>
      {helpText ? <span className="text-[11px] font-medium text-slate-500">{helpText}</span> : null}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, icon, type = "text", readOnly = false, disabled = false }) {
  return (
    <div className="relative">
      {icon ? <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div> : null}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        className={cls(
          "h-[44px] w-full rounded-[10px] border border-[#D5DDE6] bg-white px-3.5 text-[14px] text-slate-800 outline-none transition placeholder:text-slate-500",
          "focus:border-[#0A4D82] focus:ring-4 focus:ring-[#0A4D82]/10",
          (readOnly || disabled) && "cursor-not-allowed bg-slate-50 text-slate-500",
          icon && "pl-10"
        )}
      />
    </div>
  );
}

function CurrencyInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">Rp</span>
      <input
        value={value}
        onChange={(event) => onChange(formatRupiah(onlyDigits(event.target.value)))}
        inputMode="numeric"
        placeholder={placeholder}
        className="h-[44px] w-full rounded-[10px] border border-[#D5DDE6] bg-white pl-10 pr-3.5 text-[14px] text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-[#0A4D82] focus:ring-4 focus:ring-[#0A4D82]/10"
      />
    </div>
  );
}

function SelectInput({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cls(
          "h-[44px] w-full appearance-none rounded-[10px] border border-[#D5DDE6] bg-white px-3.5 pr-10 text-[14px] outline-none transition focus:border-[#0A4D82] focus:ring-4 focus:ring-[#0A4D82]/10",
          value ? "text-slate-800" : "text-slate-500"
        )}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function SectionCard({ title, subtitle, children, action, headerAlign = "left", className = "", compactHeader = false, heroHeader = false }) {
  return (
    <section
      className={cls(
        compactHeader
          ? "rounded-2xl border border-[#D8E1EA] bg-white px-4 py-3.5 md:px-5"
          : "rounded-2xl border border-[#D8E1EA] bg-white p-4 shadow-sm md:p-5",
        className
      )}
    >
      <div className={cls("flex items-start gap-4", action ? "justify-between" : headerAlign === "center" ? "justify-center" : "justify-start")}>
        <div className={cls(headerAlign === "center" ? "text-center" : "", heroHeader ? "w-full" : "")}>
          <div className={cls(heroHeader ? "text-[26px] font-bold tracking-tight md:text-[30px]" : compactHeader ? "text-[15px] font-semibold" : "text-[18px] font-bold", "text-slate-900")}>{title}</div>
          {subtitle ? (
            <div className={cls(heroHeader ? "mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-[15px]" : compactHeader ? "mt-1 text-[13px] leading-5" : "mt-1 text-sm text-slate-500", !heroHeader && !compactHeader ? "text-slate-500" : "")}>
              {subtitle}
            </div>
          ) : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SummaryRow({ label, value, strong = false, inverted = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <div className={inverted ? "text-white/70" : "text-slate-500"}>{label}</div>
      <div className={cls("max-w-[58%] break-words text-right", inverted ? "text-white" : "text-slate-900", strong && "font-semibold")}>{value || "-"}</div>
    </div>
  );
}

function PendingItems({ items }) {
  if (!items.length) return null;
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
      <div className="font-semibold">Yang masih perlu dilengkapi</div>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoticePanel({ text }) {
  if (!text) return null;
  return <div className="rounded-2xl border border-[#CFE0F0] bg-[#F8FBFE] px-4 py-3 text-sm text-[#0A4D82]">{text}</div>;
}

function ObjectRowsEditor({ property, onUpdateObjectRow, onAddObjectRow, onRemoveObjectRow, objectTypeOptions }) {
  return (
    <div className="rounded-xl border border-[#D5DDE6] bg-[#FAFBFC] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[15px] font-bold text-slate-900">Rincian Objek</div>
        <button type="button" onClick={onAddObjectRow} className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <Plus className="h-4 w-4" />
          Tambah Objek
        </button>
      </div>
      <div className="mt-3 space-y-2.5">
        {(property.objectRows || []).map((row) => (
          <div key={row.id} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="grid gap-2.5 lg:grid-cols-[170px_minmax(0,1fr)_minmax(0,1.2fr)_40px] lg:items-center">
              <SelectInput value={row.type} onChange={(value) => onUpdateObjectRow(row.id, { type: value })} options={objectTypeOptions} placeholder="Jenis objek" />
              <CurrencyInput value={row.amount} onChange={(value) => onUpdateObjectRow(row.id, { amount: value })} placeholder="Harga pertanggungan" />
              <TextInput value={row.note} onChange={(value) => onUpdateObjectRow(row.id, { note: value })} placeholder="Keterangan objek" />
              <button type="button" onClick={() => onRemoveObjectRow(row.id)} className="inline-flex h-[44px] items-center justify-center rounded-[10px] border border-slate-300 text-slate-500 hover:bg-slate-50" title="Hapus objek">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PolicyGuaranteeRows({ selectedGuarantees, expandedRows, policyTotals, extensionOptions, onToggleGuarantee, onToggleExpand, showPricing }) {
  return (
    <div className="space-y-2.5">
      {extensionOptions.map((item) => {
        const checked = Boolean(selectedGuarantees?.[item.key]);
        const expanded = Boolean(expandedRows?.[item.key]);
        const Icon = item.icon || Shield;
        const premium = Math.round(policyTotals.totalValue * item.rate);
        return (
          <div key={item.key} className="rounded-xl border border-[#C9D5E3] bg-[#F8FBFE]">
            <div className="flex items-center gap-3 px-3.5 py-3">
              <input type="checkbox" checked={checked} onChange={() => onToggleGuarantee(item.key)} className="h-5 w-5 rounded border-slate-300 text-[#0A4D82]" />
              <button type="button" onClick={() => onToggleExpand(item.key)} className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[#0A4D82]">
                    <Icon className="h-4 w-4 shrink-0" />
                    <div className="truncate text-[15px] font-semibold">{item.title}</div>
                  </div>
                  <div className="mt-0.5 text-[12px] text-slate-500">Premi: {showPricing ? `Rp ${formatRupiah(premium)}` : "-"}</div>
                </div>
                <ChevronDown className={cls("h-4 w-4 shrink-0 text-slate-500 transition", expanded && "rotate-180")} />
              </button>
            </div>
            {expanded ? (
              <div className="border-t border-[#D6E0EA] px-3.5 py-3">
                <div className="text-[13px] leading-6 text-slate-700">{item.detail}</div>
                <div className="mt-2 text-[12px] leading-6 text-slate-600">
                  <span className="font-semibold text-slate-700">Risiko sendiri saat klaim: </span>
                  {item.key === "earthquake" ? `2,5% dari Rp ${formatRupiah(policyTotals.totalValue)}` : item.deductible}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function PropertyQuoteCard({
  property,
  quote,
  index,
  canRemove,
  isInternalMode,
  constructionOptions,
  constructionGuide,
  occupancyOptions,
  objectTypeOptions,
  selectedGuarantees,
  productConfig,
  showPricing,
  derivePropertyType,
  onUpdateProperty,
  onRemoveProperty,
  onUpdateObjectRow,
  onAddObjectRow,
  onRemoveObjectRow,
}) {
  const PrimaryIcon = productConfig.key === "property-all-risk" ? Shield : Flame;
  const detailsOpen = property.detailsOpen !== false;
  const propertyLabel = property.title || `Properti ${index + 1}`;
  const closedSummary = [property.locationSearch, property.occupancy, quote.totalValue > 0 ? `Rp ${formatRupiah(quote.totalValue)}` : ""].filter(Boolean).join(" - ");
  const constructionInfo = (constructionGuide || []).find((item) => item.title === property.constructionClass);
  const showOfficeFloorField = isOfficeFloorCountRequiredForProperty(property);
  const showEarthquakeFloorField = shouldShowEarthquakeFloorInputForProperty(property, selectedGuarantees);
  const updateConstructionMaterial = (key, value) => {
    const nextProperty = { ...property, [key]: value };
    onUpdateProperty({ [key]: value, constructionClass: deriveConstructionClass(nextProperty) });
  };
  return (
    <div data-property-accordion className="rounded-xl border border-[#C9D5E3] bg-[#F8FBFE]">
      <div data-property-accordion-header className="flex items-center gap-3 px-3.5 py-3">
        <button type="button" onClick={() => onUpdateProperty({ detailsOpen: !detailsOpen }, false)} className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#0A4D82] focus-visible:ring-offset-2">
          <div className="flex min-w-0 items-center gap-2 text-[#0A4D82]">
            <Building2 className="h-4 w-4 shrink-0" />
            <div className="min-w-0">
              <div data-property-title className="truncate text-[15px] font-semibold">{propertyLabel}</div>
              {!detailsOpen && closedSummary ? <div className="mt-0.5 truncate text-[12px] text-slate-500">{closedSummary}</div> : null}
            </div>
          </div>
          <ChevronDown className={cls("h-4 w-4 shrink-0 text-slate-500 transition", detailsOpen && "rotate-180")} />
        </button>
        {canRemove ? (
          <button type="button" onClick={onRemoveProperty} aria-label={`Hapus ${propertyLabel}`} title={`Hapus ${propertyLabel}`} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-slate-300 bg-white text-slate-500 hover:bg-slate-50">
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {detailsOpen ? (
        <div className="border-t border-[#D6E0EA] bg-white/70 px-3.5 py-4 md:px-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel label="Penggunaan Properti yang Diasuransikan" required />
              <SelectInput
                value={property.occupancy || ""}
                onChange={(value) => onUpdateProperty({ occupancy: value, propertyType: derivePropertyType(value) })}
                options={occupancyOptions}
                placeholder="Pilih penggunaan properti"
              />
            </div>
            {isInternalMode ? (
              <div>
                <FieldLabel label="Kelas Konstruksi" required />
                <SelectInput value={property.constructionClass || ""} onChange={(value) => onUpdateProperty({ constructionClass: value })} options={constructionOptions} placeholder="Pilih kelas konstruksi" />
              </div>
            ) : (
              <div className="md:col-span-2">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <FieldLabel label="Dinding Utama" required />
                    <SelectInput value={property.wallMaterial || ""} onChange={(value) => updateConstructionMaterial("wallMaterial", value)} options={WALL_MATERIAL_OPTIONS} placeholder="Pilih material dinding" />
                  </div>
                  <div>
                    <FieldLabel label="Struktur / Lantai Utama" required />
                    <SelectInput value={property.structureMaterial || ""} onChange={(value) => updateConstructionMaterial("structureMaterial", value)} options={STRUCTURE_MATERIAL_OPTIONS} placeholder="Pilih material struktur" />
                  </div>
                  <div>
                    <FieldLabel label="Atap Bangunan" required />
                    <SelectInput value={property.roofMaterial || ""} onChange={(value) => updateConstructionMaterial("roofMaterial", value)} options={ROOF_MATERIAL_OPTIONS} placeholder="Pilih material atap" />
                  </div>
                  <div>
                    <FieldLabel label="Bagian mudah terbakar lainnya?" required />
                    <SelectInput value={property.flammableMaterial || ""} onChange={(value) => updateConstructionMaterial("flammableMaterial", value)} options={FLAMMABLE_MATERIAL_OPTIONS} placeholder="Pilih kondisi material" />
                  </div>
                </div>
                {constructionInfo ? <div className="mt-3 rounded-[12px] border border-[#D5DDE6] bg-[#F8FBFE] px-3 py-2.5 text-[12px] leading-5 text-slate-600"><span className="font-semibold text-slate-900">Hasil panduan: {constructionInfo.title}.</span> {constructionInfo.desc}</div> : null}
              </div>
            )}
            {showOfficeFloorField ? (
              <div>
                <FieldLabel label="Jumlah Lantai" required />
                <TextInput value={property.floorCount || ""} onChange={(value) => onUpdateProperty({ floorCount: onlyDigits(value) })} placeholder="Masukkan jumlah lantai" icon={<Building2 className="h-4 w-4" />} />
              </div>
            ) : null}
            <div className="md:col-span-2">
              <FieldLabel label="Alamat / Lokasi Objek" required />
              <TextInput value={property.locationSearch || ""} onChange={(value) => onUpdateProperty({ locationSearch: value })} placeholder="Ketik alamat, nama jalan, atau nama gedung" icon={<Search className="h-4 w-4" />} />
              <div className="mt-2 flex flex-wrap gap-2.5">
                <button type="button" onClick={() => onUpdateProperty({ locationSearch: `Lokasi GPS tersimulasi - ${propertyLabel}` })} className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <MapPin className="h-4 w-4" />
                  Ambil Lokasi Sekarang
                </button>
                <button type="button" onClick={() => onUpdateProperty({ locationSearch: `Pin peta tersimulasi - ${propertyLabel}` })} className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <MapPin className="h-4 w-4" />
                  Pilih di Peta
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <ObjectRowsEditor property={property} objectTypeOptions={objectTypeOptions} onUpdateObjectRow={onUpdateObjectRow} onAddObjectRow={onAddObjectRow} onRemoveObjectRow={onRemoveObjectRow} />
          </div>

          <div className="mt-4 rounded-xl border border-[#C9D5E3] bg-[#F8FBFE]">
            <div className="flex items-center gap-3 px-3.5 py-3">
              <div className="flex h-5 w-5 items-center justify-center rounded border border-[#0A4D82] bg-[#0A4D82]/10 text-[#0A4D82]">
                <PrimaryIcon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-semibold text-[#0A4D82]">{productConfig.primaryCoverageTitle}</div>
                <div className="mt-0.5 text-[12px] text-slate-500">Premi: {showPricing ? `Rp ${formatRupiah(quote.basePremium)}` : "-"}</div>
              </div>
            </div>
          </div>

          {showEarthquakeFloorField ? (
            <div className="mt-4 max-w-sm rounded-xl border border-amber-200 bg-amber-50 p-3">
              <FieldLabel label="Jumlah lantai bangunan yang diasuransikan" required helpText="Diisi karena perluasan Gempa Bumi dipilih untuk polis ini." />
              <TextInput value={property.floorCount || ""} onChange={(value) => onUpdateProperty({ floorCount: onlyDigits(value) })} placeholder="Masukkan jumlah lantai" icon={<Building2 className="h-4 w-4" />} />
            </div>
          ) : null}

          <div className="mt-4 rounded-[10px] bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-1.5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>Total Nilai Pertanggungan</span>
              <span className="break-words text-left text-[18px] font-bold text-[#E8A436] sm:text-right">Rp {formatRupiah(quote.totalValue)}</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function UploadButton({ property, slot, onCapture }) {
  const done = Boolean(property.uploads?.[slot.key]);
  return (
    <button type="button" onClick={onCapture} className={cls("rounded-xl border px-4 py-4 text-left", done ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white hover:bg-slate-50")}>
      <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
        <Camera className="h-4 w-4 text-[#0A4D82]" />
        {slot.label}
      </div>
      <div className={cls("mt-1 text-xs", done ? "text-emerald-700" : "text-slate-500")}>{done ? "Foto sudah tersedia" : "Ambil foto simulasi"}</div>
    </button>
  );
}

function PropertyUnderwritingCard({ property, index, customerType, onUpdateProperty }) {
  const uwForm = property.uwForm || {};
  const hasStockObject = (property.objectRows || []).some((row) => row.type === "Stok");
  const updateUw = (patch) => onUpdateProperty({ uwForm: { ...uwForm, ...patch } }, false);
  const updateUploads = (patch) => onUpdateProperty({ uploads: { ...property.uploads, ...patch } }, false);
  const fireProtectionItems = Array.isArray(uwForm.fireProtectionItems) ? uwForm.fireProtectionItems : [];
  const detailsOpen = property.uwDetailsOpen !== false;
  const propertyLabel = property.title || `Properti ${index + 1}`;
  const uploadCount = UPLOAD_SLOTS.filter((slot) => property.uploads?.[slot.key]).length;
  const closedSummary = [property.locationSearch || "Alamat properti belum diisi", uwForm.claimHistory ? `Klaim: ${uwForm.claimHistory}` : "", `${uploadCount}/${UPLOAD_SLOTS.length} foto`].filter(Boolean).join(" - ");
  return (
    <div data-property-underwriting-accordion className="rounded-xl border border-[#C9D5E3] bg-[#F8FBFE]">
      <div data-property-underwriting-header className="flex items-center gap-3 px-3.5 py-3">
        <button type="button" onClick={() => onUpdateProperty({ uwDetailsOpen: !detailsOpen }, false)} className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#0A4D82] focus-visible:ring-offset-2">
          <div className="flex min-w-0 items-center gap-2 text-[#0A4D82]">
            <Building2 className="h-4 w-4 shrink-0" />
            <div className="min-w-0">
              <div data-property-underwriting-title className="truncate text-[15px] font-semibold">{propertyLabel}</div>
              {!detailsOpen ? <div className="mt-0.5 truncate text-[12px] text-slate-500">{closedSummary}</div> : null}
            </div>
          </div>
          <ChevronDown className={cls("h-4 w-4 shrink-0 text-slate-500 transition", detailsOpen && "rotate-180")} />
        </button>
      </div>

      {detailsOpen ? (
        <div className="border-t border-[#D6E0EA] bg-white/70 px-3.5 py-4 md:px-4">
          <div className="grid gap-4 md:grid-cols-2">
            {customerType === "Badan Usaha" ? (
              <div>
                <FieldLabel label="Kontak di Lokasi" required />
                <TextInput value={uwForm.picName || ""} onChange={(value) => updateUw({ picName: value })} placeholder="Nama kontak yang bisa dihubungi" icon={<User className="h-4 w-4" />} />
              </div>
            ) : null}
            <div>
              <FieldLabel label="Proteksi Kebakaran" required />
              <SelectInput value={uwForm.fireProtectionChoice || ""} onChange={(value) => updateUw({ fireProtectionChoice: value, fireProtectionItems: value === "Tidak Ada" ? [] : fireProtectionItems })} options={FIRE_PROTECTION_CHOICES} placeholder="Pilih proteksi kebakaran" />
            </div>
            {uwForm.fireProtectionChoice === "Ada" ? (
              <div>
                <FieldLabel label="Jenis Proteksi" required />
                <div className="flex min-h-[46px] flex-wrap items-center gap-2 rounded-xl border border-[#D5DDE6] bg-white px-3 py-2">
                  {FIRE_PROTECTION_ITEMS.map((item) => {
                    const checked = fireProtectionItems.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => updateUw({ fireProtectionItems: checked ? fireProtectionItems.filter((value) => value !== item) : fireProtectionItems.concat(item) })}
                        className={cls("rounded-full border px-3 py-1.5 text-xs font-semibold", checked ? "border-[#0A4D82] bg-[#0A4D82] text-white" : "border-slate-200 bg-white text-slate-600")}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
            <div>
              <FieldLabel label="Riwayat Klaim 3 Tahun Terakhir" required />
              <SelectInput value={uwForm.claimHistory || ""} onChange={(value) => updateUw({ claimHistory: value })} options={CLAIM_HISTORY_OPTIONS} placeholder="Pilih riwayat klaim" />
            </div>
            {hasStockObject ? (
              <div>
                <FieldLabel label="Jenis Stok" required />
                <SelectInput value={uwForm.stockType || ""} onChange={(value) => updateUw({ stockType: value })} options={STOCK_TYPE_OPTIONS} placeholder="Pilih jenis stok" />
              </div>
            ) : null}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {UPLOAD_SLOTS.map((slot) => (
              <UploadButton key={slot.key} property={property} slot={slot} onCapture={() => updateUploads({ [slot.key]: `data:demo/${property.id}-${slot.key}` })} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PolicySummaryPanel({ policyTotals, showPricing }) {
  return (
    <aside className="h-fit rounded-2xl bg-[#0A4D82] p-5 text-white shadow-lg lg:sticky lg:top-24">
      <div className="flex items-center gap-2 text-[18px] font-bold">
        <Wallet className="h-5 w-5" />
        Ringkasan Polis
      </div>
      <div className="mt-4 border-t border-white/15 pt-3">
        <SummaryRow label="Jumlah Properti" value={String(policyTotals.propertyQuotes.length)} inverted />
        <SummaryRow label="Total Nilai Pertanggungan" value={`Rp ${formatRupiah(policyTotals.totalValue)}`} inverted />
      </div>
      <div className="mt-3 border-t border-white/15 pt-3">
        <SummaryRow label="Premi Dasar" value={showPricing ? `Rp ${formatRupiah(policyTotals.basePremium)}` : "-"} inverted />
        <SummaryRow label="Premi Perluasan" value={showPricing ? `Rp ${formatRupiah(policyTotals.extensionPremium)}` : "-"} inverted />
        <SummaryRow label="Biaya Meterai" value={showPricing ? `Rp ${formatRupiah(policyTotals.stampDuty)}` : "-"} inverted />
      </div>
      <div className="mt-4 rounded-xl bg-white/10 p-4">
        <div className="text-sm text-white/75">Total Pembayaran</div>
        <div className="mt-2 text-right text-[28px] font-bold leading-tight">Rp {showPricing ? formatRupiah(policyTotals.totalPremium) : "-"}</div>
      </div>
    </aside>
  );
}

export default function MultiPropertyFlow({
  step,
  setStep,
  entryMode,
  productConfig,
  extensionOptions,
  occupancyOptions,
  constructionOptions,
  constructionGuide = [],
  objectTypeOptions,
  customerTypes,
  policyForm,
  setPolicyForm,
  properties,
  setProperties,
  derivePropertyType,
  customerOptions = [],
  flowModeAction = null,
}) {
  const isInternalMode = entryMode === "internal";
  const policySelectedGuarantees = useMemo(() => ({ ...DEFAULT_SELECTED_GUARANTEES, ...(policyForm.selectedGuarantees || {}) }), [policyForm.selectedGuarantees]);
  const policyExpandedGuarantees = useMemo(() => ({ ...DEFAULT_EXPANDED_GUARANTEES, ...(policyForm.expandedGuarantees || {}) }), [policyForm.expandedGuarantees]);
  const policyTotals = useMemo(() => calculateMultiPropertyPolicy(properties, extensionOptions, policySelectedGuarantees), [extensionOptions, policySelectedGuarantees, properties]);
  const stepOnePendingItems = useMemo(
    () =>
      getMultiPropertyStepOnePendingItems({
        identity: policyForm.identity,
        phone: policyForm.phone,
        email: policyForm.email,
        properties,
        selectedGuarantees: policyForm.quoted ? policySelectedGuarantees : DEFAULT_SELECTED_GUARANTEES,
        constructionInputMode: isInternalMode ? "direct" : "guided",
      }),
    [isInternalMode, policyForm.email, policyForm.identity, policyForm.phone, policyForm.quoted, policySelectedGuarantees, properties],
  );
  const stepTwoPendingItems = useMemo(
    () =>
      getMultiPropertyStepTwoPendingItems({
        customerType: policyForm.customerType,
        idNumber: policyForm.idNumber,
        coverageStartDate: policyForm.coverageStartDate,
        properties,
      }),
    [policyForm.coverageStartDate, policyForm.customerType, policyForm.idNumber, properties],
  );
  const showPricing = Boolean(policyForm.quoted || step > 1);
  const canQuote = stepOnePendingItems.length === 0;
  const canAdvanceStepOne = canQuote && policyForm.quoted;
  const canAdvanceStepTwo = stepTwoPendingItems.length === 0;
  const canPay = Boolean(policyForm.consentApproved && policyForm.paymentMethod && !policyForm.paymentStatus);
  const customerKeyword = String(policyForm.identity || "").trim().toLowerCase();
  const customerSuggestions = customerKeyword
    ? customerOptions.filter((item) => item.name.toLowerCase().includes(customerKeyword) || item.cif.toLowerCase().includes(customerKeyword)).slice(0, 5)
    : [];
  const hasSelectedCustomer = Boolean(policyForm.selectedCustomerCif);
  const showCustomerTypeField = Boolean(String(policyForm.identity || "").trim()) && !hasSelectedCustomer && !isDigitsOnly(policyForm.identity);

  const updatePolicy = (patch) => setPolicyForm((prev) => ({ ...prev, ...patch }));
  const togglePolicyGuarantee = (key) => {
    updatePolicy({
      selectedGuarantees: { ...policySelectedGuarantees, [key]: !policySelectedGuarantees[key] },
      paymentStatus: "",
    });
  };
  const togglePolicyGuaranteeExpanded = (key) => {
    updatePolicy({ expandedGuarantees: { ...policyExpandedGuarantees, [key]: !policyExpandedGuarantees[key] } });
  };
  const updateProperty = (propertyId, patch, resetQuote = true) => {
    setProperties((prev) =>
      prev.map((property) => {
        if (property.id === propertyId) return { ...property, ...patch };
        if (patch.detailsOpen) return { ...property, detailsOpen: false };
        if (patch.uwDetailsOpen) return { ...property, uwDetailsOpen: false };
        return property;
      }),
    );
    if (resetQuote) updatePolicy({ quoted: false, paymentStatus: "" });
  };
  const addProperty = () => {
    setProperties((prev) => prev.map((property) => ({ ...property, detailsOpen: false })).concat(createMultiPropertyDraft(prev.length, { detailsOpen: true })));
    updatePolicy({ quoted: false, paymentStatus: "" });
  };
  const removeProperty = (propertyId) => {
    setProperties((prev) => (prev.length === 1 ? prev : prev.filter((property) => property.id !== propertyId).map((property, index) => ({ ...property, title: `Properti ${index + 1}`, detailsOpen: index === 0 ? property.detailsOpen !== false : property.detailsOpen }))));
    updatePolicy({ quoted: false, paymentStatus: "" });
  };
  const updateObjectRow = (propertyId, rowId, patch) => {
    const property = properties.find((item) => item.id === propertyId);
    if (!property) return;
    const objectRows = (property.objectRows || []).map((row) => (row.id === rowId ? { ...row, ...patch } : row));
    updateProperty(propertyId, { objectRows });
  };
  const addObjectRow = (propertyId) => {
    const property = properties.find((item) => item.id === propertyId);
    if (!property) return;
    const rows = property.objectRows || [];
    let nextIndex = rows.length + 1;
    while (rows.some((row) => row.id === `${propertyId}-obj-${nextIndex}`)) nextIndex += 1;
    updateProperty(propertyId, { objectRows: rows.concat({ id: `${propertyId}-obj-${nextIndex}`, type: "", amount: "", note: "" }) });
  };
  const removeObjectRow = (propertyId, rowId) => {
    const property = properties.find((item) => item.id === propertyId);
    if (!property) return;
    const rows = property.objectRows || [];
    updateProperty(propertyId, { objectRows: rows.length === 1 ? rows : rows.filter((row) => row.id !== rowId) });
  };

  if (step === 2) {
    return (
      <div className="mx-auto mt-6 max-w-4xl px-4 md:px-6">
        <div className="space-y-5">
          <SectionCard title="Data Pemegang Polis">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <FieldLabel label={policyForm.customerType === "Badan Usaha" ? "NPWP" : "NIK"} required />
                <TextInput value={policyForm.idNumber || ""} onChange={(value) => updatePolicy({ idNumber: onlyDigits(value) })} placeholder={policyForm.customerType === "Badan Usaha" ? "Masukkan NPWP" : "Masukkan NIK"} icon={<User className="h-4 w-4" />} />
              </div>
              <div>
                <FieldLabel label="Tipe Nasabah" required />
                <SelectInput value={policyForm.customerType || ""} onChange={(value) => updatePolicy({ customerType: value })} options={customerTypes} placeholder="Pilih tipe nasabah" />
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Informasi Properti" subtitle="Lengkapi proteksi, riwayat klaim, dan foto untuk masing-masing properti.">
            <div className="space-y-4">
              <PendingItems items={stepTwoPendingItems} />
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel label="Tanggal Mulai Pertanggungan" required />
                  <TextInput value={policyForm.coverageStartDate || ""} onChange={(value) => updatePolicy({ coverageStartDate: value })} type="date" />
                </div>
              </div>
              {properties.map((property, index) => (
                <PropertyUnderwritingCard key={property.id} property={property} index={index} customerType={policyForm.customerType} onUpdateProperty={(patch, resetQuote) => updateProperty(property.id, patch, resetQuote)} />
              ))}
            </div>
          </SectionCard>
          <NoticePanel text={policyForm.notice} />
          <div className="grid gap-3 md:grid-cols-2">
            <button type="button" onClick={() => setStep(1)} className="flex h-[48px] w-full items-center justify-center rounded-[12px] border border-[#D5DEEA] bg-white px-5 text-sm font-semibold text-[#0A4D82] shadow-sm hover:bg-[#F8FBFE]">
              Kembali ke Simulasi Premi
            </button>
            <button
              type="button"
              disabled={!canAdvanceStepTwo}
              onClick={() => {
                  if (isInternalMode) updatePolicy({ notice: "Penawaran final beberapa properti siap dikirim. Integrasi pengiriman akan mengikuti handoff IT." });
                else setStep(3);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={cls("flex h-[48px] w-full items-center justify-center rounded-[12px] px-5 text-sm font-semibold text-white shadow-sm transition", canAdvanceStepTwo ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}
            >
              {isInternalMode ? "Kirim Penawaran Final" : "Lanjut ke Pembayaran"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3 && !isInternalMode) {
    return (
      <div className="mx-auto mt-6 max-w-[1280px] px-4 md:px-6">
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <SectionCard title="Review Polis Beberapa Properti" subtitle="Periksa ringkasan seluruh properti pertanggungan sebelum pembayaran.">
              <div className="grid gap-4 md:grid-cols-2">
                <SummaryRow label="Pemegang Polis" value={policyForm.identity} strong />
                <SummaryRow label="Total Properti" value={String(properties.length)} strong />
                <SummaryRow label="Total Nilai Pertanggungan" value={`Rp ${formatRupiah(policyTotals.totalValue)}`} strong />
                <SummaryRow label="Total Premi" value={`Rp ${formatRupiah(policyTotals.totalPremium)}`} strong />
              </div>
            </SectionCard>
            <SectionCard title="Daftar Properti Pertanggungan">
              <div className="space-y-3">
                {properties.map((property, index) => {
                  const quote = policyTotals.propertyQuotes[index];
                  return (
                    <div key={property.id} className="rounded-xl border border-[#D8E1EA] bg-[#F8FBFE] px-4 py-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{property.title}</div>
                          <div className="mt-1 text-sm leading-6 text-slate-600">{property.locationSearch || "-"}</div>
                          <div className="mt-1 text-sm text-slate-500">{[property.occupancy, property.constructionClass].filter(Boolean).join(" - ") || "-"}</div>
                        </div>
                        <div className="text-left md:text-right">
                          <div className="text-sm text-slate-500">Nilai Pertanggungan</div>
                          <div className="font-bold text-[#0A4D82]">Rp {formatRupiah(quote.totalValue)}</div>
                          <div className="mt-2 text-sm text-slate-500">Premi Properti</div>
                          <div className="font-bold text-[#0A4D82]">Rp {formatRupiah(quote.totalPremium)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
            <SectionCard title="Lanjutkan Pembayaran">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-start gap-3">
                  <button type="button" onClick={() => updatePolicy({ consentApproved: !policyForm.consentApproved })} className={cls("mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border transition", policyForm.consentApproved ? "border-[#0A4D82] bg-[#0A4D82] text-white" : "border-[#B7C7D8] bg-white text-transparent hover:border-[#0A4D82]")} aria-label="Setujui SPAU elektronik">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="min-w-0 text-sm leading-6 text-slate-700">Saya telah membaca dan menyetujui Syarat dan Ketentuan Persetujuan atas SPAU elektronik untuk beberapa properti pertanggungan ini.</div>
                </div>
              </div>
            </SectionCard>
            <SectionCard title="Pilih Metode Pembayaran">
              <div className="grid gap-3 md:grid-cols-3">
                {PAYMENT_OPTIONS.map((item) => (
                  <button key={item} type="button" onClick={() => updatePolicy({ paymentMethod: item, paymentStatus: "" })} className={cls("rounded-xl border px-4 py-4 text-left text-sm font-bold", policyForm.paymentMethod === item ? "border-[#0A4D82] bg-[#0A4D82] text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50")}>
                    {item}
                  </button>
                ))}
              </div>
            </SectionCard>
            <NoticePanel text={policyForm.paymentStatus} />
            <div className="grid gap-3 md:grid-cols-2">
              <button type="button" onClick={() => setStep(2)} className="flex h-[48px] w-full items-center justify-center rounded-[12px] border border-[#D5DEEA] bg-white px-5 text-sm font-semibold text-[#0A4D82] shadow-sm hover:bg-[#F8FBFE]">
                Kembali ke Data Lanjutan
              </button>
              <button
                type="button"
                disabled={!canPay}
                onClick={() => updatePolicy({ paymentStatus: `${productConfig.paymentSuccessMessage} Total pembayaran beberapa properti Rp ${formatRupiah(policyTotals.totalPremium)}.` })}
                className={cls("flex h-[48px] w-full items-center justify-center rounded-[12px] px-5 text-sm font-semibold text-white shadow-sm transition", canPay ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}
              >
                Bayar Premi
              </button>
            </div>
          </div>
          <PolicySummaryPanel policyTotals={policyTotals} showPricing={showPricing} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-6 max-w-4xl px-4 md:px-6">
      <div className="space-y-5">
        {!isInternalMode ? (
          <SectionCard
            title="Simulasi Premi"
            subtitle="Data simulasi ini disusun sebagai bagian awal dari SPAU (Surat Permohonan Asuransi Umum) elektronik yang Anda isi dan lengkapi, serta menjadi dasar simulasi premi dan langkah berikutnya."
            headerAlign="center"
            heroHeader
          />
        ) : null}
        <SectionCard title="Informasi Calon Pemegang Polis">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <FieldLabel label="Nama Calon Pemegang Polis" required />
              <div className="relative">
                <TextInput value={policyForm.identity || ""} onChange={(value) => updatePolicy({ identity: value, selectedCustomerCif: "", quoted: false })} placeholder="Masukkan nama calon pemegang polis atau kode CIF" icon={<User className="h-4 w-4" />} />
                {policyForm.identity && customerSuggestions.length > 0 && !hasSelectedCustomer ? (
                  <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
                    {customerSuggestions.map((item) => (
                      <button
                        key={item.cif}
                        type="button"
                        onClick={() =>
                          updatePolicy({
                            identity: `${item.name} - ${item.cif}`,
                            selectedCustomerCif: item.cif,
                            customerType: item.type,
                            phone: item.phone || policyForm.phone,
                            email: item.email || policyForm.email,
                            quoted: false,
                          })
                        }
                        className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          <div className="text-xs text-slate-500">{item.type}</div>
                        </div>
                        <div className="rounded-full bg-[#F8FBFE] px-3 py-1 text-xs font-semibold text-[#0A4D82]">{item.cif}</div>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              {hasSelectedCustomer ? (
                <div className="mt-1 text-xs text-green-600">Data CIF terpilih. Anda akan melanjutkan sebagai nasabah existing.</div>
              ) : policyForm.identity ? (
                <div className="mt-1 text-xs text-slate-500">Nama belum cocok dengan CIF simulasi. Sistem akan memperlakukan sebagai nasabah baru.</div>
              ) : null}
            </div>
            {showCustomerTypeField ? (
              <div>
                <FieldLabel label="Tipe Nasabah" required />
                <SelectInput value={policyForm.customerType || ""} onChange={(value) => updatePolicy({ customerType: value })} options={customerTypes} placeholder="Nasabah ini perorangan atau badan usaha?" />
              </div>
            ) : null}
            <div>
              <FieldLabel label="Nomor Handphone" required />
              <TextInput value={policyForm.phone || ""} onChange={(value) => updatePolicy({ phone: value, quoted: false })} placeholder="08xxxxxxxxxx" icon={<Phone className="h-4 w-4" />} />
            </div>
            <div>
              <FieldLabel label="Alamat Email" required />
              <TextInput value={policyForm.email || ""} onChange={(value) => updatePolicy({ email: value, quoted: false })} placeholder="nama@email.com" icon={<Mail className="h-4 w-4" />} type="email" />
            </div>
          </div>
        </SectionCard>
        <SectionCard
          title="Informasi Properti"
          action={
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button type="button" onClick={addProperty} className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Plus className="h-4 w-4" />
                Tambah Properti
              </button>
              {flowModeAction}
            </div>
          }
        >
          <div className="space-y-4">
            {properties.map((property, index) => (
              <PropertyQuoteCard
                key={property.id}
                property={property}
                quote={policyTotals.propertyQuotes[index]}
                index={index}
                canRemove={properties.length > 1}
                isInternalMode={isInternalMode}
                constructionOptions={constructionOptions}
                constructionGuide={constructionGuide}
                occupancyOptions={occupancyOptions}
                objectTypeOptions={objectTypeOptions}
                selectedGuarantees={policySelectedGuarantees}
                productConfig={productConfig}
                showPricing={showPricing}
                derivePropertyType={derivePropertyType}
                onUpdateProperty={(patch, resetQuote) => updateProperty(property.id, patch, resetQuote)}
                onRemoveProperty={() => removeProperty(property.id)}
                onUpdateObjectRow={(rowId, patch) => updateObjectRow(property.id, rowId, patch)}
                onAddObjectRow={() => addObjectRow(property.id)}
                onRemoveObjectRow={(rowId) => removeObjectRow(property.id, rowId)}
              />
            ))}
          </div>
        </SectionCard>
        {policyForm.quoted ? (
          <SectionCard title="Perluasan Jaminan Polis" subtitle="Pilih sekali untuk seluruh properti dalam polis ini. Premi perluasan dihitung gabungan dari semua properti.">
            <PolicyGuaranteeRows
              selectedGuarantees={policySelectedGuarantees}
              expandedRows={policyExpandedGuarantees}
              policyTotals={policyTotals}
              extensionOptions={extensionOptions}
              showPricing={showPricing}
              onToggleGuarantee={togglePolicyGuarantee}
              onToggleExpand={togglePolicyGuaranteeExpanded}
            />
          </SectionCard>
        ) : null}
        {showPricing ? (
          <SectionCard title="Ringkasan Pembayaran">
            <div className="rounded-2xl border border-[#D8E1EA] bg-[linear-gradient(180deg,#FFFFFF_0%,#F4F8FD_100%)] px-4 py-3 shadow-[0_8px_18px_rgba(15,23,42,0.04)] md:px-6 md:py-4">
              <div className="mx-auto flex max-w-[460px] flex-col items-center text-center">
                <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">Total Pembayaran</div>
                <div className="mt-2 text-[20px] font-bold tracking-tight text-[#0A4D82] md:text-[22px]">Rp {formatRupiah(policyTotals.totalPremium)}</div>
              </div>
            </div>
            <div className="mt-3 border-t border-slate-100 pt-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Rincian</div>
              <div className="mt-2 divide-y divide-slate-100">
                <SummaryRow label="Premi" value={`Rp ${formatRupiah(policyTotals.basePremium + policyTotals.extensionPremium)}`} strong />
                <SummaryRow label="Biaya Meterai" value={`Rp ${formatRupiah(policyTotals.stampDuty)}`} strong />
              </div>
            </div>
          </SectionCard>
        ) : null}
        <PendingItems items={stepOnePendingItems} />
        <NoticePanel text={policyForm.notice} />
        <div className="flex justify-stretch gap-3 sm:justify-end sm:gap-3">
          {!policyForm.quoted ? (
            <button type="button" disabled={!canQuote} onClick={() => updatePolicy({ quoted: true, notice: "" })} className={cls("inline-flex h-[50px] flex-1 items-center justify-center gap-2 rounded-[12px] px-5 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition", canQuote ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}>
              Cek Premi
            </button>
          ) : (
            <>
              {isInternalMode ? (
                  <button type="button" disabled={!canAdvanceStepOne} onClick={() => updatePolicy({ notice: "Penawaran awal beberapa properti siap dikirim. Integrasi pengiriman akan mengikuti handoff IT." })} className={cls("inline-flex h-[50px] flex-1 items-center justify-center gap-2 rounded-[12px] px-5 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition", canAdvanceStepOne ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}>
                  Kirim Penawaran Awal
                </button>
              ) : null}
              <button
                type="button"
                disabled={!canAdvanceStepOne}
                onClick={() => {
                  setStep(2);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={cls("inline-flex h-[50px] flex-1 items-center justify-center gap-2 rounded-[12px] px-5 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition", canAdvanceStepOne ? "bg-[#0A4D82] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}
              >
                Isi Data Lanjutan
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
