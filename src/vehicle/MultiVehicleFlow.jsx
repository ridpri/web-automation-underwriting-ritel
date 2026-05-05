import React, { useMemo } from "react";
import {
  AlertTriangle,
  Camera,
  Car,
  CheckCircle2,
  ChevronDown,
  FileText,
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

import { PLATES, addOneYear } from "../motorDomain.js";
import { findVehicleSuggestions, getVehicleCatalogItem } from "../vehicleCatalog.js";
import {
  calculateMultiVehiclePolicy,
  createMultiVehicleDraft,
  getMultiVehicleStepOnePendingItems,
  getMultiVehicleStepTwoPendingItems,
  MULTI_VEHICLE_UPLOAD_SLOTS,
  onlyDigits,
} from "./multiVehicleDomain.js";

const CUSTOMER_TYPES = ["Pribadi", "Perusahaan / Badan Usaha"];
const CLAIM_HISTORY_OPTIONS = ["Tidak Ada", "Ada 1 Klaim", "Ada Lebih dari 1 Klaim"];
const PAYMENT_OPTIONS = ["Virtual Account", "Kartu Kredit", "Transfer Bank"];
const VEHICLE_USAGES = ["Pribadi", "Komersial"];
const CAR_CATEGORY_OPTIONS = ["Angkutan Penumpang", "Angkutan Barang", "Bis"];
const DEFAULT_CAR_TPL_AMOUNT = 25000000;
const DEFAULT_CAR_PA_AMOUNT = 10000000;
const DEFAULT_MOTOR_TPL_AMOUNT = 1000000;

const EXTENSION_GROUPS = {
  motor: [
    { id: "tpl", label: "Tanggung Jawab Hukum Pihak Ketiga", type: "amount" },
    { id: "srcc", label: "Kerusuhan & Huru-hara", type: "toggle" },
    { id: "ts", label: "Terorisme", type: "toggle" },
    { id: "flood", label: "Banjir", type: "toggle" },
    { id: "quake", label: "Gempa Bumi", type: "toggle" },
  ],
  carTlo: [
    { id: "tpl", label: "Tanggung Jawab Hukum Pihak Ketiga", type: "amount" },
    { id: "driverPa", label: "Kecelakaan Diri Pengemudi", type: "amount" },
    { id: "passengerPa", label: "Kecelakaan Diri Penumpang", type: "amount-seat" },
    { id: "srcc", label: "Kerusuhan & Huru-hara", type: "toggle" },
    { id: "ts", label: "Terorisme", type: "toggle" },
    { id: "flood", label: "Banjir", type: "toggle" },
    { id: "quake", label: "Gempa Bumi", type: "toggle" },
    { id: "equipment", label: "Perlengkapan Tambahan", type: "equipment" },
  ],
  carComp: [
    { id: "tpl", label: "Tanggung Jawab Hukum Pihak Ketiga", type: "amount" },
    { id: "driverPa", label: "Kecelakaan Diri Pengemudi", type: "amount" },
    { id: "passengerPa", label: "Kecelakaan Diri Penumpang", type: "amount-seat" },
    { id: "srcc", label: "Kerusuhan & Huru-hara", type: "toggle" },
    { id: "ts", label: "Terorisme", type: "toggle" },
    { id: "flood", label: "Banjir", type: "toggle" },
    { id: "quake", label: "Gempa Bumi", type: "toggle" },
    { id: "equipment", label: "Perlengkapan Tambahan", type: "equipment" },
    { id: "authorizedWorkshop", label: "Perbaikan Bengkel Authorized", type: "toggle" },
  ],
};

function cls(...args) {
  return args.filter(Boolean).join(" ");
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID").format(Number(value || 0));
}

function parseNumber(value) {
  return Number(onlyDigits(value) || "0");
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

function TextInput({ value, onChange, placeholder, icon, type = "text", inputMode, listId }) {
  return (
    <div className="relative">
      {icon ? <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div> : null}
      <input
        type={type}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        list={listId}
        className={cls(
          "h-[44px] w-full rounded-[10px] border border-[#D5DDE6] bg-white px-3.5 text-[14px] text-slate-800 outline-none transition placeholder:text-slate-500",
          "focus:border-[#0A4D82] focus:ring-4 focus:ring-[#0A4D82]/10",
          icon && "pl-10",
        )}
      />
    </div>
  );
}

function SelectInput({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className={cls(
          "h-[44px] w-full appearance-none rounded-[10px] border border-[#D5DDE6] bg-white px-3.5 pr-10 text-[14px] outline-none transition focus:border-[#0A4D82] focus:ring-4 focus:ring-[#0A4D82]/10",
          value ? "text-slate-800" : "text-slate-500",
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

function CurrencyInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">Rp</span>
      <input
        value={value ? formatRupiah(parseNumber(value)) : ""}
        onChange={(event) => onChange(String(parseNumber(event.target.value)))}
        inputMode="numeric"
        placeholder={placeholder}
        className="h-[44px] w-full rounded-[10px] border border-[#D5DDE6] bg-white pl-10 pr-3.5 text-[14px] text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-[#0A4D82] focus:ring-4 focus:ring-[#0A4D82]/10"
      />
    </div>
  );
}

function SectionCard({ title, subtitle, action, children }) {
  return (
    <section className="rounded-[24px] border border-[#D8E1EA] bg-white p-4 shadow-sm md:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[18px] font-bold text-slate-900">{title}</div>
          {subtitle ? <div className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</div> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SummaryRow({ label, value, strong = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <div className="text-slate-500">{label}</div>
      <div className={cls("max-w-[58%] break-words text-right text-slate-900", strong && "font-semibold")}>{value || "-"}</div>
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

function VehicleAutocomplete({ flowType, vehicle, onUpdateQuote }) {
  const catalogType = flowType === "motor" ? "motor" : "car";
  const suggestions = findVehicleSuggestions(catalogType, vehicle.quote.vehicleName || "", 7);
  const listId = `${vehicle.id}-vehicle-options`;
  const updateVehicleName = (value) => {
    const matched = getVehicleCatalogItem(catalogType, value);
    onUpdateQuote({
      vehicleName: value,
      vehicleType: matched?.ojkCategory || vehicle.quote.vehicleType || "",
      vehicleFuelType: matched?.fuelType || "",
      vehicleBodyType: matched?.bodyType || "",
    });
  };
  return (
    <>
      <TextInput value={vehicle.quote.vehicleName} onChange={updateVehicleName} placeholder={flowType === "motor" ? "Pilih merek / tipe motor" : "Pilih merek / tipe mobil"} icon={<Search className="h-4 w-4" />} listId={listId} />
      <datalist id={listId}>
        {suggestions.map((item) => (
          <option key={item.label} value={item.label} />
        ))}
      </datalist>
    </>
  );
}

function ToggleExtensionButton({ checked, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cls(
        "flex min-h-[42px] items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition",
        checked ? "border-[#0A4D82] bg-[#F8FBFE] text-[#0A4D82]" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
      )}
    >
      <span>{label}</span>
      {checked ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : null}
    </button>
  );
}

function VehicleExtensionEditor({ flowType, vehicle, onUpdateQuote }) {
  const extensions = vehicle.quote.extensions || {};
  const updateExtension = (key, patch) => onUpdateQuote({ extensions: { ...extensions, [key]: { ...(extensions[key] || {}), ...patch } } });
  return (
    <div className="rounded-xl border border-[#D5DDE6] bg-[#FAFBFC] p-4">
      <div className="text-[15px] font-bold text-slate-900">Perluasan Jaminan</div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {(EXTENSION_GROUPS[flowType] || EXTENSION_GROUPS.motor).map((item) => {
          const current = extensions[item.id] || {};
          const enabled = Boolean(current.enabled);
          return (
            <div key={item.id} className="space-y-2">
              <ToggleExtensionButton checked={enabled} onClick={() => updateExtension(item.id, { enabled: !enabled })} label={item.label} />
              {enabled && item.type === "amount" ? (
                <CurrencyInput
                  value={current.amount || (flowType === "motor" ? DEFAULT_MOTOR_TPL_AMOUNT : item.id === "tpl" ? DEFAULT_CAR_TPL_AMOUNT : DEFAULT_CAR_PA_AMOUNT)}
                  onChange={(value) => updateExtension(item.id, { amount: value })}
                  placeholder="Nilai pertanggungan"
                />
              ) : null}
              {enabled && item.type === "amount-seat" ? (
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_90px]">
                  <CurrencyInput value={current.amount || DEFAULT_CAR_PA_AMOUNT} onChange={(value) => updateExtension(item.id, { amount: value })} placeholder="Nilai per penumpang" />
                  <TextInput value={current.seats || "4"} onChange={(value) => updateExtension(item.id, { seats: onlyDigits(value) || "1" })} placeholder="Kursi" inputMode="numeric" />
                </div>
              ) : null}
              {enabled && item.type === "equipment" ? (
                <div className="grid gap-2">
                  <TextInput value={current.description || ""} onChange={(value) => updateExtension(item.id, { description: value })} placeholder="Rincian perlengkapan tambahan" />
                  <CurrencyInput value={current.amount || ""} onChange={(value) => updateExtension(item.id, { amount: value, inclusion: "additional" })} placeholder="Nilai perlengkapan tambahan" />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VehicleQuoteCard({ flowType, vehicle, quote, index, canRemove, onUpdateVehicle, onRemoveVehicle }) {
  const detailsOpen = vehicle.detailsOpen !== false;
  const vehicleLabel = vehicle.title || `Kendaraan ${index + 1}`;
  const closedSummary = [vehicle.quote.vehicleName, vehicle.quote.plateRegion, quote.marketValue > 0 ? `Rp ${formatRupiah(quote.marketValue)}` : ""].filter(Boolean).join(" - ");
  const updateQuote = (patch) => onUpdateVehicle({ quote: { ...vehicle.quote, ...patch } });
  return (
    <div data-vehicle-accordion className="rounded-xl border border-[#C9D5E3] bg-[#F8FBFE]">
      <div className="flex items-center gap-3 px-3.5 py-3">
        <button type="button" onClick={() => onUpdateVehicle({ detailsOpen: !detailsOpen }, false)} className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left">
          <div className="flex min-w-0 items-center gap-2 text-[#0A4D82]">
            <Car className="h-4 w-4 shrink-0" />
            <div className="min-w-0">
              <div className="truncate text-[15px] font-semibold">{vehicleLabel}</div>
              {!detailsOpen && closedSummary ? <div className="mt-0.5 truncate text-[12px] text-slate-500">{closedSummary}</div> : null}
            </div>
          </div>
          <ChevronDown className={cls("h-4 w-4 shrink-0 text-slate-500 transition", detailsOpen && "rotate-180")} />
        </button>
        {canRemove ? (
          <button type="button" onClick={onRemoveVehicle} title={`Hapus ${vehicleLabel}`} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-slate-300 bg-white text-slate-500 hover:bg-slate-50">
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {detailsOpen ? (
        <div className="border-t border-[#D6E0EA] bg-white/70 px-3.5 py-4 md:px-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel label={flowType === "motor" ? "Merek / Tipe Motor" : "Merek / Tipe Mobil"} required />
              <VehicleAutocomplete flowType={flowType} vehicle={vehicle} onUpdateQuote={updateQuote} />
            </div>
            <div>
              <FieldLabel label="Kode wilayah plat / TNKB" required />
              <TextInput value={vehicle.quote.plateRegion} onChange={(value) => updateQuote({ plateRegion: value })} placeholder="Pilih kode wilayah kendaraan" icon={<MapPin className="h-4 w-4" />} listId={`${vehicle.id}-plate-list`} />
              <datalist id={`${vehicle.id}-plate-list`}>
                {PLATES.map((plate) => (
                  <option key={plate} value={plate} />
                ))}
              </datalist>
            </div>
            <div>
              <FieldLabel label="Tahun Pembuatan Kendaraan" required />
              <TextInput value={vehicle.quote.year} onChange={(value) => updateQuote({ year: onlyDigits(value) })} placeholder="Contoh: 2025" inputMode="numeric" />
            </div>
            <div>
              <FieldLabel label="Harga Pertanggungan" required />
              <CurrencyInput value={vehicle.quote.marketValue} onChange={(value) => updateQuote({ marketValue: value })} placeholder="Harga pasar wajar kendaraan" />
            </div>
            <div>
              <FieldLabel label="Penggunaan Kendaraan" required />
              <SelectInput value={vehicle.quote.usage} onChange={(value) => updateQuote({ usage: value })} options={VEHICLE_USAGES} placeholder="Pilih penggunaan kendaraan" />
            </div>
            {flowType !== "motor" ? (
              <div>
                <FieldLabel label="Kategori OJK Kendaraan" required />
                <SelectInput value={vehicle.quote.vehicleType} onChange={(value) => updateQuote({ vehicleType: value })} options={CAR_CATEGORY_OPTIONS} placeholder="Pilih kategori kendaraan" />
              </div>
            ) : null}
          </div>

          <div className="mt-4">
            <VehicleExtensionEditor flowType={flowType} vehicle={vehicle} onUpdateQuote={updateQuote} />
          </div>

          <div className="mt-4 rounded-[10px] bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-1.5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>Premi Kendaraan</span>
              <span className="break-words text-left text-[18px] font-bold text-[#E8A436] sm:text-right">Rp {formatRupiah(quote.totalBeforeStamp)}</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function UploadButton({ vehicle, slot, onCapture }) {
  const done = Boolean(vehicle.uploads?.[slot.key]);
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

function VehicleUnderwritingCard({ flowType, vehicle, index, onUpdateVehicle }) {
  const detailsOpen = vehicle.uwDetailsOpen !== false;
  const vehicleLabel = vehicle.title || `Kendaraan ${index + 1}`;
  const updateVehicleData = (patch) => onUpdateVehicle({ vehicle: { ...vehicle.vehicle, ...patch } }, false);
  const updateUnderwriting = (patch) => onUpdateVehicle({ underwriting: { ...vehicle.underwriting, ...patch } }, false);
  const updateUploads = (patch) => onUpdateVehicle({ uploads: { ...vehicle.uploads, ...patch } }, false);
  const slots = MULTI_VEHICLE_UPLOAD_SLOTS[flowType] || MULTI_VEHICLE_UPLOAD_SLOTS.motor;
  const uploadCount = slots.filter((slot) => vehicle.uploads?.[slot.key]).length;
  const closedSummary = [vehicle.vehicle.plateNumber || "TNKB belum diisi", vehicle.underwriting.claimHistory ? `Klaim: ${vehicle.underwriting.claimHistory}` : "", `${uploadCount}/${slots.length} foto`].filter(Boolean).join(" - ");
  return (
    <div className="rounded-xl border border-[#C9D5E3] bg-[#F8FBFE]">
      <div className="flex items-center gap-3 px-3.5 py-3">
        <button type="button" onClick={() => onUpdateVehicle({ uwDetailsOpen: !detailsOpen }, false)} className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left">
          <div className="flex min-w-0 items-center gap-2 text-[#0A4D82]">
            <FileText className="h-4 w-4 shrink-0" />
            <div className="min-w-0">
              <div className="truncate text-[15px] font-semibold">{vehicleLabel}</div>
              {!detailsOpen ? <div className="mt-0.5 truncate text-[12px] text-slate-500">{closedSummary}</div> : null}
            </div>
          </div>
          <ChevronDown className={cls("h-4 w-4 shrink-0 text-slate-500 transition", detailsOpen && "rotate-180")} />
        </button>
      </div>
      {detailsOpen ? (
        <div className="border-t border-[#D6E0EA] bg-white/70 px-3.5 py-4 md:px-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel label="Nomor Polisi / TNKB" required />
              <TextInput value={vehicle.vehicle.plateNumber} onChange={(value) => updateVehicleData({ plateNumber: value.toUpperCase() })} placeholder="Contoh: B 1234 XYZ" />
            </div>
            <div>
              <FieldLabel label="Warna Kendaraan" />
              <TextInput value={vehicle.vehicle.color} onChange={(value) => updateVehicleData({ color: value })} placeholder="Contoh: Hitam" />
            </div>
            <div>
              <FieldLabel label="Nomor Rangka" required />
              <TextInput value={vehicle.vehicle.chassisNumber} onChange={(value) => updateVehicleData({ chassisNumber: value.toUpperCase() })} placeholder="Masukkan nomor rangka" />
            </div>
            <div>
              <FieldLabel label="Nomor Mesin" required />
              <TextInput value={vehicle.vehicle.engineNumber} onChange={(value) => updateVehicleData({ engineNumber: value.toUpperCase() })} placeholder="Masukkan nomor mesin" />
            </div>
            <div>
              <FieldLabel label="Riwayat Klaim 3 Tahun Terakhir" required />
              <SelectInput value={vehicle.underwriting.claimHistory} onChange={(value) => updateUnderwriting({ claimHistory: value })} options={CLAIM_HISTORY_OPTIONS} placeholder="Pilih riwayat klaim" />
            </div>
            <div>
              <FieldLabel label="Kontak di Lokasi" />
              <TextInput value={vehicle.vehicle.contactOnLocation} onChange={(value) => updateVehicleData({ contactOnLocation: value })} placeholder="Nama kontak kendaraan" icon={<Phone className="h-4 w-4" />} />
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {slots.map((slot) => (
              <UploadButton key={slot.key} vehicle={vehicle} slot={slot} onCapture={() => updateUploads({ [slot.key]: true })} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PolicySummaryPanel({ title, policyTotals, showPricing }) {
  return (
    <aside className="h-fit rounded-2xl bg-[#0A4D82] p-5 text-white shadow-lg lg:sticky lg:top-24">
      <div className="flex items-center gap-2 text-[18px] font-bold">
        <Wallet className="h-5 w-5" />
        Ringkasan Polis
      </div>
      <div className="mt-1 text-sm text-white/75">{title}</div>
      <div className="mt-4 border-t border-white/15 pt-3">
        <div className="flex justify-between py-2 text-sm"><span className="text-white/70">Jumlah Kendaraan</span><span>{String(policyTotals.vehicleQuotes.length)}</span></div>
        <div className="flex justify-between py-2 text-sm"><span className="text-white/70">Total Harga Pertanggungan</span><span>Rp {formatRupiah(policyTotals.marketValue)}</span></div>
      </div>
      <div className="mt-3 border-t border-white/15 pt-3">
        <div className="flex justify-between py-2 text-sm"><span className="text-white/70">Premi</span><span>{showPricing ? `Rp ${formatRupiah(policyTotals.mainPremium)}` : "-"}</span></div>
        <div className="flex justify-between py-2 text-sm"><span className="text-white/70">Premi Perluasan</span><span>{showPricing ? `Rp ${formatRupiah(policyTotals.extensionPremium)}` : "-"}</span></div>
        <div className="flex justify-between py-2 text-sm"><span className="text-white/70">Biaya Meterai</span><span>{showPricing ? `Rp ${formatRupiah(policyTotals.stampDuty)}` : "-"}</span></div>
      </div>
      <div className="mt-4 rounded-xl bg-white/10 p-4">
        <div className="text-sm text-white/75">Total Pembayaran</div>
        <div className="mt-2 text-right text-[28px] font-bold leading-tight">Rp {showPricing ? formatRupiah(policyTotals.totalPremium) : "-"}</div>
      </div>
    </aside>
  );
}

export default function MultiVehicleFlow({
  step,
  setStep,
  entryMode,
  flowType,
  productTitle,
  policyForm,
  setPolicyForm,
  vehicles,
  setVehicles,
  customerOptions = [],
  flowModeAction = null,
}) {
  const isInternalMode = entryMode === "internal";
  const policyTotals = useMemo(() => calculateMultiVehiclePolicy(flowType, vehicles), [flowType, vehicles]);
  const stepOnePendingItems = useMemo(
    () =>
      getMultiVehicleStepOnePendingItems({
        flowType,
        insuredName: policyForm.insuredName,
        phone: policyForm.phone,
        email: policyForm.email,
        vehicles,
      }),
    [flowType, policyForm.email, policyForm.insuredName, policyForm.phone, vehicles],
  );
  const stepTwoPendingItems = useMemo(
    () =>
      getMultiVehicleStepTwoPendingItems({
        flowType,
        insuredName: policyForm.insuredName,
        address: policyForm.address,
        email: policyForm.email,
        phone: policyForm.phone,
        coverageStartDate: policyForm.coverageStartDate,
        vehicles,
      }),
    [flowType, policyForm.address, policyForm.coverageStartDate, policyForm.email, policyForm.insuredName, policyForm.phone, vehicles],
  );
  const showPricing = Boolean(policyForm.quoted || step > 1);
  const canQuote = stepOnePendingItems.length === 0;
  const canAdvanceStepOne = canQuote && policyForm.quoted;
  const canAdvanceStepTwo = stepTwoPendingItems.length === 0 && policyTotals.status !== "Need Review";
  const canPay = Boolean(policyForm.consentApproved && policyForm.paymentMethod && !policyForm.paymentStatus);
  const customerKeyword = String(policyForm.insuredName || "").trim().toLowerCase();
  const customerSuggestions = customerKeyword
    ? customerOptions.filter((item) => item.name.toLowerCase().includes(customerKeyword) || item.cif.toLowerCase().includes(customerKeyword)).slice(0, 5)
    : [];
  const updatePolicy = (patch) => setPolicyForm((prev) => ({ ...prev, ...patch }));
  const updateVehicle = (vehicleId, patch, resetQuote = true) => {
    setVehicles((prev) =>
      prev.map((vehicle) => {
        if (vehicle.id === vehicleId) return { ...vehicle, ...patch };
        if (patch.detailsOpen) return { ...vehicle, detailsOpen: false };
        if (patch.uwDetailsOpen) return { ...vehicle, uwDetailsOpen: false };
        return vehicle;
      }),
    );
    if (resetQuote) updatePolicy({ quoted: false, paymentStatus: "" });
  };
  const addVehicle = () => {
    setVehicles((prev) => {
      const nextNumericId = prev.reduce((max, vehicle) => {
        const match = String(vehicle.id || "").match(/^vehicle-(\d+)$/);
        return Math.max(max, match ? Number(match[1]) : 0);
      }, 0) + 1;
      return prev.map((vehicle) => ({ ...vehicle, detailsOpen: false })).concat(createMultiVehicleDraft(flowType, prev.length, { id: `vehicle-${nextNumericId}`, detailsOpen: true }));
    });
    updatePolicy({ quoted: false, paymentStatus: "" });
  };
  const removeVehicle = (vehicleId) => {
    setVehicles((prev) =>
      (prev.length === 1 ? prev : prev.filter((vehicle) => vehicle.id !== vehicleId))
        .map((vehicle, index) => ({ ...vehicle, title: `Kendaraan ${index + 1}`, detailsOpen: index === 0 ? vehicle.detailsOpen !== false : vehicle.detailsOpen })),
    );
    updatePolicy({ quoted: false, paymentStatus: "" });
  };

  if (step === 2) {
    return (
      <div className="space-y-5">
        <SectionCard title="Data Pemegang Polis" subtitle="Data ini berlaku untuk satu polis kendaraan dengan beberapa objek kendaraan." action={flowModeAction}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel label="Nama Calon Pemegang Polis" required />
              <TextInput value={policyForm.insuredName || ""} onChange={(value) => updatePolicy({ insuredName: value })} placeholder="Masukkan nama calon pemegang polis" icon={<User className="h-4 w-4" />} />
            </div>
            <div>
              <FieldLabel label="Tipe Nasabah" required />
              <SelectInput value={policyForm.customerType || ""} onChange={(value) => updatePolicy({ customerType: value })} options={CUSTOMER_TYPES} placeholder="Pilih tipe nasabah" />
            </div>
            <div>
              <FieldLabel label="Nomor Handphone" required />
              <TextInput value={policyForm.phone || ""} onChange={(value) => updatePolicy({ phone: value })} placeholder="08xxxxxxxxxx" icon={<Phone className="h-4 w-4" />} />
            </div>
            <div>
              <FieldLabel label="Alamat Email" required />
              <TextInput value={policyForm.email || ""} onChange={(value) => updatePolicy({ email: value })} placeholder="nama@email.com" icon={<Mail className="h-4 w-4" />} type="email" />
            </div>
            <div className="md:col-span-2">
              <FieldLabel label="Alamat Calon Pemegang Polis" required />
              <TextInput value={policyForm.address || ""} onChange={(value) => updatePolicy({ address: value })} placeholder="Masukkan alamat lengkap" />
            </div>
            <div>
              <FieldLabel label="Tanggal Mulai Perlindungan" required />
              <TextInput value={policyForm.coverageStartDate || ""} onChange={(value) => updatePolicy({ coverageStartDate: value, coverageEndDate: addOneYear(value) })} type="date" />
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Data Lanjutan Kendaraan" subtitle="Lengkapi STNK, nomor rangka/mesin, klaim, dan foto untuk masing-masing kendaraan.">
          <div className="space-y-4">
            <PendingItems items={stepTwoPendingItems} />
            {policyTotals.status === "Need Review" ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">Ada kendaraan dengan profil risiko yang perlu review internal sebelum pembayaran.</div>
            ) : null}
            {vehicles.map((vehicle, index) => (
              <VehicleUnderwritingCard key={vehicle.id} flowType={flowType} vehicle={vehicle} index={index} onUpdateVehicle={(patch, resetQuote) => updateVehicle(vehicle.id, patch, resetQuote)} />
            ))}
          </div>
        </SectionCard>
        {policyForm.notice ? <div className="rounded-xl border border-[#CFE0F0] bg-[#F8FBFE] p-4 text-sm text-[#0A4D82]">{policyForm.notice}</div> : null}
        <div className="grid gap-3 md:grid-cols-2">
          <button type="button" onClick={() => setStep(1)} className="flex h-[48px] w-full items-center justify-center rounded-[12px] border border-[#D5DEEA] bg-white px-5 text-sm font-semibold text-[#0A4D82] shadow-sm hover:bg-[#F8FBFE]">
            Kembali ke Simulasi Premi
          </button>
          <button
            type="button"
            disabled={!canAdvanceStepTwo}
            onClick={() => {
              if (isInternalMode) updatePolicy({ notice: "Penawaran final beberapa kendaraan siap dikirim ke calon pemegang polis." });
              else setStep(3);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={cls("flex h-[48px] w-full items-center justify-center rounded-[12px] px-5 text-sm font-semibold text-white shadow-sm transition", canAdvanceStepTwo ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}
          >
            {isInternalMode ? "Kirim Penawaran Final" : "Lanjut ke Pembayaran"}
          </button>
        </div>
      </div>
    );
  }

  if (step === 3 && !isInternalMode) {
    return (
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <SectionCard title="Review Polis Beberapa Kendaraan" subtitle="Periksa ringkasan seluruh kendaraan sebelum pembayaran." action={flowModeAction}>
            <div className="grid gap-4 md:grid-cols-2">
              <SummaryRow label="Pemegang Polis" value={policyForm.insuredName} strong />
              <SummaryRow label="Total Kendaraan" value={String(vehicles.length)} strong />
              <SummaryRow label="Total Harga Pertanggungan" value={`Rp ${formatRupiah(policyTotals.marketValue)}`} strong />
              <SummaryRow label="Total Premi" value={`Rp ${formatRupiah(policyTotals.totalPremium)}`} strong />
            </div>
          </SectionCard>
          <SectionCard title="Daftar Kendaraan Pertanggungan">
            <div className="space-y-3">
              {vehicles.map((vehicle, index) => {
                const quote = policyTotals.vehicleQuotes[index];
                return (
                  <div key={vehicle.id} className="rounded-xl border border-[#D8E1EA] bg-[#F8FBFE] px-4 py-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{vehicle.title}</div>
                        <div className="mt-1 text-sm leading-6 text-slate-600">{vehicle.quote.vehicleName || "-"}</div>
                        <div className="mt-1 text-sm text-slate-500">{[vehicle.vehicle.plateNumber, vehicle.quote.year, vehicle.quote.usage].filter(Boolean).join(" - ") || "-"}</div>
                      </div>
                      <div className="text-left md:text-right">
                        <div className="text-sm text-slate-500">Harga Pertanggungan</div>
                        <div className="font-bold text-[#0A4D82]">Rp {formatRupiah(quote.marketValue)}</div>
                        <div className="mt-2 text-sm text-slate-500">Premi Kendaraan</div>
                        <div className="font-bold text-[#0A4D82]">Rp {formatRupiah(quote.totalBeforeStamp)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
          <SectionCard title="Persetujuan SPAU Elektronik">
            <button type="button" onClick={() => updatePolicy({ consentApproved: !policyForm.consentApproved })} className="flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-left">
              <span className={cls("mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border transition", policyForm.consentApproved ? "border-[#0A4D82] bg-[#0A4D82] text-white" : "border-[#B7C7D8] bg-white text-transparent")}>
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm leading-6 text-slate-700">Saya telah membaca dan menyetujui Syarat dan Ketentuan Persetujuan atas SPAU elektronik untuk beberapa kendaraan pertanggungan ini.</span>
            </button>
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
          {policyForm.paymentStatus ? <div className="rounded-xl border border-[#CFE0F0] bg-[#F8FBFE] p-4 text-sm text-[#0A4D82]">{policyForm.paymentStatus}</div> : null}
          <div className="grid gap-3 md:grid-cols-2">
            <button type="button" onClick={() => setStep(2)} className="flex h-[48px] w-full items-center justify-center rounded-[12px] border border-[#D5DEEA] bg-white px-5 text-sm font-semibold text-[#0A4D82] shadow-sm hover:bg-[#F8FBFE]">
              Kembali ke Data Lanjutan
            </button>
            <button
              type="button"
              disabled={!canPay}
              onClick={() => updatePolicy({ paymentStatus: `Pembayaran ${productTitle} berhasil disimulasikan. Total pembayaran beberapa kendaraan Rp ${formatRupiah(policyTotals.totalPremium)}.` })}
              className={cls("flex h-[48px] w-full items-center justify-center rounded-[12px] px-5 text-sm font-semibold text-white shadow-sm transition", canPay ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}
            >
              Bayar Premi
            </button>
          </div>
        </div>
        <PolicySummaryPanel title={productTitle} policyTotals={policyTotals} showPricing={showPricing} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SectionCard title="Informasi Calon Pemegang Polis" action={flowModeAction}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <FieldLabel label="Nama Calon Pemegang Polis" required />
            <div className="relative">
              <TextInput value={policyForm.insuredName || ""} onChange={(value) => updatePolicy({ insuredName: value, selectedCustomerCif: "", quoted: false })} placeholder="Masukkan nama calon pemegang polis atau kode CIF" icon={<User className="h-4 w-4" />} />
              {policyForm.insuredName && customerSuggestions.length > 0 && !policyForm.selectedCustomerCif ? (
                <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
                  {customerSuggestions.map((item) => (
                    <button
                      key={item.cif}
                      type="button"
                      onClick={() =>
                        updatePolicy({
                          insuredName: `${item.name} - ${item.cif}`,
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
          </div>
          <div>
            <FieldLabel label="Tipe Nasabah" required />
            <SelectInput value={policyForm.customerType || ""} onChange={(value) => updatePolicy({ customerType: value })} options={CUSTOMER_TYPES} placeholder="Pilih tipe nasabah" />
          </div>
          <div>
            <FieldLabel label="Nomor Handphone" required />
            <TextInput value={policyForm.phone || ""} onChange={(value) => updatePolicy({ phone: value })} placeholder="08xxxxxxxxxx" icon={<Phone className="h-4 w-4" />} />
          </div>
          <div>
            <FieldLabel label="Alamat Email" required />
            <TextInput value={policyForm.email || ""} onChange={(value) => updatePolicy({ email: value })} placeholder="nama@email.com" icon={<Mail className="h-4 w-4" />} type="email" />
          </div>
        </div>
      </SectionCard>
      <SectionCard
        title="Informasi Kendaraan"
        subtitle="Tambahkan setiap kendaraan sebagai objek pertanggungan dalam satu polis."
        action={
          <button type="button" onClick={addVehicle} className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D5DDE6] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Plus className="h-4 w-4" />
            Tambah Kendaraan
          </button>
        }
      >
        <div className="space-y-4">
          <PendingItems items={stepOnePendingItems} />
          {vehicles.map((vehicle, index) => (
            <VehicleQuoteCard
              key={vehicle.id}
              flowType={flowType}
              vehicle={vehicle}
              quote={policyTotals.vehicleQuotes[index]}
              index={index}
              canRemove={vehicles.length > 1}
              onUpdateVehicle={(patch, resetQuote) => updateVehicle(vehicle.id, patch, resetQuote)}
              onRemoveVehicle={() => removeVehicle(vehicle.id)}
            />
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Ringkasan Premi">
        <div className="grid gap-4 md:grid-cols-2">
          <SummaryRow label="Jumlah Kendaraan" value={String(vehicles.length)} strong />
          <SummaryRow label="Total Harga Pertanggungan" value={`Rp ${formatRupiah(policyTotals.marketValue)}`} strong />
          <SummaryRow label="Premi" value={showPricing ? `Rp ${formatRupiah(policyTotals.mainPremium)}` : "-"} />
          <SummaryRow label="Premi Perluasan" value={showPricing ? `Rp ${formatRupiah(policyTotals.extensionPremium)}` : "-"} />
          <SummaryRow label="Biaya Meterai" value={showPricing ? `Rp ${formatRupiah(policyTotals.stampDuty)}` : "-"} />
          <SummaryRow label="Total Pembayaran" value={showPricing ? `Rp ${formatRupiah(policyTotals.totalPremium)}` : "-"} strong />
        </div>
      </SectionCard>
      <div className="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          disabled={!canQuote}
          onClick={() => updatePolicy({ quoted: true, paymentStatus: "" })}
          className={cls("flex h-[48px] w-full items-center justify-center rounded-[12px] px-5 text-sm font-semibold text-white shadow-sm transition", canQuote ? "bg-[#F5A623] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}
        >
          Cek Premi
        </button>
        <button
          type="button"
          disabled={!canAdvanceStepOne}
          onClick={() => {
            setStep(2);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={cls("flex h-[48px] w-full items-center justify-center rounded-[12px] px-5 text-sm font-semibold text-white shadow-sm transition", canAdvanceStepOne ? "bg-[#0A4D82] hover:brightness-105" : "cursor-not-allowed bg-slate-400")}
        >
          Isi Data Lanjutan
        </button>
      </div>
    </div>
  );
}
