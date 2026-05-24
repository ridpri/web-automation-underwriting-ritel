import React, { useMemo } from "react";
import {
  AlertTriangle,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  FileText,
  Flame,
  Home,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Shield,
  Trash2,
  Upload,
  User,
  Wallet,
  X,
} from "lucide-react";

import {
  calculateMultiPropertyPolicy,
  createMultiPropertyDraft,
  deriveConstructionClass,
  FLAMMABLE_MATERIAL_OPTIONS,
  getPropertyContactFieldErrors,
  getPropertyIdNumberError,
  getPrimaryCoverageBreakdown,
  getMultiPropertyStepOnePendingItems,
  getMultiPropertyStepTwoPendingItems,
  isOfficeFloorCountRequiredForProperty,
  onlyDigits,
  ROOF_MATERIAL_OPTIONS,
  shouldShowEarthquakeFloorInputForProperty,
  STRUCTURE_MATERIAL_OPTIONS,
  WALL_MATERIAL_OPTIONS,
} from "./multiPropertyDomain.js";
import { PremiumBreakdown, PremiumPriceHero, ProposalRow } from "../components/PremiumSummaryBlocks.jsx";
import { buildPropertyTerms } from "../propertyTerms.js";

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
const OCCUPANCY_CODE_MAP = {
  "Rumah Tinggal|Hunian": "2971",
  "Rumah Tinggal|Kantor": "2932",
  "Rumah Tinggal|Ritel / Toko": "2941",
  "Rumah Tinggal|Warung / Kelontong": "2941",
  "Ruko|Hunian": "2971",
  "Ruko|Ritel / Toko": "2941",
  "Ruko|Kantor": "2932",
  "Ruko|Warung / Kelontong": "2941",
  "Ruko|Kos-kosan": "2971",
  "Toko|Ritel / Toko": "2941",
  "Toko|Warung / Kelontong": "2941",
  "Toko|Minimarket": "2941",
  "Toko|Tenda makanan": "2941",
  "Toko|Kantor": "2932",
  "Kantor|Kantor": "2932",
  "Kantor|Ritel / Toko": "2941",
  "Kantor|Hunian": "2971",
  "Kos-kosan|Hunian": "2971",
  "Kos-kosan|Kos-kosan": "2971",
  "Kos-kosan|Kantor": "2932",
};
const PAYMENT_METHOD_GROUPS = [
  {
    label: "Bank Transfer",
    methods: [
      { label: "BRI", feeAmount: 4440 },
      { label: "Mandiri", feeAmount: 4440 },
      { label: "BNI", feeAmount: 4440 },
      { label: "BCA", feeAmount: 4440 },
      { label: "BSI", feeAmount: 4440 },
      { label: "CIMB Niaga", feeAmount: 4440 },
      { label: "Permata", feeAmount: 4440 },
    ],
  },
  {
    label: "E Wallet",
    methods: [
      { label: "OVO", feeAmount: 458 },
      { label: "LinkAja", feeAmount: 458 },
      { label: "AstraPay", feeAmount: 458 },
    ],
  },
  {
    label: "Kartu Kredit",
    methods: [{ label: "Credit Card", feeAmount: 3343 }],
  },
  {
    label: "Scan QRIS",
    methods: [{ label: "QRIS", feeAmount: 191 }],
  },
];
const PAYMENT_METHOD_FEE_LOOKUP = PAYMENT_METHOD_GROUPS.reduce((lookup, group) => {
  group.methods.forEach((method) => {
    lookup[method.label] = method.feeAmount;
  });
  return lookup;
}, {});
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

function getOccupancyCode(propertyType, occupancy) {
  return OCCUPANCY_CODE_MAP[[propertyType, occupancy].filter(Boolean).join("|")] || "";
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

function FieldError({ message }) {
  if (!message) return null;
  return <div className="mt-1.5 text-xs font-medium leading-5 text-red-600">{message}</div>;
}

function TextInput({ value, onChange, placeholder, icon, type = "text", readOnly = false, disabled = false, error = "" }) {
  return (
    <div>
      <div className="relative">
        {icon ? <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div> : null}
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className={cls(
            "h-[44px] w-full rounded-[10px] border bg-white px-3.5 text-[14px] text-slate-800 outline-none transition placeholder:text-slate-500",
            error ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" : "border-[#D5DDE6] focus:border-[#0A4D82] focus:ring-4 focus:ring-[#0A4D82]/10",
            (readOnly || disabled) && "cursor-not-allowed bg-slate-50 text-slate-500",
            icon && "pl-10"
          )}
        />
      </div>
      <FieldError message={error} />
    </div>
  );
}

function CurrencyInput({ value, onChange, placeholder, error = "" }) {
  return (
    <div>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">Rp</span>
        <input
          value={value}
          onChange={(event) => onChange(formatRupiah(onlyDigits(event.target.value)))}
          inputMode="numeric"
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          className={cls(
            "h-[44px] w-full rounded-[10px] border bg-white pl-10 pr-3.5 text-[14px] text-slate-800 outline-none transition placeholder:text-slate-500",
            error ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" : "border-[#D5DDE6] focus:border-[#0A4D82] focus:ring-4 focus:ring-[#0A4D82]/10"
          )}
        />
      </div>
      <FieldError message={error} />
    </div>
  );
}

function SelectInput({ value, onChange, options, placeholder, error = "" }) {
  return (
    <div>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          className={cls(
            "h-[44px] w-full appearance-none rounded-[10px] border bg-white px-3.5 pr-10 text-[14px] outline-none transition",
            error ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" : "border-[#D5DDE6] focus:border-[#0A4D82] focus:ring-4 focus:ring-[#0A4D82]/10",
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
      <FieldError message={error} />
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
      {children ? <div className="mt-4">{children}</div> : null}
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

function CustomerAccountSummary({ name, email, phone, onEdit }) {
  return (
    <SectionCard
      title="Ringkasan Informasi Calon Pemegang Polis"
      action={
        <button type="button" onClick={onEdit} className="inline-flex h-9 items-center rounded-[10px] border border-[#D5DDE6] bg-white px-3.5 text-sm font-medium text-[#0A4D82] shadow-sm hover:bg-[#F8FBFE]">
          Edit
        </button>
      }
    >
      <div className="rounded-2xl border border-[#D8E1EA] bg-white px-4 py-3 md:px-5">
        <SummaryRow label="Nama Calon Pemegang Polis" value={name || "-"} />
        <SummaryRow label="Alamat Email" value={email || "-"} />
        <SummaryRow label="Nomor Handphone" value={phone || "-"} />
      </div>
    </SectionCard>
  );
}

function OfferSummarySection({ title, children }) {
  return (
    <div className="rounded-[22px] border border-[#D8E1EA] bg-[linear-gradient(180deg,#FFFFFF_0%,#FBFDFF_100%)] px-4 py-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] md:px-5">
      <div className="border-b border-[#EEF3F8] pb-3 text-[15px] font-semibold tracking-tight text-slate-900">{title}</div>
      <div className="mt-3.5">{children}</div>
    </div>
  );
}

function TermsGroupAccordion({ title, items, subtitle, icon }) {
  const [expanded, setExpanded] = React.useState(false);
  const Icon = icon || Shield;

  return (
    <div className="overflow-hidden rounded-xl border border-[#C9D5E3] bg-[#F8FBFE]">
      <button type="button" onClick={() => setExpanded((current) => !current)} className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left">
        <div className="flex min-w-0 items-start gap-3">
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#0A4D82]" />
          <div className="min-w-0">
            <div className="text-[14px] font-semibold leading-5 text-slate-900">{title}</div>
            {subtitle ? <div className="mt-1 text-[12px] leading-5 text-slate-500">{subtitle}</div> : null}
          </div>
        </div>
        <ChevronDown className={cls("mt-0.5 h-4 w-4 shrink-0 text-slate-500 transition", expanded && "rotate-180")} />
      </button>
      {expanded ? (
        <div className="border-t border-[#D6E0EA] bg-white/70 px-4 py-3">
          {items.length ? (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.key} className="rounded-lg border border-[#DDE7F1] bg-white px-3 py-2.5">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0A4D82]" />
                    <div className="min-w-0">
                      <div className="text-[12.5px] leading-5 text-slate-800">{item.title}</div>
                      {item.english ? <div className="mt-1 text-[12px] leading-5 text-slate-500">{item.english}</div> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SpecialWarrantiesAccordion({ productKey = "property-safe", stockAmount = 0, occupancyCode = "", selectedGuarantees = {} }) {
  const terms = buildPropertyTerms({ productKey, stockAmount, occupancyCode, selectedGuarantees });
  const totalTerms = terms.clauses.length + terms.warranties.length;

  return (
    <div className="space-y-2">
      <div className="text-[12px] leading-5 text-slate-500">
        {terms.clauses.length} klausul tambahan dan {terms.warranties.length} warranty berlaku untuk penawaran ini.
      </div>
      <TermsGroupAccordion
        title="Klausul dan/atau Endorsemen yang melekat"
        items={terms.clauses}
        icon={FileText}
        subtitle="Bagian yang tidak terpisahkan dari polis dan berlaku sebagai ketentuan yang mengikat."
      />
      <TermsGroupAccordion
        title="Warranty"
        items={terms.warranties}
        icon={AlertTriangle}
        subtitle="Kewajiban yang harus dipatuhi selama polis berlaku agar perlindungan asuransi tetap berjalan sesuai ketentuan."
      />
      <div className="text-[11.5px] leading-5 text-slate-500">{totalTerms} syarat dan ketentuan ditampilkan sesuai data penawaran.</div>
    </div>
  );
}

function OfferSummaryKeyValue({ label, value, emphasize = false }) {
  const normalizedLabel = String(label || "").replace(/:\s*$/, "");
  const isEmptyString = typeof value === "string" && (!value.trim() || value.trim() === "-" || value.trim().toLowerCase() === "belum dipilih");
  if (value === null || value === undefined || isEmptyString) return null;
  return (
    <div className={cls("border-t border-slate-100 first:border-t-0 first:pt-0 last:pb-0", emphasize ? "py-2.5" : "py-2")}>
      <div className="space-y-1 md:grid md:grid-cols-[170px_10px_minmax(0,1fr)] md:gap-x-1.5 md:space-y-0">
        <div className="text-[12px] font-normal leading-[1.4] text-slate-500">
          {normalizedLabel}
          <span className="md:hidden">:</span>
        </div>
        <div className="hidden text-[12px] font-normal leading-[1.4] tracking-[0.08em] text-slate-400 md:block">:</div>
        <div className={cls("text-[14px] font-normal leading-[1.45] text-slate-900", emphasize && "leading-[1.75]")}>{value}</div>
      </div>
    </div>
  );
}

function PendingItems({ items }) {
  const [expanded, setExpanded] = React.useState(false);
  if (!items.length) return null;
  const preview = items[0];
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 text-sm text-amber-900">
      <button type="button" onClick={() => setExpanded((value) => !value)} className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left">
        <div className="min-w-0">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Yang masih perlu dilengkapi</span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">{items.length}</span>
          </div>
          {!expanded ? <div className="mt-1 truncate text-[12px] text-amber-800">{preview}</div> : null}
        </div>
        <ChevronDown className={cls("mt-0.5 h-4 w-4 shrink-0 text-amber-800 transition", expanded && "rotate-180")} />
      </button>
      {expanded ? (
        <div className="space-y-2 border-t border-amber-200 px-4 py-3">
          {items.map((item) => (
            <div key={item} className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function NoticePanel({ text }) {
  if (!text) return null;
  return <div className="rounded-2xl border border-[#CFE0F0] bg-[#F8FBFE] px-4 py-3 text-sm text-[#0A4D82]">{text}</div>;
}

function PropertyFlowActionToolbar({ mode, onSingle, onMulti, onAdd, onUpload }) {
  const itemClass = (active) =>
    cls(
      "inline-flex h-10 w-10 items-center justify-center transition first:rounded-l-[12px] last:rounded-r-[12px]",
      active ? "bg-[#0A4D82] text-white shadow-sm" : "bg-white text-[#0A4D82] hover:bg-[#F8FBFE]"
    );
  return (
    <div className="inline-flex overflow-hidden rounded-[14px] border border-[#C8D6E5] bg-white text-[#0A4D82] shadow-sm divide-x divide-[#DDE6F0]" aria-label="Aksi objek properti">
      {mode === "multi" ? (
        <>
          <button type="button" aria-label="Upload daftar properti" title="Upload daftar properti" onClick={onUpload} className={itemClass(false)}>
            <Upload className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Tambah Properti" title="Tambah Properti" onClick={onAdd} className={itemClass(false)}>
            <Plus className="h-4 w-4" />
          </button>
        </>
      ) : null}
      <button type="button" aria-label="Beberapa Properti" title="Beberapa Properti" onClick={onMulti} className={itemClass(mode === "multi")}>
        <Building2 className="h-4 w-4" />
      </button>
      <button type="button" aria-label="Satu Properti" title="Satu Properti" onClick={onSingle} className={itemClass(mode === "single")}>
        <Home className="h-4 w-4" />
      </button>
    </div>
  );
}

function ObjectRowsEditor({ property, onUpdateObjectRow, onAddObjectRow, onRemoveObjectRow, objectTypeOptions, fieldErrors = {} }) {
  const [pendingDeleteRowId, setPendingDeleteRowId] = React.useState("");

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
        {(property.objectRows || []).map((row, rowIndex) => {
          const pendingDelete = pendingDeleteRowId === row.id;
          const rowErrors = fieldErrors.objectRows?.[rowIndex] || {};
          return (
            <div key={row.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className={cls("grid gap-2.5 lg:items-start", pendingDelete ? "lg:grid-cols-[170px_minmax(0,1fr)_minmax(0,1.2fr)_130px]" : "lg:grid-cols-[170px_minmax(0,1fr)_minmax(0,1.2fr)_40px]")}>
              <SelectInput value={row.type} onChange={(value) => onUpdateObjectRow(row.id, { type: value })} options={objectTypeOptions} placeholder="Jenis objek" error={rowErrors.type} />
              <CurrencyInput value={row.amount} onChange={(value) => onUpdateObjectRow(row.id, { amount: value })} placeholder="Harga pertanggungan" error={rowErrors.amount} />
              <TextInput value={row.note} onChange={(value) => onUpdateObjectRow(row.id, { note: value })} placeholder="Keterangan objek" />
              {pendingDelete ? (
                <div className="flex h-[44px] items-center justify-end gap-1.5">
                  <span className="hidden text-[11px] font-semibold text-rose-600 lg:inline">Hapus?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onRemoveObjectRow(row.id);
                      setPendingDeleteRowId("");
                    }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                    aria-label="Konfirmasi hapus objek"
                    title="Konfirmasi hapus objek"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDeleteRowId("")}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-slate-300 text-slate-500 hover:bg-slate-50"
                    aria-label="Batal hapus objek"
                    title="Batal hapus objek"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setPendingDeleteRowId(row.id)} className="inline-flex h-[44px] items-center justify-center rounded-[10px] border border-slate-300 text-slate-500 hover:bg-slate-50" aria-label="Hapus objek" title="Hapus objek">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          );
        })}
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

function PolicyPrimaryCoverageCard({ productConfig, policyTotals, properties = [], showPricing, expanded, onToggle }) {
  const PrimaryIcon = productConfig.key === "property-all-risk" ? Shield : Flame;
  const breakdown = getPrimaryCoverageBreakdown(policyTotals);
  const constructionClasses = Array.from(new Set(properties.map((property) => property.constructionClass).filter(Boolean)));
  const deductibleText =
    constructionClasses.length === 1 && constructionClasses[0] === "Kelas 1"
      ? productConfig.primaryCoverageDeductibleClassOne
      : constructionClasses.length === 1
        ? productConfig.primaryCoverageDeductibleOther
        : "Mengikuti kelas konstruksi masing-masing properti.";
  return (
    <div>
      <div className="text-[15px] font-semibold tracking-tight text-slate-900">Jaminan Utama</div>
      <div className="mt-3 rounded-xl border border-[#C9D5E3] bg-[#F8FBFE]">
        <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left">
          <div className="flex min-w-0 items-start gap-2 text-[#0A4D82]">
            <PrimaryIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="min-w-0">
              <div className="truncate text-[15px] font-semibold">{productConfig.primaryCoverageTitle}</div>
              <div className="mt-0.5 text-[12px] text-slate-500">{productConfig.primaryCoveragePremiumLabel}: {showPricing ? `Rp ${formatRupiah(breakdown.totalPremium)}` : "-"}</div>
            </div>
          </div>
          <div className="flex shrink-0 items-center text-[#0A4D82]">
            <ChevronDown className={cls("h-4 w-4 text-slate-500 transition", expanded && "rotate-180")} />
          </div>
        </button>
        {expanded ? (
          <div className="border-t border-[#D6E0EA] bg-white px-3.5 py-3">
            <div className="text-[13px] leading-6 text-slate-700">{productConfig.primaryCoverageDescription}</div>
            <div className="mt-2 text-[12px] leading-6 text-slate-600">
              <span className="font-semibold text-slate-700">Risiko sendiri saat klaim: </span>
              {deductibleText}
            </div>
            {breakdown.items.length ? (
              <div className="mt-2 border-t border-slate-200 pt-1.5">
                <div className="mb-0.5 text-[12px] font-semibold leading-4 text-slate-500">Rincian premi per properti</div>
                <div className="divide-y divide-slate-100">
                  {breakdown.items.map((item) => (
                    <div key={item.propertyId || item.title} className="flex items-center justify-between gap-3 py-1.5 text-[12.5px] leading-4">
                      <div className="min-w-0 truncate font-semibold text-slate-900">{item.title}</div>
                      <div className="shrink-0 font-semibold text-[#0A4D82]">{showPricing ? `Rp ${formatRupiah(item.premium)}` : "-"}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
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
  derivePropertyType,
  onUpdateProperty,
  onRemoveProperty,
  onUpdateObjectRow,
  onAddObjectRow,
  onRemoveObjectRow,
  fieldErrors = {},
}) {
  const [confirmRemoveProperty, setConfirmRemoveProperty] = React.useState(false);
  const detailsOpen = property.detailsOpen !== false;
  const fallbackPropertyLabel = property.title || `Properti ${index + 1}`;
  const propertyLabel = String(property.locationSearch || "").trim() || fallbackPropertyLabel;
  const closedSummary = [property.occupancy, quote.totalValue > 0 ? `Rp ${formatRupiah(quote.totalValue)}` : ""].filter(Boolean).join(" - ");
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
          confirmRemoveProperty ? (
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="hidden text-[11px] font-semibold text-rose-600 sm:inline">Hapus?</span>
              <button type="button" onClick={onRemoveProperty} aria-label={`Konfirmasi hapus ${propertyLabel}`} title={`Konfirmasi hapus ${propertyLabel}`} className="inline-flex h-8 w-8 items-center justify-center rounded-[9px] border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100">
                <Check className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setConfirmRemoveProperty(false)} aria-label={`Batal hapus ${propertyLabel}`} title={`Batal hapus ${propertyLabel}`} className="inline-flex h-8 w-8 items-center justify-center rounded-[9px] border border-slate-300 bg-white text-slate-500 hover:bg-slate-50">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmRemoveProperty(true)} aria-label={`Hapus ${propertyLabel}`} title={`Hapus ${propertyLabel}`} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-slate-300 bg-white text-slate-500 hover:bg-slate-50">
              <Trash2 className="h-4 w-4" />
            </button>
          )
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
                error={fieldErrors.occupancy}
              />
            </div>
            {isInternalMode ? (
              <div>
                <FieldLabel label="Kelas Konstruksi" required />
                <SelectInput value={property.constructionClass || ""} onChange={(value) => onUpdateProperty({ constructionClass: value })} options={constructionOptions} placeholder="Pilih kelas konstruksi" error={fieldErrors.constructionClass} />
              </div>
            ) : (
              <div className="md:col-span-2">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <FieldLabel label="Dinding Utama" required />
                    <SelectInput value={property.wallMaterial || ""} onChange={(value) => updateConstructionMaterial("wallMaterial", value)} options={WALL_MATERIAL_OPTIONS} placeholder="Pilih material dinding" error={fieldErrors.wallMaterial} />
                  </div>
                  <div>
                    <FieldLabel label="Struktur / Lantai Utama" required />
                    <SelectInput value={property.structureMaterial || ""} onChange={(value) => updateConstructionMaterial("structureMaterial", value)} options={STRUCTURE_MATERIAL_OPTIONS} placeholder="Pilih material struktur" error={fieldErrors.structureMaterial} />
                  </div>
                  <div>
                    <FieldLabel label="Atap Bangunan" required />
                    <SelectInput value={property.roofMaterial || ""} onChange={(value) => updateConstructionMaterial("roofMaterial", value)} options={ROOF_MATERIAL_OPTIONS} placeholder="Pilih material atap" error={fieldErrors.roofMaterial} />
                  </div>
                  <div>
                    <FieldLabel label="Bagian mudah terbakar lainnya?" required />
                    <SelectInput value={property.flammableMaterial || ""} onChange={(value) => updateConstructionMaterial("flammableMaterial", value)} options={FLAMMABLE_MATERIAL_OPTIONS} placeholder="Pilih kondisi material" error={fieldErrors.flammableMaterial} />
                  </div>
                </div>
                {constructionInfo ? <div className="mt-3 rounded-[12px] border border-[#D5DDE6] bg-[#F8FBFE] px-3 py-2.5 text-[12px] leading-5 text-slate-600"><span className="font-semibold text-slate-900">Hasil panduan: {constructionInfo.title}.</span></div> : null}
              </div>
            )}
            {showOfficeFloorField ? (
              <div>
                <FieldLabel label="Jumlah Lantai" required />
                <TextInput value={property.floorCount || ""} onChange={(value) => onUpdateProperty({ floorCount: onlyDigits(value) })} placeholder="Masukkan jumlah lantai" icon={<Building2 className="h-4 w-4" />} error={fieldErrors.floorCount} />
              </div>
            ) : null}
            <div className="md:col-span-2">
              <FieldLabel label="Alamat / Lokasi Objek" required />
              <TextInput value={property.locationSearch || ""} onChange={(value) => onUpdateProperty({ locationSearch: value })} placeholder="Ketik alamat, nama jalan, atau nama gedung" icon={<Search className="h-4 w-4" />} error={fieldErrors.locationSearch} />
              <div className="mt-2 flex flex-wrap gap-2.5">
                <button type="button" onClick={() => onUpdateProperty({ locationSearch: `Lokasi GPS tersimulasi - ${fallbackPropertyLabel}` })} className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <MapPin className="h-4 w-4" />
                  Ambil Lokasi Sekarang
                </button>
                <button type="button" onClick={() => onUpdateProperty({ locationSearch: `Pin peta tersimulasi - ${fallbackPropertyLabel}` })} className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <MapPin className="h-4 w-4" />
                  Pilih di Peta
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <ObjectRowsEditor property={property} objectTypeOptions={objectTypeOptions} onUpdateObjectRow={onUpdateObjectRow} onAddObjectRow={onAddObjectRow} onRemoveObjectRow={onRemoveObjectRow} fieldErrors={fieldErrors} />
          </div>

          {showEarthquakeFloorField ? (
            <div className="mt-4 max-w-sm rounded-xl border border-amber-200 bg-amber-50 p-3">
              <FieldLabel label="Jumlah lantai bangunan yang diasuransikan" required helpText="Diisi karena perluasan Gempa Bumi dipilih untuk polis ini." />
              <TextInput value={property.floorCount || ""} onChange={(value) => onUpdateProperty({ floorCount: onlyDigits(value) })} placeholder="Masukkan jumlah lantai" icon={<Building2 className="h-4 w-4" />} error={fieldErrors.floorCount} />
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

function PropertyUnderwritingCard({ property, index, customerType, onUpdateProperty, fieldErrors = {} }) {
  const uwForm = property.uwForm || {};
  const hasStockObject = (property.objectRows || []).some((row) => row.type === "Stok");
  const updateUw = (patch) => onUpdateProperty({ uwForm: { ...uwForm, ...patch } }, false);
  const updateUploads = (patch) => onUpdateProperty({ uploads: { ...property.uploads, ...patch } }, false);
  const fireProtectionItems = Array.isArray(uwForm.fireProtectionItems) ? uwForm.fireProtectionItems : [];
  const detailsOpen = property.uwDetailsOpen !== false;
  const propertyLabel = String(property.locationSearch || "").trim() || property.title || `Properti ${index + 1}`;
  const uploadCount = UPLOAD_SLOTS.filter((slot) => property.uploads?.[slot.key]).length;
  const closedSummary = [uwForm.claimHistory ? `Klaim: ${uwForm.claimHistory}` : "", `${uploadCount}/${UPLOAD_SLOTS.length} foto`].filter(Boolean).join(" - ");
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
                <TextInput value={uwForm.picName || ""} onChange={(value) => updateUw({ picName: value })} placeholder="Nama kontak yang bisa dihubungi" icon={<User className="h-4 w-4" />} error={fieldErrors.picName} />
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
                <FieldError message={fieldErrors.fireProtectionItems} />
              </div>
            ) : null}
            <div>
              <FieldLabel label="Riwayat Klaim 3 Tahun Terakhir" required />
              <SelectInput value={uwForm.claimHistory || ""} onChange={(value) => updateUw({ claimHistory: value })} options={CLAIM_HISTORY_OPTIONS} placeholder="Pilih riwayat klaim" error={fieldErrors.claimHistory} />
            </div>
            {hasStockObject ? (
              <div>
                <FieldLabel label="Jenis Stok" required />
                <SelectInput value={uwForm.stockType || ""} onChange={(value) => updateUw({ stockType: value })} options={STOCK_TYPE_OPTIONS} placeholder="Pilih jenis stok" error={fieldErrors.stockType} />
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
  sessionProfile = null,
  policyForm,
  setPolicyForm,
  properties,
  setProperties,
  derivePropertyType,
  customerOptions = [],
  flowMode = "multi",
  onSingleFlow = () => {},
  onMultiFlow = () => {},
}) {
  const isInternalMode = entryMode === "internal";
  const authenticatedExternalProfile = entryMode === "external" && sessionProfile?.authenticated ? sessionProfile : null;
  const isAuthenticatedExternalJourney = Boolean(authenticatedExternalProfile);
  const accountIdentity = String(authenticatedExternalProfile?.name || "").trim();
  const accountCustomerType = String(authenticatedExternalProfile?.customerType || "").trim();
  const accountPhone = String(authenticatedExternalProfile?.phone || "").trim();
  const accountEmail = String(authenticatedExternalProfile?.email || "").trim();
  const accountIdentityNumber = String(authenticatedExternalProfile?.identityNumber || "").trim();
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
  const [quoteAttempted, setQuoteAttempted] = React.useState(false);
  const [customerSummaryEditing, setCustomerSummaryEditing] = React.useState(false);
  const [openPaymentGroup, setOpenPaymentGroup] = React.useState("Bank Transfer");
  const showStepOneFieldErrors = quoteAttempted || policyForm.quoted;
  const contactFieldErrors = getPropertyContactFieldErrors({
    identity: policyForm.identity,
    phone: policyForm.phone,
    email: policyForm.email,
    showRequired: showStepOneFieldErrors,
  });
  const propertyFieldErrors = useMemo(() => {
    if (!showStepOneFieldErrors) return {};
    return Object.fromEntries(properties.map((property) => {
      const hasSharedEarthquake = policySelectedGuarantees.earthquake;
      const needsFloor = isOfficeFloorCountRequiredForProperty(property) || shouldShowEarthquakeFloorInputForProperty(property, hasSharedEarthquake ? policySelectedGuarantees : undefined);
      return [
        property.id,
        {
          occupancy: !property.occupancy ? "Pilih penggunaan properti." : "",
          locationSearch: !String(property.locationSearch || "").trim() ? "Isi alamat properti." : "",
          constructionClass: !property.constructionClass ? (isInternalMode ? "Pilih kelas konstruksi." : "Lengkapi panduan konstruksi.") : "",
          wallMaterial: !isInternalMode && !property.wallMaterial ? "Pilih material dinding utama." : "",
          structureMaterial: !isInternalMode && !property.structureMaterial ? "Pilih material struktur/lantai utama." : "",
          roofMaterial: !isInternalMode && !property.roofMaterial ? "Pilih material atap bangunan." : "",
          flammableMaterial: !isInternalMode && !property.flammableMaterial ? "Pilih kondisi bagian mudah terbakar." : "",
          floorCount: needsFloor && Number(onlyDigits(property.floorCount)) <= 0 ? "Jumlah lantai harus lebih dari 0." : "",
          objectRows: (property.objectRows || []).map((row) => ({
            type: !String(row.type || "").trim() ? "Pilih jenis objek." : "",
            amount: Number(onlyDigits(row.amount)) > 0 ? "" : "Harga pertanggungan harus lebih dari Rp 0.",
          })),
        },
      ];
    }));
  }, [isInternalMode, policySelectedGuarantees, properties, showStepOneFieldErrors]);
  const showStepTwoFieldErrors = step > 1;
  const policyFieldErrors = {
    idNumber: getPropertyIdNumberError(policyForm.customerType, policyForm.idNumber, showStepTwoFieldErrors),
    coverageStartDate: showStepTwoFieldErrors && !policyForm.coverageStartDate ? "Pilih tanggal mulai pertanggungan." : "",
  };
  const propertyUwFieldErrors = useMemo(() => {
    if (!showStepTwoFieldErrors) return {};
    return Object.fromEntries(properties.map((property) => {
      const uwForm = property.uwForm || {};
      const hasStock = (property.objectRows || []).some((row) => row.type === "Stok");
      return [
        property.id,
        {
          picName: policyForm.customerType === "Badan Usaha" && !String(uwForm.picName || "").trim() ? "Isi kontak di lokasi." : "",
          fireProtectionItems: uwForm.fireProtectionChoice === "Ada" && !(uwForm.fireProtectionItems || []).length ? "Pilih minimal satu jenis proteksi kebakaran." : "",
          claimHistory: !uwForm.claimHistory ? "Pilih riwayat klaim." : "",
          stockType: hasStock && !String(uwForm.stockType || "").trim() ? "Pilih jenis stok." : "",
        },
      ];
    }));
  }, [policyForm.customerType, properties, showStepTwoFieldErrors]);
  const transactionFee = policyForm.paymentMethod ? PAYMENT_METHOD_FEE_LOOKUP[policyForm.paymentMethod] || 0 : 0;
  const totalPayment = policyTotals.totalPremium + transactionFee;
  const canPay = Boolean(policyForm.consentApproved && policyForm.paymentMethod && !policyForm.paymentStatus);
  const paymentPendingItems = [];
  if (!policyForm.paymentMethod) paymentPendingItems.push("Pilih salah satu metode pembayaran terlebih dahulu.");
  if (!policyForm.consentApproved) paymentPendingItems.push("Buka dan setujui Syarat dan Ketentuan Persetujuan atas SPAU elektronik ini.");
  const selectedExtensionItems = extensionOptions
    .filter((item) => policySelectedGuarantees[item.key])
    .map((item) => item.title);
  const stockAmount = properties.reduce(
    (sum, property) =>
      sum +
      (property.objectRows || []).reduce((propertySum, row) => propertySum + (row.type === "Stok" ? Number(onlyDigits(row.amount)) : 0), 0),
    0,
  );
  const occupancyCode = properties.map((property) => getOccupancyCode(property.propertyType, property.occupancy)).find(Boolean) || "";
  const coveragePeriod = policyForm.coverageStartDate ? `${policyForm.coverageStartDate} - 1 tahun` : "-";
  const customerKeyword = String(policyForm.identity || "").trim().toLowerCase();
  const customerSuggestions = customerKeyword
    ? customerOptions.filter((item) => item.name.toLowerCase().includes(customerKeyword) || item.cif.toLowerCase().includes(customerKeyword)).slice(0, 5)
    : [];
  const hasSelectedCustomer = Boolean(policyForm.selectedCustomerCif);
  const showCustomerTypeField = Boolean(String(policyForm.identity || "").trim()) && !hasSelectedCustomer && !isDigitsOnly(policyForm.identity);

  const updatePolicy = (patch) => setPolicyForm((prev) => ({ ...prev, ...patch }));
  React.useEffect(() => {
    if (!isAuthenticatedExternalJourney) {
      setCustomerSummaryEditing(false);
      return;
    }
    setPolicyForm((prev) => ({
      ...prev,
      identity: prev.identity || accountIdentity,
      customerType: prev.customerType || accountCustomerType || "Nasabah Perorangan",
      phone: prev.phone || accountPhone,
      email: prev.email || accountEmail,
      idNumber: prev.idNumber || accountIdentityNumber,
    }));
  }, [accountCustomerType, accountEmail, accountIdentity, accountIdentityNumber, accountPhone, isAuthenticatedExternalJourney, setPolicyForm]);
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
  const uploadPropertyList = () => {
    updatePolicy({ quoted: false, notice: "Upload daftar properti belum terhubung. Gunakan tombol tambah untuk menambahkan properti satu per satu." });
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
          <SectionCard
            title="Data Lanjutan"
            subtitle="Data lanjutan ini disusun sebagai bagian dari SPAU (Surat Permohonan Asuransi Umum) elektronik yang Anda isi dan lengkapi, serta menjadi dasar ringkasan final sebelum pembayaran dan penerbitan polis."
            headerAlign="center"
            heroHeader
          />
          <SectionCard title="Informasi Calon Pemegang Polis">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <FieldLabel label={policyForm.customerType === "Badan Usaha" ? "NPWP" : "NIK"} required />
                <TextInput value={policyForm.idNumber || ""} onChange={(value) => updatePolicy({ idNumber: onlyDigits(value) })} placeholder={policyForm.customerType === "Badan Usaha" ? "Masukkan NPWP" : "Masukkan NIK"} icon={<User className="h-4 w-4" />} error={policyFieldErrors.idNumber} />
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Informasi Properti" subtitle="Lengkapi proteksi, riwayat klaim, dan foto untuk masing-masing properti.">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel label="Tanggal Mulai Pertanggungan" required />
                  <TextInput value={policyForm.coverageStartDate || ""} onChange={(value) => updatePolicy({ coverageStartDate: value })} type="date" error={policyFieldErrors.coverageStartDate} />
                </div>
              </div>
              {properties.map((property, index) => (
                <PropertyUnderwritingCard key={property.id} property={property} index={index} customerType={policyForm.customerType} onUpdateProperty={(patch, resetQuote) => updateProperty(property.id, patch, resetQuote)} fieldErrors={propertyUwFieldErrors[property.id]} />
              ))}
            </div>
          </SectionCard>
          <NoticePanel text={policyForm.notice} />
          <PendingItems items={stepTwoPendingItems} />
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
      <div className="mx-auto mt-6 max-w-[860px] px-4 md:px-6">
        <div className="space-y-5">
          <SectionCard
            title="Ringkasan Sebelum Pembayaran"
            subtitle="Tinjau kembali ringkasan Anda sebelum melanjutkan ke pembayaran. Ringkasan ini disusun dari data SPAU (Surat Permohonan Asuransi Umum) elektronik yang Anda isi dan lengkapi, serta mengacu pada ringkasan penawaran beberapa properti."
            headerAlign="center"
            heroHeader
          >
            <div className="rounded-[24px] border border-[#D8E1EA] bg-[linear-gradient(180deg,#FBFDFF_0%,#F5F9FD_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              <div className="space-y-3">
                <OfferSummarySection title="Ringkasan Informasi Calon Pemegang Polis">
                  <div className="space-y-2.5">
                    <OfferSummaryKeyValue label="Nama Calon Pemegang Polis" value={policyForm.identity} />
                    <OfferSummaryKeyValue label="Alamat Email" value={policyForm.email} />
                    <OfferSummaryKeyValue label="Nomor Handphone" value={policyForm.phone} />
                  </div>
                </OfferSummarySection>

                <OfferSummarySection title="Ringkasan Informasi Properti">
                  <div className="space-y-2.5">
                    <OfferSummaryKeyValue label="Total Properti" value={`${properties.length} properti`} />
                    <OfferSummaryKeyValue label="Total Harga Pertanggungan" value={`Rp ${formatRupiah(policyTotals.totalValue)}`} />
                    <OfferSummaryKeyValue label="Jangka Waktu Pertanggungan" value={coveragePeriod} />
                    <OfferSummaryKeyValue label="Perluasan Jaminan" value={selectedExtensionItems.length ? selectedExtensionItems.join(", ") : "Tidak ada perluasan yang dipilih"} />
                  </div>
                  <div className="mt-3 space-y-2">
                    {properties.map((property, index) => {
                      const quote = policyTotals.propertyQuotes[index];
                      const objectSummary = (property.objectRows || []).map((row) => `${row.type || "Objek"} Rp ${formatRupiah(onlyDigits(row.amount))}`).join(", ");
                      return (
                        <div key={property.id} className="rounded-xl border border-[#D8E1EA] bg-[#F8FBFE] px-3.5 py-3">
                          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900">{property.title}</div>
                              <div className="mt-1 text-[13px] leading-5 text-slate-600">{property.locationSearch || "-"}</div>
                              <div className="mt-1 text-[12px] text-slate-500">{[property.occupancy, property.constructionClass].filter(Boolean).join(" - ") || "-"}</div>
                              <div className="mt-1 text-[12px] leading-5 text-slate-500">{objectSummary || "-"}</div>
                            </div>
                            <div className="shrink-0 text-left md:text-right">
                              <div className="text-[12px] text-slate-500">Premi Properti</div>
                              <div className="font-bold text-[#0A4D82]">Rp {formatRupiah(quote.totalPremium)}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </OfferSummarySection>

                <OfferSummarySection title="Ringkasan Syarat dan Ketentuan">
                  <div className="space-y-4">
                    <div className="text-[15px] font-normal text-slate-900">Ringkasan penawaran beberapa properti</div>
                    <PolicyPrimaryCoverageCard productConfig={productConfig} policyTotals={policyTotals} properties={properties} showPricing={showPricing} expanded={Boolean(policyForm.primaryCoverageBreakdownOpen)} onToggle={() => updatePolicy({ primaryCoverageBreakdownOpen: !policyForm.primaryCoverageBreakdownOpen })} />
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="text-[13px] font-medium text-slate-500">Perluasan Jaminan</div>
                        <button
                          type="button"
                          onClick={() => {
                            setStep(1);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="text-[12px] font-medium text-[#0A4D82] underline underline-offset-2 hover:text-[#0D5B98]"
                        >
                          {selectedExtensionItems.length ? "Ubah Perluasan Jaminan" : "Tambahkan Perluasan Jaminan"}
                        </button>
                      </div>
                      {selectedExtensionItems.length ? (
                        <PolicyExtensionSelector extensionOptions={extensionOptions} selectedGuarantees={policySelectedGuarantees} expandedRows={policyExpandedGuarantees} policyTotals={policyTotals} showPricing={showPricing} onToggleGuarantee={togglePolicyGuarantee} onToggleExpand={togglePolicyGuaranteeExpanded} />
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <div className="text-[13px] font-medium text-slate-500">Syarat dan Ketentuan Lainnya</div>
                      <SpecialWarrantiesAccordion productKey={productConfig.key} stockAmount={stockAmount} occupancyCode={occupancyCode} selectedGuarantees={policySelectedGuarantees} />
                    </div>
                  </div>
                </OfferSummarySection>

                <OfferSummarySection title="Ringkasan Pembayaran">
                  <PremiumPriceHero label="Total Pembayaran" value={`Rp ${formatRupiah(totalPayment)}`} />
                  <PremiumBreakdown>
                    <ProposalRow label="Premi" value={`Rp ${formatRupiah(policyTotals.basePremium)}`} />
                    {policyTotals.extensionPremium > 0 ? <ProposalRow label="Premi Perluasan" value={`Rp ${formatRupiah(policyTotals.extensionPremium)}`} /> : null}
                    <ProposalRow label="Biaya Transaksi" value={`Rp ${formatRupiah(transactionFee)}`} />
                    <ProposalRow label="Biaya Meterai" value={`Rp ${formatRupiah(policyTotals.stampDuty)}`} />
                    <ProposalRow label="Total Pembayaran" value={`Rp ${formatRupiah(totalPayment)}`} strong />
                  </PremiumBreakdown>
                </OfferSummarySection>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Pilih Metode Pembayaran">
            <div className="space-y-7">
              {PAYMENT_METHOD_GROUPS.map((group) => (
                <div key={group.label} className="space-y-3">
                  <button type="button" onClick={() => setOpenPaymentGroup((current) => (current === group.label ? "" : group.label))} className="flex w-full items-center justify-between border-b border-[#D8E1EA] pb-3 text-left">
                    <div className="text-[15px] font-semibold text-slate-600">{group.label}</div>
                    <ChevronDown className={cls("h-4 w-4 text-slate-500 transition-transform", openPaymentGroup === group.label ? "rotate-180" : "")} />
                  </button>
                  {openPaymentGroup === group.label ? (
                    <div className="grid gap-3 md:grid-cols-3">
                      {group.methods.map((method) => {
                        const selected = policyForm.paymentMethod === method.label;
                        return (
                          <button key={method.label} type="button" onClick={() => updatePolicy({ paymentMethod: method.label, paymentStatus: "" })} className={cls("min-h-[52px] rounded-[6px] border px-4 py-3 text-left transition", selected ? "border-[#0A4D82] bg-[#F8FBFE] shadow-sm" : "border-[#7E9AB6] bg-white hover:border-[#0A4D82] hover:bg-[#FBFDFF]")}>
                            <div className="text-[15px] font-semibold leading-5 text-[#5A748B]">{method.label}</div>
                            <div className="mt-0.5 text-[12px] leading-4 text-[#7B97AC]">+IDR {formatRupiah(method.feeAmount)}</div>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            <NoticePanel text={policyForm.paymentStatus} />
          </SectionCard>

          <SectionCard title="Lanjutkan Pembayaran" subtitle="Selesaikan persetujuan atas SPAU elektronik ini terlebih dahulu, lalu lanjutkan pembayaran.">
            <div className="rounded-2xl border border-[#D8E1EA] bg-white px-4 py-4">
              <div className="flex items-start gap-3">
                <button type="button" onClick={() => updatePolicy({ consentApproved: !policyForm.consentApproved })} className={cls("mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border transition", policyForm.consentApproved ? "border-[#0A4D82] bg-[#0A4D82] text-white" : "border-[#B7C7D8] bg-white text-transparent hover:border-[#0A4D82]")} aria-label="Setujui SPAU elektronik">
                  <Check className="h-3.5 w-3.5" />
                </button>
                <div className="min-w-0 text-sm leading-6 text-slate-700">
                  <span>Saya telah membaca dan menyetujui </span>
                  <button type="button" onClick={() => updatePolicy({ consentApproved: true })} className="inline p-0 font-medium text-[#0A4D82] underline underline-offset-2 hover:text-[#0D5B98]">Syarat dan Ketentuan Persetujuan</button>
                  <span> atas SPAU elektronik ini.</span>
                </div>
              </div>
            </div>
            {!policyForm.paymentStatus ? <div className="mt-4"><PendingItems items={paymentPendingItems} /></div> : null}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => setStep(2)} className="flex h-[48px] w-full items-center justify-center rounded-[12px] border border-[#D5DEEA] bg-white px-5 text-center text-sm font-semibold text-[#0A4D82] shadow-sm hover:bg-[#F8FBFE] sm:flex-1">
                Kembali ke Data Lanjutan
              </button>
              <button
                type="button"
                disabled={!canPay}
                onClick={() => updatePolicy({ paymentStatus: `${productConfig.paymentSuccessMessage} Total pembayaran beberapa properti Rp ${formatRupiah(totalPayment)}.` })}
                className={cls("flex h-[48px] w-full items-center justify-center rounded-[12px] px-5 text-center text-sm font-bold uppercase tracking-wide text-white shadow-sm sm:flex-1", canPay ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}
              >
                {policyForm.paymentStatus ? "Pembayaran Selesai" : "Lanjutkan Pembayaran"}
              </button>
            </div>
          </SectionCard>
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
        {isAuthenticatedExternalJourney && !customerSummaryEditing ? (
          <CustomerAccountSummary name={policyForm.identity || accountIdentity} email={policyForm.email || accountEmail} phone={policyForm.phone || accountPhone} onEdit={() => setCustomerSummaryEditing(true)} />
        ) : (
          <SectionCard title={isAuthenticatedExternalJourney ? "Edit Informasi Calon Pemegang Polis" : "Informasi Calon Pemegang Polis"} action={isAuthenticatedExternalJourney ? <button type="button" onClick={() => setCustomerSummaryEditing(false)} className="inline-flex h-9 items-center rounded-[10px] border border-[#D5DDE6] bg-white px-3.5 text-sm font-medium text-[#0A4D82] shadow-sm hover:bg-[#F8FBFE]">Selesai</button> : null}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <FieldLabel label="Nama Calon Pemegang Polis" required />
                <div className="relative">
                  <TextInput value={policyForm.identity || ""} onChange={(value) => updatePolicy({ identity: value, selectedCustomerCif: "", quoted: false })} placeholder="Masukkan nama calon pemegang polis atau kode CIF" icon={<User className="h-4 w-4" />} error={contactFieldErrors.identity} />
                  {!isAuthenticatedExternalJourney && policyForm.identity && customerSuggestions.length > 0 && !hasSelectedCustomer ? (
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
                ) : !isAuthenticatedExternalJourney && policyForm.identity ? (
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
                <TextInput value={policyForm.phone || ""} onChange={(value) => updatePolicy({ phone: value, quoted: false })} placeholder="08xxxxxxxxxx" icon={<Phone className="h-4 w-4" />} error={contactFieldErrors.phone} />
              </div>
              <div>
                <FieldLabel label="Alamat Email" required />
                <TextInput value={policyForm.email || ""} onChange={(value) => updatePolicy({ email: value, quoted: false })} placeholder="nama@email.com" icon={<Mail className="h-4 w-4" />} type="email" error={contactFieldErrors.email} />
              </div>
            </div>
          </SectionCard>
        )}
        <SectionCard
          title="Informasi Properti"
          action={
            <PropertyFlowActionToolbar
              mode={flowMode}
              onSingle={onSingleFlow}
              onMulti={onMultiFlow}
              onAdd={addProperty}
              onUpload={uploadPropertyList}
            />
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
                derivePropertyType={derivePropertyType}
                onUpdateProperty={(patch, resetQuote) => updateProperty(property.id, patch, resetQuote)}
                onRemoveProperty={() => removeProperty(property.id)}
                onUpdateObjectRow={(rowId, patch) => updateObjectRow(property.id, rowId, patch)}
                onAddObjectRow={() => addObjectRow(property.id)}
                onRemoveObjectRow={(rowId) => removeObjectRow(property.id, rowId)}
                fieldErrors={propertyFieldErrors[property.id]}
              />
            ))}
          </div>
        </SectionCard>
        {policyForm.quoted ? (
          <SectionCard title="Rincian Jaminan" subtitle="Klik setiap baris untuk melihat penjelasan detailnya.">
            <div className="space-y-7">
              <PolicyPrimaryCoverageCard
                productConfig={productConfig}
                policyTotals={policyTotals}
                properties={properties}
                showPricing={showPricing}
                expanded={Boolean(policyForm.primaryCoverageBreakdownOpen)}
                onToggle={() => updatePolicy({ primaryCoverageBreakdownOpen: !policyForm.primaryCoverageBreakdownOpen })}
              />
              <div>
                <div className="text-[15px] font-semibold tracking-tight text-slate-900">Perluasan Jaminan</div>
                <div className="mt-3">
                  <PolicyGuaranteeRows
                    selectedGuarantees={policySelectedGuarantees}
                    expandedRows={policyExpandedGuarantees}
                    policyTotals={policyTotals}
                    extensionOptions={extensionOptions}
                    showPricing={showPricing}
                    onToggleGuarantee={togglePolicyGuarantee}
                    onToggleExpand={togglePolicyGuaranteeExpanded}
                  />
                </div>
              </div>
            </div>
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
        {quoteAttempted && !policyForm.quoted ? <PendingItems items={stepOnePendingItems} /> : null}
        <NoticePanel text={policyForm.notice} />
        <div className="flex justify-stretch gap-3 sm:justify-end sm:gap-3">
          {!policyForm.quoted ? (
            <button
              type="button"
              onClick={() => {
                if (!canQuote) {
                  setQuoteAttempted(true);
                  updatePolicy({ quoted: false, notice: "" });
                  return;
                }
                setQuoteAttempted(false);
                updatePolicy({ quoted: true, notice: "" });
              }}
              className="inline-flex h-[50px] flex-1 items-center justify-center gap-2 rounded-[12px] bg-[#F5A623] px-5 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:brightness-105"
            >
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
